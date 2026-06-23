-- ============================================================================
-- Security fix: close two world-readable (anon) RLS holes
-- Audit date: 2026-06-15   Project: iikoxopupfjiavjjvkgm
--
-- 1) public.profiles            — blanket SELECT USING(true) leaked every
--                                 user's email/name/referral_* to anon/public.
-- 2) public.community_messages  — "Anyone can read messages" SELECT USING(true)
--                                 leaked auth user_id UUIDs + content to anon;
--                                 also no DELETE policy (no self-delete/mod path).
--
-- Idempotent: safe to run more than once. Wraps each CREATE POLICY in a
-- DROP ... IF EXISTS so re-runs don't error.
--
-- Verified non-breaking against the client (product-compass @ 2026-06-15):
--   * No code reads public.profiles (referral flow is localStorage-only), so
--     dropping the blanket policy breaks nothing; the RPC is for future use.
--   * The chat reads community_messages only while authenticated, so the
--     TO authenticated restriction keeps reads + Realtime working.
--   * The RevenueCat webhook uses the service-role key (bypasses RLS).
-- ============================================================================
-- (Applied via Supabase apply_migration, which runs this atomically.)

-- ── 1) profiles: remove the blanket SELECT, add a PII-safe referral RPC ──────

-- Drop the world-readable policy. The owner policy
-- ("Users can manage own profile" FOR ALL USING auth.uid() = id) is left intact,
-- so each user can still read/update their own row.
drop policy if exists profiles_lookup_ref on public.profiles;

-- Resolve a referral code -> referrer id ONLY. Never returns email/name/etc.
-- SECURITY DEFINER so it can read profiles despite RLS; locked search_path.
create or replace function public.resolve_referral_code(p_code text)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$
  select id
  from public.profiles
  where referral_code = p_code
  limit 1;
$$;

-- Only authenticated callers may resolve codes (referral is claimed post-login).
-- NOTE: Supabase default privileges auto-grant EXECUTE to anon+authenticated on
-- new public functions, so we must revoke from anon explicitly (not just public),
-- or the function stays callable without login.
-- If you ever need pre-login resolution, re-grant: GRANT EXECUTE ... TO anon;
revoke execute on function public.resolve_referral_code(text) from public, anon;
grant  execute on function public.resolve_referral_code(text) to authenticated;

-- ── 2) community_messages: authenticated-only reads + author self-delete ─────

-- Replace the world-readable SELECT with an authenticated-only one. This stops
-- logged-out (anon) clients from reading raw user_id UUIDs + message content.
drop policy if exists "Anyone can read messages" on public.community_messages;
drop policy if exists "Authenticated can read messages" on public.community_messages;
create policy "Authenticated can read messages"
  on public.community_messages
  for select
  to authenticated
  using (true);

-- Add the missing DELETE policy so authors can remove their own messages
-- (self-delete / basis for moderation). Previously no UPDATE/DELETE existed.
drop policy if exists "Authors can delete own messages" on public.community_messages;
create policy "Authors can delete own messages"
  on public.community_messages
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION (run separately, before and after, to compare)
--
--   select tablename, policyname, roles, cmd, qual
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('profiles', 'community_messages')
--   order by tablename, policyname;
--
-- Expected AFTER:
--   profiles            | Users can manage own profile  | {authenticated}* | ALL    | (auth.uid() = id)
--   community_messages  | Authenticated can read messages| {authenticated} | SELECT | true
--   community_messages  | Authors can delete own messages| {authenticated} | DELETE | (auth.uid() = user_id)
--   community_messages  | Users can insert own messages  | {authenticated}*| INSERT | (with check auth.uid() = user_id)
--   (no policy on either table should list {public} or {anon} for SELECT)
--   (* role shows {public} if the original policy was created without a TO clause,
--      but auth.uid() returns NULL for anon so those rows still match nothing.)
--
-- Then re-run get_advisors(security) — the two "anon can read" / RLS findings
-- for profiles and community_messages should be gone with no new warnings.
-- ============================================================================

-- Stopamine — Supabase schema
-- Regenerated from live DB 2026-05-16
-- Run this on a fresh project to recreate the full schema.

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email       text        NOT NULL,
  name        text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_state (
  user_id       uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  points        integer     DEFAULT 0,
  tree_xp       integer     DEFAULT 0,
  badges        text[]      DEFAULT '{}'::text[],
  total_returns integer     DEFAULT 0,
  last_login_at bigint      DEFAULT 0,
  onboarding    jsonb,
  is_premium    boolean     DEFAULT false,
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addictions (
  id               uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id          uuid        NOT NULL REFERENCES auth.users(id),
  name             text        NOT NULL,
  emoji            text        NOT NULL,
  start_date       bigint      NOT NULL,
  total_clean_days integer     DEFAULT 0,
  urges_survived   integer     DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relapses (
  id            uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id),
  addiction_id  uuid        NOT NULL REFERENCES public.addictions(id),
  ts            bigint      NOT NULL,
  note          text,
  reframe_shown boolean     DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id         uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id),
  room       text        DEFAULT 'global'::text NOT NULL,
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id            uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name          text        NOT NULL,
  description   text        DEFAULT ''::text NOT NULL,
  owner_id      uuid        REFERENCES auth.users(id),
  is_private    boolean     DEFAULT false NOT NULL,
  password_hash text,
  member_count  integer     DEFAULT 1 NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.room_memberships (
  room_id   uuid        NOT NULL REFERENCES public.rooms(id),
  user_id   uuid        NOT NULL REFERENCES auth.users(id),
  joined_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (room_id, user_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_state         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addictions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relapses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_memberships   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own state"
  ON public.user_state FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addictions"
  ON public.addictions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own relapses"
  ON public.relapses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read messages"
  ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert own messages"
  ON public.community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can read rooms"
  ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone authenticated can read memberships"
  ON public.room_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage own memberships"
  ON public.room_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Trigger: auto-create profile + user_state on signup ───────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_state (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
end;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── RPC: create_room ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_room(
  p_name        text,
  p_description text    DEFAULT '',
  p_is_private  boolean DEFAULT false,
  p_password    text    DEFAULT null
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  v_user_id uuid := auth.uid();
  v_room_id uuid;
  v_hash    text;
  v_name    text;
begin
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  v_name := trim(p_name);
  IF length(v_name) < 2  THEN RAISE EXCEPTION 'Name must be at least 2 characters'; END IF;
  IF length(v_name) > 60 THEN RAISE EXCEPTION 'Name must be 60 characters or less'; END IF;

  IF p_is_private THEN
    IF p_password IS NULL OR length(trim(p_password)) < 4 THEN
      RAISE EXCEPTION 'Private rooms require a password of at least 4 characters';
    END IF;
    v_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));
  END IF;

  INSERT INTO rooms (name, description, owner_id, is_private, password_hash)
  VALUES (v_name, coalesce(p_description, ''), v_user_id, p_is_private, v_hash)
  RETURNING id INTO v_room_id;

  INSERT INTO room_memberships (room_id, user_id) VALUES (v_room_id, v_user_id);

  RETURN v_room_id;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.create_room FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.create_room TO authenticated;

-- ── RPC: join_room ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.join_room(
  p_room_id  uuid,
  p_password text DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  v_user_id uuid := auth.uid();
  v_room    rooms%rowtype;
begin
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_room FROM rooms WHERE id = p_room_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Room not found'; END IF;

  IF v_room.is_private THEN
    IF v_room.password_hash IS NULL OR p_password IS NULL THEN RETURN false; END IF;
    IF v_room.password_hash <> extensions.crypt(p_password, v_room.password_hash) THEN RETURN false; END IF;
  END IF;

  INSERT INTO room_memberships (room_id, user_id)
  VALUES (p_room_id, v_user_id)
  ON CONFLICT (room_id, user_id) DO NOTHING;

  IF FOUND THEN
    UPDATE rooms SET member_count = member_count + 1 WHERE id = p_room_id;
  END IF;

  RETURN true;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.join_room FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.join_room TO authenticated;

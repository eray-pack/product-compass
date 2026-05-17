# Team Stopamine

## Fortune — Product & Creative Lead
- App builder — builds and shapes the product from idea to working experience
- Storytelling — translates vision into feeling, flow and experience within the app
- Problem-solving product design — solves user problems through smart and intuitive design
- UX & customer satisfaction — optimizes every step the user goes through
- Frontend development — translates designs into working code
- Marketing — positioning, messaging and brand experience outward

## Eray — Backend & Infrastructure Lead
- Backend architecture — Supabase schema, RLS policies, database design
- Auth & security — login flows, session handling, data protection, GDPR
- Business logic — streak engine, XP system, relapse rules, paywall gating
- API integrations — Claude API, payment systems, push notifications
- Deployment & infra — Cloudflare Workers, Wrangler, environment config
- QA — catching bugs before Fortune's designs land in production

---

## Weekly Tasks

### Week of May 16 — Foundation & AI Coach ✅

**Eray**
- [x] Set `ANTHROPIC_API_KEY` secret in Wrangler so `/api/chat` works in prod
- [x] Fix auth signup bug — turned off email confirmation in Supabase (re-enable before launch)
- [x] Push community.tsx rebase to GitHub
- [x] Paywall copy rewritten — sharper, more conversion-focused

**Fortune**
- [ ] Design the AI Coach screen header / empty state (currently bare)
- [ ] Design paywall screen — review current layout, flag anything that feels weak

**Deadline: Wednesday May 21**

---

### Week of May 23 — Auth & Data Persistence ✅

**Eray**
- [x] Wire signup/login fully to Supabase
- [x] Move streak + XP from localStorage → Supabase (`user_state` table)
- [x] Fetch user's created rooms from Supabase on community page load
- [x] Regenerate `supabase-setup.sql` from live DB schema

**Fortune**
- [ ] Onboarding polish — review each screen after auth is wired
- [ ] Community room cards — design for user-created rooms (currently use a default icon/color)

**Deadline: Friday May 30**

---

### Week of May 30 — Paywall & Monetisation ✅

**Eray**
- [x] Integrate RevenueCat for subscription handling (mobile-first, works with App Store)
- [x] Wire paywall gate — lock features behind real subscription check (replace `isPremium` localStorage flag)
- [x] Set up Supabase Edge Function for RevenueCat webhook (payment events → update user role in DB)
- [x] AI Coach free limit — 3 messages/day for free users, paywall trigger after
- [x] Feature gating — room creation, relapse insights, PRO tools all properly gated
- [ ] Re-enable email confirmation in Supabase before any real users sign up

**Fortune**
- [ ] Post-purchase screen design — what does the user see after subscribing?
- [ ] App Store screenshots / marketing visuals (start early, takes time)

**Deadline: Friday June 6**

---

### Week of June 6 — iOS & Launch Prep

**Eray**
- [ ] Enroll Apple Developer Program ($99/year) → developer.apple.com
- [ ] Update macOS → install Xcode
- [ ] Create APNs key in Apple portal → add secrets to Supabase Edge Functions
- [ ] Add Push Notifications capability in Xcode → `npx cap sync`
- [ ] Swap RevenueCat test key → production key
- [ ] Re-enable email confirmation in Supabase
- [ ] App Store listing — bundle ID `com.stopamine.app`, age rating 17+, privacy policy URL

**Fortune**
- [ ] PaywallModal design polish (contextual pop-up, currently unstyled)
- [ ] ReEntryScreen design (shows after 30+ days inactive — logic built, never designed)
- [ ] AI Coach screen header / empty state
- [ ] Community room cards for user-created rooms
- [ ] Post-purchase screen
- [ ] App Store screenshots + marketing visuals

**Deadline: Friday June 13**

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

### Week of May 16 — Foundation & AI Coach

**Eray**
- [ ] Set `ANTHROPIC_API_KEY` secret in Wrangler so `/api/chat` works in prod (`wrangler secret put ANTHROPIC_API_KEY`)
- [ ] Test AI Coach end-to-end: dev server → coach screen → real Claude response *(Fortune handles this locally with his Claude Console API key)*
- [x] Fix auth signup bug — turned off email confirmation in Supabase (re-enable before launch)
- [ ] Push community.tsx rebase to GitHub (already resolved locally)
- [ ] Paywall walkthrough — run dev server, screenshot each step, fix weak copy/layout

**Fortune**
- [ ] Design the AI Coach screen header / empty state (currently bare)
- [ ] Design paywall screen — review current layout, flag anything that feels weak

**Deadline: Wednesday May 21**

---

### Week of May 23 — Auth & Data Persistence

**Eray**
- [ ] Wire signup/login fully to Supabase (profiles + user_state trigger working)
- [ ] Move streak + XP from localStorage → Supabase (`user_state` table)
- [ ] Fetch user's created rooms from Supabase on community page load (rooms disappear on refresh now)
- [ ] Regenerate `supabase-setup.sql` from live DB schema

**Fortune**
- [ ] Onboarding polish — review each screen after auth is wired
- [ ] Community room cards — design for user-created rooms (currently use a default icon/color)

**Deadline: Friday May 30**

---

### Week of May 30 — Paywall & Monetisation

**Eray**
- [ ] Integrate RevenueCat or Stripe for subscription handling
- [ ] Wire paywall gate — lock features behind subscription check
- [ ] Set up Supabase Edge Function for webhook (payment events → update user role)

**Fortune**
- [ ] Final paywall design — pricing screen, offer modal, post-purchase state
- [ ] App Store screenshots / marketing visuals (start early)

**Deadline: Friday June 6**

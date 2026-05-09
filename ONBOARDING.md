# Stopamine — Project Onboarding

## What we're building

A mobile-first psychological recovery app that helps users overcome porn addiction and rewire their dopamine system. Serious, scientific tone — not preachy or religious.

**Key insight:** Most existing apps (Quittr, Brainbuddy) are shallow. Stopamine goes deeper — psychological onboarding, identity-based habits, urge surfing tools, and smart notifications timed to the user's personal trigger windows.

## Stack

| Tool | Role | Status |
|---|---|---|
| **Lovable** | Frontend / UI builder | Learning |
| **Claude API** | Personalized reframes & psychological content | Some experience |
| **Perplexity API** | Live research (optional later) | New |
| **Supabase** | Database + auth + Edge Functions | New |

## App Flow

1. Deep onboarding funnel (5 screens): addiction assessment → what it costs you → trigger profile → identity statement → commitment signing
2. Main dashboard: day counter, brain recovery timeline (0-90 days), daily check-in, streak
3. Tools: SOS urge surfing button, reframes, cold exposure guide, if/then implementation planner
4. Progress: streak calendar, total clean days (relapses don't erase progress), badges
5. Paywall: monthly $19.99 vs annual $39.99 (~83% off, 7-day free trial)

## Monetization

- Monthly: $19.99/month
- Annual: $39.99/year (positioned as 83% off — ~$3.33/month)
- 7-day free trial, cancel anytime
- Strategy: high volume at low annual price — get people locked into annual

## Key Psychological Principles

- Identity-based habits (James Clear) — "I am someone who is in control of my dopamine"
- Commitment devices — signed pledge during onboarding
- Variable reward schedules — unpredictable rewards keep engagement high (Duolingo model)
- Loss aversion — streaks work because losing hurts more than gaining feels good
- Implementation intentions — if/then planning, 2-3x more effective than motivation alone
- Urge surfing — ride the wave (urges peak at 90 seconds then fade)
- Progress visualization — dopamine system recovers over 90 days, show the user their brain healing
- Smart notification timing — send at user's personal high-risk times, not random

## Learning Plan (started 2026-05-09)

- **Week 1** — Lovable: build Stopamine skeleton UI with mock data
- **Week 2** — Supabase: auth, user data, streak tracking
- **Week 3** — Claude API via Supabase Edge Functions (personalized reframes)
- **Week 4** — Ship something real

## Current Status

Week 1 — building the UI skeleton in Lovable. No API calls yet, using mock data.

## Collaborators

- **Eray** (eray-pack) — Noord-Brabant, initiator
- **Friend** (fgumiliza-blip) — Mac, collaborating via Claude Code

## Notes for Claude

- We are learning the stack as we go — explain clearly, don't assume prior knowledge of Lovable or Supabase.
- Keep suggestions scoped to the current week's goal.
- Tone of the app: dark, serious, scientific. Think Headspace meets a clinical psych tool.
- Target user: men 18-35 who are self-aware enough to seek help but need structure and accountability.

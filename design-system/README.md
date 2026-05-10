# Stopamine Design System

A dark, clinical, science-forward design system for **Stopamine** — a mobile-first psychological recovery app that helps users overcome porn addiction and rewire their dopamine system.

> **Tone of the app:** dark, serious, scientific. Headspace meets a clinical psych tool.
> **Target user:** men 18–35 who are self-aware enough to seek help but need structure and accountability.
> **Not** preachy. **Not** religious. **Not** shaming.

---

## Sources

- **Codebase:** [github.com/eray-pack/product-compass](https://github.com/eray-pack/product-compass) (TanStack Start + React 19 + Tailwind v4 + shadcn/ui + Lucide). Mobile-first single-page app built on Lovable.
- **Onboarding doc:** `ONBOARDING.md` in the repo (project context, app flow, monetization, psych principles).
- **Tokens:** `src/styles.css` is the source of truth for color and radius tokens.
- **No Figma file was supplied.** All visual decisions are reverse-engineered from the codebase.

## Products / surfaces

There is **one product** here — a single mobile app — but with several distinct visual contexts inside it:

1. **Onboarding funnel** (7 steps: assessment → costs → triggers → notifications → other habits → identity → commitment signing)
2. **Dashboard** (Day counter, brain-recovery timeline, daily check-in, streak stats, SOS, relapse log)
3. **Tools** (SOS urge-surfing with breathing circle + urge-wave graph, cold-exposure guide, if/then planner)
4. **Tree** (3D recovery tree that grows with XP — Three.js)
5. **Progress / Community / Challenges / Settings** (data views, social, gamification, account)
6. **Paywall** (monthly $19.99 / annual $39.99 with 7-day trial)

---

## Index

| File | What's in it |
|---|---|
| `README.md` | This file — brand context, content + visual foundations, iconography |
| `SKILL.md` | Agent-Skills front-matter + quick orientation; lets this folder be invoked as `stopamine-design` from Claude Code |
| `colors_and_type.css` | All color + type tokens as CSS vars, plus semantic helpers |
| `fonts/` | Webfont loaders (Space Grotesk via Google Fonts) |
| `assets/` | Logos, sample app icons, hero artwork placeholders |
| `preview/` | Cards rendered in the Design System tab — colors, type, components, etc. |
| `ui_kits/stopamine-app/` | Pixel-mirror of the mobile app (dashboard, onboarding, SOS) |
| `SKILL.md` | Cross-compatible Agent Skill manifest (works in Claude Code) |

---

## Content fundamentals

### Voice

- **Second person, masculine-leaning.** Always *you*, never *we/us*. The user is the protagonist; the app is a coach.
- **Direct, calm, clinical.** Sentences are short. Verbs lead. Adjectives earn their place.
- **Identity-first, not behavior-first.** "I am becoming someone who is in control of his mind" — not "stop watching porn".
- **No shame, no euphemism, no preaching.** Name the problem, then step past it.
- **Curious, not commanding.** Questions over imperatives where possible: *"How are you feeling today?"* beats *"Log your mood."*

### Casing

- **Sentence case** for everything: titles, buttons, options. Never Title Case.
- **ALL-CAPS micro-labels** with `tracking-[0.2em]` to `tracking-[0.3em]` letterspacing for eyebrows / section labels — *DAILY CHECK-IN*, *BRAIN RECOVERY TIMELINE*, *URGE SURFING*, *IDENTITY · 04*. This is the single strongest typographic motif.
- Numbers are **tabular-nums** everywhere a streak / counter / time appears.

### Examples (lifted verbatim from the codebase)

- Hero: *"Day 047"* with subtitle *"porn journey · 52% to brain reset"* and italic muted line *"Every day you don't give in, your brain rewires itself."*
- SOS heading: *"Don't fight it. Watch it."* — sub: *"Urges peak around 90 seconds and then fade. Stay with it."*
- Onboarding step 2: *"What does it cost you?"* — CTA: *"These are the things I'm taking back"*
- Identity step: *"Choose who you are becoming."* — radios prefixed *"I am someone who…"*
- Commitment: *"Read it. Sign it. This is who you are now."*
- Reward toast: *"Unexpected bonus. Consistency pays."*
- Reset/relapse: *"I relapsed — log it honestly"* (offered without judgement)

### Emoji

- Used **sparingly and only on semantic items the user picks** — habit pickers (📱 Social media, 🍩 Sugar, 🍺 Alcohol, 🚬 Nicotine, 🌿 Cannabis, 🎰 Gambling, 🎮 Gaming, ⏳ Procrastination) and the 5-step mood scale (😞😕😐🙂😤).
- **Never** in marketing copy, headlines, body, buttons, or system messages.
- The brain emoji 🧠 is reserved for the primary "Porn" addiction card.

### Vibe

- Disciplined, masculine, evidence-based. Closer to Whoop or Headspace than to Calm or Duolingo.
- Numbers everywhere — *Day 047*, *52%*, *3:00*, *90-day reset*. Quantification = trust.
- Never sugarcoats. Cites mechanisms (loss aversion, variable reward, urge surfing, implementation intentions).

---

## Visual foundations

### Theme

**Dark by default**, with a hidden light theme (`html.light`) for accessibility. Almost the entire product lives in dark mode and that's where the visual language is tuned.

### Color philosophy

- **Background:** near-black navy (`oklch(0.09 0.02 265)` ≈ `#0a0f1a`). Calming, late-night-friendly, pairs with the "trigger window" framing.
- **Primary:** electric blue (`oklch(0.62 0.22 255)` ≈ `#3b7ef5`). Reserved for **progress, identity, and forward motion** — never decorative.
- **Destructive:** clinical red (`oklch(0.62 0.24 25)`) — only for *relapse*, *Active Urge*, *destructive confirms*.
- **Success:** muted green; **Warning:** amber. Both used sparingly.
- Surfaces are five tonal steps off the background, all on the same blue-black hue family — never pure grey.

### Type

- **Single family:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) — 400/500/600/700, with `cv11` and `ss01` OpenType features enabled.
- Weights: bold (700) for headings, day numbers, CTAs; semibold (600) for eyebrows; medium (500) for body; regular (400) for muted helper text.
- Tracking is wide on micro-labels (`0.2em–0.3em`) and tight on display numbers. The day-counter is `8rem` bold tabular.

### Spacing & radii

- 4px base; px-6 (24px) is the canonical mobile gutter.
- **`--radius: 0.875rem` (14px)** is the system root. Cards are `rounded-2xl` (16px), pills are `rounded-full`, inputs are `rounded-xl` (12px).
- Hierarchy: `radius-sm: 10px`, `radius-md: 12px`, `radius-lg: 14px`, `radius-xl: 18px`.

### Backgrounds

- Solid navy, full-bleed.
- Gradients used sparingly for **emphasis** only:
  - `--gradient-primary: linear-gradient(135deg, blue → indigo)` — primary CTAs, breathing circle, identity reminders.
  - `--gradient-surface: linear-gradient(180deg, surface → background)` — card subtle elevation.
- **No** illustrations, **no** patterns, **no** noise/grain, **no** photography. The 3D Recovery Tree (Three.js) is the only "image".

### Animation

- Calm, deliberate, never bouncy. Easing is `ease` or `ease-in-out`; durations 200–700ms.
- Named keyframes:
  - `step-fade-in` (300ms ease) — onboarding step transitions.
  - `pulse-ring` (2s infinite) — Active Urge dot.
  - `breathe-in` / `breathe-out` (4s / 6s) — SOS breathing circle.
  - `glow-pulse` (2.4s infinite) — current-position indicator on the brain timeline.
- Framer Motion is *not* used; everything is CSS keyframes + Tailwind transitions. Stay there.

### Hover / press

- **Hover (desktop):** opacity drop OR border colour shift to `primary/40`. Never scale, never shadow.
- **Press (mobile):** `active:opacity-80` on big buttons. Identity radios swap fill.
- Disabled: `opacity-25 cursor-not-allowed` (deliberately strong — disabled is a *teaching moment*, not a subtle absence).

### Borders, shadows, elevation

- Borders are 1px (`oklch(0.22 0.03 265)`) and **always** present on cards — Stopamine cards are *defined by their border*, not by their shadow.
- Two named shadows, both **glows** rather than drop-shadows:
  - `--shadow-glow: 0 0 40px -10px primary/55%` — primary CTAs, breathing circle.
  - `--shadow-sos: 0 0 60px -10px destructive/60%` — emergency states.
- 2px outline borders (`border-2`) appear on selectable options (radios/checkboxes) — the selected state thickens to primary blue with a 10% blue-tint fill.

### Layout rules

- Mobile-first, hard-locked to `max-w-md` (448px) on every screen — even on desktop.
- `PageShell` wraps every authed screen with a fixed bottom nav (5 items: Home / Tree / Tools / Community / Progress) and a floating top-right gear.
- Hero/day-counter sections center-aligned; lists left-aligned; CTAs full-width with 14px corner radius.
- Safe-area inset is respected on the bottom nav.

### Transparency & blur

- Used for floating chrome only:
  - Bottom nav: `backdrop-blur-xl` over `var(--card)`.
  - Settings gear: `backdrop-blur(12px)` over card.
  - Modal scrims: `bg-black/70 backdrop-blur-sm`.
- **Never** on content cards. Cards are opaque.

### Cards

- `rounded-2xl` (16px), `border border-border/60`, `bg-card` or `var(--gradient-surface)`.
- Padding: `p-4` for compact data cards, `p-5` for primary cards, `p-7` for modal/identity cards.
- Stat triplets (Recovery / Best Streak / Relapses): equal-width, centered, large primary number on top, tiny ALL-CAPS label below.

### Iconography (see ICONOGRAPHY below)

- **Lucide React** is the only icon set. 1.8 stroke weight (2.2 when active in nav).

---

## Iconography

Stopamine uses **Lucide** ([lucide.dev](https://lucide.dev)) exclusively. Every glyph in the app is from `lucide-react` — there is no custom SVG icon, no icon font, and no PNG iconography.

### Rules

- **Library:** `lucide-react@0.575.0` — installed as a dependency. Available via CDN at `https://unpkg.com/lucide-static@latest/icons/<name>.svg` for static use.
- **Stroke weight:** `1.8` default; `2.2` when active (selected nav item, etc.). This subtle thickening is the system's only "active" affordance for icons.
- **Size:** typically `h-4 w-4` (16px) inline, `h-5 w-5` (20px) in nav, `h-3 w-3`–`h-3.5 w-3.5` (12–14px) in pills.
- **Color:** `currentColor` always — colour is set by the parent text colour. Primary blue inside primary contexts, muted-foreground otherwise.
- **No fills.** Stroke-only style, matching Lucide defaults.

### Recurring glyphs

| Glyph | Meaning in Stopamine |
|---|---|
| `Zap` | SOS / urge / emergency |
| `Sparkles` | Affirmation / "you started for X" reminder |
| `Target` | Next milestone |
| `AlertTriangle` | Relapse logging |
| `Coins` | XP / points / rewards |
| `Plus` | Add habit |
| `X` | Close modals |
| `Check` | Confirmed / completed |
| `ArrowRight` | Onboarding CTAs |
| `ArrowLeft` | Back |
| `Lock` | PRO-gated feature |
| `Home`, `TreePine`, `Wrench`, `Users`, `BarChart2` | Bottom nav |
| `Settings` | Floating gear |

### Emoji as icons

Emoji are used **only for habit categorization** (📱 Social, 🍩 Sugar, 🍺 Alcohol, 🚬 Nicotine, 🌿 Cannabis, 🎰 Gambling, 🎮 Gaming, ⏳ Procrastination, 🧠 Porn) and the 5-step mood scale (😞😕😐🙂😤). Never use emoji as decorative or system icons — that's Lucide's job.

### Logo

The repo does not ship a finalized logo file. The project uses the wordmark **STOPAMINE** in Space Grotesk Bold with `tracking-[0.25em]` ALL-CAPS, often paired with the brain emoji 🧠 or a stylized blue dot. We provide a placeholder lockup in `assets/` and have flagged this for follow-up.

---

## Caveats / known substitutions

- **Logo:** No primary logo asset in the repo. We synthesized a wordmark from the in-app `STOPAMINE` text label. **Please provide the real logo files (SVG + PNG) when available.**
- **Hero/marketing imagery:** The codebase is the app shell only — no marketing site, no hero photography, no brand illustrations. None added.
- **Three.js Tree:** The 3D recovery tree (`src/components/Tree3D.tsx`) is part of the brand expression but cannot be rendered in static design previews. Documented as a behavior, not pictured.
- **Fonts:** Space Grotesk is loaded via the Google Fonts CDN (matching the codebase's own approach in `styles.css`). No local `.ttf` is included.

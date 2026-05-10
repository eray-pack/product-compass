# Stopamine App — UI Kit

A pixel-mirror of the mobile app, built from the [`eray-pack/product-compass`](https://github.com/eray-pack/product-compass) codebase.

## Files

| File | What's in it |
|---|---|
| `index.html` | Entry — renders the kit inside a phone bezel with a left-side view switcher (Dashboard ↔ Onboarding ↔ SOS) |
| `Primitives.jsx` | Lucide-style stroke icons + `<Eyebrow>`, `<PrimaryButton>`, `<StatCard>`, `<PillBadge>`, `<ProgressBar>` |
| `Dashboard.jsx` | The home screen: day counter, stat row, brain-recovery timeline, daily check-in, affirmation card, next-milestone card, SOS, log-relapse, bottom nav |
| `Onboarding.jsx` | The 7-step onboarding funnel: duration → costs → triggers → notifications → other habits → identity → commitment |
| `SOSScreen.jsx` | Urge-surfing tool: breathing circle, 3:00 timer, urge-wave graph |

## What's covered

- **3 core screens:** Dashboard, Onboarding (all 7 steps), SOS.
- **Bottom nav** with Lucide icons and the thin top accent line on the active tab.
- **Brain Recovery Timeline** with milestone dots and the glow-pulsing current-position indicator.
- **Daily check-in** with the 5-mood selector and check-in confirmation.
- **Step progress bar**, animated step transitions, all four onboarding option styles (radio, checkbox, identity radio, free input).
- **Urge wave SVG graph** with rise/fade/you-are-here labels.
- **Breathing circle** with `breathe-in` / `breathe-out` keyframes synced to phase length.

## What's not covered (cosmetic only)

- The 3D recovery tree (`Tree3D.tsx`) — needs Three.js scene; out of scope for UI kit.
- Paywall, Tools index, Tree page, Community/Challenges/Progress/Settings pages.
- Add-Habit modal, Relapse modal, Re-Entry screen, Brain Loading splash.

## Visual fidelity

All tokens are sourced from `colors_and_type.css` (verbatim copy of `src/styles.css`). Spacing, radii, shadows, eyebrow tracking, button heights, tabular-nums, and the dark navy palette match the codebase 1:1.

## Caveats

- Components are **simple cosmetic re-implementations** of the shadcn/ui primitives — they look right, but they don't carry the full Radix accessibility tree.
- Lucide icons are **inlined as SVG paths** rather than imported from `lucide-react` (no build step). Stroke widths and proportions match.
- No real backend / persistence — selections live in component state only.

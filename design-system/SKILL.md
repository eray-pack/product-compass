---
name: stopamine-design
description: Use this skill to generate well-branded interfaces and assets for Stopamine, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Brand voice & visual rules** → `README.md` (CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, ICONOGRAPHY)
- **Tokens, drop-in stylesheet** → `colors_and_type.css` (CSS variables for color, type, radii, shadows; semantic h1/h2/h3/p baked in)
- **Fonts** → `fonts/` (Geist Sans, Geist Mono — local woff2)
- **Assets** → `assets/` (logo lockup, brand mark)
- **Live components** → `ui_kits/stopamine-app/` (Dashboard, Onboarding, SOS — copy `Primitives.jsx`/`Dashboard.jsx`/`Onboarding.jsx`/`SOSScreen.jsx` as starting points)
- **Preview cards** → `preview/` (small HTML specimens of each token group; useful as visual references when wiring up new pieces)

## Tone in one line

Direct, masculine-coded, identity-first, second-person. No emoji in product copy. Friction is reframed as the work, not removed.

## Visual signature

Dark navy background (`oklch(0.10 0.02 265)`), electric blue primary (`oklch(0.62 0.22 255)`), a single hero number set in bold tabular-nums, all-caps tracked eyebrows above every section, glow shadows (never drop shadows), gradient pill buttons.

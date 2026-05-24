// Tree companion — 6 growth stages across a 90-day recovery journey.
// Stages 0–4 use PNG assets (seed, sprout, sapling, young, strong); stage 5 is a rich SVG illustration.
// viewBox 0 0 100 130 for SVG stages.

import treeStage0SeedUrl from "@/assets/tree-stage0-seed.png";
import treeStage1SproutUrl from "@/assets/tree-stage1-sprout.png";
import treeStage2SaplingUrl from "@/assets/tree-stage2-sapling.png";
import treeStage3YoungUrl from "@/assets/tree-stage3-young.png";
import treeStage4StrongUrl from "@/assets/tree-stage4-strong.png";

type P = { className?: string };
const V = "0 0 100 130";

/* ── Stage 0 — Seed (day 0–2) ──────────────────────────────────────────── */
export function Tree0({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage0SeedUrl} alt="Seed" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 1 — Sprout (day 3–13) ───────────────────────────────────────── */
export function Tree1({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage1SproutUrl} alt="Sprout" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 2 — Sapling (day 14–29) ─────────────────────────────────────── */
export function Tree2({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage2SaplingUrl} alt="Sapling" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 3 — Young (day 30–59) ───────────────────────────────────────── */
export function Tree3({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage3YoungUrl} alt="Young tree" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 4 — Strong (day 60–89) ──────────────────────────────────────── */
export function Tree4({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage4StrongUrl} alt="Strong tree" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 5 — Ancient glowing tree (day 90+) ───────────────────────────── */
export function Tree5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        {/* Rich golden ground glow */}
        <radialGradient id="t5glow" cx="50%" cy="100%" r="68%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.90"/>
          <stop offset="35%" stopColor="#FFB300" stopOpacity="0.45"/>
          <stop offset="75%" stopColor="#FF8F00" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#FF6F00" stopOpacity="0"/>
        </radialGradient>
        {/* Bark — warm amber-to-deep-brown */}
        <linearGradient id="t5trunk" x1="8%" y1="0%" x2="92%" y2="0%">
          <stop offset="0%" stopColor="#C49A6C"/>
          <stop offset="30%" stopColor="#9C6B3C"/>
          <stop offset="65%" stopColor="#6D3A1A"/>
          <stop offset="100%" stopColor="#3E1C06"/>
        </linearGradient>
        {/* Branch gradient */}
        <linearGradient id="t5branch" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5E3C"/>
          <stop offset="100%" stopColor="#4E2C0E"/>
        </linearGradient>
        {/* Canopy ambient golden wash */}
        <radialGradient id="t5canopy" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#FFD54F" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── Static base — ground glow, soil and roots stay planted ────── */}
      <ellipse cx="50" cy="130" rx="60" ry="32" fill="url(#t5glow)"/>
      <ellipse cx="50" cy="127" rx="50" ry="6" fill="#4E342E"/>
      <ellipse cx="50" cy="125" rx="42" ry="5" fill="#5D4037"/>
      {/* Deep root fan — embedded in ground, don't sway */}
      <path d="M32 121 C21 112 9 112 2 122"  stroke="#3E2723" strokeWidth="7"   strokeLinecap="round"/>
      <path d="M68 121 C79 112 91 112 98 122" stroke="#3E2723" strokeWidth="7"   strokeLinecap="round"/>
      <path d="M38 122 C30 113 19 109 13 117" stroke="#3E2723" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M62 122 C70 113 81 109 87 117" stroke="#3E2723" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M44 122 C38 114 31 111 27 118" stroke="#3E2723" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M56 122 C62 114 69 111 73 118" stroke="#3E2723" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M32 121 C22 113 10 113 3 123"  stroke="#6D4C41" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M68 121 C79 113 91 113 97 123" stroke="#6D4C41" strokeWidth="1.5" fill="none" opacity="0.5"/>

      {/* ── Swaying group — trunk, branches, crown, sparkles ──────────── */}
      {/* Rotates ±1.8° around the trunk base (35, 126) with smooth ease-in-out.
          The canopy naturally travels ~2× further than the mid-trunk because
          it's farther from the pivot — exactly like a real tree in a gentle breeze. */}
      <g>
        {/* @ts-ignore — SMIL animateTransform; fully supported in all modern browsers */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-1.8 35 126; 1.8 35 126; -1.8 35 126"
          keyTimes="0; 0.5; 1"
          dur="4.5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
        />

        {/* Massive trunk */}
        <path d="M35 126 C31 97 33 70 35 48" stroke="url(#t5trunk)" strokeWidth="25" strokeLinecap="round"/>
        {/* Trunk golden base warmth */}
        <path d="M36 126 C32 116 33 104 35 95" stroke="#FFD54F" strokeWidth="23" strokeLinecap="round" opacity="0.12"/>
        {/* Bark texture lines */}
        <path d="M40 123 C38 100 39 78 40.5 58"   stroke="#A67C52" strokeWidth="2.5" fill="none" opacity="0.6"/>
        <path d="M44.5 120 C44 98 44.5 78 45.5 58" stroke="#C49A6C" strokeWidth="1.8" fill="none" opacity="0.5"/>
        <path d="M48 118 C48 97 48 77 48.5 57"     stroke="#D4A870" strokeWidth="1.3" fill="none" opacity="0.4"/>
        <path d="M52 118 C52.5 97 52 77 52 58"     stroke="#A67C52" strokeWidth="1"   fill="none" opacity="0.32"/>
        <path d="M56 117 C57 96 56.5 77 56 59"     stroke="#8B6040" strokeWidth="0.9" fill="none" opacity="0.28"/>
        {/* Trunk knot */}
        <ellipse cx="50" cy="92" rx="5" ry="3.5" fill="#4E2C0E" opacity="0.35"/>
        <ellipse cx="50" cy="92" rx="3" ry="2"   fill="#3E2008" opacity="0.25"/>

        {/* Heavy branches */}
        <path d="M37 105 C20 97 4 84 -4 76"   stroke="url(#t5branch)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M38 89 C54 79 73 65 84 55"    stroke="url(#t5branch)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M37 75 C24 62 10 47 3 36"     stroke="url(#t5branch)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M63 62 C74 51 85 38 91 27"    stroke="url(#t5branch)" strokeWidth="7" strokeLinecap="round"/>
        {/* Branch highlights */}
        <path d="M37 105 C21 98 5 85 -3 77"  stroke="#A67C52" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M38 89 C55 80 74 66 85 56"  stroke="#A67C52" strokeWidth="1.2" fill="none" opacity="0.35"/>

        {/* Colossal crown — deep rich greens */}
        <circle cx="50" cy="32" r="40" fill="#1A4E1E"/>
        <circle cx="3"  cy="61" r="26" fill="#1A4E1E"/>
        <circle cx="97" cy="50" r="26" fill="#1A4E1E"/>
        <circle cx="50" cy="26" r="34" fill="#2E7D32"/>
        <circle cx="7"  cy="53" r="23" fill="#2E7D32"/>
        <circle cx="93" cy="42" r="23" fill="#2E7D32"/>
        <circle cx="50" cy="20" r="29" fill="#388E3C"/>
        <circle cx="22" cy="32" r="24" fill="#388E3C"/>
        <circle cx="78" cy="27" r="24" fill="#388E3C"/>
        <circle cx="50" cy="13" r="24" fill="#43A047"/>
        <circle cx="29" cy="19" r="19" fill="#4CAF50"/>
        <circle cx="71" cy="17" r="19" fill="#4CAF50"/>
        {/* Canopy golden ambient */}
        <ellipse cx="50" cy="25" rx="42" ry="32" fill="url(#t5canopy)"/>
        {/* Top highlight canopy */}
        <circle cx="50" cy="7"  r="18" fill="#66BB6A" opacity="0.85"/>
        <circle cx="38" cy="11" r="14" fill="#81C784" opacity="0.75"/>
        <circle cx="62" cy="10" r="14" fill="#81C784" opacity="0.7"/>
        <circle cx="50" cy="2"  r="11" fill="#A5D6A7" opacity="0.75"/>
        <circle cx="42" cy="5"  r="7"  fill="#C8E6C9" opacity="0.6"/>
        <circle cx="58" cy="4"  r="7"  fill="#C8E6C9" opacity="0.55"/>

        {/* Golden shimmer leaves — drift with the sway */}
        <circle cx="4"  cy="48" r="5.5" fill="#FFD54F" opacity="0.60"/>
        <circle cx="96" cy="37" r="5"   fill="#FFD54F" opacity="0.55"/>
        <circle cx="17" cy="19" r="4.5" fill="#FFE082" opacity="0.70"/>
        <circle cx="83" cy="15" r="4.5" fill="#FFE082" opacity="0.70"/>
        <circle cx="50" cy="-1" r="5"   fill="#FFF9C4" opacity="0.80"/>
        <circle cx="33" cy="4"  r="3.5" fill="#FFD54F" opacity="0.60"/>
        <circle cx="67" cy="3"  r="3.5" fill="#FFD54F" opacity="0.60"/>
        <circle cx="12" cy="40" r="3"   fill="#FFECB3" opacity="0.55"/>
        <circle cx="88" cy="30" r="3"   fill="#FFECB3" opacity="0.5"/>

        {/* Sparkle crosses — drift with canopy */}
        <g opacity="0.90">
          <circle cx="2" cy="52" r="3" fill="white"/>
          <path d="M2 47 L2 57 M-3 52 L7 52" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g opacity="0.85">
          <circle cx="98" cy="41" r="2.5" fill="#FFF9C4"/>
          <path d="M98 36 L98 46 M93 41 L103 41" stroke="#FFF9C4" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g opacity="0.90">
          <circle cx="50" cy="-3" r="3" fill="white"/>
          <path d="M50 -8 L50 2 M45 -3 L55 -3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <circle cx="14" cy="11" r="2"   fill="white"   opacity="0.85"/>
        <circle cx="86" cy="8"  r="2"   fill="white"   opacity="0.85"/>
        <circle cx="26" cy="6"  r="1.5" fill="#FFE082" opacity="0.7"/>
        <circle cx="74" cy="5"  r="1.5" fill="#FFE082" opacity="0.7"/>
      </g>
    </svg>
  );
}

export const TREE_STAGES = [Tree0, Tree1, Tree2, Tree3, Tree4, Tree5] as const;

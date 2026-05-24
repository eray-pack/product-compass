import { dayToStage } from "@/components/avatars/CompanionAvatar";
import treeStage0SeedUrl from "@/assets/tree-stage0-seed.png";
import treeStage1SproutUrl from "@/assets/tree-stage1-sprout.png";
import treeStage2SaplingUrl from "@/assets/tree-stage2-sapling.png";
import treeStage3YoungUrl from "@/assets/tree-stage3-young.png";

interface Props {
  day: number;
  xp?: number;
}

/**
 * Illustrated cartoon tree — 6 growth stages driven by clean-day count.
 * Stages 0–3 use PNG assets (seed → sprout → sapling → young); stages 4–5 are SVG illustrations.
 * Thresholds: 0 days=Seed, 3 days=Sprout, 14=Sapling, 30=Young, 60=Strong, 90=Ancient.
 */
export function CartoonTree({ day }: Props) {
  const stage = dayToStage(day);

  if (stage === 0) {
    return (
      <img
        src={treeStage0SeedUrl}
        alt="Seed"
        style={{ height: "52%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 1) {
    return (
      <img
        src={treeStage1SproutUrl}
        alt="Sprout"
        style={{ height: "62%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 2) {
    return (
      <img
        src={treeStage2SaplingUrl}
        alt="Sapling"
        style={{ height: "76%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 3) {
    return (
      <img
        src={treeStage3YoungUrl}
        alt="Young tree"
        style={{ height: "88%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  return (
    <svg
      viewBox="0 0 400 300"
      width="100%"
      height="100%"
      fill="none"
      style={{ display: "block" }}
      aria-hidden
    >
      {stage === 4 && <StrongTree />}
      {stage >= 5 && <AncientTree />}
    </svg>
  );
}

// ── Stage 4 — Strong Tree ─────────────────────────────────────────────────────
function StrongTree() {
  return (
    <g transform="translate(200, 268) scale(1.01)">
      {/* Ground */}
      <ellipse cx="0" cy="0" rx="80" ry="11" fill="#285223" opacity="0.80" />
      {/* Roots */}
      <path d="M -11 0 Q -32 6 -46 4" stroke="#543018" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 11 0 Q 32 6 46 4"   stroke="#543018" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M -5 0 Q -11 8 -17 10" stroke="#543018" strokeWidth="4"   strokeLinecap="round" />
      <path d="M 5 0 Q 11 8 17 10"   stroke="#543018" strokeWidth="4"   strokeLinecap="round" />

      {/* Trunk */}
      <path d="M -16 0 Q -12 -68 -6 -138 Q 6 -68 16 0 Z" fill="#5C3A1E" />
      <path d="M -6 0 Q -4 -68 0 -138" stroke="#7A5030" strokeWidth="1.5" opacity="0.28" strokeLinecap="round" />
      {/* Bark lines */}
      <path d="M -13 -22 Q 2 -24 9 -20"  stroke="#7A5030" strokeWidth="1.5" opacity="0.28" strokeLinecap="round" />
      <path d="M -14 -50 Q 0 -53 10 -48" stroke="#7A5030" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />

      {/* Branches */}
      <path d="M -11 -88 Q -52 -99 -50 -120"  stroke="#5C3A1E" strokeWidth="11" strokeLinecap="round" />
      <path d="M -50 -120 Q -64 -133 -58 -150" stroke="#5C3A1E" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M 11 -92  Q 50 -102 48 -122"   stroke="#5C3A1E" strokeWidth="10.5" strokeLinecap="round" />
      <path d="M 48 -122 Q 60 -135 54 -153"   stroke="#5C3A1E" strokeWidth="7"   strokeLinecap="round" />
      <path d="M -4 -118 Q -25 -135 -21 -152"  stroke="#5C3A1E" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M 4 -120  Q 24 -137 20 -154"   stroke="#5C3A1E" strokeWidth="7"   strokeLinecap="round" />

      {/* Crown */}
      <ellipse cx="0"   cy="-170" rx="66" ry="43" fill="#336642" />
      <ellipse cx="-48" cy="-150" rx="40" ry="29" fill="#3D7A4E" />
      <ellipse cx="48"  cy="-152" rx="37" ry="28" fill="#3B784C" />
      <ellipse cx="-62" cy="-163" rx="23" ry="17" fill="#3E7E50" />
      <ellipse cx="62"  cy="-165" rx="22" ry="16" fill="#3C7C4E" />
      <ellipse cx="-25" cy="-196" rx="31" ry="22" fill="#44885A" />
      <ellipse cx="25"  cy="-194" rx="29" ry="21" fill="#428656" />
      <ellipse cx="0"   cy="-208" rx="38" ry="25" fill="#4E9662" />
      <ellipse cx="-12" cy="-224" rx="21" ry="14" fill="#58A06C" />
      <ellipse cx="12"  cy="-220" rx="19" ry="13" fill="#569E6A" />
      <ellipse cx="0"   cy="-228" rx="15" ry="10" fill="#60AA72" />
      {/* Highlights */}
      <ellipse cx="-18" cy="-230" rx="12" ry="8"  fill="#80C892" opacity="0.38" />
      <ellipse cx="10"  cy="-220" rx="9"  ry="6"  fill="#80C892" opacity="0.26" />
    </g>
  );
}

// ── Stage 5 — Ancient Tree ────────────────────────────────────────────────────
function AncientTree() {
  return (
    <g transform="translate(200, 268) scale(0.90)">
      {/* Ground glow */}
      <ellipse cx="0" cy="2"  rx="96" ry="14" fill="#1E3D1A" opacity="0.85" />
      <ellipse cx="0" cy="-2" rx="90" ry="8"  fill="#C4873A" opacity="0.07" />

      {/* Gnarled roots */}
      <path d="M -18 0 Q -50 10 -70 6"  stroke="#4A2D10" strokeWidth="9" strokeLinecap="round" />
      <path d="M 18 0 Q 50 10 70 6"    stroke="#4A2D10" strokeWidth="9" strokeLinecap="round" />
      <path d="M -8 0 Q -19 14 -28 16"  stroke="#4A2D10" strokeWidth="7" strokeLinecap="round" />
      <path d="M 8 0 Q 19 14 28 16"    stroke="#4A2D10" strokeWidth="7" strokeLinecap="round" />
      <path d="M 0 0 Q 4 12 0 18"      stroke="#4A2D10" strokeWidth="6" strokeLinecap="round" />

      {/* Wide ancient trunk */}
      <path d="M -25 0 Q -18 -62 -8 -152 Q 8 -62 25 0 Z" fill="#4E2E10" />
      {/* Bark texture */}
      <path d="M -25 0 Q -22 -42 -18 -84"  stroke="#6B4020" strokeWidth="2" opacity="0.38" strokeLinecap="round" />
      <path d="M -8 -152 Q -5 -100 -2 -50 Q 2 -20 0 0" stroke="#6B4020" strokeWidth="2" opacity="0.28" strokeLinecap="round" />
      <path d="M -18 -28 Q 6 -32 14 -24" stroke="#6B4020" strokeWidth="2.5" opacity="0.32" strokeLinecap="round" />
      <path d="M -20 -58 Q 4 -62 12 -54" stroke="#6B4020" strokeWidth="2"   opacity="0.28" strokeLinecap="round" />
      <path d="M -17 -90 Q 4 -94 10 -86" stroke="#6B4020" strokeWidth="2"   opacity="0.28" strokeLinecap="round" />

      {/* Massive branches */}
      <path d="M -17 -97  Q -64 -112 -68 -140"  stroke="#4E2E10" strokeWidth="14" strokeLinecap="round" />
      <path d="M -68 -140 Q -82 -160 -74 -182"  stroke="#4E2E10" strokeWidth="10" strokeLinecap="round" />
      <path d="M -68 -140 Q -90 -150 -86 -170"  stroke="#4E2E10" strokeWidth="8"  strokeLinecap="round" />
      <path d="M 17 -100  Q 64 -114 68 -142"   stroke="#4E2E10" strokeWidth="14" strokeLinecap="round" />
      <path d="M 68 -142  Q 82 -162 74 -184"   stroke="#4E2E10" strokeWidth="10" strokeLinecap="round" />
      <path d="M 68 -142  Q 90 -152 86 -172"   stroke="#4E2E10" strokeWidth="8"  strokeLinecap="round" />
      <path d="M -6 -133  Q -30 -153 -26 -174"  stroke="#4E2E10" strokeWidth="9"  strokeLinecap="round" />
      <path d="M 6 -135   Q 28 -155 24 -176"   stroke="#4E2E10" strokeWidth="9"  strokeLinecap="round" />

      {/* Massive layered canopy */}
      <ellipse cx="0"   cy="-195" rx="80" ry="51" fill="#244D30" />
      <ellipse cx="-60" cy="-174" rx="47" ry="33" fill="#2C5C38" />
      <ellipse cx="60"  cy="-177" rx="45" ry="32" fill="#2A5A36" />
      <ellipse cx="-85" cy="-182" rx="30" ry="22" fill="#285436" />
      <ellipse cx="85"  cy="-184" rx="28" ry="21" fill="#265232" />
      <ellipse cx="-32" cy="-233" rx="38" ry="26" fill="#306640" />
      <ellipse cx="32"  cy="-231" rx="36" ry="25" fill="#2E6440" />
      <ellipse cx="0"   cy="-248" rx="46" ry="29" fill="#3A7A4C" />
      <ellipse cx="-17" cy="-268" rx="27" ry="17" fill="#428558" />
      <ellipse cx="17"  cy="-264" rx="25" ry="16" fill="#408055" />
      <ellipse cx="0"   cy="-276" rx="18" ry="12" fill="#4E9165" />

      {/* Gold ancient glow at crown tip */}
      <ellipse cx="0" cy="-272" rx="22" ry="13" fill="#C4873A" opacity="0.18" />
      <ellipse cx="0" cy="-274" rx="13" ry="8"  fill="#E8A84A" opacity="0.22" />

      {/* Golden leaf accents */}
      <circle cx="-24" cy="-256" r="3.5" fill="#C4873A" opacity="0.55" />
      <circle cx="20"  cy="-262" r="3"   fill="#D4973E" opacity="0.50" />
      <circle cx="36"  cy="-240" r="4"   fill="#C4873A" opacity="0.45" />
      <circle cx="-40" cy="-244" r="3.5" fill="#D4973E" opacity="0.48" />
      <circle cx="8"   cy="-278" r="2.5" fill="#E8A84A" opacity="0.65" />
      <circle cx="-10" cy="-276" r="2"   fill="#E8A84A" opacity="0.55" />
      <circle cx="-58" cy="-196" r="3"   fill="#C4873A" opacity="0.36" />
      <circle cx="62"  cy="-200" r="3.5" fill="#C4873A" opacity="0.34" />

      {/* Canopy highlights */}
      <ellipse cx="-22" cy="-276" rx="14" ry="8" fill="#6AB87E" opacity="0.30" />
      <ellipse cx="14"  cy="-266" rx="10" ry="6" fill="#6AB87E" opacity="0.22" />
    </g>
  );
}

// Wolf companion — 8 evolution stages, side-view walking profile.
// viewBox 0 0 400 300, translate(200, 268) scale(X) — identical to CartoonTree.
// Wolf faces right. Tail has SMIL sway. Eyes are clear cartoon blue throughout.
// Color arc: light silver pup → near-black legendary wolf.
// Golden ground disc intensifies with each stage (matching CartoonTree).

import wolfStage1Url from "@/assets/wolf-stage1.jpg";
import wolfStage2Url from "@/assets/wolf-stage2.jpg";
import wolfStage3Url from "@/assets/wolf-stage3.jpg";

type P = { className?: string };
const GOLD = "#C4873A"; // CartoonTree golden element colour

// ─── Shared walking-leg helper ────────────────────────────────────────────────
// Each stage has four legs in alternating mid-stride:
//   near-front  = swung forward   (visible, in front of body)
//   near-back   = pushing back    (visible, in front of body)
//   far-front   = trailing back   (behind body, darker)
//   far-back    = swung forward   (behind body, darker)

// ── Stage 0: Tiny silver pup — small, round, first strides ───────────────────
function Wolf0({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(2.5)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="28" ry="5" fill="#2D3824" opacity="0.65" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-1" rx="22" ry="3" fill={GOLD} opacity="0.08" />

        {/* Tail — animated sway around its root */}
        <g>
          {/* @ts-ignore — SMIL */}
          <animateTransform attributeName="transform" type="rotate"
            values="-10 -14 -32; 10 -14 -32; -10 -14 -32"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -14 -32 Q -28 -36 -32 -52 Q -33 -60 -26 -62"
            stroke="#C8D0DA" strokeWidth="8" strokeLinecap="round" fill="none"/>
          <path d="M -14 -32 Q -27 -37 -31 -51 Q -32 -58 -25 -60"
            stroke="#E4E8F0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -8 -29 Q -4 -18 -2 -7" stroke="#B8C0CC" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <ellipse cx="-2" cy="-5" rx="7" ry="3.5" fill="#B0B8C4"/>
        {/* Far front leg (backward) */}
        <path d="M 10 -30 Q 6 -18 3 -7" stroke="#B8C0CC" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <ellipse cx="3" cy="-5" rx="7" ry="3.5" fill="#B0B8C4"/>

        {/* Body */}
        <ellipse cx="0" cy="-38" rx="22" ry="13" fill="#D8DCE6"/>
        {/* Belly */}
        <ellipse cx="4" cy="-35" rx="12" ry="8" fill="#ECEEF6" opacity="0.72"/>

        {/* Near back leg (backward) */}
        <path d="M -8 -29 Q -14 -18 -18 -7" stroke="#CDD1DC" strokeWidth="8" strokeLinecap="round" fill="none"/>
        <ellipse cx="-18" cy="-5" rx="8" ry="4" fill="#C8CCD8"/>
        {/* Near front leg (forward) */}
        <path d="M 10 -30 Q 16 -18 20 -7" stroke="#CDD1DC" strokeWidth="8" strokeLinecap="round" fill="none"/>
        <ellipse cx="20" cy="-5" rx="8" ry="4" fill="#C8CCD8"/>

        {/* Neck */}
        <ellipse cx="20" cy="-44" rx="11" ry="8" fill="#D4D8E2"/>

        {/* Head — round puppy head */}
        <ellipse cx="30" cy="-50" rx="18" ry="14" fill="#D8DCE6"/>

        {/* Ear */}
        <polygon points="22,-50 19,-68 30,-56" fill="#C4C8D4"/>
        <polygon points="23,-51 21,-65 29,-57" fill="#C4A0A8" opacity="0.60"/>

        {/* Snout */}
        <ellipse cx="44" cy="-46" rx="11" ry="7" fill="#C8CCD6"/>
        {/* Nose */}
        <ellipse cx="52" cy="-48" rx="3" ry="2.5" fill="#1A1E2A"/>
        <circle cx="50.5" cy="-50" r="1" fill="#FFF" opacity="0.22"/>

        {/* Eye — blue */}
        <circle cx="34" cy="-54" r="4" fill="#1A2434"/>
        <circle cx="34" cy="-54" r="2.5" fill="#3474C0"/>
        <circle cx="35.5" cy="-55.5" r="1" fill="#FFF" opacity="0.78"/>

        {/* Mouth */}
        <path d="M 50 -44 Q 48 -42 45 -43" stroke="#384450" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Stage 1: Local wolf image inside golden circle ────────────────────────────
function Wolf1({ className }: P) {
  return (
    <div
      className={className}
      style={{
        position: "relative", width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Golden circle — matches CartoonTree golden disc */}
      <div style={{
        position: "absolute",
        width: "78%", height: "78%", borderRadius: "50%",
        background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`,
        boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)`,
      }} />
      {/* Wolf image */}
      <img
        src={wolfStage1Url}
        alt="Wolf stage 1"
        style={{
          position: "relative", zIndex: 1,
          width: "92%", height: "92%", objectFit: "contain",
        }}
      />
    </div>
  );
}

// ── Stage 2: Local wolf image inside golden circle ────────────────────────────
function Wolf2({ className }: P) {
  return (
    <div
      className={className}
      style={{
        position: "relative", width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Golden circle — matches CartoonTree golden disc */}
      <div style={{
        position: "absolute",
        width: "78%", height: "78%", borderRadius: "50%",
        background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`,
        boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)`,
      }} />
      {/* Wolf image */}
      <img
        src={wolfStage2Url}
        alt="Wolf stage 2"
        style={{
          position: "relative", zIndex: 1,
          width: "92%", height: "92%", objectFit: "contain",
        }}
      />
    </div>
  );
}

// ── Stage 3: Local wolf image inside golden circle ────────────────────────────
function Wolf3({ className }: P) {
  return (
    <div
      className={className}
      style={{
        position: "relative", width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Golden circle — matches CartoonTree golden disc */}
      <div style={{
        position: "absolute",
        width: "78%", height: "78%", borderRadius: "50%",
        background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`,
        boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)`,
      }} />
      {/* Wolf image */}
      <img
        src={wolfStage3Url}
        alt="Wolf stage 3"
        style={{
          position: "relative", zIndex: 1,
          width: "92%", height: "92%", objectFit: "contain",
        }}
      />
    </div>
  );
}

// ── Stages 4–7: wolf-stage3.jpg inside golden circle (placeholder until dedicated images are ready) ──
function Wolf4({ className }: P) {
  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "78%", height: "78%", borderRadius: "50%", background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`, boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)` }} />
      <img src={wolfStage3Url} alt="Wolf stage 4" style={{ position: "relative", zIndex: 1, width: "92%", height: "92%", objectFit: "contain" }} />
    </div>
  );
}

function Wolf5({ className }: P) {
  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "78%", height: "78%", borderRadius: "50%", background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`, boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)` }} />
      <img src={wolfStage3Url} alt="Wolf stage 5" style={{ position: "relative", zIndex: 1, width: "92%", height: "92%", objectFit: "contain" }} />
    </div>
  );
}

function Wolf6({ className }: P) {
  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "78%", height: "78%", borderRadius: "50%", background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`, boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)` }} />
      <img src={wolfStage3Url} alt="Wolf stage 6" style={{ position: "relative", zIndex: 1, width: "92%", height: "92%", objectFit: "contain" }} />
    </div>
  );
}

function Wolf7({ className }: P) {
  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: "78%", height: "78%", borderRadius: "50%", background: `radial-gradient(circle at 42% 36%, #E8C870 0%, ${GOLD} 48%, #8B5A20 100%)`, boxShadow: `0 0 32px 10px rgba(196,135,58,0.30), inset 0 2px 12px rgba(255,228,120,0.18)` }} />
      <img src={wolfStage3Url} alt="Wolf stage 7" style={{ position: "relative", zIndex: 1, width: "92%", height: "92%", objectFit: "contain" }} />
    </div>
  );
}

// ── Onboarding selection preview — front-facing sitting wolf ──────────────────
// Designed for the 160×160 companion card. Large head, tall ears, blue eyes,
// open smile, thick upward tail, white chest — instantly readable as a wolf.
// Animations: tail wag (1.0s) + gentle head tilt (2.8s), both SMIL, infinite.
export function WolfSittingPreview({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 210" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* ── Ground shadow ─────────────────────────────────────────────── */}
      <ellipse cx="80" cy="202" rx="50" ry="6" fill="#000" opacity="0.09"/>

      {/* ── Tail — thick bushy wolf tail, three layered fur paths ─────── */}
      <g>
        {/* @ts-ignore — SMIL animateTransform */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-15 110 168; 15 110 168; -15 110 168"
          keyTimes="0; 0.5; 1"
          dur="1.0s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
        />
        {/* Widest outer dark silhouette — defines the fluffy edge */}
        <path d="M 104 170 Q 92 148 98 112 Q 104 80 122 56 Q 136 36 156 30 Q 164 42 154 52 Q 136 56 122 82 Q 108 110 108 142 Q 108 164 126 174 Q 116 180 104 170 Z"
          fill="#3A4A5C"/>
        {/* Second dark layer — slightly narrower */}
        <path d="M 108 167 Q 98 144 104 110 Q 110 78 128 54 Q 140 36 155 32 Q 161 44 151 53 Q 134 58 120 84 Q 108 112 108 142 Q 108 162 124 172 Q 116 178 108 167 Z"
          fill="#566882" opacity="0.88"/>
        {/* Main mid-grey fur body */}
        <path d="M 112 164 Q 104 142 110 110 Q 116 80 132 58 Q 144 40 156 36 Q 160 48 150 56 Q 134 62 122 88 Q 112 116 112 142 Q 112 160 126 170 Q 119 176 112 164 Z"
          fill="#7888A2"/>
        {/* Light centre fur stripe — volume */}
        <path d="M 116 154 Q 110 132 116 106 Q 122 82 134 62 Q 142 46 152 40"
          stroke="#A8B8CC" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.52"/>
        {/* Fur cross-strokes — bushy texture */}
        <path d="M 116 146 Q 127 136 136 143" stroke="#96AABE" strokeWidth="3" fill="none" opacity="0.58"/>
        <path d="M 114 124 Q 126 113 135 120" stroke="#96AABE" strokeWidth="3" fill="none" opacity="0.52"/>
        <path d="M 116 102 Q 128 92 136 99"  stroke="#96AABE" strokeWidth="2.5" fill="none" opacity="0.46"/>
        <path d="M 120 80  Q 131 71 138 78"  stroke="#96AABE" strokeWidth="2" fill="none" opacity="0.38"/>
        {/* Large fluffy white tip — wolves have a white tail tip */}
        <ellipse cx="153" cy="44" rx="16" ry="14" fill="#C8D8EE" opacity="0.92"/>
        <ellipse cx="152" cy="41" rx="11" ry="10" fill="#DDE8F8" opacity="0.78"/>
        <ellipse cx="149" cy="37" rx="8"  ry="7"  fill="#EAF3FC" opacity="0.64"/>
        {/* Extra tip puff */}
        <ellipse cx="158" cy="47" rx="9" ry="7" fill="#D0E2F4" opacity="0.55"/>
      </g>

      {/* ── Body — static ────────────────────────────────────────────── */}
      <ellipse cx="76" cy="155" rx="44" ry="42" fill="#6A7A8C"/>
      <ellipse cx="80" cy="158" rx="40" ry="40" fill="#8898AA"/>

      {/* ── White chest / belly ───────────────────────────────────────── */}
      <ellipse cx="80" cy="168" rx="27" ry="34" fill="#DCE8F6"/>
      <ellipse cx="80" cy="172" rx="18" ry="24" fill="#EAF0FA" opacity="0.60"/>

      {/* ── Front paws — static ───────────────────────────────────────── */}
      <ellipse cx="57" cy="194" rx="18" ry="9" fill="#5E6E80"/>
      <ellipse cx="103" cy="194" rx="18" ry="9" fill="#5E6E80"/>
      <ellipse cx="57" cy="190" rx="14" ry="7" fill="#8090A2"/>
      <ellipse cx="103" cy="190" rx="14" ry="7" fill="#8090A2"/>
      <ellipse cx="57" cy="187" rx="9" ry="4" fill="#A0AEBA" opacity="0.60"/>
      <ellipse cx="103" cy="187" rx="9" ry="4" fill="#A0AEBA" opacity="0.60"/>
      <path d="M 50 188 Q 57 184 64 188" stroke="#7080A0" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M 96 188 Q 103 184 110 188" stroke="#7080A0" strokeWidth="1.2" fill="none" opacity="0.5"/>

      {/* ── Head group — gentle tilt, pivot at neck (80, 120), ±4°, 2.8s ─ */}
      <g>
        {/* @ts-ignore — SMIL animateTransform */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-4 80 120; 4 80 120; -4 80 120"
          keyTimes="0; 0.5; 1"
          dur="2.8s"
          begin="0.5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
        />

        {/* ── Neck ──────────────────────────────────────────────────── */}
        <ellipse cx="80" cy="120" rx="30" ry="18" fill="#8898AA"/>

        {/* ── Ear backs — TALL pointed wolf ears, wide base ─────────── */}
        <polygon points="34,78 16,0 72,50" fill="#5A6A7C"/>
        <polygon points="126,78 144,0 88,50" fill="#5A6A7C"/>

        {/* ── Head — taller/narrower oval for a wolf ─────────────────── */}
        <ellipse cx="80" cy="76" rx="46" ry="52" fill="#8898AA"/>

        {/* Top-of-head darker saddle */}
        <path d="M 36 62 Q 58 38 80 42 Q 102 38 124 62 Q 106 44 80 44 Q 54 44 36 62Z"
          fill="#5A6A7C" opacity="0.72"/>

        {/* ── Ear inner — pink-tinted ────────────────────────────────── */}
        <polygon points="38,76 22,4 68,52" fill="#C4A0A8" opacity="0.65"/>
        <polygon points="122,76 138,4 92,52" fill="#C4A0A8" opacity="0.65"/>
        <polygon points="40,58 28,12 62,48" fill="#DCC0C4" opacity="0.40"/>
        <polygon points="120,58 132,12 98,48" fill="#DCC0C4" opacity="0.40"/>

        {/* ── Brow band ─────────────────────────────────────────────── */}
        <ellipse cx="80" cy="66" rx="40" ry="10" fill="#9AAAB8" opacity="0.35"/>

        {/* ── Wolf brow lines ───────────────────────────────────────── */}
        <path d="M 42 67 Q 56 58 66 63" stroke="#3A4A62" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M 118 67 Q 104 58 94 63" stroke="#3A4A62" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>

        {/* ── Eyes — almond-shaped blue ──────────────────────────────── */}
        <ellipse cx="58" cy="72" rx="13" ry="8"  fill="#1A2E48" opacity="0.28"/>
        <ellipse cx="102" cy="72" rx="13" ry="8"  fill="#1A2E48" opacity="0.28"/>
        <ellipse cx="58" cy="72" rx="11" ry="7"  fill="#12181E"/>
        <ellipse cx="102" cy="72" rx="11" ry="7"  fill="#12181E"/>
        <ellipse cx="58" cy="72" rx="8"  ry="5.5" fill="#3474C0"/>
        <ellipse cx="102" cy="72" rx="8"  ry="5.5" fill="#3474C0"/>
        <ellipse cx="58" cy="72" rx="4.5" ry="3"   fill="#60A0E8" opacity="0.88"/>
        <ellipse cx="102" cy="72" rx="4.5" ry="3"   fill="#60A0E8" opacity="0.88"/>
        <ellipse cx="58" cy="73" rx="2.5" ry="3"   fill="#0A0E14"/>
        <ellipse cx="102" cy="73" rx="2.5" ry="3"   fill="#0A0E14"/>
        <circle cx="61" cy="69" r="2.5" fill="#FFFFFF" opacity="0.75"/>
        <circle cx="105" cy="69" r="2.5" fill="#FFFFFF" opacity="0.75"/>

        {/* ── Muzzle ─────────────────────────────────────────────────── */}
        <path d="M 54 88 Q 80 82 106 88 L 104 122 Q 80 130 56 122 Z" fill="#96A4B4"/>
        <path d="M 58 93 Q 80 87 102 93 L 100 120 Q 80 127 60 120 Z" fill="#D4DFF2"/>
        <path d="M 77 88 Q 80 84 83 88 L 83 104 Q 80 107 77 104 Z" fill="#B8C8DC" opacity="0.65"/>

        {/* ── Nose ───────────────────────────────────────────────────── */}
        <ellipse cx="80" cy="91" rx="15" ry="11" fill="#0E1420"/>
        <path d="M 68 91 Q 80 83 92 91" stroke="#1A2436" strokeWidth="2" fill="none" opacity="0.55"/>
        <ellipse cx="74" cy="86" rx="5.5" ry="3.5" fill="#FFFFFF" opacity="0.22"/>

        {/* ── Mouth ──────────────────────────────────────────────────── */}
        <path d="M 67 117 Q 80 126 93 117"
          stroke="#4A5A70" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

        {/* ── Whisker dots ───────────────────────────────────────────── */}
        <circle cx="50" cy="108" r="2" fill="#A0AEBA" opacity="0.55"/>
        <circle cx="42" cy="103" r="2" fill="#A0AEBA" opacity="0.45"/>
        <circle cx="34" cy="109" r="2" fill="#A0AEBA" opacity="0.38"/>
        <circle cx="110" cy="108" r="2" fill="#A0AEBA" opacity="0.55"/>
        <circle cx="118" cy="103" r="2" fill="#A0AEBA" opacity="0.45"/>
        <circle cx="126" cy="109" r="2" fill="#A0AEBA" opacity="0.38"/>
      </g>

    </svg>
  );
}

export const WOLF_STAGES = [Wolf0, Wolf1, Wolf2, Wolf3, Wolf4, Wolf5, Wolf6, Wolf7] as const;

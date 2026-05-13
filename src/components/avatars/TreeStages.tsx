// Tree companion — 6 growth stages across a 90-day recovery journey.
// Premium illustrated style: rich bark gradients, lush canopy layering,
// warm golden ground glow that intensifies with each stage.
// viewBox 0 0 100 130.

type P = { className?: string };
const V = "0 0 100 130";

/* ── Stage 0 — Seedling (day 0–6) ──────────────────────────────────────── */
export function Tree0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="t0glow" cx="50%" cy="100%" r="55%">
          <stop offset="0%" stopColor="#FFB300" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="t0stem" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4CAF50"/>
          <stop offset="50%" stopColor="#66BB6A"/>
          <stop offset="100%" stopColor="#388E3C"/>
        </linearGradient>
      </defs>
      {/* Warm ground glow */}
      <ellipse cx="50" cy="125" rx="30" ry="10" fill="url(#t0glow)"/>
      {/* Soil mound */}
      <ellipse cx="50" cy="122" rx="22" ry="5.5" fill="#5D4037"/>
      <ellipse cx="50" cy="120" rx="15" ry="3.5" fill="#795548"/>
      {/* Stem */}
      <path d="M50 119 C49.5 110 50 101 51 93" stroke="url(#t0stem)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Bottom leaf pair */}
      <path d="M51 111 C44 108 40 102 43 98 C46 94 51 99 51 109Z" fill="#66BB6A"/>
      <path d="M50 107 C57 103 61 97 59 93 C57 89 51 93 51 104Z" fill="#4CAF50"/>
      {/* Leaf vein */}
      <path d="M51 109 Q46 103 43 98" stroke="#388E3C" strokeWidth="0.7" fill="none" opacity="0.5"/>
      <path d="M51 104 Q56 98 59 93" stroke="#2E7D32" strokeWidth="0.7" fill="none" opacity="0.5"/>
      {/* Top leaf pair */}
      <path d="M51 100 C45 97 42 91 45 88 C48 85 51 90 51 98Z" fill="#81C784"/>
      <path d="M50 97 C55 94 58 88 56 85 C54 82 50 86 50 95Z" fill="#66BB6A"/>
      {/* Bud — translucent tip */}
      <ellipse cx="51" cy="91" rx="3.5" ry="5" fill="#A5D6A7"/>
      <ellipse cx="51" cy="89" rx="2" ry="3" fill="#C8E6C9"/>
      <ellipse cx="51" cy="88" rx="1" ry="1.5" fill="#E8F5E9" opacity="0.8"/>
    </svg>
  );
}

/* ── Stage 1 — Sapling (day 7–13) ──────────────────────────────────────── */
export function Tree1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="t1glow" cx="50%" cy="100%" r="58%">
          <stop offset="0%" stopColor="#FFB300" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="t1trunk" x1="15%" y1="0%" x2="85%" y2="0%">
          <stop offset="0%" stopColor="#A67C52"/>
          <stop offset="40%" stopColor="#8B5E3C"/>
          <stop offset="100%" stopColor="#5D3A1A"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="125" rx="35" ry="10" fill="url(#t1glow)"/>
      <ellipse cx="50" cy="123" rx="28" ry="6" fill="#5D4037"/>
      <ellipse cx="50" cy="121" rx="20" ry="4" fill="#795548"/>
      {/* Trunk with gradient bark */}
      <path d="M47 122 C46 107 47 92 48 78" stroke="url(#t1trunk)" strokeWidth="5.5" strokeLinecap="round"/>
      {/* Bark texture lines */}
      <path d="M47.5 118 C47 110 47.5 100 48 90" stroke="#6D4C41" strokeWidth="1.2" fill="none" opacity="0.5"/>
      {/* Branches */}
      <path d="M48 96 C41 92 35 87 30 82" stroke="#7A4F2D" strokeWidth="3" strokeLinecap="round"/>
      <path d="M49 87 C57 83 64 78 69 72" stroke="#7A4F2D" strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 80 C46 74 44 68 43 62" stroke="#7A4F2D" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Branch highlight */}
      <path d="M48 96 C42 93 36 88 31 83" stroke="#A67C52" strokeWidth="0.8" fill="none" opacity="0.4"/>
      {/* Leaf clusters — multi-layered depth */}
      <circle cx="49" cy="68" r="15" fill="#2E7D32"/>
      <circle cx="29" cy="77" r="11" fill="#2E7D32"/>
      <circle cx="69" cy="67" r="11" fill="#388E3C"/>
      <circle cx="49" cy="63" r="11" fill="#388E3C"/>
      <circle cx="29" cy="72" r="7" fill="#43A047"/>
      <circle cx="69" cy="62" r="7" fill="#4CAF50"/>
      <circle cx="42" cy="56" r="7" fill="#4CAF50"/>
      <circle cx="56" cy="58" r="6" fill="#66BB6A"/>
      {/* Canopy highlight (light catching top) */}
      <circle cx="48" cy="57" r="5" fill="#81C784" opacity="0.6"/>
      <circle cx="56" cy="54" r="4" fill="#A5D6A7" opacity="0.5"/>
    </svg>
  );
}

/* ── Stage 2 — Young tree (day 14–29) ──────────────────────────────────── */
export function Tree2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="t2glow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#FFA000" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="t2trunk" x1="12%" y1="0%" x2="88%" y2="0%">
          <stop offset="0%" stopColor="#A67C52"/>
          <stop offset="45%" stopColor="#8B5E3C"/>
          <stop offset="100%" stopColor="#4E2C0E"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="126" rx="42" ry="10" fill="url(#t2glow)"/>
      <ellipse cx="50" cy="124" rx="36" ry="7" fill="#5D4037"/>
      <ellipse cx="50" cy="122" rx="26" ry="5" fill="#795548"/>
      {/* Surface roots */}
      <path d="M33 119 C29 114 24 115 21 120" stroke="#6D4C41" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M67 119 C71 114 76 115 79 120" stroke="#6D4C41" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Trunk */}
      <path d="M44 123 C43 104 44 85 45 69" stroke="url(#t2trunk)" strokeWidth="10.5" strokeLinecap="round"/>
      {/* Bark texture */}
      <path d="M46 119 C45 100 45.5 82 46.5 68" stroke="#A67C52" strokeWidth="1.2" fill="none" opacity="0.55"/>
      <path d="M48.5 113 C48 96 48.5 80 49 66" stroke="#C49A6C" strokeWidth="0.8" fill="none" opacity="0.35"/>
      {/* Branches */}
      <path d="M45 100 C36 96 25 89 18 82" stroke="#7A4F2D" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M46 89 C57 83 68 74 75 68" stroke="#7A4F2D" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M45 78 C42 69 36 61 32 54" stroke="#7A4F2D" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M55 72 C62 65 68 57 72 50" stroke="#7A4F2D" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Branch highlights */}
      <path d="M45 100 C37 96 26 90 19 83" stroke="#A67C52" strokeWidth="0.9" fill="none" opacity="0.38"/>
      {/* Crown — rich layered foliage */}
      <circle cx="50" cy="54" r="25" fill="#1B5E20"/>
      <circle cx="20" cy="72" r="16" fill="#1B5E20"/>
      <circle cx="78" cy="63" r="16" fill="#2E7D32"/>
      <circle cx="50" cy="49" r="20" fill="#2E7D32"/>
      <circle cx="24" cy="64" r="13" fill="#388E3C"/>
      <circle cx="74" cy="57" r="13" fill="#388E3C"/>
      <circle cx="50" cy="43" r="17" fill="#43A047"/>
      <circle cx="35" cy="51" r="13" fill="#4CAF50"/>
      <circle cx="65" cy="48" r="13" fill="#4CAF50"/>
      <circle cx="50" cy="37" r="14" fill="#4CAF50"/>
      <circle cx="38" cy="41" r="10" fill="#66BB6A"/>
      <circle cx="62" cy="39" r="10" fill="#66BB6A"/>
      {/* Canopy highlights */}
      <circle cx="48" cy="32" r="8" fill="#81C784" opacity="0.55"/>
      <circle cx="60" cy="36" r="6" fill="#A5D6A7" opacity="0.45"/>
    </svg>
  );
}

/* ── Stage 3 — Medium tree (day 30–59) ──────────────────────────────────── */
export function Tree3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="t3glow" cx="50%" cy="100%" r="62%">
          <stop offset="0%" stopColor="#FFA000" stopOpacity="0.38"/>
          <stop offset="60%" stopColor="#FF8F00" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="t3trunk" x1="10%" y1="0%" x2="90%" y2="0%">
          <stop offset="0%" stopColor="#A67C52"/>
          <stop offset="40%" stopColor="#8B5E3C"/>
          <stop offset="100%" stopColor="#4A2C0E"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="127" rx="50" ry="12" fill="url(#t3glow)"/>
      <ellipse cx="50" cy="125" rx="44" ry="7" fill="#4E342E"/>
      <ellipse cx="50" cy="123" rx="34" ry="5.5" fill="#6D4C41"/>
      {/* Roots */}
      <path d="M38 120 C32 113 22 114 18 121" stroke="#5D3A1A" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M62 120 C68 113 78 114 82 121" stroke="#5D3A1A" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M44 121 C40 114 34 112 31 118" stroke="#5D3A1A" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M56 121 C60 114 66 112 69 118" stroke="#5D3A1A" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Trunk */}
      <path d="M41 124 C39 101 40 79 42 61" stroke="url(#t3trunk)" strokeWidth="16.5" strokeLinecap="round"/>
      {/* Bark texture */}
      <path d="M44 120 C43 100 43.5 82 44.5 65" stroke="#A67C52" strokeWidth="1.8" fill="none" opacity="0.55"/>
      <path d="M47 115 C46.5 97 47 80 48 64" stroke="#C49A6C" strokeWidth="1.2" fill="none" opacity="0.4"/>
      <path d="M50 118 C50 98 50 80 50.5 63" stroke="#8B6040" strokeWidth="0.9" fill="none" opacity="0.3"/>
      {/* Branches */}
      <path d="M42 95 C29 89 15 79 7 72" stroke="#6D4C41" strokeWidth="6" strokeLinecap="round"/>
      <path d="M43 81 C56 74 70 64 79 56" stroke="#6D4C41" strokeWidth="6" strokeLinecap="round"/>
      <path d="M42 69 C34 59 23 49 17 41" stroke="#6D4C41" strokeWidth="5" strokeLinecap="round"/>
      <path d="M58 65 C67 56 75 46 81 38" stroke="#6D4C41" strokeWidth="5" strokeLinecap="round"/>
      {/* Branch highlights */}
      <path d="M42 95 C30 89 16 80 8 73" stroke="#A67C52" strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M43 81 C57 75 71 65 80 57" stroke="#A67C52" strokeWidth="1" fill="none" opacity="0.35"/>
      {/* Massive crown */}
      <circle cx="50" cy="43" r="34" fill="#1B5E20"/>
      <circle cx="12" cy="62" r="22" fill="#1B5E20"/>
      <circle cx="88" cy="53" r="22" fill="#1B5E20"/>
      <circle cx="50" cy="37" r="28" fill="#2E7D32"/>
      <circle cx="16" cy="54" r="20" fill="#2E7D32"/>
      <circle cx="84" cy="45" r="20" fill="#2E7D32"/>
      <circle cx="50" cy="31" r="23" fill="#388E3C"/>
      <circle cx="29" cy="40" r="20" fill="#43A047"/>
      <circle cx="71" cy="36" r="20" fill="#43A047"/>
      <circle cx="50" cy="24" r="19" fill="#4CAF50"/>
      <circle cx="36" cy="28" r="15" fill="#66BB6A"/>
      <circle cx="64" cy="26" r="15" fill="#66BB6A"/>
      {/* Canopy highlights */}
      <circle cx="50" cy="17" r="13" fill="#81C784" opacity="0.6"/>
      <circle cx="40" cy="20" r="9" fill="#A5D6A7" opacity="0.5"/>
      <circle cx="60" cy="18" r="8" fill="#A5D6A7" opacity="0.45"/>
    </svg>
  );
}

/* ── Stage 4 — Large strong tree (day 60–89) ─────────────────────────────── */
export function Tree4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="t4glow" cx="50%" cy="100%" r="65%">
          <stop offset="0%" stopColor="#FFB300" stopOpacity="0.48"/>
          <stop offset="55%" stopColor="#FF8F00" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="t4trunk" x1="8%" y1="0%" x2="92%" y2="0%">
          <stop offset="0%" stopColor="#C49A6C"/>
          <stop offset="35%" stopColor="#8B5E3C"/>
          <stop offset="100%" stopColor="#3E2008"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="128" rx="55" ry="12" fill="url(#t4glow)"/>
      <ellipse cx="50" cy="126" rx="49" ry="6.5" fill="#4E342E"/>
      <ellipse cx="50" cy="124" rx="40" ry="5.5" fill="#5D4037"/>
      {/* Spreading roots */}
      <path d="M35 121 C25 113 12 113 6 122" stroke="#4E342E" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M65 121 C75 113 88 113 94 122" stroke="#4E342E" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M40 122 C34 113 25 110 20 118" stroke="#4E342E" strokeWidth="4.5" strokeLinecap="round"/>
      <path d="M60 122 C66 113 75 110 80 118" stroke="#4E342E" strokeWidth="4.5" strokeLinecap="round"/>
      {/* Thick trunk */}
      <path d="M38 125 C35 99 37 76 39 55" stroke="url(#t4trunk)" strokeWidth="21" strokeLinecap="round"/>
      {/* Bark texture detail */}
      <path d="M42 122 C41 100 41.5 80 42.5 60" stroke="#A67C52" strokeWidth="2" fill="none" opacity="0.55"/>
      <path d="M46 118 C45.5 98 46 78 46.5 60" stroke="#C49A6C" strokeWidth="1.4" fill="none" opacity="0.45"/>
      <path d="M49 118 C49 98 49 78 49.5 60" stroke="#8B6040" strokeWidth="1" fill="none" opacity="0.3"/>
      <path d="M54 116 C54 98 54 78 54.5 62" stroke="#6D4C41" strokeWidth="0.9" fill="none" opacity="0.28"/>
      {/* Big branches */}
      <path d="M40 101 C25 93 9 82 1 74" stroke="#5D3A1A" strokeWidth="7" strokeLinecap="round"/>
      <path d="M41 86 C55 78 71 65 81 56" stroke="#5D3A1A" strokeWidth="7" strokeLinecap="round"/>
      <path d="M40 73 C29 61 17 49 9 39" stroke="#5D3A1A" strokeWidth="6" strokeLinecap="round"/>
      <path d="M60 65 C70 55 80 43 86 33" stroke="#5D3A1A" strokeWidth="6" strokeLinecap="round"/>
      {/* Branch highlights */}
      <path d="M40 101 C26 94 10 83 2 75" stroke="#A67C52" strokeWidth="1.2" fill="none" opacity="0.38"/>
      <path d="M41 86 C56 79 72 66 82 57" stroke="#A67C52" strokeWidth="1" fill="none" opacity="0.35"/>
      {/* Enormous crown */}
      <circle cx="50" cy="36" r="38" fill="#1B5E20"/>
      <circle cx="7" cy="61" r="24" fill="#1B5E20"/>
      <circle cx="93" cy="51" r="24" fill="#1B5E20"/>
      <circle cx="50" cy="30" r="32" fill="#2E7D32"/>
      <circle cx="11" cy="53" r="22" fill="#2E7D32"/>
      <circle cx="89" cy="43" r="22" fill="#2E7D32"/>
      <circle cx="50" cy="24" r="27" fill="#388E3C"/>
      <circle cx="25" cy="36" r="22" fill="#388E3C"/>
      <circle cx="75" cy="31" r="22" fill="#388E3C"/>
      <circle cx="50" cy="18" r="22" fill="#43A047"/>
      <circle cx="32" cy="24" r="17" fill="#4CAF50"/>
      <circle cx="68" cy="22" r="17" fill="#4CAF50"/>
      {/* Canopy highlights — warm light catching top */}
      <circle cx="50" cy="11" r="16" fill="#66BB6A" opacity="0.8"/>
      <circle cx="40" cy="15" r="12" fill="#81C784" opacity="0.65"/>
      <circle cx="60" cy="13" r="12" fill="#81C784" opacity="0.6"/>
      <circle cx="50" cy="5" r="9" fill="#A5D6A7" opacity="0.55"/>
      {/* Warm golden shimmer leaves */}
      <circle cx="8" cy="50" r="4" fill="#FFE082" opacity="0.35"/>
      <circle cx="92" cy="40" r="3.5" fill="#FFE082" opacity="0.3"/>
    </svg>
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

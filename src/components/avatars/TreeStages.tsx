// Tree companion — 6 growth stages across a 90-day recovery journey.
// viewBox 0 0 100 130 throughout.

type P = { className?: string };
const V = "0 0 100 130";

/* ── Stage 0 — Seedling (day 0–6) ──────────────────────────────────────── */
export function Tree0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="122" rx="22" ry="5.5" fill="#6D4C41" />
      <ellipse cx="50" cy="120" rx="15" ry="3.5" fill="#8D6E63" />
      {/* Stem */}
      <path d="M50 119 C49 110 50 101 51 93" stroke="#558B2F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom leaf pair */}
      <path d="M51 111 C44 108 40 102 43 98 C46 94 51 99 51 109Z" fill="#66BB6A" />
      <path d="M50 107 C57 103 61 97 59 93 C57 89 51 93 51 104Z" fill="#4CAF50" />
      {/* Top leaf pair */}
      <path d="M51 100 C45 97 42 91 45 88 C48 85 51 90 51 98Z" fill="#81C784" />
      <path d="M50 97 C55 94 58 88 56 85 C54 82 50 86 50 95Z" fill="#66BB6A" />
      {/* Bud */}
      <ellipse cx="51" cy="91" rx="3.5" ry="5" fill="#A5D6A7" />
      <ellipse cx="51" cy="89" rx="2" ry="3" fill="#C8E6C9" />
    </svg>
  );
}

/* ── Stage 1 — Sapling (day 7–13) ──────────────────────────────────────── */
export function Tree1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="123" rx="28" ry="6" fill="#6D4C41" />
      <ellipse cx="50" cy="121" rx="20" ry="4" fill="#8D6E63" />
      {/* Trunk */}
      <path d="M47 122 C46 107 47 92 48 78" stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
      <path d="M53 122 C54 107 53 92 52 78" stroke="#5D3A1A" strokeWidth="2" strokeLinecap="round" />
      {/* Branches */}
      <path d="M48 96 C41 92 35 87 30 82" stroke="#7A4F2D" strokeWidth="3" strokeLinecap="round" />
      <path d="M49 87 C57 83 64 78 69 72" stroke="#7A4F2D" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 80 C46 74 44 68 43 62" stroke="#7A4F2D" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaf clusters */}
      <circle cx="49" cy="68" r="15" fill="#388E3C" />
      <circle cx="29" cy="77" r="11" fill="#2E7D32" />
      <circle cx="69" cy="67" r="11" fill="#388E3C" />
      <circle cx="49" cy="63" r="11" fill="#4CAF50" />
      <circle cx="29" cy="72" r="7" fill="#43A047" />
      <circle cx="69" cy="62" r="7" fill="#4CAF50" />
      <circle cx="42" cy="56" r="7" fill="#66BB6A" />
      <circle cx="56" cy="58" r="6" fill="#66BB6A" />
    </svg>
  );
}

/* ── Stage 2 — Young tree (day 14–29) ──────────────────────────────────── */
export function Tree2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="124" rx="36" ry="7" fill="#5D4037" />
      <ellipse cx="50" cy="122" rx="26" ry="5" fill="#795548" />
      <path d="M33 119 C29 114 24 115 21 120" stroke="#6D4C41" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M67 119 C71 114 76 115 79 120" stroke="#6D4C41" strokeWidth="3.5" strokeLinecap="round" />
      {/* Trunk */}
      <path d="M44 123 C43 104 44 85 45 69" stroke="#8B5E3C" strokeWidth="10" strokeLinecap="round" />
      <path d="M56 123 C57 104 56 85 55 69" stroke="#5D3A1A" strokeWidth="3" strokeLinecap="round" />
      <path d="M49 113 C48 100 48 87 49 74" stroke="#A67C52" strokeWidth="1" opacity="0.7" />
      {/* Branches */}
      <path d="M45 100 C36 96 25 89 18 82" stroke="#7A4F2D" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M46 89 C57 83 68 74 75 68" stroke="#7A4F2D" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M45 78 C42 69 36 61 32 54" stroke="#7A4F2D" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M55 72 C62 65 68 57 72 50" stroke="#7A4F2D" strokeWidth="3.5" strokeLinecap="round" />
      {/* Crown */}
      <circle cx="50" cy="54" r="25" fill="#1B5E20" />
      <circle cx="20" cy="72" r="16" fill="#2E7D32" />
      <circle cx="78" cy="63" r="16" fill="#2E7D32" />
      <circle cx="50" cy="49" r="20" fill="#2E7D32" />
      <circle cx="24" cy="64" r="13" fill="#388E3C" />
      <circle cx="74" cy="57" r="13" fill="#388E3C" />
      <circle cx="50" cy="43" r="17" fill="#43A047" />
      <circle cx="35" cy="51" r="13" fill="#43A047" />
      <circle cx="65" cy="48" r="13" fill="#43A047" />
      <circle cx="50" cy="37" r="14" fill="#4CAF50" />
      <circle cx="38" cy="41" r="10" fill="#66BB6A" />
      <circle cx="62" cy="39" r="10" fill="#66BB6A" />
      <circle cx="50" cy="31" r="10" fill="#81C784" />
    </svg>
  );
}

/* ── Stage 3 — Medium tree (day 30–59) ──────────────────────────────────── */
export function Tree3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="125" rx="44" ry="7" fill="#4E342E" />
      <ellipse cx="50" cy="123" rx="34" ry="5.5" fill="#6D4C41" />
      <path d="M38 120 C32 113 22 114 18 121" stroke="#5D3A1A" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M62 120 C68 113 78 114 82 121" stroke="#5D3A1A" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M44 121 C40 114 34 112 31 118" stroke="#5D3A1A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M56 121 C60 114 66 112 69 118" stroke="#5D3A1A" strokeWidth="3.5" strokeLinecap="round" />
      {/* Trunk with bark */}
      <path d="M41 124 C39 101 40 79 42 61" stroke="#8B5E3C" strokeWidth="16" strokeLinecap="round" />
      <path d="M59 124 C61 101 60 79 58 61" stroke="#5D3A1A" strokeWidth="5" strokeLinecap="round" />
      <path d="M47 114 C46 100 46 87 47 73" stroke="#A67C52" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M53 114 C54 100 54 87 53 73" stroke="#A67C52" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M44 108 C43 96 43 84 44 72" stroke="#6D4C41" strokeWidth="1" opacity="0.5" />
      {/* Branches */}
      <path d="M42 95 C29 89 15 79 7 72" stroke="#6D4C41" strokeWidth="6" strokeLinecap="round" />
      <path d="M43 81 C56 74 70 64 79 56" stroke="#6D4C41" strokeWidth="6" strokeLinecap="round" />
      <path d="M42 69 C34 59 23 49 17 41" stroke="#6D4C41" strokeWidth="5" strokeLinecap="round" />
      <path d="M58 65 C67 56 75 46 81 38" stroke="#6D4C41" strokeWidth="5" strokeLinecap="round" />
      {/* Massive crown */}
      <circle cx="50" cy="43" r="34" fill="#1B5E20" />
      <circle cx="12" cy="62" r="22" fill="#1B5E20" />
      <circle cx="88" cy="53" r="22" fill="#1B5E20" />
      <circle cx="50" cy="37" r="28" fill="#2E7D32" />
      <circle cx="16" cy="54" r="20" fill="#2E7D32" />
      <circle cx="84" cy="45" r="20" fill="#2E7D32" />
      <circle cx="50" cy="31" r="23" fill="#388E3C" />
      <circle cx="29" cy="40" r="20" fill="#43A047" />
      <circle cx="71" cy="36" r="20" fill="#43A047" />
      <circle cx="50" cy="24" r="19" fill="#4CAF50" />
      <circle cx="36" cy="28" r="15" fill="#66BB6A" />
      <circle cx="64" cy="26" r="15" fill="#66BB6A" />
      <circle cx="50" cy="17" r="13" fill="#81C784" />
      <circle cx="50" cy="12" r="8" fill="#A5D6A7" />
    </svg>
  );
}

/* ── Stage 4 — Large strong tree (day 60–89) ─────────────────────────────── */
export function Tree4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="126" rx="49" ry="6.5" fill="#4E342E" />
      <ellipse cx="50" cy="124" rx="40" ry="5.5" fill="#5D4037" />
      <path d="M35 121 C25 113 12 113 6 122" stroke="#4E342E" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M65 121 C75 113 88 113 94 122" stroke="#4E342E" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M40 122 C34 113 25 110 20 118" stroke="#4E342E" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M60 122 C66 113 75 110 80 118" stroke="#4E342E" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M50 122 C46 115 39 112 37 118" stroke="#4E342E" strokeWidth="3.5" strokeLinecap="round" />
      {/* Thick trunk */}
      <path d="M38 125 C35 99 37 76 39 55" stroke="#8B5E3C" strokeWidth="20" strokeLinecap="round" />
      <path d="M62 125 C65 99 63 76 61 55" stroke="#5D3A1A" strokeWidth="7" strokeLinecap="round" />
      <path d="M47 116 C46 100 46 84 47 68" stroke="#A67C52" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M53 116 C54 100 54 84 53 68" stroke="#A67C52" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <path d="M44 111 C43 96 43 81 44 66" stroke="#C49A6C" strokeWidth="1" opacity="0.6" />
      <path d="M50 113 C50 98 50 83 50 68" stroke="#6D4C41" strokeWidth="1" opacity="0.4" />
      {/* Big branches */}
      <path d="M40 101 C25 93 9 82 1 74" stroke="#5D3A1A" strokeWidth="7" strokeLinecap="round" />
      <path d="M41 86 C55 78 71 65 81 56" stroke="#5D3A1A" strokeWidth="7" strokeLinecap="round" />
      <path d="M40 73 C29 61 17 49 9 39" stroke="#5D3A1A" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 65 C70 55 80 43 86 33" stroke="#5D3A1A" strokeWidth="6" strokeLinecap="round" />
      {/* Enormous crown */}
      <circle cx="50" cy="36" r="38" fill="#1B5E20" />
      <circle cx="7" cy="61" r="24" fill="#1B5E20" />
      <circle cx="93" cy="51" r="24" fill="#1B5E20" />
      <circle cx="50" cy="30" r="32" fill="#2E7D32" />
      <circle cx="11" cy="53" r="22" fill="#2E7D32" />
      <circle cx="89" cy="43" r="22" fill="#2E7D32" />
      <circle cx="50" cy="24" r="27" fill="#388E3C" />
      <circle cx="25" cy="36" r="22" fill="#388E3C" />
      <circle cx="75" cy="31" r="22" fill="#388E3C" />
      <circle cx="50" cy="18" r="22" fill="#43A047" />
      <circle cx="32" cy="24" r="17" fill="#4CAF50" />
      <circle cx="68" cy="22" r="17" fill="#4CAF50" />
      <circle cx="50" cy="11" r="16" fill="#66BB6A" />
      <circle cx="40" cy="15" r="12" fill="#81C784" />
      <circle cx="60" cy="13" r="12" fill="#81C784" />
      <circle cx="50" cy="5" r="9" fill="#A5D6A7" />
    </svg>
  );
}

/* ── Stage 5 — Massive glowing tree (day 90+) ───────────────────────────── */
export function Tree5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="tg5" cx="50%" cy="100%" r="65%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#FFB300" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Golden ground glow */}
      <ellipse cx="50" cy="130" rx="56" ry="30" fill="url(#tg5)" />
      <ellipse cx="50" cy="127" rx="50" ry="6" fill="#4E342E" />
      <ellipse cx="50" cy="125" rx="42" ry="5" fill="#5D4037" />
      {/* Root fan */}
      <path d="M32 121 C21 112 9 112 2 122" stroke="#3E2723" strokeWidth="7" strokeLinecap="round" />
      <path d="M68 121 C79 112 91 112 98 122" stroke="#3E2723" strokeWidth="7" strokeLinecap="round" />
      <path d="M38 122 C30 113 19 109 13 117" stroke="#3E2723" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M62 122 C70 113 81 109 87 117" stroke="#3E2723" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M44 122 C38 114 31 111 27 118" stroke="#3E2723" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M56 122 C62 114 69 111 73 118" stroke="#3E2723" strokeWidth="4.5" strokeLinecap="round" />
      {/* Very thick trunk */}
      <path d="M35 126 C31 97 33 70 35 48" stroke="#8B5E3C" strokeWidth="24" strokeLinecap="round" />
      <path d="M65 126 C69 97 67 70 65 48" stroke="#5D3A1A" strokeWidth="8" strokeLinecap="round" />
      <path d="M46 117 C45 100 45 83 46 66" stroke="#A67C52" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M54 117 C55 100 55 83 54 66" stroke="#A67C52" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M43 111 C42 95 42 79 43 63" stroke="#C49A6C" strokeWidth="1.5" opacity="0.7" />
      <path d="M57 111 C58 95 58 79 57 63" stroke="#C49A6C" strokeWidth="1.5" opacity="0.7" />
      {/* Trunk base golden tinge */}
      <path d="M36 126 C32 118 33 109 35 100" stroke="#FFD54F" strokeWidth="22" strokeLinecap="round" opacity="0.15" />
      {/* Heavy branches */}
      <path d="M37 105 C20 97 4 84 -4 76" stroke="#4E342E" strokeWidth="8" strokeLinecap="round" />
      <path d="M38 89 C54 79 73 65 84 55" stroke="#4E342E" strokeWidth="8" strokeLinecap="round" />
      <path d="M37 75 C24 62 10 47 3 36" stroke="#4E342E" strokeWidth="7" strokeLinecap="round" />
      <path d="M63 62 C74 51 85 38 91 27" stroke="#4E342E" strokeWidth="7" strokeLinecap="round" />
      {/* Colossal crown */}
      <circle cx="50" cy="32" r="40" fill="#1A4E1E" />
      <circle cx="3" cy="61" r="26" fill="#1A4E1E" />
      <circle cx="97" cy="50" r="26" fill="#1A4E1E" />
      <circle cx="50" cy="26" r="34" fill="#2E7D32" />
      <circle cx="7" cy="53" r="23" fill="#2E7D32" />
      <circle cx="93" cy="42" r="23" fill="#2E7D32" />
      <circle cx="50" cy="20" r="29" fill="#388E3C" />
      <circle cx="22" cy="32" r="24" fill="#388E3C" />
      <circle cx="78" cy="27" r="24" fill="#388E3C" />
      <circle cx="50" cy="13" r="24" fill="#43A047" />
      <circle cx="29" cy="19" r="19" fill="#4CAF50" />
      <circle cx="71" cy="17" r="19" fill="#4CAF50" />
      <circle cx="50" cy="7" r="18" fill="#66BB6A" />
      <circle cx="38" cy="11" r="14" fill="#81C784" />
      <circle cx="62" cy="10" r="14" fill="#81C784" />
      <circle cx="50" cy="2" r="11" fill="#A5D6A7" />
      {/* Golden shimmer leaves */}
      <circle cx="4" cy="48" r="5.5" fill="#FFD54F" opacity="0.55" />
      <circle cx="96" cy="37" r="5" fill="#FFD54F" opacity="0.5" />
      <circle cx="17" cy="19" r="4.5" fill="#FFE082" opacity="0.65" />
      <circle cx="83" cy="15" r="4.5" fill="#FFE082" opacity="0.65" />
      <circle cx="50" cy="-1" r="5" fill="#FFF9C4" opacity="0.75" />
      <circle cx="33" cy="4" r="3.5" fill="#FFD54F" opacity="0.55" />
      <circle cx="67" cy="3" r="3.5" fill="#FFD54F" opacity="0.55" />
      {/* Sparkle stars */}
      <g opacity="0.85">
        <circle cx="2" cy="52" r="3" fill="white" />
        <path d="M2 47 L2 57M-3 52 L7 52" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.8">
        <circle cx="98" cy="41" r="2.5" fill="#FFF9C4" />
        <path d="M98 36 L98 46M93 41 L103 41" stroke="#FFF9C4" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.85">
        <circle cx="50" cy="-3" r="3" fill="white" />
        <path d="M50 -8 L50 2M45 -3 L55 -3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="14" cy="11" r="2" fill="white" opacity="0.8" />
      <circle cx="86" cy="8" r="2" fill="white" opacity="0.8" />
    </svg>
  );
}

export const TREE_STAGES = [Tree0, Tree1, Tree2, Tree3, Tree4, Tree5] as const;

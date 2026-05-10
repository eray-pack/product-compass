// Woman companion — 6 life stages from baby girl to accomplished woman.
// viewBox 0 0 100 140. Ground line at y≈132.

type P = { className?: string };
const V = "0 0 100 140";

const SK  = "#F5C9A0";
const SKS = "#E8A87C";
const HAIR = "#2C1810";
const EYE  = "#3E2723";
const MOUTH = "#C17A6A";
const CHK  = "#FF8A80";
const BROW = "#2C1810";
const LASH = "#1A0E08";

/* ── Stage 0 — Baby girl (day 0–6) ──────────────────────────────────────── */
export function Woman0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="134" rx="20" ry="4" fill="black" opacity="0.07" />
      {/* Sitting legs */}
      <path d="M38 122 Q32 117 28 122 Q32 130 40 128Z" fill={SK} />
      <path d="M62 122 Q68 117 72 122 Q68 130 60 128Z" fill={SK} />
      <ellipse cx="26" cy="127" rx="8" ry="5.5" fill={SK} />
      <ellipse cx="74" cy="127" rx="8" ry="5.5" fill={SK} />
      {/* Pink onesie */}
      <ellipse cx="50" cy="113" rx="17" ry="15" fill="#F8BBD0" />
      <rect x="43" y="107" width="14" height="9" rx="3" fill="#F48FB1" opacity="0.6" />
      {/* Diaper */}
      <path d="M34 124 Q50 134 66 124 Q62 116 50 116 Q38 116 34 124Z" fill="#FCE4EC" />
      {/* Arms */}
      <path d="M34 108 Q27 107 24 116" stroke={SK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M66 108 Q73 107 76 116" stroke={SK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="23" cy="117" r="5.5" fill={SK} />
      <circle cx="77" cy="117" r="5.5" fill={SK} />
      {/* Neck */}
      <rect x="46" y="93" width="8" height="8" rx="3.5" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="80" r="24" fill={SK} />
      <ellipse cx="26" cy="80" rx="4.5" ry="5.5" fill={SK} />
      <ellipse cx="74" cy="80" rx="4.5" ry="5.5" fill={SK} />
      <ellipse cx="26" cy="80" rx="2.5" ry="3.5" fill={SKS} opacity="0.3" />
      <ellipse cx="74" cy="80" rx="2.5" ry="3.5" fill={SKS} opacity="0.3" />
      {/* Hair + bow */}
      <path d="M30 72 Q50 64 70 72 Q68 80 50 82 Q32 80 30 72Z" fill={HAIR} />
      {/* Bow — pink */}
      <path d="M43 63 Q50 59 57 63 Q54 68 50 67 Q46 68 43 63Z" fill="#F48FB1" />
      <path d="M43 63 Q38 57 43 55 Q47 57 43 63Z" fill="#F06292" />
      <path d="M57 63 Q62 57 57 55 Q53 57 57 63Z" fill="#F06292" />
      <circle cx="50" cy="63" r="3" fill="#E91E63" />
      {/* Eyebrows */}
      <path d="M40 72 Q44 70 47 71" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M53 71 Q56 70 60 72" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes — big with lashes */}
      <ellipse cx="42" cy="78" rx="5.5" ry="6" fill="white" />
      <ellipse cx="58" cy="78" rx="5.5" ry="6" fill="white" />
      <circle cx="43" cy="78" r="3" fill={EYE} />
      <circle cx="59" cy="78" r="3" fill={EYE} />
      <circle cx="44" cy="76.5" r="1.2" fill="white" />
      <circle cx="60" cy="76.5" r="1.2" fill="white" />
      {/* Lashes */}
      <path d="M37 73 Q39 71 42 72" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M53 72 Q56 71 63 73" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="31" cy="85" rx="5.5" ry="3.5" fill={CHK} opacity="0.4" />
      <ellipse cx="69" cy="85" rx="5.5" ry="3.5" fill={CHK} opacity="0.4" />
      {/* Nose */}
      <ellipse cx="50" cy="83" rx="2.5" ry="2" fill={SKS} />
      {/* Smile */}
      <path d="M43 89 Q50 97 57 89" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 1 — Toddler girl (day 7–13) ───────────────────────────────────── */
export function Woman1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="134" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* Pink Mary Jane shoes */}
      <ellipse cx="40" cy="132" rx="9" ry="5" fill="#E91E63" />
      <ellipse cx="60" cy="132" rx="9" ry="5" fill="#E91E63" />
      <ellipse cx="40" cy="130" rx="5" ry="2.5" fill="#F06292" opacity="0.5" />
      <ellipse cx="60" cy="130" rx="5" ry="2.5" fill="#F06292" opacity="0.5" />
      {/* Chubby legs with white socks */}
      <rect x="34" y="117" width="13" height="14" rx="5" fill={SK} />
      <rect x="53" y="117" width="13" height="14" rx="5" fill={SK} />
      <rect x="34" y="124" width="13" height="7" rx="3" fill="white" />
      <rect x="53" y="124" width="13" height="7" rx="3" fill="white" />
      {/* Pink floral dress */}
      <rect x="31" y="85" width="38" height="35" rx="7" fill="#F48FB1" />
      {/* Dress collar — white ruffle */}
      <ellipse cx="50" cy="85" rx="12" ry="5" fill="white" />
      {/* Dress flowers */}
      <circle cx="42" cy="96" r="3" fill="#F06292" opacity="0.7" />
      <circle cx="58" cy="101" r="3" fill="#F06292" opacity="0.7" />
      <circle cx="50" cy="107" r="2.5" fill="#F06292" opacity="0.7" />
      {/* Arms */}
      <path d="M31 91 Q22 96 20 110" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M69 91 Q78 96 80 110" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="111" r="6" fill={SK} />
      <circle cx="80" cy="111" r="6" fill={SK} />
      {/* Neck */}
      <rect x="46" y="74" width="8" height="13" rx="3.5" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="62" r="19" fill={SK} />
      <ellipse cx="31" cy="62" rx="3.5" ry="4.5" fill={SK} />
      <ellipse cx="69" cy="62" rx="3.5" ry="4.5" fill={SK} />
      {/* Pigtails */}
      <path d="M33 53 Q50 46 67 53 Q65 62 50 64 Q35 62 33 53Z" fill={HAIR} />
      {/* Left pigtail bun */}
      <circle cx="26" cy="52" r="7" fill={HAIR} />
      <circle cx="26" cy="52" r="4" fill="#3A1F10" />
      {/* Right pigtail bun */}
      <circle cx="74" cy="52" r="7" fill={HAIR} />
      <circle cx="74" cy="52" r="4" fill="#3A1F10" />
      {/* Pigtail bands — pink */}
      <ellipse cx="26" cy="59" rx="4" ry="2" fill="#F06292" />
      <ellipse cx="74" cy="59" rx="4" ry="2" fill="#F06292" />
      {/* Eyebrows */}
      <path d="M40 58 Q44 56 47 57" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M53 57 Q56 56 60 58" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="43" cy="62" rx="4.5" ry="5" fill="white" />
      <ellipse cx="57" cy="62" rx="4.5" ry="5" fill="white" />
      <circle cx="44" cy="62" r="2.5" fill={EYE} />
      <circle cx="58" cy="62" r="2.5" fill={EYE} />
      <circle cx="45" cy="61" r="1" fill="white" />
      <circle cx="59" cy="61" r="1" fill="white" />
      <path d="M39 57 Q42 55 45 57" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M55 57 Q58 55 61 57" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="35" cy="67" rx="5" ry="3" fill={CHK} opacity="0.38" />
      <ellipse cx="65" cy="67" rx="5" ry="3" fill={CHK} opacity="0.38" />
      {/* Nose */}
      <ellipse cx="50" cy="66" rx="2" ry="1.7" fill={SKS} />
      {/* Mouth */}
      <path d="M44 73 Q50 79 56 73" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 2 — Child girl (day 14–29) ───────────────────────────────────── */
export function Woman2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="135" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* White trainers */}
      <path d="M35 129 Q38 123 44 123 L45 129 Q41 134 35 133Z" fill="#F3E5F5" />
      <path d="M65 129 Q62 123 56 123 L55 129 Q59 134 65 133Z" fill="#F3E5F5" />
      {/* Purple skirt + white blouse */}
      <rect x="34" y="107" width="32" height="21" rx="5" fill="#CE93D8" />
      {/* Skirt hem ruffle */}
      <path d="M34 124 Q42 128 50 126 Q58 128 66 124" stroke="#AB47BC" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* White blouse */}
      <rect x="32" y="80" width="36" height="30" rx="6" fill="white" />
      {/* Blouse collar */}
      <path d="M45 80 Q50 85 55 80" stroke="#E0E0E0" strokeWidth="2" fill="none" />
      {/* Blouse buttons */}
      <circle cx="50" cy="90" r="1.3" fill="#E0E0E0" />
      <circle cx="50" cy="96" r="1.3" fill="#E0E0E0" />
      <circle cx="50" cy="102" r="1.3" fill="#E0E0E0" />
      {/* Legs */}
      <rect x="35" y="108" width="13" height="18" rx="4" fill={SK} />
      <rect x="52" y="108" width="13" height="18" rx="4" fill={SK} />
      {/* Knee socks */}
      <rect x="35" y="120" width="13" height="9" rx="3" fill="white" />
      <rect x="52" y="120" width="13" height="9" rx="3" fill="white" />
      {/* Arms */}
      <path d="M32 86 Q22 92 20 107" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M68 86 Q78 92 80 107" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="108" r="6" fill={SK} />
      <circle cx="80" cy="108" r="6" fill={SK} />
      {/* Neck */}
      <rect x="45" y="68" width="10" height="14" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="57" r="17" fill={SK} />
      <ellipse cx="33" cy="57" rx="3" ry="4" fill={SK} />
      <ellipse cx="67" cy="57" rx="3" ry="4" fill={SK} />
      {/* Hair — two braids */}
      <path d="M35 50 Q50 43 65 50 Q65 60 60 63 Q50 66 40 63 Q35 60 35 50Z" fill={HAIR} />
      {/* Left braid */}
      <path d="M35 58 Q29 65 30 75 Q31 82 30 88" stroke={HAIR} strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Right braid */}
      <path d="M65 58 Q71 65 70 75 Q69 82 70 88" stroke={HAIR} strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Braid cross-pattern */}
      <path d="M27 68 L33 72 M28 75 L33 78" stroke="#4A2F1A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M67 68 L73 72 M67 75 L73 78" stroke="#4A2F1A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Braid tips — purple ribbon */}
      <ellipse cx="30" cy="90" rx="4" ry="2.5" fill="#AB47BC" />
      <ellipse cx="70" cy="90" rx="4" ry="2.5" fill="#AB47BC" />
      {/* Eyebrows */}
      <path d="M41 53 Q45 51 48 52" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M52 52 Q55 51 59 53" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="44" cy="57" rx="4" ry="4.5" fill="white" />
      <ellipse cx="56" cy="57" rx="4" ry="4.5" fill="white" />
      <circle cx="45" cy="57" r="2.5" fill={EYE} />
      <circle cx="57" cy="57" r="2.5" fill={EYE} />
      <circle cx="46" cy="56" r="1" fill="white" />
      <circle cx="58" cy="56" r="1" fill="white" />
      <path d="M40 52 Q43 50 46 52" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M54 52 Q57 50 60 52" stroke={LASH} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cheeks */}
      <ellipse cx="36" cy="61" rx="4" ry="2.5" fill={CHK} opacity="0.25" />
      <ellipse cx="64" cy="61" rx="4" ry="2.5" fill={CHK} opacity="0.25" />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="1.8" ry="1.5" fill={SKS} />
      {/* Mouth */}
      <path d="M45 65 Q50 70 55 65" stroke={MOUTH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 3 — Teenager girl (day 30–59) ────────────────────────────────── */
export function Woman3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="135" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* White sneakers */}
      <path d="M34 128 Q37 123 44 123 L45 128 Q41 134 34 133Z" fill="#E0F7FA" />
      <path d="M66 128 Q63 123 56 123 L55 128 Q59 134 66 133Z" fill="#E0F7FA" />
      {/* Light blue jeans */}
      <rect x="35" y="103" width="13" height="24" rx="4" fill="#5C6BC0" />
      <rect x="52" y="103" width="13" height="24" rx="4" fill="#5C6BC0" />
      {/* Jean seam */}
      <path d="M41 103 L41 125" stroke="#3949AB" strokeWidth="1" opacity="0.5" />
      <path d="M59 103 L59 125" stroke="#3949AB" strokeWidth="1" opacity="0.5" />
      {/* Mint/teal top */}
      <rect x="30" y="76" width="40" height="29" rx="6" fill="#80DEEA" />
      {/* Top's subtle stripe */}
      <path d="M30 87 L70 87" stroke="#4DD0E1" strokeWidth="2" opacity="0.5" />
      {/* Belt */}
      <rect x="30" y="101" width="40" height="5" rx="2" fill="#37474F" />
      {/* Arms */}
      <path d="M30 82 Q19 88 17 104" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M70 82 Q81 88 83 104" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="105" r="6.5" fill={SK} />
      <circle cx="83" cy="105" r="6.5" fill={SK} />
      {/* Neck */}
      <rect x="45" y="64" width="10" height="14" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="53" r="16" fill={SK} />
      <ellipse cx="34" cy="53" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="53" rx="3" ry="4" fill={SK} />
      {/* Long flowing hair — center part */}
      <path d="M35 46 Q50 39 65 46 Q65 57 62 60 Q56 64 50 65 Q44 64 38 60 Q35 57 35 46Z" fill={HAIR} />
      {/* Hair flowing down sides */}
      <path d="M35 53 Q28 65 28 80 Q29 92 30 102" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M65 53 Q72 65 72 80 Q71 92 70 102" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Eyebrows — groomed */}
      <path d="M40 49 Q44 47 47 48" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M53 48 Q56 47 60 49" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="43" cy="54" rx="4" ry="4.5" fill="white" />
      <ellipse cx="57" cy="54" rx="4" ry="4.5" fill="white" />
      <circle cx="44" cy="54" r="2.5" fill={EYE} />
      <circle cx="58" cy="54" r="2.5" fill={EYE} />
      <circle cx="45" cy="53" r="1" fill="white" />
      <circle cx="59" cy="53" r="1" fill="white" />
      {/* Lashes */}
      <path d="M38 50 Q41 48 44 49" stroke={LASH} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M56 49 Q59 48 62 50" stroke={LASH} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M48.5 58 Q50 60 51.5 58" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Mouth — teen neutral */}
      <path d="M45 63 Q50 67 55 63" stroke={MOUTH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 4 — Young woman (day 60–89) ───────────────────────────────────── */
export function Woman4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="136" rx="19" ry="4" fill="black" opacity="0.07" />
      {/* Tan ankle boots */}
      <path d="M34 127 Q36 121 43 121 L44 128 Q40 134 34 133Z" fill="#8D6E63" />
      <path d="M66 127 Q64 121 57 121 L56 128 Q60 134 66 133Z" fill="#8D6E63" />
      <rect x="34" y="127" width="10" height="5" rx="1" fill="#795548" />
      <rect x="56" y="127" width="10" height="5" rx="1" fill="#795548" />
      {/* Dark trousers */}
      <rect x="34" y="103" width="14" height="22" rx="4" fill="#4A148C" />
      <rect x="52" y="103" width="14" height="22" rx="4" fill="#4A148C" />
      {/* Blush/peach top */}
      <rect x="30" y="72" width="40" height="33" rx="6" fill="#FFCCBC" />
      {/* V-neckline */}
      <path d="M44 72 L50 82 L56 72" fill="#FFCCBC" />
      <path d="M44 72 L50 80 L56 72" stroke="#FFAB91" strokeWidth="1.5" fill="none" />
      {/* Belt */}
      <rect x="30" y="100" width="40" height="5" rx="2" fill="#4A148C" />
      <rect x="46" y="99" width="8" height="7" rx="2" fill="#9C27B0" opacity="0.7" />
      {/* Arms */}
      <path d="M30 78 Q20 85 18 103" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M70 78 Q80 85 82 103" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="104" r="6.5" fill={SK} />
      <circle cx="82" cy="104" r="6.5" fill={SK} />
      {/* Neck */}
      <rect x="45" y="60" width="10" height="14" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="49" r="16" fill={SK} />
      <ellipse cx="34" cy="49" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="49" rx="3" ry="4" fill={SK} />
      {/* Hair — shoulder length, slight wave */}
      <path d="M35 42 Q50 35 65 42 Q65 53 62 57 Q56 61 50 62 Q44 61 38 57 Q35 53 35 42Z" fill={HAIR} />
      <path d="M35 50 Q30 62 30 74 Q31 83 32 92" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M65 50 Q70 62 70 74 Q69 83 68 92" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Slight wave texture */}
      <path d="M30 68 Q33 72 30 76" stroke="#1A0E08" strokeWidth="1" opacity="0.4" />
      <path d="M70 68 Q67 72 70 76" stroke="#1A0E08" strokeWidth="1" opacity="0.4" />
      {/* Eyebrows — arched */}
      <path d="M40 45 Q44 43 47 44" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M53 44 Q56 43 60 45" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="43" cy="50" rx="4.5" ry="5" fill="white" />
      <ellipse cx="57" cy="50" rx="4.5" ry="5" fill="white" />
      <circle cx="44" cy="50" r="2.8" fill={EYE} />
      <circle cx="58" cy="50" r="2.8" fill={EYE} />
      <circle cx="45" cy="49" r="1.1" fill="white" />
      <circle cx="59" cy="49" r="1.1" fill="white" />
      <path d="M38 45 Q41 43 44 45" stroke={LASH} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M56 45 Q59 43 62 45" stroke={LASH} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M48.5 54 Q50 56 51.5 54" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Confident smile */}
      <path d="M44 60 Q50 65 56 60" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 5 — Accomplished woman (day 90+) ──────────────────────────────── */
export function Woman5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="wa5" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD54F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Golden aura */}
      <ellipse cx="50" cy="90" rx="42" ry="55" fill="url(#wa5)" />
      <ellipse cx="50" cy="136" rx="20" ry="4" fill="black" opacity="0.08" />
      {/* Heeled pumps */}
      <path d="M35 126 Q38 121 44 121 L45 128 Q41 133 35 132Z" fill="#1B5E20" />
      <path d="M65 126 Q62 121 56 121 L55 128 Q59 133 65 132Z" fill="#1B5E20" />
      {/* Elegant dress — deep forest green */}
      <path d="M32 80 L31 128 Q41 134 50 133 Q59 134 69 128 L68 80 Q58 75 50 75 Q42 75 32 80Z" fill="#1B5E20" />
      {/* Dress detail — V-neckline */}
      <path d="M44 80 L50 93 L56 80" fill="#2E7D32" />
      <path d="M44 80 L50 91 L56 80" stroke="#4CAF50" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* Dress waist — gathered */}
      <path d="M32 103 Q50 107 68 103" stroke="#2E7D32" strokeWidth="2" fill="none" />
      {/* Dress shimmer lines */}
      <path d="M40 85 Q39 100 40 115" stroke="#4CAF50" strokeWidth="1" opacity="0.3" />
      <path d="M60 85 Q61 100 60 115" stroke="#4CAF50" strokeWidth="1" opacity="0.3" />
      {/* Blazer/jacket overlay */}
      <path d="M32 80 L35 105 Q42 110 50 109 Q58 110 65 105 L68 80 Q60 76 50 76 Q40 76 32 80Z" fill="#388E3C" opacity="0.0" />
      {/* Arms */}
      <path d="M32 84 Q20 92 18 110" stroke="#1B5E20" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M68 84 Q80 92 82 110" stroke="#1B5E20" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Skin wrists/hands */}
      <circle cx="17" cy="111" r="5.5" fill={SK} />
      <circle cx="83" cy="111" r="5.5" fill={SK} />
      <circle cx="17" cy="117" r="5.5" fill={SK} />
      <circle cx="83" cy="117" r="5.5" fill={SK} />
      {/* Necklace — gold chain */}
      <path d="M44 80 Q50 86 56 80" stroke="#FFD54F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="50" cy="87" r="2" fill="#FFD54F" opacity="0.9" />
      {/* Neck */}
      <rect x="45" y="63" width="10" height="13" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="51" r="16" fill={SK} />
      <ellipse cx="34" cy="51" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="51" rx="3" ry="4" fill={SK} />
      {/* Elegant upswept hair */}
      <path d="M35 44 Q50 37 65 44 Q65 54 62 57 Q56 61 50 62 Q44 61 38 57 Q35 54 35 44Z" fill={HAIR} />
      {/* Elegant updo — bun at crown */}
      <ellipse cx="50" cy="37" rx="10" ry="8" fill={HAIR} />
      {/* Bun detail */}
      <path d="M42 37 Q50 32 58 37 Q55 42 50 43 Q45 42 42 37Z" fill="#3A1F10" opacity="0.5" />
      {/* Loose strand */}
      <path d="M35 50 Q32 58 34 68" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M65 50 Q68 58 66 68" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Eyebrows — defined arch */}
      <path d="M40 47 Q44 44 47 45" stroke={BROW} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M53 45 Q56 44 60 47" stroke={BROW} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Eyes — confident, defined */}
      <ellipse cx="43" cy="52" rx="4.5" ry="5" fill="white" />
      <ellipse cx="57" cy="52" rx="4.5" ry="5" fill="white" />
      <circle cx="44" cy="52" r="2.8" fill={EYE} />
      <circle cx="58" cy="52" r="2.8" fill={EYE} />
      <circle cx="45" cy="51" r="1.1" fill="white" />
      <circle cx="59" cy="51" r="1.1" fill="white" />
      {/* Lashes — distinct */}
      <path d="M38 47 Q41 45 44 47" stroke={LASH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M56 47 Q59 45 62 47" stroke={LASH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyeliner flick */}
      <path d="M47 49 Q48 47 50 47 Q52 47 53 49" stroke={LASH} strokeWidth="1" fill="none" opacity="0.6" />
      {/* Nose */}
      <path d="M48.5 56 Q50 58 51.5 56" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Warm confident smile */}
      <path d="M44 62 Q50 68 56 62" stroke={MOUTH} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Subtle golden aura ring */}
      <ellipse cx="50" cy="90" rx="44" ry="58" stroke="#FFD54F" strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeDasharray="4 3" />
    </svg>
  );
}

export const WOMAN_STAGES = [Woman0, Woman1, Woman2, Woman3, Woman4, Woman5] as const;

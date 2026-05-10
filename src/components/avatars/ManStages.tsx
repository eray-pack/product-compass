// Man companion — 6 life stages from baby to successful adult.
// viewBox 0 0 100 140. Ground line at y≈132. Characters scale up stage by stage.

type P = { className?: string };
const V = "0 0 100 140";

const SK  = "#F5C9A0"; // skin main
const SKS = "#E8A87C"; // skin shadow
const SKH = "#FAD7B5"; // skin highlight
const HAIR = "#2C1810";// dark hair
const EYE  = "#3E2723";// eye iris
const MOUTH = "#C17A6A";
const CHK  = "#FF8A80"; // blush
const BROW = "#2C1810";

/* ── Stage 0 — Baby (day 0–6) ───────────────────────────────────────────── */
export function Man0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      {/* Ground shadow */}
      <ellipse cx="50" cy="134" rx="20" ry="4" fill="black" opacity="0.07" />
      {/* Sitting legs */}
      <path d="M38 122 Q32 117 28 122 Q32 130 40 128Z" fill={SK} />
      <path d="M62 122 Q68 117 72 122 Q68 130 60 128Z" fill={SK} />
      {/* Feet */}
      <ellipse cx="26" cy="127" rx="8" ry="5.5" fill={SK} />
      <ellipse cx="74" cy="127" rx="8" ry="5.5" fill={SK} />
      {/* Body — yellow onesie */}
      <ellipse cx="50" cy="113" rx="17" ry="15" fill="#FFF9C4" />
      {/* Onesie pocket accent */}
      <rect x="44" y="107" width="12" height="9" rx="3" fill="#B3E5FC" opacity="0.7" />
      {/* Diaper snap */}
      <path d="M34 124 Q50 134 66 124 Q62 116 50 116 Q38 116 34 124Z" fill="#E8EAF6" />
      {/* Arms — chubby */}
      <path d="M34 108 Q27 107 24 116" stroke={SK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M66 108 Q73 107 76 116" stroke={SK} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="23" cy="117" r="5.5" fill={SK} />
      <circle cx="77" cy="117" r="5.5" fill={SK} />
      {/* Neck */}
      <rect x="46" y="93" width="8" height="8" rx="3.5" fill={SK} />
      {/* Head — very big */}
      <circle cx="50" cy="80" r="24" fill={SK} />
      <ellipse cx="26" cy="80" rx="4.5" ry="5.5" fill={SK} />
      <ellipse cx="74" cy="80" rx="4.5" ry="5.5" fill={SK} />
      {/* Ear inner */}
      <ellipse cx="26" cy="80" rx="2.5" ry="3.5" fill={SKS} opacity="0.35" />
      <ellipse cx="74" cy="80" rx="2.5" ry="3.5" fill={SKS} opacity="0.35" />
      {/* Hair tuft */}
      <path d="M43 58 Q50 53 57 58" stroke={HAIR} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Eyebrows */}
      <path d="M40 72 Q44 70 47 71" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M53 71 Q56 70 60 72" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes — big baby */}
      <ellipse cx="42" cy="78" rx="5.5" ry="6" fill="white" />
      <ellipse cx="58" cy="78" rx="5.5" ry="6" fill="white" />
      <circle cx="43" cy="78" r="3" fill={EYE} />
      <circle cx="59" cy="78" r="3" fill={EYE} />
      <circle cx="44" cy="76.5" r="1.2" fill="white" />
      <circle cx="60" cy="76.5" r="1.2" fill="white" />
      {/* Cheeks */}
      <ellipse cx="31" cy="85" rx="5.5" ry="3.5" fill={CHK} opacity="0.38" />
      <ellipse cx="69" cy="85" rx="5.5" ry="3.5" fill={CHK} opacity="0.38" />
      {/* Nose */}
      <ellipse cx="50" cy="83" rx="2.5" ry="2" fill={SKS} />
      {/* Smile — big open grin */}
      <path d="M43 89 Q50 97 57 89" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 1 — Toddler (day 7–13) ───────────────────────────────────────── */
export function Man1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="134" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* Shoes */}
      <ellipse cx="40" cy="132" rx="9" ry="5" fill="#4E342E" />
      <ellipse cx="60" cy="132" rx="9" ry="5" fill="#4E342E" />
      {/* Legs — short chubby */}
      <rect x="33" y="113" width="14" height="20" rx="5" fill="#1565C0" />
      <rect x="53" y="113" width="14" height="20" rx="5" fill="#1565C0" />
      {/* Body — red t-shirt, blue shorts */}
      <rect x="32" y="90" width="36" height="26" rx="7" fill="#EF5350" />
      {/* Shorts */}
      <rect x="32" y="107" width="16" height="10" rx="4" fill="#1565C0" />
      <rect x="52" y="107" width="16" height="10" rx="4" fill="#1565C0" />
      {/* Arms */}
      <path d="M32 96 Q22 100 20 112" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M68 96 Q78 100 80 112" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="113" r="6" fill={SK} />
      <circle cx="80" cy="113" r="6" fill={SK} />
      {/* Neck */}
      <rect x="45" y="78" width="10" height="14" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="67" r="19" fill={SK} />
      <ellipse cx="31" cy="67" rx="3.5" ry="4.5" fill={SK} />
      <ellipse cx="69" cy="67" rx="3.5" ry="4.5" fill={SK} />
      <ellipse cx="31" cy="67" rx="2" ry="3" fill={SKS} opacity="0.3" />
      <ellipse cx="69" cy="67" rx="2" ry="3" fill={SKS} opacity="0.3" />
      {/* Hair */}
      <path d="M34 54 Q50 47 66 54 Q64 63 50 63 Q36 63 34 54Z" fill={HAIR} />
      {/* Eyebrows */}
      <path d="M40 62 Q44 60 47 61" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M53 61 Q56 60 60 62" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="43" cy="66" rx="4.5" ry="5" fill="white" />
      <ellipse cx="57" cy="66" rx="4.5" ry="5" fill="white" />
      <circle cx="44" cy="66" r="2.5" fill={EYE} />
      <circle cx="58" cy="66" r="2.5" fill={EYE} />
      <circle cx="45" cy="65" r="1" fill="white" />
      <circle cx="59" cy="65" r="1" fill="white" />
      {/* Cheeks */}
      <ellipse cx="35" cy="71" rx="5" ry="3" fill={CHK} opacity="0.35" />
      <ellipse cx="65" cy="71" rx="5" ry="3" fill={CHK} opacity="0.35" />
      {/* Nose */}
      <ellipse cx="50" cy="70" rx="2" ry="1.7" fill={SKS} />
      {/* Mouth */}
      <path d="M44 76 Q50 82 56 76" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 2 — Child (day 14–29) ─────────────────────────────────────────── */
export function Man2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="135" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* Shoes */}
      <path d="M36 130 Q38 126 43 126 L43 130 Q40 133 36 133Z" fill="#37474F" />
      <path d="M64 130 Q62 126 57 126 L57 130 Q60 133 64 133Z" fill="#37474F" />
      {/* Legs */}
      <rect x="35" y="108" width="13" height="22" rx="4" fill="#546E7A" />
      <rect x="52" y="108" width="13" height="22" rx="4" fill="#546E7A" />
      {/* Polo shirt */}
      <rect x="31" y="82" width="38" height="28" rx="6" fill="#42A5F5" />
      {/* Polo collar */}
      <path d="M46 82 L50 88 L54 82" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
      {/* Belt */}
      <rect x="31" y="106" width="38" height="5" rx="2" fill="#37474F" />
      {/* Arms */}
      <path d="M31 88 Q22 93 20 107" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M69 88 Q78 93 80 107" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="108" r="6" fill={SK} />
      <circle cx="80" cy="108" r="6" fill={SK} />
      {/* Neck */}
      <rect x="45" y="70" width="10" height="14" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="59" r="17" fill={SK} />
      <ellipse cx="33" cy="59" rx="3" ry="4" fill={SK} />
      <ellipse cx="67" cy="59" rx="3" ry="4" fill={SK} />
      {/* Hair — boyish cut */}
      <path d="M35 51 Q50 44 65 51 Q65 60 60 62 Q50 65 40 62 Q35 60 35 51Z" fill={HAIR} />
      {/* Side part */}
      <path d="M44 47 Q46 53 46 62" stroke="#1A0E08" strokeWidth="1" opacity="0.4" />
      {/* Eyebrows */}
      <path d="M41 55 Q45 53 48 54" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M52 54 Q55 53 59 55" stroke={BROW} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="44" cy="59" rx="4" ry="4.5" fill="white" />
      <ellipse cx="56" cy="59" rx="4" ry="4.5" fill="white" />
      <circle cx="45" cy="59" r="2.5" fill={EYE} />
      <circle cx="57" cy="59" r="2.5" fill={EYE} />
      <circle cx="46" cy="58" r="1" fill="white" />
      <circle cx="58" cy="58" r="1" fill="white" />
      {/* Cheeks faint */}
      <ellipse cx="36" cy="63" rx="4" ry="2.5" fill={CHK} opacity="0.2" />
      <ellipse cx="64" cy="63" rx="4" ry="2.5" fill={CHK} opacity="0.2" />
      {/* Nose */}
      <ellipse cx="50" cy="62" rx="1.8" ry="1.5" fill={SKS} />
      {/* Mouth */}
      <path d="M45 67 Q50 72 55 67" stroke={MOUTH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 3 — Teenager (day 30–59) ─────────────────────────────────────── */
export function Man3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="135" rx="18" ry="4" fill="black" opacity="0.07" />
      {/* Sneakers */}
      <path d="M34 128 Q37 123 43 123 L44 128 Q41 133 35 132Z" fill="#BDBDBD" />
      <path d="M66 128 Q63 123 57 123 L56 128 Q59 133 65 132Z" fill="#BDBDBD" />
      <rect x="34" y="128" width="10" height="4" rx="1" fill="white" opacity="0.7" />
      <rect x="56" y="128" width="10" height="4" rx="1" fill="white" opacity="0.7" />
      {/* Jeans */}
      <rect x="35" y="104" width="13" height="22" rx="4" fill="#283593" />
      <rect x="52" y="104" width="13" height="22" rx="4" fill="#283593" />
      {/* Hoodie — dark grey, slightly slouched (offset right side down) */}
      <rect x="30" y="76" width="40" height="31" rx="7" fill="#37474F" />
      {/* Hood at back */}
      <path d="M38 76 Q50 70 62 76" stroke="#37474F" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Kangaroo pocket */}
      <rect x="39" y="92" width="22" height="12" rx="4" fill="#263238" />
      {/* Waistband */}
      <rect x="30" y="103" width="40" height="5" rx="2" fill="#263238" />
      {/* Arms — slightly longer, casual hang */}
      <path d="M30 82 Q19 88 17 105" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M70 82 Q81 88 83 105" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="106" r="6.5" fill={SK} />
      <circle cx="83" cy="106" r="6.5" fill={SK} />
      {/* Neck */}
      <rect x="45" y="65" width="10" height="13" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="53" r="16" fill={SK} />
      <ellipse cx="34" cy="53" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="53" rx="3" ry="4" fill={SK} />
      {/* Teen hair — longer, slightly messy */}
      <path d="M34 45 Q50 38 66 45 Q67 55 64 58 Q58 62 50 63 Q42 62 36 58 Q33 55 34 45Z" fill={HAIR} />
      {/* Fringe dip at front */}
      <path d="M38 45 Q44 50 50 49 Q56 50 62 45" stroke="#1A0E08" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Eyebrows — slightly furrowed teen */}
      <path d="M40 50 Q44 48 47 49" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M53 49 Q56 48 60 50" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="43" cy="54" rx="4" ry="4.5" fill="white" />
      <ellipse cx="57" cy="54" rx="4" ry="4.5" fill="white" />
      <circle cx="44" cy="54" r="2.5" fill={EYE} />
      <circle cx="58" cy="54" r="2.5" fill={EYE} />
      <circle cx="45" cy="53" r="1" fill="white" />
      <circle cx="59" cy="53" r="1" fill="white" />
      {/* Nose */}
      <path d="M49 58 Q50 60 51 58" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Mouth — neutral teen */}
      <path d="M45 63 Q50 66 55 63" stroke={MOUTH} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 4 — Young adult (day 60–89) ──────────────────────────────────── */
export function Man4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <ellipse cx="50" cy="136" rx="19" ry="4" fill="black" opacity="0.07" />
      {/* White sneakers */}
      <path d="M33 128 Q36 122 43 122 L44 128 Q41 134 34 133Z" fill="#ECEFF1" />
      <path d="M67 128 Q64 122 57 122 L56 128 Q59 134 66 133Z" fill="#ECEFF1" />
      <path d="M33 128 Q38 126 44 126" stroke="#9E9E9E" strokeWidth="1" />
      <path d="M67 128 Q62 126 56 126" stroke="#9E9E9E" strokeWidth="1" />
      {/* Dark jeans */}
      <rect x="34" y="103" width="14" height="24" rx="4" fill="#1A237E" />
      <rect x="52" y="103" width="14" height="24" rx="4" fill="#1A237E" />
      {/* Belt */}
      <rect x="32" y="100" width="36" height="5" rx="2" fill="#212121" />
      <rect x="47" y="99" width="6" height="7" rx="1.5" fill="#9E9E9E" />
      {/* White t-shirt */}
      <rect x="30" y="72" width="40" height="31" rx="7" fill="#ECEFF1" />
      {/* Collar */}
      <path d="M44 72 Q50 78 56 72" stroke="#CFD8DC" strokeWidth="2" strokeLinejoin="round" fill="none" />
      {/* Arms — confident hang */}
      <path d="M30 78 Q20 85 18 103" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M70 78 Q80 85 82 103" stroke={SK} strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="104" r="6.5" fill={SK} />
      <circle cx="82" cy="104" r="6.5" fill={SK} />
      {/* Neck */}
      <rect x="45" y="61" width="10" height="13" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="50" r="16" fill={SK} />
      <ellipse cx="34" cy="50" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="50" rx="3" ry="4" fill={SK} />
      {/* Modern haircut — textured top, fade sides */}
      <path d="M36 43 Q50 36 64 43 Q64 52 60 55 Q55 58 50 58 Q45 58 40 55 Q36 52 36 43Z" fill={HAIR} />
      <path d="M38 43 Q44 47 50 46 Q56 47 62 43" stroke="#1A0E08" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Eyebrows */}
      <path d="M41 47 Q45 45 48 46" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M52 46 Q55 45 59 47" stroke={BROW} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Eyes — alert, confident */}
      <ellipse cx="44" cy="51" rx="4" ry="4.5" fill="white" />
      <ellipse cx="56" cy="51" rx="4" ry="4.5" fill="white" />
      <circle cx="44.5" cy="51" r="2.5" fill={EYE} />
      <circle cx="56.5" cy="51" r="2.5" fill={EYE} />
      <circle cx="45.5" cy="50" r="1" fill="white" />
      <circle cx="57.5" cy="50" r="1" fill="white" />
      {/* Nose */}
      <path d="M48.5 55 Q50 57 51.5 55" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Confident slight smile */}
      <path d="M45 61 Q50 65 55 61" stroke={MOUTH} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ── Stage 5 — Successful man (day 90+) ─────────────────────────────────── */
export function Man5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="ma5" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFD54F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Golden aura */}
      <ellipse cx="50" cy="90" rx="42" ry="55" fill="url(#ma5)" />
      <ellipse cx="50" cy="136" rx="20" ry="4" fill="black" opacity="0.08" />
      {/* Black dress shoes */}
      <path d="M32 127 Q35 121 43 121 L44 127 Q41 134 33 133Z" fill="#212121" />
      <path d="M68 127 Q65 121 57 121 L56 127 Q59 134 67 133Z" fill="#212121" />
      <path d="M32 127 Q38 124 44 124" stroke="#424242" strokeWidth="1" />
      <path d="M68 127 Q62 124 56 124" stroke="#424242" strokeWidth="1" />
      {/* Suit trousers */}
      <rect x="33" y="101" width="14" height="24" rx="4" fill="#37474F" />
      <rect x="53" y="101" width="14" height="24" rx="4" fill="#37474F" />
      {/* Suit jacket */}
      <path d="M28 70 L29 104 Q34 108 50 108 Q66 108 71 104 L72 70 Q62 66 50 66 Q38 66 28 70Z" fill="#37474F" />
      {/* Lapels */}
      <path d="M50 70 L44 80 L40 70" fill="#455A64" />
      <path d="M50 70 L56 80 L60 70" fill="#455A64" />
      {/* White shirt + tie */}
      <path d="M44 70 L50 100 L56 70" fill="#FAFAFA" />
      {/* Tie */}
      <path d="M50 72 L47 86 L50 88 L53 86 L50 72Z" fill="#B71C1C" />
      <path d="M48.5 86 L50 95 L51.5 86Z" fill="#B71C1C" />
      {/* Jacket buttons */}
      <circle cx="50" cy="94" r="1.5" fill="#546E7A" />
      <circle cx="50" cy="100" r="1.5" fill="#546E7A" />
      {/* Pocket square */}
      <path d="M62 74 L65 74 L65 78 L62 76Z" fill="#FAFAFA" />
      {/* Arms — strong shoulders, suit sleeves */}
      <path d="M28 74 Q16 82 14 102" stroke="#37474F" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M72 74 Q84 82 86 102" stroke="#37474F" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* Shirt cuffs */}
      <circle cx="14" cy="103" r="5" fill="#FAFAFA" />
      <circle cx="86" cy="103" r="5" fill="#FAFAFA" />
      {/* Hands */}
      <circle cx="14" cy="109" r="5.5" fill={SK} />
      <circle cx="86" cy="109" r="5.5" fill={SK} />
      {/* Neck */}
      <rect x="45" y="59" width="10" height="9" rx="4" fill={SK} />
      {/* Head */}
      <circle cx="50" cy="48" r="16" fill={SK} />
      <ellipse cx="34" cy="48" rx="3" ry="4" fill={SK} />
      <ellipse cx="66" cy="48" rx="3" ry="4" fill={SK} />
      {/* Short professional hair */}
      <path d="M36 41 Q50 34 64 41 Q64 50 60 53 Q55 55 50 56 Q45 55 40 53 Q36 50 36 41Z" fill={HAIR} />
      {/* Eyebrows — confident, arched */}
      <path d="M40 45 Q44 43 47 44" stroke={BROW} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M53 44 Q56 43 60 45" stroke={BROW} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Eyes — determined */}
      <ellipse cx="43" cy="49" rx="4" ry="4.5" fill="white" />
      <ellipse cx="57" cy="49" rx="4" ry="4.5" fill="white" />
      <circle cx="44" cy="49" r="2.5" fill={EYE} />
      <circle cx="58" cy="49" r="2.5" fill={EYE} />
      <circle cx="45" cy="48" r="1" fill="white" />
      <circle cx="59" cy="48" r="1" fill="white" />
      {/* Nose */}
      <path d="M48.5 53 Q50 55.5 51.5 53" stroke={SKS} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Confident smile */}
      <path d="M44 59 Q50 64 56 59" stroke={MOUTH} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Subtle golden glow rim around figure */}
      <ellipse cx="50" cy="90" rx="44" ry="58" stroke="#FFD54F" strokeWidth="1.5" strokeOpacity="0.3" fill="none" strokeDasharray="4 3" />
    </svg>
  );
}

export const MAN_STAGES = [Man0, Man1, Man2, Man3, Man4, Man5] as const;

// Man companion — 6 adult recovery stages: disheveled → peak.
// viewBox 0 0 100 140. Head center (50,37) r=14.
// Eyes: cx=44/56, cy=35 — horizontal adult proportions (rx=3.5, ry=2.3).
// Eyelid crease is skin-tone (#C09070), never dark — no mask/patch look.
// Hair: filled cap shapes only, no thin strands above hairline.
// idle-breathe CSS class on main <g> for slow breathing bob animation.

type P = { className?: string };
const V   = "0 0 100 140";
const SK  = "#F0C090"; // skin base
const SKD = "#D4956A"; // skin shadow / ears
const HAIR = "#1C1208"; // near-black dark brown
const LIP  = "#C07060";

// ── Shared face features — drawn AFTER hair so they appear on top ─────────────
function ManFace({
  tired = false,
  browsKnit = false,
  mouth,
}: {
  tired?: boolean;
  browsKnit?: boolean;
  mouth: string; // SVG path `d` for the mouth stroke
}) {
  return (
    <>
      {/* Under-eye exhaustion shadows (stage 0 only) */}
      {tired && (
        <>
          <ellipse cx="44" cy="37.5" rx="3.2" ry="1.3" fill="#6080A0" opacity="0.17" />
          <ellipse cx="56" cy="37.5" rx="3.2" ry="1.3" fill="#6080A0" opacity="0.17" />
        </>
      )}

      {/* Eyebrows */}
      <path
        d={browsKnit ? "M41 30.5 Q44.5 29.2 47.5 30.5" : "M41 30.8 Q44.5 28.8 47.5 30.5"}
        stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"
      />
      <path
        d={browsKnit ? "M52.5 30.5 Q55.5 29.2 59 30.5" : "M52.5 30.5 Q55.5 28.8 59 30.8"}
        stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"
      />

      {/* Eyes — horizontal adult proportions (rx=3.5, ry=2.3 → wider than tall) */}
      <ellipse cx="44" cy="35" rx="3.5" ry="2.3" fill="white" />
      <ellipse cx="56" cy="35" rx="3.5" ry="2.3" fill="white" />
      {/* Iris */}
      <circle cx="44" cy="35" r="1.8" fill="#3D2010" />
      <circle cx="56" cy="35" r="1.8" fill="#3D2010" />
      {/* Pupil */}
      <circle cx="44" cy="35" r="0.85" fill="#0A0705" />
      <circle cx="56" cy="35" r="0.85" fill="#0A0705" />
      {/* Catchlight */}
      <circle cx="43.2" cy="34.3" r="0.65" fill="white" />
      <circle cx="55.2" cy="34.3" r="0.65" fill="white" />
      {/* Upper eyelid crease — skin tone ONLY, never dark hair colour.
          This is the key fix: dark (#1C1208) lids at 0.5 opacity created the
          raccoon-mask look. Skin tone (#C09070) looks like a natural lid fold. */}
      <path d="M40.5 33.2 Q44 32.1 47.5 33.2" stroke="#C09070" strokeWidth="0.9" fill="none" opacity="0.5" />
      <path d="M52.5 33.2 Q56 32.1 59.5 33.2" stroke="#C09070" strokeWidth="0.9" fill="none" opacity="0.5" />

      {/* Nose — subtle nostrils + bridge */}
      <ellipse cx="47.5" cy="42" rx="1.2" ry="0.8" fill="#C4906A" opacity="0.32" />
      <ellipse cx="52.5" cy="42" rx="1.2" ry="0.8" fill="#C4906A" opacity="0.32" />
      <path d="M48.5 40.5 Q50 41.5 51.5 40.5" stroke="#C4906A" strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.32" />

      {/* Mouth */}
      <path d={mouth} stroke={LIP} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  );
}

/* ── Stage 0 — Disheveled (day 0–6) ─────────────────────────────────────── */
export function Man0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m0f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m0h" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#3A2414" />
          <stop offset="100%" stopColor="#1C1208" />
        </linearGradient>
        <linearGradient id="m0c" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%"   stopColor="#757575" />
          <stop offset="100%" stopColor="#424242" />
        </linearGradient>
      </defs>

      {/* Ground shadow — stays static outside the breathing group */}
      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.13" />

      {/* Everything else bobs gently with idle-breathe */}
      <g className="idle-breathe">
        {/* Shoes — worn dark grey */}
        <path d="M32 128 Q36 123 43 123 L44 130 Q41 135 33 135Z" fill="#424242" />
        <path d="M68 128 Q64 123 57 123 L56 130 Q59 135 67 135Z" fill="#424242" />
        {/* Sweatpants */}
        <rect x="34" y="100" width="13" height="27" rx="4" fill="#555555" />
        <rect x="53" y="100" width="13" height="27" rx="4" fill="#555555" />
        {/* Hoodie body */}
        <path d="M30 63 L29 104 Q38 108 50 107 Q62 108 71 104 L70 63 Q61 59 50 59 Q39 59 30 63Z" fill="url(#m0c)" />
        <rect x="37" y="80" width="26" height="17" rx="4" fill="#424242" opacity="0.6" />
        <path d="M47 63 Q50 67 53 63" stroke="#9E9E9E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
        {/* Arms */}
        <path d="M30 67 Q18 76 16 98" stroke="#616161" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M70 67 Q82 76 84 98" stroke="#616161" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="15" cy="99" rx="6" ry="5.5" fill={SKD} />
        <ellipse cx="85" cy="99" rx="6" ry="5.5" fill={SKD} />
        {/* Neck */}
        <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK} />
        {/* Ears (drawn before head so head covers the inner portion) */}
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        {/* Head */}
        <circle cx="50" cy="37" r="14" fill="url(#m0f)" />

        {/* Disheveled hair — single filled cap with natural wavy top.
            Wavy top shape (not separate strands) gives messy look without antennae. */}
        <path
          d="M36 30 Q37 20 42 17 Q46 14 50 16 Q54 14 58 17 Q63 20 64 30 Q63 36 59 38 Q50 40 41 38 Q37 36 36 30Z"
          fill="url(#m0h)"
        />

        {/* Face */}
        <ManFace tired browsKnit mouth="M46 47 Q50 46 54 47" />
      </g>
    </svg>
  );
}

/* ── Stage 1 — Early recovery (day 7–13) ────────────────────────────────── */
export function Man1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m1f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m1shirt" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#3949AB" />
          <stop offset="100%" stopColor="#1A237E" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12" />

      <g className="idle-breathe">
        {/* Sneakers */}
        <path d="M33 128 Q37 123 44 123 L45 130 Q41 135 34 135Z" fill="#ECEFF1" />
        <path d="M67 128 Q63 123 56 123 L55 130 Q59 135 66 135Z" fill="#ECEFF1" />
        <path d="M33 129 Q38 127 45 127" stroke="#B0BEC5" strokeWidth="0.8" fill="none" />
        <path d="M67 129 Q62 127 55 127" stroke="#B0BEC5" strokeWidth="0.8" fill="none" />
        {/* Joggers */}
        <rect x="34" y="100" width="13" height="27" rx="4" fill="#546E7A" />
        <rect x="53" y="100" width="13" height="27" rx="4" fill="#546E7A" />
        <rect x="34" y="100" width="32" height="5" rx="2" fill="#455A64" />
        {/* Navy tee */}
        <path d="M30 62 L29 103 Q38 107 50 106 Q62 107 71 103 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#m1shirt)" />
        <path d="M44 62 Q50 67 56 62" stroke="#3949AB" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* Arms */}
        <path d="M30 66 Q19 75 17 98" stroke="#1A237E" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M70 66 Q81 75 83 98" stroke="#1A237E" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="16" cy="99" rx="6" ry="5.5" fill={SKD} />
        <ellipse cx="84" cy="99" rx="6" ry="5.5" fill={SKD} />
        {/* Neck */}
        <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK} />
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        <circle cx="50" cy="37" r="14" fill="url(#m1f)" />

        {/* Hair — slightly unkempt but no antennae.
            Side shapes suggest a bit of puffiness at the temples. */}
        <path
          d="M36 30 Q38 20 43 18 Q47 16 50 17 Q53 16 57 18 Q62 20 64 30 Q63 36 59 38 Q50 40 41 38 Q37 36 36 30Z"
          fill={HAIR}
        />
        {/* Slight side tufts — filled, close to the hairline */}
        <path d="M36 30 Q34 25 35 21 Q38 20 39 24Z" fill={HAIR} />
        <path d="M64 30 Q66 25 65 21 Q62 20 61 24Z" fill={HAIR} />

        {/* Faint dark circles — fading */}
        <ellipse cx="44" cy="37.5" rx="3.2" ry="1.3" fill="#6080A0" opacity="0.10" />
        <ellipse cx="56" cy="37.5" rx="3.2" ry="1.3" fill="#6080A0" opacity="0.10" />

        <ManFace mouth="M46 47 Q50 47.5 54 47" />
      </g>
    </svg>
  );
}

/* ── Stage 2 — Clean casual (day 14–29) ─────────────────────────────────── */
export function Man2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m2f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m2j" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12" />

      <g className="idle-breathe">
        {/* Clean white sneakers */}
        <path d="M33 128 Q37 123 44 123 L45 130 Q41 135 34 135Z" fill="#F5F5F5" />
        <path d="M67 128 Q63 123 56 123 L55 130 Q59 135 66 135Z" fill="#F5F5F5" />
        <path d="M33 130 Q38 128 45 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none" />
        <path d="M67 130 Q62 128 55 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none" />
        {/* Dark jeans */}
        <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m2j)" />
        <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m2j)" />
        <rect x="32" y="99" width="36" height="4" rx="2" fill="#212121" />
        <rect x="47" y="98" width="6" height="6" rx="1.5" fill="#9E9E9E" />
        {/* White tee */}
        <path d="M30 62 L29 102 Q38 106 50 105 Q62 106 71 102 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="#FAFAFA" />
        <path d="M44 62 Q50 67 56 62" stroke="#E0E0E0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M50 68 L50 90" stroke="#E8E8E8" strokeWidth="0.8" fill="none" opacity="0.6" />
        {/* Arms */}
        <path d="M30 66 Q19 75 17 98" stroke="#F5F5F5" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M70 66 Q81 75 83 98" stroke="#F5F5F5" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="16" cy="99" rx="6" ry="5.5" fill={SKD} />
        <ellipse cx="84" cy="99" rx="6" ry="5.5" fill={SKD} />
        {/* Neck */}
        <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK} />
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        <circle cx="50" cy="37" r="14" fill="url(#m2f)" />

        {/* Neat short hair with side part — smooth cap, no sticking-up strands */}
        <path d="M36 29 Q50 21 64 29 Q63 35 59 38 Q50 40 41 38 Q37 35 36 29Z" fill={HAIR} />
        {/* Side part line */}
        <path d="M44 23 Q45 29 45 36" stroke="#0E0804" strokeWidth="0.8" fill="none" opacity="0.3" />

        <ManFace mouth="M46 47 Q50 48.5 54 47" />
      </g>
    </svg>
  );
}

/* ── Stage 3 — Smart casual (day 30–59) ─────────────────────────────────── */
export function Man3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m3f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m3s" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%"   stopColor="#3949AB" />
          <stop offset="100%" stopColor="#283593" />
        </linearGradient>
        <linearGradient id="m3p" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#C8B48A" />
          <stop offset="100%" stopColor="#A89060" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12" />

      <g className="idle-breathe">
        {/* Oxford shoes */}
        <path d="M32 128 Q36 123 43 123 L44 130 Q40 135 33 135Z" fill="#3E2723" />
        <path d="M68 128 Q64 123 57 123 L56 130 Q60 135 67 135Z" fill="#3E2723" />
        <path d="M32 129 Q37 127 44 127" stroke="#4E342E" strokeWidth="1" fill="none" />
        <path d="M68 129 Q63 127 56 127" stroke="#4E342E" strokeWidth="1" fill="none" />
        {/* Chino trousers */}
        <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m3p)" />
        <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m3p)" />
        <rect x="32" y="98" width="36" height="4" rx="2" fill="#3E2723" />
        <rect x="47" y="97" width="6" height="6" rx="1.5" fill="#A0522D" opacity="0.8" />
        {/* Navy button-up shirt */}
        <path d="M30 62 L29 101 Q38 105 50 104 Q62 105 71 101 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#m3s)" />
        <path d="M44 62 L50 69 L56 62" fill="#3949AB" />
        <path d="M44 62 L50 67 L56 62" stroke="#5C6BC0" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="50" cy="77" r="1.2" fill="#5C6BC0" opacity="0.6" />
        <circle cx="50" cy="85" r="1.2" fill="#5C6BC0" opacity="0.6" />
        <circle cx="50" cy="93" r="1.2" fill="#5C6BC0" opacity="0.6" />
        {/* Arms */}
        <path d="M30 66 Q19 75 17 98" stroke="#283593" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M70 66 Q81 75 83 98" stroke="#283593" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="16" cy="99" rx="5.5" ry="5" fill="#3949AB" opacity="0.7" />
        <ellipse cx="84" cy="99" rx="5.5" ry="5" fill="#3949AB" opacity="0.7" />
        <ellipse cx="16" cy="100" rx="5" ry="4.5" fill={SKD} />
        <ellipse cx="84" cy="100" rx="5" ry="4.5" fill={SKD} />
        {/* Neck */}
        <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK} />
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        <circle cx="50" cy="37" r="14" fill="url(#m3f)" />

        {/* Short neat hair with clean fade at sides */}
        <path d="M36 29 Q50 21 64 29 Q63 35 59 38 Q50 40 41 38 Q37 35 36 29Z" fill={HAIR} />
        <path d="M36 29 Q37 34 37 38" stroke={HAIR} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M64 29 Q63 34 63 38" stroke={HAIR} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />

        <ManFace mouth="M46 47 Q50 49 54 47" />
      </g>
    </svg>
  );
}

/* ── Stage 4 — Professional (day 60–89) ─────────────────────────────────── */
export function Man4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m4f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m4b" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%"   stopColor="#546E7A" />
          <stop offset="100%" stopColor="#37474F" />
        </linearGradient>
        <linearGradient id="m4t" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#455A64" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.13" />

      <g className="idle-breathe">
        {/* Black Oxford shoes */}
        <path d="M32 128 Q36 122 43 122 L44 130 Q40 135 33 135Z" fill="#212121" />
        <path d="M68 128 Q64 122 57 122 L56 130 Q60 135 67 135Z" fill="#212121" />
        <path d="M32 128 Q37 126 44 126" stroke="#37474F" strokeWidth="0.9" fill="none" />
        <path d="M68 128 Q63 126 56 126" stroke="#37474F" strokeWidth="0.9" fill="none" />
        {/* Dark trousers with crease */}
        <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m4t)" />
        <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m4t)" />
        <path d="M40.5 103 L40.5 127" stroke="#455A64" strokeWidth="0.8" fill="none" opacity="0.45" />
        <path d="M59.5 103 L59.5 127" stroke="#455A64" strokeWidth="0.8" fill="none" opacity="0.45" />
        {/* Blazer */}
        <path d="M27 62 L26 103 Q36 108 50 107 Q64 108 74 103 L73 62 Q62 57 50 57 Q38 57 27 62Z" fill="url(#m4b)" />
        <path d="M50 62 L44 78 L40 62" fill="#455A64" />
        <path d="M50 62 L56 78 L60 62" fill="#455A64" />
        <path d="M44 70 L40 62" stroke="#37474F" strokeWidth="0.8" fill="none" />
        <path d="M56 70 L60 62" stroke="#37474F" strokeWidth="0.8" fill="none" />
        <path d="M44 62 L50 99 L56 62" fill="#F8F8F8" />
        <circle cx="50" cy="76" r="1.2" fill="#CFD8DC" />
        <circle cx="50" cy="84" r="1.2" fill="#CFD8DC" />
        <circle cx="50" cy="92" r="1.2" fill="#CFD8DC" />
        {/* Arms — blazer sleeves */}
        <path d="M27 66 Q15 76 13 100" stroke="#37474F" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M73 66 Q85 76 87 100" stroke="#37474F" strokeWidth="15" strokeLinecap="round" fill="none" />
        <ellipse cx="12" cy="101" rx="6" ry="5.5" fill="#F8F8F8" />
        <ellipse cx="88" cy="101" rx="6" ry="5.5" fill="#F8F8F8" />
        <ellipse cx="12" cy="107" rx="5.5" ry="5.5" fill={SK} />
        <ellipse cx="88" cy="107" rx="5.5" ry="5.5" fill={SK} />
        {/* Neck */}
        <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK} />
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        <circle cx="50" cy="37" r="14" fill="url(#m4f)" />

        {/* Short professional hair */}
        <path d="M36 29 Q50 21 64 29 Q63 35 60 38 Q50 40 40 38 Q37 35 36 29Z" fill={HAIR} />

        <ManFace mouth="M46 47 Q50 49.5 54 47" />
      </g>
    </svg>
  );
}

/* ── Stage 5 — Peak: charcoal suit + red tie (day 90+) ──────────────────── */
export function Man5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m5f" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#FAD4B0" />
          <stop offset="55%"  stopColor="#F0C090" />
          <stop offset="100%" stopColor="#C8845A" />
        </radialGradient>
        <linearGradient id="m5suit" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%"   stopColor="#546E7A" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
        <linearGradient id="m5leg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#455A64" />
          <stop offset="100%" stopColor="#263238" />
        </linearGradient>
        <radialGradient id="m5aura" cx="50%" cy="68%" r="52%">
          <stop offset="0%"   stopColor="#FFD54F" stopOpacity="0.32" />
          <stop offset="70%"  stopColor="#FFB300" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Golden aura behind figure */}
      <ellipse cx="50" cy="95" rx="45" ry="58" fill="url(#m5aura)" />
      <ellipse cx="50" cy="137" rx="23" ry="3.5" fill="black" opacity="0.14" />

      <g className="idle-breathe">
        {/* Black dress shoes */}
        <path d="M31 128 Q35 122 43 122 L44 131 Q40 136 32 135Z" fill="#1A1A1A" />
        <path d="M69 128 Q65 122 57 122 L56 131 Q60 136 68 135Z" fill="#1A1A1A" />
        <path d="M31 128 Q36 126 44 126" stroke="#37474F" strokeWidth="0.8" fill="none" />
        <path d="M69 128 Q64 126 56 126" stroke="#37474F" strokeWidth="0.8" fill="none" />
        {/* Charcoal trousers */}
        <rect x="33" y="100" width="14" height="27" rx="4" fill="url(#m5leg)" />
        <rect x="53" y="100" width="14" height="27" rx="4" fill="url(#m5leg)" />
        <path d="M40 103 L40 127" stroke="#546E7A" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M60 103 L60 127" stroke="#546E7A" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* Charcoal suit jacket */}
        <path d="M26 61 L25 103 Q36 109 50 108 Q64 109 75 103 L74 61 Q62 56 50 56 Q38 56 26 61Z" fill="url(#m5suit)" />
        <path d="M50 61 L43 79 L39 61" fill="#455A64" />
        <path d="M50 61 L57 79 L61 61" fill="#455A64" />
        <path d="M43 79 L39 61" stroke="#546E7A" strokeWidth="0.7" fill="none" opacity="0.6" />
        <path d="M57 79 L61 61" stroke="#546E7A" strokeWidth="0.7" fill="none" opacity="0.6" />
        {/* White shirt front */}
        <path d="M43 61 L50 101 L57 61" fill="#F8F8F6" />
        <path d="M50 69 L50 100" stroke="#E0E0E0" strokeWidth="0.8" fill="none" opacity="0.5" />
        <circle cx="50" cy="76" r="1.3" fill="#CFD8DC" />
        <circle cx="50" cy="84" r="1.3" fill="#CFD8DC" />
        <circle cx="50" cy="92" r="1.3" fill="#CFD8DC" />
        {/* Red tie */}
        <path d="M48.5 61 L47 65 L50 63 L53 65 L51.5 61Z" fill="#C62828" />
        <path d="M47 65 L46 82 L50 86 L54 82 L53 65 L50 63Z" fill="#B71C1C" />
        <path d="M50 66 L49 80 L50 83" stroke="#EF5350" strokeWidth="0.8" fill="none" opacity="0.45" />
        <path d="M47.5 81 L50 90 L52.5 81Z" fill="#B71C1C" />
        {/* Pocket square */}
        <path d="M63 65 L67 64 L68 69 L65 68Z" fill="#F5F5F5" />
        {/* Arms — charcoal suit sleeves */}
        <path d="M26 65 Q13 76 11 102" stroke="#37474F" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M74 65 Q87 76 89 102" stroke="#37474F" strokeWidth="16" strokeLinecap="round" fill="none" />
        <ellipse cx="10"  cy="103" rx="6.5" ry="6" fill="#F8F8F6" />
        <ellipse cx="90"  cy="103" rx="6.5" ry="6" fill="#F8F8F6" />
        <circle  cx="10"  cy="103" r="2" fill="#B0BEC5" />
        <circle  cx="90"  cy="103" r="2" fill="#B0BEC5" />
        <ellipse cx="10"  cy="109" rx="6"   ry="6" fill={SK} />
        <ellipse cx="90"  cy="109" rx="6"   ry="6" fill={SK} />
        {/* Neck + collar */}
        <rect x="46" y="50" width="8" height="11" rx="3.5" fill={SK} />
        <path d="M43 61 L46 57 L50 60 L54 57 L57 61" fill="white" opacity="0.9" />
        <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD} />
        <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD} />
        <circle cx="50" cy="37" r="14" fill="url(#m5f)" />

        {/* Sharp well-groomed hair */}
        <path d="M36 28 Q50 20 64 28 Q63 35 59 37 Q50 39 41 37 Q37 35 36 28Z" fill={HAIR} />
        {/* Subtle highlight streak */}
        <path d="M38 24 Q50 20 62 24" stroke="#3A2414" strokeWidth="1.2" fill="none" opacity="0.35" />

        {/* Face — confident, strong arch brows */}
        <ManFace
          mouth="M45 46 Q50 50 55 46"
        />

        {/* Subtle golden rim */}
        <ellipse cx="50" cy="88" rx="46" ry="60" stroke="#FFD54F" strokeWidth="1.5" strokeOpacity="0.28" fill="none" strokeDasharray="5 4" />
      </g>
    </svg>
  );
}

export const MAN_STAGES = [Man0, Man1, Man2, Man3, Man4, Man5] as const;

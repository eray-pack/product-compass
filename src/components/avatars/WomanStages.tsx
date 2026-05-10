// Woman companion — 6 adult recovery stages: disheveled → accomplished.
// All stages show the same adult woman improving.
// viewBox 0 0 100 140. Head center (50,37) r=14.
// Face: eyes at cy=35, eyebrows y≈31, nose y≈42, mouth y≈47.

type P = { className?: string };
const V = "0 0 100 140";

// ── Palette ───────────────────────────────────────────────────────────────────
const SK   = "#F0C090";
const SKD  = "#D4956A";
const HAIR = "#1C1208";
const LIP  = "#C06070";
const LIPL = "#E08090";

/* ── Stage 0 — Disheveled (day 0–6) ─────────────────────────────────────── */
export function Woman0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w0f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="w0c" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#78909C"/>
          <stop offset="100%" stopColor="#455A64"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="21" ry="3.5" fill="black" opacity="0.12"/>

      {/* Slip-on flats — worn */}
      <path d="M33 129 Q37 124 44 124 L45 131 Q41 136 34 136Z" fill="#546E7A"/>
      <path d="M67 129 Q63 124 56 124 L55 131 Q59 136 66 136Z" fill="#546E7A"/>

      {/* Leggings — dark */}
      <rect x="34" y="101" width="13" height="27" rx="5" fill="#37474F"/>
      <rect x="53" y="101" width="13" height="27" rx="5" fill="#37474F"/>

      {/* Oversized hoodie */}
      <path d="M28 62 L27 104 Q37 108 50 107 Q63 108 73 104 L72 62 Q61 57 50 57 Q39 57 28 62Z" fill="url(#w0c)"/>
      {/* Hood at back / collar */}
      <path d="M36 62 Q50 56 64 62" stroke="#78909C" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Pocket */}
      <rect x="35" y="82" width="30" height="16" rx="5" fill="#455A64" opacity="0.55"/>
      {/* Drawstring */}
      <path d="M47 62 Q50 66 53 62" stroke="#90A4AE" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* Arms — hanging loosely */}
      <path d="M28 66 Q16 76 14 99" stroke="#607D8B" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <path d="M72 66 Q84 76 86 99" stroke="#607D8B" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <ellipse cx="13" cy="100" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="87" cy="100" rx="6" ry="5.5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      {/* Ears */}
      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#w0f)"/>

      {/* Long messy hair — loose, disheveled */}
      {/* Hair cap */}
      <path d="M35 29 Q40 18 50 16 Q60 18 65 29 Q64 36 60 38 Q50 40 40 38 Q36 36 35 29Z" fill={HAIR}/>
      {/* Hair sides flowing down loosely */}
      <path d="M35 34 Q28 48 27 63 Q26 76 27 90" stroke={HAIR} strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M65 34 Q72 48 73 63 Q74 76 73 90" stroke={HAIR} strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Stray strands */}
      <path d="M38 21 Q34 15 36 11" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M50 16 Q49 9 52 7" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M62 21 Q66 15 64 11" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" fill="none"/>

      {/* Dark circles — exhaustion */}
      <ellipse cx="44" cy="38" rx="3.5" ry="1.6" fill="#6080A0" opacity="0.22"/>
      <ellipse cx="56" cy="38" rx="3.5" ry="1.6" fill="#6080A0" opacity="0.22"/>

      {/* Eyebrows */}
      <path d="M41 31.5 Q44.5 30 47.5 31" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M52.5 31 Q55.5 30 59 31.5" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* Eyes */}
      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      {/* Upper lid */}
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.5"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.5"/>
      {/* Lash hints */}
      <path d="M40.5 33.5 Q38.5 32 37 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35"/>
      <path d="M59.5 33.5 Q61.5 32 63 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35"/>

      {/* Nose */}
      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — flat, tired */}
      <path d="M46.5 47 Q50 47 53.5 47" stroke={LIP} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 1 — Early recovery (day 7–13) ────────────────────────────────── */
export function Woman1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w1f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="w1t" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#EF9A9A"/>
          <stop offset="100%" stopColor="#EF5350"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="21" ry="3.5" fill="black" opacity="0.12"/>

      {/* Canvas sneakers */}
      <path d="M33 129 Q37 123 44 123 L45 131 Q41 136 34 136Z" fill="#E8EAF6"/>
      <path d="M67 129 Q63 123 56 123 L55 131 Q59 136 66 136Z" fill="#E8EAF6"/>
      <path d="M33 130 Q38 128 45 128" stroke="#C5CAE9" strokeWidth="0.8" fill="none"/>
      <path d="M67 130 Q62 128 55 128" stroke="#C5CAE9" strokeWidth="0.8" fill="none"/>

      {/* Dark jeans */}
      <rect x="34" y="101" width="13" height="27" rx="4" fill="#283593"/>
      <rect x="53" y="101" width="13" height="27" rx="4" fill="#283593"/>
      <rect x="32" y="100" width="36" height="4" rx="2" fill="#1A237E"/>

      {/* Casual tee — dusty rose */}
      <path d="M30 62 L29 103 Q38 107 50 106 Q62 107 71 103 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#w1t)"/>
      <path d="M44 62 Q50 67 56 62" stroke="#EF5350" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 99" stroke="#EF5350" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 99" stroke="#EF5350" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="100" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="84" cy="100" rx="6" ry="5.5" fill={SKD}/>

      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#w1f)"/>

      {/* Hair — messy bun at top */}
      {/* Bun */}
      <ellipse cx="50" cy="20" rx="9" ry="7" fill={HAIR}/>
      {/* Bun highlight */}
      <path d="M44 17 Q50 14 56 17" stroke="#3A2414" strokeWidth="1.5" fill="none" opacity="0.45"/>
      {/* Loose strands escaping bun */}
      <path d="M41 21 Q36 28 36 35" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M59 21 Q64 28 64 35" stroke={HAIR} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Hair cap below bun */}
      <path d="M36 29 Q50 25 64 29 Q63 36 60 38 Q50 40 40 38 Q37 36 36 29Z" fill={HAIR}/>
      {/* Messy strands */}
      <path d="M42 22 Q38 17 40 13" stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M58 22 Q62 17 60 13" stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"/>

      {/* Fading dark circles */}
      <ellipse cx="44" cy="38" rx="3" ry="1.4" fill="#6080A0" opacity="0.13"/>
      <ellipse cx="56" cy="38" rx="3" ry="1.4" fill="#6080A0" opacity="0.13"/>

      <path d="M41 31.5 Q44.5 30 47.5 31" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M52.5 31 Q55.5 30 59 31.5" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.45"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.45"/>
      <path d="M40.5 33.5 Q38.5 32 37 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.3"/>
      <path d="M59.5 33.5 Q61.5 32 63 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.3"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — neutral */}
      <path d="M46.5 47 Q50 47.5 53.5 47" stroke={LIP} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 2 — Clean casual (day 14–29) ─────────────────────────────────── */
export function Woman2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w2f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="w2b" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#F8F8F8"/>
          <stop offset="100%" stopColor="#E8E8E8"/>
        </linearGradient>
        <linearGradient id="w2j" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#37474F"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="21" ry="3.5" fill="black" opacity="0.12"/>

      {/* White canvas shoes */}
      <path d="M33 129 Q37 123 44 123 L45 131 Q41 136 34 136Z" fill="#FAFAFA"/>
      <path d="M67 129 Q63 123 56 123 L55 131 Q59 136 66 136Z" fill="#FAFAFA"/>
      <path d="M33 130 Q38 128 45 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none"/>
      <path d="M67 130 Q62 128 55 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none"/>

      {/* Dark slim trousers */}
      <rect x="34" y="101" width="13" height="27" rx="4" fill="url(#w2j)"/>
      <rect x="53" y="101" width="13" height="27" rx="4" fill="url(#w2j)"/>
      <rect x="32" y="100" width="36" height="4" rx="2" fill="#212121"/>

      {/* White blouse */}
      <path d="M30 62 L29 103 Q38 107 50 106 Q62 107 71 103 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#w2b)"/>
      {/* Blouse collar */}
      <path d="M44 62 Q50 68 56 62" stroke="#E0E0E0" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Blouse tuck detail */}
      <path d="M50 70 L50 95" stroke="#EEEEEE" strokeWidth="0.8" fill="none" opacity="0.5"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 99" stroke="#F0F0F0" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 99" stroke="#F0F0F0" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="100" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="84" cy="100" rx="6" ry="5.5" fill={SKD}/>

      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#w2f)"/>

      {/* Hair — simple low ponytail */}
      {/* Hair cap */}
      <path d="M36 29 Q50 21 64 29 Q63 36 60 38 Q50 40 40 38 Q37 36 36 29Z" fill={HAIR}/>
      {/* Ponytail base */}
      <path d="M63 36 Q68 42 67 52 Q66 62 65 72" stroke={HAIR} strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Ponytail tip */}
      <path d="M65 70 Q64 80 63 88" stroke={HAIR} strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Hair tie band */}
      <ellipse cx="66" cy="50" rx="3.5" ry="2" fill="#B0BEC5" opacity="0.8"/>

      <path d="M41 31 Q44.5 29.5 47.5 30.5" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M52.5 30.5 Q55.5 29.5 59 31" stroke={HAIR} strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.42"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.42"/>
      <path d="M40.5 33.5 Q38.5 32 37 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.3"/>
      <path d="M59.5 33.5 Q61.5 32 63 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.3"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — calm */}
      <path d="M46.5 47 Q50 48.5 53.5 47" stroke={LIP} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 3 — Smart casual (day 30–59) ─────────────────────────────────── */
export function Woman3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w3f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="w3top" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#7986CB"/>
          <stop offset="100%" stopColor="#3949AB"/>
        </linearGradient>
        <linearGradient id="w3pan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#546E7A"/>
          <stop offset="100%" stopColor="#37474F"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="21" ry="3.5" fill="black" opacity="0.12"/>

      {/* Low-heeled boots */}
      <path d="M33 128 Q37 122 44 122 L45 131 Q41 136 34 135Z" fill="#4E342E"/>
      <path d="M67 128 Q63 122 56 122 L55 131 Q59 136 66 135Z" fill="#4E342E"/>
      <path d="M33 130 Q37 128 44 128" stroke="#3E2723" strokeWidth="1.2" fill="none"/>
      <path d="M67 130 Q63 128 56 128" stroke="#3E2723" strokeWidth="1.2" fill="none"/>

      {/* Smart trousers */}
      <rect x="34" y="101" width="13" height="26" rx="4" fill="url(#w3pan)"/>
      <rect x="53" y="101" width="13" height="26" rx="4" fill="url(#w3pan)"/>
      {/* Crease */}
      <path d="M40.5 104 L40.5 126" stroke="#607D8B" strokeWidth="0.8" fill="none" opacity="0.4"/>
      <path d="M59.5 104 L59.5 126" stroke="#607D8B" strokeWidth="0.8" fill="none" opacity="0.4"/>

      {/* Blouse — indigo */}
      <path d="M30 62 L29 103 Q38 107 50 106 Q62 107 71 103 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#w3top)"/>
      {/* V-neck */}
      <path d="M44 62 L50 74 L56 62" fill="#3949AB"/>
      <path d="M44 62 L50 72 L56 62" stroke="#5C6BC0" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Belt */}
      <rect x="30" y="100" width="40" height="4" rx="2" fill="#3E2723"/>
      <rect x="46" y="99" width="8" height="6" rx="1.5" fill="#8D6E63" opacity="0.9"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 99" stroke="#3949AB" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 99" stroke="#3949AB" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="100" rx="5.5" ry="5" fill="#3949AB" opacity="0.7"/>
      <ellipse cx="84" cy="100" rx="5.5" ry="5" fill="#3949AB" opacity="0.7"/>
      <ellipse cx="16" cy="101" rx="5" ry="4.5" fill={SKD}/>
      <ellipse cx="84" cy="101" rx="5" ry="4.5" fill={SKD}/>

      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#w3f)"/>

      {/* Hair — down, smooth and neat */}
      <path d="M36 29 Q50 21 64 29 Q63 36 60 38 Q50 40 40 38 Q37 36 36 29Z" fill={HAIR}/>
      {/* Smooth sides flowing down */}
      <path d="M36 34 Q31 46 30 58 Q29 70 30 84" stroke={HAIR} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M64 34 Q69 46 70 58 Q71 70 70 84" stroke={HAIR} strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Hair highlight (smooth) */}
      <path d="M39 25 Q50 21 61 25" stroke="#3A2414" strokeWidth="1.2" fill="none" opacity="0.35"/>

      {/* Eyebrows — groomed arch */}
      <path d="M41 31 Q44.5 29.5 47.5 30.5" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M52.5 30.5 Q55.5 29.5 59 31" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>

      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.42"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.42"/>
      <path d="M40.5 33.5 Q38.5 32 37 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.32"/>
      <path d="M59.5 33.5 Q61.5 32 63 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.32"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — confident */}
      <path d="M46.5 47 Q50 49 53.5 47" stroke={LIP} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 4 — Professional (day 60–89) ─────────────────────────────────── */
export function Woman4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w4f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="w4suit" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#546E7A"/>
          <stop offset="100%" stopColor="#37474F"/>
        </linearGradient>
        <linearGradient id="w4dress" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#F3E5F5"/>
          <stop offset="100%" stopColor="#CE93D8"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="21" ry="3.5" fill="black" opacity="0.13"/>

      {/* Heeled pumps */}
      <path d="M33 127 Q37 121 44 121 L45 130 Q41 135 34 134Z" fill="#37474F"/>
      <path d="M67 127 Q63 121 56 121 L55 130 Q59 135 66 134Z" fill="#37474F"/>
      <path d="M40 130 L40 135" stroke="#263238" strokeWidth="1.5" fill="none"/>
      <path d="M60 130 L60 135" stroke="#263238" strokeWidth="1.5" fill="none"/>

      {/* Pencil dress — lavender/dusty rose */}
      <path d="M33 83 L32 128 Q40 133 50 132 Q60 133 68 128 L67 83 Q59 79 50 79 Q41 79 33 83Z" fill="url(#w4dress)"/>
      {/* Dress waist seam */}
      <path d="M33 100 Q50 104 67 100" stroke="#BA68C8" strokeWidth="1.2" fill="none" opacity="0.5"/>
      {/* Dress shimmer */}
      <path d="M42 87 Q41 103 42 118" stroke="#E1BEE7" strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M58 87 Q59 103 58 118" stroke="#E1BEE7" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* Blazer over dress */}
      <path d="M27 62 L26 87 Q36 90 50 89 Q64 90 74 87 L73 62 Q62 57 50 57 Q38 57 27 62Z" fill="url(#w4suit)"/>
      {/* Lapels */}
      <path d="M50 62 L44 76 L40 62" fill="#455A64"/>
      <path d="M50 62 L56 76 L60 62" fill="#455A64"/>
      {/* Blouse front */}
      <path d="M44 62 L50 84 L56 62" fill="#F3E5F5" opacity="0.9"/>

      {/* Arms — blazer sleeves */}
      <path d="M27 66 Q15 75 13 96" stroke="#37474F" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M73 66 Q85 75 87 96" stroke="#37474F" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Cuffs */}
      <ellipse cx="12" cy="97" rx="6" ry="5.5" fill="#455A64"/>
      <ellipse cx="88" cy="97" rx="6" ry="5.5" fill="#455A64"/>
      <ellipse cx="12" cy="98" rx="5" ry="4.5" fill={SKD}/>
      <ellipse cx="88" cy="98" rx="5" ry="4.5" fill={SKD}/>

      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#w4f)"/>

      {/* Hair — half-up half-down */}
      {/* Hair cap base */}
      <path d="M36 29 Q50 21 64 29 Q63 36 60 38 Q50 40 40 38 Q37 36 36 29Z" fill={HAIR}/>
      {/* Upper half pulled back (smooth) */}
      <path d="M36 30 Q50 25 64 30" stroke="#2A1A0A" strokeWidth="2.5" fill="none" opacity="0.4"/>
      {/* Hair tie at crown */}
      <ellipse cx="50" cy="24" rx="5" ry="2.5" fill={HAIR}/>
      <ellipse cx="50" cy="24" rx="3" ry="1.2" fill="#455A64" opacity="0.7"/>
      {/* Lower half flowing down sides */}
      <path d="M36 36 Q31 48 31 62 Q31 74 32 84" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M64 36 Q69 48 69 62 Q69 74 68 84" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none"/>

      {/* Eyebrows — defined */}
      <path d="M41 31 Q44.5 29.5 47.5 30.5" stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M52.5 30.5 Q55.5 29.5 59 31" stroke={HAIR} strokeWidth="1.4" strokeLinecap="round" fill="none"/>

      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.42"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.42"/>
      <path d="M40.5 33.5 Q38.5 32 37 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35"/>
      <path d="M59.5 33.5 Q61.5 32 63 33" stroke={HAIR} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.35"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — warm smile */}
      <path d="M46 47 Q50 49.5 54 47" stroke={LIP} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M46 47 Q50 49.5 54 47" fill={LIPL} opacity="0.22"/>
    </svg>
  );
}

/* ── Stage 5 — Accomplished: forest green dress, gold necklace (day 90+) ── */
export function Woman5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="w5f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        {/* Forest green dress gradient */}
        <linearGradient id="w5dress" x1="12%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#2E7D32"/>
          <stop offset="45%" stopColor="#1B5E20"/>
          <stop offset="100%" stopColor="#0A3D14"/>
        </linearGradient>
        {/* Dress shimmer highlight */}
        <linearGradient id="w5shim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#1B5E20" stopOpacity="0"/>
        </linearGradient>
        {/* Golden aura */}
        <radialGradient id="w5aura" cx="50%" cy="68%" r="52%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.30"/>
          <stop offset="70%" stopColor="#FFB300" stopOpacity="0.10"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Golden aura */}
      <ellipse cx="50" cy="95" rx="44" ry="58" fill="url(#w5aura)"/>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.14"/>

      {/* Stiletto heels — dark */}
      <path d="M33 127 Q37 120 44 120 L45 130 Q41 135 34 134Z" fill="#1A2E1A"/>
      <path d="M67 127 Q63 120 56 120 L55 130 Q59 135 66 134Z" fill="#1A2E1A"/>
      {/* Heel spike */}
      <path d="M39 130 L38.5 137" stroke="#1A2E1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M61 130 L61.5 137" stroke="#1A2E1A" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Elegant forest green dress — A-line silhouette */}
      {/* Bodice (fitted) */}
      <path d="M34 78 L33 105 Q41 109 50 108 Q59 109 67 105 L66 78 Q58 74 50 74 Q42 74 34 78Z" fill="url(#w5dress)"/>
      {/* Skirt — A-line flare */}
      <path d="M33 103 L28 135 Q38 138 50 137 Q62 138 72 135 L67 103 Q59 107 50 106 Q41 107 33 103Z" fill="url(#w5dress)"/>
      {/* Dress shimmer overlay */}
      <path d="M34 78 L33 135 Q41 138 50 137 Q59 138 67 135 L66 78 Q58 74 50 74 Q42 74 34 78Z" fill="url(#w5shim)"/>
      {/* Dress body highlight fold */}
      <path d="M42 83 Q40 96 40 110 Q40 122 41 132" stroke="#4CAF50" strokeWidth="1" fill="none" opacity="0.25"/>
      {/* V-neckline */}
      <path d="M42 78 L50 91 L58 78" stroke="#4CAF50" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45"/>
      {/* Waist cinch */}
      <path d="M34 102 Q50 106 66 102" stroke="#0D4D12" strokeWidth="1.5" fill="none" opacity="0.5"/>

      {/* Arms — green dress sleeves to elbow, then bare */}
      <path d="M34 82 Q22 91 20 108" stroke="#1B5E20" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M66 82 Q78 91 80 108" stroke="#1B5E20" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Bare forearms */}
      <path d="M19 108 Q17 116 17 120" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none"/>
      <path d="M81 108 Q83 116 83 120" stroke={SK} strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Hands */}
      <ellipse cx="17" cy="121" rx="5.5" ry="5" fill={SKD}/>
      <ellipse cx="83" cy="121" rx="5.5" ry="5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      {/* Gold necklace — delicate chain + pendant */}
      <path d="M43 60 Q50 65 57 60" stroke="#FFD54F" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M46 63 Q50 68 54 63" stroke="#FFD54F" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.75"/>
      <circle cx="50" cy="68" r="2.2" fill="#FFD54F" opacity="0.95"/>
      <circle cx="50" cy="68" r="1.2" fill="#FFE082"/>

      <ellipse cx="35" cy="36" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="36" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="36" r="14" fill="url(#w5f)"/>

      {/* Elegant updo — chignon at back with loose face-framing strands */}
      {/* Hair cap */}
      <path d="M36 28 Q50 20 64 28 Q63 35 60 37 Q50 39 40 37 Q37 35 36 28Z" fill={HAIR}/>
      {/* Bun / chignon at crown */}
      <ellipse cx="50" cy="19" rx="10" ry="7" fill={HAIR}/>
      {/* Bun texture */}
      <path d="M42 18 Q50 14 58 18 Q56 22 50 23 Q44 22 42 18Z" fill="#2A1A0A" opacity="0.45"/>
      {/* Hair highlight */}
      <path d="M43 15 Q50 12 57 15" stroke="#3A2414" strokeWidth="1.3" fill="none" opacity="0.4"/>
      {/* Loose face-framing strands */}
      <path d="M36 30 Q34 38 35 48" stroke={HAIR} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M64 30 Q66 38 65 48" stroke={HAIR} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      {/* Tiny gold hair pin */}
      <path d="M54 18 L58 16" stroke="#FFD54F" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85"/>

      {/* Eyebrows — elegant defined arch */}
      <path d="M41 30 Q44.5 28.5 47.5 29.5" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M52.5 29.5 Q55.5 28.5 59 30" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Eyes — poised, confident */}
      <ellipse cx="44" cy="34" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="34" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="34" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="34" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="34" r="0.9" fill="#070402"/>
      <circle cx="56" cy="34" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="33.2" r="0.8" fill="white"/>
      <circle cx="55.2" cy="33.2" r="0.8" fill="white"/>
      {/* Upper lid — defined lash line */}
      <path d="M40.5 32.5 Q44 31 47.5 32.5" stroke={HAIR} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M52.5 32.5 Q56 31 59.5 32.5" stroke={HAIR} strokeWidth="1.2" fill="none" opacity="0.5"/>
      {/* Outer lash flick */}
      <path d="M40.5 32.5 Q38.5 31 37 31.5" stroke={HAIR} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M59.5 32.5 Q61.5 31 63 31.5" stroke={HAIR} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* Nose */}
      <ellipse cx="47.5" cy="40" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="40" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 38.5 Q50 40 51.5 38.5" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Warm smile with defined lips */}
      <path d="M45.5 45.5 Q50 44 54.5 45.5 Q52 49.5 50 50 Q48 49.5 45.5 45.5Z" fill={LIPL} opacity="0.35"/>
      <path d="M45.5 45.5 Q50 49.5 54.5 45.5" stroke={LIP} strokeWidth="1.7" strokeLinecap="round" fill="none"/>
      <path d="M45.5 45.5 Q47.5 44 50 44.5 Q52.5 44 54.5 45.5" stroke="#A84858" strokeWidth="0.9" fill="none" opacity="0.5"/>

      {/* Subtle golden rim */}
      <ellipse cx="50" cy="88" rx="45" ry="60" stroke="#FFD54F" strokeWidth="1.5" strokeOpacity="0.26" fill="none" strokeDasharray="5 4"/>
    </svg>
  );
}

export const WOMAN_STAGES = [Woman0, Woman1, Woman2, Woman3, Woman4, Woman5] as const;

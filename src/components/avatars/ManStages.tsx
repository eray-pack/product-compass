// Man companion — 6 adult recovery stages: disheveled → peak.
// All stages show the same adult man improving.
// viewBox 0 0 100 140. Head center (50,37) r=14.
// Face: eyes at cy=35, eyebrows y≈31, nose y≈42, mouth y≈47.

type P = { className?: string };
const V = "0 0 100 140";

// ── Palette ───────────────────────────────────────────────────────────────────
const SK    = "#F0C090"; // skin base
const SKD   = "#D4956A"; // skin shadow / ear
const HAIR  = "#1C1208"; // near-black dark brown
const LIP   = "#C07060";

// ── Shared face drawing (inline per stage for gradient ID isolation) ──────────
// Eyes are adult-proportioned: rx=3.5 ry=2.5 (wider than tall, like real eyes)
// No dark outline ring around eyes — only a subtle upper-lid arc.

/* ── Stage 0 — Disheveled (day 0–6) ─────────────────────────────────────── */
export function Man0({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m0f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="m0h" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A2414"/>
          <stop offset="100%" stopColor="#1C1208"/>
        </linearGradient>
        <linearGradient id="m0c" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#757575"/>
          <stop offset="100%" stopColor="#424242"/>
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.13"/>

      {/* Shoes — worn, dark grey */}
      <path d="M32 128 Q36 123 43 123 L44 130 Q41 135 33 135Z" fill="#424242"/>
      <path d="M68 128 Q64 123 57 123 L56 130 Q59 135 67 135Z" fill="#424242"/>

      {/* Sweatpants */}
      <rect x="34" y="100" width="13" height="27" rx="4" fill="#555555"/>
      <rect x="53" y="100" width="13" height="27" rx="4" fill="#555555"/>

      {/* Hoodie body */}
      <path d="M30 63 L29 104 Q38 108 50 107 Q62 108 71 104 L70 63 Q61 59 50 59 Q39 59 30 63Z" fill="url(#m0c)"/>
      {/* Kangaroo pocket */}
      <rect x="37" y="80" width="26" height="17" rx="4" fill="#424242" opacity="0.6"/>
      {/* Drawstring */}
      <path d="M47 63 Q50 67 53 63" stroke="#9E9E9E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>

      {/* Sleeve arms — hanging loosely */}
      <path d="M30 67 Q18 76 16 98" stroke="#616161" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 67 Q82 76 84 98" stroke="#616161" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Hands */}
      <ellipse cx="15" cy="99" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="85" cy="99" rx="6" ry="5.5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      {/* Ears (drawn before head so head covers inner portion) */}
      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>

      {/* Head */}
      <circle cx="50" cy="37" r="14" fill="url(#m0f)"/>

      {/* Messy hair */}
      <path d="M36 30 Q40 19 50 17 Q60 19 64 30 Q63 36 59 38 Q50 40 41 38 Q37 36 36 30Z" fill="url(#m0h)"/>
      {/* Stray strands */}
      <path d="M38 22 Q35 15 37 12" stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M50 17 Q51 11 54 9" stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M62 22 Q65 16 63 12" stroke={HAIR} strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* Dark under-eye shadow (exhaustion) */}
      <ellipse cx="44" cy="38" rx="3.5" ry="1.6" fill="#6080A0" opacity="0.22"/>
      <ellipse cx="56" cy="38" rx="3.5" ry="1.6" fill="#6080A0" opacity="0.22"/>

      {/* Eyebrows — slightly knitted */}
      <path d="M41 31.5 Q44.5 30 47.5 31" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M52.5 31 Q55.5 30 59 31.5" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>

      {/* Eyes — heavy, tired */}
      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      {/* Upper lid — heavy */}
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.5"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.5"/>

      {/* Nose */}
      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.4"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.4"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.4"/>

      {/* Mouth — slight downturn */}
      <path d="M46 47 Q50 46 54 47" stroke={LIP} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M46 47 Q45.5 48 46 48.5" stroke={LIP} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M54 47 Q54.5 48 54 48.5" stroke={LIP} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  );
}

/* ── Stage 1 — Early recovery (day 7–13) ────────────────────────────────── */
export function Man1({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m1f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="m1shirt" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#3949AB"/>
          <stop offset="100%" stopColor="#1A237E"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12"/>

      {/* Sneakers — plain white */}
      <path d="M33 128 Q37 123 44 123 L45 130 Q41 135 34 135Z" fill="#ECEFF1"/>
      <path d="M67 128 Q63 123 56 123 L55 130 Q59 135 66 135Z" fill="#ECEFF1"/>
      <path d="M33 129 Q38 127 45 127" stroke="#B0BEC5" strokeWidth="0.8" fill="none"/>
      <path d="M67 129 Q62 127 55 127" stroke="#B0BEC5" strokeWidth="0.8" fill="none"/>

      {/* Joggers — dark grey */}
      <rect x="34" y="100" width="13" height="27" rx="4" fill="#546E7A"/>
      <rect x="53" y="100" width="13" height="27" rx="4" fill="#546E7A"/>
      <rect x="34" y="100" width="32" height="5" rx="2" fill="#455A64"/>

      {/* Navy tee */}
      <path d="M30 62 L29 103 Q38 107 50 106 Q62 107 71 103 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#m1shirt)"/>
      {/* Collar */}
      <path d="M44 62 Q50 67 56 62" stroke="#3949AB" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 98" stroke="#1A237E" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 98" stroke="#1A237E" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="99" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="84" cy="99" rx="6" ry="5.5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#m1f)"/>

      {/* Hair — still a bit unkempt */}
      <path d="M36 30 Q40 20 50 18 Q60 20 64 30 Q63 36 59 38 Q50 40 41 38 Q37 36 36 30Z" fill={HAIR}/>
      <path d="M38 22 Q36 17 38 14" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M62 22 Q64 17 62 14" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Faint dark circles fading */}
      <ellipse cx="44" cy="38" rx="3.5" ry="1.4" fill="#6080A0" opacity="0.12"/>
      <ellipse cx="56" cy="38" rx="3.5" ry="1.4" fill="#6080A0" opacity="0.12"/>

      <path d="M41 31.5 Q44.5 30 47.5 31" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M52.5 31 Q55.5 30 59 31.5" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" fill="none"/>

      <ellipse cx="44" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="35" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="35" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="35" r="0.9" fill="#070402"/>
      <circle cx="56" cy="35" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="34.2" r="0.7" fill="white"/>
      <circle cx="55.2" cy="34.2" r="0.7" fill="white"/>
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.45"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.45"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — neutral */}
      <path d="M46 47 Q50 47.5 54 47" stroke={LIP} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 2 — Clean casual (day 14–29) ─────────────────────────────────── */
export function Man2({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m2f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="m2j" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0"/>
          <stop offset="100%" stopColor="#0D47A1"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12"/>

      {/* Clean white sneakers */}
      <path d="M33 128 Q37 123 44 123 L45 130 Q41 135 34 135Z" fill="#F5F5F5"/>
      <path d="M67 128 Q63 123 56 123 L55 130 Q59 135 66 135Z" fill="#F5F5F5"/>
      <path d="M33 130 Q38 128 45 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none"/>
      <path d="M67 130 Q62 128 55 128" stroke="#E0E0E0" strokeWidth="0.8" fill="none"/>

      {/* Dark jeans */}
      <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m2j)"/>
      <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m2j)"/>
      {/* Belt */}
      <rect x="32" y="99" width="36" height="4" rx="2" fill="#212121"/>
      <rect x="47" y="98" width="6" height="6" rx="1.5" fill="#9E9E9E"/>

      {/* White tee */}
      <path d="M30 62 L29 102 Q38 106 50 105 Q62 106 71 102 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="#FAFAFA"/>
      {/* Collar */}
      <path d="M44 62 Q50 67 56 62" stroke="#E0E0E0" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Subtle chest crease */}
      <path d="M50 68 L50 90" stroke="#E8E8E8" strokeWidth="0.8" fill="none" opacity="0.6"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 98" stroke="#F5F5F5" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 98" stroke="#F5F5F5" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <ellipse cx="16" cy="99" rx="6" ry="5.5" fill={SKD}/>
      <ellipse cx="84" cy="99" rx="6" ry="5.5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#m2f)"/>

      {/* Hair — neater, short */}
      <path d="M36 29 Q50 21 64 29 Q63 35 59 38 Q50 40 41 38 Q37 35 36 29Z" fill={HAIR}/>
      {/* Side part hint */}
      <path d="M44 23 Q45 29 45 36" stroke="#0E0804" strokeWidth="0.8" fill="none" opacity="0.35"/>

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
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.45"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.45"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — slight positive curve */}
      <path d="M46 47 Q50 48.5 54 47" stroke={LIP} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 3 — Smart casual (day 30–59) ─────────────────────────────────── */
export function Man3({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m3f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="m3s" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#3949AB"/>
          <stop offset="100%" stopColor="#283593"/>
        </linearGradient>
        <linearGradient id="m3p" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8B48A"/>
          <stop offset="100%" stopColor="#A89060"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.12"/>

      {/* Oxford shoes */}
      <path d="M32 128 Q36 123 43 123 L44 130 Q40 135 33 135Z" fill="#3E2723"/>
      <path d="M68 128 Q64 123 57 123 L56 130 Q60 135 67 135Z" fill="#3E2723"/>
      <path d="M32 129 Q37 127 44 127" stroke="#4E342E" strokeWidth="1" fill="none"/>
      <path d="M68 129 Q63 127 56 127" stroke="#4E342E" strokeWidth="1" fill="none"/>

      {/* Chino trousers */}
      <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m3p)"/>
      <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m3p)"/>
      {/* Belt */}
      <rect x="32" y="98" width="36" height="4" rx="2" fill="#3E2723"/>
      <rect x="47" y="97" width="6" height="6" rx="1.5" fill="#A0522D" opacity="0.8"/>

      {/* Navy button-up shirt */}
      <path d="M30 62 L29 101 Q38 105 50 104 Q62 105 71 101 L70 62 Q61 58 50 58 Q39 58 30 62Z" fill="url(#m3s)"/>
      {/* Collar */}
      <path d="M44 62 L50 69 L56 62" fill="#3949AB"/>
      <path d="M44 62 L50 67 L56 62" stroke="#5C6BC0" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Shirt buttons */}
      <circle cx="50" cy="77" r="1.2" fill="#5C6BC0" opacity="0.6"/>
      <circle cx="50" cy="85" r="1.2" fill="#5C6BC0" opacity="0.6"/>
      <circle cx="50" cy="93" r="1.2" fill="#5C6BC0" opacity="0.6"/>

      {/* Arms */}
      <path d="M30 66 Q19 75 17 98" stroke="#283593" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M70 66 Q81 75 83 98" stroke="#283593" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Shirt cuffs */}
      <ellipse cx="16" cy="99" rx="5.5" ry="5" fill="#3949AB" opacity="0.7"/>
      <ellipse cx="84" cy="99" rx="5.5" ry="5" fill="#3949AB" opacity="0.7"/>
      <ellipse cx="16" cy="100" rx="5" ry="4.5" fill={SKD}/>
      <ellipse cx="84" cy="100" rx="5" ry="4.5" fill={SKD}/>

      {/* Neck */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#m3f)"/>

      {/* Short neat hair */}
      <path d="M36 29 Q50 21 64 29 Q63 35 59 38 Q50 40 41 38 Q37 35 36 29Z" fill={HAIR}/>
      {/* Clean fade at sides */}
      <path d="M36 29 Q37 34 37 38" stroke="#1C1208" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M64 29 Q63 34 63 38" stroke="#1C1208" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>

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
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.4"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — calm confidence */}
      <path d="M46 47 Q50 49 54 47" stroke={LIP} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 4 — Professional (day 60–89) ─────────────────────────────────── */
export function Man4({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m4f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        <linearGradient id="m4b" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#546E7A"/>
          <stop offset="100%" stopColor="#37474F"/>
        </linearGradient>
        <linearGradient id="m4t" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#455A64"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="137" rx="22" ry="3.5" fill="black" opacity="0.13"/>

      {/* Black Oxford shoes */}
      <path d="M32 128 Q36 122 43 122 L44 130 Q40 135 33 135Z" fill="#212121"/>
      <path d="M68 128 Q64 122 57 122 L56 130 Q60 135 67 135Z" fill="#212121"/>
      <path d="M32 128 Q37 126 44 126" stroke="#37474F" strokeWidth="0.9" fill="none"/>
      <path d="M68 128 Q63 126 56 126" stroke="#37474F" strokeWidth="0.9" fill="none"/>

      {/* Dark trousers */}
      <rect x="34" y="100" width="13" height="27" rx="4" fill="url(#m4t)"/>
      <rect x="53" y="100" width="13" height="27" rx="4" fill="url(#m4t)"/>
      {/* Trouser crease */}
      <path d="M40.5 103 L40.5 127" stroke="#455A64" strokeWidth="0.8" fill="none" opacity="0.45"/>
      <path d="M59.5 103 L59.5 127" stroke="#455A64" strokeWidth="0.8" fill="none" opacity="0.45"/>

      {/* Blazer */}
      <path d="M27 62 L26 103 Q36 108 50 107 Q64 108 74 103 L73 62 Q62 57 50 57 Q38 57 27 62Z" fill="url(#m4b)"/>
      {/* Lapels */}
      <path d="M50 62 L44 78 L40 62" fill="#455A64"/>
      <path d="M50 62 L56 78 L60 62" fill="#455A64"/>
      {/* Lapel notch */}
      <path d="M44 70 L40 62" stroke="#37474F" strokeWidth="0.8" fill="none"/>
      <path d="M56 70 L60 62" stroke="#37474F" strokeWidth="0.8" fill="none"/>
      {/* White shirt front */}
      <path d="M44 62 L50 99 L56 62" fill="#F8F8F8"/>
      {/* Shirt buttons */}
      <circle cx="50" cy="76" r="1.2" fill="#CFD8DC"/>
      <circle cx="50" cy="84" r="1.2" fill="#CFD8DC"/>
      <circle cx="50" cy="92" r="1.2" fill="#CFD8DC"/>

      {/* Arms — blazer sleeves */}
      <path d="M27 66 Q15 76 13 100" stroke="#37474F" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <path d="M73 66 Q85 76 87 100" stroke="#37474F" strokeWidth="15" strokeLinecap="round" fill="none"/>
      {/* Shirt cuffs */}
      <ellipse cx="12" cy="101" rx="6" ry="5.5" fill="#F8F8F8"/>
      <ellipse cx="88" cy="101" rx="6" ry="5.5" fill="#F8F8F8"/>
      {/* Hands */}
      <ellipse cx="12" cy="107" rx="5.5" ry="5.5" fill={SK}/>
      <ellipse cx="88" cy="107" rx="5.5" ry="5.5" fill={SK}/>

      {/* Neck / collar */}
      <rect x="46" y="51" width="8" height="11" rx="3.5" fill={SK}/>

      <ellipse cx="35" cy="37" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="37" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="37" r="14" fill="url(#m4f)"/>

      {/* Short professional hair */}
      <path d="M36 29 Q50 21 64 29 Q63 35 60 38 Q50 40 40 38 Q37 35 36 29Z" fill={HAIR}/>

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
      <path d="M40.5 33.5 Q44 32 47.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M52.5 33.5 Q56 32 59.5 33.5" stroke={HAIR} strokeWidth="1" fill="none" opacity="0.4"/>

      <ellipse cx="47.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="42" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 40 Q50 41.5 51.5 40" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Mouth — confident */}
      <path d="M46 47 Q50 49.5 54 47" stroke={LIP} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ── Stage 5 — Peak: charcoal suit, red tie (day 90+) ───────────────────── */
export function Man5({ className }: P) {
  return (
    <svg viewBox={V} fill="none" className={className}>
      <defs>
        <radialGradient id="m5f" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FAD4B0"/>
          <stop offset="55%" stopColor="#F0C090"/>
          <stop offset="100%" stopColor="#C8845A"/>
        </radialGradient>
        {/* Charcoal suit gradient (light left → dark right) */}
        <linearGradient id="m5suit" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#546E7A"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
        <linearGradient id="m5leg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#455A64"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
        {/* Golden aura */}
        <radialGradient id="m5aura" cx="50%" cy="68%" r="52%">
          <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.32"/>
          <stop offset="70%" stopColor="#FFB300" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Golden aura behind figure */}
      <ellipse cx="50" cy="95" rx="45" ry="58" fill="url(#m5aura)"/>

      <ellipse cx="50" cy="137" rx="23" ry="3.5" fill="black" opacity="0.14"/>

      {/* Black dress shoes */}
      <path d="M31 128 Q35 122 43 122 L44 131 Q40 136 32 135Z" fill="#1A1A1A"/>
      <path d="M69 128 Q65 122 57 122 L56 131 Q60 136 68 135Z" fill="#1A1A1A"/>
      <path d="M31 128 Q36 126 44 126" stroke="#37474F" strokeWidth="0.8" fill="none"/>
      <path d="M69 128 Q64 126 56 126" stroke="#37474F" strokeWidth="0.8" fill="none"/>

      {/* Charcoal trouser legs */}
      <rect x="33" y="100" width="14" height="27" rx="4" fill="url(#m5leg)"/>
      <rect x="53" y="100" width="14" height="27" rx="4" fill="url(#m5leg)"/>
      {/* Trouser crease (sharp) */}
      <path d="M40 103 L40 127" stroke="#546E7A" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <path d="M60 103 L60 127" stroke="#546E7A" strokeWidth="0.8" fill="none" opacity="0.5"/>

      {/* Charcoal suit jacket */}
      <path d="M26 61 L25 103 Q36 109 50 108 Q64 109 75 103 L74 61 Q62 56 50 56 Q38 56 26 61Z" fill="url(#m5suit)"/>
      {/* Lapels */}
      <path d="M50 61 L43 79 L39 61" fill="#455A64"/>
      <path d="M50 61 L57 79 L61 61" fill="#455A64"/>
      {/* Lapel edge highlight */}
      <path d="M43 79 L39 61" stroke="#546E7A" strokeWidth="0.7" fill="none" opacity="0.6"/>
      <path d="M57 79 L61 61" stroke="#546E7A" strokeWidth="0.7" fill="none" opacity="0.6"/>
      {/* White shirt front */}
      <path d="M43 61 L50 101 L57 61" fill="#F8F8F6"/>
      {/* Shirt button line */}
      <path d="M50 69 L50 100" stroke="#E0E0E0" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <circle cx="50" cy="76" r="1.3" fill="#CFD8DC"/>
      <circle cx="50" cy="84" r="1.3" fill="#CFD8DC"/>
      <circle cx="50" cy="92" r="1.3" fill="#CFD8DC"/>
      {/* Red tie — proper knot shape */}
      <path d="M48.5 61 L47 65 L50 63 L53 65 L51.5 61Z" fill="#C62828"/>
      <path d="M47 65 L46 82 L50 86 L54 82 L53 65 L50 63Z" fill="#B71C1C"/>
      {/* Tie highlight */}
      <path d="M50 66 L49 80 L50 83" stroke="#EF5350" strokeWidth="0.8" fill="none" opacity="0.45"/>
      {/* Tie bottom arrow */}
      <path d="M47.5 81 L50 90 L52.5 81Z" fill="#B71C1C"/>
      {/* Pocket square */}
      <path d="M63 65 L67 64 L68 69 L65 68Z" fill="#F5F5F5"/>
      {/* Jacket shadow fold */}
      <path d="M50 85 Q55 88 60 86" stroke="#263238" strokeWidth="0.9" fill="none" opacity="0.3"/>

      {/* Arms — charcoal suit sleeves, strong shoulders */}
      <path d="M26 65 Q13 76 11 102" stroke="#37474F" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M74 65 Q87 76 89 102" stroke="#37474F" strokeWidth="16" strokeLinecap="round" fill="none"/>
      {/* Shirt cuffs */}
      <ellipse cx="10" cy="103" rx="6.5" ry="6" fill="#F8F8F6"/>
      <ellipse cx="90" cy="103" rx="6.5" ry="6" fill="#F8F8F6"/>
      {/* Cufflinks */}
      <circle cx="10" cy="103" r="2" fill="#B0BEC5"/>
      <circle cx="90" cy="103" r="2" fill="#B0BEC5"/>
      {/* Hands */}
      <ellipse cx="10" cy="109" rx="6" ry="6" fill={SK}/>
      <ellipse cx="90" cy="109" rx="6" ry="6" fill={SK}/>

      {/* Neck with collar */}
      <rect x="46" y="50" width="8" height="11" rx="3.5" fill={SK}/>
      {/* Collar points */}
      <path d="M43 61 L46 57 L50 60 L54 57 L57 61" fill="white" opacity="0.9"/>

      <ellipse cx="35" cy="36" rx="3" ry="4" fill={SKD}/>
      <ellipse cx="65" cy="36" rx="3" ry="4" fill={SKD}/>
      <circle cx="50" cy="36" r="14" fill="url(#m5f)"/>

      {/* Short, sharp hair — well-groomed */}
      <path d="M36 28 Q50 20 64 28 Q63 35 59 37 Q50 39 41 37 Q37 35 36 28Z" fill={HAIR}/>
      {/* Hair texture / highlight */}
      <path d="M38 24 Q50 20 62 24" stroke="#3A2414" strokeWidth="1.2" fill="none" opacity="0.4"/>

      {/* Eyebrows — confident, defined arch */}
      <path d="M40 30 Q44.5 28.5 47.5 29.5" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M52.5 29.5 Q55.5 28.5 60 30" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Eyes — alert, determined */}
      <ellipse cx="44" cy="34" rx="3.5" ry="2.4" fill="white"/>
      <ellipse cx="56" cy="34" rx="3.5" ry="2.4" fill="white"/>
      <circle cx="44" cy="34" r="1.9" fill="#3D2010"/>
      <circle cx="56" cy="34" r="1.9" fill="#3D2010"/>
      <circle cx="44" cy="34" r="0.9" fill="#070402"/>
      <circle cx="56" cy="34" r="0.9" fill="#070402"/>
      <circle cx="43.2" cy="33.2" r="0.8" fill="white"/>
      <circle cx="55.2" cy="33.2" r="0.8" fill="white"/>
      <path d="M40.5 32.5 Q44 31 47.5 32.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.45"/>
      <path d="M52.5 32.5 Q56 31 59.5 32.5" stroke={HAIR} strokeWidth="1.1" fill="none" opacity="0.45"/>

      {/* Nose */}
      <ellipse cx="47.5" cy="40" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <ellipse cx="52.5" cy="40" rx="1.3" ry="0.9" fill="#C4906A" opacity="0.38"/>
      <path d="M48.5 38.5 Q50 40 51.5 38.5" stroke="#C4906A" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.38"/>

      {/* Warm confident smile */}
      <path d="M45 45.5 Q50 44 55 45.5 Q52 49.5 50 50 Q48 49.5 45 45.5Z" fill="#D4856A" opacity="0.38"/>
      <path d="M45 45.5 Q50 49.5 55 45.5" stroke={LIP} strokeWidth="1.7" strokeLinecap="round" fill="none"/>
      <path d="M45 45.5 Q47.5 44 50 44.5 Q52.5 44 55 45.5" stroke="#A85848" strokeWidth="0.9" fill="none" opacity="0.5"/>

      {/* Subtle golden rim */}
      <ellipse cx="50" cy="88" rx="46" ry="60" stroke="#FFD54F" strokeWidth="1.5" strokeOpacity="0.28" fill="none" strokeDasharray="5 4"/>
    </svg>
  );
}

export const MAN_STAGES = [Man0, Man1, Man2, Man3, Man4, Man5] as const;

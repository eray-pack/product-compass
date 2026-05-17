// Wolf companion — 8 evolution stages: tiny pup → legendary alpha.
// viewBox 0 0 160 200. Side profile (facing right).
// idle-breathe CSS class on main <g> for slow breathing bob animation.

type P = { className?: string };

// ── Stage 0: Tiny sleeping pup — curled, grey/white, eyes closed ───────────────
function Wolf0({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="186" rx="34" ry="4.5" fill="#000" opacity="0.10"/>
      {/* Tail curled around body */}
      <path d="M 56 160 Q 38 150 44 134 Q 50 120 63 132"
        stroke="#BEC4CC" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Back paws — peek out from the rear of the curled body */}
      <ellipse cx="60" cy="179" rx="8" ry="4.5" fill="#BEC4CC"/>
      <ellipse cx="71" cy="181" rx="9" ry="5" fill="#C8CDD8"/>
      {/* Body */}
      <ellipse cx="83" cy="165" rx="30" ry="21" fill="#D4D8DF"/>
      {/* White belly */}
      <ellipse cx="83" cy="168" rx="17" ry="13" fill="#EAECF2" opacity="0.85"/>
      {/* Front paws — tucked forward under the chin */}
      <ellipse cx="109" cy="175" rx="9" ry="5" fill="#BEC4CC"/>
      <ellipse cx="119" cy="172" rx="10" ry="5.5" fill="#C8CDD8"/>
      {/* Head resting */}
      <ellipse cx="103" cy="151" rx="21" ry="17" fill="#D4D8DF"/>
      {/* Ear L */}
      <polygon points="89,137 84,121 99,129" fill="#BEC4CC"/>
      <polygon points="90,137 86,123 97,129" fill="#C8A09A" opacity="0.42"/>
      {/* Ear R */}
      <polygon points="108,134 107,119 118,127" fill="#BEC4CC"/>
      <polygon points="109,134 108,121 117,127" fill="#C8A09A" opacity="0.42"/>
      {/* Snout */}
      <ellipse cx="118" cy="155" rx="10" ry="8" fill="#BEC4CC"/>
      {/* Nose */}
      <ellipse cx="125" cy="152" rx="3.5" ry="2.5" fill="#252A3A"/>
      {/* Eyes closed */}
      <path d="M 98 148 Q 102.5 146.5 107 148" stroke="#4B5568" strokeWidth="2" strokeLinecap="round"/>
      {/* Zzz */}
      <text x="130" y="138" fill="#9BA4B8" fontSize="8" opacity="0.55" fontFamily="system-ui">z</text>
      <text x="134" y="130" fill="#9BA4B8" fontSize="10" opacity="0.40" fontFamily="system-ui">z</text>
    </svg>
  );
}

// ── Stage 1: Small pup sitting — standing, curious, light grey ────────────────
function Wolf1({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="187" rx="30" ry="4.5" fill="#000" opacity="0.11"/>
      {/* Tail sweeping back */}
      <path d="M 56 176 Q 40 162 46 144 Q 52 128 64 140"
        stroke="#B4BBC6" strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Haunches */}
      <ellipse cx="78" cy="170" rx="28" ry="17" fill="#C8CDD8"/>
      {/* Body */}
      <ellipse cx="78" cy="156" rx="22" ry="24" fill="#CBD0DA"/>
      {/* White chest */}
      <ellipse cx="78" cy="158" rx="12" ry="17" fill="#E6EAF2" opacity="0.7"/>
      {/* Neck */}
      <ellipse cx="78" cy="136" rx="13" ry="9" fill="#CBD0DA"/>
      {/* Head */}
      <ellipse cx="84" cy="122" rx="23" ry="21" fill="#CBD0DA"/>
      {/* Ear L */}
      <polygon points="72,107 67,88 84,100" fill="#B4BBC6"/>
      <polygon points="73,107 69,91 82,101" fill="#C0A096" opacity="0.42"/>
      {/* Ear R */}
      <polygon points="94,106 94,87 107,97" fill="#B4BBC6"/>
      <polygon points="95,106 95,89 106,98" fill="#C0A096" opacity="0.42"/>
      {/* Snout */}
      <ellipse cx="102" cy="127" rx="12" ry="9" fill="#B6BCC8"/>
      {/* Nose */}
      <ellipse cx="111" cy="124" rx="3.8" ry="3" fill="#21263A"/>
      {/* Eyes — open, curious */}
      <circle cx="85" cy="119" r="4.5" fill="#21263A"/>
      <circle cx="87.5" cy="117.5" r="1.8" fill="#FFF" opacity="0.55"/>
      {/* Front paws */}
      <ellipse cx="69" cy="183" rx="8" ry="5.5" fill="#C0C6D2"/>
      <ellipse cx="87" cy="185" rx="8" ry="5.5" fill="#C0C6D2"/>
    </svg>
  );
}

// ── Stage 2: Young wolf standing — side profile, alert, medium grey ───────────
function Wolf2({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="188" rx="55" ry="5" fill="#000" opacity="0.12"/>
      {/* Tail up and back */}
      <path d="M 36 140 Q 20 120 26 100 Q 32 82 46 96"
        stroke="#8E97A6" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Hind legs */}
      <rect x="38" y="150" width="14" height="36" rx="6" fill="#909AA8"/>
      <rect x="56" y="152" width="13" height="34" rx="6" fill="#8A9399"/>
      <ellipse cx="45" cy="185" rx="9" ry="5.5" fill="#828C9A"/>
      <ellipse cx="62" cy="184" rx="8" ry="5.5" fill="#828C9A"/>
      {/* Body */}
      <ellipse cx="84" cy="144" rx="52" ry="30" fill="#9BA3AF"/>
      {/* Belly lighter */}
      <ellipse cx="108" cy="152" rx="20" ry="20" fill="#C8CED8" opacity="0.50"/>
      {/* Neck */}
      <path d="M 108 122 Q 116 120 120 132 Q 124 144 116 146 Q 108 148 104 138 Q 100 128 108 122Z" fill="#9BA3AF"/>
      {/* Head */}
      <ellipse cx="120" cy="116" rx="25" ry="21" fill="#9BA3AF"/>
      {/* Ear L */}
      <polygon points="109,101 104,82 120,93" fill="#8A939F"/>
      <polygon points="110,101 106,85 118,94" fill="#B89080" opacity="0.42"/>
      {/* Ear R */}
      <polygon points="128,99 130,80 140,92" fill="#8A939F"/>
      <polygon points="129,99 131,83 139,93" fill="#B89080" opacity="0.42"/>
      {/* Snout */}
      <ellipse cx="138" cy="123" rx="13" ry="10" fill="#8A939F"/>
      {/* Nose */}
      <ellipse cx="147" cy="120" rx="4" ry="3.2" fill="#1A1E2E"/>
      {/* Eye */}
      <circle cx="124" cy="110" r="5" fill="#1A1E2E"/>
      <circle cx="126.5" cy="108.5" r="2" fill="#FFF" opacity="0.55"/>
      {/* Front legs */}
      <rect x="100" y="158" width="14" height="28" rx="6" fill="#909AA8"/>
      <rect x="118" y="160" width="13" height="26" rx="6" fill="#8A9399"/>
      <ellipse cx="107" cy="185" rx="9" ry="5.5" fill="#828C9A"/>
      <ellipse cx="124" cy="184" rx="8" ry="5.5" fill="#828C9A"/>
    </svg>
  );
}

// ── Stage 3: Adolescent wolf — stronger, blue-grey, amber eyes waking ─────────
function Wolf3({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="189" rx="58" ry="5.5" fill="#000" opacity="0.14"/>
      {/* Tail */}
      <path d="M 30 136 Q 13 114 20 93 Q 27 73 42 89"
        stroke="#6E7988" strokeWidth="9" strokeLinecap="round" fill="none"/>
      {/* Hind legs */}
      <rect x="32" y="148" width="16" height="38" rx="7" fill="#707A88"/>
      <rect x="52" y="150" width="14" height="36" rx="6" fill="#687280"/>
      <ellipse cx="40" cy="185" rx="10" ry="5.5" fill="#606A78"/>
      <ellipse cx="59" cy="185" rx="9" ry="5.5" fill="#606A78"/>
      {/* Body */}
      <ellipse cx="84" cy="140" rx="56" ry="32" fill="#7B8595"/>
      {/* Belly */}
      <ellipse cx="110" cy="150" rx="22" ry="22" fill="#A8B0BC" opacity="0.45"/>
      {/* Neck */}
      <path d="M 110 116 Q 120 114 124 127 Q 128 140 120 143 Q 112 146 107 135 Q 102 124 110 116Z" fill="#7B8595"/>
      {/* Head */}
      <ellipse cx="122" cy="109" rx="28" ry="23" fill="#7B8595"/>
      {/* Ear L */}
      <polygon points="109,94 103,73 122,85" fill="#6B7585"/>
      <polygon points="110,94 105,76 120,86" fill="#A87868" opacity="0.40"/>
      {/* Ear R */}
      <polygon points="130,92 133,72 144,85" fill="#6B7585"/>
      <polygon points="131,92 134,75 143,86" fill="#A87868" opacity="0.40"/>
      {/* Snout */}
      <ellipse cx="142" cy="117" rx="14" ry="11" fill="#6E7888"/>
      {/* Nose */}
      <ellipse cx="152" cy="113" rx="4.5" ry="3.5" fill="#181B28"/>
      {/* Eye — amber starting */}
      <circle cx="126" cy="103" r="5.5" fill="#181B28"/>
      <circle cx="127" cy="102" r="3" fill="#C4873A" opacity="0.9"/>
      <circle cx="128.5" cy="100.5" r="1.5" fill="#FFE0A0" opacity="0.7"/>
      {/* Front legs */}
      <rect x="100" y="156" width="16" height="30" rx="7" fill="#707A88"/>
      <rect x="120" y="158" width="14" height="28" rx="6" fill="#687280"/>
      <ellipse cx="108" cy="185" rx="10" ry="5.5" fill="#606A78"/>
      <ellipse cx="127" cy="185" rx="9" ry="5.5" fill="#606A78"/>
    </svg>
  );
}

// ── Stage 4: Adult wolf — full coat, confident stance, dark charcoal ──────────
function Wolf4({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="190" rx="62" ry="6" fill="#000" opacity="0.16"/>
      {/* Tail — more prominent */}
      <path d="M 24 130 Q 6 106 13 82 Q 20 60 38 78"
        stroke="#56606E" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <path d="M 24 130 Q 8 108 14 84 Q 21 62 38 80"
        stroke="#7A8695" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.30"/>
      {/* Hind legs */}
      <rect x="28" y="146" width="17" height="40" rx="7" fill="#58626E"/>
      <rect x="50" y="148" width="15" height="38" rx="7" fill="#505A66"/>
      <ellipse cx="36.5" cy="185" rx="11" ry="6" fill="#4A545E"/>
      <ellipse cx="57.5" cy="185" rx="10" ry="6" fill="#4A545E"/>
      {/* Body */}
      <ellipse cx="86" cy="136" rx="62" ry="36" fill="#56616F"/>
      {/* Fur texture on back */}
      <path d="M 30 118 Q 50 108 70 114 Q 90 106 110 112 Q 130 108 148 116"
        stroke="#4A545E" strokeWidth="2.5" fill="none" opacity="0.55"/>
      {/* Belly/chest */}
      <ellipse cx="116" cy="148" rx="25" ry="25" fill="#8090A0" opacity="0.38"/>
      {/* Neck */}
      <path d="M 116 110 Q 128 107 132 122 Q 136 137 128 140 Q 120 143 114 132 Q 108 121 116 110Z" fill="#56616F"/>
      {/* Head */}
      <ellipse cx="128" cy="103" rx="30" ry="25" fill="#56616F"/>
      {/* Ear L */}
      <polygon points="114,87 107,63 129,76" fill="#474F5D"/>
      <polygon points="115,87 109,67 127,77" fill="#9A7060" opacity="0.40"/>
      {/* Ear R */}
      <polygon points="136,84 140,61 154,75" fill="#474F5D"/>
      <polygon points="137,84 141,64 153,76" fill="#9A7060" opacity="0.40"/>
      {/* Snout */}
      <ellipse cx="150" cy="112" rx="14" ry="11" fill="#48525E"/>
      {/* Nose */}
      <ellipse cx="159" cy="107" rx="5" ry="4" fill="#131520"/>
      {/* Eye — amber */}
      <circle cx="132" cy="97" r="6" fill="#131520"/>
      <circle cx="133" cy="96" r="3.5" fill="#C4873A"/>
      <circle cx="135" cy="94.5" r="1.8" fill="#FFE8B0" opacity="0.75"/>
      {/* Muzzle detail */}
      <path d="M 144 115 Q 148 117 152 115" stroke="#38424E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Front legs */}
      <rect x="104" y="154" width="17" height="32" rx="7" fill="#58626E"/>
      <rect x="126" y="156" width="15" height="30" rx="7" fill="#505A66"/>
      <ellipse cx="112.5" cy="185" rx="11" ry="6" fill="#4A545E"/>
      <ellipse cx="133.5" cy="185" rx="10" ry="6" fill="#4A545E"/>
    </svg>
  );
}

// ── Stage 5: Strong wolf — battle-worn, fierce amber eyes, dark charcoal ──────
function Wolf5({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ambient eye glow on ground */}
      <ellipse cx="136" cy="190" rx="18" ry="4" fill="#C4873A" opacity="0.06"/>
      <ellipse cx="80" cy="192" rx="64" ry="6" fill="#000" opacity="0.18"/>
      {/* Tail — raised, bushy */}
      <path d="M 20 126 Q 2 100 9 74 Q 16 50 36 70"
        stroke="#3E4C5A" strokeWidth="13" strokeLinecap="round" fill="none"/>
      <path d="M 20 126 Q 4 102 10 76 Q 17 52 36 72"
        stroke="#5A6878" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.25"/>
      {/* Hind legs (slight crouch) */}
      <rect x="22" y="148" width="18" height="38" rx="8" fill="#3E4856"/>
      <rect x="46" y="150" width="16" height="36" rx="7" fill="#38424E"/>
      <ellipse cx="31" cy="185" rx="12" ry="6.5" fill="#32404A"/>
      <ellipse cx="54" cy="185" rx="11" ry="6.5" fill="#32404A"/>
      {/* Body */}
      <ellipse cx="84" cy="132" rx="66" ry="38" fill="#3C4856"/>
      {/* Fur texture */}
      <path d="M 22 112 Q 45 100 68 108 Q 90 100 112 106 Q 135 100 152 110"
        stroke="#2E3A46" strokeWidth="3" fill="none" opacity="0.6"/>
      <path d="M 28 124 Q 50 115 72 120 Q 95 114 116 120 Q 138 114 152 122"
        stroke="#2E3A46" strokeWidth="2" fill="none" opacity="0.35"/>
      {/* Belly */}
      <ellipse cx="118" cy="144" rx="26" ry="26" fill="#607080" opacity="0.30"/>
      {/* Neck */}
      <path d="M 116 104 Q 130 101 135 118 Q 140 135 131 138 Q 122 142 116 130 Q 110 118 116 104Z" fill="#3C4856"/>
      {/* Head */}
      <ellipse cx="130" cy="97" rx="32" ry="26" fill="#3C4856"/>
      {/* Battle scar on head */}
      <path d="M 122 88 Q 125 96 123 104" stroke="#2A3441" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* Ear L */}
      <polygon points="114,79 106,53 131,68" fill="#30404C"/>
      <polygon points="115,79 108,57 129,70" fill="#8A6052" opacity="0.38"/>
      {/* Ear R */}
      <polygon points="140,77 145,51 160,67" fill="#30404C"/>
      <polygon points="141,77 146,55 159,68" fill="#8A6052" opacity="0.38"/>
      {/* Snout */}
      <ellipse cx="153" cy="106" rx="15" ry="12" fill="#2E3C4A"/>
      {/* Nose */}
      <ellipse cx="162" cy="101" rx="5.5" ry="4.5" fill="#0E1118"/>
      {/* Eye — bright amber, intense */}
      <circle cx="134" cy="90" r="7" fill="#0E1118"/>
      <circle cx="134.5" cy="89.5" r="4.5" fill="#E8A040"/>
      <circle cx="136.5" cy="87.5" r="2" fill="#FFE8B0" opacity="0.8"/>
      {/* Eye glow halo */}
      <circle cx="134.5" cy="89.5" r="7" fill="#E8A040" opacity="0.10"/>
      {/* Muzzle */}
      <path d="M 146 108 Q 151 111 156 108" stroke="#243240" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      {/* Front legs */}
      <rect x="104" y="152" width="18" height="34" rx="8" fill="#3E4856"/>
      <rect x="128" y="154" width="16" height="32" rx="7" fill="#38424E"/>
      <ellipse cx="113" cy="185" rx="12" ry="6.5" fill="#32404A"/>
      <ellipse cx="136" cy="185" rx="11" ry="6.5" fill="#32404A"/>
    </svg>
  );
}

// ── Stage 6: Alpha wolf — dominant, near-black, glowing amber eyes ────────────
function Wolf6({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eye aura on ground */}
      <ellipse cx="138" cy="192" rx="22" ry="5" fill="#E8A040" opacity="0.08"/>
      <ellipse cx="80" cy="193" rx="65" ry="6.5" fill="#000" opacity="0.22"/>
      {/* Tail — raised high, alpha */}
      <path d="M 16 122 Q -2 92 5 64 Q 12 38 34 60"
        stroke="#212938" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M 16 122 Q -1 94 6 66 Q 13 40 34 62"
        stroke="#384860" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.20"/>
      {/* Hind legs */}
      <rect x="18" y="146" width="19" height="42" rx="8" fill="#21303E"/>
      <rect x="42" y="148" width="17" height="40" rx="8" fill="#1B2A38"/>
      <ellipse cx="27.5" cy="187" rx="13" ry="7" fill="#182430"/>
      <ellipse cx="50.5" cy="187" rx="12" ry="7" fill="#182430"/>
      {/* Body */}
      <ellipse cx="86" cy="128" rx="70" ry="40" fill="#212938"/>
      {/* Neck mane suggestion */}
      <path d="M 120 98 Q 134 92 140 100 Q 148 110 144 118 Q 140 126 130 126 Q 118 124 114 114 Q 110 104 120 98Z" fill="#1A2230"/>
      {/* Fur texture */}
      <path d="M 18 106 Q 44 94 70 102 Q 94 94 118 100 Q 140 94 158 104"
        stroke="#18212E" strokeWidth="3.5" fill="none" opacity="0.7"/>
      <path d="M 22 118 Q 48 108 74 114 Q 98 108 122 114 Q 146 108 158 116"
        stroke="#18212E" strokeWidth="2" fill="none" opacity="0.45"/>
      {/* Belly */}
      <ellipse cx="122" cy="140" rx="28" ry="28" fill="#384860" opacity="0.25"/>
      {/* Head — raised, dominant */}
      <ellipse cx="132" cy="89" rx="34" ry="28" fill="#212938"/>
      {/* Ear L */}
      <polygon points="116,70 107,41 135,56" fill="#182030"/>
      <polygon points="117,70 109,45 133,58" fill="#704838" opacity="0.40"/>
      {/* Ear R */}
      <polygon points="144,67 150,39 164,55" fill="#182030"/>
      <polygon points="145,67 151,43 163,56" fill="#704838" opacity="0.40"/>
      {/* Snout */}
      <ellipse cx="156" cy="98" rx="16" ry="13" fill="#192028"/>
      {/* Nose */}
      <ellipse cx="165" cy="92" rx="6" ry="5" fill="#080B14"/>
      {/* Eye — glowing amber */}
      <circle cx="136" cy="82" r="8" fill="#080B14"/>
      <circle cx="136.5" cy="81.5" r="5" fill="#E8A040"/>
      <circle cx="139" cy="79" r="2.2" fill="#FFE8A0" opacity="0.85"/>
      {/* Eye glow layers */}
      <circle cx="136.5" cy="81.5" r="9" fill="#E8A040" opacity="0.12"/>
      <circle cx="136.5" cy="81.5" r="13" fill="#C4873A" opacity="0.06"/>
      {/* Muzzle line */}
      <path d="M 148 102 Q 154 106 160 102" stroke="#101820" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75"/>
      {/* Front legs */}
      <rect x="106" y="150" width="19" height="36" rx="8" fill="#21303E"/>
      <rect x="132" y="152" width="17" height="34" rx="8" fill="#1B2A38"/>
      <ellipse cx="115.5" cy="185" rx="13" ry="7" fill="#182430"/>
      <ellipse cx="140.5" cy="185" rx="12" ry="7" fill="#182430"/>
    </svg>
  );
}

// ── Stage 7: Legendary wolf — glowing eyes, full alpha, amber aura ────────────
function Wolf7({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ambient aura floor glow */}
      <ellipse cx="140" cy="193" rx="30" ry="7" fill="#C4873A" opacity="0.15"/>
      <ellipse cx="80" cy="194" rx="66" ry="7" fill="#000" opacity="0.28"/>
      {/* Distant aura — body glow */}
      <ellipse cx="92" cy="130" rx="75" ry="55" fill="#C4873A" opacity="0.04"/>
      {/* Tail — fully raised, legendary */}
      <path d="M 12 118 Q -8 86 0 54 Q 8 24 32 48"
        stroke="#0D1520" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d="M 12 118 Q -6 88 1 56 Q 9 26 32 50"
        stroke="#2A3C52" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.18"/>
      {/* Tail tip glow */}
      <circle cx="32" cy="48" r="8" fill="#C4873A" opacity="0.14"/>
      {/* Hind legs */}
      <rect x="14" y="144" width="20" height="44" rx="9" fill="#0F1C28"/>
      <rect x="38" y="146" width="18" height="42" rx="8" fill="#0A1620"/>
      <ellipse cx="24" cy="187" rx="14" ry="7.5" fill="#081218"/>
      <ellipse cx="47" cy="187" rx="13" ry="7.5" fill="#081218"/>
      {/* Body */}
      <ellipse cx="86" cy="124" rx="72" ry="42" fill="#0D1520"/>
      {/* Body rim light (ambient amber) */}
      <ellipse cx="86" cy="124" rx="72" ry="42" fill="none"
        stroke="#C4873A" strokeWidth="1.5" opacity="0.12"/>
      {/* Neck mane — flowing */}
      <path d="M 122 92 Q 138 85 144 95 Q 152 108 148 118 Q 144 128 132 128 Q 120 126 116 114 Q 112 102 122 92Z"
        fill="#0A1218"/>
      <path d="M 118 96 Q 128 90 134 98" stroke="#C4873A" strokeWidth="1" fill="none" opacity="0.20"/>
      {/* Fur texture — multi layer */}
      <path d="M 14 100 Q 42 86 70 96 Q 96 86 122 92 Q 146 86 160 96"
        stroke="#0A1218" strokeWidth="4" fill="none" opacity="0.8"/>
      <path d="M 18 112 Q 46 100 74 108 Q 100 100 126 106 Q 150 100 160 110"
        stroke="#0A1218" strokeWidth="2.5" fill="none" opacity="0.55"/>
      <path d="M 22 122 Q 50 114 78 120 Q 104 114 130 120"
        stroke="#0A1218" strokeWidth="1.5" fill="none" opacity="0.35"/>
      {/* Belly */}
      <ellipse cx="124" cy="136" rx="30" ry="30" fill="#3A5068" opacity="0.18"/>
      {/* Head — powerful, raised */}
      <ellipse cx="134" cy="82" rx="36" ry="30" fill="#0D1520"/>
      {/* Head rim light */}
      <ellipse cx="134" cy="82" rx="36" ry="30" fill="none"
        stroke="#C4873A" strokeWidth="1" opacity="0.15"/>
      {/* Ear L */}
      <polygon points="116,62 105,29 138,48" fill="#0A1218"/>
      <polygon points="118,63 109,34 136,50" fill="#5C3820" opacity="0.45"/>
      {/* Ear L tip glow */}
      <circle cx="108" cy="31" r="5" fill="#C4873A" opacity="0.12"/>
      {/* Ear R */}
      <polygon points="148,59 156,27 172,45" fill="#0A1218"/>
      <polygon points="150,60 157,31 170,46" fill="#5C3820" opacity="0.45"/>
      {/* Snout */}
      <ellipse cx="160" cy="92" rx="17" ry="14" fill="#0A1420"/>
      {/* Nose */}
      <ellipse cx="170" cy="85" rx="6.5" ry="5.5" fill="#040608"/>
      {/* Nose highlight */}
      <circle cx="167" cy="83.5" r="2" fill="#FFF" opacity="0.20"/>
      {/* Eye outer glow — multi layer */}
      <circle cx="138" cy="74" r="18" fill="#C4873A" opacity="0.06"/>
      <circle cx="138" cy="74" r="13" fill="#E8A040" opacity="0.10"/>
      <circle cx="138" cy="74" r="9.5" fill="#FFB830" opacity="0.15"/>
      {/* Eye */}
      <circle cx="138" cy="74" r="8" fill="#040608"/>
      <circle cx="138.5" cy="73.5" r="5.5" fill="#FFB830"/>
      <circle cx="141" cy="71" r="2.5" fill="#FFFBE0" opacity="0.90"/>
      {/* Eye sharp inner ring */}
      <circle cx="138.5" cy="73.5" r="5.5" fill="none" stroke="#FFA020" strokeWidth="0.8" opacity="0.6"/>
      {/* Muzzle */}
      <path d="M 150 97 Q 157 102 164 97" stroke="#08101A" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Front legs */}
      <rect x="108" y="148" width="20" height="38" rx="9" fill="#0F1C28"/>
      <rect x="135" y="150" width="18" height="36" rx="8" fill="#0A1620"/>
      <ellipse cx="118" cy="186" rx="14" ry="7.5" fill="#081218"/>
      <ellipse cx="144" cy="186" rx="13" ry="7.5" fill="#081218"/>
      {/* Legendary sparkle particles */}
      <circle cx="92" cy="64" r="2" fill="#FFB830" opacity="0.50"/>
      <circle cx="72" cy="78" r="1.5" fill="#E8A040" opacity="0.40"/>
      <circle cx="158" cy="70" r="1.5" fill="#FFB830" opacity="0.45"/>
      <circle cx="104" cy="52" r="1.2" fill="#FFE090" opacity="0.55"/>
      <circle cx="164" cy="84" r="1" fill="#FFB830" opacity="0.50"/>
    </svg>
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
        {/* Left ear back: base wide at head, narrows sharply to tip at top */}
        <polygon points="34,78 16,0 72,50" fill="#5A6A7C"/>
        {/* Right ear back */}
        <polygon points="126,78 144,0 88,50" fill="#5A6A7C"/>

        {/* ── Head — taller/narrower oval for a wolf (not round cat head) */}
        <ellipse cx="80" cy="76" rx="46" ry="52" fill="#8898AA"/>

        {/* Top-of-head darker saddle — classic wolf dorsal stripe */}
        <path d="M 36 62 Q 58 38 80 42 Q 102 38 124 62 Q 106 44 80 44 Q 54 44 36 62Z"
          fill="#5A6A7C" opacity="0.72"/>

        {/* ── Ear inner — pink-tinted, tall ─────────────────────────── */}
        <polygon points="38,76 22,4 68,52" fill="#C4A0A8" opacity="0.65"/>
        <polygon points="122,76 138,4 92,52" fill="#C4A0A8" opacity="0.65"/>
        {/* Ear inner lighter tip */}
        <polygon points="40,58 28,12 62,48" fill="#DCC0C4" opacity="0.40"/>
        <polygon points="120,58 132,12 98,48" fill="#DCC0C4" opacity="0.40"/>

        {/* ── Brow band ─────────────────────────────────────────────── */}
        <ellipse cx="80" cy="66" rx="40" ry="10" fill="#9AAAB8" opacity="0.35"/>

        {/* ── Heavy angular wolf brow lines — prominent furrow ─────── */}
        <path d="M 42 67 Q 56 58 66 63" stroke="#3A4A62" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M 118 67 Q 104 58 94 63" stroke="#3A4A62" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55"/>

        {/* ── Eyes — almond-shaped blue eyes ─────────────────────────── */}
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

        {/* ── Muzzle — elongated angular wolf snout (replaces cat cheeks) */}
        {/* Gray outer muzzle block — wider at top, slight taper */}
        <path d="M 54 88 Q 80 82 106 88 L 104 122 Q 80 130 56 122 Z" fill="#96A4B4"/>
        {/* White inner muzzle — the pale snout area distinctive to wolves */}
        <path d="M 58 93 Q 80 87 102 93 L 100 120 Q 80 127 60 120 Z" fill="#D4DFF2"/>
        {/* Muzzle centre ridge (philtrum) */}
        <path d="M 77 88 Q 80 84 83 88 L 83 104 Q 80 107 77 104 Z" fill="#B8C8DC" opacity="0.65"/>

        {/* ── Nose — large, dark, unmistakably wolf ──────────────────── */}
        <ellipse cx="80" cy="91" rx="15" ry="11" fill="#0E1420"/>
        {/* Nose arch ridge */}
        <path d="M 68 91 Q 80 83 92 91" stroke="#1A2436" strokeWidth="2" fill="none" opacity="0.55"/>
        {/* Nose shine */}
        <ellipse cx="74" cy="86" rx="5.5" ry="3.5" fill="#FFFFFF" opacity="0.22"/>

        {/* ── Mouth — set lower on the long muzzle ──────────────────── */}
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

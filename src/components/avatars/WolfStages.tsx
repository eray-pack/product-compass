// Wolf companion — 8 evolution stages in the 2D cartoon-tree aesthetic.
// viewBox 0 0 400 300, centered at (200, 268) matching CartoonTree exactly.
// Golden circular ground badge intensifies with each stage of growth.
// Color: light grey pup → near-black legendary, amber eyes from stage 3.

type P = { className?: string };

const GOLD = "#C4873A"; // matches CartoonTree's golden glow element

// ── Stage 0: Tiny sleeping pup — curled, eyes closed, first night ─────────────
function Wolf0({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(2.8)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="28" ry="5.5" fill="#2D3824" opacity="0.65" />
        {/* Golden disc — first faint glow */}
        <ellipse cx="0" cy="-1" rx="22" ry="3" fill={GOLD} opacity="0.08" />

        {/* Curled tail wrapping around body */}
        <path d="M -6 -10 Q -28 -20 -24 -36 Q -18 -48 -7 -40"
          stroke="#BEC4CC" strokeWidth="8" strokeLinecap="round" fill="none"/>

        {/* Back paws peeking out */}
        <ellipse cx="-14" cy="-4" rx="9" ry="4.5" fill="#BEC4CC"/>
        <ellipse cx="6" cy="-4" rx="9" ry="4.5" fill="#C4C8D4"/>

        {/* Curled body */}
        <ellipse cx="4" cy="-22" rx="22" ry="13" fill="#D4D8E0"/>
        {/* Soft belly patch */}
        <ellipse cx="4" cy="-20" rx="13" ry="8" fill="#EAECF4" opacity="0.82"/>

        {/* Front paws tucked under chin */}
        <ellipse cx="14" cy="-8" rx="10" ry="4.5" fill="#C8CCD6"/>
        <ellipse cx="26" cy="-7" rx="10" ry="5" fill="#CDD1DA"/>

        {/* Head resting on body — side-ish view */}
        <ellipse cx="18" cy="-49" rx="20" ry="16" fill="#D4D8E0"/>

        {/* Ear */}
        <polygon points="8,-47 4,-70 19,-55" fill="#BEC4CC"/>
        <polygon points="9,-48 7,-66 18,-56" fill="#C4A0A8" opacity="0.55"/>
        {/* Ear R (mostly hidden) */}
        <polygon points="26,-45 28,-64 35,-54" fill="#BEC4CC"/>
        <polygon points="27,-46 29,-61 34,-55" fill="#C4A0A8" opacity="0.45"/>

        {/* Snout */}
        <ellipse cx="33" cy="-44" rx="9" ry="7" fill="#C4C8D2"/>
        {/* Nose */}
        <ellipse cx="40" cy="-46" rx="3.5" ry="2.5" fill="#1A1E2A"/>
        {/* Nose shine */}
        <circle cx="38.5" cy="-48" r="1.2" fill="#FFF" opacity="0.22"/>

        {/* Eyes — closed, sleeping */}
        <path d="M 11 -54 Q 14.5 -56 18 -54" stroke="#4A5060" strokeWidth="1.8" strokeLinecap="round"/>

        {/* Zzz bubbles */}
        <text x="42" y="-53" fill="#9BA4B8" fontSize="7" opacity="0.55" fontFamily="system-ui">z</text>
        <text x="46" y="-62" fill="#9BA4B8" fontSize="9" opacity="0.38" fontFamily="system-ui">z</text>
      </g>
    </svg>
  );
}

// ── Stage 1: Small sitting pup — wide eyes, round, curious ───────────────────
function Wolf1({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(2.1)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="32" ry="6" fill="#2D3824" opacity="0.68" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-1" rx="26" ry="3.5" fill={GOLD} opacity="0.12" />

        {/* Tail sweeping left */}
        <path d="M -20 -16 Q -40 -36 -34 -56"
          stroke="#B4BBC6" strokeWidth="9" strokeLinecap="round" fill="none"/>

        {/* Front paws on ground */}
        <ellipse cx="-14" cy="-6" rx="10" ry="5" fill="#C0C6D2"/>
        <ellipse cx="14" cy="-6" rx="10" ry="5" fill="#C0C6D2"/>

        {/* Chunky puppy body */}
        <ellipse cx="0" cy="-32" rx="20" ry="22" fill="#CACFD9"/>
        {/* Chest patch */}
        <ellipse cx="0" cy="-28" rx="12" ry="14" fill="#E2E6EE" opacity="0.72"/>

        {/* Neck */}
        <ellipse cx="0" cy="-57" rx="13" ry="8" fill="#CACFD9"/>

        {/* Big round puppy head */}
        <ellipse cx="0" cy="-75" rx="22" ry="20" fill="#CACFD9"/>

        {/* Ear L */}
        <polygon points="-20,-73 -26,-99 -8,-65" fill="#B4BBC6"/>
        <polygon points="-19,-74 -24,-95 -9,-67" fill="#C4A0A8" opacity="0.65"/>
        {/* Ear R */}
        <polygon points="20,-73 26,-99 8,-65" fill="#B4BBC6"/>
        <polygon points="19,-74 24,-95 9,-67" fill="#C4A0A8" opacity="0.65"/>

        {/* Snout */}
        <ellipse cx="0" cy="-65" rx="13" ry="9" fill="#B8BDCA"/>
        {/* Nose */}
        <ellipse cx="0" cy="-69" rx="5.5" ry="4" fill="#1A1E2A"/>
        {/* Nose shine */}
        <circle cx="-2" cy="-71.5" r="1.5" fill="#FFF" opacity="0.22"/>

        {/* Eyes — open, curious, dark */}
        <circle cx="-11" cy="-82" r="4.5" fill="#1A1E2A"/>
        <circle cx="11" cy="-82" r="4.5" fill="#1A1E2A"/>
        {/* Eye highlights */}
        <circle cx="-9.5" cy="-84" r="1.8" fill="#FFF" opacity="0.70"/>
        <circle cx="12.5" cy="-84" r="1.8" fill="#FFF" opacity="0.70"/>
      </g>
    </svg>
  );
}

// ── Stage 2: Young wolf sitting — more defined, ears perked, alert ────────────
function Wolf2({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.65)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="38" ry="6" fill="#2D3824" opacity="0.70" />
        {/* Golden disc — growing */}
        <ellipse cx="0" cy="-1" rx="32" ry="4" fill={GOLD} opacity="0.18" />

        {/* Tail — wider sweep */}
        <path d="M -24 -18 Q -46 -44 -40 -70"
          stroke="#A8B0BC" strokeWidth="10" strokeLinecap="round" fill="none"/>
        {/* Tail mid-stripe highlight */}
        <path d="M -24 -18 Q -44 -42 -38 -66"
          stroke="#C4CAD6" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.50"/>

        {/* Front paws */}
        <ellipse cx="-16" cy="-6" rx="11" ry="5.5" fill="#AEBAC6"/>
        <ellipse cx="16" cy="-6" rx="11" ry="5.5" fill="#AEBAC6"/>

        {/* Body — sitting upright */}
        <ellipse cx="0" cy="-38" rx="24" ry="26" fill="#B4BCC8"/>
        {/* Belly */}
        <ellipse cx="0" cy="-33" rx="14" ry="17" fill="#D8DCE8" opacity="0.72"/>

        {/* Neck */}
        <ellipse cx="0" cy="-68" rx="16" ry="10" fill="#B4BCC8"/>

        {/* Head */}
        <ellipse cx="0" cy="-88" rx="26" ry="22" fill="#B4BCC8"/>

        {/* Ear L — taller, more wolfish */}
        <polygon points="-24,-86 -30,-118 -10,-77" fill="#A0AABA"/>
        <polygon points="-23,-87 -28,-113 -12,-78" fill="#C4A0A8" opacity="0.65"/>
        {/* Ear R */}
        <polygon points="24,-86 30,-118 10,-77" fill="#A0AABA"/>
        <polygon points="23,-87 28,-113 12,-78" fill="#C4A0A8" opacity="0.65"/>

        {/* Snout */}
        <ellipse cx="0" cy="-77" rx="16" ry="11" fill="#A4AEBB"/>
        {/* Nose */}
        <ellipse cx="0" cy="-81" rx="7" ry="5" fill="#1A1E2A"/>
        {/* Nose shine */}
        <circle cx="-2.5" cy="-84" r="2" fill="#FFF" opacity="0.22"/>

        {/* Eyes — alert, dark */}
        <circle cx="-13" cy="-97" r="5.5" fill="#1A1E2A"/>
        <circle cx="13" cy="-97" r="5.5" fill="#1A1E2A"/>
        {/* Highlights */}
        <circle cx="-11" cy="-99.5" r="2.2" fill="#FFF" opacity="0.68"/>
        <circle cx="15" cy="-99.5" r="2.2" fill="#FFF" opacity="0.68"/>
      </g>
    </svg>
  );
}

// ── Stage 3: Adolescent wolf — standing, first amber in the eyes ──────────────
function Wolf3({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.30)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="44" ry="6.5" fill="#2D3824" opacity="0.72" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="38" ry="5" fill={GOLD} opacity="0.25" />

        {/* Tail — raised halfway */}
        <path d="M -28 -24 Q -56 -62 -50 -98"
          stroke="#7A8490" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <path d="M -28 -24 Q -54 -60 -48 -94"
          stroke="#A0AAB4" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.42"/>

        {/* 4 paws visible — standing */}
        <ellipse cx="-22" cy="-6" rx="13" ry="6" fill="#80909E"/>
        <ellipse cx="-8" cy="-5" rx="10" ry="5.5" fill="#8898A4"/>
        <ellipse cx="8" cy="-5" rx="10" ry="5.5" fill="#8898A4"/>
        <ellipse cx="22" cy="-6" rx="13" ry="6" fill="#80909E"/>

        {/* Front legs */}
        <ellipse cx="-8" cy="-24" rx="8" ry="20" fill="#889299"/>
        <ellipse cx="8" cy="-24" rx="8" ry="20" fill="#889299"/>

        {/* Body */}
        <ellipse cx="0" cy="-68" rx="28" ry="30" fill="#8A949F"/>
        {/* Belly/chest */}
        <ellipse cx="0" cy="-62" rx="17" ry="20" fill="#B8C0CC" opacity="0.50"/>

        {/* Neck */}
        <ellipse cx="0" cy="-101" rx="18" ry="11" fill="#8A949F"/>

        {/* Head */}
        <ellipse cx="0" cy="-124" rx="30" ry="26" fill="#8A949F"/>

        {/* Ear L */}
        <polygon points="-28,-122 -36,-158 -12,-110" fill="#7A848E"/>
        <polygon points="-26,-123 -33,-152 -14,-111" fill="#C4A0A8" opacity="0.62"/>
        {/* Ear R */}
        <polygon points="28,-122 36,-158 12,-110" fill="#7A848E"/>
        <polygon points="26,-123 33,-152 14,-111" fill="#C4A0A8" opacity="0.62"/>

        {/* Snout */}
        <ellipse cx="0" cy="-112" rx="19" ry="13" fill="#7C8895"/>
        {/* Nose */}
        <ellipse cx="0" cy="-117" rx="8.5" ry="6" fill="#181C28"/>
        {/* Nose shine */}
        <circle cx="-3" cy="-120" r="2.5" fill="#FFF" opacity="0.22"/>

        {/* Eyes — amber iris waking */}
        <circle cx="-16" cy="-134" r="6.5" fill="#181C28"/>
        <circle cx="16" cy="-134" r="6.5" fill="#181C28"/>
        {/* Amber iris */}
        <circle cx="-16" cy="-134" r="3.5" fill={GOLD} opacity="0.90"/>
        <circle cx="16" cy="-134" r="3.5" fill={GOLD} opacity="0.90"/>
        {/* Eye shine */}
        <circle cx="-14" cy="-136.5" r="1.5" fill="#FFE0A0" opacity="0.72"/>
        <circle cx="18" cy="-136.5" r="1.5" fill="#FFE0A0" opacity="0.72"/>
      </g>
    </svg>
  );
}

// ── Stage 4: Adult wolf — proud stance, full amber eyes ──────────────────────
function Wolf4({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.05)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="52" ry="7.5" fill="#2D3824" opacity="0.76" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="46" ry="6" fill={GOLD} opacity="0.32" />

        {/* Tail — level, bushy */}
        <path d="M -32 -28 Q -66 -72 -60 -116"
          stroke="#505A66" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M -32 -28 Q -63 -69 -57 -112"
          stroke="#788090" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.30"/>

        {/* 4 paws */}
        <ellipse cx="-26" cy="-7" rx="15" ry="7" fill="#4E5A66"/>
        <ellipse cx="-9" cy="-6" rx="11" ry="6" fill="#566070"/>
        <ellipse cx="9" cy="-6" rx="11" ry="6" fill="#566070"/>
        <ellipse cx="26" cy="-7" rx="15" ry="7" fill="#4E5A66"/>

        {/* Front legs — visible, sturdy */}
        <ellipse cx="-9" cy="-30" rx="9" ry="24" fill="#586070"/>
        <ellipse cx="9" cy="-30" rx="9" ry="24" fill="#586070"/>

        {/* Body */}
        <ellipse cx="0" cy="-84" rx="32" ry="36" fill="#566070"/>
        {/* Chest — lighter belly patch */}
        <ellipse cx="0" cy="-77" rx="19" ry="24" fill="#8090A0" opacity="0.40"/>

        {/* Fur texture strokes */}
        <path d="M -28 -62 Q 0 -54 28 -62" stroke="#48525E" strokeWidth="2" fill="none" opacity="0.45"/>
        <path d="M -30 -76 Q 0 -70 30 -76" stroke="#48525E" strokeWidth="1.5" fill="none" opacity="0.38"/>

        {/* Neck */}
        <ellipse cx="0" cy="-123" rx="20" ry="13" fill="#566070"/>

        {/* Head */}
        <ellipse cx="0" cy="-152" rx="34" ry="28" fill="#566070"/>

        {/* Ear L */}
        <polygon points="-32,-150 -42,-196 -14,-134" fill="#48525E"/>
        <polygon points="-30,-151 -38,-188 -16,-135" fill="#C4A0A8" opacity="0.60"/>
        {/* Ear R */}
        <polygon points="32,-150 42,-196 14,-134" fill="#48525E"/>
        <polygon points="30,-151 38,-188 16,-135" fill="#C4A0A8" opacity="0.60"/>

        {/* Snout */}
        <ellipse cx="0" cy="-138" rx="21" ry="14" fill="#4A5460"/>
        {/* Nose */}
        <ellipse cx="0" cy="-144" rx="9" ry="7" fill="#131620"/>
        {/* Nose shine */}
        <circle cx="-3.5" cy="-147.5" r="2.8" fill="#FFF" opacity="0.20"/>

        {/* Muzzle line */}
        <path d="M -9 -128 Q 0 -123 9 -128" stroke="#38424E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>

        {/* Eyes — full amber */}
        <circle cx="-18" cy="-163" r="7.5" fill="#131620"/>
        <circle cx="18" cy="-163" r="7.5" fill="#131620"/>
        {/* Amber iris — full, confident */}
        <circle cx="-18" cy="-163" r="4.5" fill={GOLD}/>
        <circle cx="18" cy="-163" r="4.5" fill={GOLD}/>
        {/* Eye shine */}
        <circle cx="-15.5" cy="-165.8" r="2" fill="#FFE8B0" opacity="0.78"/>
        <circle cx="20.5" cy="-165.8" r="2" fill="#FFE8B0" opacity="0.78"/>
      </g>
    </svg>
  );
}

// ── Stage 5: Strong wolf — battle-ready, bright amber, fur texture ────────────
function Wolf5({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.90)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="60" ry="8" fill="#2D3824" opacity="0.80" />
        {/* Golden disc — prominent */}
        <ellipse cx="0" cy="-2" rx="54" ry="6.5" fill={GOLD} opacity="0.42" />

        {/* Tail — raised, bushy */}
        <path d="M -36 -32 Q -74 -84 -68 -136"
          stroke="#36414E" strokeWidth="15" strokeLinecap="round" fill="none"/>
        <path d="M -36 -32 Q -71 -81 -65 -132"
          stroke="#607080" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.26"/>

        {/* 4 paws */}
        <ellipse cx="-30" cy="-8" rx="17" ry="7.5" fill="#323C48"/>
        <ellipse cx="-10" cy="-7" rx="12" ry="6.5" fill="#38424E"/>
        <ellipse cx="10" cy="-7" rx="12" ry="6.5" fill="#38424E"/>
        <ellipse cx="30" cy="-8" rx="17" ry="7.5" fill="#323C48"/>

        {/* Front legs */}
        <ellipse cx="-10" cy="-35" rx="10" ry="28" fill="#3C4856"/>
        <ellipse cx="10" cy="-35" rx="10" ry="28" fill="#3C4856"/>

        {/* Body — powerful */}
        <ellipse cx="0" cy="-100" rx="36" ry="42" fill="#3C4856"/>
        {/* Belly */}
        <ellipse cx="0" cy="-92" rx="22" ry="28" fill="#607080" opacity="0.32"/>

        {/* Fur texture lines */}
        <path d="M -34 -74 Q 0 -64 34 -74" stroke="#2E3A46" strokeWidth="2.5" fill="none" opacity="0.55"/>
        <path d="M -36 -90 Q 0 -82 36 -90" stroke="#2E3A46" strokeWidth="2" fill="none" opacity="0.45"/>
        <path d="M -34 -108 Q 0 -100 34 -108" stroke="#2E3A46" strokeWidth="1.5" fill="none" opacity="0.35"/>

        {/* Neck */}
        <ellipse cx="0" cy="-147" rx="24" ry="14" fill="#3C4856"/>

        {/* Head */}
        <ellipse cx="0" cy="-180" rx="38" ry="32" fill="#3C4856"/>

        {/* Ear L */}
        <polygon points="-36,-177 -47,-228 -16,-162" fill="#2E3A46"/>
        <polygon points="-34,-178 -43,-220 -18,-163" fill="#C4A0A8" opacity="0.58"/>
        {/* Ear R */}
        <polygon points="36,-177 47,-228 16,-162" fill="#2E3A46"/>
        <polygon points="34,-178 43,-220 18,-163" fill="#C4A0A8" opacity="0.58"/>

        {/* Snout */}
        <ellipse cx="0" cy="-165" rx="23" ry="15" fill="#2E3A46"/>
        {/* Nose */}
        <ellipse cx="0" cy="-171" rx="10" ry="7.5" fill="#0E1218"/>
        {/* Nose shine */}
        <circle cx="-4" cy="-175" r="3" fill="#FFF" opacity="0.18"/>

        {/* Muzzle line */}
        <path d="M -10 -151 Q 0 -146 10 -151" stroke="#243040" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.60"/>

        {/* Eyes — bright amber, fierce */}
        <circle cx="-20" cy="-193" r="8.5" fill="#0E1218"/>
        <circle cx="20" cy="-193" r="8.5" fill="#0E1218"/>
        {/* Bright amber iris */}
        <circle cx="-20" cy="-193" r="5.5" fill="#E8A040"/>
        <circle cx="20" cy="-193" r="5.5" fill="#E8A040"/>
        {/* Sharp highlight */}
        <circle cx="-17.5" cy="-196" r="2.2" fill="#FFE8B0" opacity="0.85"/>
        <circle cx="22.5" cy="-196" r="2.2" fill="#FFE8B0" opacity="0.85"/>
        {/* Subtle eye glow */}
        <circle cx="-20" cy="-193" r="9.5" fill="#E8A040" opacity="0.10"/>
        <circle cx="20" cy="-193" r="9.5" fill="#E8A040" opacity="0.10"/>
      </g>
    </svg>
  );
}

// ── Stage 6: Alpha wolf — dominant, glowing amber eyes, prominent mane ────────
function Wolf6({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.80)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="66" ry="9" fill="#2D3824" opacity="0.84" />
        {/* Golden disc — strong glow */}
        <ellipse cx="0" cy="-2" rx="60" ry="7" fill={GOLD} opacity="0.55" />

        {/* Eye aura on ground */}
        <ellipse cx="0" cy="-4" rx="40" ry="4" fill="#E8A040" opacity="0.06"/>

        {/* Tail — raised high */}
        <path d="M -40 -36 Q -82 -96 -76 -162"
          stroke="#1C2430" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <path d="M -40 -36 Q -79 -92 -72 -158"
          stroke="#405060" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.22"/>

        {/* 4 paws */}
        <ellipse cx="-34" cy="-9" rx="19" ry="8.5" fill="#18222E"/>
        <ellipse cx="-12" cy="-8" rx="14" ry="7.5" fill="#1E2A36"/>
        <ellipse cx="12" cy="-8" rx="14" ry="7.5" fill="#1E2A36"/>
        <ellipse cx="34" cy="-9" rx="19" ry="8.5" fill="#18222E"/>

        {/* Front legs — powerful */}
        <ellipse cx="-12" cy="-40" rx="11" ry="32" fill="#202C38"/>
        <ellipse cx="12" cy="-40" rx="11" ry="32" fill="#202C38"/>

        {/* Body */}
        <ellipse cx="0" cy="-116" rx="40" ry="46" fill="#202C38"/>
        {/* Belly */}
        <ellipse cx="0" cy="-107" rx="24" ry="32" fill="#384858" opacity="0.28"/>

        {/* Fur texture — multi-layer */}
        <path d="M -38 -86 Q 0 -74 38 -86" stroke="#16202C" strokeWidth="3" fill="none" opacity="0.60"/>
        <path d="M -40 -104 Q 0 -94 40 -104" stroke="#16202C" strokeWidth="2.5" fill="none" opacity="0.50"/>
        <path d="M -40 -124 Q 0 -116 40 -124" stroke="#16202C" strokeWidth="2" fill="none" opacity="0.40"/>

        {/* Mane / neck ruff — adds authority */}
        <ellipse cx="0" cy="-166" rx="30" ry="20" fill="#1A2430"/>

        {/* Neck */}
        <ellipse cx="0" cy="-172" rx="27" ry="16" fill="#202C38"/>

        {/* Head — raised, dominant */}
        <ellipse cx="0" cy="-208" rx="42" ry="36" fill="#202C38"/>

        {/* Ear L */}
        <polygon points="-40,-205 -52,-262 -18,-188" fill="#16202C"/>
        <polygon points="-38,-206 -48,-254 -20,-190" fill="#C4A0A8" opacity="0.55"/>
        {/* Ear R */}
        <polygon points="40,-205 52,-262 18,-188" fill="#16202C"/>
        <polygon points="38,-206 48,-254 20,-190" fill="#C4A0A8" opacity="0.55"/>

        {/* Snout */}
        <ellipse cx="0" cy="-192" rx="26" ry="17" fill="#16202C"/>
        {/* Nose */}
        <ellipse cx="0" cy="-199" rx="12" ry="9" fill="#080C14"/>
        {/* Nose shine */}
        <circle cx="-4.5" cy="-203" r="3.5" fill="#FFF" opacity="0.16"/>

        {/* Muzzle line */}
        <path d="M -12 -176 Q 0 -170 12 -176" stroke="#101820" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>

        {/* Eyes — intense amber glow */}
        <circle cx="-22" cy="-222" r="10" fill="#080C14"/>
        <circle cx="22" cy="-222" r="10" fill="#080C14"/>
        {/* Amber iris — vivid */}
        <circle cx="-22" cy="-222" r="6.5" fill="#E8A040"/>
        <circle cx="22" cy="-222" r="6.5" fill="#E8A040"/>
        {/* Highlight */}
        <circle cx="-19" cy="-225.5" r="2.8" fill="#FFE8A0" opacity="0.88"/>
        <circle cx="25" cy="-225.5" r="2.8" fill="#FFE8A0" opacity="0.88"/>
        {/* Eye glow halo */}
        <circle cx="-22" cy="-222" r="13" fill="#E8A040" opacity="0.12"/>
        <circle cx="-22" cy="-222" r="17" fill={GOLD} opacity="0.06"/>
        <circle cx="22" cy="-222" r="13" fill="#E8A040" opacity="0.12"/>
        <circle cx="22" cy="-222" r="17" fill={GOLD} opacity="0.06"/>
      </g>
    </svg>
  );
}

// ── Stage 7: Legendary wolf — golden aura, near-black, sparkles ───────────────
function Wolf7({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.70)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="74" ry="10" fill="#2D3824" opacity="0.88" />
        {/* Golden disc — radiant */}
        <ellipse cx="0" cy="-2" rx="68" ry="8" fill={GOLD} opacity="0.65" />
        {/* Golden ring border — matches CartoonTree's ancient glow ring */}
        <ellipse cx="0" cy="-2" rx="72" ry="9" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.45"/>
        {/* Floor aura */}
        <ellipse cx="0" cy="-5" rx="56" ry="5" fill="#E8A040" opacity="0.10"/>

        {/* Ambient body aura */}
        <ellipse cx="0" cy="-152" rx="80" ry="70" fill={GOLD} opacity="0.04"/>

        {/* Tail — fully raised, legendary */}
        <path d="M -44 -40 Q -90 -108 -84 -188"
          stroke="#0A1218" strokeWidth="19" strokeLinecap="round" fill="none"/>
        <path d="M -44 -40 Q -87 -104 -80 -184"
          stroke="#2A3C52" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.18"/>
        {/* Tail tip golden glow */}
        <circle cx="-84" cy="-188" r="12" fill={GOLD} opacity="0.14"/>

        {/* 4 paws */}
        <ellipse cx="-38" cy="-10" rx="21" ry="9.5" fill="#081018"/>
        <ellipse cx="-13" cy="-9" rx="16" ry="8.5" fill="#0C1622"/>
        <ellipse cx="13" cy="-9" rx="16" ry="8.5" fill="#0C1622"/>
        <ellipse cx="38" cy="-10" rx="21" ry="9.5" fill="#081018"/>

        {/* Front legs */}
        <ellipse cx="-13" cy="-46" rx="13" ry="37" fill="#0E1A26"/>
        <ellipse cx="13" cy="-46" rx="13" ry="37" fill="#0E1A26"/>

        {/* Body — massive, near black */}
        <ellipse cx="0" cy="-136" rx="46" ry="54" fill="#0E1A24"/>
        {/* Body golden rim — CartoonTree ancient ring equivalent */}
        <ellipse cx="0" cy="-136" rx="46" ry="54" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.14"/>
        {/* Belly */}
        <ellipse cx="0" cy="-124" rx="28" ry="38" fill="#304050" opacity="0.22"/>

        {/* Fur texture — dense */}
        <path d="M -44 -98 Q 0 -84 44 -98" stroke="#08121E" strokeWidth="4" fill="none" opacity="0.70"/>
        <path d="M -46 -118 Q 0 -106 46 -118" stroke="#08121E" strokeWidth="3" fill="none" opacity="0.60"/>
        <path d="M -46 -140 Q 0 -130 46 -140" stroke="#08121E" strokeWidth="2.5" fill="none" opacity="0.50"/>
        <path d="M -44 -162 Q 0 -154 44 -162" stroke="#08121E" strokeWidth="2" fill="none" opacity="0.40"/>

        {/* Mane — flowing, flowing ruff */}
        <ellipse cx="0" cy="-196" rx="38" ry="26" fill="#0A1420"/>
        {/* Mane golden edge */}
        <path d="M -30 -196 Q 0 -204 30 -196" stroke={GOLD} strokeWidth="1" fill="none" opacity="0.22"/>

        {/* Neck */}
        <ellipse cx="0" cy="-202" rx="31" ry="18" fill="#0E1A24"/>

        {/* Head — powerful, raised */}
        <ellipse cx="0" cy="-240" rx="46" ry="40" fill="#0E1A24"/>
        {/* Head golden rim */}
        <ellipse cx="0" cy="-240" rx="46" ry="40" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.12"/>

        {/* Ear L */}
        <polygon points="-44,-237 -58,-300 -20,-218" fill="#0A1218"/>
        <polygon points="-42,-238 -54,-290 -22,-220" fill="#8A5840" opacity="0.48"/>
        {/* Ear L tip glow */}
        <circle cx="-58" cy="-300" r="8" fill={GOLD} opacity="0.14"/>
        {/* Ear R */}
        <polygon points="44,-237 58,-300 20,-218" fill="#0A1218"/>
        <polygon points="42,-238 54,-290 22,-220" fill="#8A5840" opacity="0.48"/>
        {/* Ear R tip glow */}
        <circle cx="58" cy="-300" r="8" fill={GOLD} opacity="0.14"/>

        {/* Snout */}
        <ellipse cx="0" cy="-222" rx="28" ry="18" fill="#0A1420"/>
        {/* Nose */}
        <ellipse cx="0" cy="-230" rx="13" ry="10" fill="#040810"/>
        {/* Nose shine */}
        <circle cx="-5" cy="-235" r="4" fill="#FFF" opacity="0.14"/>

        {/* Muzzle line */}
        <path d="M -14 -203 Q 0 -196 14 -203" stroke="#08101A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.72"/>

        {/* Eyes — legendary golden glow, multi-ring */}
        {/* Outer diffuse glow */}
        <circle cx="-24" cy="-257" r="22" fill={GOLD} opacity="0.06"/>
        <circle cx="24" cy="-257" r="22" fill={GOLD} opacity="0.06"/>
        <circle cx="-24" cy="-257" r="16" fill="#E8A040" opacity="0.10"/>
        <circle cx="24" cy="-257" r="16" fill="#E8A040" opacity="0.10"/>
        <circle cx="-24" cy="-257" r="11" fill="#FFB830" opacity="0.16"/>
        <circle cx="24" cy="-257" r="11" fill="#FFB830" opacity="0.16"/>
        {/* Eye */}
        <circle cx="-24" cy="-257" r="9" fill="#040810"/>
        <circle cx="24" cy="-257" r="9" fill="#040810"/>
        {/* Golden iris — luminous */}
        <circle cx="-24" cy="-257" r="6" fill="#FFB830"/>
        <circle cx="24" cy="-257" r="6" fill="#FFB830"/>
        {/* Inner ring */}
        <circle cx="-24" cy="-257" r="6" fill="none" stroke="#FFA020" strokeWidth="0.8" opacity="0.60"/>
        <circle cx="24" cy="-257" r="6" fill="none" stroke="#FFA020" strokeWidth="0.8" opacity="0.60"/>
        {/* Sharp shine */}
        <circle cx="-21" cy="-261" r="2.8" fill="#FFFBE0" opacity="0.92"/>
        <circle cx="27" cy="-261" r="2.8" fill="#FFFBE0" opacity="0.92"/>

        {/* Golden sparkle particles — matching CartoonTree's ancient gold leaves */}
        <circle cx="-72" cy="-60"  r="4"   fill={GOLD}    opacity="0.55"/>
        <circle cx="72"  cy="-50"  r="3.5" fill={GOLD}    opacity="0.50"/>
        <circle cx="-58" cy="-110" r="3"   fill="#E8A040" opacity="0.45"/>
        <circle cx="60"  cy="-96"  r="3.5" fill="#E8A040" opacity="0.42"/>
        <circle cx="-40" cy="-180" r="3"   fill="#FFB830" opacity="0.48"/>
        <circle cx="42"  cy="-168" r="2.5" fill="#FFB830" opacity="0.44"/>
        <circle cx="-20" cy="-230" r="2"   fill="#FFE090" opacity="0.60"/>
        <circle cx="22"  cy="-236" r="2"   fill="#FFE090" opacity="0.58"/>

        {/* Sparkle crosses at ear level */}
        <g opacity="0.70">
          <circle cx="-68" cy="-50" r="3" fill={GOLD}/>
          <path d="M -68 -55 L -68 -45 M -73 -50 L -63 -50" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
        </g>
        <g opacity="0.65">
          <circle cx="68" cy="-40" r="2.5" fill="#FFE082"/>
          <path d="M 68 -45 L 68 -35 M 63 -40 L 73 -40" stroke="#FFE082" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </g>
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

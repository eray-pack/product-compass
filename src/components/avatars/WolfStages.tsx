// Wolf companion — 8 evolution stages, side-view walking profile.
// viewBox 0 0 400 300, translate(200, 268) scale(X) — identical to CartoonTree.
// Wolf faces right. Tail has SMIL sway. Eyes are clear cartoon blue throughout.
// Color arc: light silver pup → near-black legendary wolf.
// Golden ground disc intensifies with each stage (matching CartoonTree).

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

// ── Stage 1: Small pup — slightly larger, more defined stride ─────────────────
function Wolf1({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(2.0)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="36" ry="5.5" fill="#2D3824" opacity="0.68" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-1" rx="30" ry="3.5" fill={GOLD} opacity="0.14" />

        {/* Tail — sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-10 -20 -40; 10 -20 -40; -10 -20 -40"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -20 -40 Q -38 -46 -42 -66 Q -44 -78 -36 -80"
            stroke="#B4BBC6" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M -20 -40 Q -37 -47 -41 -66 Q -43 -76 -35 -78"
            stroke="#D4D8E4" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.50"/>
          {/* Tail tip puff */}
          <ellipse cx="-35" cy="-79" rx="8" ry="6" fill="#C8CCD8"/>
          <ellipse cx="-33" cy="-81" rx="5" ry="4" fill="#DDE1EC" opacity="0.60"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -11 -33 Q -5 -20 -3 -7" stroke="#A8B0BC" strokeWidth="8" strokeLinecap="round" fill="none"/>
        <ellipse cx="-3" cy="-5" rx="8" ry="4" fill="#A4ACB8"/>
        {/* Far front leg (backward) */}
        <path d="M 13 -34 Q 8 -20 4 -7" stroke="#A8B0BC" strokeWidth="8" strokeLinecap="round" fill="none"/>
        <ellipse cx="4" cy="-5" rx="8" ry="4" fill="#A4ACB8"/>

        {/* Body */}
        <ellipse cx="0" cy="-47" rx="28" ry="17" fill="#C8CDD8"/>
        {/* Belly */}
        <ellipse cx="5" cy="-44" rx="15" ry="10" fill="#E2E6EE" opacity="0.68"/>
        {/* Back fur stroke */}
        <path d="M -24 -58 Q -8 -62 10 -58 Q 22 -60 28 -55"
          stroke="#B4BBC6" strokeWidth="1.5" fill="none" opacity="0.42"/>

        {/* Near back leg (backward) */}
        <path d="M -11 -33 Q -19 -20 -24 -7" stroke="#BCC2CC" strokeWidth="9" strokeLinecap="round" fill="none"/>
        <ellipse cx="-24" cy="-5" rx="9" ry="4.5" fill="#B4BAC6"/>
        {/* Near front leg (forward) */}
        <path d="M 13 -34 Q 21 -20 26 -7" stroke="#BCC2CC" strokeWidth="9" strokeLinecap="round" fill="none"/>
        <ellipse cx="26" cy="-5" rx="9" ry="4.5" fill="#B4BAC6"/>

        {/* Neck */}
        <ellipse cx="26" cy="-56" rx="13" ry="10" fill="#C4C9D4"/>

        {/* Head */}
        <ellipse cx="40" cy="-64" rx="22" ry="17" fill="#C8CDD8"/>

        {/* Ear */}
        <polygon points="30,-62 26,-86 42,-70" fill="#B8BEC8"/>
        <polygon points="31,-63 28,-82 41,-71" fill="#C4A0A8" opacity="0.62"/>

        {/* Snout */}
        <ellipse cx="57" cy="-59" rx="14" ry="9" fill="#BCC2CC"/>
        {/* Nose */}
        <ellipse cx="68" cy="-61" rx="4" ry="3" fill="#1A1E2A"/>
        <circle cx="66.5" cy="-63" r="1.4" fill="#FFF" opacity="0.20"/>

        {/* Eye — blue */}
        <circle cx="44" cy="-68" r="5" fill="#1A2434"/>
        <circle cx="44" cy="-68" r="3.2" fill="#3474C0"/>
        <circle cx="45.8" cy="-69.8" r="1.3" fill="#FFF" opacity="0.78"/>

        {/* Mouth */}
        <path d="M 66 -56 Q 63 -53 59 -54" stroke="#384450" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Stage 2: Young wolf — longer body, taller ears, bolder stride ─────────────
function Wolf2({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.60)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="44" ry="6" fill="#2D3824" opacity="0.70" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-1" rx="38" ry="4" fill={GOLD} opacity="0.20" />

        {/* Tail — bushy, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-10 -26 -50; 10 -26 -50; -10 -26 -50"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -26 -50 Q -48 -58 -54 -82 Q -56 -96 -46 -100"
            stroke="#9BA3AF" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M -26 -50 Q -47 -59 -53 -82 Q -55 -94 -45 -98"
            stroke="#C4CAD4" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.45"/>
          <ellipse cx="-45" cy="-99" rx="9" ry="7" fill="#B0B8C4"/>
          <ellipse cx="-43" cy="-101" rx="5.5" ry="4.5" fill="#CCCCD8" opacity="0.58"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -14 -36 Q -6 -22 -2 -7" stroke="#909AA6" strokeWidth="9" strokeLinecap="round" fill="none"/>
        <ellipse cx="-2" cy="-5" rx="9" ry="4.5" fill="#8E98A4"/>
        {/* Far front leg (backward) */}
        <path d="M 16 -37 Q 9 -22 4 -7" stroke="#909AA6" strokeWidth="9" strokeLinecap="round" fill="none"/>
        <ellipse cx="4" cy="-5" rx="9" ry="4.5" fill="#8E98A4"/>

        {/* Body */}
        <ellipse cx="0" cy="-55" rx="34" ry="20" fill="#B4BCC8"/>
        {/* Belly */}
        <ellipse cx="6" cy="-52" rx="18" ry="12" fill="#D4D8E4" opacity="0.65"/>
        {/* Back fur texture */}
        <path d="M -30 -68 Q -10 -73 12 -68 Q 26 -71 34 -65"
          stroke="#9EA6B2" strokeWidth="1.8" fill="none" opacity="0.45"/>

        {/* Near back leg (backward) */}
        <path d="M -14 -36 Q -24 -22 -30 -7" stroke="#A8B0BC" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <ellipse cx="-30" cy="-5" rx="11" ry="5" fill="#A0A8B4"/>
        {/* Near front leg (forward) */}
        <path d="M 16 -37 Q 26 -22 32 -7" stroke="#A8B0BC" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <ellipse cx="32" cy="-5" rx="11" ry="5" fill="#A0A8B4"/>

        {/* Chest highlight */}
        <ellipse cx="30" cy="-58" rx="12" ry="14" fill="#C8D0DC" opacity="0.32"/>

        {/* Neck */}
        <ellipse cx="32" cy="-67" rx="15" ry="11" fill="#B0B8C4"/>

        {/* Head */}
        <ellipse cx="50" cy="-78" rx="26" ry="20" fill="#B4BCC8"/>

        {/* Ear — taller, wolf-ish */}
        <polygon points="38,-76 33,-106 54,-84" fill="#A0A8B4"/>
        <polygon points="39,-77 35,-102 52,-85" fill="#C4A0A8" opacity="0.62"/>

        {/* Snout */}
        <ellipse cx="70" cy="-72" rx="17" ry="11" fill="#A4ACB8"/>
        {/* Nose */}
        <ellipse cx="83" cy="-74" rx="4.5" ry="3.5" fill="#1A1E2A"/>
        <circle cx="81.5" cy="-76.5" r="1.6" fill="#FFF" opacity="0.20"/>

        {/* Eye — clear blue */}
        <circle cx="55" cy="-83" r="5.5" fill="#1A2434"/>
        <circle cx="55" cy="-83" r="3.5" fill="#3474C0"/>
        <circle cx="57" cy="-85" r="1.5" fill="#FFF" opacity="0.78"/>

        {/* Mouth */}
        <path d="M 80 -69 Q 77 -66 73 -67" stroke="#384450" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Stage 3: Adolescent — stronger body, raised tail, confident ───────────────
function Wolf3({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.28)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="52" ry="6.5" fill="#2D3824" opacity="0.72" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="46" ry="5" fill={GOLD} opacity="0.27" />

        {/* Tail — raised, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-9 -30 -60; 9 -30 -60; -9 -30 -60"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -30 -60 Q -55 -70 -62 -98 Q -65 -116 -54 -120"
            stroke="#787F8C" strokeWidth="13" strokeLinecap="round" fill="none"/>
          <path d="M -30 -60 Q -54 -71 -61 -98 Q -64 -114 -53 -118"
            stroke="#B0B8C2" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.40"/>
          <ellipse cx="-53" cy="-119" rx="10" ry="8" fill="#8A929E"/>
          <ellipse cx="-51" cy="-121" rx="6" ry="5" fill="#BCC0CA" opacity="0.55"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -16 -39 Q -8 -24 -4 -7" stroke="#70788A" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <ellipse cx="-4" cy="-5" rx="10" ry="5" fill="#6E7888"/>
        {/* Far front leg (backward) */}
        <path d="M 18 -40 Q 11 -24 6 -7" stroke="#70788A" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <ellipse cx="6" cy="-5" rx="10" ry="5" fill="#6E7888"/>

        {/* Body */}
        <ellipse cx="0" cy="-63" rx="39" ry="24" fill="#909AA8"/>
        {/* Belly */}
        <ellipse cx="7" cy="-59" rx="21" ry="14" fill="#B8C0CC" opacity="0.45"/>
        {/* Back fur strokes */}
        <path d="M -35 -78 Q -12 -84 12 -80 Q 28 -82 39 -76"
          stroke="#7A8290" strokeWidth="2" fill="none" opacity="0.48"/>
        <path d="M -34 -70 Q -12 -76 12 -72 Q 27 -74 38 -68"
          stroke="#7A8290" strokeWidth="1.5" fill="none" opacity="0.35"/>

        {/* Near back leg (backward) */}
        <path d="M -16 -39 Q -28 -24 -36 -7" stroke="#8A929E" strokeWidth="12" strokeLinecap="round" fill="none"/>
        <ellipse cx="-36" cy="-5" rx="12" ry="5.5" fill="#828A96"/>
        {/* Near front leg (forward) */}
        <path d="M 18 -40 Q 30 -24 38 -7" stroke="#8A929E" strokeWidth="12" strokeLinecap="round" fill="none"/>
        <ellipse cx="38" cy="-5" rx="12" ry="5.5" fill="#828A96"/>

        {/* Chest highlight */}
        <ellipse cx="36" cy="-68" rx="14" ry="18" fill="#B4BCC6" opacity="0.28"/>

        {/* Neck */}
        <ellipse cx="38" cy="-80" rx="17" ry="12" fill="#8A929E"/>

        {/* Head */}
        <ellipse cx="59" cy="-92" rx="30" ry="23" fill="#909AA8"/>

        {/* Ear */}
        <polygon points="46,-90 40,-124 62,-99" fill="#808892"/>
        <polygon points="47,-91 43,-120 60,-100" fill="#C4A0A8" opacity="0.62"/>

        {/* Snout */}
        <ellipse cx="82" cy="-86" rx="20" ry="13" fill="#808892"/>
        {/* Nose */}
        <ellipse cx="98" cy="-88" rx="5.5" ry="4" fill="#181C28"/>
        <circle cx="96" cy="-91" r="2" fill="#FFF" opacity="0.18"/>

        {/* Eye — blue */}
        <circle cx="65" cy="-99" r="6" fill="#18222E"/>
        <circle cx="65" cy="-99" r="4" fill="#3474C0"/>
        <circle cx="67" cy="-101" r="1.6" fill="#FFF" opacity="0.80"/>

        {/* Mouth */}
        <path d="M 96 -82 Q 92 -79 87 -80" stroke="#303C48" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  );
}

// ── Stage 4: Adult wolf — proud, full coat, confident stride ──────────────────
function Wolf4({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(1.02)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="60" ry="7" fill="#2D3824" opacity="0.76" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="54" ry="5.5" fill={GOLD} opacity="0.34" />

        {/* Tail — raised high, bushy, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-9 -36 -70; 9 -36 -70; -9 -36 -70"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -36 -70 Q -64 -82 -72 -112 Q -75 -132 -62 -136"
            stroke="#505A66" strokeWidth="15" strokeLinecap="round" fill="none"/>
          <path d="M -36 -70 Q -63 -83 -71 -112 Q -74 -130 -61 -134"
            stroke="#8898A8" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity="0.36"/>
          {/* Tail tip */}
          <ellipse cx="-61" cy="-135" rx="12" ry="9" fill="#606A78"/>
          <ellipse cx="-59" cy="-137" rx="7" ry="6" fill="#A0AABA" opacity="0.55"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -18 -40 Q -8 -24 -4 -7" stroke="#48525E" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <ellipse cx="-4" cy="-5" rx="11" ry="5.5" fill="#46505C"/>
        {/* Far front leg (backward) */}
        <path d="M 20 -41 Q 12 -25 7 -7" stroke="#48525E" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <ellipse cx="7" cy="-5" rx="11" ry="5.5" fill="#46505C"/>

        {/* Body */}
        <ellipse cx="0" cy="-72" rx="44" ry="26" fill="#566070"/>
        {/* Belly patch */}
        <ellipse cx="8" cy="-68" rx="24" ry="15" fill="#8090A0" opacity="0.38"/>
        {/* Back fur strokes */}
        <path d="M -40 -88 Q -14 -95 12 -90 Q 30 -93 44 -86"
          stroke="#48525E" strokeWidth="2.5" fill="none" opacity="0.50"/>
        <path d="M -40 -78 Q -14 -85 12 -80 Q 30 -83 44 -76"
          stroke="#48525E" strokeWidth="1.8" fill="none" opacity="0.38"/>

        {/* Near back leg (backward) */}
        <path d="M -18 -40 Q -30 -24 -38 -7" stroke="#586070" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <ellipse cx="-38" cy="-5" rx="13" ry="6" fill="#505A68"/>
        {/* Near front leg (forward) */}
        <path d="M 20 -41 Q 34 -25 40 -7" stroke="#586070" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <ellipse cx="40" cy="-5" rx="13" ry="6" fill="#505A68"/>

        {/* Chest/shoulder highlight */}
        <ellipse cx="38" cy="-78" rx="15" ry="20" fill="#8090A0" opacity="0.26"/>

        {/* Neck */}
        <ellipse cx="43" cy="-88" rx="18" ry="13" fill="#566070"/>

        {/* Head */}
        <ellipse cx="65" cy="-100" rx="32" ry="25" fill="#566070"/>

        {/* Ear */}
        <polygon points="52,-98 44,-134 70,-108" fill="#48525E"/>
        <polygon points="53,-99 47,-130 68,-109" fill="#C4A0A8" opacity="0.62"/>

        {/* Snout */}
        <ellipse cx="89" cy="-93" rx="22" ry="14" fill="#4A5460"/>
        {/* Nose */}
        <ellipse cx="107" cy="-96" rx="6" ry="4.5" fill="#131620"/>
        <circle cx="105" cy="-99.5" r="2.2" fill="#FFF" opacity="0.18"/>

        {/* Muzzle line */}
        <path d="M 104 -90 Q 100 -87 95 -88" stroke="#283440" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

        {/* Eye — clear blue, confident */}
        <circle cx="72" cy="-108" r="6.5" fill="#18222E"/>
        <circle cx="72" cy="-108" r="4.2" fill="#3474C0"/>
        <circle cx="74.2" cy="-110.2" r="1.8" fill="#FFF" opacity="0.80"/>
      </g>
    </svg>
  );
}

// ── Stage 5: Strong wolf — powerful, dense coat, fierce blue eyes ─────────────
function Wolf5({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.88)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="70" ry="7.5" fill="#2D3824" opacity="0.80" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="63" ry="6" fill={GOLD} opacity="0.44" />

        {/* Tail — thick, raised high, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-8 -42 -82; 8 -42 -82; -8 -42 -82"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -42 -82 Q -74 -96 -84 -132 Q -88 -154 -73 -158"
            stroke="#343E4A" strokeWidth="18" strokeLinecap="round" fill="none"/>
          <path d="M -42 -82 Q -73 -97 -83 -132 Q -87 -152 -72 -156"
            stroke="#6A7888" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.32"/>
          <ellipse cx="-72" cy="-157" rx="14" ry="10" fill="#404C5A"/>
          <ellipse cx="-70" cy="-159" rx="8" ry="6.5" fill="#8898A8" opacity="0.52"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -22 -43 Q -10 -27 -5 -7" stroke="#303A46" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <ellipse cx="-5" cy="-5" rx="13" ry="6" fill="#2E3844"/>
        {/* Far front leg (backward) */}
        <path d="M 24 -44 Q 15 -28 9 -7" stroke="#303A46" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <ellipse cx="9" cy="-5" rx="13" ry="6" fill="#2E3844"/>

        {/* Body — wide, powerful */}
        <ellipse cx="0" cy="-82" rx="50" ry="30" fill="#3C4856"/>
        {/* Belly */}
        <ellipse cx="9" cy="-78" rx="27" ry="18" fill="#607080" opacity="0.35"/>
        {/* Dense fur strokes */}
        <path d="M -46 -100 Q -16 -108 14 -103 Q 34 -107 50 -99"
          stroke="#2E3844" strokeWidth="3" fill="none" opacity="0.55"/>
        <path d="M -46 -90 Q -16 -98 14 -93 Q 34 -97 50 -89"
          stroke="#2E3844" strokeWidth="2.2" fill="none" opacity="0.42"/>
        <path d="M -44 -78 Q -16 -86 14 -81 Q 34 -85 48 -77"
          stroke="#2E3844" strokeWidth="1.6" fill="none" opacity="0.30"/>

        {/* Near back leg (backward) */}
        <path d="M -22 -43 Q -36 -27 -44 -7" stroke="#3E4A58" strokeWidth="15" strokeLinecap="round" fill="none"/>
        <ellipse cx="-44" cy="-5" rx="15" ry="7" fill="#384452"/>
        {/* Near front leg (forward) */}
        <path d="M 24 -44 Q 38 -28 46 -7" stroke="#3E4A58" strokeWidth="15" strokeLinecap="round" fill="none"/>
        <ellipse cx="46" cy="-5" rx="15" ry="7" fill="#384452"/>

        {/* Chest */}
        <ellipse cx="44" cy="-90" rx="17" ry="23" fill="#607080" opacity="0.24"/>

        {/* Neck — thicker */}
        <ellipse cx="50" cy="-102" rx="21" ry="15" fill="#3C4856"/>

        {/* Head */}
        <ellipse cx="76" cy="-116" rx="36" ry="28" fill="#3C4856"/>

        {/* Ear */}
        <polygon points="60,-113 52,-155 82,-123" fill="#303A46"/>
        <polygon points="62,-114 55,-150 80,-124" fill="#C4A0A8" opacity="0.60"/>

        {/* Snout */}
        <ellipse cx="104" cy="-108" rx="24" ry="16" fill="#303A46"/>
        {/* Nose */}
        <ellipse cx="124" cy="-111" rx="6.5" ry="5" fill="#0E1218"/>
        <circle cx="121.5" cy="-115" r="2.5" fill="#FFF" opacity="0.16"/>

        {/* Muzzle line */}
        <path d="M 121 -103 Q 116 -100 110 -101" stroke="#1C2A36" strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* Eye — intense clear blue */}
        <circle cx="84" cy="-125" r="7.5" fill="#121C28"/>
        <circle cx="84" cy="-125" r="4.8" fill="#2060B0"/>
        <circle cx="86.5" cy="-127.5" r="2" fill="#FFF" opacity="0.82"/>
        {/* Subtle eye glow */}
        <circle cx="84" cy="-125" r="9.5" fill="#3474C0" opacity="0.08"/>
      </g>
    </svg>
  );
}

// ── Stage 6: Alpha wolf — dominant, dark, commanding presence ─────────────────
function Wolf6({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.76)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="78" ry="8.5" fill="#2D3824" opacity="0.84" />
        {/* Golden disc */}
        <ellipse cx="0" cy="-2" rx="71" ry="6.5" fill={GOLD} opacity="0.56" />

        {/* Tail — commanding, fully raised, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-8 -48 -94; 8 -48 -94; -8 -48 -94"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -48 -94 Q -85 -110 -96 -152 Q -100 -177 -83 -182"
            stroke="#1E2A36" strokeWidth="21" strokeLinecap="round" fill="none"/>
          <path d="M -48 -94 Q -84 -111 -95 -152 Q -99 -175 -82 -180"
            stroke="#506070" strokeWidth="9.5" strokeLinecap="round" fill="none" opacity="0.28"/>
          <ellipse cx="-82" cy="-181" rx="16" ry="12" fill="#283240"/>
          <ellipse cx="-80" cy="-183" rx="9.5" ry="7" fill="#708090" opacity="0.48"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -24 -46 Q -12 -29 -6 -7" stroke="#1C2632" strokeWidth="15" strokeLinecap="round" fill="none"/>
        <ellipse cx="-6" cy="-5" rx="15" ry="7" fill="#1A2430"/>
        {/* Far front leg (backward) */}
        <path d="M 27 -47 Q 17 -30 10 -7" stroke="#1C2632" strokeWidth="15" strokeLinecap="round" fill="none"/>
        <ellipse cx="10" cy="-5" rx="15" ry="7" fill="#1A2430"/>

        {/* Body — massive */}
        <ellipse cx="0" cy="-93" rx="56" ry="33" fill="#222A36"/>
        {/* Belly */}
        <ellipse cx="10" cy="-88" rx="30" ry="20" fill="#3C4858" opacity="0.32"/>
        {/* Dense fur — multi-layer */}
        <path d="M -52 -114 Q -18 -123 16 -118 Q 38 -122 56 -113"
          stroke="#18222E" strokeWidth="3.5" fill="none" opacity="0.60"/>
        <path d="M -52 -103 Q -18 -112 16 -107 Q 38 -111 56 -102"
          stroke="#18222E" strokeWidth="2.5" fill="none" opacity="0.48"/>
        <path d="M -50 -91 Q -18 -100 16 -95 Q 38 -99 54 -90"
          stroke="#18222E" strokeWidth="1.8" fill="none" opacity="0.35"/>

        {/* Near back leg (backward) */}
        <path d="M -24 -46 Q -40 -30 -50 -7" stroke="#28323E" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <ellipse cx="-50" cy="-5" rx="17" ry="8" fill="#222C38"/>
        {/* Near front leg (forward) */}
        <path d="M 27 -47 Q 43 -30 52 -7" stroke="#28323E" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <ellipse cx="52" cy="-5" rx="17" ry="8" fill="#222C38"/>

        {/* Mane / neck ruff */}
        <ellipse cx="52" cy="-106" rx="26" ry="22" fill="#1C2430"/>

        {/* Neck */}
        <ellipse cx="57" cy="-116" rx="23" ry="17" fill="#222A36"/>

        {/* Head */}
        <ellipse cx="87" cy="-133" rx="40" ry="31" fill="#222A36"/>

        {/* Ear */}
        <polygon points="68,-130 58,-176 94,-140" fill="#18222E"/>
        <polygon points="70,-131 62,-172 92,-141" fill="#C4A0A8" opacity="0.58"/>

        {/* Snout */}
        <ellipse cx="119" cy="-124" rx="27" ry="18" fill="#18222E"/>
        {/* Nose */}
        <ellipse cx="141" cy="-127" rx="7.5" ry="6" fill="#08101A"/>
        <circle cx="138.5" cy="-131.5" r="2.8" fill="#FFF" opacity="0.14"/>

        {/* Muzzle line */}
        <path d="M 138 -118 Q 132 -114 125 -115" stroke="#101C28" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

        {/* Eye — deep commanding blue */}
        <circle cx="96" cy="-144" r="8.5" fill="#0E1820"/>
        <circle cx="96" cy="-144" r="5.5" fill="#1848A0"/>
        <circle cx="98.8" cy="-146.8" r="2.2" fill="#FFF" opacity="0.84"/>
        {/* Eye glow */}
        <circle cx="96" cy="-144" r="11" fill="#3474C0" opacity="0.10"/>
        <circle cx="96" cy="-144" r="14" fill="#1848A0" opacity="0.06"/>
      </g>
    </svg>
  );
}

// ── Stage 7: Legendary wolf — near-black, golden aura, mythic blue eyes ───────
function Wolf7({ className }: P) {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" fill="none"
      style={{ display: "block" }} aria-hidden className={className}>
      <g transform="translate(200, 268) scale(0.66)">
        {/* Ground mound */}
        <ellipse cx="0" cy="0" rx="88" ry="9.5" fill="#2D3824" opacity="0.88" />
        {/* Golden disc — radiant */}
        <ellipse cx="0" cy="-2" rx="80" ry="7.5" fill={GOLD} opacity="0.68" />
        {/* Golden ring — matches CartoonTree AncientTree ring */}
        <ellipse cx="0" cy="-2" rx="84" ry="8.5" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.42"/>
        {/* Floor aura */}
        <ellipse cx="0" cy="-6" rx="60" ry="5" fill="#3474C0" opacity="0.06"/>

        {/* Ambient body aura */}
        <ellipse cx="20" cy="-100" rx="90" ry="75" fill={GOLD} opacity="0.03"/>

        {/* Tail — legendary, massive, sway */}
        <g>
          {/* @ts-ignore */}
          <animateTransform attributeName="transform" type="rotate"
            values="-8 -54 -106; 8 -54 -106; -8 -54 -106"
            keyTimes="0;0.5;1" dur="1.8s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
          <path d="M -54 -106 Q -96 -124 -110 -174 Q -115 -204 -95 -210"
            stroke="#0A1420" strokeWidth="24" strokeLinecap="round" fill="none"/>
          <path d="M -54 -106 Q -95 -125 -109 -174 Q -114 -202 -94 -208"
            stroke="#385060" strokeWidth="10.5" strokeLinecap="round" fill="none" opacity="0.24"/>
          {/* Tail tip — golden legendary glow */}
          <ellipse cx="-94" cy="-209" rx="18" ry="13" fill="#161E2A"/>
          <ellipse cx="-92" cy="-211" rx="10" ry="8" fill="#708898" opacity="0.44"/>
          <circle cx="-94" cy="-212" r="14" fill={GOLD} opacity="0.14"/>
        </g>

        {/* Far back leg (forward) */}
        <path d="M -26 -48 Q -13 -30 -7 -7" stroke="#0C1620" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <ellipse cx="-7" cy="-5" rx="17" ry="8" fill="#0A141E"/>
        {/* Far front leg (backward) */}
        <path d="M 29 -49 Q 18 -31 11 -7" stroke="#0C1620" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <ellipse cx="11" cy="-5" rx="17" ry="8" fill="#0A141E"/>

        {/* Body — near-black, imposing */}
        <ellipse cx="0" cy="-106" rx="62" ry="37" fill="#0E1420"/>
        {/* Body golden rim */}
        <ellipse cx="0" cy="-106" rx="62" ry="37" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.12"/>
        {/* Belly */}
        <ellipse cx="11" cy="-100" rx="34" ry="22" fill="#202C3C" opacity="0.45"/>
        {/* Fur — dense, layered */}
        <path d="M -58 -130 Q -20 -140 18 -134 Q 42 -138 62 -128"
          stroke="#08101A" strokeWidth="4" fill="none" opacity="0.65"/>
        <path d="M -58 -118 Q -20 -128 18 -122 Q 42 -126 62 -116"
          stroke="#08101A" strokeWidth="3" fill="none" opacity="0.55"/>
        <path d="M -56 -106 Q -20 -116 18 -110 Q 42 -114 60 -104"
          stroke="#08101A" strokeWidth="2.2" fill="none" opacity="0.42"/>
        <path d="M -54 -92 Q -20 -102 18 -96 Q 40 -100 58 -90"
          stroke="#08101A" strokeWidth="1.6" fill="none" opacity="0.30"/>

        {/* Near back leg (backward) */}
        <path d="M -26 -48 Q -44 -31 -56 -7" stroke="#141E2A" strokeWidth="19" strokeLinecap="round" fill="none"/>
        <ellipse cx="-56" cy="-5" rx="19" ry="9" fill="#101820"/>
        {/* Near front leg (forward) */}
        <path d="M 29 -49 Q 48 -31 58 -7" stroke="#141E2A" strokeWidth="19" strokeLinecap="round" fill="none"/>
        <ellipse cx="58" cy="-5" rx="19" ry="9" fill="#101820"/>

        {/* Flowing mane — legendary ruff */}
        <ellipse cx="58" cy="-120" rx="32" ry="27" fill="#0C1620"/>
        {/* Mane golden edge */}
        <path d="M 36 -120 Q 58 -130 80 -120" stroke={GOLD} strokeWidth="1" fill="none" opacity="0.20"/>

        {/* Neck */}
        <ellipse cx="64" cy="-132" rx="26" ry="19" fill="#0E1420"/>

        {/* Head — powerful, raised */}
        <ellipse cx="98" cy="-152" rx="44" ry="34" fill="#0E1420"/>
        {/* Head golden rim */}
        <ellipse cx="98" cy="-152" rx="44" ry="34" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.11"/>

        {/* Ear */}
        <polygon points="78,-148 66,-200 106,-158" fill="#0A1218"/>
        <polygon points="80,-149 70,-196 104,-159" fill="#7A4838" opacity="0.48"/>
        {/* Ear tip golden glow */}
        <circle cx="66" cy="-200" r="10" fill={GOLD} opacity="0.14"/>

        {/* Snout */}
        <ellipse cx="134" cy="-141" rx="30" ry="20" fill="#0A1218"/>
        {/* Nose */}
        <ellipse cx="159" cy="-145" rx="8" ry="6.5" fill="#040810"/>
        <circle cx="156" cy="-150" r="3" fill="#FFF" opacity="0.12"/>

        {/* Muzzle line */}
        <path d="M 155 -135 Q 148 -131 140 -132" stroke="#08121C" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

        {/* Eye — legendary mythic blue, multi-glow */}
        <circle cx="108" cy="-163" r="20" fill="#1848A0" opacity="0.06"/>
        <circle cx="108" cy="-163" r="14" fill="#2060B0" opacity="0.10"/>
        <circle cx="108" cy="-163" r="9.5" fill="#3474C0" opacity="0.16"/>
        <circle cx="108" cy="-163" r="9" fill="#0A1420"/>
        <circle cx="108" cy="-163" r="6" fill="#1848A0"/>
        <circle cx="111" cy="-166" r="2.5" fill="#FFF" opacity="0.88"/>
        {/* Sharp inner ring */}
        <circle cx="108" cy="-163" r="6" fill="none" stroke="#3474C0" strokeWidth="0.8" opacity="0.55"/>

        {/* Sparkle particles — legendary */}
        <circle cx="-78" cy="-60"  r="4.5" fill={GOLD} opacity="0.52"/>
        <circle cx="68"  cy="-18"  r="3.5" fill={GOLD} opacity="0.45"/>
        <circle cx="-62" cy="-110" r="3"   fill="#E8A040" opacity="0.42"/>
        <circle cx="72"  cy="-30"  r="2.5" fill="#3474C0" opacity="0.50"/>
        <circle cx="-40" cy="-160" r="2"   fill={GOLD} opacity="0.55"/>
        <circle cx="50"  cy="-12"  r="2"   fill="#3474C0" opacity="0.44"/>
        <g opacity="0.68">
          <circle cx="-80" cy="-54" r="3" fill={GOLD}/>
          <path d="M -80 -59 L -80 -49 M -85 -54 L -75 -54" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
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

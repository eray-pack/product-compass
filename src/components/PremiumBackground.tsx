// ── Shared premium background ─────────────────────────────────────────────────
// Fixed behind all page content (z-index: -1).
// The radial gradient lives on this element so it covers the full viewport.
// The SVG wave overlay uses the same coach-wave-* CSS classes (defined in
// styles.css) for the identical breathing animation as the coach page.

interface PremiumBackgroundProps {
  /** When true the horizontal sine waves and arcs are hidden.
   *  The radial gradient, breathing animation, and diagonal mesh grid remain.
   *  Used on the Home Screen where the waves clash with centre content. */
  hideWaves?: boolean;
}

export function PremiumBackground({ hideWaves = false }: PremiumBackgroundProps) {
  return (
    <div
      aria-hidden
      className="coach-overlay"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
        background:
          "radial-gradient(ellipse at 50% 42%, #161412 0%, #0a0806 42%, #000000 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Organic sine wave lines + broad arcs — hidden on Home Screen ── */}
        {!hideWaves && (
          <>
            {/* Wave 1 */}
            <path
              className="coach-wave"
              d="M -20 155 C 58 118, 136 192, 195 155 C 254 118, 332 192, 415 155"
              stroke="#C4873A" strokeWidth="0.9" strokeLinecap="round"
            />
            {/* Wave 2 */}
            <path
              className="coach-wave-2"
              d="M -20 285 C 58 252, 136 318, 195 285 C 254 252, 332 318, 415 285"
              stroke="#C4873A" strokeWidth="0.7" strokeLinecap="round"
            />
            {/* Wave 3 — mid-screen */}
            <path
              className="coach-wave-3"
              d="M -20 415 C 58 382, 136 448, 195 415 C 254 382, 332 448, 415 415"
              stroke="#8fa8c8" strokeWidth="0.8" strokeLinecap="round"
            />
            {/* Wave 4 */}
            <path
              className="coach-wave-4"
              d="M -20 548 C 58 515, 136 581, 195 548 C 254 515, 332 581, 415 548"
              stroke="#C4873A" strokeWidth="0.7" strokeLinecap="round"
            />
            {/* Wave 5 — low */}
            <path
              className="coach-wave-5"
              d="M -20 678 C 58 645, 136 711, 195 678 C 254 645, 332 711, 415 678"
              stroke="#8fa8c8" strokeWidth="0.6" strokeLinecap="round"
            />
            {/* Broad structural arc — upper */}
            <path
              className="coach-wave-3"
              d="M -30 370 Q 195 210 420 370"
              stroke="rgba(196,135,58,0.6)" strokeWidth="0.6" strokeLinecap="round"
            />
            {/* Broad structural arc — lower */}
            <path
              className="coach-wave"
              d="M -30 610 Q 195 450 420 610"
              stroke="rgba(143,168,200,0.6)" strokeWidth="0.5" strokeLinecap="round"
            />
          </>
        )}

        {/* ── Subtle diagonal mesh lines — always visible ── */}
        <line className="coach-wave-2" x1="-20" y1="0"   x2="240" y2="844" stroke="rgba(196,135,58,0.5)"  strokeWidth="0.5" />
        <line className="coach-wave-4" x1="130" y1="0"   x2="390" y2="844" stroke="rgba(196,135,58,0.5)"  strokeWidth="0.4" />
        <line className="coach-wave"   x1="260" y1="0"   x2="520" y2="844" stroke="rgba(143,168,200,0.5)" strokeWidth="0.4" />
        <line className="coach-wave-5" x1="420" y1="0"   x2="160" y2="844" stroke="rgba(196,135,58,0.5)"  strokeWidth="0.5" />
        <line className="coach-wave-3" x1="280" y1="0"   x2="20"  y2="844" stroke="rgba(143,168,200,0.5)" strokeWidth="0.4" />
      </svg>
    </div>
  );
}

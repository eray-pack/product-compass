import { useEffect, useRef } from "react";

interface BrainLoadingScreenProps {
  onDone: () => void;
}

// ── STOPAMINE intro — pure CSS, 2-second animation, 60fps ────────────────────
export function BrainLoadingScreen({ onDone }: BrainLoadingScreenProps) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = window.setTimeout(() => onDoneRef.current(), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        /* Text: fade + scale only — GPU accelerated, no layout thrash */
        @keyframes stopamineIntro {
          0%   { opacity: 0; transform: scale(0.92); }
          45%  { opacity: 1; transform: scale(1.00); }
          100% { opacity: 1; transform: scale(1.01); }
        }

        /* Shimmer sweep — GPU accelerated (transform only) */
        @keyframes stopamineShimmer {
          0%   { transform: translateX(-280%); opacity: 0; }
          35%  { transform: translateX(-280%); opacity: 0; }
          40%  { opacity: 1; }
          62%  { transform: translateX(340%);  opacity: 1; }
          63%  { opacity: 0; }
          100% { transform: translateX(340%);  opacity: 0; }
        }

        /* Overlay: hold then fade */
        @keyframes stopamineOverlay {
          0%   { opacity: 1; }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Glow: scale + opacity only */
        @keyframes stopamineGlow {
          0%   { opacity: 0; transform: scale(0.80); }
          40%  { opacity: 1; transform: scale(1.00); }
          75%  { opacity: 0.85; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.10); }
        }
      `}</style>

      {/* ── Full-screen overlay ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "radial-gradient(ellipse at 50% 50%, #0c0812 0%, #06040a 55%, #020104 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "stopamineOverlay 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          pointerEvents: "auto",
        }}
      >
        {/* ── Ambient gold glow blob ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: "70vw",
            height: "38vh",
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.04) 55%, transparent 75%)",
            pointerEvents: "none",
            animation: "stopamineGlow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />

        {/* ── Text + shimmer wrapper ── */}
        <div style={{ position: "relative" }}>
          {/* Main wordmark */}
          <p
            style={{
              margin: 0,
              fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
              fontSize: "clamp(22px, 6.5vw, 32px)",
              fontWeight: 800,
              letterSpacing: "0.48em",
              textTransform: "uppercase",
              color: "#d4af37",
              textShadow: [
                "0 0 28px rgba(212,175,55,0.65)",
                "0 0 56px rgba(212,175,55,0.30)",
                "0 0 100px rgba(212,175,55,0.12)",
              ].join(", "),
              animation: "stopamineIntro 2s cubic-bezier(0.25, 0.1, 0.1, 1) forwards",
              willChange: "opacity, transform",
            }}
          >
            STOPAMINE
          </p>

          {/* Shimmer sweep — 30% wide, moves left-to-right across the word */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-10%",
              left: 0,
              width: "32%",
              height: "120%",
              background: "linear-gradient(105deg, transparent 10%, rgba(255,248,210,0.70) 50%, transparent 90%)",
              animation: "stopamineShimmer 2s cubic-bezier(0.25, 0.1, 0.1, 1) forwards",
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          />
        </div>

        {/* ── Subtle rule beneath the word ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "calc(50% + 1.6em)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(80px, 20vw, 120px)",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)",
            animation: "stopamineGlow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />
      </div>
    </>
  );
}

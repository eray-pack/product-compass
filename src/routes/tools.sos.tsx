import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/tools/sos")({
  component: SOS,
});

// ── Phase config (logic unchanged) ───────────────────────────────────────────
const PHASES: { label: string; seconds: number }[] = [
  { label: "Inhale",  seconds: 4 },
  { label: "Hold",    seconds: 4 },
  { label: "Exhale",  seconds: 6 },
];

const TOTAL_SECONDS = 180;
const PEAK_T  = 0.38;
const SIGMA   = 0.18;

function intensityAt(t: number) {
  return Math.exp(-Math.pow(t - PEAK_T, 2) / (2 * SIGMA * SIGMA));
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD    = "#C9A84C";
const AMBER   = "#E8A030";
const CRIMSON = "#DC2626";

// ── Sparkle particles — deterministic, no Math.random() in render ────────────
const SOS_SPARKLES = [
  { x:  6, y: 12, size: 1.7, delay: 0.0, dur: 7.8 },
  { x: 22, y:  5, size: 1.4, delay: 1.9, dur: 9.0 },
  { x: 48, y:  8, size: 2.0, delay: 0.6, dur: 7.2 },
  { x: 74, y:  4, size: 1.5, delay: 2.8, dur: 8.5 },
  { x: 91, y: 15, size: 1.8, delay: 0.3, dur: 9.3 },
  { x: 11, y: 44, size: 1.6, delay: 3.4, dur: 7.5 },
  { x: 36, y: 52, size: 1.9, delay: 1.2, dur: 8.8 },
  { x: 63, y: 48, size: 1.5, delay: 4.5, dur: 7.0 },
  { x: 83, y: 62, size: 2.0, delay: 2.1, dur: 9.5 },
  { x:  4, y: 78, size: 1.6, delay: 5.2, dur: 8.0 },
  { x: 29, y: 85, size: 1.4, delay: 1.7, dur: 7.6 },
  { x: 58, y: 91, size: 1.8, delay: 0.9, dur: 8.2 },
  { x: 88, y: 82, size: 1.5, delay: 3.8, dur: 9.1 },
  { x: 42, y: 22, size: 1.7, delay: 6.0, dur: 7.4 },
  { x: 77, y: 33, size: 1.4, delay: 2.5, dur: 8.7 },
];

// ═════════════════════════════════════════════════════════════════════════════
// ── Active Urge pulsing module ───────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function ActiveUrgeModule() {
  return (
    <motion.div
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        padding: "5px 14px 5px 10px",
        border: `1px solid ${CRIMSON}60`,
        background: `${CRIMSON}12`,
        filter: [
          `drop-shadow(0 0 8px ${CRIMSON}65)`,
          `drop-shadow(0 0 18px ${CRIMSON}28)`,
        ].join(" "),
      }}
    >
      {/* Pulsing crimson dot */}
      <div className="relative" style={{ width: 10, height: 10 }}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: CRIMSON }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: CRIMSON,
            transform: "scale(0.7)",
            boxShadow: `0 0 5px ${CRIMSON}`,
          }}
        />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.16em",
        color: CRIMSON, fontFamily: "DM Sans, sans-serif",
        textShadow: `0 0 8px ${CRIMSON}90`,
      }}>
        ACTIVE URGE
      </span>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── Urge intensity chart — etched glass panel ────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function UrgeWaveGraph({ elapsed }: { elapsed: number }) {
  const W = 320, H = 90;
  const PAD_X = 12, PAD_TOP = 16, PAD_BOT = 22;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;

  const STEPS = 120;
  const pts: [number, number][] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    pts.push([PAD_X + t * innerW, PAD_TOP + innerH * (1 - intensityAt(t))]);
  }

  const toPath = (points: [number, number][]) =>
    points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  const currentT = Math.min(1, elapsed / TOTAL_SECONDS);
  const currentX = PAD_X + currentT * innerW;
  const currentY = PAD_TOP + innerH * (1 - intensityAt(currentT));
  const splitIdx = Math.round(currentT * STEPS);
  const pastPts   = pts.slice(0, splitIdx + 1);
  const futurePts = pts.slice(splitIdx);

  const fillPts: [number, number][] = [
    [PAD_X, PAD_TOP + innerH],
    ...pastPts,
    [currentX, PAD_TOP + innerH],
  ];

  const riseX   = PAD_X + 0.12 * innerW;
  const riseY   = PAD_TOP + innerH * (1 - intensityAt(0.12));
  const fadeX   = PAD_X + 0.68 * innerW;
  const fadeY   = PAD_TOP + innerH * (1 - intensityAt(0.68));
  const labelX  = Math.min(Math.max(currentX, 62), W - 62);

  return (
    // Etched glass panel
    <div
      style={{
        borderRadius: 18,
        background: "linear-gradient(145deg, rgba(201,168,76,0.045) 0%, rgba(9,7,5,0.97) 100%)",
        border: `1px solid ${GOLD}2A`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: [
          `0 0 28px rgba(201,168,76,0.05)`,
          "inset 0 1px 0 rgba(255,255,255,0.04)",
          "inset 0 0 40px rgba(201,168,76,0.015)",
        ].join(", "),
        padding: "14px 14px 10px",
      }}
    >
      {/* Panel label */}
      <p style={{
        fontSize: 8, fontWeight: 800, letterSpacing: "0.3em",
        color: GOLD, textAlign: "center", marginBottom: 10,
        fontFamily: "DM Sans, sans-serif",
        textShadow: `0 0 10px ${GOLD}60`,
      }}>
        URGE INTENSITY
      </p>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Blue path glow */}
          <filter id="sg-b" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feFlood floodColor="oklch(0.62 0.22 255)" floodOpacity="0.75" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* White star glow for marker */}
          <filter id="sg-w" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feFlood floodColor="#ffffff" floodOpacity="1" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Fill gradient */}
          <linearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill under past curve */}
        {pastPts.length > 1 && (
          <path d={toPath(fillPts) + " Z"} fill="url(#sg-fill)" />
        )}

        {/* Future curve — dim */}
        {futurePts.length > 1 && (
          <path d={toPath(futurePts)} fill="none"
            stroke="rgba(255,255,255,0.09)" strokeWidth="1.8" strokeLinecap="round" />
        )}

        {/* Past curve — glowing blue trail (two layers: glow + crisp) */}
        {pastPts.length > 1 && (
          <>
            <path d={toPath(pastPts)} fill="none"
              stroke="oklch(0.62 0.22 255)" strokeWidth="7"
              strokeLinecap="round" strokeOpacity="0.12"
              filter="url(#sg-b)" />
            <path d={toPath(pastPts)} fill="none"
              stroke="oklch(0.62 0.22 255)" strokeWidth="2.4"
              strokeLinecap="round" filter="url(#sg-b)" />
          </>
        )}

        {/* RISE label — pulsing */}
        <motion.text
          x={riseX} y={riseY - 8}
          textAnchor="middle" fontSize="8" fontWeight="700"
          letterSpacing="0.14em"
          fill="oklch(0.62 0.22 255)"
          fontFamily="DM Sans, sans-serif"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        >
          RISE
        </motion.text>

        {/* FADE label — pulsing, staggered */}
        <motion.text
          x={fadeX} y={fadeY - 8}
          textAnchor="middle" fontSize="8" fontWeight="700"
          letterSpacing="0.14em"
          fill="rgba(255,255,255,0.3)"
          fontFamily="DM Sans, sans-serif"
          animate={{ opacity: [0.22, 0.5, 0.22] }}
          transition={{ repeat: Infinity, duration: 2.6, delay: 1.1, ease: "easeInOut" }}
        >
          FADE
        </motion.text>

        {/* YOU ARE HERE guide line */}
        <line
          x1={currentX} y1={currentY - 5}
          x2={labelX} y2={PAD_TOP - 2}
          stroke="white" strokeWidth="0.8"
          strokeDasharray="3 2" strokeOpacity="0.4"
        />
        <text x={labelX} y={PAD_TOP - 5}
          textAnchor="middle" fontSize="7" fontWeight="700"
          letterSpacing="0.08em" fill="rgba(255,255,255,0.65)"
          fontFamily="DM Sans, sans-serif">
          YOU ARE HERE
        </text>

        {/* Marker: outer breathing ring + bright star core */}
        <motion.circle cx={currentX} cy={currentY} r={8}
          fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8"
          animate={{ r: [7, 14, 7], opacity: [0.45, 0, 0.45] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: "easeOut" }}
        />
        <motion.circle cx={currentX} cy={currentY} r={4}
          fill="white" filter="url(#sg-w)"
          animate={{ r: [3, 5, 3], opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />

        {/* Baseline */}
        <line x1={PAD_X} y1={PAD_TOP + innerH} x2={W - PAD_X} y2={PAD_TOP + innerH}
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />

        {/* Time labels */}
        {[
          { x: PAD_X,      label: "0s",   anchor: "start"  },
          { x: W / 2,      label: "90s",  anchor: "middle" },
          { x: W - PAD_X, label: "3:00", anchor: "end"    },
        ].map(({ x, label, anchor }) => (
          <text key={label} x={x} y={H - 4} fontSize="7"
            fill="rgba(255,255,255,0.24)"
            textAnchor={anchor as "start" | "middle" | "end"}
            fontFamily="DM Sans, sans-serif">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ── Main screen ──────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
function SOS() {
  const navigate = useNavigate();

  // ── Timer + phase state (logic unchanged) ────────────────────────────────
  const [elapsed,   setElapsed]   = useState(0);
  const [phaseIdx,  setPhaseIdx]  = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(PHASES[0].seconds);
  const phaseIdxRef = useRef(0);
  const done = elapsed >= TOTAL_SECONDS;

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setPhaseLeft((p) => {
        if (p > 1) return p - 1;
        const next = (phaseIdxRef.current + 1) % PHASES.length;
        phaseIdxRef.current = next;
        setPhaseIdx(next);
        return PHASES[next].seconds;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mm    = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss    = String(elapsed % 60).padStart(2, "0");
  const phase = PHASES[phaseIdx];

  // Sphere scale target driven by breath phase
  const sphereTarget = phase.label === "Inhale" ? 1.16 : phase.label === "Hold" ? 1.16 : 0.96;

  return (
    <>
    <style>{`
      @keyframes sos-sparkle {
        0%   { transform: translateY(0px) scale(1.0); opacity: 0; }
        12%  { opacity: 1; }
        88%  { opacity: 1; }
        100% { transform: translateY(-22px) scale(0.70); opacity: 0; }
      }
      @keyframes sos-aurora {
        0%, 100% { opacity: 0.82; transform: scale(0.94); }
        50%       { opacity: 1.00; transform: scale(1.06); }
      }
    `}</style>
    <div
      style={{
        minHeight: "100dvh",
        background: "radial-gradient(circle at 50% 50%, #0c0812 0%, #06040a 60%, #000000 100%)",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}
      className="mx-auto max-w-md px-6 pt-10 pb-12"
    >
      {/* ── Ambient sparkle particles ── */}
      {SOS_SPARKLES.map((s, i) => (
        <div key={i} aria-hidden style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: i % 5 === 0 ? "#8ab4f8" : "#ffd700",
          boxShadow: i % 5 === 0
            ? "0 0 5px 2px rgba(138,180,248,0.60)"
            : "0 0 6px 2px rgba(255,215,0,0.60)",
          animation: `sos-sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0" style={{ position: "relative", zIndex: 1 }}>
        <Link
          to="/"
          className="inline-flex items-center gap-1 font-medium"
          style={{ color: "rgba(255,255,255,0.40)", fontSize: 13, fontFamily: "DM Sans, sans-serif" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <ActiveUrgeModule />
      </div>

      {/* ── Titles ──────────────────────────────────────────── */}
      <motion.div
        className="mt-5 text-center flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.38em",
          color: GOLD, fontFamily: "DM Sans, sans-serif",
          textShadow: `0 0 18px ${GOLD}65`,
        }}>
          URGE SURFING
        </p>
        <h1 style={{
          marginTop: 8, fontSize: 24, fontWeight: 800,
          color: "#ffffff", lineHeight: 1.22, letterSpacing: "-0.01em",
          fontFamily: "Cormorant Garamond, serif",
          textShadow: [
            "0 0 36px rgba(201,168,76,0.2)",
            "0 0 70px rgba(201,168,76,0.08)",
            "0 2px 6px rgba(0,0,0,0.55)",
          ].join(", "),
        }}>
          Don't fight it. Watch it.
        </h1>
        <p style={{
          marginTop: 8, fontSize: 12,
          color: "rgba(255,255,255,0.42)", lineHeight: 1.58,
          fontFamily: "DM Sans, sans-serif",
        }}>
          Urges peak around 90 seconds and then fade.{" "}
          <span style={{ color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>Stay with it.</span>
        </p>
      </motion.div>

      {/* ── Breathing sphere ────────────────────────────────── */}
      <div className="flex flex-col items-center mt-6 flex-shrink-0">
        <div
          className="relative"
          style={{ width: 220, height: 220, display: "grid", placeItems: "center" }}
        >
          {/* Aurora blob — neon-purple + gold halo breathing behind the orb */}
          <div aria-hidden style={{
            position: "absolute",
            width: 260, height: 260,
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: [
              "radial-gradient(ellipse at 38% 42%,",
              "rgba(212,175,55,0.22) 0%,",
              "rgba(90,40,180,0.18) 40%,",
              "rgba(30,15,70,0.12) 65%,",
              "transparent 80%)",
            ].join(" "),
            filter: "blur(40px)",
            animation: "sos-aurora 3.8s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* Radial ambient halo */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)",
            filter: "blur(22px)",
          }} />

          {/* Slow-rotating outer energy ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: 8, border: `1.5px solid ${GOLD}30` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: 18, border: `1px solid ${AMBER}22` }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />

          {/* 3-D gold gradient sphere — breathes with the breath phase */}
          <motion.div
            animate={{ scale: sphereTarget }}
            transition={{
              duration: phase.seconds * 0.88,
              ease: phase.label === "Hold" ? "linear" : "easeInOut",
            }}
            style={{
              width: 148, height: 148, borderRadius: "50%",
              display: "grid", placeItems: "center",
              background: [
                "radial-gradient(circle at 36% 30%,",
                "#FCF0C0 0%,",
                "#E8C46A 12%,",
                `${GOLD} 26%,`,
                "#9A6A18 50%,",
                "#4B310A 72%,",
                "#1A0F04 100%)",
              ].join(" "),
              boxShadow: [
                "0 0 0 1.5px rgba(201,168,76,0.22)",
                "0 0 32px 8px rgba(201,168,76,0.24)",
                "0 8px 30px rgba(0,0,0,0.78)",
                "inset 12px 12px 28px rgba(255,240,170,0.14)",
                "inset -8px -8px 20px rgba(0,0,0,0.58)",
              ].join(", "),
              willChange: "transform",
            }}
          >
            {/* Etched phase label + countdown */}
            <div className="text-center" style={{ userSelect: "none", pointerEvents: "none" }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase.label}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.28em",
                    color: "rgba(255,255,255,0.72)",
                    fontFamily: "DM Sans, sans-serif",
                    textShadow: "0 0 14px rgba(255,255,255,0.55)",
                    marginBottom: 4,
                  }}
                >
                  {phase.label.toUpperCase()}
                </motion.p>
              </AnimatePresence>
              <p style={{
                fontSize: 34, fontWeight: 800, color: "#ffffff", lineHeight: 1,
                fontFamily: "DM Sans, sans-serif", fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 22px rgba(255,255,255,0.8), 0 0 44px rgba(255,255,255,0.3)",
              }}>
                {phaseLeft}s
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Master timer ── */}
        <p style={{
          marginTop: 16, fontSize: 48, fontWeight: 800,
          color: "#ffffff", fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.06em", lineHeight: 1,
          fontFamily: "DM Sans, sans-serif",
          textShadow: [
            "0 0 28px rgba(201,168,76,0.5)",
            "0 0 58px rgba(201,168,76,0.2)",
            "0 2px 10px rgba(0,0,0,0.65)",
          ].join(", "),
        }}>
          {mm}:{ss}
        </p>
        <p style={{
          marginTop: 6, fontSize: 9, fontWeight: 800,
          letterSpacing: "0.32em", color: GOLD,
          fontFamily: "DM Sans, sans-serif",
          textShadow: `0 0 14px ${GOLD}55`,
        }}>
          TIME WITH THE URGE
        </p>
      </div>

      {/* ── Urge wave graph ─────────────────────────────────── */}
      <div className="mt-6">
        <UrgeWaveGraph elapsed={elapsed} />
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="mt-5">
        {done ? (
          <button
            onClick={() => navigate({ to: "/" })}
            className="h-14 w-full rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2"
            style={{
              color: "#0a0705",
              background: `linear-gradient(135deg, #E8C46A, ${GOLD})`,
              boxShadow: `0 0 24px ${GOLD}55, 0 4px 16px rgba(0,0,0,0.4)`,
            }}
          >
            <Check className="h-5 w-5" /> You made it through. Add this to your streak.
          </button>
        ) : (
          <p style={{
            textAlign: "center", fontSize: 12,
            color: "rgba(255,255,255,0.28)",
            fontFamily: "DM Sans, sans-serif",
          }}>
            Stay until the timer reaches 3:00
          </p>
        )}
      </div>
    </div>
    </>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/tools/urgesurfing")({
  component: UrgeSurfing,
});

// ── Design tokens ─────────────────────────────────────────────────────────────
const GOLD    = "#C9A84C";
const AMBER   = "#E8A030";
const CRIMSON = "#DC2626";
const CHART_TOTAL = 180; // 3-minute session

// ── Breath cycle ──────────────────────────────────────────────────────────────
const PHASES = [
  { label: "INHALE", dur: 4, color: "#6BAED6" },
  { label: "HOLD",   dur: 2, color: GOLD       },
  { label: "EXHALE", dur: 5, color: AMBER      },
] as const;
const CYCLE = PHASES.reduce((s, p) => s + p.dur, 0); // 11 s

function getPhase(elapsed: number) {
  const pos = elapsed % CYCLE;
  let acc = 0;
  for (const p of PHASES) {
    if (pos < acc + p.dur) {
      const pe = pos - acc;
      return { ...p, phasePct: pe / p.dur, secsLeft: Math.ceil(p.dur - pe) };
    }
    acc += p.dur;
  }
  return { ...PHASES[0], phasePct: 0, secsLeft: PHASES[0].dur };
}

// ── Urge-intensity gaussian curve ─────────────────────────────────────────────
// Peaks at t = 0.5 → 90 s / 180 s
function urgeAt(t: number): number {
  const peak = 0.5, sigma = 0.2;
  return 0.9 * Math.exp(-((t - peak) ** 2) / (2 * sigma ** 2));
}

// ── Chart geometry ────────────────────────────────────────────────────────────
const CW = 300, CH = 90;         // viewBox dimensions
const PX = 12, PT = 16, PB = 20; // padding: left/right, top, bottom
const IW = CW - PX * 2;          // inner width  = 276
const IH = CH - PT - PB;         // inner height = 54
const PEAK_X = PX + 0.5 * IW;   // x at 90 s   = 150

// Pre-compute full curve at module load
const CURVE_STEPS = 120;
const CURVE_PTS: [number, number][] = Array.from({ length: CURVE_STEPS + 1 }, (_, i) => {
  const t = i / CURVE_STEPS;
  return [PX + t * IW, PT + IH * (1 - urgeAt(t))];
});

// Rise sub-path (left of peak)
const RISE_D = CURVE_PTS
  .filter(([x]) => x <= PEAK_X + 0.5)
  .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
  .join(" ");

// Fade sub-path (right of peak)
const FADE_D = CURVE_PTS
  .filter(([x]) => x >= PEAK_X - 0.5)
  .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
  .join(" ");

// ── Neural network nodes (floating above the rise curve) ──────────────────────
const NN_NODES = [
  { id: 0, x: 18,  y: 18 },
  { id: 1, x: 36,  y: 14 },
  { id: 2, x: 52,  y: 19 },
  { id: 3, x: 28,  y: 28 },
  { id: 4, x: 65,  y: 16 },
  { id: 5, x: 42,  y: 32 },
  { id: 6, x: 78,  y: 18 },
  { id: 7, x: 88,  y: 26 },
  { id: 8, x: 58,  y: 36 },
  { id: 9, x: 100, y: 17 },
  { id: 10, x: 112, y: 29 },
  { id: 11, x: 74,  y: 38 },
];

const NN_EDGES = NN_NODES.flatMap((a, i) =>
  NN_NODES.slice(i + 1)
    .filter(b => Math.hypot(a.x - b.x, a.y - b.y) < 30)
    .map(b => ({ a, b }))
);

// Fixed animation timings (avoid Math.random() in render)
const EDGE_T = NN_EDGES.map((_, i) => ({
  dur:   1.4 + [0.3, 0.8, 0.2, 1.1, 0.5, 0.7, 0.4, 0.9, 0.1, 0.6, 1.2, 0.3, 0.7, 0.5][i % 14],
  delay: [0, 0.4, 0.8, 0.2, 1.0, 0.6, 1.4, 0.3, 0.9, 0.5, 1.1, 0.1, 0.7, 1.3][i % 14],
}));

const NODE_T = NN_NODES.map((_, i) => ({
  dur:   1.2 + [0.5, 0.2, 0.8, 0.4, 1.0, 0.3, 0.7, 0.1, 0.6, 0.9, 0.2, 0.5][i % 12],
  delay: [0.1, 0.5, 0.9, 0.3, 0.7, 1.1, 0.2, 0.6, 1.0, 0.4, 0.8, 0.0][i % 12],
}));

// ── Dust particles (dissolving on the fade side) ──────────────────────────────
const DUST = Array.from({ length: 9 }, (_, i) => {
  const t  = 0.52 + (i / 8) * 0.44;          // t: 0.52 → 0.96
  const cx = PX + t * IW;
  const cy = PT + IH * (1 - urgeAt(t));
  const xO = [3, -4, 6, -2, 5, -5, 2, -3, 4][i];
  const yO = [4, 6, 3, 8, 5, 7, 6, 4, 3][i];
  return {
    cx: cx + xO, cy: cy + yO,
    dur:   [2.2, 1.8, 2.5, 1.6, 2.9, 2.0, 1.9, 2.4, 2.1][i],
    delay: [0.0, 0.4, 0.8, 0.2, 1.0, 0.6, 1.2, 0.3, 0.7][i],
  };
});

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════════════

// ── Crimson shield status indicator ──────────────────────────────────────────
function ActiveUrgeShield() {
  return (
    <div className="flex items-center gap-2">
      {/* Shield + aura stack */}
      <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
        {/* Outer soft aura — slow breathe */}
        <motion.div
          className="absolute"
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `radial-gradient(circle, ${CRIMSON}55 0%, ${CRIMSON}10 55%, transparent 72%)`,
          }}
          animate={{ scale: [0.75, 1.35, 0.75], opacity: [0.7, 0.15, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
        {/* Light-trail ring */}
        <motion.div
          className="absolute"
          style={{
            width: 30, height: 30, borderRadius: "50%",
            border: `1px solid ${CRIMSON}70`,
          }}
          animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeOut" }}
        />
        {/* Shield shape */}
        <div
          style={{
            position: "relative",
            width: 22, height: 25,
            background: `linear-gradient(170deg, #FF6060 0%, ${CRIMSON} 50%, #7A0000 100%)`,
            clipPath: "polygon(50% 0%, 100% 18%, 100% 64%, 50% 100%, 0% 64%, 0% 18%)",
            boxShadow: `0 0 16px ${CRIMSON}A0, 0 0 6px ${CRIMSON}60`,
          }}
        />
      </div>
      {/* Label */}
      <p
        style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
          color: CRIMSON, lineHeight: 1.4,
          textShadow: `0 0 10px ${CRIMSON}90`,
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        ACTIVE<br />URGE
      </p>
    </div>
  );
}

// ── Plasma rings orbiting the sphere ─────────────────────────────────────────
function PlasmaField({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ borderRadius: "50%" }}
    >
      {([
        { scale: 1.58, opacity: "28", spd: 10, dir:  1 },
        { scale: 1.34, opacity: "1A", spd: 14, dir: -1 },
        { scale: 1.16, opacity: "12", spd: 18, dir:  1 },
      ] as const).map(({ scale, opacity, spd, dir }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `${1.4 - i * 0.3}px solid ${color}${opacity}`,
            scale,
          }}
          animate={{
            rotate: dir === 1 ? [0, 360] : [0, -360],
            scale:  [scale, scale * 1.055, scale],
          }}
          transition={{
            rotate: { repeat: Infinity, duration: spd, ease: "linear" },
            scale:  { repeat: Infinity, duration: 3.5 + i * 1.4, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

// ── SVG progress ring that draws in real-time ─────────────────────────────────
function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const R = 76;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);

  // Compute tip position for the travelling particle
  const angle  = (-90 + pct * 360) * (Math.PI / 180);
  const tipX   = 94 + R * Math.cos(angle);
  const tipY   = 94 + R * Math.sin(angle);

  return (
    <svg
      overflow="visible"
      style={{
        position: "absolute",
        top: -16, left: -16,
        width: "calc(100% + 32px)",
        height: "calc(100% + 32px)",
      }}
      viewBox="0 0 188 188"
    >
      <defs>
        <filter id="pr-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feFlood floodColor={color} floodOpacity="0.7" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="tip-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feFlood floodColor={color} floodOpacity="1" result="c" />
          <feComposite in="c" in2="b" operator="in" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Track ring */}
      <circle cx="94" cy="94" r={R} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth="8" />

      {/* Wide soft glow layer behind progress */}
      <circle cx="94" cy="94" r={R} fill="none"
        stroke={color} strokeWidth="12" strokeOpacity="0.07"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 94 94)"
        style={{ transition: "stroke-dashoffset 0.12s linear, stroke 0.4s" }} />

      {/* Crisp progress arc */}
      <circle cx="94" cy="94" r={R} fill="none"
        stroke={color} strokeWidth="3.5"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 94 94)"
        filter="url(#pr-glow)"
        style={{ transition: "stroke-dashoffset 0.12s linear, stroke 0.4s" }} />

      {/* Travelling energy particle at the arc tip */}
      {pct > 0.015 && (
        <motion.circle
          cx={tipX} cy={tipY} r={5}
          fill={color}
          filter="url(#tip-glow)"
          animate={{ r: [4, 6.5, 4], opacity: [0.95, 0.45, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}

// ── Urge chart (full SVG panel) ───────────────────────────────────────────────
function UrgeChart({ elapsed }: { elapsed: number }) {
  const chartT    = Math.min(elapsed / CHART_TOTAL, 1);
  const markerIdx = Math.round(chartT * CURVE_STEPS);
  const [mx, my]  = CURVE_PTS[Math.min(markerIdx, CURVE_PTS.length - 1)];

  // Golden + blue trail of the last 22 visited points
  const trailStart = Math.max(0, markerIdx - 22);
  const trailPts   = CURVE_PTS.slice(trailStart, markerIdx + 1);
  const trailD     = trailPts.length > 1
    ? trailPts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 18,
        background: "linear-gradient(148deg, rgba(201,168,76,0.055) 0%, rgba(9,7,5,0.96) 100%)",
        border: "1px solid rgba(201,168,76,0.16)",
        boxShadow: [
          "0 0 32px rgba(201,168,76,0.05)",
          "inset 0 1px 0 rgba(255,255,255,0.045)",
          "inset 0 0 50px rgba(201,168,76,0.02)",
        ].join(", "),
        padding: "14px 14px 10px",
      }}
    >
      {/* Panel title */}
      <p style={{
        fontSize: 8, fontWeight: 800, letterSpacing: "0.3em",
        color: GOLD, textAlign: "center", marginBottom: 10,
        fontFamily: "DM Sans, sans-serif",
        textShadow: `0 0 10px ${GOLD}60`,
      }}>
        URGE INTENSITY MAP
      </p>

      <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} overflow="visible">
        <defs>
          {/* Gold element glow */}
          <filter id="gg" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feFlood floodColor={GOLD} floodOpacity="0.8" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Star-white glow for marker */}
          <filter id="wg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feFlood floodColor="#ffffff" floodOpacity="1" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Soft edge glow for neural lines */}
          <filter id="ng" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="b" />
            <feFlood floodColor={GOLD} floodOpacity="0.55" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Rise curve gradient */}
          <linearGradient id="rise-g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={GOLD}  stopOpacity="0.22" />
            <stop offset="100%" stopColor={GOLD}  stopOpacity="1" />
          </linearGradient>
          {/* Fade curve gradient */}
          <linearGradient id="fade-g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={AMBER} stopOpacity="0.95" />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0.03" />
          </linearGradient>
          {/* Trail gradient: blue history → gold leading edge */}
          <linearGradient id="trail-g" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#4488EE" stopOpacity="0.15" />
            <stop offset="70%"  stopColor={GOLD}    stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff"  stopOpacity="0.9"  />
          </linearGradient>
        </defs>

        {/* ── Etched grid ── */}
        {[0.25, 0.5, 0.75].map(t => (
          <line key={`vg-${t}`}
            x1={PX + t * IW} y1={PT - 4}
            x2={PX + t * IW} y2={PT + IH + 2}
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="2 5" />
        ))}
        {[0.33, 0.66].map(v => (
          <line key={`hg-${v}`}
            x1={PX} y1={PT + IH * (1 - v)}
            x2={PX + IW} y2={PT + IH * (1 - v)}
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.6" />
        ))}

        {/* ── Neural network cluster (rise side) ── */}
        {NN_EDGES.map(({ a, b }, i) => (
          <motion.line
            key={`e${i}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={GOLD} strokeWidth="0.7"
            filter="url(#ng)"
            animate={{ opacity: [0.06, 0.6, 0.06] }}
            transition={{ repeat: Infinity, duration: EDGE_T[i].dur, delay: EDGE_T[i].delay, ease: "easeInOut" }}
          />
        ))}
        {NN_NODES.map((n, i) => (
          <motion.circle
            key={`n${n.id}`}
            cx={n.x} cy={n.y} r={1.6}
            fill={GOLD} filter="url(#gg)"
            animate={{ opacity: [0.22, 1, 0.22], r: [1.1, 2.4, 1.1] }}
            transition={{ repeat: Infinity, duration: NODE_T[i].dur, delay: NODE_T[i].delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── Rise curve ── */}
        <path d={RISE_D} fill="none" stroke="url(#rise-g)" strokeWidth="2.2" strokeLinecap="round" />

        {/* ── Fade curve ── */}
        <path d={FADE_D} fill="none" stroke="url(#fade-g)" strokeWidth="2.2" strokeLinecap="round" />

        {/* ── Golden dust dissolving off the fade side ── */}
        {DUST.map((d, i) => (
          <motion.circle
            key={`d${i}`}
            cx={d.cx} cy={d.cy} r={0.9}
            fill={AMBER}
            animate={{ opacity: [0.55, 0, 0.55], y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: d.dur, delay: d.delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── Historical light trail ── */}
        {trailD && (
          <path d={trailD} fill="none"
            stroke="url(#trail-g)" strokeWidth="3"
            strokeLinecap="round" opacity="0.65" />
        )}

        {/* ── Star marker — user's current position ── */}
        {/* Outer pulse ring */}
        <motion.circle cx={mx} cy={my} r={8}
          fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8"
          animate={{ r: [7, 14, 7], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
        />
        {/* Inner bright core */}
        <motion.circle cx={mx} cy={my} r={3.5}
          fill="#ffffff" filter="url(#wg)"
          animate={{ r: [2.8, 4.8, 2.8], opacity: [1, 0.55, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />

        {/* ── 90-second peak marker ── */}
        <line
          x1={PEAK_X} y1={PT - 3} x2={PEAK_X} y2={PT + IH + 2}
          stroke={`${CRIMSON}40`} strokeWidth="0.8" strokeDasharray="2 4" />
        <text x={PEAK_X} y={PT - 5}
          fontSize="5.8" fill={`${CRIMSON}75`}
          textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700">
          90s peak
        </text>

        {/* ── Bottom axis + time labels ── */}
        <line x1={PX} y1={PT + IH + 2} x2={PX + IW} y2={PT + IH + 2}
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
        {[
          { label: "0s",    anchor: "start",  x: PX },
          { label: "1:30",  anchor: "middle", x: PEAK_X },
          { label: "3:00",  anchor: "end",    x: PX + IW },
        ].map(({ label, anchor, x }) => (
          <text key={label} x={x} y={CH - 4}
            fontSize="6" fill="rgba(255,255,255,0.28)"
            textAnchor={anchor as "start" | "middle" | "end"}
            fontFamily="DM Sans, sans-serif">
            {label}
          </text>
        ))}
      </svg>

      {/* ── Legend ── */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 18, height: 1.5, borderRadius: 1,
            background: `linear-gradient(90deg, ${GOLD}30, ${GOLD})` }} />
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}>
            RISING
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}>
            FADING
          </span>
          <div style={{ width: 18, height: 1.5, borderRadius: 1,
            background: `linear-gradient(90deg, ${AMBER}, ${AMBER}10)` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main screen
// ═════════════════════════════════════════════════════════════════════════════
function UrgeSurfing() {
  const navigate          = useNavigate();
  const [elapsed, setElapsed]     = useState(0);
  const [shockKey, setShockKey]   = useState(0); // bump to fire shockwave
  const prevLabel                  = useRef<string>("");

  // 1-second heartbeat
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const phase = getPhase(elapsed);

  // Shockwave fires on every phase transition
  useEffect(() => {
    if (prevLabel.current && prevLabel.current !== phase.label) {
      setShockKey(k => k + 1);
    }
    prevLabel.current = phase.label;
  }, [phase.label]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(175deg, #0d0a06 0%, #090705 55%, #0c0804 100%)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* ══ Header ══════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0">
        <motion.button
          onClick={() => navigate({ to: "/tools" })}
          whileTap={{ scale: 0.88 }}
          className="flex items-center gap-1.5"
          style={{
            color: "rgba(255,255,255,0.42)",
            fontSize: 13, fontWeight: 500,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <ArrowLeft size={15} />
          Back
        </motion.button>
        <ActiveUrgeShield />
      </div>

      {/* ══ Titles ══════════════════════════════════════════════════ */}
      <motion.div
        className="text-center px-6 pb-1 flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      >
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.38em",
          color: GOLD, marginBottom: 8,
          fontFamily: "DM Sans, sans-serif",
          textShadow: `0 0 18px ${GOLD}65`,
        }}>
          URGE SURFING
        </p>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "#ffffff",
          lineHeight: 1.2, letterSpacing: "-0.01em",
          fontFamily: "Cormorant Garamond, serif",
          textShadow: [
            "0 0 40px rgba(201,168,76,0.2)",
            "0 0 80px rgba(201,168,76,0.08)",
            "0 2px 6px rgba(0,0,0,0.55)",
          ].join(", "),
          marginBottom: 8,
        }}>
          Don't fight it.<br />Watch it.
        </h1>
        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.44)", lineHeight: 1.58,
          fontFamily: "DM Sans, sans-serif", maxWidth: 265, margin: "0 auto",
        }}>
          Urges peak around 90 seconds and then fade.{" "}
          <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Stay with it.</span>
        </p>
      </motion.div>

      {/* ══ Central sphere ══════════════════════════════════════════ */}
      <div className="flex justify-center items-center flex-shrink-0" style={{ padding: "18px 0 10px" }}>
        <div style={{ position: "relative", width: 156, height: 156 }}>

          {/* Plasma orbital rings */}
          <PlasmaField color={phase.color} />

          {/* Drawing progress ring */}
          <ProgressRing pct={phase.phasePct} color={phase.color} />

          {/* Phase-change shockwave */}
          <AnimatePresence>
            <motion.div
              key={shockKey}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `2px solid ${phase.color}` }}
              initial={{ scale: 1.0, opacity: 0.9 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.95, ease: [0.0, 0.0, 0.18, 1] }}
            />
          </AnimatePresence>

          {/* Gold 3-D sphere — radial gradient simulates a directional light */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
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
                "0 0 30px 8px rgba(201,168,76,0.2)",
                "0 8px 28px rgba(0,0,0,0.75)",
                "inset 12px 12px 28px rgba(255,240,170,0.14)",
                "inset -8px -8px 20px rgba(0,0,0,0.58)",
              ].join(", "),
            }}
          />

          {/* Phase label + countdown — etched look via textShadow */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 2 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={phase.label}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.28 }}
                style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.28em",
                  color: phase.color, marginBottom: 4,
                  fontFamily: "DM Sans, sans-serif",
                  textShadow: `0 0 14px ${phase.color}, 0 0 28px ${phase.color}80`,
                }}
              >
                {phase.label}
              </motion.p>
            </AnimatePresence>
            <p style={{
              fontSize: 32, fontWeight: 800, color: "#ffffff", lineHeight: 1,
              fontFamily: "DM Sans, sans-serif", fontVariantNumeric: "tabular-nums",
              textShadow: "0 0 22px rgba(255,255,255,0.75), 0 0 44px rgba(255,255,255,0.3)",
            }}>
              {phase.secsLeft}s
            </p>
          </div>
        </div>
      </div>

      {/* ══ Master timer ════════════════════════════════════════════ */}
      <motion.div
        className="text-center flex-shrink-0"
        style={{ paddingBottom: 14 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <p style={{
          fontSize: 48, fontWeight: 800, color: "#ffffff",
          fontVariantNumeric: "tabular-nums", letterSpacing: "0.06em",
          lineHeight: 1, fontFamily: "DM Sans, sans-serif",
          textShadow: [
            `0 0 28px rgba(201,168,76,0.5)`,
            `0 0 60px rgba(201,168,76,0.2)`,
            `0 2px 10px rgba(0,0,0,0.65)`,
          ].join(", "),
        }}>
          {mm}:{ss}
        </p>
        <p style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.32em",
          color: GOLD, marginTop: 6,
          fontFamily: "DM Sans, sans-serif",
          textShadow: `0 0 14px ${GOLD}55`,
        }}>
          TIME WITH THE URGE
        </p>
      </motion.div>

      {/* ══ Urge intensity chart ════════════════════════════════════ */}
      <div className="px-5 pb-10 flex-shrink-0">
        <UrgeChart elapsed={elapsed} />
      </div>
    </div>
  );
}

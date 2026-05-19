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

// ── Screen sparkle particles (deterministic) ─────────────────────────────────
const SCREEN_SPARKLES = [
  { x: 8,  y: 12, size: 2.0, opacity: 0.55, delay: 0.0, dur: 10.0 },
  { x: 88, y: 8,  size: 1.6, opacity: 0.45, delay: 2.8, dur: 12.0 },
  { x: 15, y: 45, size: 2.2, opacity: 0.50, delay: 1.2, dur: 9.0  },
  { x: 82, y: 38, size: 1.8, opacity: 0.42, delay: 4.0, dur: 11.5 },
  { x: 48, y: 6,  size: 1.5, opacity: 0.58, delay: 0.6, dur: 8.5  },
  { x: 92, y: 52, size: 1.7, opacity: 0.38, delay: 3.5, dur: 13.0 },
  { x: 5,  y: 68, size: 2.0, opacity: 0.48, delay: 1.7, dur: 9.5  },
  { x: 72, y: 72, size: 2.4, opacity: 0.44, delay: 5.2, dur: 10.5 },
  { x: 35, y: 82, size: 1.5, opacity: 0.40, delay: 2.4, dur: 8.0  },
  { x: 78, y: 85, size: 1.8, opacity: 0.35, delay: 1.0, dur: 11.0 },
  { x: 20, y: 28, size: 1.6, opacity: 0.50, delay: 6.0, dur: 9.0  },
  { x: 62, y: 18, size: 2.0, opacity: 0.48, delay: 3.2, dur: 10.0 },
  { x: 55, y: 94, size: 1.4, opacity: 0.42, delay: 0.8, dur: 12.5 },
  { x: 25, y: 92, size: 1.8, opacity: 0.38, delay: 4.5, dur: 9.5  },
];

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
          {/* Golden "YOU ARE HERE" glow for marker */}
          <filter id="wg" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="4.5" result="b" />
            <feFlood floodColor={GOLD} floodOpacity="0.95" result="c" />
            <feComposite in="c" in2="b" operator="in" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Trail glow blur */}
          <filter id="trail-glow" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
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

        {/* ── Historical light trail — soft glow layer + crisp line ── */}
        {trailD && (
          <>
            {/* Wide soft glow behind trail */}
            <path d={trailD} fill="none"
              stroke="url(#trail-g)" strokeWidth="8"
              strokeLinecap="round" opacity="0.20" filter="url(#trail-glow)" />
            {/* Crisp leading trail line */}
            <path d={trailD} fill="none"
              stroke="url(#trail-g)" strokeWidth="2.8"
              strokeLinecap="round" opacity="0.85" />
          </>
        )}

        {/* ── Golden "YOU ARE HERE" marker ── */}
        {/* Wide outer pulse ring */}
        <motion.circle cx={mx} cy={my} r={10}
          fill="none" stroke={`${GOLD}55`} strokeWidth="1.0"
          animate={{ r: [8, 18, 8], opacity: [0.55, 0, 0.55] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
        />
        {/* Mid pulse ring */}
        <motion.circle cx={mx} cy={my} r={6}
          fill="none" stroke={`${GOLD}88`} strokeWidth="0.9"
          animate={{ r: [5, 11, 5], opacity: [0.70, 0.12, 0.70] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut", delay: 0.4 }}
        />
        {/* Inner golden core */}
        <motion.circle cx={mx} cy={my} r={3.5}
          fill={GOLD} filter="url(#wg)"
          animate={{ r: [2.8, 4.6, 2.8], opacity: [1, 0.60, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
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
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse at 50% 36%, #0c0812 0%, #060410 50%, #030205 100%)",
      position: "relative",
    }}>

      {/* ── Aurora blobs — gold + deep blue, slow and calm ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%","12%","22%","8%","0%"], y: ["0%","6%","-4%","8%","0%"], scale: [1,1.06,0.96,1.04,1], opacity: [0.16,0.22,0.14,0.20,0.16] }}
          transition={{ duration: 52, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", top: "-20%", left: "0%",
            width: "80vw", height: "80vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.28) 0%, transparent 65%)",
            filter: "blur(160px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","-14%","-24%","-10%","0%"], y: ["0%","8%","2%","10%","0%"], scale: [1,0.92,1.10,0.96,1], opacity: [0.12,0.08,0.16,0.10,0.12] }}
          transition={{ duration: 60, ease: "easeInOut", repeat: Infinity, delay: 12 }}
          style={{
            position: "absolute", top: "10%", right: "-20%",
            width: "70vw", height: "70vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(70,100,200,0.24) 0%, transparent 65%)",
            filter: "blur(150px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","6%","-8%","10%","0%"], y: ["0%","-8%","6%","-10%","0%"], scale: [1,1.08,0.94,1.05,1], opacity: [0.10,0.16,0.08,0.14,0.10] }}
          transition={{ duration: 46, ease: "easeInOut", repeat: Infinity, delay: 24 }}
          style={{
            position: "absolute", top: "42%", left: "-10%",
            width: "60vw", height: "60vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.18) 0%, transparent 65%)",
            filter: "blur(140px)",
          }}
        />
      </div>

      {/* ── Interconnected network grid — breathes on 8s cycle at ~4% opacity ── */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
          <g stroke="rgba(196,135,58,0.9)" strokeWidth="0.55">
            <line x1="0"   y1="120" x2="80"  y2="60"/>
            <line x1="80"  y1="60"  x2="195" y2="90"/>
            <line x1="195" y1="90"  x2="310" y2="50"/>
            <line x1="310" y1="50"  x2="390" y2="140"/>
            <line x1="30"  y1="250" x2="130" y2="300"/>
            <line x1="130" y1="300" x2="260" y2="230"/>
            <line x1="260" y1="230" x2="360" y2="290"/>
            <line x1="60"  y1="420" x2="190" y2="380"/>
            <line x1="190" y1="380" x2="310" y2="450"/>
            <line x1="20"  y1="560" x2="140" y2="520"/>
            <line x1="140" y1="520" x2="250" y2="590"/>
            <line x1="80"  y1="690" x2="200" y2="650"/>
            <line x1="200" y1="650" x2="320" y2="710"/>
            <line x1="80"  y1="60"  x2="260" y2="230"/>
            <line x1="60"  y1="420" x2="140" y2="520"/>
            <line x1="80"  y1="690" x2="195" y2="780"/>
          </g>
          <g stroke="rgba(80,110,200,0.9)" strokeWidth="0.45">
            <line x1="390" y1="140" x2="360" y2="290"/>
            <line x1="360" y1="290" x2="390" y2="400"/>
            <line x1="310" y1="450" x2="250" y2="590"/>
            <line x1="250" y1="590" x2="370" y2="540"/>
            <line x1="320" y1="710" x2="360" y2="830"/>
          </g>
          <g fill="rgba(196,135,58,0.9)">
            <circle cx="80"  cy="60"  r="2.0"/>
            <circle cx="195" cy="90"  r="1.8"/>
            <circle cx="130" cy="300" r="2.5"/>
            <circle cx="190" cy="380" r="2.5"/>
            <circle cx="200" cy="650" r="2.5"/>
          </g>
          <g fill="rgba(80,110,200,0.9)">
            <circle cx="360" cy="290" r="1.8"/>
            <circle cx="370" cy="540" r="1.8"/>
          </g>
        </svg>
      </motion.div>

      {/* ── Intimate focused centre light ── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 44%, rgba(196,135,58,0.07) 0%, transparent 52%)",
      }} />

      {/* ── Slow drifting gold + blue sparkle particles ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SCREEN_SPARKLES.map((p, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -26, 0], opacity: [0, p.opacity, 0], scale: [0.4, 1.1, 0.4] }}
            transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: "50%",
              background: i % 5 === 0 ? "rgba(100,140,230,0.95)" : GOLD,
              boxShadow: i % 5 === 0
                ? "0 0 5px 1px rgba(100,140,230,0.55)"
                : "0 0 5px 2px rgba(201,168,76,0.60)",
            }}
          />
        ))}
      </div>

      {/* ── Page content (above all fixed layers) ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        minHeight: "100dvh", overflowY: "auto",
      }}>

        {/* ══ Header ════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 pt-12 pb-3 flex-shrink-0">
          <motion.button
            onClick={() => navigate({ to: "/tools" })}
            whileTap={{ scale: 0.88 }}
            className="flex items-center gap-1.5"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <ArrowLeft size={15} />
            Back
          </motion.button>
          <ActiveUrgeShield />
        </div>

        {/* ══ Titles ═══════════════════════════════════════════════ */}
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
              "0 0 40px rgba(201,168,76,0.22)",
              "0 0 80px rgba(201,168,76,0.08)",
              "0 2px 8px rgba(0,0,0,0.70)",
            ].join(", "),
            marginBottom: 8,
          }}>
            Don't fight it.<br />Watch it.
          </h1>
          <p style={{
            fontSize: 12, color: "rgba(255,255,255,0.50)", lineHeight: 1.58,
            fontFamily: "DM Sans, sans-serif", maxWidth: 265, margin: "0 auto",
          }}>
            Urges peak around 90 seconds and then fade.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>Stay with it.</span>
          </p>
        </motion.div>

        {/* ══ Central sphere ═══════════════════════════════════════ */}
        <div className="flex justify-center items-center flex-shrink-0" style={{ padding: "18px 0 10px" }}>
          <div style={{ position: "relative", width: 156, height: 156 }}>

            {/* ── Outer amber ambient halo — constant warm glow ── */}
            <motion.div
              aria-hidden
              animate={{ opacity: [0.52, 0.84, 0.52], scale: [0.96, 1.12, 0.96] }}
              transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
              style={{
                position: "absolute", inset: -38, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(196,135,58,0.30) 0%, transparent 62%)",
                filter: "blur(26px)",
                pointerEvents: "none",
              }}
            />
            {/* ── Amber pulse ring 1 — close breathe ── */}
            <motion.div
              aria-hidden
              animate={{ scale: [0.93, 1.24, 0.93], opacity: [0.54, 0.13, 0.54] }}
              transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
              style={{
                position: "absolute", inset: -9, borderRadius: "50%",
                border: "1.5px solid rgba(196,135,58,0.66)",
                boxShadow: "0 0 18px 5px rgba(196,135,58,0.26)",
                pointerEvents: "none",
              }}
            />
            {/* ── Amber pulse ring 2 — wider, offset timing ── */}
            <motion.div
              aria-hidden
              animate={{ scale: [1.0, 1.36, 1.0], opacity: [0.28, 0.05, 0.28] }}
              transition={{ duration: 5.6, ease: "easeInOut", repeat: Infinity, delay: 1.7 }}
              style={{
                position: "absolute", inset: -23, borderRadius: "50%",
                border: "1px solid rgba(232,168,74,0.45)",
                pointerEvents: "none",
              }}
            />

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

            {/* ── Molten amber-gold sphere — multi-layer ── */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: [
                  "radial-gradient(circle at 36% 30%,",
                  "#FFF4CC 0%,",
                  "#EECB5A 8%,",
                  "#CC8C32 22%,",
                  "#8A5C1A 44%,",
                  "#4A2A08 66%,",
                  "#180C02 100%)",
                ].join(" "),
                boxShadow: [
                  "0 0 0 1.5px rgba(201,168,76,0.32)",
                  "0 0 40px 14px rgba(196,135,58,0.28)",
                  "0 10px 36px rgba(0,0,0,0.84)",
                  "inset 14px 14px 34px rgba(255,238,160,0.20)",
                  "inset -10px -10px 26px rgba(0,0,0,0.70)",
                ].join(", "),
              }}
            >
              {/* Molten floating highlight — shifts slowly for living texture */}
              <motion.div
                animate={{ x: [0, 10, -5, 8, 0], y: [0, -8, 5, -10, 0] }}
                transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
                style={{
                  position: "absolute",
                  width: "68%", height: "68%",
                  top: "5%", left: "12%",
                  background: "radial-gradient(circle at 42% 40%, rgba(255,234,155,0.54) 0%, rgba(210,148,55,0.26) 48%, transparent 72%)",
                  borderRadius: "50%",
                  filter: "blur(8px)",
                  pointerEvents: "none",
                }}
              />
              {/* Deep molten shadow — bottom-right for 3D depth */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "radial-gradient(circle at 72% 76%, rgba(120,50,8,0.52) 0%, transparent 58%)",
                pointerEvents: "none",
              }} />
            </div>

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
                textShadow: "0 0 22px rgba(255,255,255,0.75), 0 0 44px rgba(255,255,255,0.30)",
              }}>
                {phase.secsLeft}s
              </p>
            </div>
          </div>
        </div>

        {/* ══ Master timer ══════════════════════════════════════════ */}
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
              `0 0 28px rgba(201,168,76,0.52)`,
              `0 0 60px rgba(201,168,76,0.20)`,
              `0 2px 10px rgba(0,0,0,0.72)`,
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

        {/* ══ Urge intensity chart ═══════════════════════════════════ */}
        <div className="px-5 pb-6 flex-shrink-0">
          <UrgeChart elapsed={elapsed} />
        </div>

        {/* ══ Social proof strip ════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: "0 20px 28px",
            borderRadius: 18,
            background: "linear-gradient(145deg, rgba(12,8,18,0.78) 0%, rgba(7,5,15,0.84) 100%)",
            border: "1px solid rgba(196,135,58,0.18)",
            boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.05), 0 2px 22px rgba(0,0,0,0.30)",
            padding: "13px 16px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", gap: 13,
            flexShrink: 0,
          }}
        >
          {/* Avatar cluster */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            {([
              ["K", "oklch(0.50 0.15 290)"],
              ["J", "oklch(0.52 0.16 145)"],
              ["M", "oklch(0.55 0.18 260)"],
            ] as [string, string][]).map(([l, bg], i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: "50%",
                background: bg,
                border: "1.5px solid rgba(3,2,5,0.88)",
                marginLeft: i > 0 ? -8 : 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "white",
              }}>{l}</div>
            ))}
          </div>
          {/* Quote */}
          <p style={{
            fontSize: 12, color: "rgba(255,255,255,0.58)",
            lineHeight: 1.4, fontFamily: "DM Sans, sans-serif",
          }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>✦ Kenji</span>
            {" — "}<em>"This app hits different"</em>
          </p>
        </motion.div>

      </div>{/* end page content */}
    </div>
  );
}

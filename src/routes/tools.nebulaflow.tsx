import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/nebulaflow")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: NebulaFlow,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const BREATH_CYCLE = 8000; // 4s in + 4s out
const STAR_REVEAL_INTERVAL = 2400; // ms between each star appearing

// Constellations: sets of (x%, y%) positions in a 0-100 coordinate space
const CONSTELLATIONS = [
  // "The Seeker" — arrow pointing up
  [
    { x: 50, y: 18 },
    { x: 35, y: 38 },
    { x: 50, y: 32 },
    { x: 65, y: 38 },
    { x: 50, y: 52 },
    { x: 42, y: 68 },
    { x: 58, y: 68 },
  ],
  // "The Spiral" — loose inward spiral
  [
    { x: 22, y: 30 },
    { x: 50, y: 18 },
    { x: 75, y: 30 },
    { x: 80, y: 58 },
    { x: 62, y: 76 },
    { x: 38, y: 76 },
    { x: 50, y: 52 },
  ],
  // "The Cross" — cardinal cross
  [
    { x: 50, y: 20 },
    { x: 50, y: 42 },
    { x: 28, y: 52 },
    { x: 50, y: 42 },
    { x: 72, y: 52 },
    { x: 50, y: 42 },
    { x: 50, y: 72 },
  ],
];

const NEBULA_COLORS = [
  { cx: "30%", cy: "40%", rx: "45%", ry: "30%", color: "#7c3aed" },
  { cx: "70%", cy: "60%", rx: "40%", ry: "28%", color: "#db2777" },
  { cx: "50%", cy: "20%", rx: "35%", ry: "22%", color: "#2563eb" },
  { cx: "20%", cy: "75%", rx: "30%", ry: "20%", color: "#6d28d9" },
];

// Pre-seeded particle positions (avoids hydration mismatch)
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.508) % 100),
  y: ((i * 97.3) % 100),
  r: 0.5 + (i % 5) * 0.28,
  opacity: 0.2 + (i % 4) * 0.18,
  dur: 3 + (i % 5) * 1.4,
  delay: (i % 8) * 0.6,
}));

// ── Helper: four-pointed star path centered at 0,0 ────────────────────────────
function starPath(outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(`${r * Math.cos(angle)},${r * Math.sin(angle)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = "intro" | "playing" | "complete";

interface StarNode {
  x: number; // 0-100 (percentage)
  y: number;
  index: number;
}

interface DrawnLine {
  x1: number; y1: number;
  x2: number; y2: number;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
function NebulaFlow() {
  const navigate  = useNavigate();
  const svgRef    = useRef<SVGSVGElement>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const starTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundRef  = useRef(0);

  const [phase, setPhase]           = useState<Phase>("intro");
  const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");
  const [breathProgress, setBreathProgress] = useState(0); // 0-1

  // Constellation state
  const [constIdx, setConstIdx]         = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [nextIndex, setNextIndex]       = useState(0); // which star to connect next
  const [drawnLines, setDrawnLines]     = useState<DrawnLine[]>([]);
  const [activeLine, setActiveLine]     = useState<DrawnLine | null>(null); // live drag line
  const [bursts, setBursts]             = useState<BurstParticle[]>([]);
  const [dragging, setDragging]         = useState(false);
  const [dragFrom, setDragFrom]         = useState<StarNode | null>(null);
  const [score, setScore]               = useState(0);
  const [round, setRound]               = useState(1);
  const burstIdRef = useRef(0);

  const constellation = CONSTELLATIONS[constIdx];

  // ── Breathing animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    let start = Date.now();
    let rafId: number;

    function tick() {
      const elapsed = (Date.now() - start) % BREATH_CYCLE;
      const halfCycle = BREATH_CYCLE / 2;
      if (elapsed < halfCycle) {
        setBreathPhase("in");
        setBreathProgress(elapsed / halfCycle);
      } else {
        setBreathPhase("out");
        setBreathProgress(1 - (elapsed - halfCycle) / halfCycle);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase]);

  // ── Star reveal sequence ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    setRevealedCount(1); // first star always visible
    setNextIndex(0);

    starTimerRef.current = setInterval(() => {
      setRevealedCount(c => {
        if (c >= constellation.length) {
          if (starTimerRef.current) clearInterval(starTimerRef.current);
          return c;
        }
        return c + 1;
      });
    }, STAR_REVEAL_INTERVAL);

    return () => { if (starTimerRef.current) clearInterval(starTimerRef.current); };
  }, [phase, constIdx, constellation.length]);

  // ── SVG coordinate helper ──────────────────────────────────────────────────
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  // ── Hit-test: is point near a star? ───────────────────────────────────────
  const hitStar = useCallback((px: number, py: number, stars: StarNode[], exclude?: number): StarNode | null => {
    const HIT_RADIUS = 9; // in % units
    for (const s of stars) {
      if (s.index === exclude) continue;
      const dx = px - s.x, dy = py - s.y;
      if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) return s;
    }
    return null;
  }, []);

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const visibleStars: StarNode[] = constellation
    .slice(0, revealedCount)
    .map((pos, i) => ({ ...pos, index: i }));

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (phase !== "playing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = svgPoint(e.clientX, e.clientY);
    const hit = hitStar(pt.x, pt.y, visibleStars);
    if (hit && hit.index === nextIndex) {
      setDragging(true);
      setDragFrom(hit);
      setActiveLine({ x1: hit.x, y1: hit.y, x2: pt.x, y2: pt.y });
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || !dragFrom) return;
    const pt = svgPoint(e.clientX, e.clientY);
    setActiveLine({ x1: dragFrom.x, y1: dragFrom.y, x2: pt.x, y2: pt.y });
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || !dragFrom) return;
    setDragging(false);
    setActiveLine(null);

    const pt = svgPoint(e.clientX, e.clientY);
    const target = hitStar(pt.x, pt.y, visibleStars, dragFrom.index);
    const expectedNext = nextIndex + 1;

    if (target && target.index === expectedNext) {
      // Correct connection!
      setDrawnLines(prev => [...prev, { x1: dragFrom.x, y1: dragFrom.y, x2: target.x, y2: target.y }]);
      setNextIndex(expectedNext);
      setScore(s => s + 10);

      // Burst effect at target star
      const id = ++burstIdRef.current;
      setBursts(prev => [...prev, { id, x: target.x, y: target.y }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 900);

      // Check round complete
      if (expectedNext === constellation.length - 1) {
        setTimeout(() => {
          const nextConst = (constIdx + 1) % CONSTELLATIONS.length;
          const nextRound = roundRef.current + 1;
          if (nextRound >= 3) {
            setPhase("complete");
          } else {
            roundRef.current = nextRound;
            setRound(nextRound + 1);
            setConstIdx(nextConst);
            setDrawnLines([]);
            setRevealedCount(1);
            setNextIndex(0);
          }
        }, 1200);
      }
    }
    setDragFrom(null);
  }

  // ── Nebula glow scale (breathes with breath cycle) ────────────────────────
  const nebulaScale = 0.92 + breathProgress * 0.16;
  const nebulaOpacity = 0.13 + breathProgress * 0.1;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#04040e",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "DM Sans, sans-serif",
      userSelect: "none",
      touchAction: "none",
    }}>

      {/* ── Deep space particle field ───────────────────────────────────── */}
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {NEBULA_COLORS.map((n, i) => (
            <radialGradient key={i} id={`nb-neb-${i}`} cx={n.cx} cy={n.cy} r="50%">
              <stop offset="0%"   stopColor={n.color} stopOpacity="1"/>
              <stop offset="100%" stopColor={n.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {/* Nebulae — breathe with breathing rhythm */}
        {NEBULA_COLORS.map((n, i) => (
          <ellipse
            key={i}
            cx={n.cx} cy={n.cy}
            rx={n.rx} ry={n.ry}
            fill={`url(#nb-neb-${i})`}
            opacity={nebulaOpacity}
            style={{ transform: `scale(${nebulaScale})`, transformOrigin: `${n.cx} ${n.cy}`, transition: "opacity 0.4s" }}
          />
        ))}

        {/* Star particles */}
        {PARTICLES.map((p, i) => (
          <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="white" opacity={p.opacity}>
            <animate attributeName="opacity"
              values={`${p.opacity};${Math.min(1, p.opacity + 0.4)};${p.opacity}`}
              dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite"/>
          </circle>
        ))}
      </svg>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", gap: 12,
        padding: "52px 20px 16px",
      }}>
        <button
          onClick={() => navigate({ to: "/" })}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#a855f7", cursor: "pointer",
          }}
        >
          <ArrowLeft size={16}/>
        </button>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(168,85,247,0.7)", margin: 0 }}>
            NEBULA FLOW
          </p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#f0e6ff", margin: 0, lineHeight: 1.1 }}>
            Trace the Stars
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, letterSpacing: "0.1em" }}>ROUND</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#a855f7", margin: 0, lineHeight: 1 }}>{round}/3</p>
        </div>
      </div>

      {/* ── Breath guide bar ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "relative", zIndex: 10, padding: "0 20px 10px", display: "flex", alignItems: "center", gap: 10 }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: breathPhase === "in" ? "#a855f7" : "#db2777", margin: 0, width: 40, textAlign: "center", transition: "color 0.6s" }}>
              {breathPhase === "in" ? "IN" : "OUT"}
            </p>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${breathProgress * 100}%` }}
                transition={{ duration: 0.1 }}
                style={{ height: "100%", borderRadius: 3, background: breathPhase === "in" ? "#a855f7" : "#db2777", boxShadow: `0 0 8px ${breathPhase === "in" ? "#a855f7" : "#db2777"}` }}
              />
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", margin: 0, width: 44, textAlign: "right" }}>
              +{score}pts
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main game area ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", zIndex: 5 }}>

        {/* ── INTRO screen ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", gap: 32 }}
            >
              {/* Animated nebula icon */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "relative", width: 120, height: 120 }}
              >
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(219,39,119,0.12) 60%, transparent 100%)",
                  boxShadow: "0 0 60px 20px rgba(168,85,247,0.2)",
                }}/>
                <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%" }}>
                  {[0,1,2,3,4,5,6].map((i) => {
                    const star = CONSTELLATIONS[0][i];
                    const x = star.x * 1.2, y = star.y * 1.2;
                    return (
                      <g key={i}>
                        {i > 0 && (
                          <line
                            x1={CONSTELLATIONS[0][i-1].x * 1.2} y1={CONSTELLATIONS[0][i-1].y * 1.2}
                            x2={x} y2={y}
                            stroke="rgba(168,85,247,0.5)" strokeWidth="1"
                            filter="url(#nb-intro-glow)"
                          />
                        )}
                        <path d={starPath(5, 2)} fill="#d946ef" opacity={0.9}
                          transform={`translate(${x},${y})`}
                          filter="url(#nb-intro-glow)"/>
                      </g>
                    );
                  })}
                  <defs>
                    <filter id="nb-intro-glow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="2.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                </svg>
              </motion.div>

              <div style={{ textAlign: "center", maxWidth: 280 }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#f0e6ff", margin: "0 0 12px", lineHeight: 1.2 }}>
                  Breathe & Connect
                </p>
                <p style={{ fontSize: 14, color: "rgba(200,180,240,0.72)", lineHeight: 1.6, margin: 0 }}>
                  Stars appear one by one, breathing with you. Drag to connect each star to the next in sequence. Complete 3 constellations.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
                {[
                  { icon: "✦", text: "Stars appear with each breath" },
                  { icon: "⟡", text: "Drag from one star to the next" },
                  { icon: "◈", text: "Correct links glow and pulse" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.18)" }}>
                    <span style={{ fontSize: 16, color: "#d946ef" }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "rgba(220,200,255,0.8)" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { setPhase("playing"); roundRef.current = 0; }}
                style={{
                  padding: "14px 48px", borderRadius: 50,
                  background: "linear-gradient(135deg, #7c3aed, #db2777)",
                  border: "none", color: "#fff", fontSize: 16, fontWeight: 800,
                  cursor: "pointer", letterSpacing: "0.04em",
                  boxShadow: "0 0 32px rgba(168,85,247,0.5), 0 0 60px rgba(219,39,119,0.25)",
                }}
              >
                Begin
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PLAYING screen ───────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {/* Constellation label */}
              <div style={{ textAlign: "center", paddingTop: 8, paddingBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(168,85,247,0.55)", margin: 0 }}>
                  {["THE SEEKER", "THE SPIRAL", "THE CROSS"][constIdx]}
                </p>
              </div>

              {/* Instruction hint */}
              <AnimatePresence>
                {nextIndex < revealedCount - 1 || (revealedCount > 1 && nextIndex === 0) ? null : (
                  <motion.p
                    key={`hint-${nextIndex}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: "center", fontSize: 11, color: "rgba(200,180,255,0.45)", margin: "0 0 4px", letterSpacing: "0.08em" }}
                  >
                    {revealedCount <= 1 ? "Waiting for next star…" : `Connect star ${nextIndex + 1} → ${nextIndex + 2}`}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* SVG game canvas */}
              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "calc(100% - 48px)", display: "block", cursor: dragging ? "crosshair" : "default" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <defs>
                  <filter id="nb-star-glow" x="-150%" y="-150%" width="400%" height="400%">
                    <feGaussianBlur stdDeviation="2.2" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="nb-line-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.4" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="nb-burst-glow" x="-150%" y="-150%" width="400%" height="400%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Drawn constellation lines */}
                {drawnLines.map((ln, i) => (
                  <g key={i}>
                    {/* Glow layer */}
                    <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                      stroke="#d946ef" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" filter="url(#nb-line-glow)"/>
                    {/* Core line */}
                    <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
                      stroke="#f0abfc" strokeWidth="1.2" strokeLinecap="round"/>
                  </g>
                ))}

                {/* Active drag line */}
                {activeLine && (
                  <g>
                    <line x1={activeLine.x1} y1={activeLine.y1} x2={activeLine.x2} y2={activeLine.y2}
                      stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeDasharray="2,2" opacity="0.5" filter="url(#nb-line-glow)"/>
                    <line x1={activeLine.x1} y1={activeLine.y1} x2={activeLine.x2} y2={activeLine.y2}
                      stroke="#c084fc" strokeWidth="0.8" strokeLinecap="round" strokeDasharray="2,2"/>
                  </g>
                )}

                {/* Stars */}
                {visibleStars.map((star, i) => {
                  const isConnected  = star.index < nextIndex;
                  const isNext       = star.index === nextIndex;
                  const isLast       = star.index === nextIndex - 1;
                  const starColor    = isConnected ? "#f0abfc" : isNext ? "#e879f9" : "#a78bfa";
                  const glowColor    = isConnected ? "#d946ef" : isNext ? "#c026d3" : "#7c3aed";

                  return (
                    <g key={star.index}>
                      {/* Outer halo — pulses for the next star */}
                      {isNext && (
                        <circle cx={star.x} cy={star.y} r="7" fill="none"
                          stroke={glowColor} strokeWidth="0.6" opacity="0.4">
                          <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
                        </circle>
                      )}

                      {/* Star body */}
                      <path
                        d={starPath(isNext ? 4 : 3, isNext ? 1.6 : 1.2)}
                        fill={starColor}
                        transform={`translate(${star.x},${star.y})`}
                        filter="url(#nb-star-glow)"
                        opacity={isConnected ? 0.7 : 1}
                      />

                      {/* Sequence number */}
                      <text
                        x={star.x} y={star.y + 7.5}
                        textAnchor="middle" fontSize="3.5"
                        fill={isConnected ? "rgba(240,171,252,0.5)" : "rgba(255,255,255,0.7)"}
                        fontWeight="700" fontFamily="DM Sans, sans-serif"
                      >
                        {star.index + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Hidden stars — faint dots showing total count */}
                {constellation.slice(revealedCount).map((pos, i) => (
                  <circle key={`hidden-${i}`} cx={pos.x} cy={pos.y} r="0.8" fill="rgba(168,85,247,0.25)"/>
                ))}

                {/* Burst effects */}
                {bursts.map(burst => (
                  <g key={burst.id} filter="url(#nb-burst-glow)">
                    {[0,1,2,3,4,5].map(j => {
                      const angle = (j / 6) * Math.PI * 2;
                      const ex = burst.x + Math.cos(angle) * 12;
                      const ey = burst.y + Math.sin(angle) * 12;
                      return (
                        <line key={j}
                          x1={burst.x} y1={burst.y} x2={ex} y2={ey}
                          stroke="#f0abfc" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
                          <animate attributeName="opacity" values="0.8;0" dur="0.9s" fill="freeze"/>
                          <animate attributeName="x2" values={`${burst.x};${ex}`} dur="0.9s" fill="freeze"/>
                          <animate attributeName="y2" values={`${burst.y};${ey}`} dur="0.9s" fill="freeze"/>
                        </line>
                      );
                    })}
                    <circle cx={burst.x} cy={burst.y} r="3" fill="#f0abfc" opacity="0.9">
                      <animate attributeName="r" values="3;10;10" dur="0.9s" fill="freeze"/>
                      <animate attributeName="opacity" values="0.9;0;0" dur="0.9s" fill="freeze"/>
                    </circle>
                  </g>
                ))}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── COMPLETE screen ──────────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", gap: 28 }}
            >
              {/* Glow ring */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
                  boxShadow: "0 0 60px 20px rgba(168,85,247,0.3), 0 0 100px 40px rgba(219,39,119,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 40 40" width="50" height="50">
                  <path d={starPath(18, 7)} fill="#d946ef" transform="translate(20,20)" opacity="0.95"
                    filter="url(#nb-star-glow)"/>
                </svg>
              </motion.div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: "#f0e6ff", margin: "0 0 8px" }}>
                  Flow Complete
                </p>
                <p style={{ fontSize: 14, color: "rgba(200,180,240,0.7)", margin: 0 }}>
                  You traced all three constellations
                </p>
              </div>

              <div style={{
                padding: "20px 32px", borderRadius: 20,
                background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(168,85,247,0.7)", margin: "0 0 4px" }}>SCORE</p>
                <p style={{ fontSize: 40, fontWeight: 900, color: "#f0abfc", margin: 0, lineHeight: 1 }}>{score}</p>
              </div>

              <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 280 }}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setPhase("playing");
                    setConstIdx(0);
                    setDrawnLines([]);
                    setRevealedCount(1);
                    setNextIndex(0);
                    setScore(0);
                    setRound(1);
                    roundRef.current = 0;
                  }}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 50,
                    background: "linear-gradient(135deg, #7c3aed, #db2777)",
                    border: "none", color: "#fff", fontSize: 15, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 0 24px rgba(168,85,247,0.4)",
                  }}
                >
                  <RotateCcw size={15}/> Play Again
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate({ to: "/" })}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 50,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Exit
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

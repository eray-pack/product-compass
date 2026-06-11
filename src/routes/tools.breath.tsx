import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitRecord } from "@/lib/records";

export const Route = createFileRoute("/tools/breath")({
  component: BreathBall,
});

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done";

const PHASE_DURATION = 4;
const TOTAL_CYCLES   = 5;

const PHASE_LABEL: Record<Phase, string> = {
  idle:   "Ready",
  inhale: "Breathe in",
  hold:   "Hold",
  exhale: "Breathe out",
  done:   "Well done",
};

const PHASE_COLOR: Record<Phase, string> = {
  idle:   "#C4873A",
  inhale: "#6BAED6",
  hold:   "#9ECAE1",
  exhale: "#C4873A",
  done:   "#6BAA75",
};

// Deterministic particles — 10 points distributed around the ball.
// Ball center = (120, 120) in the 240×240 container.
const PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const r     = i % 2 === 0 ? 95 : 112;
  const sizes    = [3, 2, 4, 2, 3] as const;
  const opacities = [0.40, 0.26, 0.34, 0.28, 0.38] as const;
  return {
    x:        120 + Math.cos(angle) * r,
    y:        120 + Math.sin(angle) * r,
    size:     sizes[i % 5],
    opacity:  opacities[i % 5],
    duration: 3.8 + (i % 5) * 0.45,
    delay:    i * 0.60,
  };
});

const EASE_BREATH = [0.45, 0, 0.55, 1] as [number, number, number, number];

function BreathBall() {
  const navigate = useNavigate();
  const [phase, setPhase]           = useState<Phase>("idle");
  const [cycle, setCycle]           = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASE_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef    = useRef<Phase>("idle");
  const cycleRef    = useRef(0);
  const secsRef     = useRef(PHASE_DURATION);

  function clearTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function nextPhase(cur: Phase, curCycle: number): { phase: Phase; cycle: number } {
    if (cur === "inhale") return { phase: "hold",   cycle: curCycle };
    if (cur === "hold")   return { phase: "exhale", cycle: curCycle };
    if (cur === "exhale") {
      const next = curCycle + 1;
      return next >= TOTAL_CYCLES
        ? { phase: "done",   cycle: next }
        : { phase: "inhale", cycle: next };
    }
    return { phase: "inhale", cycle: curCycle };
  }

  function start() {
    if (phase === "done") {
      phaseRef.current = "idle";
      cycleRef.current = 0;
      secsRef.current  = PHASE_DURATION;
      setPhase("idle"); setCycle(0); setSecondsLeft(PHASE_DURATION);
      return;
    }
    phaseRef.current = "inhale";
    cycleRef.current = 0;
    secsRef.current  = PHASE_DURATION;
    setPhase("inhale"); setCycle(0); setSecondsLeft(PHASE_DURATION);

    clearTimer();
    intervalRef.current = setInterval(() => {
      secsRef.current -= 1;
      if (secsRef.current <= 0) {
        const { phase: np, cycle: nc } = nextPhase(phaseRef.current, cycleRef.current);
        phaseRef.current = np;
        cycleRef.current = nc;
        secsRef.current  = PHASE_DURATION;
        setPhase(np); setCycle(nc); setSecondsLeft(PHASE_DURATION);
        if (np === "done") clearTimer();
      } else {
        setSecondsLeft(secsRef.current);
      }
    }, 1000);
  }

  useEffect(() => () => clearTimer(), []);

  // Persist completed breath cycles (even partial sessions count) — feeds
  // the "Your Records" board on the Tools page.
  useEffect(() => {
    if (cycle > 0) submitRecord("mindpulse", cycle);
  }, [cycle]);

  const isRunning  = phase !== "idle" && phase !== "done";
  const ballColor  = PHASE_COLOR[phase];

  // Ball scale: 1.45 when expanded (inhale/hold), 1.0 when contracted
  const ballScale = phase === "inhale" || phase === "hold" ? 1.45 : 1.0;

  // Transition: match the phase duration for inhale/exhale, instant-ish for hold
  const ballTransition =
    phase === "inhale" ? { duration: PHASE_DURATION, ease: EASE_BREATH } :
    phase === "exhale" ? { duration: PHASE_DURATION, ease: EASE_BREATH } :
    /* hold / idle */    { duration: 0.55, ease: "easeOut" as const };

  // Glow: expands with inhale, stays expanded during hold, contracts during exhale
  const glowScale   = phase === "inhale" || phase === "hold" ? 1.60 : 0.80;
  const glowOpacity = phase === "inhale" ? 0.72 : phase === "hold" ? 0.55 : phase === "exhale" ? 0.22 : 0.38;
  const glowTransition = {
    duration: phase === "inhale" || phase === "exhale" ? PHASE_DURATION : 0.8,
    ease: EASE_BREATH,
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Background layers ───────────────────────────────────────────────── */}

      {/* Base — near-black */}
      <div className="absolute inset-0" style={{ background: "#010209" }} />

      {/* Blue inhale bloom — deepens as you breathe in */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === "inhale" ? 1 : phase === "hold" ? 0.75 : 0.12 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 32%, #041840 0%, #020c24 45%, transparent 100%)",
        }}
      />

      {/* Warm exhale bloom — glows amber as you breathe out */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: phase === "exhale" ? 0.65 : 0.08 }}
        transition={{ duration: 2.0, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 60%, #1e0a00 0%, transparent 70%)",
        }}
      />

      {/* ── Back button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => { clearTimer(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-20 h-9 w-9 rounded-full grid place-items-center transition-opacity active:opacity-60"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <ArrowLeft className="h-4 w-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      </button>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-10 relative z-10">

        {/* Title + cycle counter — slides in from top */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="text-[10px] font-bold tracking-[0.36em] uppercase"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Breath Ball
          </p>

          {/* Cycle counter — fades per cycle change */}
          <div className="mt-1 h-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.p
                  key={`c${cycle}`}
                  className="text-xs tabular-nums"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  Cycle {cycle + 1} of {TOTAL_CYCLES}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Ball area ───────────────────────────────────────────────────── */}
        {/* overflow visible so particles can drift above the container */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240, overflow: "visible" }}
        >
          {/* Floating energy particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width:      p.size,
                height:     p.size,
                left:       p.x - p.size / 2,
                top:        p.y - p.size / 2,
                background: ballColor,
              }}
              animate={{
                y:       [0, -88],
                opacity: [0, p.opacity, 0],
                x:       [0, (i % 2 === 0 ? 1 : -1) * (6 + (i % 3) * 4)],
              }}
              transition={{
                duration: p.duration,
                repeat:   Infinity,
                delay:    p.delay,
                ease:     "easeOut",
                times:    [0, 0.28, 1],
              }}
            />
          ))}

          {/* Outer diffuse glow — scales with breathing */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ scale: glowScale, opacity: glowOpacity }}
            transition={glowTransition}
            style={{
              background: `radial-gradient(circle, ${ballColor}38 15%, ${ballColor}12 50%, transparent 72%)`,
            }}
          />

          {/* Crisp glowing ring — halos the ball */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale:   glowScale * 0.86,
              opacity: phase === "inhale" || phase === "hold" ? 0.55 : 0.14,
            }}
            transition={glowTransition}
            style={{
              top: 10, right: 10, bottom: 10, left: 10,
              border: `1px solid ${ballColor}55`,
              boxShadow: `0 0 28px 6px ${ballColor}22, inset 0 0 18px ${ballColor}16`,
            }}
          />

          {/* Second, tighter ring for depth */}
          <motion.div
            className="absolute pointer-events-none rounded-full"
            animate={{
              scale:   glowScale * 0.70,
              opacity: phase === "inhale" || phase === "hold" ? 0.30 : 0.06,
            }}
            transition={glowTransition}
            style={{
              top: 28, right: 28, bottom: 28, left: 28,
              border: `1px solid ${ballColor}44`,
            }}
          />

          {/* Main ball */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center"
            animate={{ scale: ballScale }}
            transition={ballTransition}
            style={{
              width:      140,
              height:     140,
              top:        "50%",
              left:       "50%",
              marginTop:  -70,
              marginLeft: -70,
              background: `radial-gradient(circle at 36% 30%, ${ballColor}f0, ${ballColor}99 52%, ${ballColor}55)`,
              boxShadow:  `0 0 40px ${ballColor}50, 0 0 80px ${ballColor}24, inset 0 0 28px ${ballColor}28`,
            }}
          >
            {/* Countdown seconds */}
            <span
              className="text-[38px] font-bold leading-none select-none"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              {isRunning ? secondsLeft : ""}
            </span>
          </motion.div>
        </div>

        {/* ── Phase label ─────────────────────────────────────────────────── */}
        <div
          className="text-center flex flex-col items-center gap-2"
          style={{ minHeight: 72 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              className="text-[22px] font-bold tracking-wide"
              style={{ color: ballColor }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              {PHASE_LABEL[phase]}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.p
                key="idle-sub"
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.26)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                When dopamine crashes, your brain loses rhythm. Each breath here<br />
                entrains your default mode network — the part that hijacks<br />
                you with cravings. Match the ripple. Restore the signal.<br />
                <span style={{ opacity: 0.55, marginTop: 6, display: "block", fontSize: 11, letterSpacing: "0.08em" }}>
                  4s in · 4s hold · 4s out · {TOTAL_CYCLES} cycles
                </span>
              </motion.p>
            )}
            {phase === "done" && (
              <motion.p
                key="done-sub"
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.26)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Your nervous system just reset.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── CTA button ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {!isRunning && (
            <motion.button
              onClick={start}
              className="px-12 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{
                background:  "var(--gradient-primary)",
                boxShadow:   "var(--shadow-glow)",
                letterSpacing: "0.04em",
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.95 }}
            >
              {phase === "done" ? "Go again" : "Start"}
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

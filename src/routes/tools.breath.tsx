import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/tools/breath")({
  component: BreathBall,
});

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done";

const PHASE_DURATION = 4; // seconds per phase
const TOTAL_CYCLES = 5;   // ~2 minutes (5 × 12s)

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Ready",
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
  done: "Well done",
};

const PHASE_COLOR: Record<Phase, string> = {
  idle: "#C4873A",
  inhale: "#6BAED6",
  hold: "#9ECAE1",
  exhale: "#C4873A",
  done: "#6BAA75",
};

function BreathBall() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycle, setCycle] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASE_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const cycleRef = useRef(0);
  const secsRef = useRef(PHASE_DURATION);

  function clearTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function nextPhase(current: Phase, currentCycle: number): { phase: Phase; cycle: number } {
    if (current === "inhale") return { phase: "hold", cycle: currentCycle };
    if (current === "hold") return { phase: "exhale", cycle: currentCycle };
    if (current === "exhale") {
      const next = currentCycle + 1;
      if (next >= TOTAL_CYCLES) return { phase: "done", cycle: next };
      return { phase: "inhale", cycle: next };
    }
    return { phase: "inhale", cycle: currentCycle };
  }

  function start() {
    if (phase === "done") {
      phaseRef.current = "idle";
      cycleRef.current = 0;
      secsRef.current = PHASE_DURATION;
      setPhase("idle");
      setCycle(0);
      setSecondsLeft(PHASE_DURATION);
      return;
    }
    const startPhase: Phase = "inhale";
    phaseRef.current = startPhase;
    cycleRef.current = 0;
    secsRef.current = PHASE_DURATION;
    setPhase(startPhase);
    setCycle(0);
    setSecondsLeft(PHASE_DURATION);

    clearTimer();
    intervalRef.current = setInterval(() => {
      secsRef.current -= 1;
      if (secsRef.current <= 0) {
        const { phase: np, cycle: nc } = nextPhase(phaseRef.current, cycleRef.current);
        phaseRef.current = np;
        cycleRef.current = nc;
        secsRef.current = PHASE_DURATION;
        setPhase(np);
        setCycle(nc);
        setSecondsLeft(PHASE_DURATION);
        if (np === "done") clearTimer();
      } else {
        setSecondsLeft(secsRef.current);
      }
    }, 1000);
  }

  useEffect(() => () => clearTimer(), []);

  const isRunning = phase !== "idle" && phase !== "done";
  const ballColor = PHASE_COLOR[phase];
  const ballScale = phase === "inhale" ? 1.45 : phase === "hold" ? 1.45 : 1.0;
  const ballDuration = phase === "inhale" ? PHASE_DURATION : phase === "exhale" ? PHASE_DURATION : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Back */}
      <button
        onClick={() => { clearTimer(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-10">
        {/* Title */}
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">
            Breath Ball
          </p>
          {isRunning && (
            <p className="mt-1 text-xs text-muted-foreground">
              Cycle {cycle + 1} of {TOTAL_CYCLES}
            </p>
          )}
        </div>

        {/* Ball */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${ballColor}22 0%, transparent 70%)`,
              transform: `scale(${ballScale})`,
              transition: `transform ${ballDuration}s ease-in-out, background ${0.6}s ease`,
            }}
          />
          {/* Main ball */}
          <div
            className="rounded-full grid place-items-center"
            style={{
              width: 140,
              height: 140,
              background: `radial-gradient(circle at 38% 35%, ${ballColor}CC, ${ballColor}66)`,
              boxShadow: `0 0 40px ${ballColor}55, 0 0 80px ${ballColor}22`,
              transform: `scale(${ballScale})`,
              transition: `transform ${ballDuration}s ease-in-out, background ${0.6}s ease, box-shadow ${0.6}s ease`,
            }}
          >
            <span className="text-4xl font-bold text-white/90">
              {isRunning ? secondsLeft : ""}
            </span>
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center">
          <p
            className="text-2xl font-bold transition-colors duration-500"
            style={{ color: ballColor }}
          >
            {PHASE_LABEL[phase]}
          </p>
          {phase === "idle" && (
            <p className="mt-1 text-sm text-muted-foreground">
              4s in · 4s hold · 4s out · {TOTAL_CYCLES} cycles
            </p>
          )}
          {phase === "done" && (
            <p className="mt-2 text-sm text-muted-foreground">
              Your nervous system just reset.
            </p>
          )}
        </div>

        {/* CTA */}
        {!isRunning && (
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity active:opacity-80"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            {phase === "done" ? "Go again" : "Start"}
          </button>
        )}
      </div>
    </div>
  );
}

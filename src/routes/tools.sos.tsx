import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/tools/sos")({
  component: SOS,
});

const PHASES: { label: string; seconds: number }[] = [
  { label: "Inhale", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Exhale", seconds: 6 },
];

function SOS() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(PHASES[0].seconds);
  const phaseIdxRef = useRef(0);
  const done = elapsed >= 180;

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

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const phase = PHASES[phaseIdx];

  const animation =
    phase.label === "Inhale" ? `breathe-in ${phase.seconds}s ease-in-out forwards`
    : phase.label === "Exhale" ? `breathe-out ${phase.seconds}s ease-in-out forwards`
    : "none";

  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-10 pb-12 flex flex-col">
      <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Urge Surfing</p>
        <h1 className="mt-2 text-2xl font-semibold leading-snug">
          Don't fight it. Watch it.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          Urges peak around 90 seconds and then fade. Stay with it.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative h-64 w-64 grid place-items-center">
          <div className="absolute inset-0 rounded-full bg-primary/5" />
          <div
            key={`${phaseIdx}-${elapsed === 0}`}
            className="h-40 w-40 rounded-full grid place-items-center"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
              animation,
              transformOrigin: "center",
            }}
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/80">{phase.label}</p>
              <p className="text-3xl font-bold text-primary-foreground">{phaseLeft}s</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-5xl font-bold tabular-nums">{mm}:{ss}</p>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Time with the urge</p>
      </div>

      {done ? (
        <button
          onClick={() => navigate({ to: "/" })}
          className="h-14 w-full rounded-xl text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Check className="h-5 w-5" /> You made it through. Add this to your streak.
        </button>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Stay until the timer reaches 3:00.
        </p>
      )}
    </div>
  );
}

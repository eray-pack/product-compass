import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/tools/sos")({
  component: SOS,
});

const PHASES: { label: string; seconds: number }[] = [
  { label: "Inhale",  seconds: 4 },
  { label: "Hold",    seconds: 4 },
  { label: "Exhale",  seconds: 6 },
];

const TOTAL_SECONDS = 180;
const PEAK_T = 0.38; // urge peaks at ~68s out of 180s
const SIGMA = 0.18;

function intensityAt(t: number) {
  return Math.exp(-Math.pow(t - PEAK_T, 2) / (2 * SIGMA * SIGMA));
}

// ── Urge wave graph ───────────────────────────────────────────────────────────
function UrgeWaveGraph({ elapsed }: { elapsed: number }) {
  const W = 320;
  const H = 90;
  const PAD_X = 12;
  const PAD_TOP = 14;
  const PAD_BOT = 22;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOT;

  const STEPS = 120;
  const pts: [number, number][] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = PAD_X + t * innerW;
    const y = PAD_TOP + innerH * (1 - intensityAt(t));
    pts.push([x, y]);
  }

  const toPath = (points: [number, number][]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const currentT = Math.min(1, elapsed / TOTAL_SECONDS);
  const currentX = PAD_X + currentT * innerW;
  const currentY = PAD_TOP + innerH * (1 - intensityAt(currentT));

  // Split path: past (blue) and future (dim)
  const splitIdx = Math.round(currentT * STEPS);
  const pastPts = pts.slice(0, splitIdx + 1);
  const futurePts = pts.slice(splitIdx);

  // Fill under past portion
  const fillPts: [number, number][] = [
    [PAD_X, PAD_TOP + innerH],
    ...pastPts,
    [currentX, PAD_TOP + innerH],
  ];

  // RISE label position (t=0.12)
  const riseX = PAD_X + 0.12 * innerW;
  const riseY = PAD_TOP + innerH * (1 - intensityAt(0.12));
  // FADE label position (t=0.68)
  const fadeX = PAD_X + 0.68 * innerW;
  const fadeY = PAD_TOP + innerH * (1 - intensityAt(0.68));

  // "YOU ARE HERE" label — clamp so it doesn't go off-screen
  const labelX = Math.min(Math.max(currentX, 62), W - 62);

  return (
    <div className="w-full">
      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">
        Urge Intensity
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="urge-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Fill under past */}
        {pastPts.length > 1 && (
          <path d={toPath(fillPts) + " Z"} fill="url(#urge-fill)" />
        )}

        {/* Future curve (dim) */}
        {futurePts.length > 1 && (
          <path
            d={toPath(futurePts)}
            fill="none"
            stroke="oklch(0.40 0.04 265)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}

        {/* Past curve (blue) */}
        {pastPts.length > 1 && (
          <path
            d={toPath(pastPts)}
            fill="none"
            stroke="oklch(0.62 0.22 255)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* RISE label */}
        <text
          x={riseX}
          y={riseY - 7}
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.12em"
          fill="oklch(0.55 0.18 255)"
        >
          RISE
        </text>

        {/* FADE label */}
        <text
          x={fadeX}
          y={fadeY - 7}
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.12em"
          fill="oklch(0.45 0.04 265)"
        >
          FADE
        </text>

        {/* YOU ARE HERE dashed line */}
        <line
          x1={currentX}
          y1={currentY - 4}
          x2={labelX}
          y2={PAD_TOP - 2}
          stroke="white"
          strokeWidth="1"
          strokeDasharray="3 2"
          strokeOpacity="0.5"
        />

        {/* YOU ARE HERE label */}
        <text
          x={labelX}
          y={PAD_TOP - 4}
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="0.1em"
          fill="white"
        >
          YOU ARE HERE
        </text>

        {/* Current dot */}
        <circle cx={currentX} cy={currentY} r="6" fill="oklch(0.62 0.22 255)" opacity="0.25" />
        <circle cx={currentX} cy={currentY} r="3.5" fill="white" />

        {/* Baseline */}
        <line
          x1={PAD_X}
          y1={PAD_TOP + innerH}
          x2={W - PAD_X}
          y2={PAD_TOP + innerH}
          stroke="oklch(0.28 0.03 265)"
          strokeWidth="1"
        />

        {/* Time labels */}
        <text x={PAD_X} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">0s</text>
        <text x={W / 2} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">90s</text>
        <text x={W - PAD_X} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">3:00</text>
      </svg>
    </div>
  );
}

function SOS() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
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

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const phase = PHASES[phaseIdx];

  const animation =
    phase.label === "Inhale"  ? `breathe-in ${phase.seconds}s ease-in-out forwards`
    : phase.label === "Exhale" ? `breathe-out ${phase.seconds}s ease-in-out forwards`
    : "none";

  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-10 pb-12 flex flex-col">
      {/* ── Back + ACTIVE URGE badge ───────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-destructive/50 bg-destructive/12">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-destructive">
            Active Urge
          </span>
        </div>
      </div>

      {/* ── Copy ──────────────────────────────────────────────── */}
      <div className="mt-6 text-center">
        <p
          className="text-[11px] font-bold tracking-[0.3em] uppercase"
          style={{ color: "var(--primary)" }}
        >
          Urge Surfing
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-snug">Don't fight it. Watch it.</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          Urges peak around 90 seconds and then fade. Stay with it.
        </p>
      </div>

      {/* ── Breathing circle ──────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center mt-6">
        <div className="relative h-56 w-56 grid place-items-center">
          {/* Outer ambient ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "oklch(0.62 0.22 255 / 0.06)" }}
          />
          {/* Breathing circle */}
          <div
            key={`${phaseIdx}-${elapsed === 0}`}
            className="h-36 w-36 rounded-full grid place-items-center"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
              animation,
              transformOrigin: "center",
            }}
          >
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-widest text-white/75 font-semibold">
                {phase.label}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">{phaseLeft}s</p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <p className="mt-6 text-5xl font-bold tabular-nums tracking-tight">{mm}:{ss}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Time with the urge
        </p>
      </div>

      {/* ── Urge wave graph ───────────────────────────────────── */}
      <div
        className="mt-6 rounded-2xl border border-border/60 p-4"
        style={{ background: "var(--gradient-surface)" }}
      >
        <UrgeWaveGraph elapsed={elapsed} />
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="mt-5">
        {done ? (
          <button
            onClick={() => navigate({ to: "/" })}
            className="h-14 w-full rounded-2xl font-bold text-sm text-white inline-flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Check className="h-5 w-5" /> You made it through. Add this to your streak.
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground font-medium">
            Stay until the timer reaches 3:00
          </p>
        )}
      </div>
    </div>
  );
}

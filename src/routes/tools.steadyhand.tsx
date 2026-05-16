import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/steadyhand")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/" });
  },
  component: SteadyHand,
});

const TRACK_W = 280;
const TRACK_H = 60;
const DOT_R = 16;
const GAME_DURATION = 30;
const C = "#D97706";

function SteadyHand() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [dotX, setDotX] = useState(DOT_R + 4);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [best, setBest] = useState(0);
  const [onTrack, setOnTrack] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const maxX = useRef(DOT_R + 4);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function start() {
    clearTimer();
    phaseRef.current = "playing";
    maxX.current = DOT_R + 4;
    setPhase("playing");
    setDotX(DOT_R + 4);
    setTimeLeft(GAME_DURATION);
    setOnTrack(true);
    dragging.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          phaseRef.current = "done";
          setPhase("done");
          setBest((b) => Math.max(b, maxX.current));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current || phaseRef.current !== "playing") return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const inside = relY >= -4 && relY <= TRACK_H + 4 && relX >= DOT_R && relX <= TRACK_W - DOT_R;
    setOnTrack(inside);
    if (inside) {
      const nx = Math.min(TRACK_W - DOT_R - 4, Math.max(DOT_R + 4, relX));
      setDotX(nx);
      if (nx > maxX.current) maxX.current = nx;
    }
  }

  function handlePointerUp() {
    if (!dragging.current || phaseRef.current !== "playing") return;
    dragging.current = false;
    // Penalty: reset dot if released early
    setOnTrack(true);
  }

  useEffect(() => () => clearTimer(), []);

  const pct = Math.round(((maxX.current - DOT_R - 4) / (TRACK_W - DOT_R * 2 - 8)) * 100);
  const bestPct = Math.round(((best - DOT_R - 4) / (TRACK_W - DOT_R * 2 - 8)) * 100);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <button
        onClick={() => { clearTimer(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Steady Hand</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{pct}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          <p className="text-sm text-muted-foreground text-center">
            {onTrack ? "Drag right — stay in the track" : <span style={{ color: "#ef4444" }}>⚠ Off track!</span>}
          </p>

          {/* Shaking container */}
          <div style={{ animation: "shakeY 0.22s linear infinite" }}>
            <div
              ref={trackRef}
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: TRACK_W,
                height: TRACK_H,
                background: "var(--card)",
                border: `1.5px solid ${onTrack ? C + "55" : "#ef444466"}`,
                cursor: "none",
                touchAction: "none",
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                dragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
            >
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full transition-[width] duration-75"
                style={{ width: dotX, background: `${C}18` }}
              />
              {/* Track lane */}
              <div
                className="absolute inset-x-4 top-4 bottom-4 rounded-full"
                style={{ border: `1.5px solid ${C}33` }}
              />
              {/* Dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 rounded-full transition-colors duration-100"
                style={{
                  left: dotX - DOT_R,
                  width: DOT_R * 2,
                  height: DOT_R * 2,
                  background: onTrack ? C : "#ef4444",
                  boxShadow: `0 0 18px ${onTrack ? C : "#ef4444"}88`,
                }}
              />
              {/* Finish */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none">🏁</div>
            </div>
          </div>

          <style>{`
            @keyframes shakeY {
              0%   { transform: translateY(0px); }
              15%  { transform: translateY(-9px); }
              45%  { transform: translateY(9px); }
              75%  { transform: translateY(-6px); }
              100% { transform: translateY(0px); }
            }
          `}</style>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: C }}>{pct}%</p>
                <p className="text-sm text-muted-foreground">of the track completed</p>
                {bestPct > pct && (
                  <p className="text-xs" style={{ color: C }}>Best: {bestPct}%</p>
                )}
              </div>
              <p className="text-lg font-semibold">
                {pct >= 80 ? "Unshakeable." : pct >= 50 ? "Solid control." : "Stay calm under pressure."}
              </p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Don't shake.</p>
              <p className="text-sm text-muted-foreground">
                Hold and drag the dot right to the finish.<br />The screen shakes — stay calm.<br />30 seconds.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #B45309)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Try again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/noisefilter")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/" });
  },
  component: NoiseFilter,
});

const GAME_DURATION = 45;
const GRID_SIZE = 6;
const SHAPES = ["◉", "◈", "◎", "⊕", "◍", "⊛"];
const C = "#2563EB";

interface SignalItem {
  id: number;
  isReal: boolean;
  shape: number;
  opacity: number;
  size: number;
}

function makeGrid(): SignalItem[] {
  const realIdx = Math.floor(Math.random() * GRID_SIZE);
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: Date.now() + i,
    isReal: i === realIdx,
    shape: Math.floor(Math.random() * SHAPES.length),
    opacity: i === realIdx ? 1 : 0.18 + Math.random() * 0.22,
    size: i === realIdx ? 34 : 18 + Math.floor(Math.random() * 10),
  }));
}

function NoiseFilter() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [grid, setGrid] = useState<SignalItem[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<{ id: number; correct: boolean } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "done">("idle");

  function clear() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function start() {
    clear();
    phaseRef.current = "playing";
    setPhase("playing");
    setScore(0);
    setWrong(0);
    setTimeLeft(GAME_DURATION);
    setGrid(makeGrid());
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clear(); phaseRef.current = "done"; setPhase("done"); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function tap(item: SignalItem) {
    if (phaseRef.current !== "playing" || feedback) return;
    setFeedback({ id: item.id, correct: item.isReal });
    if (item.isReal) setScore((s) => s + 1);
    else setWrong((w) => w + 1);
    setTimeout(() => {
      setFeedback(null);
      if (phaseRef.current === "playing") setGrid(makeGrid());
    }, 300);
  }

  useEffect(() => () => clear(), []);

  const rating =
    score >= 25 ? "Noise-proof mind." :
    score >= 15 ? "Sharp focus." :
    score >= 8  ? "Building clarity." : "Keep filtering.";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => { clear(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Noise Filter</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Signals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{wrong}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wrong</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <p className="text-sm text-muted-foreground">
            Tap the <span style={{ color: C }} className="font-bold">real signal</span> — ignore the noise
          </p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {grid.map((item) => {
              const fb = feedback?.id === item.id;
              return (
                <button
                  key={item.id}
                  onPointerDown={(e) => { e.preventDefault(); tap(item); }}
                  className="aspect-square rounded-2xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: fb
                      ? item.isReal ? `${C}33` : "rgba(239,68,68,0.18)"
                      : item.isReal ? `${C}14` : "var(--card)",
                    border: `1.5px solid ${
                      fb ? (item.isReal ? C : "#ef4444") : item.isReal ? `${C}66` : "var(--border)"
                    }`,
                    boxShadow: item.isReal
                      ? `0 0 ${fb ? 32 : 14}px ${C}${fb ? "AA" : "44"}`
                      : "none",
                    opacity: item.opacity,
                    fontSize: item.size,
                    color: item.isReal ? C : "var(--muted-foreground)",
                    touchAction: "none",
                  }}
                >
                  {SHAPES[item.shape]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: C }}>{score}</p>
                <p className="text-sm text-muted-foreground">real signals found · {wrong} wrong</p>
              </div>
              <p className="text-lg font-semibold">{rating}</p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Find the signal.</p>
              <p className="text-sm text-muted-foreground">
                One item is bright and real.<br />The rest is noise. Don't be fooled.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #1D4ED8)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

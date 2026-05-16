import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/darkroom")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: DarkRoom,
});

const COLS = 7;
const ROWS = 9;
const CELL = 36;
const START_R = ROWS - 1;
const START_C = Math.floor(COLS / 2);
const EXIT_R = 0;
const EXIT_C = Math.floor(COLS / 2);
const WALL_PCT = 0.30;
const GAME_TIME = 60;
const LIGHT_R = 1.6;
const C = "#4F46E5";

function makeWalls(): Set<string> {
  const walls = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === START_R && c === START_C) continue;
      if (r === EXIT_R && c === EXIT_C) continue;
      if (Math.random() < WALL_PCT) walls.add(`${r},${c}`);
    }
  }
  // Always clear center column so there's a path
  for (let r = 0; r < ROWS; r++) walls.delete(`${r},${EXIT_C}`);
  return walls;
}

function visible(pr: number, pc: number, r: number, c: number) {
  return Math.sqrt((pr - r) ** 2 + (pc - c) ** 2) <= LIGHT_R;
}

function DarkRoom() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [pr, setPr] = useState(START_R);
  const [pc, setPc] = useState(START_C);
  const [walls, setWalls] = useState<Set<string>>(() => makeWalls());
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [steps, setSteps] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "won" | "lost">("idle");
  const wallsRef = useRef(walls);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function start() {
    clearTimer();
    const w = makeWalls();
    wallsRef.current = w;
    phaseRef.current = "playing";
    setPhase("playing");
    setPr(START_R);
    setPc(START_C);
    setWalls(w);
    setTimeLeft(GAME_TIME);
    setSteps(0);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          phaseRef.current = "lost";
          setPhase("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function move(dr: number, dc: number) {
    if (phaseRef.current !== "playing") return;
    setPr((r) => {
      setPc((c) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return c;
        if (wallsRef.current.has(`${nr},${nc}`)) return c;
        setSteps((s) => s + 1);
        if (nr === EXIT_R && nc === EXIT_C) {
          clearTimer();
          phaseRef.current = "won";
          setPhase("won");
        }
        setPr(nr);
        return nc;
      });
      return r;
    });
  }

  useEffect(() => () => clearTimer(), []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => { clearTimer(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Dark Room</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-2">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{steps}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Steps</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col items-center gap-4 mt-3">
          {/* Grid */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: COLS * CELL,
              height: ROWS * CELL,
              background: "#020408",
              border: `1px solid ${C}33`,
              boxShadow: `0 0 24px ${C}22`,
            }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const viz = visible(pr, pc, r, c);
                const isExit = r === EXIT_R && c === EXIT_C;
                const isPlayer = r === pr && c === pc;
                const isWall = walls.has(`${r},${c}`);
                return (
                  <div
                    key={`${r},${c}`}
                    className="absolute"
                    style={{
                      left: c * CELL, top: r * CELL,
                      width: CELL, height: CELL,
                      opacity: viz ? 1 : 0.015,
                    }}
                  >
                    {isWall && viz && (
                      <div
                        className="absolute inset-0.5 rounded-sm"
                        style={{ background: `${C}28`, border: `1px solid ${C}44` }}
                      />
                    )}
                    {isExit && viz && (
                      <div className="absolute inset-0 flex items-center justify-center text-lg" style={{ color: "#FFD700" }}>⬆</div>
                    )}
                    {isPlayer && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: "#FFFDE7",
                            boxShadow: `0 0 ${CELL * 1.5}px ${CELL}px rgba(255,253,231,0.12), 0 0 8px 4px rgba(255,253,231,0.4)`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* D-pad */}
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 48px)" }}>
            <div />
            <button
              onClick={() => move(-1, 0)}
              className="h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C }}
            >↑</button>
            <div />
            <button
              onClick={() => move(0, -1)}
              className="h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C }}
            >←</button>
            <button
              onClick={() => move(1, 0)}
              className="h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C }}
            >↓</button>
            <button
              onClick={() => move(0, 1)}
              className="h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C }}
            >→</button>
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "won" && (
            <>
              <p className="text-5xl">🔦</p>
              <div className="text-center space-y-1">
                <p className="text-xl font-bold" style={{ color: C }}>You found the exit!</p>
                <p className="text-sm text-muted-foreground">{steps} steps · {GAME_TIME - timeLeft}s</p>
              </div>
            </>
          )}
          {phase === "lost" && (
            <>
              <p className="text-5xl">🌑</p>
              <div className="text-center space-y-1">
                <p className="text-xl font-bold">Time's up.</p>
                <p className="text-sm text-muted-foreground">The dark won this round.</p>
              </div>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Find the exit.</p>
              <p className="text-sm text-muted-foreground">
                Navigate in the dark with only a small light.<br />Reach ⬆ before time runs out.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #3730A3)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "idle" ? "Start" : "Try again"}
          </button>
        </div>
      )}
    </div>
  );
}

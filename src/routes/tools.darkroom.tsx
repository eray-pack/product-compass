import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const BG = "#000000";

function makeWalls(): Set<string> {
  const walls = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === START_R && c === START_C) continue;
      if (r === EXIT_R && c === EXIT_C) continue;
      if (Math.random() < WALL_PCT) walls.add(`${r},${c}`);
    }
  }
  for (let r = 0; r < ROWS; r++) walls.delete(`${r},${EXIT_C}`);
  return walls;
}

function visible(pr: number, pc: number, r: number, c: number) {
  return Math.sqrt((pr - r) ** 2 + (pc - c) ** 2) <= LIGHT_R;
}

// Deterministic win-particle directions
const WIN_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  x: Math.cos((i / 16) * Math.PI * 2) * (55 + (i % 3) * 20),
  y: Math.sin((i / 16) * Math.PI * 2) * (55 + (i % 3) * 20),
}));

function DarkRoom() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [pr, setPr] = useState(START_R);
  const [pc, setPc] = useState(START_C);
  const [walls, setWalls] = useState<Set<string>>(() => makeWalls());
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [steps, setSteps] = useState(0);
  const [wallFlash, setWallFlash] = useState(false);
  const [flickering, setFlickering] = useState(false);
  const [winFlood, setWinFlood] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "won" | "lost">("idle");
  const wallsRef = useRef(walls);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function triggerWallHit() {
    setWallFlash(true);
    setFlickering(true);
    setTimeout(() => setWallFlash(false), 220);
    setTimeout(() => setFlickering(false), 380);
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
    setWallFlash(false);
    setFlickering(false);
    setWinFlood(false);
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
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
          triggerWallHit();
          return c;
        }
        if (wallsRef.current.has(`${nr},${nc}`)) {
          triggerWallHit();
          return c;
        }
        setSteps((s) => s + 1);
        if (nr === EXIT_R && nc === EXIT_C) {
          clearTimer();
          phaseRef.current = "won";
          setWinFlood(true);
          setTimeout(() => { setPhase("won"); }, 600);
        }
        setPr(nr);
        return nc;
      });
      return r;
    });
  }

  useEffect(() => () => clearTimer(), []);

  // Flashlight radius in px
  const lightPx = LIGHT_R * CELL + 18;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: BG }}>
      {/* Red wall flash overlay */}
      <AnimatePresence>
        {wallFlash && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ background: "rgba(239,68,68,0.22)" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Win flood overlay */}
      <AnimatePresence>
        {winFlood && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ background: `${C}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { clearTimer(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
        whileTap={{ scale: 0.88 }}
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="pt-12 pb-2 px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>Dark Room</p>
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
        <div className="flex-1 flex flex-col items-center gap-4 mt-3 relative z-10">
          {/* Grid with flashlight mask */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              width: COLS * CELL,
              height: ROWS * CELL,
              background: "#000",
              border: `1px solid ${C}22`,
            }}
          >
            {/* Flashlight glow layer */}
            <div
              className="absolute pointer-events-none z-20"
              style={{
                left: pc * CELL + CELL / 2,
                top: pr * CELL + CELL / 2,
                width: lightPx * 2,
                height: lightPx * 2,
                marginLeft: -lightPx,
                marginTop: -lightPx,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(255,253,220,${flickering ? 0.06 : 0.12}) 0%, transparent 65%)`,
                transition: `left 0.12s ease, top 0.12s ease, opacity 0.08s`,
                opacity: flickering ? 0.3 : 1,
              }}
            />

            {/* Darkness mask — everything outside flashlight is near-black */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle ${lightPx}px at ${pc * CELL + CELL / 2}px ${pr * CELL + CELL / 2}px, transparent 55%, rgba(0,0,0,0.97) 100%)`,
                transition: "background 0.12s ease",
              }}
            />

            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const viz = visible(pr, pc, r, c);
                const isExit = r === EXIT_R && c === EXIT_C;
                const isPlayer = r === pr && c === pc;
                const isWall = walls.has(`${r},${c}`);
                const distToExit = Math.sqrt((pr - EXIT_R) ** 2 + (pc - EXIT_C) ** 2);
                const exitGlowable = isExit && distToExit < 4;
                return (
                  <div
                    key={`${r},${c}`}
                    className="absolute"
                    style={{
                      left: c * CELL, top: r * CELL,
                      width: CELL, height: CELL,
                      opacity: viz ? 1 : 0,
                    }}
                  >
                    {isWall && viz && (
                      <div
                        className="absolute inset-0.5 rounded-sm"
                        style={{ background: `${C}22`, border: `1px solid ${C}38` }}
                      />
                    )}
                    {isExit && (exitGlowable || viz) && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{
                          opacity: exitGlowable && !viz ? 0.3 : 1,
                          filter: `drop-shadow(0 0 8px ${C})`,
                          color: C,
                          fontSize: 20,
                        }}
                      >⬆</div>
                    )}
                    {isPlayer && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: "#FFFDE7",
                            boxShadow: `0 0 ${CELL * 1.5}px ${CELL}px rgba(255,253,231,0.1), 0 0 8px 4px rgba(255,253,231,0.5)`,
                          }}
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* D-pad */}
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 52px)" }}>
            <div />
            <motion.button
              onClick={() => move(-1, 0)}
              className="h-13 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C, height: 52 }}
              whileTap={{ scale: 0.88, background: `${C}44` }}
            >↑</motion.button>
            <div />
            <motion.button
              onClick={() => move(0, -1)}
              className="rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C, height: 52 }}
              whileTap={{ scale: 0.88, background: `${C}44` }}
            >←</motion.button>
            <motion.button
              onClick={() => move(1, 0)}
              className="rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C, height: 52 }}
              whileTap={{ scale: 0.88, background: `${C}44` }}
            >↓</motion.button>
            <motion.button
              onClick={() => move(0, 1)}
              className="rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: `${C}1A`, border: `1px solid ${C}44`, color: C, height: 52 }}
              whileTap={{ scale: 0.88, background: `${C}44` }}
            >→</motion.button>
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative z-10">
          {phase === "won" && (
            <>
              <div className="relative">
                <motion.p
                  className="text-5xl"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                >🔦</motion.p>
                {/* Win particles */}
                {WIN_PARTICLES.map((d, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 7, height: 7,
                      background: C,
                      top: "50%", left: "50%",
                      marginTop: -3, marginLeft: -3,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 0.7, delay: i * 0.025, ease: "easeOut" }}
                  />
                ))}
              </div>
              <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-xl font-bold" style={{ color: C }}>You found the exit!</p>
                <p className="text-sm text-muted-foreground">{steps} steps · {GAME_TIME - timeLeft}s</p>
              </motion.div>
            </>
          )}
          {phase === "lost" && (
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-5xl">🌑</p>
              <p className="text-xl font-bold">Time's up.</p>
              <p className="text-sm text-muted-foreground">The dark won this round.</p>
            </motion.div>
          )}
          {phase === "idle" && (
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl font-bold">Find the exit.</p>
              <p className="text-sm text-muted-foreground">
                Navigate in the dark with only a small light.<br />Reach ⬆ before time runs out.
              </p>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C}, #3730A3)`, boxShadow: `0 0 20px ${C}55` }}
            whileTap={{ scale: 0.93 }}
          >
            {phase === "idle" ? "Start" : "Try again"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

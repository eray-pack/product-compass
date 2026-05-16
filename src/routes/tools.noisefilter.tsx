import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
const BG = "#010510";

// Deterministic burst particles
const BURST = Array.from({ length: 8 }, (_, i) => ({
  x: Math.cos((i / 8) * Math.PI * 2) * 44,
  y: Math.sin((i / 8) * Math.PI * 2) * 44,
}));

// Static noise flicker positions (deterministic)
const NOISE_DOTS = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 37 + 13) % 100),
  y: ((i * 53 + 7) % 100),
  size: 1 + (i % 3),
  opacity: 0.03 + (i % 4) * 0.015,
}));

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
  const [wrongFlash, setWrongFlash] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);
  const [burstPos, setBurstPos] = useState<number | null>(null);

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
    setFeedback(null);
    setWrongFlash(false);
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
    if (item.isReal) {
      setScore((s) => s + 1);
      setScoreKey((k) => k + 1);
      setBurstPos(item.id);
      setTimeout(() => setBurstPos(null), 420);
    } else {
      setWrong((w) => w + 1);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 260);
    }
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

  // Time bar color: blue → orange → red
  const timePct = timeLeft / GAME_DURATION;
  const barColor = timePct > 0.5 ? C : timePct > 0.25 ? "#F97316" : "#ef4444";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: BG }}>
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 65% 50% at 50% 55%, ${C}0e 0%, transparent 70%)`,
        }} />
        {/* Static noise dots */}
        {NOISE_DOTS.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${d.x}%`, top: `${d.y}%`,
              width: d.size, height: d.size,
              background: C,
              opacity: d.opacity,
            }}
          />
        ))}
        {/* Scrolling noise lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${C}06 3px, ${C}06 4px)`,
        }} />
      </div>

      {/* Wrong tap noise overlay */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ background: "rgba(239,68,68,0.18)" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => { clear(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.88 }}
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="pt-12 pb-2 px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>Noise Filter</p>
        {phase === "playing" && (
          <>
            <div className="flex justify-center gap-8 mt-3">
              <div>
                <motion.p
                  key={scoreKey}
                  className="text-2xl font-bold"
                  style={{ color: C }}
                  initial={{ scale: 1.7, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  {score}
                </motion.p>
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
            {/* Time bar */}
            <div className="mx-6 mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: barColor }}
                animate={{ width: `${timePct * 100}%`, background: barColor }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </div>
          </>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 relative z-10">
          <p className="text-sm" style={{ color: `${C}88` }}>
            Tap the <span style={{ color: C }} className="font-bold">real signal</span> — ignore the noise
          </p>
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {grid.map((item) => {
              const fb = feedback?.id === item.id;
              const bursting = burstPos === item.id;
              return (
                <motion.div
                  key={item.id}
                  className="aspect-square relative"
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: item.opacity }}
                  transition={{ type: "spring", stiffness: 380, damping: 22, delay: grid.indexOf(item) * 0.04 }}
                >
                  {/* Burst particles on correct tap */}
                  <AnimatePresence>
                    {bursting && BURST.map((d, pi) => (
                      <motion.div
                        key={pi}
                        className="absolute rounded-full pointer-events-none z-20"
                        style={{
                          width: 5, height: 5,
                          background: C,
                          top: "50%", left: "50%",
                          marginTop: -2.5, marginLeft: -2.5,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.4 }}
                        exit={{}}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                      />
                    ))}
                  </AnimatePresence>

                  <motion.button
                    onPointerDown={(e) => { e.preventDefault(); tap(item); }}
                    className="w-full h-full rounded-2xl flex items-center justify-center"
                    style={{
                      background: fb
                        ? item.isReal ? `${C}33` : "rgba(239,68,68,0.18)"
                        : item.isReal ? `${C}14` : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${
                        fb ? (item.isReal ? C : "#ef4444") : item.isReal ? `${C}66` : "rgba(255,255,255,0.08)"
                      }`,
                      boxShadow: item.isReal
                        ? `0 0 ${fb ? 32 : 14}px ${C}${fb ? "AA" : "44"}`
                        : "none",
                      fontSize: item.size,
                      color: item.isReal ? C : "rgba(255,255,255,0.35)",
                      touchAction: "none",
                    }}
                    animate={{ scale: fb && item.isReal ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  >
                    {SHAPES[item.shape]}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative z-10">
          {phase === "done" && (
            <>
              <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
              >
                <p className="text-5xl font-bold" style={{ color: C }}>{score}</p>
                <p className="text-sm text-muted-foreground">real signals found · {wrong} wrong</p>
              </motion.div>
              <motion.p
                className="text-lg font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {rating}
              </motion.p>
            </>
          )}
          {phase === "idle" && (
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl font-bold">Find the signal.</p>
              <p className="text-sm text-muted-foreground">
                One item is bright and real.<br />The rest is noise. Don't be fooled.
              </p>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C}, #1D4ED8)`, boxShadow: `0 0 20px ${C}55` }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

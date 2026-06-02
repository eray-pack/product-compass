import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/identitystack")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: IdentityStack,
});

const GAME_DURATION = 30;
const C = "#E11D48";
const BG = "#080003";

interface CardItem { id: number; text: string; isGood: boolean; }

const GOOD_CARDS = [
  "Daily discipline", "Early riser", "I train my mind",
  "I keep promises", "Stay focused", "One day at a time",
  "I show up", "Build the habit", "I am in control",
  "Progress not perfection", "I earn my rest", "Strong mind wins",
];

const BAD_CARDS = [
  "Just this once", "Nobody will know", "I'll start Monday",
  "One won't hurt", "I deserve a break", "Give in now",
  "It's too hard", "I can't stop", "Tomorrow is better",
  "What's the point", "No one cares", "I'm already failing",
];

function makeQueue(): CardItem[] {
  const pool = [
    ...GOOD_CARDS.map((text, i) => ({ id: i, text, isGood: true })),
    ...BAD_CARDS.map((text, i) => ({ id: GOOD_CARDS.length + i, text, isGood: false })),
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// Deterministic background card texture dots
const BG_DOTS = Array.from({ length: 20 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  y: (i * 53 + 11) % 100,
  size: 16 + (i % 4) * 10,
  opacity: 0.018 + (i % 3) * 0.008,
  rotation: (i * 17) % 360,
}));

function IdentityStack() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [swipe, setSwipe] = useState<"left" | "right" | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const locked = useRef(false);

  function clear() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function start() {
    clear();
    locked.current = false;
    phaseRef.current = "playing";
    setPhase("playing");
    setQueue(makeQueue());
    setScore(0);
    setWrong(0);
    setFeedback(null);
    setSwipe(null);
    setWrongFlash(false);
    setTimeLeft(GAME_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clear(); phaseRef.current = "done"; setPhase("done"); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function decide(keep: boolean) {
    if (phaseRef.current !== "playing" || queue.length === 0 || locked.current) return;
    locked.current = true;
    const card = queue[0];
    const correct = keep === card.isGood;
    setSwipe(keep ? "right" : "left");
    setFeedback(correct ? "ok" : "bad");
    if (correct) setScore((s) => s + 1);
    else {
      setWrong((w) => w + 1);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 280);
    }
    setTimeout(() => {
      setSwipe(null);
      setFeedback(null);
      locked.current = false;
      setQueue((q) => {
        const rest = q.slice(1);
        if (rest.length === 0) {
          clear();
          phaseRef.current = "done";
          setPhase("done");
        }
        return rest;
      });
    }, 380);
  }

  useEffect(() => () => clear(), []);

  const card = queue[0];

  // Timer bar: gold → orange → red
  const timePct = timeLeft / GAME_DURATION;
  const barColor = timePct > 0.5 ? "#D97706" : timePct > 0.25 ? "#F97316" : "#ef4444";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: BG }}>
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 65% 50% at 50% 55%, ${C}0e 0%, transparent 68%)`,
        }} />
        {/* Faint card texture dots */}
        {BG_DOTS.map((d, i) => (
          <div
            key={i}
            className="absolute border rounded-lg pointer-events-none"
            style={{
              left: `${d.x}%`, top: `${d.y}%`,
              width: d.size, height: d.size * 1.4,
              borderColor: `${C}`,
              opacity: d.opacity,
              transform: `rotate(${d.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Wrong choice flash */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ background: "rgba(239,68,68,0.2)" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => { clear(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center active:scale-90 transition-transform"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-1 px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>Identity Stack</p>
        {phase === "playing" && (
          <>
            <div className="flex justify-center gap-8 mt-3">
              <div>
                <motion.p
                  key={score}
                  className="text-2xl font-bold"
                  style={{ color: C }}
                  initial={{ scale: 1.6, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  {score}
                </motion.p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stacked</p>
              </div>
              <div>
                <motion.p
                  key={timeLeft}
                  className="text-2xl font-bold"
                  style={{ color: barColor, transition: "color 0.5s" }}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 24 }}
                >
                  {timeLeft}s
                </motion.p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{wrong}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Wrong</p>
              </div>
            </div>
            {/* Timer bar */}
            <div className="mx-6 mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${timePct * 100}%`, background: barColor }}
                transition={{ duration: 0.6, ease: "linear" }}
              />
            </div>
          </>
        )}
      </div>

      {phase === "playing" && card && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 relative z-10">
          <div className="flex w-full max-w-xs justify-between text-xs px-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>← Discard</span>
            <span>Stack →</span>
          </div>

          {/* Card stack */}
          <div className="relative w-full max-w-xs">
            {/* Shadow cards behind */}
            <div className="absolute inset-0 rounded-3xl -translate-y-2 rotate-1 scale-95"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C}18` }} />
            <div className="absolute inset-0 rounded-3xl -translate-y-1 -rotate-1"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C}22`, transform: "scale(0.97) rotate(-1deg) translateY(-4px)" }} />

            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                className="relative rounded-3xl p-8 text-center"
                style={{
                  background: card.isGood
                    ? "rgba(0,30,15,0.85)"
                    : "rgba(30,0,8,0.85)",
                  border: `1.5px solid ${
                    feedback === "ok" ? "#22C55E" :
                    feedback === "bad" ? "#ef4444" :
                    card.isGood ? "#22C55E44" : `${C}44`
                  }`,
                  boxShadow: feedback === "ok"
                    ? "0 0 32px rgba(34,197,94,0.35)"
                    : feedback === "bad"
                    ? "0 0 32px rgba(239,68,68,0.3)"
                    : card.isGood
                    ? "0 0 18px rgba(34,197,94,0.1)"
                    : `0 0 18px ${C}18`,
                  backdropFilter: "blur(12px)",
                }}
                initial={{ y: -60, opacity: 0, scale: 0.9, rotate: -3 }}
                animate={
                  swipe === "left"
                    ? { x: -180, rotate: -14, opacity: 0, scale: 0.85 }
                    : swipe === "right"
                    ? { x: 180, rotate: 14, opacity: 0, scale: 0.85 }
                    : feedback === "bad"
                    ? { x: [0, -11, 11, -7, 7, -3, 3, 0], y: 0, opacity: 1, scale: 1, rotate: 0 }
                    : { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }
                }
                exit={{ opacity: 0 }}
                transition={
                  swipe
                    ? { duration: 0.32, ease: "easeIn" }
                    : feedback === "bad"
                    ? { duration: 0.44, ease: "easeInOut" }
                    : { type: "spring", stiffness: 300, damping: 22 }
                }
              >
                {/* Good/bad tint overlay */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: card.isGood
                      ? "rgba(34,197,94,0.05)"
                      : `${C}08`,
                  }}
                />
                <p className="text-lg font-bold leading-snug relative z-10" style={{
                  color: card.isGood ? "rgba(200,255,220,0.95)" : "rgba(255,200,210,0.95)",
                }}>
                  {card.text}
                </p>
                {/* Small good/bad label */}
                <p className="mt-1 text-[10px] tracking-widest uppercase relative z-10" style={{
                  color: card.isGood ? "rgba(34,197,94,0.55)" : `${C}66`,
                }}>
                  {card.isGood ? "good habit" : "bad habit"}
                </p>
                {feedback && (
                  <motion.p
                    className="mt-3 text-sm font-bold relative z-10"
                    style={{ color: feedback === "ok" ? "#22C55E" : "#ef4444" }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {feedback === "ok" ? "✓ Correct!" : "✗ Wrong"}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full max-w-xs">
            <motion.button
              onClick={() => decide(false)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold"
              style={{ background: "rgba(239,68,68,0.10)", border: "1.5px solid rgba(239,68,68,0.30)", color: "#ef4444" }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              ✕ Discard
            </motion.button>
            <motion.button
              onClick={() => decide(true)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold"
              style={{ background: `${C}14`, border: `1.5px solid ${C}50`, color: C }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              ✓ Stack
            </motion.button>
          </div>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{queue.length} cards remaining</p>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative z-10">
          {phase === "done" && (
            <>
              <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
              >
                <p className="text-5xl font-bold" style={{ color: C }}>{score}</p>
                <p className="text-sm text-muted-foreground">correct sorts · {wrong} wrong</p>
              </motion.div>
              <motion.p
                className="text-lg font-semibold"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                {score >= 15 ? "Identity locked in." : score >= 8 ? "Strong self-awareness." : "Keep sorting."}
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
              <p className="text-xl font-bold">Build the person you're becoming.</p>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.7 }}>
                Identity doesn't appear fully formed — it's assembled, one<br />
                choice at a time. Each card you keep is a value you've claimed.<br />
                Each one you discard is a lie you've rejected. Stack quickly,<br />
                because real identity is built under pressure.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 8 }}>
                {["◈ Keep what defines you", "✦ Discard what diminishes you", "⟡ The timer is real pressure"].map(t => (
                  <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(225,29,72,0.10)", border: "1px solid rgba(225,29,72,0.25)", color: "rgba(251,113,133,0.85)", letterSpacing: "0.04em" }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C}, #9F1239)`, boxShadow: `0 0 20px ${C}55` }}
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

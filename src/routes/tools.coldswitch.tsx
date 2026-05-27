import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/coldswitch")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: ColdSwitch,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const GAME_DURATION   = 45;
const INITIAL_WINDOW  = 1800;
const MIN_WINDOW      = 500;

const TASK_PAIRS = [
  ["COUNT UP",   "SAY ABC"   ],
  ["BREATHE",    "FLEX"      ],
  ["EYES LEFT",  "EYES RIGHT"],
  ["CLENCH",     "RELAX"     ],
  ["STEP LEFT",  "STEP RIGHT"],
];

const C  = "#00BCD4"; // cyan
const BG = "#010a0d"; // near-black, cyan-tinted

// Deterministic electric pulse lines (each looks like a broken lightning trace)
const PULSE_LINES = [
  { d: "M -20 160 L 130 85  L 400 140",  dash: 18, gap: 300, dur: 3.0, delay: 0.0 },
  { d: "M 415 270 L 240 370 L -20 315",  dash: 15, gap: 280, dur: 3.8, delay: 1.3 },
  { d: "M 0 495 Q 190 430 415 505",      dash: 14, gap: 320, dur: 4.2, delay: 0.7 },
  { d: "M 55 655 L 195 580 L 370 675",   dash: 12, gap: 220, dur: 3.4, delay: 2.1 },
  { d: "M 275 -10 L 315 230 L 258 480",  dash: 16, gap: 250, dur: 4.8, delay: 1.6 },
];

// ── Component ─────────────────────────────────────────────────────────────────
function ColdSwitch() {
  const navigate = useNavigate();

  const [phase, setPhase]         = useState<"idle" | "playing" | "done">("idle");
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [score, setScore]         = useState(0);
  const [misses, setMisses]       = useState(0);
  const [target, setTarget]       = useState<0 | 1>(0);
  const [pair, setPair]           = useState(TASK_PAIRS[0]);
  const [feedback, setFeedback]   = useState<"ok" | "bad" | null>(null);
  const [windowMs, setWindowMs]   = useState(INITIAL_WINDOW);
  const [promptKey, setPromptKey] = useState(0);
  const [correctFlashSide, setCorrectFlashSide] = useState<0 | 1 | null>(null);
  const [badCount, setBadCount]   = useState(0);

  const phaseRef  = useRef<"idle" | "playing" | "done">("idle");
  const windowRef = useRef(INITIAL_WINDOW);
  const targetRef = useRef<0 | 1>(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const missRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);

  // Imperative shake on the instruction panel
  const [instrScope, animateInstr] = useAnimate();

  const clearAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (missRef.current)  clearTimeout(missRef.current);
  }, []);

  // Fire shake every time a miss/wrong-tap is registered
  useEffect(() => {
    if (badCount === 0 || !instrScope.current) return;
    animateInstr(
      instrScope.current,
      { x: [0, -11, 11, -7, 7, -4, 4, 0] },
      { duration: 0.36, ease: "easeInOut" },
    );
  }, [badCount, animateInstr, instrScope]);

  function nextPrompt() {
    if (phaseRef.current !== "playing") return;
    const side = Math.random() < 0.5 ? 0 : 1;
    const p    = TASK_PAIRS[Math.floor(Math.random() * TASK_PAIRS.length)];
    targetRef.current = side as 0 | 1;
    setTarget(side as 0 | 1);
    setPair(p);
    setPromptKey((k) => k + 1);

    missRef.current = setTimeout(() => {
      if (phaseRef.current !== "playing") return;
      setMisses((m) => m + 1);
      setFeedback("bad");
      setBadCount((c) => c + 1);
      setTimeout(() => setFeedback(null), 300);
      nextPrompt();
    }, windowRef.current);
  }

  function start() {
    clearAll();
    phaseRef.current  = "playing";
    windowRef.current = INITIAL_WINDOW;
    setPhase("playing");
    setScore(0);
    setMisses(0);
    setWindowMs(INITIAL_WINDOW);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    setPromptKey(0);
    setCorrectFlashSide(null);
    setBadCount(0);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearAll();
          phaseRef.current = "done";
          setPhase("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => nextPrompt(), 600);
  }

  function tap(side: 0 | 1) {
    if (phaseRef.current !== "playing") return;
    if (missRef.current) clearTimeout(missRef.current);
    const correct = side === targetRef.current;
    if (correct) {
      setScore((s) => s + 1);
      const next = Math.max(MIN_WINDOW, windowRef.current - 25);
      windowRef.current = next;
      setWindowMs(next);
      setFeedback("ok");
      setCorrectFlashSide(side);
      setTimeout(() => setCorrectFlashSide(null), 280);
    } else {
      setMisses((m) => m + 1);
      setFeedback("bad");
      setBadCount((c) => c + 1);
    }
    setTimeout(() => setFeedback(null), 300);
    nextPrompt();
  }

  useEffect(() => () => clearAll(), [clearAll]);

  const rating =
    score >= 30 ? "Lightning reflexes."   :
    score >= 20 ? "Sharp switch control." :
    score >= 10 ? "Building speed."        : "Keep practicing.";

  // 0 = calm start → 1 = maximum pressure
  const urgencyLevel = Math.min(1, (INITIAL_WINDOW - windowMs) / (INITIAL_WINDOW - MIN_WINDOW));

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: BG }}
    >

      {/* ── Background layers ─────────────────────────────────────────────── */}

      {/* Faint circuit grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${C}18 1px, transparent 1px),
            linear-gradient(90deg, ${C}18 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Electric pulse traces */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 375 812"
        preserveAspectRatio="xMidYMid slice"
      >
        {PULSE_LINES.map((line, i) => (
          <motion.path
            key={i}
            d={line.d}
            stroke={C}
            strokeWidth="0.9"
            fill="none"
            strokeOpacity={0.07}
            strokeDasharray={`${line.dash} ${line.gap}`}
            animate={{ strokeDashoffset: [0, -(line.dash + line.gap)] }}
            transition={{
              duration: line.dur,
              repeat: Infinity,
              ease: "linear",
              delay: line.delay,
            }}
          />
        ))}
      </svg>

      {/* Radial atmosphere — faint cyan centre bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 42%, rgba(0,55,65,0.40) 0%, transparent 70%)`,
        }}
      />

      {/* Urgency edge glow — builds as speed increases */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: urgencyLevel * 0.75 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        style={{
          background: `radial-gradient(ellipse 130% 100% at 50% 50%, transparent 36%, ${C}14 65%, ${C}3a 100%)`,
        }}
      />
      {/* Secondary urgency pulse — red tinge at high speed */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: Math.max(0, urgencyLevel - 0.55) * 0.5 }}
        transition={{ duration: 0.8 }}
        style={{
          background: "radial-gradient(ellipse 130% 100% at 50% 50%, transparent 50%, rgba(220,40,60,0.18) 85%, rgba(220,40,60,0.32) 100%)",
        }}
      />

      {/* ── Back button ───────────────────────────────────────────────────── */}
      <button
        onClick={() => { clearAll(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-20 h-9 w-9 rounded-full grid place-items-center"
        style={{
          background: "rgba(0,18,24,0.88)",
          border: `1px solid ${C}33`,
          boxShadow: `0 0 10px ${C}12`,
        }}
      >
        <ArrowLeft className="h-4 w-4" style={{ color: `${C}77` }} />
      </button>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="pt-12 pb-2 px-6 text-center relative z-10">
        <motion.p
          className="text-[10px] font-bold tracking-[0.36em] uppercase"
          style={{ color: `${C}55` }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Cold Switch
        </motion.p>

        <AnimatePresence>
          {phase === "playing" && (
            <motion.div
              className="flex justify-center gap-10 mt-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {/* Score */}
              <div className="text-center">
                <motion.p
                  key={score}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: C }}
                  initial={{ scale: 1.70, color: "#ffffff" }}
                  animate={{ scale: 1, color: C }}
                  transition={{ type: "spring", stiffness: 520, damping: 15 }}
                >
                  {score}
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.25em] mt-0.5" style={{ color: `${C}44` }}>
                  Score
                </p>
              </div>

              {/* Time */}
              <div className="text-center">
                <motion.p
                  key={timeLeft}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: timeLeft <= 10 ? "#ff6b6b" : "rgba(255,255,255,0.88)" }}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                >
                  {timeLeft}s
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.25em] mt-0.5" style={{ color: "rgba(255,255,255,0.20)" }}>
                  Left
                </p>
              </div>

              {/* Misses */}
              <div className="text-center">
                <motion.p
                  key={misses}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: misses > 0 ? "#ff6b6b" : "rgba(255,255,255,0.45)" }}
                  initial={{
                    scale: misses > 0 ? 1.60 : 1,
                    color: misses > 0 ? "#ff2020" : "rgba(255,255,255,0.45)",
                  }}
                  animate={{
                    scale: 1,
                    color: misses > 0 ? "#ff6b6b" : "rgba(255,255,255,0.45)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                >
                  {misses}
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.25em] mt-0.5" style={{ color: "rgba(255,80,80,0.35)" }}>
                  Misses
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Playing area ──────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="flex-1 flex flex-col gap-3.5 px-5 mt-3 pb-4 relative z-10">

          {/* Instruction panel — ref for imperative shake */}
          <div ref={instrScope}>
            <div
              className="relative text-center py-5 rounded-2xl overflow-hidden"
              style={{
                background:
                  feedback === "ok"  ? `rgba(0,188,212,0.12)` :
                  feedback === "bad" ? "rgba(220,45,45,0.10)"  :
                  "rgba(0,14,20,0.88)",
                border: `1.5px solid ${
                  feedback === "ok"  ? C          :
                  feedback === "bad" ? "#e02828"  :
                  `${C}33`
                }`,
                boxShadow:
                  feedback === "ok"
                    ? `0 0 28px ${C}44, inset 0 0 22px ${C}12`
                    : feedback === "bad"
                    ? "0 0 18px rgba(220,45,45,0.35), inset 0 0 14px rgba(220,45,45,0.08)"
                    : `inset 0 0 18px rgba(0,0,0,0.55)`,
                transition: "background 0.18s, border-color 0.18s, box-shadow 0.18s",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={promptKey}
                  initial={{ y: -18, opacity: 0, scale: 0.93 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.09 } }}
                  transition={{ type: "spring", stiffness: 700, damping: 28 }}
                >
                  <p
                    className="text-[10px] font-semibold tracking-[0.32em] uppercase mb-1.5"
                    style={{ color: `${C}66` }}
                  >
                    Switch to →
                  </p>
                  <p className="text-2xl font-black tracking-wide" style={{ color: C }}>
                    {pair[target]}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Scanline texture */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.014) 3px, rgba(0,255,255,0.014) 4px)",
                }}
              />
            </div>
          </div>

          {/* Tap zones — identical appearance until tapped */}
          <div className="flex gap-3 flex-1">
            {([0, 1] as const).map((side) => {
              const isCorrectFlash = correctFlashSide === side;

              return (
                <motion.button
                  key={side}
                  onPointerDown={(e) => { e.preventDefault(); tap(side); }}
                  className="flex-1 relative rounded-3xl flex flex-col items-center justify-center gap-4 overflow-hidden"
                  style={{
                    touchAction: "none",
                    background:  "rgba(0,10,16,0.92)",
                    border:      `2px solid ${C}28`,
                  }}
                  whileTap={{
                    scale:      0.95,
                    borderColor: `${C}88`,
                    boxShadow:  `0 0 24px ${C}44`,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Correct-tap cyan burst overlay — shown only after a correct tap */}
                  <AnimatePresence>
                    {isCorrectFlash && (
                      <motion.div
                        key="cflash"
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        initial={{ opacity: 0.75 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${C}ee 0%, ${C}66 38%, transparent 72%)`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Arrow — both sides identical, fade in on each new prompt */}
                  <motion.div
                    key={`arrow-${promptKey}-${side}`}
                    initial={{ opacity: 0.4, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 22 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                      {side === 0 ? (
                        <path
                          d="M22 10 L12 18 L22 26 M12 18 H26"
                          stroke={`${C}66`}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M14 10 L24 18 L14 26 M24 18 H10"
                          stroke={`${C}66`}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </motion.div>

                  {/* Task label — same colour on both sides */}
                  <motion.span
                    key={`label-${promptKey}-${side}`}
                    className="text-[11px] font-black tracking-[0.22em] uppercase"
                    style={{ color: `${C}66` }}
                    initial={{ opacity: 0.4, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 480, damping: 22, delay: 0.04 }}
                  >
                    {pair[side]}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          {/* Tiny window indicator */}
          <p
            className="text-center text-[9px] pb-1 tabular-nums"
            style={{ color: `${C}22`, letterSpacing: "0.14em" }}
          >
            {Math.round(windowMs)}ms
          </p>
        </div>
      )}

      {/* ── Idle / Done ───────────────────────────────────────────────────── */}
      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative z-10">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div
                key="done"
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <p
                    className="text-6xl font-black tabular-nums"
                    style={{
                      color: C,
                      textShadow: `0 0 30px ${C}88, 0 0 60px ${C}44`,
                    }}
                  >
                    {score}
                  </p>
                  <p className="text-sm mt-1" style={{ color: `${C}55` }}>
                    correct switches · {misses} miss{misses !== 1 ? "es" : ""}
                  </p>
                </motion.div>
                <p className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {rating}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="text-center space-y-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                  Override the trigger.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                  Every craving fires your "hot system" — emotional, impulsive, fast.<br />
                  Cold Switch trains the "cool system" — rational, deliberate, slow.<br />
                  Switch between them fast enough and you own both.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 6 }}>
                  {["◈ Classify triggers instantly", "✦ Speed increases each round", "⟡ Left/right logic switching"].map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(0,188,212,0.12)", border: "1px solid rgba(0,188,212,0.25)", color: "rgba(0,188,212,0.8)", letterSpacing: "0.04em" }}>{t}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={start}
            className="px-12 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background:    `linear-gradient(135deg, ${C}, #0097A7)`,
              boxShadow:     `0 0 24px ${C}55`,
              letterSpacing: "0.04em",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.95 }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

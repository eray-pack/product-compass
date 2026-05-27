import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";

export const Route = createFileRoute("/tools/tap")({
  component: TapTheUrge,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const GAME_DURATION   = 60;
const CIRCLE_LIFETIME = 1400;
const SPAWN_INTERVAL  = 600;

const TARGET_COLOR     = "#C4873A"; // gold — the one to tap
const DISTRACTOR_COLOR = "#6BAED6"; // blue — resist these

// Show a big combo announcement at these milestones
const ANNOUNCE_AT = new Set([3, 5, 8, 13, 21]);

// 10 burst particle directions (deterministic, no Math.random)
const BURST_DIRS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const dist  = 30 + (i % 4) * 9;   // 30, 39, 48, 57 px
  const size  = 3 + (i % 3) * 1.5;  // 3, 4.5, 6 px
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, size };
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Circle {
  id: number;
  x: number;
  y: number;
  r: number;
  isTarget: boolean;
  born: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ComboAnnounce {
  id: number;
  count: number;
}

// ─── Burst particles component ────────────────────────────────────────────────

function BurstParticles({
  x, y, color, onDone,
}: { x: number; y: number; color: string; onDone: () => void }) {
  return (
    <>
      {BURST_DIRS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width:      p.size,
            height:     p.size,
            left:       x - p.size / 2,
            top:        y - p.size / 2,
            background: color,
            boxShadow:  `0 0 6px 2px ${color}88`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.52, ease: [0.2, 0, 0.8, 1] }}
          onAnimationComplete={i === 0 ? onDone : undefined}
        />
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function TapTheUrge() {
  const navigate = useNavigate();

  const [phase, setPhase]           = useState<"idle" | "playing" | "done">("idle");
  const [circles, setCircles]       = useState<Circle[]>([]);
  const [score, setScore]           = useState(0);
  const [combo, setCombo]           = useState(0);
  const [maxCombo, setMaxCombo]     = useState(0);
  const [timeLeft, setTimeLeft]     = useState(GAME_DURATION);
  const [bursts, setBursts]         = useState<Burst[]>([]);
  const [wrongFlashId, setWrongFlashId] = useState(0);
  const [comboAnnounce, setComboAnnounce] = useState<ComboAnnounce | null>(null);

  const phaseRef    = useRef<"idle" | "playing" | "done">("idle");
  const nextId      = useRef(0);
  const comboRef    = useRef(0);
  const maxComboRef = useRef(0);
  const targetIdRef = useRef<number | null>(null); // id of current gold target
  const spawnRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pruneRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Play area ref for shake animation
  const [areaScope, animateArea] = useAnimate();

  const clearAll = useCallback(() => {
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pruneRef.current) clearInterval(pruneRef.current);
  }, []);

  function triggerWrongFlash() {
    setWrongFlashId((k) => k + 1);
    // Shake the play area
    animateArea(
      areaScope.current,
      { x: [0, -11, 11, -7, 7, -3, 3, 0] },
      { duration: 0.38, ease: "easeInOut" },
    );
  }

  function start() {
    clearAll();
    phaseRef.current   = "playing";
    nextId.current     = 0;
    comboRef.current   = 0;
    maxComboRef.current = 0;
    targetIdRef.current = null;

    setPhase("playing");
    setCircles([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setBursts([]);
    setComboAnnounce(null);

    // Spawn loop
    spawnRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return;
      const id       = nextId.current++;
      const r        = 26 + Math.floor(id * 7.3 % 22); // deterministic radius variation
      const x        = r + (id * 97 % (300 - r * 2));
      const y        = r + (id * 137 % (380 - r * 2));
      const isTarget = targetIdRef.current === null;
      if (isTarget) targetIdRef.current = id;
      setCircles((prev) => [...prev, { id, x, y, r, isTarget, born: Date.now() }]);
    }, SPAWN_INTERVAL);

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearAll();
          phaseRef.current = "done";
          setPhase("done");
          setCircles([]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Prune expired circles
    pruneRef.current = setInterval(() => {
      const now = Date.now();
      setCircles((prev) => {
        const expired    = prev.filter((c) => now - c.born >= CIRCLE_LIFETIME);
        const targetDied = expired.some((c) => c.isTarget);
        if (targetDied) {
          // Missed the gold target — red flash, combo reset
          targetIdRef.current = null;
          comboRef.current    = 0;
          setCombo(0);
          triggerWrongFlash();
        }
        return prev.filter((c) => now - c.born < CIRCLE_LIFETIME);
      });
    }, 200);
  }

  function tap(id: number, x: number, y: number, isTarget: boolean) {
    setCircles((prev) => prev.filter((c) => c.id !== id));

    if (isTarget) {
      // Correct — burst + score
      targetIdRef.current = null;
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      if (newCombo > maxComboRef.current) {
        maxComboRef.current = newCombo;
        setMaxCombo(newCombo);
      }
      setCombo(newCombo);
      setScore((s) => s + (newCombo >= 3 ? 2 : 1));
      setBursts((b) => [...b, { id: Date.now(), x, y, color: TARGET_COLOR }]);
      if (ANNOUNCE_AT.has(newCombo)) {
        const announceId = Date.now();
        setComboAnnounce({ id: announceId, count: newCombo });
        setTimeout(() => setComboAnnounce(null), 900);
      }
    } else {
      // Wrong — distractor tapped
      comboRef.current = 0;
      setCombo(0);
      setBursts((b) => [...b, { id: Date.now(), x, y, color: DISTRACTOR_COLOR }]);
      triggerWrongFlash();
    }
  }

  useEffect(() => () => clearAll(), [clearAll]);

  const isRunning = phase === "playing";
  const endMsg =
    score >= 40 ? "Incredible focus." :
    score >= 25 ? "Strong resistance." :
    score >= 10 ? "Good work." : "Keep practicing.";

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#020508" }}
    >
      {/* CSS fade keyframe for orb lifetime */}
      <style>{`
        @keyframes orbFade {
          0%   { opacity: 1; }
          65%  { opacity: 0.92; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Background: dark base + gold edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 45%, rgba(196,135,58,0.07) 75%, rgba(196,135,58,0.14) 100%)",
        }}
      />
      {/* Corner glows for atmosphere */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 0% 100%, rgba(196,135,58,0.06), transparent 60%), " +
            "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(100,150,200,0.05), transparent 60%)",
        }}
      />

      {/* Back button */}
      <button
        onClick={() => { clearAll(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-20 h-9 w-9 rounded-full grid place-items-center"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <ArrowLeft className="h-4 w-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      </button>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pt-12 pb-2 px-5 text-center relative z-10">
        <motion.p
          className="text-[10px] font-bold tracking-[0.34em] uppercase"
          style={{ color: "rgba(255,255,255,0.28)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Impulse Shift
        </motion.p>

        {/* Stat counters */}
        <AnimatePresence>
          {isRunning && (
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
                  className="text-2xl font-bold"
                  style={{ color: TARGET_COLOR }}
                  initial={{ scale: 1.55, color: "#FFE08A" }}
                  animate={{ scale: 1, color: TARGET_COLOR }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                >
                  {score}
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.22em] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Score</p>
              </div>

              {/* Time left */}
              <div className="text-center">
                <motion.p
                  key={timeLeft}
                  className="text-2xl font-bold"
                  style={{ color: timeLeft <= 10 ? "#ff6b6b" : "rgba(255,255,255,0.88)" }}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                >
                  {timeLeft}s
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.22em] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Left</p>
              </div>

              {/* Combo */}
              <div className="text-center">
                <motion.p
                  key={combo}
                  className="text-2xl font-bold"
                  style={{ color: combo >= 3 ? "#FFD54F" : "rgba(255,255,255,0.88)" }}
                  initial={{ scale: combo > 0 ? 1.6 : 1, color: combo >= 3 ? "#FFE88A" : "#ffffff" }}
                  animate={{ scale: 1, color: combo >= 3 ? "#FFD54F" : "rgba(255,255,255,0.88)" }}
                  transition={{ type: "spring", stiffness: 480, damping: 16 }}
                >
                  ×{combo}
                </motion.p>
                <p className="text-[9px] uppercase tracking-[0.22em] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Combo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Play area ───────────────────────────────────────────────────────── */}
      {isRunning && (
        <div
          ref={areaScope}
          className="flex-1 relative overflow-hidden mx-4 mt-2 mb-5 rounded-2xl"
          style={{
            background:
              "linear-gradient(160deg, #060a18 0%, #030608 60%, #05080e 100%)",
            border:     "1px solid rgba(196,135,58,0.14)",
            boxShadow:
              "0 0 50px rgba(196,135,58,0.05), inset 0 0 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Subtle inner vignette */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.5) 100%)",
            }}
          />

          {/* Wrong-tap red flash */}
          <AnimatePresence>
            {wrongFlashId > 0 && (
              <motion.div
                key={wrongFlashId}
                className="absolute inset-0 rounded-2xl pointer-events-none z-40"
                initial={{ opacity: 0.55 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.40, ease: "easeOut" }}
                style={{
                  background: "rgba(220,45,45,0.35)",
                  boxShadow: "inset 0 0 60px rgba(220,45,45,0.5)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Combo announce — center of play area */}
          <AnimatePresence>
            {comboAnnounce && (
              <motion.div
                key={comboAnnounce.id}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-center">
                  <p
                    className="text-5xl font-black tracking-tight"
                    style={{
                      color: "#FFD54F",
                      textShadow: "0 0 30px #FFD54F88, 0 0 60px #C4873A44",
                    }}
                  >
                    ×{comboAnnounce.count}
                  </p>
                  <p
                    className="text-sm font-bold tracking-[0.22em] uppercase mt-1"
                    style={{ color: "rgba(255,213,79,0.65)" }}
                  >
                    Combo
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Burst particles */}
          {bursts.map((b) => (
            <BurstParticles
              key={b.id}
              x={b.x}
              y={b.y}
              color={b.color}
              onDone={() =>
                setBursts((prev) => prev.filter((p) => p.id !== b.id))
              }
            />
          ))}

          {/* Orbs */}
          {circles.map((c) => {
            const color    = c.isTarget ? TARGET_COLOR : DISTRACTOR_COLOR;
            const floatPx  = 3 + (c.id % 3) * 1.5; // 3, 4.5, or 6 px float
            const floatDur = 1.8 + (c.id % 4) * 0.35;

            return (
              <motion.div
                key={c.id}
                className="absolute"
                style={{ left: c.x - c.r, top: c.y - c.r }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type:      "spring",
                  stiffness: 520,
                  damping:   22,
                }}
              >
                {/* CSS-driven lifetime fade */}
                <div
                  style={{
                    position: "relative",
                    width: c.r * 2,
                    height: c.r * 2,
                    animation: `orbFade ${CIRCLE_LIFETIME}ms linear forwards`,
                  }}
                >
                  {/* Motion trail — blurred shadow orb, slightly offset */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset:      -6,
                      background: `radial-gradient(circle, ${color}28 20%, transparent 72%)`,
                      filter:     "blur(6px)",
                      transform:  "translateY(4px) scale(1.08)",
                    }}
                  />

                  {/* Outer glow ring */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset:      -10,
                      background: `radial-gradient(circle, ${color}20 30%, transparent 70%)`,
                      filter:     "blur(4px)",
                    }}
                  />

                  {/* Target indicator: extra gold crown ring */}
                  {c.isTarget && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset:     -4,
                        border:    `1.5px solid ${TARGET_COLOR}88`,
                        boxShadow: `0 0 14px 3px ${TARGET_COLOR}44, inset 0 0 8px ${TARGET_COLOR}22`,
                      }}
                    />
                  )}

                  {/* Main floating orb */}
                  <motion.button
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: c.isTarget
                        ? `radial-gradient(circle at 36% 30%, ${color}ff, ${color}cc 50%, ${color}77)`
                        : `radial-gradient(circle at 38% 32%, ${color}ee, ${color}99 52%, ${color}55)`,
                      boxShadow: c.isTarget
                        ? `0 0 22px ${color}70, 0 0 44px ${color}30, inset 0 0 12px ${color}30`
                        : `0 0 16px ${color}55, 0 0 32px ${color}22`,
                      touchAction: "none",
                      cursor:      "pointer",
                    }}
                    animate={{ y: [0, -floatPx, 0, floatPx, 0] }}
                    transition={{
                      duration:   floatDur,
                      repeat:     Infinity,
                      ease:       "easeInOut",
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      tap(c.id, c.x, c.y, c.isTarget);
                    }}
                    whileTap={{ scale: 0.84 }}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Legend hint (fades out after 3s) */}
          <motion.div
            className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 pointer-events-none"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 3 }}
          >
            <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: TARGET_COLOR }}>
              ● Tap gold
            </span>
            <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: DISTRACTOR_COLOR }}>
              ● Avoid blue
            </span>
          </motion.div>
        </div>
      )}

      {/* ── Idle / Done screens ──────────────────────────────────────────────── */}
      {!isRunning && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7 relative z-10">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div
                key="done"
                className="text-center space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <motion.p
                    className="text-6xl font-black tabular-nums"
                    style={{ color: TARGET_COLOR }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                  >
                    {score}
                  </motion.p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    gold orbs tapped
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="text-center px-6 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-2xl font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>{maxCombo}×</p>
                    <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Best combo</p>
                  </div>
                </div>
                <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.70)" }}>{endMsg}</p>
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
                  Redirect the impulse.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
                  The gold orb is the constructive choice. The blue ones are noise —<br />
                  distractions dressed as options. Every time you tap gold and resist<br />
                  blue, you're physically practising impulse redirection. Your brain<br />
                  registers this as a real win.
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ background: TARGET_COLOR, boxShadow: `0 0 8px ${TARGET_COLOR}` }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>Constructive target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ background: DISTRACTOR_COLOR, boxShadow: `0 0 8px ${DISTRACTOR_COLOR}` }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>Distraction — ignore</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 4 }}>
                  {["⟡ Combos reinforce willpower loops"].map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(222,188,122,0.10)", border: "1px solid rgba(222,188,122,0.22)", color: "rgba(222,188,122,0.75)", letterSpacing: "0.04em" }}>{t}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={start}
            className="px-12 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background:    "var(--gradient-primary)",
              boxShadow:     "var(--shadow-glow)",
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

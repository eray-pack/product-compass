import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/voidstare")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: VoidStare,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const MOVE_THRESHOLD = 14;
const P  = "#7B2FBE"; // purple
const BG = "#000000"; // pure black

// Three concentric rings: radius, rotation direction, rotation speed (seconds/cycle)
const RINGS = [
  { r: 52,  dir:  1, dur: 22, sw: 3 },
  { r: 82,  dir: -1, dur: 33, sw: 4 },
  { r: 112, dir:  1, dur: 46, sw: 5 },
] as const;

// Each ring scatters in a different direction on explosion
const SCATTER = [
  { x:  0,   y: -120 },
  { x: 110,  y:   55 },
  { x: -100, y:   70 },
];

// ── Component ─────────────────────────────────────────────────────────────────
function VoidStare() {
  const navigate = useNavigate();
  const [phase, setPhase]       = useState<"idle" | "holding" | "done">("idle");
  const [elapsed, setElapsed]   = useState(0);
  const [best, setBest]         = useState(0);
  const [exploding, setExploding] = useState(false);
  const [flashOn, setFlashOn]   = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startXY    = useRef({ x: 0, y: 0 });
  const elapsedRef = useRef(0);
  const phaseRef   = useRef<"idle" | "holding" | "done">("idle");

  function clear() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startHold(x: number, y: number) {
    if (phaseRef.current === "holding") return;
    clear();
    startXY.current     = { x, y };
    elapsedRef.current  = 0;
    phaseRef.current    = "holding";
    setElapsed(0);
    setPhase("holding");
    setExploding(false);

    // Ripple pulse on touch
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 780);

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed((t) => t + 1);
    }, 100);
  }

  function stopHold(cause: "move" | "release" = "release") {
    if (phaseRef.current !== "holding") return;
    clear();
    const t = elapsedRef.current;
    phaseRef.current = "done";
    setPhase("done");
    setBest((b) => Math.max(b, t));
    if (cause === "move") {
      setExploding(true);
      setFlashOn(true);
      setTimeout(() => setExploding(false), 680);
      setTimeout(() => setFlashOn(false), 380);
    }
  }

  function handleMove(x: number, y: number) {
    if (phaseRef.current !== "holding") return;
    const dx = Math.abs(x - startXY.current.x);
    const dy = Math.abs(y - startXY.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) stopHold("move");
  }

  useEffect(() => () => clear(), []);

  const fmtTime = (t: number) => `${(t / 10).toFixed(1)}s`;

  // 0 → 1 over 20 seconds of holding — drives the progress aura
  const auraProgress = phase === "holding" ? Math.min(1, elapsed / 200) : 0;

  // Ring base opacity depending on phase
  const ringOpacity = phase === "holding" ? 0.82 : 0.28;

  return (
    <div
      className="min-h-screen flex flex-col select-none relative overflow-hidden"
      style={{ background: BG, userSelect: "none" }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        startHold(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={() => stopHold("release")}
      onPointerCancel={() => stopHold("release")}
    >

      {/* ── Background: pure black + deep purple radial void ────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 75% at 50% 48%,
            ${P}22 0%,
            ${P}0e 35%,
            transparent 70%)`,
        }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ── Full-screen flash on movement ─────────────────────────────────── */}
      <AnimatePresence>
        {flashOn && (
          <motion.div
            key="flash"
            className="absolute inset-0 pointer-events-none z-50"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            style={{ background: `rgba(123,47,190,0.38)` }}
          />
        )}
      </AnimatePresence>

      {/* ── Back button ───────────────────────────────────────────────────── */}
      <button
        onClick={(e) => { e.stopPropagation(); clear(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-20 h-9 w-9 rounded-full grid place-items-center"
        style={{
          background: "rgba(20,0,35,0.85)",
          border: `1px solid ${P}44`,
          boxShadow: `0 0 10px ${P}18`,
        }}
      >
        <ArrowLeft className="h-4 w-4" style={{ color: `${P}88` }} />
      </button>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">

        {/* Title */}
        <motion.p
          className="text-[10px] font-bold tracking-[0.38em] uppercase"
          style={{ color: `${P}55` }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Void Stare
        </motion.p>

        {/* ── Ring + Eye container ─────────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 240, height: 240, overflow: "visible" }}
        >
          {/* Dim static base rings — provide faint full circles at all times */}
          {RINGS.map((ring, i) => (
            <div
              key={`base-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width:  ring.r * 2,
                height: ring.r * 2,
                left:   120 - ring.r,
                top:    120 - ring.r,
                border: `${ring.sw}px solid ${P}`,
                opacity: exploding ? 0 : phase === "holding" ? 0.11 : 0.05,
                transition: "opacity 0.6s",
              }}
            />
          ))}

          {/* Rotating conic-gradient arcs */}
          {RINGS.map((ring, i) => {
            const { r, dir, dur, sw } = ring;
            const innerClip = r - sw - 1;
            const maskVal = `radial-gradient(circle at 50% 50%, transparent ${innerClip}px, white ${innerClip + 1}px, white ${r}px, transparent ${r + 1}px)`;

            return (
              <motion.div
                key={`ring-${i}`}
                className="absolute pointer-events-none"
                style={{ width: r * 2, height: r * 2, left: 120 - r, top: 120 - r }}
                animate={{
                  x:       exploding ? SCATTER[i].x : 0,
                  y:       exploding ? SCATTER[i].y : 0,
                  scale:   exploding ? 1.7 : 1,
                  opacity: exploding ? 0 : ringOpacity,
                }}
                transition={
                  exploding
                    ? { duration: 0.55, ease: [0.1, 0, 0.75, 1] }
                    : { duration: 0.65, ease: "easeOut" }
                }
              >
                {/* Inner rotating arc */}
                <motion.div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg,
                      ${P}00  0%,
                      ${P}44 14%,
                      ${P}cc 24%,
                      ${P}ff 28%,
                      ${P}cc 32%,
                      ${P}44 42%,
                      ${P}00 52%,
                      ${P}00 100%)`,
                    maskImage: maskVal,
                    WebkitMaskImage: maskVal,
                  }}
                  animate={{ rotate: dir === 1 ? [0, 360] : [0, -360] }}
                  transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            );
          })}

          {/* Progress aura — grows and brightens the longer the user holds */}
          {phase === "holding" && (
            <>
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width:  260, height: 260,
                  left:   -10, top:    -10,
                  border: `1px solid ${P}`,
                  boxShadow: `0 0 22px 6px ${P}77, 0 0 50px 14px ${P}33`,
                  opacity: auraProgress * 0.70,
                  transform: `scale(${1 + auraProgress * 0.22})`,
                  transition: "opacity 0.3s, transform 0.4s",
                }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width:  310, height: 310,
                  left:   -35, top:    -35,
                  background: `radial-gradient(ellipse, transparent 78%, ${P}22 93%, transparent 100%)`,
                  opacity: auraProgress * 0.85,
                  transform: `scale(${1 + auraProgress * 0.35})`,
                  transition: "opacity 0.3s, transform 0.5s",
                }}
              />
            </>
          )}

          {/* Ripple on touch start */}
          <AnimatePresence>
            {showRipple && (
              <motion.div
                key="ripple"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width:  244, height: 244,
                  left:   -2,  top:    -2,
                  border: `2px solid ${P}`,
                  boxShadow: `0 0 12px 4px ${P}66`,
                }}
                initial={{ scale: 0.55, opacity: 0.9 }}
                animate={{ scale: 1.65, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.2, 0, 0.5, 1] }}
              />
            )}
          </AnimatePresence>

          {/* Eye SVG — pupil breathes in and out */}
          <svg
            width="68"
            height="68"
            viewBox="0 0 68 68"
            fill="none"
            style={{
              filter:
                phase === "holding"
                  ? `drop-shadow(0 0 14px ${P}) drop-shadow(0 0 28px ${P}88)`
                  : `drop-shadow(0 0 5px ${P}88)`,
              transition: "filter 0.8s",
            }}
          >
            {/* Eye sclera glow behind iris */}
            <ellipse
              cx="34" cy="34" rx="28" ry="18"
              fill={P}
              opacity={phase === "holding" ? 0.22 : 0.06}
              style={{ transition: "opacity 0.6s" }}
            />

            {/* Eye outline */}
            <ellipse
              cx="34" cy="34" rx="32" ry="22"
              stroke={P}
              strokeWidth="2"
              opacity="0.88"
            />

            {/* Iris — dilates and contracts */}
            <motion.circle
              cx="34"
              cy="34"
              fill={P}
              animate={{
                r:       [14, 16.8, 14],
                opacity: phase === "holding" ? [0.80, 0.96, 0.80] : [0.30, 0.44, 0.30],
              }}
              transition={{
                duration: 4.8,
                repeat:   Infinity,
                ease:     "easeInOut",
              }}
            />

            {/* Pupil — dilates with iris */}
            <motion.circle
              cx="34"
              cy="34"
              fill="#000000"
              animate={{ r: [8, 9.8, 8] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Specular highlight */}
            <circle cx="39" cy="29" r="3.5" fill="white" opacity="0.42" />
          </svg>

          {/* Timer — shown while holding, bounces each second */}
          {phase === "holding" && (
            <div
              className="absolute pointer-events-none text-center"
              style={{ bottom: -58, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
            >
              <motion.p
                key={Math.floor(elapsed / 10)}
                className="text-3xl font-bold tabular-nums"
                style={{
                  color: P,
                  textShadow: `0 0 20px ${P}99, 0 0 40px ${P}44`,
                }}
                initial={{ scale: 1.28, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                {fmtTime(elapsed)}
              </motion.p>
            </div>
          )}
        </div>

        {/* ── Text section ─────────────────────────────────────────────────── */}
        <div className="text-center min-h-[100px] flex flex-col items-center justify-center space-y-2">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div
                key="idle"
                className="text-center space-y-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6 }}
              >
                {/* "Hold. Don't move." — cinematic letterSpacing entrance */}
                <motion.p
                  className="text-xl font-bold"
                  initial={{ opacity: 0, letterSpacing: "0.55em" }}
                  animate={{ opacity: 1, letterSpacing: "0.03em" }}
                  transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    color: "rgba(255,255,255,0.88)",
                    textShadow: `0 0 24px ${P}44`,
                  }}
                >
                  Dissolve the void.
                </motion.p>
                <motion.p
                  className="text-sm leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.6, delay: 0.7 }}
                  style={{ color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}
                >
                  Dark thoughts thrive in movement — in scrolling, switching,<br />
                  avoiding. Void Stare forces complete stillness. Hold the gaze<br />
                  long enough and the void begins to dissolve. What remains<br />
                  is the part of you that was never afraid.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 1.4 }}
                  style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 10 }}
                >
                  {["◈ Touch and hold perfectly still", "✦ Movement breaks the session", "⟡ Gaze-hold meditation"].map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(123,47,190,0.14)", border: "1px solid rgba(123,47,190,0.30)", color: "rgba(167,113,240,0.85)", letterSpacing: "0.04em" }}>{t}</span>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {phase === "holding" && (
              <motion.p
                key="holding"
                className="text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{ color: P }}
              >
                Stay still…
              </motion.p>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.p
                  className="text-4xl font-bold tabular-nums"
                  style={{
                    color: P,
                    textShadow: `0 0 24px ${P}99, 0 0 48px ${P}44`,
                  }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  {fmtTime(elapsed)}
                </motion.p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
                  held still
                </p>
                {best > elapsed && (
                  <p className="text-xs" style={{ color: `${P}88` }}>
                    Best: {fmtTime(best)}
                  </p>
                )}
                <motion.p
                  className="text-sm font-semibold mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  {elapsed >= 300
                    ? "Extraordinary control."
                    : elapsed >= 100
                    ? "Strong stillness."
                    : "Keep practicing."}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* "Touch anywhere" hint — pulses softly */}
        <AnimatePresence>
          {phase !== "holding" && (
            <motion.p
              key="hint"
              className="text-xs text-center"
              style={{ color: `${P}66` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.28, 0.72, 0.28] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {phase === "idle" ? "Touch anywhere to begin" : "Touch anywhere to try again"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

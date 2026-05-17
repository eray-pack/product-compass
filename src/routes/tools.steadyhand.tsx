import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/steadyhand")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: SteadyHand,
});

const TRACK_W = 280;
const TRACK_H = 60;
const DOT_R = 16;
const GAME_DURATION = 30;
const C = "#D97706";
const BG = "#080500";

// Deterministic gold rain particles (top of screen)
const RAIN_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 31 + 11) % 100,
  delay: (i * 0.13) % 1.2,
  dur: 0.8 + (i % 5) * 0.18,
  size: 4 + (i % 3) * 2,
}));

// Deterministic grid dots for background
const GRID_DOTS = Array.from({ length: 35 }, (_, i) => ({
  x: (i % 7) * 16.5 + 1,
  y: Math.floor(i / 7) * 22 + 2,
}));

function SteadyHand() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [dotX, setDotX] = useState(DOT_R + 4);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [best, setBest] = useState(0);
  const [onTrack, setOnTrack] = useState(true);
  const [edgeFlash, setEdgeFlash] = useState(false);
  const [showRain, setShowRain] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const maxX = useRef(DOT_R + 4);
  const wasOnTrack = useRef(true);

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
    setEdgeFlash(false);
    setShowRain(false);
    dragging.current = false;
    wasOnTrack.current = true;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          phaseRef.current = "done";
          setPhase("done");
          setBest((b) => Math.max(b, maxX.current));
          setShowRain(true);
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
    const justLeft = wasOnTrack.current && !inside;
    wasOnTrack.current = inside;
    setOnTrack(inside);
    if (justLeft) {
      setEdgeFlash(true);
      setTimeout(() => setEdgeFlash(false), 220);
    }
    if (inside) {
      const nx = Math.min(TRACK_W - DOT_R - 4, Math.max(DOT_R + 4, relX));
      setDotX(nx);
      if (nx > maxX.current) maxX.current = nx;
    }
  }

  function handlePointerUp() {
    if (!dragging.current || phaseRef.current !== "playing") return;
    dragging.current = false;
    setOnTrack(true);
  }

  useEffect(() => () => clearTimer(), []);

  const pct = Math.round(((maxX.current - DOT_R - 4) / (TRACK_W - DOT_R * 2 - 8)) * 100);
  const bestPct = Math.round(((best - DOT_R - 4) / (TRACK_W - DOT_R * 2 - 8)) * 100);

  // Timer color: gold → orange → red
  const timePct = timeLeft / GAME_DURATION;
  const timerColor = timePct > 0.5 ? C : timePct > 0.25 ? "#F97316" : "#ef4444";

  // Shake amplitude grows over time
  const shakeAmp = 5 + (1 - timePct) * 14;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: BG }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 60% 45% at 50% 55%, ${C}0d 0%, transparent 70%)`,
        }} />
        {/* Subtle gold grid */}
        <svg className="absolute inset-0 w-full h-full opacity-100">
          {GRID_DOTS.map((d, i) => (
            <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r="1"
              fill={C} opacity="0.055" />
          ))}
        </svg>
      </div>

      {/* Edge flash on going off-track */}
      <AnimatePresence>
        {edgeFlash && (
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

      {/* Gold rain on success */}
      <AnimatePresence>
        {showRain && RAIN_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none z-30"
            style={{
              left: `${p.x}%`,
              top: -p.size,
              width: p.size,
              height: p.size,
              background: C,
              boxShadow: `0 0 6px ${C}88`,
            }}
            initial={{ y: 0, opacity: 0.9 }}
            animate={{ y: "110vh", opacity: 0 }}
            transition={{ duration: p.dur + 1.2, delay: p.delay, ease: "easeIn" }}
          />
        ))}
      </AnimatePresence>

      <motion.button
        onClick={() => { clearTimer(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.88 }}
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="pt-12 pb-2 px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>Steady Hand</p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{pct}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</p>
            </div>
            <div>
              <motion.p
                key={timeLeft}
                className="text-2xl font-bold"
                style={{ color: timerColor }}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 22 }}
              >
                {timeLeft}s
              </motion.p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 relative z-10">
          <p className="text-sm text-center" style={{ color: onTrack ? `${C}88` : "#ef4444" }}>
            {onTrack ? "Drag right — stay in the track" : "⚠ Off track!"}
          </p>

          {/* Shaking container — amplitude increases over time */}
          <motion.div
            animate={{ y: [0, -shakeAmp, shakeAmp, -shakeAmp * 0.6, shakeAmp * 0.6, 0] }}
            transition={{ duration: 0.22, repeat: Infinity, ease: "linear" }}
          >
            <div
              ref={trackRef}
              className="relative overflow-hidden rounded-2xl"
              style={{
                width: TRACK_W,
                height: TRACK_H,
                background: "rgba(0,0,0,0.6)",
                border: `1.5px solid ${onTrack ? C + "55" : "#ef444466"}`,
                cursor: "none",
                touchAction: "none",
                boxShadow: `0 0 24px ${onTrack ? C + "22" : "rgba(239,68,68,0.2)"}`,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                dragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
            >
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: dotX,
                  background: `${C}18`,
                  transition: "width 0.06s linear",
                }}
              />
              {/* Pulsing track lane */}
              <motion.div
                className="absolute inset-x-4 top-4 bottom-4 rounded-full"
                style={{ border: `1.5px solid ${C}33` }}
                animate={{ borderColor: [`${C}33`, `${C}66`, `${C}33`] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Dot — spring back to start if off-track */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: dotX - DOT_R,
                  width: DOT_R * 2,
                  height: DOT_R * 2,
                  background: onTrack ? C : "#ef4444",
                  boxShadow: `0 0 18px ${onTrack ? C : "#ef4444"}88`,
                  transition: "background 0.1s, box-shadow 0.1s",
                }}
              >
                {/* Glow trail */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: onTrack ? C : "#ef4444", filter: "blur(8px)", opacity: 0.45 }}
                />
              </motion.div>
              {/* Finish flag */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none">🏁</div>
            </div>
          </motion.div>
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
                <p className="text-5xl font-bold" style={{ color: C }}>{pct}%</p>
                <p className="text-sm text-muted-foreground">of the track completed</p>
                {bestPct > pct && (
                  <p className="text-xs" style={{ color: C }}>Best: {bestPct}%</p>
                )}
              </motion.div>
              <motion.p
                className="text-lg font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {pct >= 80 ? "Unshakeable." : pct >= 50 ? "Solid control." : "Stay calm under pressure."}
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
              <p className="text-xl font-bold">Don't shake.</p>
              <p className="text-sm text-muted-foreground">
                Hold and drag the dot right to the finish.<br />The screen shakes — stay calm.<br />30 seconds.
              </p>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C}, #B45309)`, boxShadow: `0 0 20px ${C}55` }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {phase === "done" ? "Try again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

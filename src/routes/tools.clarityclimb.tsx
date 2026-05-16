import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/clarityclimb")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/" });
  },
  component: ClarityClimb,
});

const SUMMIT = 20;
const C = "#10B981";

const GOOD = [
  "Go for a walk", "Drink water", "Call a friend",
  "10 push-ups", "Meditate 2 min", "Read a page",
  "Deep breath", "Write it down", "Cold water splash",
  "Listen to music", "Step outside", "Do a stretch",
];

const BAD = [
  "One more hit", "Check later", "Nobody cares",
  "Just this once", "I can't do this", "Give up",
  "Start tomorrow", "It won't matter", "I deserve this",
  "Five more minutes", "No one will know", "What's the point",
];

// 11 waypoints in 300×240 viewBox — base at bottom, summit at top
const PATH_POINTS = [
  { x: 150, y: 222 }, // 0 — base
  { x: 110, y: 202 }, // 1
  { x: 175, y: 180 }, // 2
  { x: 118, y: 158 }, // 3
  { x: 176, y: 135 }, // 4
  { x: 112, y: 112 }, // 5
  { x: 168, y: 90  }, // 6
  { x: 120, y: 68  }, // 7
  { x: 162, y: 48  }, // 8
  { x: 136, y: 30  }, // 9
  { x: 150, y: 14  }, // 10 — summit
];

// Each "level" unit = 2 segments (SUMMIT=20, 10 segments, 11 points)
function getPlayerPos(level: number) {
  const t = (level / SUMMIT) * (PATH_POINTS.length - 1);
  const i = Math.min(Math.floor(t), PATH_POINTS.length - 2);
  const frac = t - i;
  const a = PATH_POINTS[i];
  const b = PATH_POINTS[i + 1];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

function makePathD() {
  return PATH_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

function makeCard() {
  const isGood = Math.random() > 0.45;
  const list = isGood ? GOOD : BAD;
  return { text: list[Math.floor(Math.random() * list.length)], isGood };
}

function ClarityClimb() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [level, setLevel] = useState(0);
  const [card, setCard] = useState(makeCard);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [good, setGood] = useState(0);
  const [bad, setBad] = useState(0);

  function start() {
    setLevel(0);
    setCard(makeCard());
    setFeedback(null);
    setGood(0);
    setBad(0);
    setPhase("playing");
  }

  function pick(keep: boolean) {
    if (feedback) return;
    const correct = keep === card.isGood;
    setFeedback(correct ? "up" : "down");
    setTimeout(() => {
      setFeedback(null);
      setLevel((l) => {
        const next = correct ? Math.min(SUMMIT, l + 1) : Math.max(0, l - 2);
        if (next >= SUMMIT) setPhase("done");
        return next;
      });
      if (correct) setGood((g) => g + 1);
      else setBad((b) => b + 1);
      setCard(makeCard());
    }, 550);
  }

  const t = level / SUMMIT; // 0 → 1
  const playerPos = getPlayerPos(level);

  // Background shifts dark forest green → deep blue sky
  const bgH = Math.round(140 - t * 80);   // 140 (green) → 60 (blue-ish) → actually let's go 140→220
  const bgHue = Math.round(140 + t * 80);  // 140 → 220
  const bgS = Math.round(18 + t * 14);
  const bgL = Math.round(4 + t * 3);
  const bgColor = `hsl(${bgHue}, ${bgS}%, ${bgL}%)`;

  // Mist opacity grows after 40% climb
  const mistOpacity = Math.max(0, (t - 0.38) * 0.55);

  const pathD = makePathD();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: phase === "playing" ? bgColor : "hsl(140, 18%, 4%)",
        transition: "background 0.8s ease",
      }}
    >
      <motion.button
        onClick={() => navigate({ to: "/" })}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.88 }}
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="pt-12 pb-1 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>
          Clarity Climb
        </p>
        {phase === "playing" && (
          <motion.p
            key={level}
            className="text-xs mt-1"
            style={{ color: `${C}bb` }}
            initial={{ scale: 1.3, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
          >
            {level} / {SUMMIT} steps to summit
          </motion.p>
        )}
      </div>

      {phase === "playing" && (
        <div className="flex-1 flex flex-col px-5 gap-3 mt-1">
          {/* Mountain scene */}
          <div className="relative mx-auto w-full max-w-xs" style={{ height: 200 }}>
            <svg
              viewBox="0 0 300 240"
              width="100%"
              height="100%"
              fill="none"
              style={{ overflow: "visible" }}
            >
              <defs>
                {/* Main mountain gradient — dark base to lighter peak */}
                <linearGradient id="cc-mtn" x1="150" y1="240" x2="150" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0a2218" />
                  <stop offset="45%" stopColor="#0d3326" />
                  <stop offset="100%" stopColor="#1a4a38" />
                </linearGradient>
                {/* Background mountain gradient */}
                <linearGradient id="cc-bg-mtn" x1="150" y1="240" x2="150" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#061410" />
                  <stop offset="100%" stopColor="#0a2a1e" />
                </linearGradient>
                {/* Path glow filter */}
                <filter id="cc-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Summit glow */}
                <filter id="cc-summit-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Player glow */}
                <filter id="cc-player-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="cc-mist" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c8e6d4" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#c8e6d4" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* ── Far background mountains ── */}
              <path d="M0 240 L0 180 L40 130 L80 160 L120 100 L150 125 L180 95 L220 150 L260 120 L300 155 L300 240 Z"
                fill="url(#cc-bg-mtn)" opacity="0.55" />

              {/* ── Main mountain body ── */}
              <path d="M0 240 L30 240 L80 210 L150 14 L220 210 L270 240 L300 240 Z"
                fill="url(#cc-mtn)" />

              {/* Mountain edge highlight (left face) */}
              <path d="M80 210 L150 14" stroke={`${C}22`} strokeWidth="1" />
              {/* Mountain edge highlight (right face) */}
              <path d="M150 14 L220 210" stroke={`${C}11`} strokeWidth="1" />

              {/* ── Forest base ── */}
              <path d="M0 240 L0 225 Q30 215 60 220 Q90 225 120 218 Q140 215 150 218 Q160 215 180 218 Q210 225 240 220 Q270 215 300 225 L300 240 Z"
                fill="#071a0e" opacity="0.9" />

              {/* ── Mist / clouds at mid-high elevation ── */}
              {mistOpacity > 0 && (
                <>
                  <ellipse cx="95" cy="140" rx="60" ry="18" fill="url(#cc-mist)"
                    opacity={mistOpacity * 0.8} />
                  <ellipse cx="195" cy="125" rx="55" ry="15" fill="url(#cc-mist)"
                    opacity={mistOpacity * 0.65} />
                  <ellipse cx="140" cy="90" rx="48" ry="13" fill="url(#cc-mist)"
                    opacity={mistOpacity * 0.5} />
                </>
              )}

              {/* ── Winding path ── */}
              {/* Glow layer */}
              <path d={pathD} stroke={C} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                opacity="0.12" filter="url(#cc-glow)" />
              {/* Path dashes */}
              <path d={pathD} stroke={`${C}55`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="5 6" />
              {/* Path waypoint dots */}
              {PATH_POINTS.slice(1, -1).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.2"
                  fill={i < (level / SUMMIT) * (PATH_POINTS.length - 1) ? C : `${C}40`}
                  opacity="0.7" />
              ))}

              {/* ── Summit glow ── */}
              <circle cx="150" cy="14" r="14" fill="#FFD700" fillOpacity="0.08"
                filter="url(#cc-summit-glow)" />
              <circle cx="150" cy="14" r="6" fill="#FFD700" fillOpacity="0.9"
                filter="url(#cc-summit-glow)" />
              <text x="150" y="11" textAnchor="middle" fontSize="9" fill="#FFD700" opacity="0.95">★</text>

              {/* ── Player dot (SVG foreignObject approach: use absolute div instead) ── */}
              {/* Rendered as absolute motion.div below */}
            </svg>

            {/* Player dot as absolute positioned motion.div over SVG */}
            <motion.div
              className="absolute"
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: C,
                boxShadow: `0 0 12px ${C}, 0 0 24px ${C}88`,
                transform: "translate(-50%, -50%)",
                // Position via percentage of viewBox
                left: `${(playerPos.x / 300) * 100}%`,
                top: `${(playerPos.y / 240) * 100}%`,
              }}
              animate={{
                left: `${(playerPos.x / 300) * 100}%`,
                top: `${(playerPos.y / 240) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 55, damping: 13 }}
            />
          </div>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={card.text + feedback}
              className="mx-auto w-full max-w-xs rounded-3xl p-6 text-center"
              style={{
                background: feedback === "up"
                  ? `${C}18`
                  : feedback === "down"
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(0,0,0,0.35)",
                border: `1.5px solid ${
                  feedback === "up" ? C : feedback === "down" ? "#ef4444" : `${C}28`
                }`,
                backdropFilter: "blur(12px)",
                boxShadow: feedback === "up"
                  ? `0 0 32px ${C}44`
                  : feedback === "down"
                  ? "0 0 24px rgba(239,68,68,0.25)"
                  : "none",
              }}
              animate={feedback === "down" ? { x: [0, -8, 8, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={feedback === "down"
                ? { duration: 0.45, ease: "easeInOut" }
                : { duration: 0.2 }
              }
            >
              <p className="text-base font-semibold leading-snug text-white/90">{card.text}</p>
              <AnimatePresence>
                {feedback && (
                  <motion.p
                    className="mt-2 text-sm font-bold"
                    style={{ color: feedback === "up" ? C : "#ef4444" }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {feedback === "up" ? "↑ Climbing!" : "↓ Slipping back…"}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 max-w-xs mx-auto w-full pb-5">
            <motion.button
              onPointerDown={() => pick(false)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1.5px solid rgba(239,68,68,0.32)",
                color: "#ef4444",
              }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              ✕ Discard
            </motion.button>
            <motion.button
              onPointerDown={() => pick(true)}
              className="flex-1 py-4 rounded-2xl text-sm font-bold"
              style={{
                background: `${C}18`,
                border: `1.5px solid ${C}55`,
                color: C,
              }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              ✓ Keep
            </motion.button>
          </div>
        </div>
      )}

      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <motion.p
                className="text-5xl"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
              >
                🏔️
              </motion.p>
              <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <p className="text-xl font-bold">Summit reached!</p>
                <p className="text-sm text-muted-foreground">{good} good choices · {bad} missteps</p>
              </motion.div>
              <motion.p
                className="text-sm font-semibold"
                style={{ color: C }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Every good choice is a step upward.
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
              <p className="text-xl font-bold">Climb to the summit.</p>
              <p className="text-sm text-muted-foreground">
                Keep good choices, discard the bad.<br />Wrong answers slide you back down.
              </p>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${C}, #059669)`,
              boxShadow: `0 0 20px ${C}55`,
            }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {phase === "done" ? "Climb again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

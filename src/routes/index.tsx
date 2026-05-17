import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coins, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays, loadState, type Addiction } from "@/lib/store";
import { BADGES, currentBadge, nextBadge, badgeSplit } from "@/lib/badges";
import { initPurchases, checkPremium } from "@/lib/purchases";
import { triggerPaywall } from "@/lib/paywall";
import { supabase } from "@/lib/supabase";
import { AddAddictionModal } from "@/components/AddAddictionModal";
import { RelapseModal } from "@/components/RelapseModal";
import { ReEntryScreen } from "@/components/ReEntryScreen";

// ─── Motion ──────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const up: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const fade: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1.0, ease: "easeOut" as const } },
};

const seq = (delay = 0, gap = 0.1): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: gap, delayChildren: delay } },
});

const vp = { once: true, margin: "-24px" } as const;

// ─── Data ────────────────────────────────────────────────────────────────────
const MILESTONES = [
  { day: 7,  label: "Awaken"   },
  { day: 14, label: "Clarity"  },
  { day: 30, label: "Control"  },
  { day: 60, label: "Strength" },
  { day: 90, label: "Reset"    },
];

const MILESTONE_BENEFIT: Record<number, string> = {
  7:  "Increased energy",
  14: "Sharper focus returns",
  30: "Confidence rebuilding",
  60: "Emotional regulation",
  90: "Full dopamine reset",
};

function nextMilestone(day: number) {
  const m = MILESTONES.find((m) => m.day > day);
  if (!m) return null;
  return { ...m, benefit: MILESTONE_BENEFIT[m.day], daysAway: m.day - day };
}

// ─── Today's Focus ────────────────────────────────────────────────────────────
const DAILY_FOCUS = [
  "The urge will pass. Your identity won't. Choose who you're becoming.",
  "Dopamine reset is not about willpower — it's about rebuilding your reward circuit one day at a time.",
  "Every hour you hold means your brain is rewiring. The discomfort is the progress.",
  "You didn't come this far to only come this far. The streak is the proof.",
  "Cravings peak at 20 minutes. Outlast them — you always have before.",
  "The version of you who quit is still watching. Don't let them down today.",
  "Boredom is not an emergency. Sit with it. That's where the rewiring happens.",
  "Recovery isn't a straight line, but every clean day moves the baseline up.",
  "What you resist persists. Acknowledge the urge, then let it pass like weather.",
  "Your future self is being built right now, in this exact moment of resistance.",
  "Discipline is remembering what you want most over what you want right now.",
  "The brain that got you here can heal. Give it the silence it needs today.",
  "One decision away from a relapse, one decision away from your best day. Choose.",
  "Showing up on the hard days is what separates a streak from a lifestyle.",
] as const;

function todaysFocusText(): string {
  const dayOfYear = Math.floor(Date.now() / 86_400_000); // days since epoch
  return DAILY_FOCUS[dayOfYear % DAILY_FOCUS.length];
}

// ─── Daily check-in ───────────────────────────────────────────────────────────
const REWARDS = [
  { weight: 50, xp: 10,  message: null },
  { weight: 25, xp: 50,  message: "Unexpected bonus. Consistency pays." },
  { weight: 15, xp: 20,  message: "You just unlocked something rare.", badge: true },
  { weight: 10, xp: 0,   message: null },
];

function rollReward() {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const r of REWARDS) { cum += r.weight; if (roll < cum) return r; }
  return REWARDS[0];
}

type MoodResp = { message: string; buttons: { label: string; to: string }[] };

function moodResp(v: number): MoodResp {
  if (v <= 2) return {
    message: "Tough day. That's okay. You showed up anyway.",
    buttons: [{ label: "Cut the Signal", to: "/tools/breath" }, { label: "I'm feeling an urge", to: "/tools/sos" }],
  };
  if (v === 3) return {
    message: "Steady is strength. Most people quit on days like this.",
    buttons: [{ label: "Check your progress", to: "/progress" }],
  };
  return {
    message: "You're rewiring. Keep this energy — it compounds.",
    buttons: [{ label: "See your streak", to: "/progress" }],
  };
}

// Dynamic label per mood score
function moodLabel(v: number): string {
  if (v <= 2) return "Rough day, holding the line";
  if (v <= 4) return "Slightly challenged, staying focused";
  return "Feeling strong and unstoppable";
}

function CheckIn({ onReward }: { onReward: (msg: string) => void }) {
  const [, update]  = useAppState();
  const [mood, setMood]           = useState(3);
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    const r = rollReward();
    if (r.xp > 0) update((s) => ({ points: s.points + r.xp, treeXP: s.treeXP + Math.floor(r.xp / 5) }));
    if (r.message) { onReward(r.message); setTimeout(() => onReward(""), 3200); }
  };

  const resp  = confirmed ? moodResp(mood) : null;
  const isLow = mood <= 2;
  const isHi  = mood >= 4;

  // Track geometry
  const TRACK_H   = 10;
  const THUMB_D   = 44;
  const fillPct   = ((mood - 1) / 4) * 100;

  return (
    <div>
      <style>{`
        .ci-range-v2 {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: ${TRACK_H}px;
          background: transparent;
          cursor: pointer;
          outline: none;
          position: relative;
          z-index: 2;
        }
        .ci-range-v2:disabled { cursor: default; }
        /* Hide native thumb — we render our own orb */
        .ci-range-v2::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${THUMB_D}px;
          height: ${THUMB_D}px;
          border-radius: 50%;
          background: transparent;
          border: none;
          box-shadow: none;
          margin-top: ${-(THUMB_D - TRACK_H) / 2}px;
        }
        .ci-range-v2::-moz-range-thumb {
          width: ${THUMB_D}px;
          height: ${THUMB_D}px;
          border-radius: 50%;
          background: transparent;
          border: none;
          box-shadow: none;
        }
        /* Hide native track */
        .ci-range-v2::-webkit-slider-runnable-track { background: transparent; height: ${TRACK_H}px; }
        .ci-range-v2::-moz-range-track              { background: transparent; height: ${TRACK_H}px; }
        .ci-range-v2::-moz-range-progress           { background: transparent; }
      `}</style>

      {/* ── Slider assembly ─────────────────────────────────────── */}
      <div style={{ position: "relative", paddingTop: THUMB_D / 2, paddingBottom: THUMB_D / 2 }}>

        {/* Track container — sits behind everything */}
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          background: "rgba(255,255,255,0.07)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.45)",
          overflow: "hidden",
          zIndex: 0,
        }}>
          {/* Filled gradient */}
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: `${fillPct}%`,
            background: "linear-gradient(90deg, #8B5E2A, #C9A84C)",
            borderRadius: TRACK_H / 2,
            transition: "width 0.15s ease",
            boxShadow: "0 0 10px rgba(201,168,76,0.35)",
          }} />
        </div>

        {/* Tick dots — 5 positions along the track */}
        {[0, 25, 50, 75, 100].map((pct, i) => {
          const active = i + 1 <= mood;
          return (
            <div key={pct} style={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: active ? "rgba(201,168,76,0.80)" : "rgba(255,255,255,0.18)",
              transition: "background 0.15s ease",
              zIndex: 1,
              pointerEvents: "none",
            }} />
          );
        })}

        {/* Glowing orb thumb — absolutely positioned, pointer-events none */}
        <div style={{
          position: "absolute",
          left: `${fillPct}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: THUMB_D,
          height: THUMB_D,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 35%, #E8C96A, #C9A84C 55%, #8B5E2A)",
          boxShadow: "0 0 0 3px rgba(201,168,76,0.20), 0 0 18px 6px rgba(201,168,76,0.40), 0 4px 12px rgba(0,0,0,0.50)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.15s ease",
          zIndex: 3,
          pointerEvents: "none",
        }}>
          <span style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#1a1206",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}>
            {mood}
          </span>
        </div>

        {/* Invisible native range — sits on top for interaction */}
        <input
          type="range" min={1} max={5} step={1}
          value={mood} disabled={confirmed}
          onChange={(e) => setMood(+e.target.value)}
          onMouseUp={confirm} onTouchEnd={confirm}
          className="ci-range-v2"
          style={{ display: "block", opacity: 0, position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%", margin: 0 }}
        />
      </div>

      {/* ── Side labels + dynamic status ─────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>Rough</span>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: isLow ? "rgba(220,120,80,0.85)" : isHi ? "rgba(180,220,140,0.85)" : "rgba(255,255,255,0.50)",
          transition: "color 0.3s ease",
          textAlign: "center",
          flex: 1,
          padding: "0 8px",
        }}>
          {moodLabel(mood)}
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>Strong</span>
      </div>

      <AnimatePresence>
        {resp && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p
              className="text-[14px] font-semibold leading-snug"
              style={{
                color: isLow ? "oklch(0.78 0.12 25)" : isHi ? "oklch(0.78 0.14 150)" : "rgba(255,255,255,0.88)",
              }}
            >
              {resp.message}
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {resp.buttons.map(({ label, to }) => (
                <Link
                  key={label} to={to}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: isLow ? "oklch(0.28 0.10 25 / 0.45)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isLow ? "oklch(0.50 0.18 25 / 0.35)" : isHi ? "oklch(0.55 0.16 150 / 0.35)" : "rgba(255,255,255,0.1)"}`,
                    color:  isLow ? "oklch(0.80 0.14 25)" : isHi ? "oklch(0.75 0.18 150)" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    let needsOnboarding = false;
    try {
      const saved = JSON.parse(localStorage.getItem("stopamine.v2") ?? "null");
      needsOnboarding = !saved?.onboarding || !saved?.addictions?.length;
    } catch { needsOnboarding = true; }
    if (needsOnboarding) throw redirect({ to: "/onboarding" });
  },
  component: Dashboard,
});

// ─── Floating emoji background ───────────────────────────────────────────────
// Safe, trigger-free recovery emoji per addiction category.
// Matched by lowercase addiction id (name.toLowerCase().replace(/\s+/g, "-")).
// Falls back to ✨ for any custom/unrecognised habit.
const RECOVERY_EMOJI: Record<string, string> = {
  "porn":            "✨",
  "social-media":    "🎯",
  "sugar":           "💪",
  "alcohol":         "🧠",
  "nicotine":        "🌬️",
  "cannabis":        "🌅",
  "gambling":        "📈",
  "gaming":          "🌍",
  "procrastination": "🔥",
};

function recoveryEmoji(id: string): string {
  return RECOVERY_EMOJI[id] ?? "✨";
}

const FLOAT_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  size:  18 + (i * 9) % 30,
  x:     (i * 41 + 7) % 100,
  y:     (i * 59 + 13) % 130,
  dur:   18 + (i * 4) % 16,
  delay: -(i * 3.1)   % 22,
  drift: (i % 2 === 0 ? 1 : -1) * (6 + (i * 7) % 18),
}));

function FloatingHabitBg({ emoji }: { emoji: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
      <style>{`
        @keyframes habit-float {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-110vh) translateX(var(--hdrift)) rotate(var(--hrot)); opacity: 0; }
        }
      `}</style>
      {FLOAT_PARTICLES.map((p, i) => (
        <span
          key={i}
          style={{
            position:  "fixed",
            left:      `${p.x}%`,
            top:       `${p.y}%`,
            fontSize:  `${p.size}px`,
            opacity:   0,
            "--hdrift": `${p.drift}px`,
            "--hrot":   `${p.drift * 1.2}deg`,
            animation: `habit-float ${p.dur}s ${p.delay}s linear infinite`,
            filter:    "opacity(0.09)",
          } as React.CSSProperties}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Thin separator ───────────────────────────────────────────────────────────
function Hairline() {
  return (
    <motion.div
      className="mx-6"
      style={{ height: 1, background: "rgba(255,255,255,0.055)" }}
      initial="hidden" whileInView="show" viewport={vp} variants={fade}
    />
  );
}


// ─── Habit Switcher ───────────────────────────────────────────────────────────
function HabitSwitcher({
  addictions, activeId, isPremium, onSwitch, onAdd,
}: {
  addictions: Addiction[];
  activeId: string;
  isPremium: boolean;
  onSwitch: (id: string) => void;
  onAdd: () => void;
}) {
  const pills = (
    <div className="flex justify-center items-center gap-2 flex-wrap">
      {addictions.map((a) => {
        const isActive = a.id === activeId;
        return (
          <button
            key={a.id}
            onClick={() => onSwitch(a.id)}
            style={{
              padding: "5px 16px", borderRadius: 20,
              fontSize: 12, fontWeight: isActive ? 700 : 500,
              background: isActive ? "rgba(196,135,58,0.14)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isActive ? "rgba(196,135,58,0.38)" : "rgba(255,255,255,0.08)"}`,
              color: isActive ? "#C4873A" : "rgba(255,255,255,0.35)",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
          >
            {a.emoji} {a.name}
          </button>
        );
      })}

      {/* + button — PRO gate */}
      <button
        onClick={onAdd}
        style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.35)",
          fontSize: 16, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          transition: "all 0.2s ease",
        }}
        aria-label="Add habit"
      >
        +
      </button>
    </div>
  );

  if (addictions.length <= 1) {
    const a = addictions[0];
    if (!a) return null;
    // Single habit: show name label + add button
    return (
      <div className="flex justify-center items-center gap-2">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.28)" }}>
          {a.emoji} {a.name}
        </span>
        <button
          onClick={onAdd}
          style={{
            width: 22, height: 22, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.30)",
            fontSize: 14, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
          aria-label="Add habit"
        >
          +
        </button>
      </div>
    );
  }

  return pills;
}

// ─── Badge Carousel ───────────────────────────────────────────────────────────
function BadgeCarousel({ day, addictionName, addictionId }: { day: number; addictionName: string; addictionId: string }) {
  const earnedCount = BADGES.filter((b) => day >= b.day).length;
  const [idx, setIdx]             = useState(() => Math.max(0, earnedCount - 1));
  const touchStartX               = useRef(0);
  const touchStartY               = useRef(0);
  const [dragging, setDragging]   = useState(false);
  const [dragDelta, setDragDelta] = useState(0);

  // Snap to latest earned badge whenever the active habit changes
  useEffect(() => {
    setIdx(Math.max(0, BADGES.filter((b) => day >= b.day).length - 1));
  }, [addictionId]);

  const go = (next: number) => setIdx(Math.max(0, Math.min(BADGES.length - 1, next)));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
    setDragDelta(0);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    setDragDelta(dx);
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (dragDelta < -44) go(idx + 1);
    else if (dragDelta > 44) go(idx - 1);
    setDragDelta(0);
  };

  const b       = BADGES[idx];
  const isEarned = day >= b.day;

  return (
    <div className="select-none text-center">

      {/* ── Swipeable badge area ── */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          style={{ display: "flex" }}
          animate={{ x: `calc(-${idx * 100}% + ${dragging ? dragDelta : 0}px)` }}
          transition={dragging ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300, mass: 0.85 }}
        >
          {BADGES.map((b, i) => {
            const earned = day >= b.day;
            return (
              <div key={b.name} style={{ minWidth: "100%", width: "100%" }} className="relative pt-8 pb-2 flex flex-col items-center">
                {/* Ambient glow */}
                {earned && (
                  <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ width: 280, height: 280, borderRadius: "50%",
                      background: `radial-gradient(circle, ${b.glow.replace("0.40","0.12")} 0%, transparent 68%)`,
                      filter: "blur(40px)" }} />
                )}

                {/* Eyebrow */}
                <p className="text-[9px] font-bold tracking-[0.45em] uppercase mb-3"
                   style={{ color: earned ? `${b.color}70` : "rgba(255,255,255,0.15)" }}>
                  {earned
                    ? i === earnedCount - 1 ? "Your rank" : "Earned"
                    : i === earnedCount     ? "Next badge" : "Coming up"}
                </p>

                {/* Badge symbol with lock overlay */}
                <div className="relative inline-flex items-center justify-center">
                  <span className="font-bold leading-none select-none"
                    style={{
                      fontSize: "clamp(5rem, 22vw, 7.5rem)",
                      color: earned ? b.color : "rgba(255,255,255,0.06)",
                      filter: earned ? "none" : "blur(9px)",
                      textShadow: earned ? `0 0 55px ${b.glow}, 0 0 110px ${b.glow.replace("0.40","0.2")}` : "none",
                      transition: "color 0.35s, filter 0.35s",
                      userSelect: "none",
                    }}>
                    {b.symbol}
                  </span>
                  {!earned && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[10px] font-bold tracking-[0.25em] uppercase"
                            style={{ color: "rgba(255,255,255,0.38)" }}>Unlocks at</span>
                      <span className="text-[20px] font-bold tabular-nums"
                            style={{ color: "rgba(255,255,255,0.55)" }}>Day {b.day}</span>
                    </div>
                  )}
                </div>

                {/* Badge name */}
                <p className="mt-3 font-bold leading-tight"
                   style={{ fontSize: "clamp(1.5rem, 6.5vw, 2rem)",
                            color: earned ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.18)" }}>
                  {b.name}
                </p>
                {earned && i < earnedCount - 1 && (
                  <p className="mt-1 text-[10px] font-semibold tracking-wider" style={{ color: `${b.color}55` }}>
                    ✓ Day {b.day}
                  </p>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Fixed day display — outside the swipe area ── */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="h-px w-8" style={{ background: "rgba(196,135,58,0.25)" }} />
        <span className="text-[13px] font-bold tracking-[0.3em] uppercase tabular-nums"
              style={{ color: "rgba(255,255,255,0.5)" }}>
          Day {day}
        </span>
        <div className="h-px w-8" style={{ background: "rgba(196,135,58,0.25)" }} />
      </div>

      {/* ── Dots ── */}
      <div className="flex justify-center gap-1.5 pt-4 pb-2">
        {BADGES.map((_, i) => {
          const earned = day >= BADGES[i].day;
          return (
            <button key={i} onClick={() => go(i)}
              style={{
                width: i === idx ? 16 : 4, height: 4, borderRadius: 2,
                background: i === idx ? BADGES[i].color : earned ? `${BADGES[i].color}45` : "rgba(255,255,255,0.12)",
                transition: "all 0.25s ease", border: "none", padding: 0, cursor: "pointer",
              }} />
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  const [state, update] = useAppState();
  const navigate        = useNavigate();
  const [showRelapse,  setShowRelapse]  = useState(false);
  const [rewardMsg,    setRewardMsg]    = useState<string | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [reEntryDays,  setReEntryDays]  = useState(0);
  const [showAddHabit, setShowAddHabit] = useState(false);

  const active      = activeAddiction(state);
  const day         = active ? dayCount(active.startDate) : 1;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));
  const next        = nextMilestone(day);

  // Init RevenueCat and sync premium status on mount (native only)
  // On web, checkPremium() always returns false — don't let it override localStorage
  useEffect(() => {
    async function syncPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      await initPurchases(session?.user?.id);
      if (typeof window !== "undefined" && !(window as any).Capacitor?.isNativePlatform?.()) return;
      const isPremium = await checkPremium();
      if (isPremium !== state.isPremium) {
        update({ isPremium });
      }
    }
    syncPremium();
  }, []);

  useEffect(() => {
    if (!state.onboarding) return;
    const inactive = inactivityDays(state.lastLoginAt);
    if (inactive >= 30) setReEntryDays(inactive);
    const today = new Date().toISOString().slice(0, 10);
    update((s) => {
      const waterToday = s.lastTreeWaterDate !== today && s.addictions.length > 0;
      return {
        lastLoginAt:       Date.now(),
        loginHistory:      [...(s.loginHistory ?? []).slice(-89), Date.now()],
        ...(waterToday ? {
          treeXP:            s.treeXP + s.addictions.length * 10,
          lastTreeWaterDate: today,
        } : {}),
      };
    });
  }, [state.onboarding]);

  useEffect(() => {
    if (!state.onboarding?.identity) return;
    if (Date.now() - (state.lastIdentityShown ?? 0) > 7 * 86400000) setShowIdentity(true);
  }, [state.onboarding, state.lastIdentityShown]);

  const relapses   = [...state.relapses].sort((a, b) => a.ts - b.ts);
  const points     = [active?.startDate ?? Date.now(), ...relapses.map((r) => r.ts), Date.now()];
  const gaps       = points.slice(1).map((t, i) => (t - points[i]) / 86400000);
  const bestStreak = Math.max(day, ...gaps.map((g) => Math.floor(g)));
  const streakLine =
    day >= bestStreak && relapses.length > 0
      ? "This is your longest streak yet."
      : "Every day you don't give in, your brain rewires itself.";

  return (
    <PageShell>
      <FloatingHabitBg emoji={recoveryEmoji(active?.id ?? "")} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <motion.header
        className="px-6 pt-12 pb-3 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.45em] uppercase"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Stopamine
        </span>

        <div className="flex items-center gap-3">

          <motion.div whileHover={{ opacity: 0.7 }} whileTap={{ scale: 0.96 }} transition={{ duration: 0.15 }}>
            <Link
              to="/challenges"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{
                color: "#C4873A",
                background: "rgba(196,135,58,0.07)",
                border: "1px solid rgba(196,135,58,0.2)",
              }}
            >
              <Coins className="h-3 w-3" />
              {state.points}
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* ── HABIT SWITCHER + BADGE CAROUSEL ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="px-6 pb-3 pt-1">
          <HabitSwitcher
            addictions={state.addictions}
            activeId={state.activeAddictionId}
            isPremium={state.isPremium}
            onSwitch={(id) => update({ activeAddictionId: id })}
            onAdd={() => setShowAddHabit(true)}
          />
        </div>
        <BadgeCarousel day={day} addictionName={active?.name ?? "Recovery"} addictionId={active?.id ?? ""} />
      </motion.div>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <motion.div
        className="mx-6 mb-7 grid grid-cols-3"
        style={{
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 16,
          overflow: "hidden",
        }}
        initial="hidden"
        animate="show"
        variants={seq(0.45, 0.08)}
      >
        {[
          { value: `${recoveryPct}%`, sub: "Recovery",    gold: true  },
          { value: `${bestStreak}d`,  sub: "Best streak", gold: false },
          { value: state.relapses.length, sub: "Relapses", gold: false },
        ].map(({ value, sub, gold }, i) => (
          <motion.div
            key={sub}
            className="flex flex-col items-center justify-center py-5"
            style={{
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.055)" : undefined,
            }}
            variants={up}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="text-[28px] font-bold tabular-nums leading-none"
              style={{ color: gold ? "#C4873A" : "rgba(255,255,255,0.88)" }}
            >
              {value}
            </span>
            <span
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mt-2"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {sub}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <Hairline />

      {/* ── TODAY'S FOCUS ─────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-7 mb-6"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <SectionTitle>Today's Focus</SectionTitle>
        <div style={{ marginTop: 12 }} />
        <div className="flex gap-5">
          <div
            className="w-px shrink-0"
            style={{
              background: "linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0))",
              minHeight: 48,
            }}
          />
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: "#f0ece4", margin: 0 }}>
            {todaysFocusText()}
          </p>
        </div>
      </motion.section>

      <Hairline />

      {/* ── DAILY CHECK-IN ────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-7 mb-6"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <SectionTitle>Daily Check-in</SectionTitle>
        <p className="text-[24px] font-semibold leading-tight mb-6"
           style={{ letterSpacing: "-0.02em" }}>
          How are you<br />holding up today?
        </p>
        <CheckIn onReward={setRewardMsg} />
      </motion.section>

      <Hairline />

      {/* ── MOTIVATION ────────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-6 mb-5"
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-16px" }} variants={fade}
      >
        <p
          className="text-[17px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.36)", fontStyle: "italic" }}
        >
          You started this for{" "}
          <em
            className="not-italic font-semibold"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
          </em>
          . That person is still watching.
        </p>
      </motion.section>

      {/* ── NEXT MILESTONE ────────────────────────────────────── */}
      {next && (
        <motion.section
          className="mx-6 mb-6"
          initial="hidden" whileInView="show" viewport={vp} variants={up}
        >
          <div
            className="flex items-center justify-between px-5 py-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.055)",
            }}
          >
            <div>
              <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-2"
                 style={{ color: "rgba(255,255,255,0.25)" }}>
                Next milestone
              </p>
              <p className="text-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                Day {next.day} — {next.benefit}
              </p>
            </div>
            <div className="text-right ml-4 shrink-0">
              <p className="text-[28px] font-bold tabular-nums leading-none" style={{ color: "#C4873A" }}>
                {next.daysAway}
              </p>
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-1"
                 style={{ color: "rgba(255,255,255,0.25)" }}>
                days away
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── EMERGENCY ─────────────────────────────────────────── */}
      <motion.section
        className="mx-6 mb-3"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <motion.div
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.987 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ borderRadius: 18, overflow: "hidden" }}
        >
          <Link
            to="/tools/sos"
            className="flex items-center justify-between px-6 py-6"
            style={{
              background: "linear-gradient(135deg, oklch(0.17 0.055 20), oklch(0.13 0.04 20))",
              border: "1px solid oklch(0.32 0.12 20 / 0.45)",
            }}
          >
            <div>
              <p
                className="text-[9px] font-bold tracking-[0.38em] uppercase mb-2"
                style={{ color: "oklch(0.62 0.14 20 / 0.75)" }}
              >
                Emergency
              </p>
              <p className="text-[18px] font-semibold leading-tight" style={{ color: "oklch(0.87 0.06 20)" }}>
                Feeling an urge<br />right now?
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: "oklch(0.55 0.08 20)" }}>
                Immediate support available
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 ml-4"
              style={{ color: "oklch(0.50 0.12 20)" }}
            />
          </Link>
        </motion.div>
      </motion.section>

      {/* ── LOG RELAPSE ───────────────────────────────────────── */}
      <motion.section
        className="px-6 pb-10"
        initial="hidden" whileInView="show" viewport={vp} variants={fade}
      >
        <motion.button
          onClick={() => setShowRelapse(true)}
          className="w-full py-4 text-center text-[11px] font-medium tracking-wide"
          style={{ color: "rgba(255,255,255,0.2)" }}
          whileHover={{ color: "rgba(255,255,255,0.45)" }}
          transition={{ duration: 0.2 }}
        >
          I relapsed — log it honestly
        </motion.button>
      </motion.section>

      {/* ── MODALS ────────────────────────────────────────────── */}
      {showAddHabit && (
        <AddAddictionModal
          trackedIds={new Set(state.addictions.map((a) => a.id))}
          onClose={() => setShowAddHabit(false)}
          onAdd={(addiction) => {
            if (!state.isPremium) { triggerPaywall(); return; }
            update((s) => ({ addictions: [...s.addictions, addiction] }));
            setShowAddHabit(false);
          }}
        />
      )}
      {showRelapse  && (
        <RelapseModal onClose={() => setShowRelapse(false)} totalCleanDays={state.totalCleanDays} />
      )}
      {reEntryDays >= 30 && (
        <ReEntryScreen inactiveDays={reEntryDays} onDone={() => setReEntryDays(0)} />
      )}
      {showIdentity && state.onboarding?.identity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-6 pb-10">
          <motion.div
            className="rounded-3xl border border-primary/20 p-7 w-full max-w-sm space-y-5 text-center relative"
            style={{ background: "var(--card)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="absolute top-4 right-4"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "#C4873A" }}>
              You made a promise.
            </p>
            <p className="text-[22px] font-bold leading-snug">
              I am becoming someone who{" "}
              <span style={{ color: "#C4873A" }}>{state.onboarding.identity}</span>.
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              You're still becoming that person.
            </p>
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="w-full h-12 rounded-2xl text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              I'm still in.
            </button>
          </motion.div>
        </div>
      )}

      {/* ── REWARD TOAST ──────────────────────────────────────── */}
      <AnimatePresence>
        {rewardMsg && (
          <motion.div
            className="fixed bottom-24 z-50 rounded-full border border-primary/25 bg-card px-5 py-3 text-[13px] font-semibold shadow-xl"
            style={{ left: "50%", color: "#C4873A" }}
            initial={{ opacity: 0, y: 14, x: "-50%" }}
            animate={{ opacity: 1, y: 0,  x: "-50%" }}
            exit={{    opacity: 0, y: 6,   x: "-50%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {rewardMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </PageShell>
  );
}

import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { pageContainer, popUp, usePageAnimation } from "@/lib/pageAnimation";
import { useEffect, useRef, useState } from "react";
import { Coins, X, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type TFunction } from "i18next";
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays, loadState, type Addiction } from "@/lib/store";
import { BADGES, currentBadge, nextBadge, badgeSplit } from "@/lib/badges";
import { initPurchases, checkPremium } from "@/lib/purchases";
import { triggerPaywall } from "@/lib/paywall";
import { supabase } from "@/lib/supabase";
import { AddAddictionModal } from "@/components/AddAddictionModal";
import { RelapseModal } from "@/components/RelapseModal";
import { ReEntryScreen } from "@/components/ReEntryScreen";
import { ChangelogModal } from "@/components/ChangelogModal";
import { shouldShowChangelog } from "@/lib/changelog";

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

const questContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const questItem: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.86 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Data ────────────────────────────────────────────────────────────────────
const MILESTONES = [
  { day: 7,  key: "awaken"   },
  { day: 14, key: "clarity"  },
  { day: 30, key: "control"  },
  { day: 60, key: "strength" },
  { day: 90, key: "reset"    },
];

const MILESTONE_BENEFIT_KEY: Record<number, string> = {
  7:  "benefit_7",
  14: "benefit_14",
  30: "benefit_30",
  60: "benefit_60",
  90: "benefit_90",
};

function nextMilestone(day: number) {
  const m = MILESTONES.find((m) => m.day > day);
  if (!m) return null;
  return { ...m, benefitKey: MILESTONE_BENEFIT_KEY[m.day], daysAway: m.day - day };
}

// ─── Today's Focus ────────────────────────────────────────────────────────────
const DAILY_FOCUS_COUNT = 14;

function todaysFocusText(t: TFunction): string {
  const dayOfYear = Math.floor(Date.now() / 86_400_000);
  return t(`home.focus.${dayOfYear % DAILY_FOCUS_COUNT}`);
}

// ─── Daily check-in ───────────────────────────────────────────────────────────
const REWARDS = [
  { weight: 50, xp: 10,  messageKey: null },
  { weight: 25, xp: 50,  messageKey: "home.reward.bonus" },
  { weight: 15, xp: 20,  messageKey: "home.reward.rare", badge: true },
  { weight: 10, xp: 0,   messageKey: null },
];

function rollReward() {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const r of REWARDS) { cum += r.weight; if (roll < cum) return r; }
  return REWARDS[0];
}

type MoodResp = { message: string; buttons: { label: string; to: string }[] };

function moodResp(v: number, t: TFunction): MoodResp {
  if (v <= 2) return {
    message: t("home.mood.low.message"),
    buttons: [
      { label: t("home.mood.low.btn1"), to: "/tools/breath" },
      { label: t("home.mood.low.btn2"), to: "/tools/sos" },
    ],
  };
  if (v === 3) return {
    message: t("home.mood.mid.message"),
    buttons: [{ label: t("home.mood.mid.btn1"), to: "/progress" }],
  };
  return {
    message: t("home.mood.high.message"),
    buttons: [{ label: t("home.mood.high.btn1"), to: "/progress" }],
  };
}

function moodLabel(v: number, t: TFunction): string {
  if (v <= 2) return t("home.moodLabel.low");
  if (v <= 4) return t("home.moodLabel.mid");
  return t("home.moodLabel.high");
}

function CheckIn({ onReward }: { onReward: (msg: string) => void }) {
  const { t } = useTranslation();
  const [, update]  = useAppState();
  const [mood, setMood]           = useState(3);
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    const r = rollReward();
    if (r.xp > 0) update((s) => ({ points: s.points + r.xp, treeXP: s.treeXP + Math.floor(r.xp / 2) }));
    if (r.messageKey) { onReward(t(r.messageKey)); setTimeout(() => onReward(""), 3200); }
  };

  const resp  = confirmed ? moodResp(mood, t) : null;
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, gap: 8 }}>
        <span style={{ fontSize: 11, color: "#5a5040", flexShrink: 0 }}>Rough day</span>
        <div style={{ flex: 1, textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={mood}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#ffffff" }}
            >
              {([
                "Really struggling today",
                "Tough but pushing through",
                "Slightly challenged, staying focused",
                "Feeling steady and clear",
                "Feeling strong and in control",
              ] as const)[mood - 1]}
            </motion.span>
          </AnimatePresence>
        </div>
        <span style={{ fontSize: 11, color: "#5a5040", flexShrink: 0 }}>Great day</span>
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


// ─── Badge Medallion — tiny rank circle used in pills and settings ────────────
function BadgeMedallion({ day, size = 18 }: { day: number; size?: number }) {
  const badge = [...BADGES].reverse().find(b => day >= b.day) ?? BADGES[0];
  const glow  = badge.glow.replace(/[\d.]+\)$/, "");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 40% 35%, rgba(255,240,180,0.10) 0%, rgba(8,5,1,0.98) 65%)`,
      border: `1.5px solid ${badge.color}99`,
      boxShadow: `0 0 ${size / 2}px ${glow}0.55)`,
    }}>
      <span style={{
        fontSize: size * 0.48,
        lineHeight: 1,
        color: badge.color,
        filter: `drop-shadow(0 0 ${size / 5}px ${glow}0.9))`,
      }}>
        {badge.symbol}
      </span>
    </span>
  );
}

// ─── Quest Pill ───────────────────────────────────────────────────────────────
function QuestPill({
  addiction, isActive, onClick,
}: {
  addiction: Addiction; isActive: boolean; onClick: (id: string) => void;
}) {
  const bounceControls = useAnimation();

  const handleClick = async () => {
    onClick(addiction.id);
    await bounceControls.start({
      scale: [1, 0.84, 1.14, 1],
      transition: { duration: 0.4, times: [0, 0.2, 0.65, 1] },
    });
  };

  return (
    <motion.div variants={questItem}>
      <motion.button
        animate={bounceControls}
        whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
        whileTap={{ scale: 0.93 }}
        onClick={handleClick}
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6px 18px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: isActive ? 700 : 500,
          fontFamily: "DM Sans, sans-serif",
          cursor: "pointer",
          background: isActive
            ? "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(196,135,58,0.08) 100%)"
            : "rgba(255,255,255,0.05)",
          border: `1.5px solid ${isActive ? "rgba(201,168,76,0.52)" : "rgba(255,255,255,0.08)"}`,
          color: isActive ? "#C9A84C" : "rgba(255,255,255,0.35)",
          boxShadow: isActive
            ? "0 0 0 1px rgba(201,168,76,0.07), 0 0 18px rgba(201,168,76,0.32), 0 4px 22px rgba(201,168,76,0.16)"
            : "none",
          willChange: "transform",
        }}
      >
        {/* ── Diagonal shimmer sweep — active pill only ── */}
        {isActive && (
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: "inherit",
              background:
                "linear-gradient(108deg, transparent 28%, rgba(255,220,120,0.07) 44%, rgba(201,168,76,0.24) 50%, rgba(255,220,120,0.07) 56%, transparent 72%)",
            }}
            animate={{ x: ["-115%", "215%"] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
          />
        )}
        <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 5 }}>
          {addiction.emoji} {addiction.name}
          <BadgeMedallion day={dayCount(addiction.startDate)} size={16} />
        </span>
      </motion.button>
    </motion.div>
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
    <div
      style={{
        overflowX: "auto",
        overflowY: "visible",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        paddingLeft: 24,
        paddingRight: 160, // clears the fixed credits + settings chip
        paddingBottom: 4,
      }}
    >
      <motion.div
        className="flex items-center gap-2"
        style={{ width: "max-content" }}
        variants={questContainer}
        initial="hidden"
        animate="show"
      >
        {addictions.map((a) => (
          <QuestPill
            key={a.id}
            addiction={a}
            isActive={a.id === activeId}
            onClick={onSwitch}
          />
        ))}

        {/* + button — PRO gate */}
        <motion.div variants={questItem}>
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.12, y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.88 }}
            style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.35)",
              fontSize: 16, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
            aria-label="Add habit"
          >
            +
          </motion.button>
        </motion.div>
      </motion.div>
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

// ─── Premium badge symbol — unique per rank ────────────────────────────────────
// Shared particle positions (reused across all badges, colored per rank)
const BADGE_PARTICLES = [
  { x:  88,  y:   0,  size: 3, dur: 2.8, delay: 0.0, o: 0.80 },
  { x:  62,  y:  36,  size: 2, dur: 3.2, delay: 0.4, o: 0.60 },
  { x:  36,  y:  62,  size: 3, dur: 2.5, delay: 0.8, o: 0.70 },
  { x:   0,  y:  78,  size: 2, dur: 3.5, delay: 0.2, o: 0.55 },
  { x: -50,  y:  87,  size: 4, dur: 2.9, delay: 0.6, o: 0.85 },
  { x: -59,  y:  34,  size: 2, dur: 3.1, delay: 1.0, o: 0.60 },
  { x: -90,  y:   0,  size: 3, dur: 2.7, delay: 0.3, o: 0.70 },
  { x: -65,  y: -37,  size: 2, dur: 3.3, delay: 0.7, o: 0.55 },
  { x: -38,  y: -66,  size: 3, dur: 2.6, delay: 1.1, o: 0.75 },
  { x:   0,  y: -92,  size: 2, dur: 3.0, delay: 0.5, o: 0.60 },
  { x:  46,  y: -80,  size: 4, dur: 2.4, delay: 0.9, o: 0.80 },
  { x:  73,  y: -42,  size: 2, dur: 3.4, delay: 0.1, o: 0.55 },
];

// Per-rank visual config — controls how the badge looks and moves
const RANK_FX: Record<string, {
  glowScale: [number, number, number];
  glowDur: number;
  ringDur: number;
  ringRotate: number;
  ringDouble: boolean;
  pulseScale: [number, number, number, number, number];
  pulseDur: number;
  particleCount: number;
  particleSpread: number;
  symbolScale: number;  // compensates for Unicode chars that render smaller than their em-square
  symbolOffsetY: number; // px nudge for chars with uneven vertical font metrics
  symbolOffsetX: number; // px nudge for horizontal glyph offset
}> = {
  Spark:    { glowScale: [1, 1.30, 1], glowDur: 3.8, ringDur: 6.0,  ringRotate: 360,  ringDouble: false, pulseScale: [1, 1.04, 0.98, 1.02, 1], pulseDur: 1.4, particleCount: 12, particleSpread: 1.18, symbolScale: 1.7, symbolOffsetY: -10, symbolOffsetX: 0 },
  Riser:    { glowScale: [1, 1.20, 1], glowDur: 2.8, ringDur: 4.5,  ringRotate: 360,  ringDouble: false, pulseScale: [1, 1.06, 1.00, 1.03, 1], pulseDur: 1.1, particleCount: 8,  particleSpread: 1.10, symbolScale: 1.5, symbolOffsetY:  2 , symbolOffsetX:  0 },
  Awaken:   { glowScale: [1, 1.40, 1], glowDur: 4.2, ringDur: 8.0,  ringRotate: -360, ringDouble: true,  pulseScale: [1, 1.08, 0.96, 1.04, 1], pulseDur: 1.8, particleCount: 10, particleSpread: 1.22, symbolScale: 1.2, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Clarity:  { glowScale: [1, 1.25, 1], glowDur: 3.5, ringDur: 5.0,  ringRotate: 180,  ringDouble: false, pulseScale: [1, 1.03, 0.99, 1.01, 1], pulseDur: 2.2, particleCount: 8,  particleSpread: 1.08, symbolScale: 1.3, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Warrior:  { glowScale: [1, 1.35, 1], glowDur: 2.4, ringDur: 3.5,  ringRotate: 360,  ringDouble: true,  pulseScale: [1, 1.07, 0.95, 1.05, 1], pulseDur: 0.9, particleCount: 12, particleSpread: 1.25, symbolScale: 1.0, symbolOffsetY: -6 , symbolOffsetX:  0 },
  Ironmind: { glowScale: [1, 1.15, 1], glowDur: 5.0, ringDur: 9.0,  ringRotate: 360,  ringDouble: false, pulseScale: [1, 1.02, 0.99, 1.01, 1], pulseDur: 3.0, particleCount: 6,  particleSpread: 1.05, symbolScale: 1.0, symbolOffsetY: -6 , symbolOffsetX:  0 },
  Forge:    { glowScale: [1, 1.45, 1], glowDur: 2.0, ringDur: 3.0,  ringRotate: 360,  ringDouble: true,  pulseScale: [1, 1.09, 0.94, 1.06, 1], pulseDur: 0.8, particleCount: 12, particleSpread: 1.30, symbolScale: 1.3, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Titan:    { glowScale: [1, 1.20, 1], glowDur: 6.0, ringDur: 12.0, ringRotate: -360, ringDouble: true,  pulseScale: [1, 1.02, 0.98, 1.01, 1], pulseDur: 4.0, particleCount: 8,  particleSpread: 1.12, symbolScale: 0.6, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Gorilla:  { glowScale: [1, 1.38, 1], glowDur: 3.0, ringDur: 4.0,  ringRotate: 360,  ringDouble: false, pulseScale: [1, 1.08, 0.94, 1.06, 1], pulseDur: 1.0, particleCount: 10, particleSpread: 1.20, symbolScale: 1.2, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Apex:     { glowScale: [1, 1.50, 1], glowDur: 3.2, ringDur: 5.5,  ringRotate: 360,  ringDouble: true,  pulseScale: [1, 1.06, 0.96, 1.04, 1], pulseDur: 1.5, particleCount: 12, particleSpread: 1.28, symbolScale: 1.2, symbolOffsetY:  0 , symbolOffsetX:  0 },
  Legend:   { glowScale: [1, 1.60, 1], glowDur: 4.0, ringDur: 7.0,  ringRotate: 360,  ringDouble: true,  pulseScale: [1, 1.10, 0.92, 1.08, 1], pulseDur: 1.2, particleCount: 12, particleSpread: 1.35, symbolScale: 1.1, symbolOffsetY: -4 , symbolOffsetX:  0 },
};

function PremiumBadgeSymbol({ badge }: { badge: { name: string; symbol: string; color: string; glow: string } }) {
  const fx = RANK_FX[badge.name] ?? RANK_FX.Spark;
  const rgb = badge.glow; // e.g. "rgba(224,122,69,0.40)"
  const rgbBase = rgb.replace(/[\d.]+\)$/, ""); // "rgba(224,122,69,"
  const particles = BADGE_PARTICLES.slice(0, fx.particleCount);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 270, height: 270 }}>
      {/* Outer atmospheric glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${rgbBase}0.42) 0%, ${rgbBase}0.10) 52%, transparent 72%)` }}
        animate={{ scale: fx.glowScale, opacity: [0.4, 0.1, 0.4] }}
        transition={{ repeat: Infinity, duration: fx.glowDur, ease: "easeInOut" }}
      />

      {/* Primary ring */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "66%", height: "66%",
          border: `2px solid ${rgbBase}0.88)`,
          filter: "blur(2px)",
          boxShadow: `0 0 12px ${rgbBase}0.6), inset 0 0 8px ${rgbBase}0.25)`,
        }}
        animate={{ scale: [1, 1.1, 1], rotate: fx.ringRotate }}
        transition={{ repeat: Infinity, duration: fx.ringDur, ease: "linear" }}
      />

      {/* Second ring — only for double-ring ranks */}
      {fx.ringDouble && (
        <motion.div
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "84%", height: "84%",
            border: `1px solid ${rgbBase}0.30)`,
            filter: "blur(1px)",
          }}
          animate={{ scale: [1, 1.06, 1], rotate: -fx.ringRotate }}
          transition={{ repeat: Infinity, duration: fx.ringDur * 1.4, ease: "linear" }}
        />
      )}

      {/* Particle dust */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            background: badge.color,
            left: "50%", top: "50%",
            marginLeft: -(p.size / 2), marginTop: -(p.size / 2),
            boxShadow: `0 0 ${p.size * 2}px ${rgbBase}0.7)`,
          }}
          animate={{
            x: [p.x, p.x * fx.particleSpread, p.x],
            y: [p.y, p.y * fx.particleSpread, p.y],
            opacity: [p.o, p.o * 0.2, p.o],
          }}
          transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Core symbol — fixed-size centering wrapper eliminates glyph metric offsets */}
      <motion.span
        className="font-bold leading-none select-none"
        style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 160, height: 160,
          transformOrigin: "center center",
          marginTop: fx.symbolOffsetY,
          marginLeft: fx.symbolOffsetX,
        }}
        animate={{ scale: fx.pulseScale.map(s => s * fx.symbolScale) as [number,number,number,number,number] }}
        transition={{ repeat: Infinity, duration: fx.pulseDur, ease: "easeInOut" }}
      >
        <span
          style={{
            fontSize: "clamp(7rem, 30vw, 10rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            textAlign: "center" as const,
            background: `radial-gradient(circle at 40% 35%, #ffffff 0%, ${badge.color}cc 30%, ${badge.color} 65%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: [
              `drop-shadow(0 0 12px ${rgbBase}0.95))`,
              `drop-shadow(0 0 28px ${rgbBase}0.60))`,
              `drop-shadow(0 0 55px ${rgbBase}0.28))`,
            ].join(" "),
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          {badge.symbol}
        </span>
      </motion.span>
    </div>
  );
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
              <div key={b.name} style={{ minWidth: "100%", width: "100%" }} className="relative pt-3 pb-2 flex flex-col items-center">
                {/* Ambient glow */}
                {earned && (
                  <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ width: 380, height: 380, borderRadius: "50%",
                      background: `radial-gradient(circle, ${b.glow.replace("0.40","0.12")} 0%, transparent 68%)`,
                      filter: "blur(40px)" }} />
                )}

                {/* Eyebrow */}
                <p className="text-[10px] font-bold tracking-[0.45em] uppercase mb-3"
                   style={{ color: earned ? `${b.color}70` : "rgba(255,255,255,0.15)" }}>
                  {earned
                    ? i === earnedCount - 1 ? "Your rank" : "Earned"
                    : i === earnedCount     ? "Next badge" : "Coming up"}
                </p>

                {/* Badge symbol — premium animated for all earned ranks */}
                {earned ? (
                  <PremiumBadgeSymbol badge={b} />
                ) : (
                  <div className="relative flex items-center justify-center"
                    style={{ width: 270, height: 270 }}>
                    {/* Blurred symbol — same container as earned */}
                    <span className="font-bold leading-none select-none"
                      style={{
                        fontSize: "9rem",
                        color: "rgba(255,255,255,0.07)",
                        filter: "blur(10px)",
                        userSelect: "none",
                        position: "absolute",
                      }}>
                      {b.symbol}
                    </span>

                    {/* Frosted lock bar */}
                    <div style={{
                      position: "absolute",
                      left: "50%", top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 148,
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 14,
                      padding: "10px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      {/* Lock icon */}
                      <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                        <rect x="3" y="8" width="10" height="9" rx="2" fill="none"
                          stroke="rgba(255,255,255,0.40)" strokeWidth="1.4"/>
                        <path d="M5 8V5.5a3 3 0 0 1 6 0V8"
                          stroke="rgba(255,255,255,0.40)" strokeWidth="1.4" strokeLinecap="round"/>
                        <circle cx="8" cy="12.5" r="1.2" fill="rgba(255,255,255,0.35)"/>
                      </svg>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                        Day {b.day}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.20)",
                        letterSpacing: "0.05em" }}>
                        {b.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge name — glows in rank color when earned */}
                <p
                  className="mt-3 font-bold leading-tight"
                  style={{
                    fontSize: "clamp(2rem, 8vw, 2.8rem)",
                    color: earned ? "#ffffff" : "rgba(255,255,255,0.60)",
                    letterSpacing: "0.025em",
                    textShadow: earned ? [
                      "0 0 18px rgba(255,255,255,0.85)",
                      `0 0 36px ${b.glow.replace("0.40", "0.65")}`,
                      `0 0 65px ${b.glow.replace("0.40", "0.30")}`,
                    ].join(", ") : "none",
                  }}
                >
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
  const { t } = useTranslation();
  const [state, update] = useAppState();
  const animKey = usePageAnimation("/");
  const navigate        = useNavigate();
  const [showRelapse,    setShowRelapse]    = useState(false);
  const [rewardMsg,      setRewardMsg]      = useState<string | null>(null);
  const [showIdentity,   setShowIdentity]   = useState(false);
  const [reEntryDays,    setReEntryDays]    = useState(0);
  const [showAddHabit,   setShowAddHabit]   = useState(false);
  const [showChangelog,  setShowChangelog]  = useState(false);

  // ── Dev mode (triple-tap DAY counter) ───────────────────────────────────────
  const [devOpen, setDevOpen]   = useState(false);
  const devTapCount             = useRef(0);
  const devTapTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDevTap = () => {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 600);
    if (devTapCount.current >= 3) { devTapCount.current = 0; setDevOpen((v) => !v); }
  };

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
          treeXP:            s.treeXP + s.addictions.length * 30,
          lastTreeWaterDate: today,
        } : {}),
      };
    });
  }, [state.onboarding]);

  useEffect(() => {
    if (!state.onboarding?.identity) return;
    if (Date.now() - (state.lastIdentityShown ?? 0) > 7 * 86400000) setShowIdentity(true);
  }, [state.onboarding, state.lastIdentityShown]);

  // Show changelog once per version — only after onboarding is done
  useEffect(() => {
    if (!state.onboarding) return;
    if (shouldShowChangelog()) setShowChangelog(true);
  }, [state.onboarding]);

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
      <motion.div key={animKey} variants={pageContainer} initial="hidden" animate="show">

      {/* ── NAV spacer — logo is now a fixed pill in PageShell ── */}
      <div style={{ height: "2.75rem" }} />

      {/* ── HABIT SWITCHER + BADGE CAROUSEL ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="pb-1 pt-1">
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
          { value: `${recoveryPct}%`, sub: t("progress.stats.streak"),  gold: true, onTap: handleDevTap },
          { value: `${bestStreak}d`,  sub: t("progress.stats.best"),    gold: false },
          { value: state.relapses.length, sub: "Relapses",              gold: false },
        ].map(({ value, sub, gold, onTap }: { value: string | number; sub: string; gold: boolean; onTap?: () => void }, i) => (
          <motion.div
            key={sub}
            className="flex flex-col items-center justify-center py-5"
            style={{
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.055)" : undefined,
            }}
            variants={up}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
            transition={{ duration: 0.2 }}
            onClick={onTap}
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

      {/* ── DEV PANEL ─────────────────────────────────────────── */}
      {import.meta.env.DEV && devOpen && (
        <div style={{
          margin: "0 16px 16px",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,80,80,0.35)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#ff5555", textTransform: "uppercase" }}>
              🛠 Dev Mode
            </span>
            <button onClick={() => setDevOpen(false)} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Access</p>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {(["FREE", "PRO"] as const).map((tier) => {
              const isActive = tier === "PRO" ? state.isPremium : !state.isPremium;
              return (
                <button key={tier} onClick={() => update({ isPremium: tier === "PRO" })}
                  style={{
                    fontSize: 11, padding: "5px 16px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid rgba(201,168,76,0.55)" : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                  {tier}
                </button>
              );
            })}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginLeft: 4 }}>
              {state.isPremium ? "Multiple addictions unlocked" : "1 addiction max"}
            </span>
          </div>
        </div>
      )}

      <Hairline />

      {/* ── TODAY'S FOCUS ─────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-7 mb-6"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <SectionTitle>{t("home.sections.todaysFocus")}</SectionTitle>
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
            {todaysFocusText(t)}
          </p>
        </div>
      </motion.section>

      <Hairline />

      {/* ── DAILY CHECK-IN ────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-7 mb-6"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <SectionTitle>{t("home.checkin.title")}</SectionTitle>
        <p className="text-[24px] font-semibold leading-tight mb-6"
           style={{ letterSpacing: "-0.02em" }}>
          {t("home.checkin.subtitle")}
        </p>
        <CheckIn onReward={setRewardMsg} />
      </motion.section>

      <Hairline />

      {/* ── MOTIVATION ────────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-6 mb-5"
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-16px" }} variants={fade}
      >
        <div style={{
          background: "rgba(201,168,76,0.05)",
          borderLeft: "2px solid #C9A84C",
          borderRadius: "0 12px 12px 0",
          padding: "12px 16px",
        }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>You started this for </span>
            <span style={{ color: "#C9A84C", fontWeight: 700 }}>
              {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>. That person is still watching.</span>
          </p>
        </div>
      </motion.section>

      {/* ── EMERGENCY — acute urges take priority ─────────────── */}
      <style>{`
        @keyframes sos-border-breathe {
          0%, 100% { box-shadow: 0 0 0 0 oklch(0.50 0.18 20 / 0), 0 0 18px 4px oklch(0.45 0.20 20 / 0.18); }
          50%       { box-shadow: 0 0 0 3px oklch(0.50 0.18 20 / 0.12), 0 0 32px 10px oklch(0.45 0.20 20 / 0.32); }
        }
        .sos-breathe-border { animation: sos-border-breathe 3.2s ease-in-out infinite; }
      `}</style>
      <motion.section
        className="mx-6 mb-4"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <motion.div
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.987 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="sos-breathe-border"
          style={{ borderRadius: 18, overflow: "hidden" }}
        >
          <Link
            to="/tools/sos"
            className="flex items-center justify-between px-6 py-5"
            style={{
              background: "linear-gradient(135deg, oklch(0.17 0.055 20), oklch(0.13 0.04 20))",
              border: "1px solid oklch(0.36 0.14 20 / 0.55)",
            }}
          >
            <div>
              <p
                className="text-[9px] font-bold tracking-[0.38em] uppercase mb-1.5"
                style={{ color: "oklch(0.62 0.14 20 / 0.75)" }}
              >
                {t("home.sections.emergency")}
              </p>
              <p className="text-[18px] font-semibold leading-tight" style={{ color: "oklch(0.87 0.06 20)" }}>
                {t("home.emergency.subtitle")}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "oklch(0.52 0.08 20)" }}>
                {t("home.emergency.cta")}
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 ml-4"
              style={{ color: "oklch(0.52 0.14 20)" }}
            />
          </Link>
        </motion.div>
      </motion.section>

      {/* ── NEXT MILESTONE ────────────────────────────────────── */}
      {next && (
        <motion.section
          className="mx-6 mb-4"
          initial="hidden" whileInView="show" viewport={vp} variants={up}
        >
          <div
            className="flex items-center justify-between px-5 py-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.055)",
            }}
          >
            <div>
              <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-1"
                 style={{ color: "rgba(255,255,255,0.25)" }}>
                {t("home.sections.nextMilestone")}
              </p>
              <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                {t("common.day")} {next.day} — {t(`home.milestone.${next.benefitKey}`)}
              </p>
            </div>
            <div className="text-right ml-4 shrink-0">
              <p className="text-[26px] font-bold tabular-nums leading-none" style={{ color: "#C4873A" }}>
                {next.daysAway}
              </p>
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-0.5"
                 style={{ color: "rgba(255,255,255,0.25)" }}>
                {t("common.days")}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── LOG RELAPSE ───────────────────────────────────────── */}
      <motion.section
        className="px-6 pb-10"
        initial="hidden" whileInView="show" viewport={vp} variants={fade}
      >
        <motion.button
          onClick={() => setShowRelapse(true)}
          className="w-full py-3 text-center text-[12px] font-medium tracking-[0.04em] rounded-xl"
          style={{
            color: "rgba(255,255,255,0.30)",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
          whileHover={{
            color: "rgba(255,255,255,0.55)",
            borderColor: "rgba(255,255,255,0.16)",
          }}
          transition={{ duration: 0.2 }}
        >
          {t("home.relapse")}
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

      {/* ── CHANGELOG ─────────────────────────────────────────── */}
      <ChangelogModal open={showChangelog} onClose={() => setShowChangelog(false)} />
      </motion.div>

    </PageShell>
  );
}

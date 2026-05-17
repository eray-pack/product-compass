import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coins, X, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays, loadState } from "@/lib/store";
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
const FOCUS_PREFIX = "stopamine.focus.";

function TodaysFocus({ name, addiction, costs, triggers, day }: {
  name: string; addiction: string; costs: string[]; triggers: string[]; day: number;
}) {
  const [text, setText]       = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const displayName = name.trim() || "friend";
    const key    = FOCUS_PREFIX + new Date().toISOString().slice(0, 10) + "." + displayName.toLowerCase();
    const cached = localStorage.getItem(key);
    if (cached) { setText(cached); setLoading(false); return; }

    let cancelled = false;
    const phase =
      day <= 7  ? "surviving the first week — cravings are at their peak, every hour counts" :
      day <= 30 ? "building momentum — the brain is starting to rewire, patterns are forming" :
      day <= 60 ? "identity change — becoming someone new, not just quitting" :
      day <= 90 ? "finishing strong — the 90-day reset is in sight, this is where most people slip" :
                  "maintaining — past 90 days, locking in the new identity for life";

    const prompt =
      `Write a Today's Focus message for ${displayName}. ` +
      `They are on day ${day} of quitting ${addiction}. ` +
      `It has cost them: ${costs.join(", ") || "their wellbeing"}. ` +
      `Main triggers: ${triggers.join(", ") || "various situations"}. ` +
      `Phase: ${phase}. ` +
      `Write exactly 1 sentence. Max 20 words. Start with "Hey ${displayName},". No comma splices.`;

    fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: { text?: string }) => {
        if (cancelled || !d.text) return;
        Object.keys(localStorage)
          .filter((k) => k.startsWith(FOCUS_PREFIX) && k !== key)
          .forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(key, d.text);
        setText(d.text);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex gap-5">
      {/* Left accent bar */}
      <div
        className="w-px shrink-0"
        style={{
          background: "linear-gradient(to bottom, #C4873A, rgba(196,135,58,0))",
          minHeight: 48,
        }}
      />
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="space-y-3 pt-1">
            <div className="h-3.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.05)", width: "88%" }} />
            <div className="h-3.5 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.05)", width: "68%" }} />
          </div>
        ) : text ? (
          <p className="text-[15px] font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            {text}
          </p>
        ) : (
          <p className="text-[13px] italic" style={{ color: "rgba(255,255,255,0.25)" }}>
            Focus unavailable.
          </p>
        )}
      </div>
    </div>
  );
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

  return (
    <div>
      <style>{`
        .ci-range{--tc:#C4873A}
        .ci-range::-webkit-slider-runnable-track{height:1px;background:rgba(255,255,255,0.1);border-radius:1px}
        .ci-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--tc);box-shadow:0 0 10px 2px rgba(196,135,58,0.4);margin-top:-7.5px;transition:box-shadow 0.15s}
        .ci-range:not(:disabled)::-webkit-slider-thumb:active{box-shadow:0 0 18px 4px rgba(196,135,58,0.55)}
        .ci-range::-moz-range-track{height:1px;background:rgba(255,255,255,0.1);border-radius:1px}
        .ci-range::-moz-range-thumb{width:16px;height:16px;border:none;border-radius:50%;background:var(--tc);box-shadow:0 0 10px 2px rgba(196,135,58,0.4)}
      `}</style>

      {/* Value indicator */}
      <div className="relative pt-5 pb-1">
        <div
          className="absolute top-0 pointer-events-none"
          style={{ left: `calc(${((mood - 1) / 4) * 100}%)`, transform: "translateX(-50%)", transition: "left 0.1s ease" }}
        >
          <span className="text-[11px] font-bold tabular-nums" style={{ color: "#C4873A" }}>{mood}</span>
        </div>
        <input
          type="range" min={1} max={5} step={1}
          value={mood} disabled={confirmed}
          onChange={(e) => setMood(+e.target.value)}
          onMouseUp={confirm} onTouchEnd={confirm}
          className="ci-range w-full appearance-none bg-transparent cursor-pointer disabled:cursor-default"
          style={{ height: 20 }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] tracking-wide" style={{ color: "rgba(255,255,255,0.22)" }}>Rough</span>
          <span className="text-[10px] tracking-wide" style={{ color: "rgba(255,255,255,0.22)" }}>Strong</span>
        </div>
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


// ─── Dashboard ────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    const fromStorage = loadState();
    console.log("[Stopamine] Subscription state:", {
      "state.isPremium (reactive)": state.isPremium,
      "loadState().isPremium (localStorage direct)": fromStorage.isPremium,
    });
  }, [state.isPremium]);

  useEffect(() => {
    if (!state.onboarding) return;
    const inactive = inactivityDays(state.lastLoginAt);
    if (inactive >= 30) setReEntryDays(inactive);
    update((s) => ({
      lastLoginAt:  Date.now(),
      loginHistory: [...(s.loginHistory ?? []).slice(-89), Date.now()],
    }));
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
          <motion.button
            onClick={() => setShowAddHabit(true)}
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className="h-7 w-7 rounded-full grid place-items-center"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
          >
            <Plus className="h-3 w-3" />
          </motion.button>

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

      {/* ── HERO ─────────────────────────────────────────────── */}
      <motion.section
        className="relative px-6 pt-8 pb-5 text-center overflow-hidden"
        initial="hidden"
        animate="show"
        variants={seq(0.1, 0.1)}
      >
        {/* Ambient light — behind the number */}
        <div
          aria-hidden
          className="pointer-events-none absolute ambient-drift"
          style={{
            top: "0%", left: "50%",
            width: 340, height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.09) 0%, transparent 68%)",
            filter: "blur(50px)",
          }}
        />

        {/* Eyebrow */}
        <motion.p
          className="text-[9px] font-bold tracking-[0.5em] uppercase"
          style={{ color: "rgba(196,135,58,0.45)" }}
          variants={fade}
        >
          Day
        </motion.p>

        {/* The number — singular focus */}
        <motion.div
          className="relative inline-block"
          variants={{
            hidden: { opacity: 0, y: 30, scale: 0.95 },
            show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 1.1, ease: EASE } },
          }}
        >
          <span
            className="day-monument font-bold leading-none tabular-nums select-none"
            style={{ fontSize: "clamp(6rem, 28vw, 9.5rem)" }}
          >
            {day}
          </span>
        </motion.div>

        {/* Habit context */}
        <motion.div
          className="mt-3 flex items-center justify-center gap-3"
          variants={up}
        >
          <div className="h-px w-8" style={{ background: "rgba(196,135,58,0.25)" }} />
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {active?.name ?? "Recovery"}
          </span>
          <div className="h-px w-8" style={{ background: "rgba(196,135,58,0.25)" }} />
        </motion.div>

        {/* Streak line */}
        <motion.p
          className="mt-3 text-[12px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
          variants={fade}
        >
          {streakLine}
        </motion.p>
      </motion.section>

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
              className="text-[24px] font-bold tabular-nums leading-none"
              style={{ color: gold ? "#C4873A" : "rgba(255,255,255,0.88)" }}
            >
              {value}
            </span>
            <span
              className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-1.5"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {sub}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <Hairline />

      {/* ── TODAY'S FOCUS ─────────────────────────────────────── */}
      {state.onboarding && active && (
        <motion.section
          className="px-6 mt-7 mb-6"
          initial="hidden" whileInView="show" viewport={vp} variants={up}
        >
          <SectionTitle>Today's Focus</SectionTitle>
          <TodaysFocus
            name={state.onboarding.name}
            addiction={active.name}
            costs={state.onboarding.costs}
            triggers={state.onboarding.triggers}
            day={day}
          />
        </motion.section>
      )}

      <Hairline />

      {/* ── DAILY CHECK-IN ────────────────────────────────────── */}
      <motion.section
        className="px-6 mt-7 mb-6"
        initial="hidden" whileInView="show" viewport={vp} variants={up}
      >
        <SectionTitle>Daily Check-in</SectionTitle>
        <p className="text-[20px] font-semibold leading-tight mb-5"
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
          className="text-[15px] leading-relaxed"
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
              <p className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
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
      {showAddHabit && <AddAddictionModal onClose={() => setShowAddHabit(false)} />}
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

import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, AlertTriangle, Target, Sparkles, Coins, X, Plus } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays } from "@/lib/store";
import { AddAddictionModal } from "@/components/AddAddictionModal";
import { triggerPaywall } from "@/lib/paywall";
import { RelapseModal } from "@/components/RelapseModal";
import { ReEntryScreen } from "@/components/ReEntryScreen";

const MILESTONES = [
  { day: 7,  label: "Energy",      short: "E" },
  { day: 14, label: "Focus",       short: "F" },
  { day: 30, label: "Confidence",  short: "C" },
  { day: 60, label: "Regulation",  short: "R" },
  { day: 90, label: "Reset",       short: "✓" },
];

const MILESTONE_LABELS: Record<number, string> = {
  7: "Increased energy",
  14: "Sharper focus returns",
  30: "Confidence rebuilding",
  60: "Emotional regulation",
  90: "Full dopamine reset",
};

function nextMilestone(day: number) {
  const m = MILESTONES.find((m) => m.day > day);
  if (!m) return null;
  return { ...m, fullLabel: MILESTONE_LABELS[m.day], daysAway: m.day - day };
}

// ── Brain recovery timeline ───────────────────────────────────────────────────
function BrainTimeline({ day }: { day: number }) {
  const pct = Math.min(100, (day / 90) * 100);

  return (
    <div className="mt-3">
      {/* Track */}
      <div className="relative h-1.5 rounded-full" style={{ background: "oklch(0.22 0.03 265)" }}>
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
        />

        {/* Milestone dots */}
        {MILESTONES.map(({ day: m }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div
              key={m}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
              style={{ left: `${pos}%` }}
            >
              <div
                className="h-3.5 w-3.5 rounded-full border-2 transition-all"
                style={{
                  background: reached ? "var(--primary)" : "oklch(0.13 0.022 265)",
                  borderColor: reached ? "var(--primary)" : "oklch(0.22 0.03 265)",
                  boxShadow: reached ? "0 0 10px 2px oklch(0.62 0.22 255 / 0.6)" : "none",
                }}
              />
            </div>
          );
        })}

        {/* Glowing current-position indicator */}
        {pct < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
            style={{ left: `${pct}%` }}
          >
            <div
              className="h-4 w-4 rounded-full animate-glow-pulse"
              style={{
                background: "var(--primary)",
                boxShadow: "0 0 16px 4px oklch(0.62 0.22 255 / 0.7)",
              }}
            />
          </div>
        )}
      </div>

      {/* Day labels */}
      <div className="relative h-9 mt-0.5">
        {MILESTONES.map(({ day: m, label }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div
              key={m}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: `${pos}%` }}
            >
              <p
                className="text-[9px] font-semibold leading-none"
                style={{ color: reached ? "var(--primary)" : "oklch(0.42 0.018 265)" }}
              >
                {label}
              </p>
              <p
                className="text-[8px] mt-0.5 leading-none"
                style={{ color: reached ? "oklch(0.50 0.18 255)" : "oklch(0.34 0.015 265)" }}
              >
                d{m}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Daily check-in ────────────────────────────────────────────────────────────
const MOODS = [
  { v: 1, emoji: "😞", label: "Rough" },
  { v: 2, emoji: "😕", label: "Low" },
  { v: 3, emoji: "😐", label: "OK" },
  { v: 4, emoji: "🙂", label: "Good" },
  { v: 5, emoji: "😤", label: "Strong" },
];

const VARIABLE_REWARDS = [
  { weight: 50, xp: 10,  message: null },
  { weight: 25, xp: 50,  message: "Unexpected bonus. Consistency pays." },
  { weight: 15, xp: 20,  message: "You just unlocked something rare.", badge: true },
  { weight: 10, xp: 0,   message: null },
];

function rollReward() {
  const roll = Math.random() * 100;
  let cum = 0;
  for (const r of VARIABLE_REWARDS) {
    cum += r.weight;
    if (roll < cum) return r;
  }
  return VARIABLE_REWARDS[0];
}

function CheckInCard({ onReward }: { onReward: (msg: string) => void }) {
  const [, update] = useAppState();
  const [checked, setChecked] = useState(false);

  const handleMood = (v: number) => {
    if (checked) return;
    setChecked(true);
    const reward = rollReward();
    if (reward.xp > 0) {
      update((s) => ({ points: s.points + reward.xp, treeXP: s.treeXP + Math.floor(reward.xp / 5) }));
    }
    if (reward.message) {
      onReward(reward.message);
      setTimeout(() => onReward(""), 3000);
    }
  };

  return (
    <div
      className="rounded-2xl p-5 border border-border/60"
      style={{ background: "var(--gradient-surface)" }}
    >
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        Daily Check-in
      </p>
      <p className="mt-1 text-base font-semibold">How are you feeling today?</p>
      <div className="mt-4 flex gap-2">
        {MOODS.map(({ v, emoji, label }) => (
          <button
            key={v}
            onClick={() => handleMood(v)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[10px] font-medium transition-all ${
              checked
                ? "border-border/40 text-muted-foreground/40 cursor-default"
                : "border-border/60 text-muted-foreground hover:border-primary/60 hover:text-primary"
            }`}
          >
            <span className="text-lg leading-none">{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      {checked && (
        <p className="mt-3 text-center text-xs font-medium text-primary">
          Check-in recorded ✓
        </p>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Runs before the component mounts — safe to redirect with no flash.
    if (typeof window === "undefined") return;
    let needsOnboarding = false;
    try {
      const raw = localStorage.getItem("stopamine.v2");
      const saved = raw ? JSON.parse(raw) : null;
      needsOnboarding = !saved?.onboarding || !saved?.addictions?.length;
    } catch {
      needsOnboarding = true;
    }
    if (needsOnboarding) throw redirect({ to: "/onboarding" });
  },
  component: Dashboard,
});

function Dashboard() {
  const [state, update] = useAppState();
  const navigate = useNavigate();
  const [showRelapse, setShowRelapse] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [reEntryDays, setReEntryDays] = useState(0);
  const [showAddHabit, setShowAddHabit] = useState(false);

  const active = activeAddiction(state);
  const day = active ? dayCount(active.startDate) : 1;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));
  const next = nextMilestone(day);

  // Login + re-entry detection
  useEffect(() => {
    if (!state.onboarding) return;
    const inactive = inactivityDays(state.lastLoginAt);
    if (inactive >= 30) setReEntryDays(inactive);
    update((s) => ({
      lastLoginAt: Date.now(),
      loginHistory: [...(s.loginHistory ?? []).slice(-89), Date.now()],
    }));
  }, [state.onboarding]);

  // Weekly identity reminder
  useEffect(() => {
    if (!state.onboarding?.identity) return;
    const weekMs = 7 * 86400000;
    if (Date.now() - (state.lastIdentityShown ?? 0) > weekMs) setShowIdentity(true);
  }, [state.onboarding, state.lastIdentityShown]);

  // Streak insight
  const relapses = [...state.relapses].sort((a, b) => a.ts - b.ts);
  const points = [active?.startDate ?? Date.now(), ...relapses.map((r) => r.ts), Date.now()];
  const gaps = points.slice(1).map((t, i) => (t - points[i]) / 86400000);
  const bestStreak = Math.max(day, ...gaps.map((g) => Math.floor(g)));
  const streakLine =
    day >= bestStreak && relapses.length > 0
      ? "This is your longest streak yet."
      : "Every day you don't give in, your brain rewires itself.";

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
          Stopamine
        </span>
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{ color: "var(--primary)", borderColor: "rgba(196,135,58,0.35)", background: "rgba(196,135,58,0.08)" }}
        >
          <Coins className="h-3 w-3" /> {state.points}
        </Link>
      </header>

      {/* ── Hero: Day counter ────────────────────────────────────────── */}
      <section className="neural-mesh-fine px-6 mt-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">Day</p>
        <p className="day-monument font-bold leading-none tabular-nums" style={{ fontSize: "8rem" }}>
          {day}
        </p>
        <p className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-2 flex-wrap justify-center">
          <span>
            {active?.name ?? "recovery"} journey ·{" "}
            <span className="font-semibold" style={{ color: "var(--primary)" }}>
              {recoveryPct}%
            </span>{" "}
            to brain reset
          </span>
          <button
            onClick={() => setShowAddHabit(true)}
            aria-label="Add habit"
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
            style={{
              color: "var(--primary)",
              borderColor: "rgba(196,135,58,0.35)",
              background: "oklch(0.62 0.22 255 / 0.08)",
            }}
          >
            <Plus className="h-2.5 w-2.5" /> Add habit
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60 italic">{streakLine}</p>
      </section>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="px-6 mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Recovery", value: `${recoveryPct}%` },
          { label: "Best Streak", value: `${bestStreak}d` },
          { label: "Relapses", value: String(state.relapses.length) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/60 p-3 text-center"
            style={{ background: "var(--gradient-surface)" }}
          >
            <p className="text-xl font-bold tabular-nums" style={{ color: "var(--primary)" }}>
              {value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Recovery progress bar ────────────────────────────────────── */}
      <div className="px-6 mt-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2a2218" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${recoveryPct}%`, background: "var(--gradient-primary)" }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/50">
          <span>Day 0</span>
          <span>90-day reset</span>
        </div>
      </div>

      {/* ── Brain recovery timeline ──────────────────────────────────── */}
      <section className="px-6 mt-7">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Brain Recovery Timeline
          </p>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: "var(--primary)" }}
          >
            d{day}
          </span>
        </div>
        <BrainTimeline day={day} />
      </section>

      {/* ── Cards ────────────────────────────────────────────────────── */}
      <section className="px-6 mt-7 space-y-3">
        {/* Daily check-in */}
        <CheckInCard onReward={setRewardMsg} />

        {/* Why you're here */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
          <p className="text-sm leading-snug">
            <span className="font-semibold" style={{ color: "var(--primary)" }}>
              You're doing real work.
            </span>{" "}
            Remember — you started for{" "}
            <span className="text-foreground font-medium">
              {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
            </span>
            . Today counts.
          </p>
        </div>

        {/* Next milestone */}
        {next && (
          <div
            className="rounded-2xl border p-4 flex items-center gap-4"
            style={{ borderColor: "oklch(0.22 0.03 265)", background: "var(--gradient-surface)" }}
          >
            <div
              className="h-11 w-11 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.12)" }}
            >
              <Target className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Next milestone
              </p>
              <p className="text-sm font-semibold mt-0.5">
                Day {next.day} — {next.fullLabel}
              </p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full border tabular-nums shrink-0"
              style={{
                color: "var(--primary)",
                borderColor: "oklch(0.62 0.22 255 / 0.3)",
                background: "oklch(0.62 0.22 255 / 0.08)",
              }}
            >
              {next.daysAway}d
            </span>
          </div>
        )}

        {/* SOS */}
        <Link
          to="/tools/sos"
          className="block rounded-2xl p-4 text-center font-semibold text-sm transition-opacity active:opacity-80"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.22 255 / 0.15), oklch(0.52 0.24 265 / 0.15))",
            border: "1px solid oklch(0.62 0.22 255 / 0.35)",
            color: "var(--primary)",
          }}
        >
          <Zap className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Feeling an urge? Open SOS →
        </Link>

        {/* Log relapse */}
        <button
          onClick={() => setShowRelapse(true)}
          className="w-full rounded-2xl border border-border/40 bg-card/50 p-4 text-center text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
        >
          <AlertTriangle className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          I relapsed — log it honestly
        </button>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {showAddHabit && <AddAddictionModal onClose={() => setShowAddHabit(false)} />}

      {showRelapse && (
        <RelapseModal
          onClose={() => setShowRelapse(false)}
          totalCleanDays={state.totalCleanDays}
        />
      )}

      {reEntryDays >= 30 && (
        <ReEntryScreen inactiveDays={reEntryDays} onDone={() => setReEntryDays(0)} />
      )}

      {showIdentity && state.onboarding?.identity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div
            className="rounded-3xl border border-primary/25 p-7 w-full max-w-sm space-y-5 text-center relative"
            style={{ background: "var(--card)" }}
          >
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">You made a promise.</p>
            <p className="text-2xl font-bold leading-snug">
              I am becoming someone who{" "}
              <span style={{ color: "var(--primary)" }}>{state.onboarding.identity}</span>.
            </p>
            <p className="text-sm text-muted-foreground">You're still becoming that person.</p>
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="w-full h-12 rounded-2xl text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              I'm still in.
            </button>
          </div>
        </div>
      )}

      {rewardMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-primary/40 bg-card px-5 py-3 text-sm font-semibold text-primary shadow-lg">
          {rewardMsg}
        </div>
      )}
    </PageShell>
  );
}

import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, X, Plus, Lock } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays } from "@/lib/store";
import { AddAddictionModal } from "@/components/AddAddictionModal";
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
  7:  "Increased energy",
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
      <div className="relative h-1.5 rounded-full" style={{ background: "oklch(0.22 0.03 265)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
        />
        {MILESTONES.map(({ day: m }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div key={m} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10" style={{ left: `${pos}%` }}>
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
        {pct < 100 && (
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20" style={{ left: `${pct}%` }}>
            <div
              className="h-4 w-4 rounded-full animate-glow-pulse"
              style={{ background: "var(--primary)", boxShadow: "0 0 16px 4px oklch(0.62 0.22 255 / 0.7)" }}
            />
          </div>
        )}
      </div>
      <div className="relative h-9 mt-0.5">
        {MILESTONES.map(({ day: m, label }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div key={m} className="absolute -translate-x-1/2 text-center" style={{ left: `${pos}%` }}>
              <p className="text-[9px] font-semibold leading-none" style={{ color: reached ? "var(--primary)" : "oklch(0.42 0.018 265)" }}>
                {label}
              </p>
              <p className="text-[8px] mt-0.5 leading-none" style={{ color: reached ? "oklch(0.50 0.18 255)" : "oklch(0.34 0.015 265)" }}>
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

type MoodResponse = {
  message: string;
  buttons: { label: string; to: string }[];
};

function moodResponse(v: number): MoodResponse {
  if (v <= 2) return {
    message: "Tough day. That's okay. You showed up anyway.",
    buttons: [
      { label: "Cut the Signal", to: "/tools/breath" },
      { label: "I'm feeling an urge", to: "/tools/sos" },
    ],
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
  const [, update] = useAppState();
  const [mood, setMood] = useState<number | null>(null);

  const handleMood = (v: number) => {
    if (mood !== null) return;
    setMood(v);
    const reward = rollReward();
    if (reward.xp > 0) {
      update((s) => ({ points: s.points + reward.xp, treeXP: s.treeXP + Math.floor(reward.xp / 5) }));
    }
    if (reward.message) {
      onReward(reward.message);
      setTimeout(() => onReward(""), 3000);
    }
  };

  const response = mood !== null ? moodResponse(mood) : null;
  const isLow = mood !== null && mood <= 2;
  const isHigh = mood !== null && mood >= 4;

  return (
    <div>
      {/* Emoji row */}
      <div className="flex gap-2">
        {MOODS.map(({ v, emoji, label }) => (
          <button
            key={v}
            onClick={() => handleMood(v)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl text-[10px] font-medium transition-all ${
              mood !== null
                ? v === mood
                  ? "border border-primary/40 active:scale-100 cursor-default"
                  : "opacity-20 cursor-default"
                : "border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary active:scale-95"
            }`}
            style={
              mood !== null && v === mood
                ? { background: "oklch(0.62 0.22 255 / 0.08)", color: "var(--primary)" }
                : mood !== null
                ? {}
                : { background: "var(--card)" }
            }
          >
            <span className="text-xl leading-none">{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Contextual response */}
      {response && (
        <div className="mt-5 fade-up">
          <p
            className="text-sm font-semibold leading-snug"
            style={{
              color: isLow
                ? "oklch(0.78 0.12 25)"
                : isHigh
                ? "oklch(0.78 0.14 150)"
                : "var(--foreground)",
            }}
          >
            {response.message}
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            {response.buttons.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-opacity active:opacity-70"
                style={{
                  background: isLow
                    ? "oklch(0.30 0.10 25 / 0.5)"
                    : "oklch(0.62 0.22 255 / 0.08)",
                  border: `1px solid ${
                    isLow
                      ? "oklch(0.55 0.20 25 / 0.35)"
                      : isHigh
                      ? "oklch(0.60 0.18 150 / 0.35)"
                      : "oklch(0.62 0.22 255 / 0.28)"
                  }`,
                  color: isLow
                    ? "oklch(0.80 0.14 25)"
                    : isHigh
                    ? "oklch(0.75 0.18 150)"
                    : "var(--primary)",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cut the Signal game circles ───────────────────────────────────────────────
function SignalGame({ to, glow, label, icon }: { to: string; glow: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-3 active:opacity-70 transition-opacity">
      <div
        className="h-[68px] w-[68px] rounded-full grid place-items-center"
        style={{
          background: "var(--card)",
          border: `1.5px solid ${glow}44`,
          boxShadow: `0 0 20px 4px ${glow}35, 0 0 6px 1px ${glow}22`,
        }}
      >
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-foreground/70 text-center leading-tight max-w-[72px]">
        {label}
      </span>
    </Link>
  );
}

function MindPulseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#6BAED6" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="6" fill="#6BAED6" fillOpacity="0.15" stroke="#6BAED6" strokeWidth="1.3"/>
      <path d="M5 15 L9 15 L11 10 L13 20 L15 13 L17 17 L19 15 L25 15" stroke="#6BAED6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ImpulseShiftIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#C4873A" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="7" stroke="#C4873A" strokeWidth="1.2" strokeOpacity="0.65"/>
      <circle cx="15" cy="15" r="2.2" fill="#C4873A"/>
      <line x1="15" y1="2" x2="15" y2="6"  stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="24" x2="15" y2="28" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="15" x2="6"  y2="15" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="15" x2="28" y2="15" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function NeuralLinkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="8"  y1="8"  x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="8"  x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8"  y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8"  y1="8"  x2="22" y2="8"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8"  y1="22" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8"  y1="8"  x2="8"  y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="22" y1="8"  x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <circle cx="8"  cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="8"  cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="15" cy="15" r="3.5" fill="#6BAA75" fillOpacity="0.3" stroke="#6BAA75" strokeWidth="1.4"/>
    </svg>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/")({
  beforeLoad: () => {
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

  useEffect(() => {
    if (!state.onboarding) return;
    const inactive = inactivityDays(state.lastLoginAt);
    if (inactive >= 30) setReEntryDays(inactive);
    update((s) => ({
      lastLoginAt: Date.now(),
      loginHistory: [...(s.loginHistory ?? []).slice(-89), Date.now()],
    }));
  }, [state.onboarding]);

  useEffect(() => {
    if (!state.onboarding?.identity) return;
    const weekMs = 7 * 86400000;
    if (Date.now() - (state.lastIdentityShown ?? 0) > weekMs) setShowIdentity(true);
  }, [state.onboarding, state.lastIdentityShown]);

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
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 relative flex items-center justify-center fade-up">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground/60">
          Stopamine
        </span>
        <Link
          to="/challenges"
          className="absolute right-6 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{ color: "var(--primary)", borderColor: "rgba(196,135,58,0.28)", background: "rgba(196,135,58,0.06)" }}
        >
          <Coins className="h-3 w-3" /> {state.points}
        </Link>
      </header>

      {/* ── Hero: day number ────────────────────────────────── */}
      <section className="relative px-6 pt-8 pb-4 text-center overflow-hidden fade-up-1">
        {/* Ambient glow orb behind number */}
        <div
          className="pointer-events-none absolute ambient-drift"
          style={{
            top: "5%", left: "50%",
            width: 300, height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.13) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          aria-hidden
        />
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-muted-foreground/50">Day</p>
        <p className="day-monument font-bold leading-none tabular-nums" style={{ fontSize: "8rem" }}>
          {day}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {active?.name ?? "recovery"} ·{" "}
          <span className="font-semibold text-foreground/90">{recoveryPct}%</span>{" "}
          to brain reset
          <button
            onClick={() => setShowAddHabit(true)}
            className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors"
            style={{ color: "var(--primary)", borderColor: "rgba(196,135,58,0.30)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            <Plus className="h-2.5 w-2.5" /> Add habit
          </button>
        </p>
        <p className="mt-1.5 text-xs italic" style={{ color: "oklch(0.52 0.015 265 / 0.7)" }}>
          {streakLine}
        </p>
      </section>

      {/* ── Inline stats ────────────────────────────────────── */}
      <div className="px-6 mt-1 mb-2 flex divide-x fade-up-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1 text-center py-3">
          <p className="text-[22px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{recoveryPct}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Recovery</p>
        </div>
        <div className="flex-1 text-center py-3">
          <p className="text-[22px] font-bold tabular-nums">{bestStreak}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Best streak</p>
        </div>
        <div className="flex-1 text-center py-3">
          <p className="text-[22px] font-bold tabular-nums">{state.relapses.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Relapses</p>
        </div>
      </div>

      {/* ── Brain recovery timeline ──────────────────────────── */}
      <section className="px-6 mt-6 fade-up-2 text-center">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Brain Recovery Timeline
          </p>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>
            d{day}
          </span>
        </div>
        <BrainTimeline day={day} />
      </section>

      {/* ── Cut the Signal ──────────────────────────────────── */}
      <section className="px-6 mt-10 fade-up-3 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">
          Cut the Signal
        </p>
        <div className="flex justify-around">
          <SignalGame to="/tools/breath" glow="#6BAED6" label="Mind Pulse"    icon={<MindPulseIcon />} />
          <SignalGame to="/tools/tap"    glow="#C4873A" label="Impulse Shift" icon={<ImpulseShiftIcon />} />
          <SignalGame to="/tools/memory" glow="#6BAA75" label="Neural Link"   icon={<NeuralLinkIcon />} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            <Lock className="h-3 w-3" /> PRO
          </span>
          <span className="text-[11px] text-muted-foreground/60">More games available</span>
        </div>
      </section>

      {/* ── Daily check-in ──────────────────────────────────── */}
      <section className="px-6 mt-10 pt-8 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
          Daily Check-in
        </p>
        <p className="text-base font-semibold mb-5">How are you feeling today?</p>
        <CheckIn onReward={setRewardMsg} />
      </section>

      {/* ── Motivation pull quote ────────────────────────────── */}
      <section className="px-6 mt-8 fade-up-5">
        <p className="text-[13px] leading-relaxed italic" style={{ color: "oklch(0.60 0.018 265 / 0.75)" }}>
          You started this for{" "}
          <span className="not-italic font-medium" style={{ color: "oklch(0.75 0.025 265 / 0.85)" }}>
            {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
          </span>
          . That person is still watching.
        </p>
      </section>

      {/* ── Next milestone ──────────────────────────────────── */}
      {next && (
        <section className="px-6 mt-7 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "oklch(0.22 0.03 265 / 0.7)" }} />
          <div className="text-center shrink-0">
            <p className="text-[11px] text-muted-foreground/70">
              Next · <span className="font-semibold text-foreground/80">Day {next.day} — {next.fullLabel}</span>
            </p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: "var(--primary)" }}>
              {next.daysAway} days away
            </p>
          </div>
          <div className="flex-1 h-px" style={{ background: "oklch(0.22 0.03 265 / 0.7)" }} />
        </section>
      )}

      {/* ── SOS ─────────────────────────────────────────────── */}
      <section className="px-6 mt-6">
        <Link
          to="/tools/sos"
          className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-opacity active:opacity-75"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.15 25 / 0.18), oklch(0.25 0.1 25 / 0.12))",
            border: "1px solid oklch(0.62 0.24 25 / 0.28)",
            color: "oklch(0.72 0.18 25)",
          }}
        >
          Feeling an urge right now?
        </Link>
      </section>

      {/* ── Log relapse ─────────────────────────────────────── */}
      <section className="px-6 mt-2 pb-8">
        <button
          onClick={() => setShowRelapse(true)}
          className="w-full py-3 rounded-2xl text-center text-[13px] font-medium transition-opacity active:opacity-60"
          style={{
            color: "oklch(0.75 0.010 265)",
            border: "1px solid oklch(0.28 0.020 265 / 0.8)",
            background: "oklch(0.15 0.015 265 / 0.5)",
          }}
        >
          I relapsed — log it honestly
        </button>
      </section>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showAddHabit && <AddAddictionModal onClose={() => setShowAddHabit(false)} />}
      {showRelapse && (
        <RelapseModal onClose={() => setShowRelapse(false)} totalCleanDays={state.totalCleanDays} />
      )}
      {reEntryDays >= 30 && (
        <ReEntryScreen inactiveDays={reEntryDays} onDone={() => setReEntryDays(0)} />
      )}
      {showIdentity && state.onboarding?.identity && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
          <div
            className="rounded-3xl border border-primary/20 p-7 w-full max-w-sm space-y-5 text-center relative"
            style={{ background: "var(--card)" }}
          >
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
              You made a promise.
            </p>
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm font-semibold shadow-lg" style={{ color: "var(--primary)" }}>
          {rewardMsg}
        </div>
      )}
    </PageShell>
  );
}

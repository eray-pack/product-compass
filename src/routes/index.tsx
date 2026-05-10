import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Smile, Frown, Meh, Heart, Zap, Lock, Trophy, TreePine, Coins, Sparkles, AlertTriangle, Target, X } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { AddictionCarousel } from "@/components/AddictionCarousel";
import { useAppState, dayCount, treeStage, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { RelapseModal } from "@/components/RelapseModal";
import { ReEntryScreen } from "@/components/ReEntryScreen";
import { inactivityDays } from "@/lib/store";

const MILESTONES = [7, 14, 30, 60, 90];
const MILESTONE_LABELS: Record<number, string> = {
  7: "Increased energy",
  14: "Sharper focus returns",
  30: "Confidence rebuilding",
  60: "Emotional regulation",
  90: "Full dopamine reset",
};

function nextMilestone(day: number) {
  const next = MILESTONES.find((m) => m > day);
  if (!next) return null;
  return { day: next, label: MILESTONE_LABELS[next], daysAway: next - day };
}

const VARIABLE_REWARDS = [
  { weight: 50, xp: 10, message: null },
  { weight: 25, xp: 50, message: "Unexpected bonus. Your consistency is paying off." },
  { weight: 15, xp: 20, message: "You just unlocked something rare. Keep going.", badge: true },
  { weight: 10, xp: 0, message: null },
];

function rollReward(): { xp: number; message: string | null; badge?: boolean } {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const r of VARIABLE_REWARDS) {
    cumulative += r.weight;
    if (roll < cumulative) return r;
  }
  return VARIABLE_REWARDS[0];
}

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const milestones = [
  { day: 7, label: "Increased energy" },
  { day: 14, label: "Sharper focus" },
  { day: 30, label: "Confidence returning" },
  { day: 60, label: "Emotional regulation" },
  { day: 90, label: "Full dopamine reset" },
];

function Dashboard() {
  const [state, update] = useAppState();
  const navigate = useNavigate();
  const [showRelapse, setShowRelapse] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [reEntryDays, setReEntryDays] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("stopamine.v2");
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved?.onboarding || !saved?.addictions?.length) {
      navigate({ to: "/onboarding" });
    }
  }, [navigate]);

  const active = activeAddiction(state);
  const day = dayCount(active.startDate);
  const pct = Math.min(100, (day / 90) * 100);
  const stage = treeStage(state.treeXP);
  const cost = state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self";
  const next = nextMilestone(day);

  // Login tracking + re-entry detection
  useEffect(() => {
    if (!state.onboarding) return;
    const inactive = inactivityDays(state.lastLoginAt);
    if (inactive >= 30) {
      setReEntryDays(inactive);
    }
    update((s) => ({
      lastLoginAt: Date.now(),
      loginHistory: [...(s.loginHistory ?? []).slice(-89), Date.now()],
    }));
  }, [state.onboarding]);

  // Show weekly identity reminder
  useEffect(() => {
    if (!state.onboarding?.identity) return;
    const weekMs = 7 * 86400000;
    if (Date.now() - (state.lastIdentityShown ?? 0) > weekMs) {
      setShowIdentity(true);
    }
  }, [state.onboarding, state.lastIdentityShown]);

  // Streak insight
  const relapses = [...state.relapses].sort((a, b) => a.ts - b.ts);
  const points = [active.startDate, ...relapses.map((r) => r.ts), Date.now()];
  const gaps = points.slice(1).map((t, i) => (t - points[i]) / 86400000);
  const bestStreak = Math.max(day, ...gaps.map((g) => Math.floor(g)));
  const isPersonalBest = day >= bestStreak && relapses.length > 0;
  const now = Date.now();
  const lastMonthRelapses = relapses.filter((r) => now - r.ts < 30 * 86400000).length;
  const prevMonthRelapses = relapses.filter((r) => {
    const d = now - r.ts;
    return d >= 30 * 86400000 && d < 60 * 86400000;
  }).length;
  const cleanerThanLastMonth = prevMonthRelapses > 0 && lastMonthRelapses < prevMonthRelapses;
  const streakLine = isPersonalBest
    ? "This is your longest streak yet."
    : cleanerThanLastMonth
    ? "You're cleaner this month than last. Keep going."
    : "Every day you don't give in, your brain rewires itself.";

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stopamine</p>
        <Link to="/challenges" className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 border border-warning/30 px-2.5 py-1 rounded-full">
          <Coins className="h-3 w-3" /> {state.points}
        </Link>
      </header>

      {/* Swipeable addiction trackers */}
      <AddictionCarousel />

      {/* Why-you're-here reminder */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm leading-snug">
            <span className="text-primary font-medium">You're doing real work.</span>{" "}
            Remember — you started this for{" "}
            <span className="text-foreground font-medium">{cost}</span>. Today counts.
          </p>
        </div>
      </section>

      {/* Brain recovery timeline */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Brain recovery</h2>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span><span>30</span><span>60</span><span>90 days</span>
          </div>
          <div className="relative mt-4">
            <ul className={`space-y-2.5 ${state.isPremium ? "" : "blur-[6px] select-none pointer-events-none"}`}>
              {milestones.map((m) => {
                const reached = day >= m.day;
                return (
                  <li key={m.day} className="flex items-center gap-3 text-sm">
                    <span className={`h-2 w-2 rounded-full ${reached ? "bg-primary" : "bg-border"}`} />
                    <span className={reached ? "text-foreground" : "text-muted-foreground"}>
                      Day {m.day} — {m.label}
                    </span>
                    {reached && <span className="ml-auto text-[10px] text-primary uppercase">reached</span>}
                  </li>
                );
              })}
            </ul>
            {!state.isPremium && (
              <button onClick={() => triggerPaywall()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
                  <Lock className="h-3 w-3" /> Unlock your milestones
                </span>
                <span className="text-[11px] text-muted-foreground">See exactly what's healing in your brain</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="px-6 mt-6 space-y-4">
        <CheckInCard onReward={setRewardMsg} />

        {/* Quick links to quests + tree */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/challenges" className="rounded-2xl border border-border bg-card p-4 hover:border-primary transition">
            <div className="h-9 w-9 rounded-full grid place-items-center bg-warning/10 text-warning">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-semibold">Quests</p>
            <p className="text-[11px] text-muted-foreground">Earn points today</p>
          </Link>
          <Link to="/tree" className="rounded-2xl border border-border bg-card p-4 hover:border-primary transition">
            <div className="h-9 w-9 rounded-full grid place-items-center bg-success/10 text-success">
              <TreePine className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-semibold">Life Tree</p>
            <p className="text-[11px] text-muted-foreground">{stage.name} · {state.treeXP} XP</p>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Heart className="h-3.5 w-3.5" /> Your goal
          </p>
          <p className="mt-2 text-base leading-snug">
            I am becoming someone who{" "}
            <span className="text-primary font-medium">
              {state.onboarding?.identity || "is in full control of his mind"}
            </span>.
          </p>
        </div>

        {next && (
          <div className="rounded-2xl border border-success/30 bg-success/5 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/15 grid place-items-center text-success shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Next milestone</p>
              <p className="text-sm font-semibold">Day {next.day} — {next.label}</p>
            </div>
            <span className="text-xs font-bold text-success bg-success/15 border border-success/30 px-2.5 py-1 rounded-full whitespace-nowrap">
              {next.daysAway}d away
            </span>
          </div>
        )}

        <Link to="/tools"
          className="block rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive-foreground">
          <Zap className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Feeling an urge? Open SOS tools →
        </Link>

        <button
          onClick={() => setShowRelapse(true)}
          className="w-full rounded-2xl border border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive transition"
        >
          <AlertTriangle className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          I relapsed — log it honestly
        </button>
      </section>

      {showRelapse && (
        <RelapseModal onClose={() => setShowRelapse(false)} totalCleanDays={state.totalCleanDays} />
      )}

      {reEntryDays >= 30 && (
        <ReEntryScreen inactiveDays={reEntryDays} onDone={() => setReEntryDays(0)} />
      )}

      {showIdentity && state.onboarding?.identity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="rounded-3xl border border-primary/30 bg-card p-7 w-full max-w-sm space-y-5 text-center relative">
            <button onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="absolute top-4 right-4 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-wider text-primary">You made a promise.</p>
            <p className="text-2xl font-bold leading-snug">
              I am becoming someone who{" "}
              <span className="text-primary">{state.onboarding.identity}</span>.
            </p>
            <p className="text-sm text-muted-foreground">You're still becoming that person.</p>
            <button
              onClick={() => { setShowIdentity(false); update({ lastIdentityShown: Date.now() }); }}
              className="w-full h-12 rounded-2xl text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}>
              I'm still in.
            </button>
          </div>
        </div>
      )}

      {rewardMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-primary/40 bg-card px-5 py-3 text-sm text-primary shadow-lg">
          {rewardMsg}
        </div>
      )}
    </PageShell>
  );
}

function CheckInCard({ onReward }: { onReward: (msg: string) => void }) {
  const [, update] = useAppState();
  const [checked, setChecked] = useState(false);
  const moods = [
    { v: 1, Icon: Frown, label: "Rough" },
    { v: 2, Icon: Frown, label: "Low" },
    { v: 3, Icon: Meh, label: "OK" },
    { v: 4, Icon: Smile, label: "Good" },
    { v: 5, Icon: Smile, label: "Strong" },
  ];

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
    if (v >= 4) {
      update((s) => ({ urgesSurvived: s.urgesSurvived }));
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Daily check-in</p>
      <p className="mt-1 text-base">How are you feeling today?</p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {moods.map(({ v, Icon, label }) => (
          <button key={v} onClick={() => handleMood(v)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[10px] transition ${checked ? "border-border bg-secondary/20 text-muted-foreground/50" : "border-border bg-secondary/40 text-muted-foreground hover:border-primary hover:text-primary"}`}>
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
      {checked && <p className="mt-3 text-center text-xs text-primary">Check-in recorded ✓</p>}
    </div>
  );
}

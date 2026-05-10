import { useState } from "react";
import { TrendingUp, RefreshCw, Flame, BookOpen } from "lucide-react";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";

interface Props {
  inactiveDays: number;
  onDone: () => void;
}

type Path = "kept_going" | "struggled" | null;

const RECOVERY_FACTS = [
  "The average person relapses 7–10 times before lasting change. You're not behind — you're in the process.",
  "Every time you come back is a data point, not a defeat. The brain rewires through repetition, not perfection.",
  "Studies on addiction show that returning after relapse predicts long-term recovery better than never relapsing at all.",
  "Shame accelerates relapse. Honesty about struggle is the single most protective factor in recovery.",
];

export function ReEntryScreen({ inactiveDays, onDone }: Props) {
  const [state, update] = useAppState();
  const [path, setPath] = useState<Path>(null);
  const [fact] = useState(() => RECOVERY_FACTS[Math.floor(Math.random() * RECOVERY_FACTS.length)]);

  const active = activeAddiction(state);
  const totalClean = state.totalCleanDays;
  const longest = longestCleanPeriod(state);
  const returns = state.totalReturns;
  const currentDay = active ? dayCount(active.startDate) : 1;

  const handleKeptGoing = () => {
    // Add missed days to momentum — they stayed clean without the app
    update((s) => ({
      totalCleanDays: s.totalCleanDays + inactiveDays,
      treeXP: s.treeXP + inactiveDays * 10,
      totalReturns: s.totalReturns + 1,
      badges: s.badges.includes("Silent Warrior") ? s.badges : [...s.badges, "Silent Warrior"],
    }));
    setPath("kept_going");
  };

  const handleStruggled = () => {
    update((s) => ({
      totalReturns: s.totalReturns + 1,
    }));
    setPath("struggled");
  };

  if (path === "kept_going") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-success/40 bg-card p-7 w-full max-w-sm mx-4 space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-success/15 grid place-items-center text-success">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-success mb-2">Silent Warrior</p>
            <h2 className="text-xl font-bold leading-snug">You didn't need us.</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              That's the whole point. You built the habit and kept going on your own. Your tree kept growing while you were away.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days added to momentum</span>
              <span className="font-bold text-success">+{inactiveDays}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Badge unlocked</span>
              <span className="font-bold text-amber-400">Silent Warrior</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total clean days</span>
              <span className="font-bold">{totalClean + inactiveDays}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "The best recovery is one that becomes invisible. You proved it."
          </p>

          <button onClick={onDone}
            className="w-full h-12 rounded-2xl text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}>
            Back to my tree
          </button>
        </div>
      </Overlay>
    );
  }

  if (path === "struggled") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-primary/30 bg-card p-7 w-full max-w-sm mx-4 space-y-5 max-h-[90vh] overflow-y-auto">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-primary mb-2">We figured. That's okay.</p>
            <h2 className="text-xl font-bold leading-snug">Let's look at what the data says.</h2>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your recovery story</p>
            <div className="space-y-2">
              <StatRow label="Total clean days, ever" value={`${totalClean}`} />
              <StatRow label="Longest clean period" value={`${longest} days`} />
              <StatRow label="Times you've come back" value={`${returns + 1}`} highlight />
              <StatRow label="Current momentum" value={`Day ${currentDay}`} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">The science</p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">"{fact}"</p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm leading-relaxed">
              <span className="text-primary font-semibold">Every time you came back, that was a choice.</span>{" "}
              Most people stop choosing. You didn't.
            </p>
          </div>

          <button onClick={onDone}
            className="w-full h-12 rounded-2xl text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}>
            I'm back. Let's continue.
          </button>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div className="rounded-3xl border border-border bg-card p-7 w-full max-w-sm mx-4 space-y-6">
        <div className="h-12 w-12 rounded-2xl bg-card border border-border grid place-items-center">
          <Flame className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {inactiveDays} days since you were here
          </p>
          <h2 className="text-xl font-bold leading-snug">Welcome back.</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We missed you. Before we continue — be honest with yourself. What happened while you were away?
          </p>
        </div>

        <div className="space-y-3">
          <button onClick={handleKeptGoing}
            className="w-full rounded-2xl border border-success/40 bg-success/10 p-4 text-left space-y-1 hover:bg-success/15 transition">
            <p className="text-sm font-semibold text-success">I kept going</p>
            <p className="text-xs text-muted-foreground">I maintained the habit even without the app</p>
          </button>
          <button onClick={handleStruggled}
            className="w-full rounded-2xl border border-border bg-card p-4 text-left space-y-1 hover:border-primary/40 transition">
            <p className="text-sm font-semibold">I struggled</p>
            <p className="text-xs text-muted-foreground">I relapsed or lost track — I'm starting again</p>
          </button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground">
          Your momentum counter stays the same either way. This is just for you.
        </p>
      </div>
    </Overlay>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {children}
    </div>
  );
}

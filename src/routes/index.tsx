import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flame, Smile, Frown, Meh, Heart, Zap, Lock } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

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
  const [state] = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.onboarding && typeof window !== "undefined") {
      const raw = localStorage.getItem("stopamine.v1");
      if (!raw || !JSON.parse(raw)?.onboarding) {
        navigate({ to: "/onboarding" });
      }
    }
  }, [state.onboarding, navigate]);

  const day = dayCount(state.startDate);
  const pct = Math.min(100, (day / 90) * 100);

  return (
    <PageShell>
      <header className="px-6 pt-12 pb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stopamine</p>
      </header>

      {/* Day counter */}
      <section className="px-6 pt-4">
        <div className="rounded-2xl p-6 border border-border bg-[var(--gradient-surface)] shadow-[var(--shadow-glow)]">
          <p className="text-sm text-muted-foreground">Today</p>
          <h1 className="mt-1 text-6xl font-bold tracking-tight">Day {day}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your dopamine receptors are rebalancing.
          </p>
        </div>
      </section>

      {/* Brain recovery timeline */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Brain recovery</h2>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>0</span><span>30</span><span>60</span><span>90 days</span>
          </div>
          <ul className="mt-4 space-y-2.5">
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
        </div>
      </section>

      {/* Cards */}
      <section className="px-6 mt-6 space-y-4">
        <CheckInCard />
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
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className="mt-1 text-3xl font-bold">{day} <span className="text-base font-normal text-muted-foreground">days clean</span></p>
          </div>
          <div className="h-14 w-14 rounded-full grid place-items-center bg-warning/10 border border-warning/30">
            <Flame className="h-7 w-7 text-warning" />
          </div>
        </div>

        <Link
          to="/tools"
          className="block rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive-foreground"
        >
          <Zap className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          Feeling an urge? Open SOS tools →
        </Link>
      </section>
    </PageShell>
  );
}

function CheckInCard() {
  const moods = [
    { v: 1, Icon: Frown, label: "Rough" },
    { v: 2, Icon: Frown, label: "Low" },
    { v: 3, Icon: Meh, label: "OK" },
    { v: 4, Icon: Smile, label: "Good" },
    { v: 5, Icon: Smile, label: "Strong" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Daily check-in</p>
      <p className="mt-1 text-base">How are you feeling today?</p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {moods.map(({ v, Icon, label }) => (
          <button
            key={v}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary/40 py-2.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition"
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

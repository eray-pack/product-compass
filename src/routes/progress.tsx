import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Shield, Trophy, Lock, BookOpen } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

export const Route = createFileRoute("/progress")({
  component: ProgressScreen,
});

function ProgressScreen() {
  const [state] = useAppState();
  const active = activeAddiction(state);
  const day = dayCount(active.startDate);
  const longest = longestCleanPeriod(state);
  const daysSinceStart = Math.floor((Date.now() - active.startDate) / 86400000);
  const totalLogins = state.loginHistory?.length ?? 0;

  // Mock contribution-style grid: 12 weeks x 7 days
  const cells = Array.from({ length: 84 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const recent = i > 84 - day;
    if (recent) return r > 0.92 ? 0 : 3; // mostly clean
    return r > 0.7 ? 2 : r > 0.4 ? 1 : 0;
  });

  // Mood graph (last 7 weeks)
  const mood = [3, 2, 3, 4, 3, 4, 5];
  const max = 5;

  const badges = [
    { name: "First Week", icon: Shield, earned: day >= 7 },
    { name: "30 Days", icon: Award, earned: day >= 30 },
    { name: "Survived 10 Urges", icon: Flame, earned: state.urgesSurvived >= 10 },
    { name: "90 Day Warrior", icon: Trophy, earned: day >= 90 },
  ];

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progress</p>
        <h1 className="mt-2 text-3xl font-bold">The proof is in the data.</h1>
      </header>

      {/* Calendar */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Streak calendar</p>
              <p className="text-xs text-muted-foreground mb-3">Last 12 weeks</p>
            </div>
            {!state.isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" /> PRO
              </span>
            )}
          </div>
          <div className="relative">
            <div className={`grid grid-flow-col grid-rows-7 gap-1 ${state.isPremium ? "" : "blur-[5px] select-none pointer-events-none"}`}>
              {cells.map((v, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-[3px]"
                  style={{
                    backgroundColor:
                      v === 0 ? "oklch(0.26 0.025 260)"
                      : v === 1 ? "oklch(0.4 0.1 150)"
                      : v === 2 ? "oklch(0.55 0.13 150)"
                      : "oklch(0.7 0.16 150)",
                  }}
                />
              ))}
            </div>
            {!state.isPremium && (
              <button
                onClick={() => triggerPaywall()}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-xs font-medium text-primary bg-card/80 border border-primary/30 px-3 py-1.5 rounded-full">
                  Tap to see your full streak
                </span>
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            Less
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.26 0.025 260)" }} />
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.4 0.1 150)" }} />
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.55 0.13 150)" }} />
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.7 0.16 150)" }} />
            More
          </div>
        </div>
      </section>

      {/* Total clean days */}
      <section className="px-6 mt-4">
        <button
          type="button"
          onClick={() => { if (!state.isPremium) triggerPaywall(); }}
          className="w-full text-left rounded-2xl border border-border bg-card p-5 relative overflow-hidden"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Relapses don't erase progress</p>
          <p className={`mt-2 text-3xl font-bold ${state.isPremium ? "" : "blur-md select-none"}`}>
            {state.totalCleanDays} <span className="text-base font-normal text-muted-foreground">total clean days, ever</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your brain remembers every single one.
          </p>
          {!state.isPremium && (
            <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </button>
      </section>

      {/* Mood graph */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Weekly check-in mood</p>
          <p className="text-xs text-muted-foreground mb-4">Last 7 weeks</p>
          <div className="flex items-end gap-2 h-28">
            {mood.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{ height: `${(m / max) * 100}%`, background: "var(--gradient-primary)" }}
                />
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recovery Story */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Your Recovery Story</p>
              <p className="text-[11px] text-muted-foreground">This is not a streak. This is your history.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Days since you started", value: `${daysSinceStart}` },
              { label: "Total clean days, ever", value: `${state.totalCleanDays}` },
              { label: "Longest clean period", value: `${longest} days` },
              { label: "Times you came back", value: `${state.totalReturns}` },
              { label: "Relapses logged honestly", value: `${state.relapses?.length ?? 0}` },
              { label: "App sessions", value: `${totalLogins}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
            "Every chapter counts. Every time you came back was a choice. Most people stop choosing."
          </p>
        </div>
      </section>

      {/* Badges */}
      <section className="px-6 mt-4">
        <p className="text-sm font-semibold mb-3">Badges</p>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(({ name, icon: Icon, earned }) => (
            <div
              key={name}
              className={`rounded-2xl border p-4 ${earned ? "border-primary/40 bg-primary/10" : "border-border bg-card opacity-60"}`}
            >
              <Icon className={`h-6 w-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
              <p className="mt-2 text-sm font-medium">{name}</p>
              <p className="text-[10px] text-muted-foreground">{earned ? "Earned" : "Locked"}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

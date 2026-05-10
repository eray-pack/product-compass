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
  if (!active) return null;

  const day = dayCount(active.startDate);
  const longest = longestCleanPeriod(state);
  const daysSinceStart = Math.floor((Date.now() - active.startDate) / 86400000);
  const totalLogins = state.loginHistory?.length ?? 0;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));

  // 12-week contribution grid
  const cells = Array.from({ length: 84 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const recent = i > 84 - day;
    if (recent) return r > 0.92 ? 0 : 3;
    return r > 0.7 ? 2 : r > 0.4 ? 1 : 0;
  });

  const mood = [3, 2, 3, 4, 3, 4, 5];

  const badges = [
    { name: "First Week",       icon: Shield, earned: day >= 7  },
    { name: "30 Days",          icon: Award,  earned: day >= 30 },
    { name: "Survived 10 Urges", icon: Flame, earned: state.urgesSurvived >= 10 },
    { name: "90 Day Warrior",   icon: Trophy, earned: day >= 90 },
  ];

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Progress
        </p>
        <h1 className="mt-2 text-3xl font-bold">The proof is in the data.</h1>
      </header>

      {/* ── Recovery snapshot ────────────────────────────────── */}
      <section className="px-6 mt-5 grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4 border border-primary/20"
          style={{ background: "oklch(0.62 0.22 255 / 0.08)" }}
        >
          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            Current streak
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums" style={{ color: "var(--primary)" }}>
            {day}
          </p>
          <p className="text-[11px] text-muted-foreground">days clean</p>
        </div>
        <div
          className="rounded-2xl p-4 border border-primary/20"
          style={{ background: "oklch(0.62 0.22 255 / 0.08)" }}
        >
          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            Recovery
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums" style={{ color: "var(--primary)" }}>
            {recoveryPct}%
          </p>
          <p className="text-[11px] text-muted-foreground">to brain reset</p>
        </div>
      </section>

      {/* ── Streak calendar ──────────────────────────────────── */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Streak calendar</p>
              <p className="text-xs text-muted-foreground">Last 12 weeks</p>
            </div>
            {!state.isPremium && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  color: "var(--primary)",
                  borderColor: "oklch(0.62 0.22 255 / 0.3)",
                  background: "oklch(0.62 0.22 255 / 0.08)",
                }}
              >
                <Lock className="h-3 w-3" /> PRO
              </span>
            )}
          </div>
          <div className="relative">
            <div
              className={`grid grid-flow-col grid-rows-7 gap-1 ${
                state.isPremium ? "" : "blur-[5px] select-none pointer-events-none"
              }`}
            >
              {cells.map((v, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-[3px]"
                  style={{
                    backgroundColor:
                      v === 0 ? "oklch(0.22 0.025 265)"
                      : v === 1 ? "oklch(0.35 0.15 255)"
                      : v === 2 ? "oklch(0.50 0.20 255)"
                      : "oklch(0.62 0.22 255)",
                  }}
                />
              ))}
            </div>
            {!state.isPremium && (
              <button
                onClick={() => triggerPaywall()}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span
                  className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                  style={{
                    color: "var(--primary)",
                    background: "oklch(0.13 0.022 265 / 0.85)",
                    borderColor: "oklch(0.62 0.22 255 / 0.35)",
                  }}
                >
                  Tap to see your full streak
                </span>
              </button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            Less
            {["oklch(0.22 0.025 265)", "oklch(0.35 0.15 255)", "oklch(0.50 0.20 255)", "oklch(0.62 0.22 255)"].map(
              (bg) => (
                <span key={bg} className="h-2.5 w-2.5 rounded-sm" style={{ background: bg }} />
              )
            )}
            More
          </div>
        </div>
      </section>

      {/* ── Total clean days ─────────────────────────────────── */}
      <section className="px-6 mt-3">
        <button
          type="button"
          onClick={() => { if (!state.isPremium) triggerPaywall(); }}
          className="w-full text-left rounded-2xl border border-border/60 bg-card p-5 relative overflow-hidden"
        >
          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            Relapses don't erase progress
          </p>
          <p className={`mt-2 text-3xl font-bold tabular-nums ${state.isPremium ? "" : "blur-md select-none"}`}>
            {state.totalCleanDays}{" "}
            <span className="text-base font-normal text-muted-foreground">total clean days, ever</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Your brain remembers every single one.</p>
          {!state.isPremium && (
            <span
              className="absolute top-4 right-4 text-[10px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
              style={{
                color: "var(--primary)",
                borderColor: "oklch(0.62 0.22 255 / 0.3)",
                background: "oklch(0.62 0.22 255 / 0.08)",
              }}
            >
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </button>
      </section>

      {/* ── Mood graph ───────────────────────────────────────── */}
      <section className="px-6 mt-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <p className="text-sm font-semibold">Weekly mood</p>
          <p className="text-xs text-muted-foreground mb-4">Last 7 weeks</p>
          <div className="flex items-end gap-2 h-28">
            {mood.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{ height: `${(m / 5) * 100}%`, background: "var(--gradient-primary)" }}
                />
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recovery story ───────────────────────────────────── */}
      <section className="px-6 mt-3">
        <div
          className="rounded-2xl border border-primary/20 p-5 space-y-4"
          style={{ background: "oklch(0.62 0.22 255 / 0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center"
              style={{ background: "oklch(0.62 0.22 255 / 0.12)", color: "var(--primary)" }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Your Recovery Story</p>
              <p className="text-[11px] text-muted-foreground">This is not a streak. This is your history.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Days since you started",    value: `${daysSinceStart}` },
              { label: "Total clean days, ever",    value: `${state.totalCleanDays}` },
              { label: "Longest clean period",      value: `${longest} days` },
              { label: "Times you came back",       value: `${state.totalReturns}` },
              { label: "Relapses logged honestly",  value: `${state.relapses?.length ?? 0}` },
              { label: "App sessions",              value: `${totalLogins}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-bold tabular-nums">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
            "Every chapter counts. Every time you came back was a choice. Most people stop choosing."
          </p>
        </div>
      </section>

      {/* ── Badges ───────────────────────────────────────────── */}
      <section className="px-6 mt-3 pb-4">
        <p className="text-sm font-semibold mb-3">Badges</p>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(({ name, icon: Icon, earned }) => (
            <div
              key={name}
              className={`rounded-2xl border p-4 transition-all ${
                earned ? "border-primary/35" : "border-border/40 opacity-50"
              }`}
              style={earned ? { background: "oklch(0.62 0.22 255 / 0.08)" } : {}}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: earned ? "var(--primary)" : "var(--muted-foreground)" }}
              />
              <p className="mt-2 text-sm font-semibold">{name}</p>
              <p className="text-[10px] text-muted-foreground">{earned ? "Earned" : "Locked"}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

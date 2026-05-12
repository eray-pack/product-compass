import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Shield, Trophy, Lock } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

export const Route = createFileRoute("/progress")({
  component: ProgressScreen,
});

// ── Recovery ring SVG ─────────────────────────────────────────────────────────
function RecoveryRing({ pct, day }: { pct: number; day: number }) {
  const R = 76;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient glow behind ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196,135,58,0.18) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
      />
      <svg width="196" height="196" viewBox="0 0 196 196" className="ring-glow">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5E20" />
            <stop offset="100%" stopColor="#C4873A" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="98" cy="98" r={R} fill="none" stroke="#261F15" strokeWidth="11" />
        {/* Glow layer */}
        <circle
          cx="98" cy="98" r={R} fill="none"
          stroke="#C4873A" strokeWidth="22"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 98 98)"
          opacity="0.07"
        />
        {/* Progress arc */}
        <circle
          cx="98" cy="98" r={R} fill="none"
          stroke="url(#ring-grad)" strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 98 98)"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        {/* Center: percent */}
        <text
          x="98" y="86"
          textAnchor="middle" fontSize="30" fontWeight="700"
          fill="#f5ede0" fontFamily="'Space Grotesk', sans-serif"
        >
          {pct}%
        </text>
        {/* Center: day label */}
        <text
          x="98" y="108"
          textAnchor="middle" fontSize="13" fontWeight="500"
          fill="#a89580" fontFamily="'Space Grotesk', sans-serif"
        >
          day {day}
        </text>
        <text
          x="98" y="124"
          textAnchor="middle" fontSize="10"
          fill="#6b5e50" fontFamily="'Space Grotesk', sans-serif"
        >
          to reset
        </text>
      </svg>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function ProgressScreen() {
  const [state] = useAppState();
  const active = activeAddiction(state);
  if (!active) return null;

  const day = dayCount(active.startDate);
  const longest = longestCleanPeriod(state);
  const daysSinceStart = Math.floor((Date.now() - active.startDate) / 86400000);
  const totalLogins = state.loginHistory?.length ?? 0;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));

  const cells = Array.from({ length: 84 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const recent = i > 84 - day;
    if (recent) return r > 0.92 ? 0 : 3;
    return r > 0.7 ? 2 : r > 0.4 ? 1 : 0;
  });

  const badges = [
    { name: "First Week",        icon: Shield, earned: day >= 7  },
    { name: "30 Days",           icon: Award,  earned: day >= 30 },
    { name: "Survived 10 Urges", icon: Flame,  earned: state.urgesSurvived >= 10 },
    { name: "90 Day Warrior",    icon: Trophy, earned: day >= 90 },
  ];

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Progress</p>
      </header>

      {/* ── Recovery ring hero ──────────────────────────────── */}
      <section className="flex flex-col items-center pt-6 pb-4 px-6 fade-up-1">
        <RecoveryRing pct={recoveryPct} day={day} />
        <p className="mt-5 text-sm text-muted-foreground text-center max-w-[220px]">
          {recoveryPct < 100
            ? `${90 - day} days remaining to full brain reset`
            : "Full dopamine reset achieved. You did it."}
        </p>
      </section>

      {/* ── Inline key stats ────────────────────────────────── */}
      <div className="px-6 mt-2 flex divide-x fade-up-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{day}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Streak</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{longest}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Best</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{state.totalCleanDays}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total clean</p>
        </div>
      </div>

      {/* ── Streak calendar ─────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-3" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            Consistency
          </p>
          {!state.isPremium && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}
            >
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground/60 mb-4">Last 12 weeks</p>
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
            <button onClick={() => triggerPaywall()} className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                style={{
                  color: "var(--primary)",
                  background: "oklch(0.13 0.022 265 / 0.90)",
                  borderColor: "oklch(0.62 0.22 255 / 0.30)",
                }}
              >
                Tap to see your full streak
              </span>
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          Less
          {["oklch(0.22 0.025 265)", "oklch(0.35 0.15 255)", "oklch(0.50 0.20 255)", "oklch(0.62 0.22 255)"].map((bg) => (
            <span key={bg} className="h-2.5 w-2.5 rounded-sm" style={{ background: bg }} />
          ))}
          More
        </div>
      </section>

      {/* ── Your story ──────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Your Story</p>
        <p className="text-xs text-muted-foreground/60 mb-5">This is not a streak. This is your history.</p>
        <div className="space-y-0">
          {[
            { label: "Days since you started",   value: `${daysSinceStart}` },
            { label: "Total clean days, ever",   value: `${state.totalCleanDays}` },
            { label: "Longest clean period",     value: `${longest} days` },
            { label: "Times you came back",      value: `${state.totalReturns}` },
            { label: "Relapses logged honestly", value: `${state.relapses?.length ?? 0}` },
            { label: "App sessions",             value: `${totalLogins}` },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className="flex justify-between items-center py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid oklch(0.20 0.025 265 / 0.7)" : "none" }}
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-bold tabular-nums">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[12px] italic leading-relaxed" style={{ color: "oklch(0.52 0.015 265 / 0.65)" }}>
          "Every chapter counts. Every time you came back was a choice. Most people stop choosing."
        </p>
      </section>

      {/* ── Milestones ──────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 pb-8 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">Milestones</p>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(({ name, icon: Icon, earned }) => (
            <div
              key={name}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: earned ? "oklch(0.62 0.22 255 / 0.06)" : "transparent",
                border: earned ? "1px solid oklch(0.62 0.22 255 / 0.22)" : "1px solid oklch(0.22 0.025 265 / 0.6)",
                opacity: earned ? 1 : 0.4,
              }}
            >
              <Icon className="h-6 w-6" style={{ color: earned ? "var(--primary)" : "var(--muted-foreground)" }} />
              <p className="mt-3 text-sm font-semibold">{name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{earned ? "Earned" : "Locked"}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

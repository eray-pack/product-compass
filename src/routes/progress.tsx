import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

const GOLD = "#C9A84C";

const msContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const msItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

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
          <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feFlood floodColor="#C4873A" floodOpacity="0.45" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
          className="ring-text-primary"
          fontFamily="'Space Grotesk', sans-serif"
          filter="url(#amber-glow)"
        >
          {pct}%
        </text>
        {/* Center: day label */}
        <text
          x="98" y="108"
          textAnchor="middle" fontSize="13" fontWeight="500"
          className="ring-text-secondary"
          fontFamily="'Space Grotesk', sans-serif"
        >
          day {day}
        </text>
        <text
          x="98" y="124"
          textAnchor="middle" fontSize="10"
          className="ring-text-tertiary"
          fontFamily="'Space Grotesk', sans-serif"
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

  const urgesSurvived = state.urgesSurvived ?? 0;
  const milestones = [
    {
      name: "First Week",
      icon: "🛡️",
      earned: day >= 7,
      hint: `${Math.max(0, 7 - day)} day${Math.max(0, 7 - day) !== 1 ? "s" : ""} to go`,
    },
    {
      name: "30 Days",
      icon: "🎖️",
      earned: day >= 30,
      hint: `${Math.max(0, 30 - day)} days to go`,
    },
    {
      name: "Survived 10 Urges",
      icon: "🔥",
      earned: urgesSurvived >= 10,
      hint: `Complete ${Math.max(0, 10 - urgesSurvived)} more urges`,
    },
    {
      name: "90 Day Warrior",
      icon: "👑",
      earned: day >= 90,
      hint: `${Math.max(0, 90 - day)} days to go`,
    },
  ];
  const unlockedCount = milestones.filter((m) => m.earned).length;

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <SectionTitle>Progress</SectionTitle>
        <p style={{ fontSize: 13, color: "#ffffff", opacity: 0.45, marginTop: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>
          Track your recovery, day by day.
        </p>
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
          <SectionTitle>Consistency</SectionTitle>
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
                    v === 0 ? "rgba(201,168,76,0.12)"
                    : v === 1 ? "rgba(201,168,76,0.35)"
                    : v === 2 ? "rgba(201,168,76,0.60)"
                    : "#C9A84C",
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
          {["rgba(201,168,76,0.12)", "rgba(201,168,76,0.35)", "rgba(201,168,76,0.60)", "#C9A84C"].map((bg) => (
            <span key={bg} className="h-2.5 w-2.5 rounded-sm" style={{ background: bg }} />
          ))}
          More
        </div>
      </section>

      {/* ── Your story ──────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <SectionTitle>Your Story</SectionTitle>
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
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionTitle>Milestones</SectionTitle>
          <p style={{ fontSize: 11, color: "#3a3020", margin: 0 }}>
            {unlockedCount} of {milestones.length} unlocked
          </p>
        </div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={msContainer}
          initial="hidden"
          animate="visible"
        >
          {milestones.map(({ name, icon, earned, hint }, i) => (
            <motion.div
              key={name}
              // Unlocked: keyframe pop animation with staggered delay
              // Locked: stagger variant
              variants={earned ? undefined : msItem}
              initial={earned ? { scale: 0.9, opacity: 0 } : "hidden"}
              animate={earned ? { scale: [0.9, 1.05, 1], opacity: 1 } : "visible"}
              transition={
                earned
                  ? { duration: 0.5, times: [0, 0.6, 1], delay: i * 0.1 }
                  : { type: "spring", stiffness: 320, damping: 26 }
              }
              whileTap={{ scale: 0.97 }}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 16,
                padding: 16,
                background: earned ? "rgba(201,168,76,0.08)" : "#0f0c06",
                border: earned
                  ? "1.5px solid rgba(201,168,76,0.4)"
                  : "1px solid #1e1a10",
                boxShadow: earned ? "0 0 20px rgba(201,168,76,0.08)" : "none",
                opacity: earned ? 1 : 0.5,
              }}
            >
              {/* Gold shimmer — unlocked only */}
              {earned && (
                <motion.div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.08) 50%, transparent 60%)",
                    borderRadius: 16,
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                />
              )}

              {/* Icon circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: earned ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                  border: earned ? "1px solid rgba(201,168,76,0.3)" : "1px solid #2a2010",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  filter: earned ? "none" : "grayscale(1)",
                }}
              >
                {icon}
              </div>

              {/* Name */}
              <p
                style={{
                  marginTop: 10,
                  marginBottom: 0,
                  fontSize: 14,
                  fontWeight: earned ? 700 : 600,
                  color: earned ? "#fff" : "#555",
                  lineHeight: 1.3,
                }}
              >
                {name}
              </p>

              {/* Status */}
              {earned ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginTop: 6,
                    background: "rgba(201,168,76,0.15)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 10,
                    color: GOLD,
                  }}
                >
                  ✓ Achieved
                </div>
              ) : (
                <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11, color: "#3a3020" }}>
                  {hint}
                </p>
              )}

              {/* Lock icon — locked only */}
              {!earned && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    fontSize: 12,
                    color: "#2a2010",
                  }}
                >
                  🔒
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
    </PageShell>
  );
}

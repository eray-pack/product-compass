import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

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
function RecoveryRing({ pct, day, t }: { pct: number; day: number; t: TFunction }) {
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
          {t("progress.ring.day")} {day}
        </text>
        <text
          x="98" y="124"
          textAnchor="middle" fontSize="10"
          className="ring-text-tertiary"
          fontFamily="'Space Grotesk', sans-serif"
        >
          {t("progress.ring.toReset")}
        </text>
      </svg>
    </div>
  );
}

// ── Premium Coin Card ─────────────────────────────────────────────────────────
function CoinCard({
  name, icon, earned, hint, index, t,
}: {
  name: string; icon: string; earned: boolean; hint: string; index: number; t: TFunction;
}) {
  const spinControls = useAnimation();

  const handleClick = async () => {
    if (!earned) return;
    await spinControls.start({
      rotateY: 360,
      transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
    });
    spinControls.set({ rotateY: 0 });
  };

  return (
    // Outer wrapper handles stagger entry
    <motion.div
      variants={earned ? undefined : msItem}
      initial={earned ? { scale: 0.82, opacity: 0 } : "hidden"}
      animate={earned ? { scale: [0.82, 1.08, 1], opacity: 1 } : "visible"}
      transition={
        earned
          ? { duration: 0.55, times: [0, 0.6, 1], delay: index * 0.1 }
          : { type: "spring", stiffness: 320, damping: 26 }
      }
    >
      {/* Inner wrapper handles interactivity + spin */}
      <motion.div
        animate={spinControls}
        whileHover={earned ? { scale: 1.05, y: -4, transition: { duration: 0.2, ease: "easeOut" } } : undefined}
        whileTap={earned ? { scale: 0.96 } : undefined}
        onClick={handleClick}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          padding: 16,
          cursor: earned ? "pointer" : "default",
          background: earned
            ? "rgba(201,168,76,0.08)"
            : "#0f0c06",
          border: earned ? "1.5px solid rgba(201,168,76,0.4)" : "1px solid #2a2010",
          boxShadow: earned
            ? "0 0 20px rgba(201,168,76,0.08)"
            : "none",
          opacity: 1,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* ── Diagonal shimmer sweep — unlocked only ── */}
        {earned && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: 16,
              background:
                "linear-gradient(108deg, transparent 30%, rgba(255,220,120,0.06) 46%, rgba(201,168,76,0.20) 50%, rgba(255,220,120,0.06) 54%, transparent 70%)",
            }}
            animate={{ x: ["-110%", "210%"] }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          />
        )}

        {/* ── Icon circle ── */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: earned
              ? "radial-gradient(circle at 35% 30%, rgba(255,230,140,0.28), rgba(201,168,76,0.10))"
              : "rgba(255,255,255,0.03)",
            border: earned
              ? "1.5px solid rgba(201,168,76,0.45)"
              : "1px solid #2a2010",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            filter: earned
              ? "drop-shadow(0 2px 10px rgba(201,168,76,0.5))"
              : "grayscale(1) opacity(0.5)",
            boxShadow: earned ? "0 0 18px rgba(201,168,76,0.30)" : "none",
          }}
        >
          {icon}
        </div>

        {/* ── Name ── */}
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: 14,
            fontWeight: earned ? 700 : 600,
            color: earned ? "#ffffff" : "rgba(255,255,255,0.5)",
            lineHeight: 1.3,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {name}
        </p>

        {/* ── Status pill or progress hint ── */}
        {earned ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginTop: 8,
              background: "rgba(201,168,76,0.14)",
              border: "1px solid rgba(201,168,76,0.38)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: GOLD,
            }}
          >
            ✓ {t("progress.achieved")}
          </div>
        ) : (
          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              fontSize: 11,
              color: "#3a3020",
              lineHeight: 1.45,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {hint}
          </p>
        )}

        {/* ── Lock badge — locked cards ── */}
        {!earned && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#0f0c06",
              border: "1px solid #2a2010",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={16} color="#2a2010" strokeWidth={2.5} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function ProgressScreen() {
  const { t } = useTranslation();
  const [state] = useAppState();
  const [progressView, setProgressView] = useState<"grid" | "bars" | "streak">("grid");
  const active = activeAddiction(state);
  if (!active) return null;

  const day = dayCount(active.startDate);
  const longest = longestCleanPeriod(state);
  const daysSinceStart = Math.floor((Date.now() - active.startDate) / 86400000);
  const totalLogins = state.loginHistory?.length ?? 0;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));

  // Real login heatmap — 84 days (12 weeks), 1 cell per day
  const loginDaySet = new Set(
    (state.loginHistory ?? []).map((ts) => new Date(ts).toISOString().slice(0, 10))
  );
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(Date.now() - (83 - i) * 86400000);
    return loginDaySet.has(d.toISOString().slice(0, 10)) ? 3 : 0;
  });

  // Weekly bar chart — last 8 weeks, count unique login days per week
  const weekBars = Array.from({ length: 8 }, (_, w) => {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const dayOffset = (7 - w) * 7 - d - 1;
      const dateStr = new Date(Date.now() - dayOffset * 86400000).toISOString().slice(0, 10);
      if (loginDaySet.has(dateStr)) count++;
    }
    return count; // 0–7
  });

  const urgesSurvived = state.urgesSurvived ?? 0;
  const rem7 = Math.max(0, 7 - day);
  const milestones = [
    {
      name: t("progress.milestones.firstWeek"),
      icon: "🛡️",
      earned: day >= 7,
      hint: rem7 === 0 ? t("progress.milestones.done") : rem7 === 1 ? t("progress.milestones.firstWeek_remaining", { count: rem7 }) : t("progress.milestones.firstWeek_remaining_plural", { count: rem7 }),
    },
    {
      name: t("progress.milestones.thirtyDays"),
      icon: "🎖️",
      earned: day >= 30,
      hint: day >= 30 ? t("progress.milestones.done") : t("progress.milestones.thirtyDays_remaining", { count: Math.max(0, 30 - day) }),
    },
    {
      name: t("progress.milestones.tenUrges"),
      icon: "🔥",
      earned: urgesSurvived >= 10,
      hint: urgesSurvived >= 10 ? t("progress.milestones.done") : Math.max(0, 10 - urgesSurvived) === 1 ? t("progress.milestones.tenUrges_remaining", { count: 1 }) : t("progress.milestones.tenUrges_remaining_plural", { count: Math.max(0, 10 - urgesSurvived) }),
    },
    {
      name: t("progress.milestones.ninetyDays"),
      icon: "👑",
      earned: day >= 90,
      hint: day >= 90 ? t("progress.milestones.done") : t("progress.milestones.ninetyDays_remaining", { count: Math.max(0, 90 - day) }),
    },
  ];
  const unlockedCount = milestones.filter((m) => m.earned).length;

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <SectionTitle>{t("nav.progress")}</SectionTitle>
        <p style={{ fontSize: 13, color: "#ffffff", opacity: 0.45, marginTop: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>
          {t("progress.header")}
        </p>
      </header>

      {/* ── Recovery ring hero ──────────────────────────────── */}
      <section className="flex flex-col items-center pt-6 pb-4 px-6 fade-up-1">
        <RecoveryRing pct={recoveryPct} day={day} t={t} />
        <p className="mt-5 text-sm text-muted-foreground text-center max-w-[220px]">
          {recoveryPct < 100
            ? t("progress.ring.daysRemaining", { count: 90 - day })
            : t("progress.ring.achieved")}
        </p>
      </section>

      {/* ── Inline key stats ────────────────────────────────── */}
      <div className="px-6 mt-2 flex divide-x fade-up-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{day}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.streak")}</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{longest}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.best")}</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{state.totalCleanDays}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.total")}</p>
        </div>
      </div>

      {/* ── Consistency ─────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-3" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-center justify-between mb-3">
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

        {/* View toggle — segmented control */}
        <style>{`
          .cs-tab:hover { background: rgba(201,168,76,0.07) !important; color: rgba(201,168,76,0.70) !important; border-color: rgba(201,168,76,0.28) !important; }
          .cs-tab:hover svg { opacity: 0.85 !important; }
        `}</style>
        <div
          className="flex mb-4"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {([
            {
              key: "grid", label: "Heatmap", desc: "Days you opened the app",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  {[0,1,2,3].map(col => [0,1,2].map(row => (
                    <rect key={`${col}-${row}`} x={col * 3.2} y={row * 3.2} width="2.4" height="2.4" rx="0.5"
                      fill="currentColor" opacity={col === 0 && row === 0 ? 0.3 : col === 3 || row === 2 ? 0.9 : 0.6} />
                  )))}
                </svg>
              ),
            },
            {
              key: "bars", label: "Weekly", desc: "Check-ins per week",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="0"   y="7"  width="2.2" height="5"   rx="0.6" fill="currentColor" opacity="0.45"/>
                  <rect x="3.2" y="4"  width="2.2" height="8"   rx="0.6" fill="currentColor" opacity="0.70"/>
                  <rect x="6.4" y="2"  width="2.2" height="10"  rx="0.6" fill="currentColor" opacity="0.90"/>
                  <rect x="9.6" y="5"  width="2.2" height="7"   rx="0.6" fill="currentColor" opacity="0.60"/>
                </svg>
              ),
            },
            {
              key: "streak", label: "Streak", desc: "Your clean day run",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6.5 1 C6.5 1 9 4 8.5 6.5 C8 9 6 10.5 6 10.5 C6 10.5 7 8.5 5.5 7 C5.5 7 5.5 9 4 10 C4 10 2 8 3 6 C4 4 6.5 1 6.5 1Z"
                    fill="currentColor" opacity="0.9"/>
                </svg>
              ),
            },
          ] as const).map(({ key, label, desc, icon }) => {
            const active = progressView === key;
            return (
              <button
                key={key}
                className="cs-tab"
                onClick={() => setProgressView(key)}
                title={desc}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px 4px",
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  border: active
                    ? "1px solid rgba(201,168,76,0.45)"
                    : "1px solid rgba(255,215,0,0.12)",
                  background: active
                    ? "rgba(201,168,76,0.14)"
                    : "rgba(255,255,255,0.04)",
                  color: active ? "#C9A84C" : "rgba(255,255,255,0.50)",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: active ? "0 0 12px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,215,0,0.10)" : "none",
                }}
              >
                <span style={{ display: "flex", color: active ? "#C9A84C" : "rgba(255,255,255,0.40)", transition: "all 0.18s ease" }}>
                  {icon}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* View content */}
        <div className="relative">
          <div className={state.isPremium ? "" : "blur-[5px] select-none pointer-events-none"}>

            {/* ── GRID view ── */}
            {progressView === "grid" && (
              <div>
                <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Each square = one day you opened Stopamine · last 12 weeks
                </p>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {cells.map((v, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-[3px]"
                      style={{ backgroundColor: v === 0 ? "rgba(255,255,255,0.06)" : "#3fb86a" }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Less
                  {["rgba(255,255,255,0.06)", "#3fb86a"].map((bg) => (
                    <span key={bg} className="h-2.5 w-2.5 rounded-sm" style={{ background: bg }} />
                  ))}
                  More
                </div>
              </div>
            )}

            {/* ── BARS view ── */}
            {progressView === "bars" && (
              <div>
                <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Days you checked in each week · last 8 weeks
                </p>
                <div className="flex items-end gap-2" style={{ height: 80 }}>
                  {weekBars.map((count, i) => {
                    const isLast = i === weekBars.length - 1;
                    const pct = count / 7;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{
                            width: "100%",
                            height: Math.max(4, pct * 68),
                            borderRadius: 6,
                            background: isLast
                              ? "linear-gradient(180deg, #C9A84C, #a07830)"
                              : pct > 0.5 ? "#3fb86a" : pct > 0 ? "#2d8a4e" : "rgba(255,255,255,0.06)",
                            boxShadow: isLast ? "0 0 12px rgba(201,168,76,0.35)" : "none",
                            transition: "height 0.4s ease",
                          }}
                        />
                        <span style={{ fontSize: 9, color: isLast ? "#C9A84C" : "rgba(255,255,255,0.25)" }}>
                          {count}d
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-right text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>← older · newer →</p>
              </div>
            )}

            {/* ── STREAK view ── */}
            {progressView === "streak" && (
              <div className="flex flex-col items-center py-2 gap-4">
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Your current clean run
                </p>
                <div className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: 56, lineHeight: 1 }}>🔥</span>
                  <span style={{ fontSize: 48, fontWeight: 900, color: "#C9A84C", lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", letterSpacing: "0.08em" }}>DAYS CLEAN</span>
                </div>
                {/* Milestone markers */}
                <div className="flex gap-3 mt-1">
                  {[
                    { label: "7d", threshold: 7, icon: "🛡️" },
                    { label: "30d", threshold: 30, icon: "🎖️" },
                    { label: "90d", threshold: 90, icon: "👑" },
                  ].map(({ label, threshold, icon }) => {
                    const earned = day >= threshold;
                    return (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                        style={{
                          padding: "8px 14px",
                          borderRadius: 12,
                          background: earned ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.03)",
                          border: earned ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.06)",
                          opacity: earned ? 1 : 0.4,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: earned ? "#C9A84C" : "rgba(255,255,255,0.4)" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                {day < 7 && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", textAlign: "center" }}>
                    {7 - day} more day{7 - day !== 1 ? "s" : ""} until your first shield 🛡️
                  </p>
                )}
              </div>
            )}
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
                Unlock with PRO
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ── Your story ──────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <SectionTitle>{t("progress.story.title")}</SectionTitle>
        <p className="text-xs text-muted-foreground/60 mb-5">{t("progress.story.subtitle")}</p>
        <div className="space-y-0">
          {[
            { label: t("progress.story.daysSince"),  value: `${daysSinceStart}` },
            { label: t("progress.story.totalClean"), value: `${state.totalCleanDays}` },
            { label: t("progress.story.longest"),    value: t("progress.story.longestValue", { count: longest }) },
            { label: t("progress.story.timesBack"),  value: `${state.totalReturns}` },
            { label: t("progress.story.relapses"),   value: `${state.relapses?.length ?? 0}` },
            { label: t("progress.story.sessions"),   value: `${totalLogins}` },
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
          "{t("progress.story.quote")}"
        </p>
      </section>

      {/* ── Relapse Insights (PRO) ──────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">{t("progress.insights.title")}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{t("progress.insights.subtitle")}</p>
          </div>
          {!state.isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}>
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </div>
        <div className="relative">
          <div className={state.isPremium ? "" : "blur-[6px] select-none pointer-events-none"}>
            {(() => {
              const relapses = state.relapses ?? [];
              const dowKeys = [0,1,2,3,4,5,6].map(i => t(`progress.insights.dow.${i}`));
              const dayCounts = Array(7).fill(0);
              const hourCounts = Array(4).fill(0); // morning/afternoon/evening/night
              relapses.forEach(r => {
                const d = new Date(r.ts);
                dayCounts[d.getDay()]++;
                const h = d.getHours();
                if (h < 6) hourCounts[3]++;
                else if (h < 12) hourCounts[0]++;
                else if (h < 18) hourCounts[1]++;
                else hourCounts[2]++;
              });
              const peakDay = dowKeys[dayCounts.indexOf(Math.max(...dayCounts))];
              const peakTime = [
                t("progress.insights.morning"),
                t("progress.insights.afternoon"),
                t("progress.insights.evening"),
                t("progress.insights.night"),
              ][hourCounts.indexOf(Math.max(...hourCounts))];
              const total = relapses.length;
              return (
                <div className="space-y-3">
                  {[
                    { label: t("progress.insights.total"),     value: total > 0 ? `${total}` : t("progress.insights.none") },
                    { label: t("progress.insights.peakDay"),   value: total > 0 ? peakDay : t("progress.insights.na") },
                    { label: t("progress.insights.peakTime"),  value: total > 0 ? peakTime : t("progress.insights.na") },
                    { label: t("progress.insights.avgBetween"), value: total > 1
                      ? t("progress.insights.avgValue", { count: Math.round((relapses[relapses.length - 1].ts - relapses[0].ts) / (1000 * 60 * 60 * 24 * (total - 1))) })
                      : t("progress.insights.na") },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className="flex justify-between items-center py-3"
                      style={{ borderBottom: i < arr.length - 1 ? "1px solid oklch(0.20 0.025 265 / 0.7)" : "none" }}>
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          {!state.isPremium && (
            <button onClick={() => triggerPaywall()} className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                style={{ color: "var(--primary)", background: "oklch(0.13 0.022 265 / 0.90)", borderColor: "oklch(0.62 0.22 255 / 0.30)" }}>
                {t("progress.insights.paywallCta")}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ── Milestones ──────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 pb-8 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionTitle>{t("progress.milestonesTitle")}</SectionTitle>
          <p style={{ fontSize: 11, color: "#5a4a30", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
            {t("progress.milestonesUnlocked", { count: unlockedCount, total: milestones.length })}
          </p>
        </div>

        {/* Coin cards grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={msContainer}
          initial="hidden"
          animate="visible"
        >
          {milestones.map(({ name, icon, earned, hint }, i) => (
            <CoinCard
              key={name}
              name={name}
              icon={icon}
              earned={earned}
              hint={hint}
              index={i}
              t={t}
            />
          ))}
        </motion.div>
      </section>
    </PageShell>
  );
}

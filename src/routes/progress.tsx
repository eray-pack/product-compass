import { createFileRoute } from "@tanstack/react-router";
import { Lock, Hourglass, Smartphone, CalendarDays, Zap } from "lucide-react";
import { useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
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

// ── Neural Green palette ──────────────────────────────────────────────────────
const NG = "#39d98a";          // primary neural green
const NG_DIM = "#1a6640";      // dim track green
const NG_GLOW = "rgba(57,217,138,";  // rgba prefix

// ── Neural Core ───────────────────────────────────────────────────────────────
function NeuralCore({ pct, day }: { pct: number; day: number }) {
  const R = 76;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  // Pulse speed: faster with longer streaks (1.6–4.5s)
  const pulseDur  = Math.max(1.6, 4.5 - day * 0.028);
  // Glow intensity: 0.20 → 0.70
  const glowAlpha = Math.min(0.70, 0.20 + day * 0.008);

  // 12 neural nodes at r=92
  const nodes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    const active = i / 12 <= pct / 100;
    return { x: 98 + 92 * Math.cos(a), y: 98 + 92 * Math.sin(a), active };
  });

  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes nc-node    { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes nc-nebula1 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-12px) scale(1.08)} 66%{transform:translate(-10px,14px) scale(0.95)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes nc-nebula2 { 0%{transform:translate(0,0) scale(1)} 40%{transform:translate(-20px,10px) scale(1.10)} 70%{transform:translate(14px,-8px) scale(0.94)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes nc-nebula3 { 0%{transform:translate(0,0)} 50%{transform:translate(8px,16px) scale(1.06)} 100%{transform:translate(0,0)} }
      `}</style>

      {/* ── Nebula energy field — three slow-drifting blobs ── */}
      <div aria-hidden style={{ position:"absolute", inset:-60, pointerEvents:"none", overflow:"visible" }}>
        <div style={{
          position:"absolute", top:"10%", left:"5%", width:180, height:180, borderRadius:"50%",
          background:`radial-gradient(circle, ${NG_GLOW}${(glowAlpha*0.32).toFixed(2)}) 0%, transparent 70%)`,
          filter:"blur(36px)", animation:`nc-nebula1 ${pulseDur * 3.5}s ease-in-out infinite`,
        }}/>
        <div style={{
          position:"absolute", top:"30%", right:"8%", width:140, height:140, borderRadius:"50%",
          background:`radial-gradient(circle, ${NG_GLOW}${(glowAlpha*0.22).toFixed(2)}) 0%, transparent 65%)`,
          filter:"blur(28px)", animation:`nc-nebula2 ${pulseDur * 4.2}s ease-in-out infinite`,
        }}/>
        <div style={{
          position:"absolute", bottom:"5%", left:"20%", width:120, height:120, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(16,185,129,${(glowAlpha*0.18).toFixed(2)}) 0%, transparent 70%)`,
          filter:"blur(24px)", animation:`nc-nebula3 ${pulseDur * 5}s ease-in-out infinite`,
        }}/>
      </div>

      {/* Primary pulse halo */}
      <motion.div aria-hidden
        animate={{ opacity:[glowAlpha*0.55, glowAlpha, glowAlpha*0.55], scale:[0.90,1.10,0.90] }}
        transition={{ repeat:Infinity, duration:pulseDur, ease:"easeInOut" }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background:`radial-gradient(circle, ${NG_GLOW}${glowAlpha}) 0%, transparent 62%)`, filter:"blur(32px)" }}
      />
      {/* Secondary halo — wider, offset */}
      <motion.div aria-hidden
        animate={{ opacity:[0.05,0.14,0.05], scale:[1,1.22,1] }}
        transition={{ repeat:Infinity, duration:pulseDur*1.6, ease:"easeInOut", delay:pulseDur*0.5 }}
        className="absolute rounded-full pointer-events-none"
        style={{ inset:-28, background:`radial-gradient(circle, ${NG_GLOW}0.12) 0%, transparent 55%)`, filter:"blur(22px)" }}
      />

      <svg width="216" height="216" viewBox="0 0 196 196" overflow="visible">
        <defs>
          <linearGradient id="nc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1a6640"/>
            <stop offset="50%"  stopColor="#39d98a"/>
            <stop offset="100%" stopColor="#6effc5"/>
          </linearGradient>
          <filter id="nc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="b"/>
            <feFlood floodColor={NG} floodOpacity="0.60" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="nc-node-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feFlood floodColor={NG} floodOpacity="0.90" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Tick dial — 24 marks */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 - 90) * (Math.PI / 180);
          const isMain = i % 6 === 0;
          return (
            <line key={i}
              x1={98 + 91 * Math.cos(a)} y1={98 + 91 * Math.sin(a)}
              x2={98 + (isMain ? 97 : 94) * Math.cos(a)} y2={98 + (isMain ? 97 : 94) * Math.sin(a)}
              stroke={`rgba(57,217,138,${isMain ? 0.55 : 0.18})`}
              strokeWidth={isMain ? 1.4 : 0.7} strokeLinecap="round"
            />
          );
        })}

        {/* Track */}
        <circle cx="98" cy="98" r={R} fill="none" stroke="rgba(57,217,138,0.08)" strokeWidth="12"/>

        {/* Broad spread glow behind arc */}
        <circle cx="98" cy="98" r={R} fill="none"
          stroke={NG} strokeWidth="28"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 98 98)"
          opacity={glowAlpha * 0.15}
        />

        {/* Progress arc — rounded cap, green gradient */}
        <circle cx="98" cy="98" r={R} fill="none"
          stroke="url(#nc-grad)" strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 98 98)"
          filter="url(#nc-glow)"
          style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />

        {/* Neural nodes */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y}
            r={n.active ? 3.2 : 1.6}
            fill={n.active ? NG : "rgba(57,217,138,0.12)"}
            stroke={n.active ? NG : "rgba(57,217,138,0.20)"} strokeWidth="0.8"
            filter={n.active ? "url(#nc-node-glow)" : "none"}
            opacity={n.active ? 1 : 0.30}
            style={n.active ? { animation:`nc-node ${pulseDur}s ease-in-out ${i*0.13}s infinite` } : {}}
          />
        ))}

        {/* Connector lines: active nodes → center */}
        {nodes.filter(n => n.active).map((n, i) => (
          <line key={i} x1={n.x} y1={n.y} x2="98" y2="98"
            stroke={NG} strokeWidth="0.5" opacity="0.07"/>
        ))}

        {/* Center — day count */}
        <text x="98" y="89" textAnchor="middle" fontSize="36" fontWeight="900"
          fill="#ffffff" fontFamily="'DM Sans', sans-serif" letterSpacing="-1.5"
          filter="url(#nc-glow)">
          {day}
        </text>
        <text x="98" y="107" textAnchor="middle" fontSize="10" fontWeight="700"
          fill="rgba(255,255,255,0.60)" fontFamily="'DM Sans', sans-serif" letterSpacing="0.14em">
          DAYS CLEAN
        </text>
        <text x="98" y="121" textAnchor="middle" fontSize="9"
          fill={`${NG_GLOW}0.60)`} fontFamily="'DM Sans', sans-serif" letterSpacing="0.08em">
          {pct}% TO 90d
        </text>
      </svg>

      {/* NEURAL CORE label — pure white, bold */}
      <div style={{
        position:"absolute", bottom:-4,
        fontSize:9, fontWeight:800, letterSpacing:"0.28em", textTransform:"uppercase",
        color:"#ffffff", fontFamily:"DM Sans, sans-serif",
        textShadow:`0 0 12px ${NG_GLOW}0.70)`,
      }}>
        ◆ NEURAL CORE ◆
      </div>
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

// ── Legacy rank tiers (driven by total clean days ever) ──────────────────────
const RANK_TIERS = [
  { min: 90, name: "Sovereign",  roman: "IV", color: "#E8C87A", glow: "rgba(232,200,122,0.38)", desc: "You have mastered the battle within." },
  { min: 30, name: "Sentinel",   roman: "III", color: "#7ec8e3", glow: "rgba(126,200,227,0.28)", desc: "A month of discipline forged your will." },
  { min: 7,  name: "Guardian",   roman: "II",  color: "#a8c87c", glow: "rgba(168,200,124,0.26)", desc: "You have survived the first test." },
  { min: 0,  name: "Initiate",   roman: "I",   color: "rgba(255,255,255,0.55)", glow: "rgba(255,255,255,0.08)", desc: "The path begins here. Keep going." },
] as const;

function getRank(totalDays: number) {
  return RANK_TIERS.find((r) => totalDays >= r.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

// ── Sacred card shell (stone-textured) ───────────────────────────────────────
const STONE_CARD: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(22,16,7,0.97) 0%, rgba(12,9,3,0.99) 100%)",
  border: "1px solid rgba(201,168,76,0.16)",
  borderTop: "1px solid rgba(201,168,76,0.30)",
  borderRadius: 18,
  position: "relative",
  overflow: "hidden",
};

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

  // ── Legacy rank ──────────────────────────────────────────────────────────────
  const rank = getRank(state.totalCleanDays);
  const nextRankTier = RANK_TIERS.slice().reverse().find((r) => state.totalCleanDays < r.min && r.min > 0);
  const daysToNextRank = nextRankTier ? nextRankTier.min - state.totalCleanDays : 0;

  // ── Dopamine dashboard data ───────────────────────────────────────────────
  const relapses = state.relapses ?? [];
  const avgRelapseDays = relapses.length > 1
    ? Math.round((relapses[relapses.length - 1].ts - relapses[0].ts) / ((relapses.length - 1) * 86400000))
    : null;
  const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DOW_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dowCounts = Array(7).fill(0);
  const hourCounts = Array(4).fill(0); // morning/afternoon/evening/night
  relapses.forEach((r) => {
    const d = new Date(r.ts);
    dowCounts[d.getDay()]++;
    const h = d.getHours();
    if (h < 6) hourCounts[3]++; else if (h < 12) hourCounts[0]++; else if (h < 18) hourCounts[1]++; else hourCounts[2]++;
  });
  const peakDow      = dowCounts.every((c) => c === 0) ? null : DOW_NAMES[dowCounts.indexOf(Math.max(...dowCounts))];
  const peakDowIndex = dowCounts.every((c) => c === 0) ? -1   : dowCounts.indexOf(Math.max(...dowCounts));
  const peakDowFull  = peakDowIndex >= 0 ? DOW_FULL[peakDowIndex] : null;
  const peakTimeName = ["morning","afternoon","evening","late night"][hourCounts.indexOf(Math.max(...hourCounts))];
  const recentRelapse = relapses.some((r) => Date.now() - r.ts < 48 * 3600_000);
  const hasDeepRoots = state.treeUnlocks?.includes("root-deep");

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

      {/* ── Neural Core hero ──────────────────────────────── */}
      <section className="flex flex-col items-center pt-6 pb-4 px-6 fade-up-1">
        <NeuralCore pct={recoveryPct} day={day} />
        <p className="mt-6 text-sm text-muted-foreground text-center max-w-[220px]">
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

      {/* ══════════════════════════════════════════════════════
           LEGACY RANK CARD
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-6 fade-up-2">
        <style>{`
          @keyframes rank-halo { 0%,100%{opacity:0.55;transform:scale(0.96)} 50%{opacity:1;transform:scale(1.06)} }
          @keyframes rank-rune  { 0%,100%{opacity:0.12} 50%{opacity:0.22} }
        `}</style>
        <div style={{ ...STONE_CARD, padding: "20px 20px 18px" }}>
          {/* Stone grain overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
            background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.018) 8px, rgba(201,168,76,0.018) 9px)",
          }}/>
          {/* Corner runes */}
          {["top-left","top-right"].map((pos) => (
            <svg key={pos} aria-hidden width="22" height="22" viewBox="0 0 22 22" fill="none" style={{
              position: "absolute",
              top: pos.includes("top") ? 10 : undefined, bottom: pos.includes("bottom") ? 10 : undefined,
              left: pos.includes("left") ? 10 : undefined, right: pos.includes("right") ? 10 : undefined,
              animation: "rank-rune 4s ease-in-out infinite",
            }}>
              <path d="M2 2 L2 10 M2 2 L10 2" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="2" cy="2" r="1.5" fill="#C9A84C" opacity="0.6"/>
            </svg>
          ))}

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            {/* Rank badge circle */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div aria-hidden style={{
                position: "absolute", inset: -10, borderRadius: "50%",
                background: `radial-gradient(circle, ${rank.glow} 0%, transparent 70%)`,
                filter: "blur(10px)", animation: "rank-halo 3.5s ease-in-out infinite",
              }}/>
              <div style={{
                width: 62, height: 62, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, rgba(255,240,180,0.12) 0%, rgba(10,7,2,0.98) 60%)`,
                border: `1.5px solid ${rank.color}55`,
                boxShadow: `0 0 20px ${rank.glow}, inset 0 0 12px rgba(0,0,0,0.8)`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: rank.color, letterSpacing: "0.18em", fontFamily: "DM Sans, sans-serif" }}>
                  {rank.roman}
                </span>
                <div style={{ width: 20, height: 1, background: `${rank.color}55` }}/>
              </div>
            </div>

            {/* Text block */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: `${rank.color}99`, fontFamily: "DM Sans, sans-serif" }}>
                Legacy Rank
              </p>
              <h2 style={{
                margin: "3px 0 2px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 24, fontStyle: "italic", fontWeight: 600,
                color: rank.color, lineHeight: 1.1,
                textShadow: `0 0 24px ${rank.glow}`,
              }}>
                {rank.name}
              </h2>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.45, fontFamily: "DM Sans, sans-serif" }}>
                {rank.desc}
              </p>
            </div>

            {/* Total clean days */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: rank.color, lineHeight: 1, fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.02em" }}>
                {state.totalCleanDays}
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.30)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>
                total days
              </p>
              {daysToNextRank > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: 9, color: `${rank.color}80`, fontFamily: "DM Sans, sans-serif" }}>
                  +{daysToNextRank}d → {nextRankTier?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           DOPAMINE DASHBOARD GRID
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-5 fade-up-3">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Dopamine Dashboard</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

          {/* Card 1 — Avg Relapse Frequency */}
          <div style={{ ...STONE_CARD, padding: "16px 14px" }}>
            <div aria-hidden style={{
              position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
              background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.014) 8px, rgba(201,168,76,0.014) 9px)",
            }}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.28)",
                display: "grid", placeItems: "center", marginBottom: 10,
              }}>
                <Hourglass size={14} color="#C9A84C" strokeWidth={1.8}/>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#f5ede0", letterSpacing: "-0.02em", fontFamily: "DM Sans, sans-serif" }}>
                {avgRelapseDays !== null ? `${avgRelapseDays}d` : "—"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>
                Avg relapse<br/>frequency
              </p>
            </div>
          </div>

          {/* Card 2 — Total App Sessions */}
          <div style={{ ...STONE_CARD, padding: "16px 14px" }}>
            <div aria-hidden style={{
              position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
              background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.014) 8px, rgba(201,168,76,0.014) 9px)",
            }}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "rgba(126,200,227,0.10)", border: "1px solid rgba(126,200,227,0.22)",
                display: "grid", placeItems: "center", marginBottom: 10,
              }}>
                <Smartphone size={14} color="#7ec8e3" strokeWidth={1.8}/>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#f5ede0", letterSpacing: "-0.02em", fontFamily: "DM Sans, sans-serif" }}>
                {totalLogins}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>
                Total logged<br/>app sessions
              </p>
            </div>
          </div>

          {/* Card 3 — Most Challenging Weekday */}
          <div style={{ ...STONE_CARD, padding: "16px 14px" }}>
            <div aria-hidden style={{
              position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
              background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.014) 8px, rgba(201,168,76,0.014) 9px)",
            }}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "rgba(240,100,80,0.10)", border: "1px solid rgba(240,100,80,0.22)",
                display: "grid", placeItems: "center", marginBottom: 10,
              }}>
                <CalendarDays size={14} color="#f06450" strokeWidth={1.8}/>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#f5ede0", letterSpacing: "-0.02em", fontFamily: "DM Sans, sans-serif" }}>
                {peakDow ?? "—"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>
                Most challenging<br/>weekday
              </p>
            </div>
          </div>

          {/* Card 4 — Level Multiplier */}
          <div style={{ ...STONE_CARD, padding: "16px 14px" }}>
            <div aria-hidden style={{
              position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
              background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.014) 8px, rgba(201,168,76,0.014) 9px)",
            }}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "rgba(168,200,124,0.10)", border: "1px solid rgba(168,200,124,0.22)",
                display: "grid", placeItems: "center", marginBottom: 10,
              }}>
                <Zap size={14} color="#a8c87c" strokeWidth={1.8}/>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: hasDeepRoots ? "#a8c87c" : "#f5ede0", letterSpacing: "-0.02em", fontFamily: "DM Sans, sans-serif" }}>
                {hasDeepRoots ? "×1.1" : "×1.0"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4, fontFamily: "DM Sans, sans-serif" }}>
                XP / credit<br/>multiplier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           VERTICAL MILESTONE TIMELINE
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-6 fade-up-3">
        <style>{`
          @keyframes tl-pulse { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.18)} }
          @keyframes tl-flow  { 0%{background-position:0% 0%} 100%{background-position:0% 100%} }
        `}</style>
        <SectionTitle>Milestones</SectionTitle>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", margin: "4px 0 18px", fontFamily: "DM Sans, sans-serif" }}>
          Your journey, carved in stone
        </p>

        <div style={{ position: "relative", paddingLeft: 36 }}>
          {/* Glowing vertical energy path — Neural Green */}
          <div aria-hidden style={{
            position: "absolute", left: 11, top: 8, bottom: 8, width: 2,
            background: `linear-gradient(180deg, ${NG_GLOW}0.70) 0%, ${NG_GLOW}0.28) 60%, ${NG_GLOW}0.06) 100%)`,
            borderRadius: 2,
            boxShadow: `0 0 10px ${NG_GLOW}0.35)`,
          }}/>

          {([
            { label: "First step taken",    sub: "Day 1 — the hardest",            earned: true,                  icon: "🌱" },
            { label: "First Week",          sub: "7 days of resolve",              earned: day >= 7,              icon: "🛡️" },
            { label: "10 Urges Survived",   sub: `${urgesSurvived}/10 resisted`,   earned: urgesSurvived >= 10,   icon: "🔥" },
            { label: "One Month",           sub: "30 days of momentum",            earned: day >= 30,             icon: "🎖️" },
            { label: "Sovereign — 90 Days", sub: "The highest honour",             earned: day >= 90,             icon: "👑" },
          ]).map((m, i, arr) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 14,
                marginBottom: i < arr.length - 1 ? 20 : 0,
              }}
            >
              {/* Node dot — Neural Green when earned */}
              <div style={{
                position: "absolute", left: -28,
                width: 22, height: 22, borderRadius: "50%",
                background: m.earned
                  ? `radial-gradient(circle at 38% 35%, ${NG_GLOW}0.22) 0%, rgba(10,7,2,0.98) 65%)`
                  : "rgba(12,9,3,0.98)",
                border: `1.5px solid ${m.earned ? `${NG_GLOW}0.65)` : "rgba(255,255,255,0.10)"}`,
                boxShadow: m.earned ? `0 0 14px ${NG_GLOW}0.50)` : "none",
                display: "grid", placeItems: "center",
                animation: m.earned ? "tl-pulse 3s ease-in-out infinite" : "none",
                zIndex: 1,
              }}>
                <span style={{ fontSize: 11 }}>{m.icon}</span>
              </div>

              {/* Card */}
              <div style={{
                flex: 1,
                ...STONE_CARD,
                padding: "12px 14px",
                opacity: m.earned ? 1 : 0.45,
                ...(m.earned ? {
                  borderTop: `1px solid ${NG_GLOW}0.30)`,
                  border: `1px solid ${NG_GLOW}0.14)`,
                } : {}),
              }}>
                <div aria-hidden style={{
                  position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                  background: m.earned
                    ? `repeating-linear-gradient(-22deg, transparent, transparent 8px, ${NG_GLOW}0.014) 8px, ${NG_GLOW}0.014) 9px)`
                    : "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.012) 8px, rgba(201,168,76,0.012) 9px)",
                }}/>
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: m.earned ? "#f5ede0" : "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
                      {m.label}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}>
                      {m.sub}
                    </p>
                  </div>
                  {m.earned && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                      color: NG, background: `${NG_GLOW}0.10)`,
                      border: `1px solid ${NG_GLOW}0.30)`,
                      borderRadius: 999, padding: "3px 9px", flexShrink: 0,
                      fontFamily: "DM Sans, sans-serif",
                      textShadow: `0 0 8px ${NG_GLOW}0.60)`,
                    }}>
                      UNLOCKED
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                    Each square = one day · last 12 weeks
                  </p>
                  {peakDowFull && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", color: "#f06450", background: "rgba(240,100,80,0.12)", border: "1px solid rgba(240,100,80,0.30)", borderRadius: 999, padding: "2px 8px" }}>
                      ⚠ {peakDowFull}s highlighted
                    </span>
                  )}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {cells.map((v, i) => {
                    const dayOffset = 83 - i;
                    const cellDow = new Date(Date.now() - dayOffset * 86400000).getDay();
                    const isPeak = peakDowIndex >= 0 && cellDow === peakDowIndex;
                    let bg: string;
                    if (v > 0 && isPeak)  bg = "#e06040"; // logged + peak DOW → warning amber-red
                    else if (v > 0)       bg = "#3fb86a"; // logged clean day → green
                    else if (isPeak)      bg = "rgba(240,100,80,0.22)"; // empty peak DOW → subtle red tint
                    else                  bg = "rgba(255,255,255,0.06)"; // empty normal
                    return (
                      <div key={i} className="h-3 w-3 rounded-[3px]"
                        style={{ backgroundColor: bg, boxShadow: isPeak && v > 0 ? "0 0 4px rgba(224,96,64,0.60)" : "none" }}
                        title={isPeak ? `${peakDowFull} — watch this day` : undefined}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] flex-wrap" style={{ color: "rgba(255,255,255,0.30)" }}>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "rgba(255,255,255,0.06)" }}/>
                    Empty
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "#3fb86a" }}/>
                    Clean day
                  </span>
                  {peakDowFull && (
                    <span className="flex items-center gap-1" style={{ color: "rgba(240,100,80,0.80)" }}>
                      <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "#e06040" }}/>
                      Risk day ({peakDowFull})
                    </span>
                  )}
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


      {/* ── Pattern Detector (PRO) ──────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <style>{`
          @keyframes pd-spin  { to { transform: rotate(360deg); } }
          @keyframes pd-scan  { 0%{opacity:0.55} 50%{opacity:1} 100%{opacity:0.55} }
          @keyframes pd-glitch {
            0%,93%,100% { transform:none; textShadow:"none" }
            94%  { transform:translateX(-2px) skewX(-4deg); filter:hue-rotate(30deg) brightness(1.3); }
            95%  { transform:translateX(2px)  skewX(3deg);  filter:hue-rotate(-20deg); }
            96%  { transform:translateX(-1px); filter:none; }
            97%  { transform:translateX(1px)  skewX(-2deg); filter:hue-rotate(15deg); }
          }
          @keyframes pd-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              {/* Radar pulse icon */}
              <div style={{ position:"relative", width:16, height:16, flexShrink:0 }}>
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1.5px solid rgba(240,100,80,0.55)", animation:"pd-scan 2s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", inset:3, borderRadius:"50%", background:"rgba(240,100,80,0.55)" }}/>
              </div>
              <p style={{
                fontSize:14, fontWeight:800, color:"#f5ede0", fontFamily:"DM Sans, sans-serif",
                letterSpacing:"-0.01em",
                animation: recentRelapse ? "pd-glitch 4s ease-in-out infinite" : "none",
                backgroundImage: recentRelapse
                  ? "linear-gradient(90deg, #f5ede0 0%, #f06450 40%, #E8C87A 60%, #f5ede0 100%)"
                  : "none",
                backgroundSize: recentRelapse ? "200% auto" : "auto",
                WebkitBackgroundClip: recentRelapse ? "text" : "unset",
                WebkitTextFillColor: recentRelapse ? "transparent" : "unset",
                backgroundClip: recentRelapse ? "text" : "unset",
                animation2: recentRelapse ? "pd-shimmer 2.5s linear infinite" : "none",
              } as React.CSSProperties}>
                Pattern Detector
              </p>
            </div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2, fontFamily:"DM Sans, sans-serif" }}>
              {relapses.length === 0 ? "Scanning your behaviour..." : `${relapses.length} event${relapses.length !== 1 ? "s" : ""} analysed`}
            </p>
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
            {relapses.length === 0 ? (
              /* ── Empty state: learning ── */
              <div style={{ ...STONE_CARD, padding:"28px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none",
                  background:"repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.012) 8px, rgba(201,168,76,0.012) 9px)" }}/>
                {/* Spinning gear */}
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ animation:"pd-spin 8s linear infinite", position:"relative", zIndex:1 }}>
                  <circle cx="22" cy="22" r="8" stroke="rgba(201,168,76,0.55)" strokeWidth="2" fill="none"/>
                  <circle cx="22" cy="22" r="3" fill="rgba(201,168,76,0.45)"/>
                  {Array.from({length:8},(_,i)=>{
                    const a=(i*45)*Math.PI/180;
                    return <rect key={i} x={22+12*Math.cos(a)-2} y={22+12*Math.sin(a)-4} width="4" height="8"
                      rx="2" fill="rgba(201,168,76,0.40)" transform={`rotate(${i*45} ${22+12*Math.cos(a)} ${22+12*Math.sin(a)})`}/>;
                  })}
                </svg>
                <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.55)", fontFamily:"DM Sans, sans-serif" }}>
                    Learning patterns…
                  </p>
                  <p style={{ margin:"6px 0 0", fontSize:11, color:"rgba(255,255,255,0.28)", lineHeight:1.55, fontFamily:"DM Sans, sans-serif" }}>
                    Log your first relapse to unlock<br/>battle reports and trigger analysis.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Data state: battle reports ── */
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  peakDowFull && {
                    severity: "HIGH" as const,
                    icon: "⚠️",
                    title: `Danger zone: ${peakDowFull}s`,
                    body: `Your relapses spike on ${peakDowFull}s. Plan an override activity for this day.`,
                  },
                  {
                    severity: "MED" as const,
                    icon: "🕐",
                    title: `Peak window: ${peakTimeName}`,
                    body: `Most events happen in the ${peakTimeName}. Schedule a high-engagement task then.`,
                  },
                  avgRelapseDays !== null && relapses.length > 1 && {
                    severity: "INFO" as const,
                    icon: "📡",
                    title: `Cycle detected: ~${avgRelapseDays}d`,
                    body: `Relapses recur roughly every ${avgRelapseDays} days. Activate shield mode before this window.`,
                  },
                  recentRelapse && {
                    severity: "ALERT" as const,
                    icon: "🔴",
                    title: "Recent event logged",
                    body: "A relapse was recorded in the last 48h. Your neural pathways are rebuilding — stay close to the app.",
                  },
                ].filter(Boolean).map((report, i) => {
                  if (!report) return null;
                  const SEV = {
                    HIGH:  { border:"rgba(240,100,80,0.35)",  bg:"rgba(240,100,80,0.07)",  label:"HIGH RISK",  labelColor:"#f06450" },
                    MED:   { border:"rgba(201,168,76,0.30)",  bg:"rgba(201,168,76,0.06)",  label:"PATTERN",    labelColor:"#C9A84C" },
                    INFO:  { border:"rgba(126,200,227,0.25)", bg:"rgba(126,200,227,0.05)", label:"INSIGHT",    labelColor:"#7ec8e3" },
                    ALERT: { border:"rgba(240,100,80,0.50)",  bg:"rgba(240,100,80,0.10)",  label:"ALERT",      labelColor:"#f06450" },
                  }[report.severity];
                  return (
                    <motion.div key={i}
                      initial={{ opacity:0, y:8 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay:i*0.08, type:"spring", stiffness:300, damping:28 }}
                      style={{ ...STONE_CARD, padding:"14px 14px 12px", border:`1px solid ${SEV.border}`, borderTop:`1px solid ${SEV.border}`, background: SEV.bg }}
                    >
                      <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none",
                        background:"repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.010) 8px, rgba(201,168,76,0.010) 9px)" }}/>
                      <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:14 }}>{report.icon}</span>
                          <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.18em", color:SEV.labelColor, fontFamily:"DM Sans, sans-serif" }}>
                            {SEV.label}
                          </span>
                          <div style={{ flex:1, height:1, background:`${SEV.border}` }}/>
                        </div>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#f5ede0", fontFamily:"DM Sans, sans-serif", marginBottom:3 }}>
                          {report.title}
                        </p>
                        <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.42)", lineHeight:1.5, fontFamily:"DM Sans, sans-serif" }}>
                          {report.body}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          {!state.isPremium && (
            <button onClick={() => triggerPaywall()} className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                style={{ color:"var(--primary)", background:"oklch(0.13 0.022 265 / 0.90)", borderColor:"oklch(0.62 0.22 255 / 0.30)" }}>
                {t("progress.insights.paywallCta")}
              </span>
            </button>
          )}
        </div>
      </section>

      <div className="pb-8" />
    </PageShell>
  );
}

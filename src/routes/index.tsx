import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coins, X, Plus } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, dayCount, activeAddiction, inactivityDays, loadState } from "@/lib/store";
import { initPurchases, checkPremium } from "@/lib/purchases";
import { supabase } from "@/lib/supabase";
import { AddAddictionModal } from "@/components/AddAddictionModal";
import { RelapseModal } from "@/components/RelapseModal";
import { ReEntryScreen } from "@/components/ReEntryScreen";

const MILESTONES = [
  { day: 7,  label: "Awaken",   short: "A" },
  { day: 14, label: "Clarity",  short: "C" },
  { day: 30, label: "Control",  short: "C" },
  { day: 60, label: "Strength", short: "S" },
  { day: 90, label: "Reset",    short: "R" },
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

// ── Milestone strip ───────────────────────────────────────────────────────────
const CARD_W = 126;

function MilestoneStrip({ day }: { day: number }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const dragging = useRef(false);

  const activeIdx = (() => {
    const i = MILESTONES.findIndex((m) => day < m.day);
    return i === -1 ? MILESTONES.length - 1 : i;
  })();

  const snapToCard = (idx: number, smooth = true) => {
    const card = cardRefs.current[idx];
    const strip = stripRef.current;
    if (!card || !strip) return;
    strip.scrollTo({
      left: card.offsetLeft + CARD_W / 2 - strip.offsetWidth / 2,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const snapToNearest = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const center = strip.scrollLeft + strip.offsetWidth / 2;
    let closest = 0, minDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const dist = Math.abs(card.offsetLeft + CARD_W / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    snapToCard(closest);
  };

  useEffect(() => { snapToCard(activeIdx, false); }, [activeIdx]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    startScroll.current = stripRef.current?.scrollLeft ?? 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !stripRef.current) return;
    stripRef.current.scrollLeft = startScroll.current + (startX.current - e.clientX);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    snapToNearest();
  };

  return (
    <>
      <style>{`.ms-strip::-webkit-scrollbar { display: none; }`}</style>
      <div
        ref={stripRef}
        className="ms-strip flex overflow-x-scroll"
        style={{
          position: "relative",
          scrollbarWidth: "none",
          paddingLeft: `calc(50% - ${CARD_W / 2}px)`,
          paddingRight: `calc(50% - ${CARD_W / 2}px)`,
          gap: 10,
          paddingTop: 8,
          paddingBottom: 10,
          userSelect: "none",
          touchAction: "none",
          cursor: "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {MILESTONES.map(({ day: m, label }, i) => {
          const isActive = i === activeIdx;
          const isReached = day >= m;
          const daysAway = m - day;

          return (
            <div
              key={m}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                flexShrink: 0,
                width: CARD_W,
                height: 100,
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                background: isActive
                  ? "oklch(0.17 0.04 265 / 0.95)"
                  : isReached
                  ? "oklch(0.15 0.025 265 / 0.9)"
                  : "oklch(0.12 0.02 265 / 0.9)",
                border: isActive
                  ? "1.5px solid #C4873A"
                  : isReached
                  ? "1px solid rgba(196,135,58,0.20)"
                  : "1px solid oklch(0.23 0.02 265)",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(196,135,58,0.22), 0 0 24px 6px rgba(196,135,58,0.28)"
                  : "none",
              }}
            >
              <p style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1,
                color: isActive
                  ? "#ffffff"
                  : isReached
                  ? "rgba(255,255,255,0.38)"
                  : "rgba(255,255,255,0.18)",
              }}>
                {label}
              </p>

              <p style={{
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
                color: isActive
                  ? "#C4873A"
                  : isReached
                  ? "rgba(196,135,58,0.40)"
                  : "oklch(0.38 0.02 265)",
              }}>
                d{m}
              </p>

              {isActive && (
                <p style={{
                  fontSize: 9,
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "#C4873A",
                  opacity: 0.85,
                  marginTop: 1,
                }}>
                  {isReached ? "Complete ✓" : `${daysAway} day${daysAway !== 1 ? "s" : ""} to go`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Today's Focus card ───────────────────────────────────────────────────────
const FOCUS_CACHE_PREFIX = "stopamine.focus.";

function todayCacheKey(name: string) {
  return FOCUS_CACHE_PREFIX + new Date().toISOString().slice(0, 10) + "." + name.trim().toLowerCase();
}

function TodaysFocus({
  name, addiction, costs, triggers, day,
}: {
  name: string; addiction: string; costs: string[]; triggers: string[]; day: number;
}) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const displayName = name.trim() || "friend";
    const key = todayCacheKey(displayName);
    const cached = localStorage.getItem(key);
    if (cached) {
      setText(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const phase =
      day <= 7  ? "surviving the first week — cravings are at their peak, every hour counts" :
      day <= 30 ? "building momentum — the brain is starting to rewire, patterns are forming" :
      day <= 60 ? "identity change — becoming someone new, not just quitting" :
      day <= 90 ? "finishing strong — the 90-day reset is in sight, this is where most people slip" :
                  "maintaining and giving back — past 90 days, locking in the new identity for life";

    const costsStr = costs.length ? costs.join(", ") : "their wellbeing";
    const triggersStr = triggers.length ? triggers.join(", ") : "various situations";

    const prompt =
      `Write a Today's Focus message for ${displayName}. ` +
      `They are on day ${day} of quitting ${addiction}. ` +
      `It has cost them: ${costsStr}. ` +
      `Their main triggers are: ${triggersStr}. ` +
      `Recovery phase: ${phase}. ` +
      `Write exactly 1 sentence. Maximum 20 words. Start with "Hey ${displayName},". ` +
      `Be specific to their habit and current day. No comma splices. Hard limit: 20 words total.`;

    fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`/api/chat ${r.status}`);
        return r.json();
      })
      .then((data: { text?: string; error?: string }) => {
        if (cancelled) return;
        if (!data.text) throw new Error(data.error ?? "Empty response");
        // Purge old cache keys
        Object.keys(localStorage)
          .filter((k) => k.startsWith(FOCUS_CACHE_PREFIX) && k !== key)
          .forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(key, data.text);
        setText(data.text);
      })
      .catch((err) => {
        console.error("[TodaysFocus]", err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="mx-6 mt-6 px-4 py-4 rounded-2xl"
      style={{
        background: "oklch(0.18 0.03 265 / 0.85)",
        border: "1px solid rgba(196,135,58,0.35)",
        boxShadow: "var(--shadow-glow)",
      }}
    >
      <p
        className="text-[9px] font-bold tracking-[0.25em] uppercase mb-2.5 text-center"
        style={{ color: "#C4873A" }}
      >
        Today's Focus
      </p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 rounded-full animate-pulse" style={{ background: "oklch(0.22 0.02 265)", width: "90%" }} />
          <div className="h-3 rounded-full animate-pulse" style={{ background: "oklch(0.22 0.02 265)", width: "75%" }} />
        </div>
      ) : text ? (
        <p className="text-[13px] leading-relaxed text-white/90 text-center">{text}</p>
      ) : (
        <p className="text-[12px] text-muted-foreground/50 italic">Focus message unavailable.</p>
      )}
    </div>
  );
}

// ── Daily check-in ────────────────────────────────────────────────────────────

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
  const [mood, setMood] = useState<number>(3);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    const reward = rollReward();
    if (reward.xp > 0) {
      update((s) => ({ points: s.points + reward.xp, treeXP: s.treeXP + Math.floor(reward.xp / 5) }));
    }
    if (reward.message) {
      onReward(reward.message);
      setTimeout(() => onReward(""), 3000);
    }
  };

  const response = confirmed ? moodResponse(mood) : null;
  const isLow = mood <= 2;
  const isHigh = mood >= 4;

  return (
    <div>
      {/* Slider */}
      <div className="relative pt-6 pb-2">
        {/* Value above thumb */}
        <div
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{
            left: `calc(${((mood - 1) / 4) * 100}%)`,
            transform: "translateX(-50%)",
            transition: "left 0.1s ease",
          }}
        >
          <span
            className="text-[11px] font-bold tabular-nums"
            style={{ color: "var(--primary)" }}
          >
            {mood}
          </span>
        </div>

        {/* Track + thumb via native range */}
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={mood}
          disabled={confirmed}
          onChange={(e) => setMood(Number(e.target.value))}
          onMouseUp={handleConfirm}
          onTouchEnd={handleConfirm}
          className="w-full appearance-none bg-transparent cursor-pointer disabled:cursor-default"
          style={{ height: 20 }}
        />

        {/* Labels */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground/50 font-medium">Rough</span>
          <span className="text-[10px] text-muted-foreground/50 font-medium">Strong</span>
        </div>
      </div>

      {/* Slider track/thumb styles */}
      <style>{`
        input[type=range] {
          --thumb-color: #C4873A;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 1.5px;
          background: oklch(0.32 0.03 265 / 0.8);
          border-radius: 1px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--thumb-color);
          box-shadow: 0 0 8px 2px #C4873A55;
          margin-top: -6.25px;
          transition: box-shadow 0.15s;
        }
        input[type=range]:not(:disabled)::-webkit-slider-thumb:active {
          box-shadow: 0 0 14px 4px #C4873A77;
        }
        input[type=range]::-moz-range-track {
          height: 1.5px;
          background: oklch(0.32 0.03 265 / 0.8);
          border-radius: 1px;
        }
        input[type=range]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 50%;
          background: var(--thumb-color);
          box-shadow: 0 0 8px 2px #C4873A55;
        }
      `}</style>

      {/* Contextual response */}
      {response && (
        <div className="mt-4 fade-up">
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

  // Init RevenueCat and sync premium status on mount
  useEffect(() => {
    async function syncPremium() {
      const { data: { session } } = await supabase.auth.getSession();
      await initPurchases(session?.user?.id);
      const isPremium = await checkPremium();
      if (isPremium !== state.isPremium) {
        update({ isPremium });
      }
    }
    syncPremium();
  }, []);

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

      {/* ── Milestone strip ──────────────────────────────────── */}
      <section className="mt-4 fade-up-2">
        <MilestoneStrip day={day} />
      </section>

      {/* ── Today's Focus ───────────────────────────────────── */}
      {state.onboarding && active && (
        <TodaysFocus
          name={state.onboarding.name}
          addiction={active.name}
          costs={state.onboarding.costs}
          triggers={state.onboarding.triggers}
          day={day}
        />
      )}

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

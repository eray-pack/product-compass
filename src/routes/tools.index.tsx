import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Snowflake, GitBranch, Plus } from "lucide-react";
import { PageShell } from "@/components/BottomNav";

export const Route = createFileRoute("/tools/")({
  component: Tools,
});

const reframes = [
  "Every time you resist, you literally grow new neural pathways.",
  "The urge isn't you — it's old wiring asking for one more hit.",
  "Discomfort now is your prefrontal cortex coming back online.",
  "Each clean day raises your dopamine baseline by a measurable amount.",
  "You're not giving something up. You're getting yourself back.",
];

function CoachRobot() {
  return (
    <svg
      width="52"
      height="66"
      viewBox="0 0 52 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      className="robot-body"
    >
      {/* Antenna */}
      <line x1="26" y1="9" x2="26" y2="2" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="2" r="2.5" fill="#C4873A" />

      {/* Head */}
      <rect x="8" y="9" width="36" height="22" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Eyes */}
      <circle cx="19" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
      <circle cx="33" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
      {/* Eye shine */}
      <circle cx="20.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <circle cx="34.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />

      {/* Smile */}
      <path d="M 20 26 Q 26 30.5 32 26" stroke="#C4873A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />

      {/* Neck */}
      <rect x="21" y="31" width="10" height="5" rx="2.5" fill="#261F15" />

      {/* Body */}
      <rect x="5" y="36" width="42" height="26" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Chest panel */}
      <rect x="14" y="42" width="24" height="12" rx="3" fill="#261F15" stroke="#C4873A" strokeWidth="0.6" opacity="0.75" />
      {/* Indicator dots — left dim, right lit */}
      <circle cx="23" cy="48" r="2.5" fill="#C4873A" opacity="0.35" />
      <circle cx="30" cy="48" r="2.5" fill="#C4873A" opacity="0.9" />

      {/* Left arm — static */}
      <rect x="0" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Right arm — waving (pivot: top-center of rect = shoulder joint) */}
      <rect
        x="43"
        y="38"
        width="9"
        height="18"
        rx="4.5"
        fill="#1C170F"
        stroke="#C4873A"
        strokeWidth="1.2"
        className="robot-wave-arm"
      />
    </svg>
  );
}

function Tools() {
  const [reframe, setReframe] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [plans, setPlans] = useState([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Use what works.</h1>
      </header>

      {/* ── SOS hero — glowing circle ────────────────────────── */}
      <section className="flex justify-center mt-10 mb-2 fade-up-1">
        <Link
          to="/tools/sos"
          className="sos-heartbeat flex flex-col items-center justify-center text-center active:scale-95 transition-transform"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "oklch(0.18 0.06 25)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
            }}
          >
            <p className="text-[15px] font-bold text-white leading-snug px-8">
              Urge hitting?<br />We've got you.
            </p>
            <p className="mt-2 text-[11px] px-6 leading-relaxed" style={{ color: "oklch(0.70 0.06 25)" }}>
              Tap to start urge surfing · 3 min
            </p>
          </div>
        </Link>
      </section>

      {/* ── Reframe ─────────────────────────────────────────── */}
      <section className="px-6 mt-10 pt-8 fade-up-2" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.10)", color: "var(--primary)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
            >
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reframe</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Rewire your reaction in one thought.</p>
            </div>
          </div>
          <button
            onClick={() => setReframe(reframes[Math.floor(Math.random() * reframes.length)])}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: "var(--primary)", border: "1px solid oklch(0.62 0.22 255 / 0.28)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            Show me one
          </button>
        </div>
        {reframe && (
          <p
            className="mt-5 text-sm leading-relaxed italic"
            style={{ color: "oklch(0.78 0.025 265 / 0.85)" }}
          >
            "{reframe}"
          </p>
        )}
      </section>

      {/* ── Recovery Coach ───────────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 fade-up-3" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <Link to="/tools/coach" className="flex flex-col items-center text-center gap-1 py-1 active:scale-95 transition-transform">
          <CoachRobot />
          <p className="font-semibold text-sm mt-2">Recovery Coach</p>
          <p className="text-[11px] text-muted-foreground">Talk it through. No judgment.</p>
        </Link>
      </section>

      {/* ── Cold Exposure ────────────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <Link to="/tools/cold" className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: "oklch(0.55 0.18 220 / 0.10)", color: "oklch(0.65 0.18 220)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
          >
            <Snowflake className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Cold Exposure</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">2-minute guided cold shower breathing.</p>
          </div>
        </Link>
      </section>

      {/* ── Implementation Plan ──────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 pb-8 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.10)", color: "var(--primary)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
            >
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Implementation Plan</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">If/then strategies for your triggers.</p>
            </div>
          </div>
          <button
            onClick={() => setPlanOpen((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: "var(--primary)", border: "1px solid oklch(0.62 0.22 255 / 0.28)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            {planOpen ? "Close" : "Add plan"}
          </button>
        </div>

        <ul className="mt-5 space-y-2">
          {plans.map((p, i) => (
            <li key={i} className="text-sm py-3" style={{ borderBottom: "1px solid oklch(0.20 0.025 265 / 0.6)" }}>
              <span className="text-muted-foreground">If I </span>
              <span className="font-medium">{p.trigger}</span>
              <span className="text-muted-foreground">, I will </span>
              <span className="font-medium" style={{ color: "var(--primary)" }}>{p.action}</span>.
            </li>
          ))}
        </ul>

        {planOpen && (
          <div className="mt-4 space-y-2">
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="If I feel… (trigger)"
              className="w-full rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
            />
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="…I will (action)"
              className="w-full rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
            />
            <button
              onClick={() => {
                if (trigger.trim() && action.trim()) {
                  setPlans([...plans, { trigger, action }]);
                  setTrigger(""); setAction(""); setPlanOpen(false);
                }
              }}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-1"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> Save plan
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

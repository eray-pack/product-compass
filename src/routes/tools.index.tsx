import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Brain, Snowflake, GitBranch, Plus, Wind, Target, Grid3x3 } from "lucide-react";
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
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Use what works.</h1>
      </header>

      {/* ── Distraction Games ────────────────────────────────── */}
      <section className="px-6 mt-6">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Distraction Games
        </p>
        <div className="space-y-2.5">
          <GameCard
            to="/tools/breath"
            icon={Wind}
            title="Breath Ball"
            desc="Ride the wave. Breathe it out."
            color="oklch(0.55 0.18 220)"
            bg="oklch(0.55 0.18 220 / 0.10)"
          />
          <GameCard
            to="/tools/tap"
            icon={Target}
            title="Tap the Urge"
            desc="Pop the craving before it pops you."
            color="var(--primary)"
            bg="oklch(0.62 0.18 55 / 0.10)"
          />
          <GameCard
            to="/tools/memory"
            icon={Grid3x3}
            title="Memory Match"
            desc="Flip, focus, forget the urge."
            color="oklch(0.60 0.18 150)"
            bg="oklch(0.60 0.18 150 / 0.10)"
          />
        </div>
      </section>

      {/* ── SOS hero ─────────────────────────────────────────── */}
      <section className="px-6 mt-6">
        <Link
          to="/tools/sos"
          className="block rounded-2xl p-6 text-center active:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(180deg, oklch(0.35 0.15 25 / 0.4), oklch(0.25 0.1 25 / 0.35))",
            border: "1px solid oklch(0.62 0.24 25 / 0.5)",
            boxShadow: "var(--shadow-sos)",
          }}
        >
          <div className="relative mx-auto h-20 w-20 rounded-full grid place-items-center bg-destructive">
            <span className="absolute inset-0 rounded-full bg-destructive animate-pulse-ring" />
            <Zap className="relative h-9 w-9 text-white" />
          </div>
          <p className="mt-4 text-lg font-bold">I'm feeling an urge right now</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap to start urge surfing · 3 minutes</p>
        </Link>
      </section>

      {/* ── Other tools ──────────────────────────────────────── */}
      <section className="px-6 mt-5 space-y-3 pb-4">
        {/* Reframe */}
        <ToolCard
          icon={Brain}
          title="Reframe"
          desc="A psychological reframe to rewire your reaction."
          ctaLabel="Show me one"
          onClick={() => setReframe(reframes[Math.floor(Math.random() * reframes.length)])}
        >
          {reframe && (
            <div
              className="mt-4 rounded-xl p-4 text-sm leading-snug border"
              style={{
                background: "oklch(0.62 0.22 255 / 0.08)",
                borderColor: "oklch(0.62 0.22 255 / 0.25)",
                color: "var(--foreground)",
              }}
            >
              {reframe}
            </div>
          )}
        </ToolCard>

        {/* Cold exposure */}
        <Link to="/tools/cold" className="block rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.12)", color: "var(--primary)" }}
            >
              <Snowflake className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Cold Exposure</p>
              <p className="text-sm text-muted-foreground">2-minute guided cold shower breathing.</p>
            </div>
          </div>
        </Link>

        {/* Implementation plan */}
        <ToolCard
          icon={GitBranch}
          title="Implementation Plan"
          desc="If/then strategies to handle triggers automatically."
          ctaLabel={planOpen ? "Close" : "Add plan"}
          onClick={() => setPlanOpen((v) => !v)}
        >
          <ul className="mt-4 space-y-2">
            {plans.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-border/40 p-3 text-sm"
                style={{ background: "oklch(0.16 0.025 265)" }}
              >
                <span className="text-muted-foreground">If I </span>
                <span className="text-foreground font-medium">{p.trigger}</span>
                <span className="text-muted-foreground">, I will </span>
                <span style={{ color: "var(--primary)" }} className="font-medium">{p.action}</span>.
              </li>
            ))}
          </ul>
          {planOpen && (
            <div className="mt-4 space-y-2">
              <input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="If I feel… (trigger)"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="…I will (action)"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
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
        </ToolCard>
      </section>
    </PageShell>
  );
}

function GameCard({
  to, icon: Icon, title, desc, color, bg,
}: {
  to: string; icon: React.ElementType; title: string; desc: string;
  color: string; bg: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 active:opacity-80 transition-opacity"
    >
      <div
        className="h-11 w-11 rounded-xl grid place-items-center shrink-0"
        style={{ background: bg, color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px]">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
        style={{ background: bg, color, border: `1px solid ${color}40` }}
      >
        Play
      </span>
    </Link>
  );
}

function ToolCard({
  icon: Icon, title, desc, ctaLabel, onClick, children,
}: {
  icon: React.ElementType; title: string; desc: string;
  ctaLabel: string; onClick: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
          style={{ background: "oklch(0.62 0.22 255 / 0.12)", color: "var(--primary)" }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <button
          onClick={onClick}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border shrink-0 transition-colors"
          style={{
            color: "var(--primary)",
            borderColor: "oklch(0.62 0.22 255 / 0.3)",
            background: "oklch(0.62 0.22 255 / 0.06)",
          }}
        >
          {ctaLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

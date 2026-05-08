import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Brain, Snowflake, GitBranch, Plus } from "lucide-react";
import { PageShell } from "@/components/BottomNav";

export const Route = createFileRoute("/tools")({
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
  const [plans, setPlans] = useState<{ trigger: string; action: string }[]>([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Use what works.</h1>
      </header>

      {/* SOS */}
      <section className="px-6 mt-6">
        <Link
          to="/tools/sos"
          className="block rounded-2xl border border-destructive/50 p-6 text-center"
          style={{ background: "linear-gradient(180deg, oklch(0.35 0.15 25 / 0.4), oklch(0.25 0.1 25 / 0.4))", boxShadow: "var(--shadow-sos)" }}
        >
          <div className="relative mx-auto h-20 w-20 rounded-full grid place-items-center bg-destructive">
            <span className="absolute inset-0 rounded-full bg-destructive animate-pulse-ring" />
            <Zap className="relative h-9 w-9 text-destructive-foreground" />
          </div>
          <p className="mt-4 text-lg font-semibold">I'm feeling an urge right now</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap to start urge surfing</p>
        </Link>
      </section>

      {/* Other tools */}
      <section className="px-6 mt-6 space-y-4">
        <ToolCard
          icon={Brain}
          title="Reframe"
          desc="A psychological reframe to rewire your reaction."
          onClick={() => setReframe(reframes[Math.floor(Math.random() * reframes.length)])}
          ctaLabel="Show me one"
        >
          {reframe && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm leading-snug">
              {reframe}
            </div>
          )}
        </ToolCard>

        <Link
          to="/tools/cold"
          className="block rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center text-primary">
              <Snowflake className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Cold Exposure</p>
              <p className="text-sm text-muted-foreground">2-minute guided cold shower breathing.</p>
            </div>
          </div>
        </Link>

        <ToolCard
          icon={GitBranch}
          title="Implementation Plan"
          desc="If/then strategies to handle triggers automatically."
          ctaLabel={planOpen ? "Close" : "Add plan"}
          onClick={() => setPlanOpen((v) => !v)}
        >
          <ul className="mt-4 space-y-2">
            {plans.map((p, i) => (
              <li key={i} className="rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                <span className="text-muted-foreground">If I </span><span className="text-foreground">{p.trigger}</span>
                <span className="text-muted-foreground">, I will </span><span className="text-primary">{p.action}</span>.
              </li>
            ))}
          </ul>
          {planOpen && (
            <div className="mt-4 space-y-2">
              <input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="If I feel… (trigger)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="…I will (action)" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <button
                onClick={() => {
                  if (trigger.trim() && action.trim()) {
                    setPlans([...plans, { trigger, action }]);
                    setTrigger(""); setAction(""); setPlanOpen(false);
                  }
                }}
                className="w-full rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium inline-flex items-center justify-center gap-1"
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

function ToolCard({
  icon: Icon, title, desc, ctaLabel, onClick, children,
}: {
  icon: any; title: string; desc: string; ctaLabel: string; onClick: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 grid place-items-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <button onClick={onClick} className="text-xs font-medium text-primary px-3 py-1.5 rounded-lg border border-primary/30">
          {ctaLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

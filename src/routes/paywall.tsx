import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Check } from "lucide-react";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/paywall")({
  component: Paywall,
});

function Paywall() {
  const [, update] = useAppState();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [seconds, setSeconds] = useState(14 * 60 + 59);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const start = () => {
    update({ paywallSeen: true });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-12 pb-10 flex flex-col">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Your plan is ready</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">Your recovery plan is ready</h1>
        <p className="mt-2 text-muted-foreground">Join 47,000 men who are rewiring their brain.</p>
      </div>

      <div className="mt-6 mx-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1.5 text-xs text-destructive-foreground">
        This offer expires in {mm}:{ss}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <PlanCard
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          title="Monthly"
          price="$19.99"
          per="/month"
        />
        <PlanCard
          selected={plan === "annual"}
          onClick={() => setPlan("annual")}
          title="Annual"
          price="$3.33"
          per="/month"
          badge="MOST POPULAR — 83% OFF"
          footnote="$39.99 / year"
        />
      </div>

      {plan === "annual" && (
        <p className="mt-3 text-center text-xs text-muted-foreground">That's less than one coffee per month.</p>
      )}

      <ul className="mt-6 space-y-2 text-sm">
        {[
          "Personalized brain recovery timeline",
          "SOS urge surfing tools, anytime",
          "Smart trigger-aware reminders",
          "Daily reframes and progress tracking",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-primary" /> {f}
          </li>
        ))}
      </ul>

      <button
        onClick={start}
        className="mt-8 h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        Start My Free Trial
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">7-day free trial. Cancel anytime.</p>
      <p className="mt-2 text-center text-[11px] text-muted-foreground inline-flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" /> 256-bit encryption · No hidden fees
      </p>
    </div>
  );
}

function PlanCard({
  selected, onClick, title, price, per, badge, footnote,
}: {
  selected: boolean; onClick: () => void; title: string; price: string; per: string; badge?: string; footnote?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        selected ? "border-primary bg-primary/10" : "border-border bg-card"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
          {badge}
        </span>
      )}
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold">
        {price}<span className="text-xs font-normal text-muted-foreground">{per}</span>
      </p>
      {footnote && <p className="mt-1 text-[11px] text-muted-foreground">{footnote}</p>}
    </button>
  );
}

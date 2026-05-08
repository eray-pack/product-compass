import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const durations = ["Less than 6 months", "1-2 years", "3-5 years", "More than 5 years"];
const costs = ["Relationships", "Focus & work", "Self-confidence", "Sleep", "Social life", "Mental health"];
const triggers = ["Late at night", "When bored", "When stressed", "When alone", "After rejection"];

function Onboarding() {
  const [, update] = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState("");
  const [pickedCosts, setPickedCosts] = useState<string[]>([]);
  const [pickedTriggers, setPickedTriggers] = useState<string[]>([]);
  const [identity, setIdentity] = useState("");
  const [name, setName] = useState("");

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    update({
      onboarding: {
        duration,
        costs: pickedCosts,
        triggers: pickedTriggers,
        identity,
        name,
        completedAt: Date.now(),
      },
    });
    navigate({ to: "/paywall" });
  };

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  return (
    <div className="min-h-screen mx-auto max-w-md flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10">
        <div className="flex gap-1.5">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        {step === 0 && (
          <Step
            eyebrow="Step 1 of 5"
            title="Before we start — be honest with yourself"
            subtitle="How long have you been struggling with this?"
            cta={duration ? "Continue" : ""}
            onContinue={next}
          >
            <div className="space-y-3">
              {durations.map((d) => (
                <Option key={d} selected={duration === d} onClick={() => setDuration(d)}>{d}</Option>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step
            eyebrow="Step 2 of 5"
            title="What does it cost you?"
            subtitle="Select everything this has taken from you."
            cta={pickedCosts.length ? "These are the things I'm taking back" : ""}
            onContinue={next}
          >
            <div className="space-y-3">
              {costs.map((c) => (
                <CheckOption key={c} selected={pickedCosts.includes(c)} onClick={() => toggle(pickedCosts, c, setPickedCosts)}>{c}</CheckOption>
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step
            eyebrow="Step 3 of 5"
            title="Your trigger profile"
            subtitle="When are you most vulnerable? We'll use this for smart reminders."
            cta={pickedTriggers.length ? "Continue" : ""}
            onContinue={next}
          >
            <div className="space-y-3">
              {triggers.map((t) => (
                <CheckOption key={t} selected={pickedTriggers.includes(t)} onClick={() => toggle(pickedTriggers, t, setPickedTriggers)}>{t}</CheckOption>
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step
            eyebrow="Step 4 of 5"
            title="Identity statement"
            subtitle="This becomes your personal mantra, shown to you every day."
            cta={identity.trim() ? "Continue" : ""}
            onContinue={next}
          >
            <label className="block text-sm text-muted-foreground mb-3">I am becoming someone who…</label>
            <textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="e.g. is in full control of his mind"
              rows={4}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg leading-snug focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </Step>
        )}

        {step === 4 && (
          <Step
            eyebrow="Step 5 of 5"
            title="Your commitment"
            subtitle="Read it. Sign it. This is who you are now."
            cta={name.trim() ? "I commit to this" : ""}
            onContinue={finish}
          >
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Identity</p>
              <p className="mt-2 text-xl leading-snug">
                I am becoming someone who <span className="text-primary">{identity || "…"}</span>.
              </p>
            </div>
            <label className="block text-sm text-muted-foreground mt-6 mb-2">Sign with your first name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </Step>
        )}
      </div>
    </div>
  );
}

function Step({
  eyebrow, title, subtitle, children, cta, onContinue,
}: {
  eyebrow: string; title: string; subtitle?: string;
  children: React.ReactNode; cta: string; onContinue: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 flex-1">{children}</div>
      <button
        disabled={!cta}
        onClick={onContinue}
        className="mt-8 h-14 w-full rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        {cta || "Pick an option"}
        {cta && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition ${
        selected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function CheckOption({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border transition ${
        selected ? "border-primary bg-primary/10" : "border-border bg-card"
      }`}
    >
      <span className={`h-5 w-5 rounded-md grid place-items-center border ${selected ? "bg-primary border-primary" : "border-border"}`}>
        {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
      </span>
      <span className={selected ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </button>
  );
}

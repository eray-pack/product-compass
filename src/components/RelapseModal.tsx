import { useState } from "react";
import { ShieldCheck, X, Flame, Brain, TrendingUp, Loader2 } from "lucide-react";
import { useAppState, dayCount, activeAddiction } from "@/lib/store";
import { getReframe } from "@/lib/reframe";

const TRIGGERS = [
  { id: "stressed", label: "I was stressed" },
  { id: "bored", label: "I was bored" },
  { id: "alone", label: "I was alone" },
  { id: "late", label: "It was late at night" },
  { id: "online", label: "Something triggered me online" },
  { id: "unknown", label: "I don't know" },
];

const FALLBACK_REFRAMES = [
  "Your brain followed a well-worn path under pressure. That's not weakness — it's neuroscience. The circuit exists; your job now is to interrupt it earlier next time. Write down the exact moment you could have chosen differently, then close this app and change your environment.",
  "A relapse is information, not a verdict. You now know which condition broke your resistance. Most people who successfully quit do so after multiple attempts — the difference is they analyzed each one. Identify the 60-second window before the decision and plan specifically for it.",
  "The streak was real and it still counts toward your recovery trajectory. One event doesn't erase the receptor sensitivity you've rebuilt. Right now, do something physically demanding for 10 minutes — this interrupts the dopamine cycle and prevents the 'I already failed' spiral.",
];

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return "late night (after midnight)";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "late night";
}

interface Props {
  onClose: () => void;
  totalCleanDays: number;
}

type Step = "confirm" | "trigger_select" | "ai_reframe" | "done";

export function RelapseModal({ onClose, totalCleanDays }: Props) {
  const [state, update] = useAppState();
  const [step, setStep] = useState<Step>("confirm");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [reframeText, setReframeText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = activeAddiction(state);
  const streakDay = active?.startDate ? dayCount(active.startDate) : 1;
  const addictionName = active?.name ?? "Porn";
  const onboardingTriggers = state.onboarding?.triggers ?? [];

  const logRelapse = () => {
    update((s) => ({
      relapses: [...s.relapses, { ts: Date.now(), reframeShown: true }],
    }));
    setStep("trigger_select");
  };

  const handleTriggerSelect = async (triggerId: string) => {
    const trigger = TRIGGERS.find((t) => t.id === triggerId)?.label ?? triggerId;
    setSelectedTrigger(trigger);
    setLoading(true);
    setStep("ai_reframe");

    try {
      const result = await getReframe({
        data: {
          trigger,
          onboardingTriggers,
          streakDay,
          addictionName,
          timeOfDay: getTimeOfDay(),
        },
      });
      setReframeText(result.text);
    } catch {
      setReframeText(FALLBACK_REFRAMES[Math.floor(Math.random() * FALLBACK_REFRAMES.length)]);
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <Overlay>
        <div className="relative rounded-3xl border border-border bg-card p-6 w-full max-w-sm mx-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 grid place-items-center mb-4">
            <Flame className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-bold">Did you relapse?</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Be honest with yourself. Logging it is an act of courage — and your counter stays exactly where it is.
          </p>
          <div className="mt-6 space-y-2">
            <button
              onClick={logRelapse}
              className="w-full h-12 rounded-2xl bg-destructive/15 text-destructive border border-destructive/30 text-sm font-semibold"
            >
              Yes, log it honestly
            </button>
            <button
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-secondary text-muted-foreground text-sm font-medium"
            >
              No, I'm still clean
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (step === "trigger_select") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-border bg-card p-6 w-full max-w-sm mx-4 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 1 of 2</p>
            <h2 className="mt-2 text-lg font-bold leading-snug">What happened right before?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Be specific. This shapes your reframe.</p>
          </div>
          <div className="space-y-2">
            {TRIGGERS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTriggerSelect(t.id)}
                className="w-full text-left px-4 py-3 rounded-xl border border-border bg-secondary/40 text-sm text-muted-foreground hover:border-primary hover:text-foreground hover:bg-primary/5 transition"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  if (step === "ai_reframe") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-primary/20 bg-[#0D0D0D] p-7 w-full max-w-sm mx-4 space-y-6">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Analysing your pattern…</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3">Read this.</p>
                <p className="text-base leading-relaxed text-foreground">{reframeText}</p>
              </div>

              <div className="rounded-2xl border border-border bg-white/5 p-4 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-success shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Total clean days</p>
                  <p className="text-2xl font-bold text-foreground">{totalCleanDays}</p>
                  <p className="text-[10px] text-success uppercase tracking-wider">unchanged</p>
                </div>
              </div>

              <button
                onClick={() => setStep("done")}
                className="w-full h-13 rounded-2xl text-sm font-semibold text-primary-foreground py-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                Day 1 starts now. Keep going.
              </button>
            </>
          )}
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div className="rounded-3xl border border-success/30 bg-card p-6 w-full max-w-sm mx-4 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-success/10 grid place-items-center mx-auto">
          <ShieldCheck className="h-6 w-6 text-success" />
        </div>
        <h2 className="text-lg font-bold">You're still in the game.</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Logging that took guts. Now close this, open the SOS tools, and identify what triggered it. That's the work.
        </p>
        <button onClick={onClose} className="w-full h-12 rounded-2xl bg-secondary text-sm font-medium">
          Back to dashboard
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      {children}
    </div>
  );
}

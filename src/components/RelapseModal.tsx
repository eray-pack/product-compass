import { useState } from "react";
import { ShieldCheck, X, Flame, Brain, TrendingUp } from "lucide-react";
import { useAppState } from "@/lib/store";

const REFRAMES = [
  {
    headline: "Your counter didn't move.",
    body: "We don't reset here. Every clean day you've ever had is still yours. One slip doesn't erase the neural pathways you've been building — those are permanent.",
  },
  {
    headline: "Your brain just tested you.",
    body: "Addiction isn't linear. The fact you're logging this instead of hiding it means you're already ahead of 90% of people who try to quit. The brain learns through setbacks.",
  },
  {
    headline: "47 clean days still happened.",
    body: "You can't un-earn those. Your dopamine receptors are still in a better place than before you started. A relapse is data, not a verdict.",
  },
  {
    headline: "This is part of recovery.",
    body: "Studies show the average person quits 7-10 times before it sticks. You didn't fail — you gathered intelligence about your triggers. Use it.",
  },
];

interface Props {
  onClose: () => void;
  totalCleanDays: number;
}

export function RelapseModal({ onClose, totalCleanDays }: Props) {
  const [, update] = useAppState();
  const [step, setStep] = useState<"confirm" | "reframe" | "done">("confirm");
  const reframe = REFRAMES[Math.floor(Math.random() * REFRAMES.length)];

  const logRelapse = () => {
    update((s) => ({
      relapses: [...s.relapses, { ts: Date.now(), reframeShown: true }],
      // totalCleanDays intentionally NOT reset
    }));
    setStep("reframe");
  };

  if (step === "confirm") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-border bg-card p-6 w-full max-w-sm mx-4">
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

  if (step === "reframe") {
    return (
      <Overlay>
        <div className="rounded-3xl border border-primary/30 bg-card p-6 w-full max-w-sm mx-4 space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-primary mb-2">Read this.</p>
            <h2 className="text-lg font-bold leading-snug">{reframe.headline}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{reframe.body}</p>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Your total clean days</p>
              <p className="text-2xl font-bold text-foreground">{totalCleanDays}</p>
              <p className="text-[10px] text-success uppercase tracking-wider">unchanged</p>
            </div>
          </div>

          <button
            onClick={() => setStep("done")}
            className="w-full h-12 rounded-2xl text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            I understand. Keep going.
          </button>
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
        <button
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-secondary text-sm font-medium"
        >
          Back to dashboard
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      {children}
    </div>
  );
}

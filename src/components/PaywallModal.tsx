import { useEffect, useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/store";
import { usePaywallOpen, closePaywall, triggerPaywall } from "@/lib/paywall";

const RENAG_AFTER_MS = 45_000;

export function PaywallModal() {
  const open = usePaywallOpen();
  const [state, update] = useAppState();
  const [seconds, setSeconds] = useState(5 * 60);

  // Countdown while open
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  // After dismissal, re-show in 45s for free users
  useEffect(() => {
    if (open) return;
    if (state.isPremium) return;
    if (!state.paywallSeen) return; // only after onboarding flow
    const t = setTimeout(() => triggerPaywall(), RENAG_AFTER_MS);
    return () => clearTimeout(t);
  }, [open, state.isPremium, state.paywallSeen]);

  if (!open) return null;

  const fmt = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  const claim = () => {
    update({ isPremium: true });
    closePaywall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closePaywall}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center pt-2">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Final offer · just for you
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-tight">Unlock your full recovery plan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We get it — cost matters. Here's our lowest price ever.
          </p>
        </div>

        <div className="mt-5 mx-auto w-fit rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] text-destructive-foreground">
          Expires in {fmt(seconds)}
        </div>

        <div className="mt-5 rounded-2xl border border-primary bg-primary/10 p-5 shadow-[var(--shadow-glow)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-primary">Annual — 92% off</p>
            <span className="text-[10px] line-through text-muted-foreground">$39.99/yr</span>
          </div>
          <p className="mt-2 text-4xl font-bold">
            $1.49<span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">$17.88 billed once a year · locked-in for life</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {[
              "Full brain recovery timeline",
              "Streak calendar & deep analytics",
              "Smart trigger-aware reminders",
              "Unlimited SOS tools and reframes",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={claim}
          className="mt-5 h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Claim 92% Discount
        </button>

        <button
          onClick={closePaywall}
          className="mt-2 h-11 w-full rounded-xl text-xs text-muted-foreground hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

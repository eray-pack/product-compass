import { useEffect, useState, useRef } from "react";
import { X, Check, Lock, Star } from "lucide-react";
import { useAppState } from "@/lib/store";
import { usePaywallOpen, closePaywall, triggerPaywall } from "@/lib/paywall";

const RENAG_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const TIMER_START = 15 * 60; // 15:00

const BENEFITS = [
  "Personalized brain recovery timeline",
  "SOS urge surfing tools, anytime",
  "Smart reminders tailored to you",
  "Daily reframes + momentum tracking",
  "Life Tree — your sacred progress symbol",
  "Unlimited craving games",
];

const REVIEWS = [
  {
    name: "Marcus",
    age: 24,
    stars: 5,
    text: "day 31. got a promotion last week. coincidence? i don't think so",
  },
  {
    name: "Jaylen",
    age: 19,
    stars: 5,
    text: "i was sceptical but it actually makes me motivated",
  },
];

export function PaywallModal() {
  const open = usePaywallOpen();
  const [state, update] = useAppState();
  const [seconds, setSeconds] = useState(TIMER_START);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const hasOpenedRef = useRef(false);

  // Re-sync timer whenever modal opens
  useEffect(() => {
    if (!open) return;
    hasOpenedRef.current = true;
    setSeconds(TIMER_START);
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  // Re-nag after 24h — only after modal has been seen and dismissed at least once
  useEffect(() => {
    if (open) return;
    if (!hasOpenedRef.current) return;
    const t = setTimeout(() => triggerPaywall(), RENAG_AFTER_MS);
    return () => clearTimeout(t);
  }, [open]);

  // Show final offer variant if user already saw main paywall and is hitting a locked feature
  const isFinalOffer = state.paywallSeen && !state.isPremium;

  if (!open) return null;

  const fmt = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  const claim = () => {
    update({ isPremium: true });
    closePaywall();
  };

  const dismiss = () => {
    update({ paywallSeen: true });
    closePaywall();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-y-auto"
        style={{
          background: "oklch(0.10 0.018 265)",
          border: "1px solid oklch(0.22 0.025 265 / 0.7)",
          maxHeight: "93vh",
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-8 w-8 grid place-items-center rounded-full transition-colors"
          style={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(0.28 0.025 265 / 0.6)" }}
        >
          <X className="h-4 w-4" style={{ color: "oklch(0.65 0.015 265)" }} />
        </button>

        <div className="px-5 pt-8 pb-6 space-y-6">

          {/* ── Timer ──────────────────────────────────────────── */}
          <div className="flex justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: "oklch(0.28 0.08 25 / 0.20)",
                border: "1px solid oklch(0.55 0.20 25 / 0.40)",
                color: "oklch(0.78 0.14 25)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.65 0.22 25)" }}
              />
              This offer expires in {fmt(seconds)}
            </div>
          </div>

          {/* ── Headline ───────────────────────────────────────── */}
          <div className="text-center space-y-1.5 pt-1">
            <p
              className="text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ color: "oklch(0.65 0.18 60)" }}
            >
              {isFinalOffer ? "Final Offer" : "Unlock PRO"}
            </p>
            <h2 className="text-2xl font-bold leading-tight text-white">
              {isFinalOffer ? <>One last chance.<br />Lowest price ever.</> : <>Your full recovery,<br />unlocked.</>}
            </h2>
            {isFinalOffer && (
              <p className="text-sm text-muted-foreground">Only available right now — not in settings.</p>
            )}
          </div>

          {/* ── Plans ──────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Annual — highlighted */}
            <button
              onClick={() => setPlan("annual")}
              className="w-full rounded-2xl p-4 text-left transition-all relative"
              style={{
                background: plan === "annual"
                  ? "oklch(0.16 0.04 60 / 0.5)"
                  : "oklch(0.14 0.022 265 / 0.6)",
                border: plan === "annual"
                  ? "1.5px solid oklch(0.65 0.18 60 / 0.9)"
                  : "1.5px solid oklch(0.26 0.025 265 / 0.6)",
                boxShadow: plan === "annual"
                  ? "0 0 28px oklch(0.65 0.18 60 / 0.12)"
                  : "none",
              }}
            >
              {/* Badge */}
              <span
                className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  background: "linear-gradient(135deg, oklch(0.55 0.18 55), oklch(0.70 0.20 65))",
                  color: "#0D0A04",
                }}
              >
                LEGENDARY DEAL — 83% OFF
              </span>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "oklch(0.65 0.18 60)" }}>
                    Annual
                  </p>
                  <p className="mt-0.5 text-white">
                    <span className="text-2xl font-bold">$3.33</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.55 0.015 265)" }}>
                    Billed $39.99/year
                  </p>
                </div>
                <div
                  className="h-5 w-5 rounded-full border-2 grid place-items-center shrink-0"
                  style={{
                    borderColor: plan === "annual" ? "oklch(0.65 0.18 60)" : "oklch(0.35 0.025 265)",
                    background: plan === "annual" ? "oklch(0.65 0.18 60)" : "transparent",
                  }}
                >
                  {plan === "annual" && <Check className="h-3 w-3" style={{ color: "#0D0A04" }} />}
                </div>
              </div>
            </button>

            {/* Monthly */}
            <button
              onClick={() => setPlan("monthly")}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{
                background: plan === "monthly"
                  ? "oklch(0.16 0.04 60 / 0.3)"
                  : "oklch(0.14 0.022 265 / 0.6)",
                border: plan === "monthly"
                  ? "1.5px solid oklch(0.65 0.18 60 / 0.7)"
                  : "1.5px solid oklch(0.26 0.025 265 / 0.6)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Monthly
                  </p>
                  <p className="mt-0.5 text-white">
                    <span className="text-2xl font-bold">$19.99</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </p>
                </div>
                <div
                  className="h-5 w-5 rounded-full border-2 grid place-items-center shrink-0"
                  style={{
                    borderColor: plan === "monthly" ? "oklch(0.65 0.18 60)" : "oklch(0.35 0.025 265)",
                    background: plan === "monthly" ? "oklch(0.65 0.18 60)" : "transparent",
                  }}
                >
                  {plan === "monthly" && <Check className="h-3 w-3" style={{ color: "#0D0A04" }} />}
                </div>
              </div>
            </button>

            {/* Coffee tagline */}
            <p className="text-center text-[12px] text-muted-foreground/70 italic">
              That's less than one coffee per month.
            </p>
          </div>

          {/* ── Benefits ───────────────────────────────────────── */}
          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: "oklch(0.13 0.020 265 / 0.8)", border: "1px solid oklch(0.22 0.025 265 / 0.5)" }}
          >
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <div
                  className="h-5 w-5 rounded-full grid place-items-center shrink-0 mt-px"
                  style={{ background: "oklch(0.65 0.18 60 / 0.15)" }}
                >
                  <Check className="h-3 w-3" style={{ color: "oklch(0.70 0.18 60)" }} />
                </div>
                <p className="text-sm leading-snug" style={{ color: "oklch(0.80 0.015 265)" }}>{b}</p>
              </div>
            ))}
          </div>

          {/* ── CTA ────────────────────────────────────────────── */}
          <button
            onClick={claim}
            className="w-full h-14 rounded-2xl font-bold text-base transition-opacity hover:opacity-90 active:opacity-80"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.16 55), oklch(0.68 0.20 65))",
              color: "#0D0A04",
              boxShadow: "0 4px 32px oklch(0.65 0.18 60 / 0.28)",
            }}
          >
            {plan === "annual" ? "Get Annual — $3.33/mo" : "Get Monthly — $19.99/mo"}
          </button>

          <button
            onClick={dismiss}
            className="w-full py-2 text-xs text-center"
            style={{ color: "oklch(0.42 0.015 265)" }}
          >
            {isFinalOffer ? "No thanks" : "Maybe later"}
          </button>

          {/* ── Social proof ───────────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <p
              className="text-center text-[10px] font-bold tracking-[0.25em] uppercase"
              style={{ color: "oklch(0.48 0.015 265)" }}
            >
              Real People, Real Results
            </p>
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl p-4 space-y-2"
                style={{
                  background: "oklch(0.13 0.020 265 / 0.8)",
                  border: "1px solid oklch(0.22 0.025 265 / 0.5)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{r.name}, {r.age}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-current"
                        style={{ color: "oklch(0.70 0.18 60)" }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.65 0.015 265)" }}>
                  "{r.text}"
                </p>
              </div>
            ))}
          </div>

          {/* ── Trust line ─────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3 pb-2">
            {["Cancel anytime", "No hidden fees", "Instant access"].map((t, i, arr) => (
              <span key={t} className="flex items-center gap-3">
                <span className="text-[11px]" style={{ color: "oklch(0.42 0.015 265)" }}>{t}</span>
                {i < arr.length - 1 && (
                  <span style={{ color: "oklch(0.30 0.015 265)" }}>·</span>
                )}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

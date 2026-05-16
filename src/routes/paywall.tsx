import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Lock, Check, X, Sparkles, Crown, Shield, Star, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { purchaseMonthly, restorePurchases } from "@/lib/purchases";

export const Route = createFileRoute("/paywall")({
  component: Paywall,
});

const AVATARS = ["M", "J", "T", "A", "N", "K"];
const AVATAR_COLORS = [
  "oklch(0.55 0.18 260)",
  "oklch(0.52 0.16 145)",
  "oklch(0.55 0.17 30)",
  "oklch(0.50 0.15 290)",
  "oklch(0.53 0.18 200)",
  "oklch(0.56 0.16 60)",
];

const TESTIMONIALS = [
  { name: "Marcus", age: 24, text: "day 31. got a promotion last week. coincidence? i don't think so" },
  { name: "Jaylen", age: 19, text: "i was sceptical but the tree thing actually makes me not want to ruin it" },
  { name: "Timo", age: 28, text: "first time i've gone this long. my girlfriend noticed before i told her" },
  { name: "Arjun", age: 31, text: "the momentum thing is genius. i relapsed once and kept going. old me would've quit" },
];

const LIVE_FEED = [
  "🌱 Noah just hit Day 7 — \"First week done\"",
  "🔥 Arjun survived an urge at 11pm",
  "🏆 Samuel reached Elite rank today",
  "💬 Kenji — \"This app hits different\"",
  "🌳 Marcus just unlocked Strong Tree",
  "⚡ Dimitri — Day 60. Brain reset complete.",
  "🛡️ Jaylen used Momentum Shield last night",
];

const UPSELLS = [
  { id: "shield", icon: Shield, title: "Momentum Shield", desc: "Protect your momentum for 3 days", price: "$2.99", color: "text-primary" },
  { id: "skin", icon: Sparkles, title: "Golden Tree Skin", desc: "Exclusive visual upgrade for your tree", price: "$1.99", color: "text-warning" },
  { id: "elite", icon: Crown, title: "Elite Status", desc: "Black card + Hall of Legends eligibility", price: "$9.99/mo", color: "text-amber-400" },
];

type Stage = "main" | "final" | "upsell";

function Paywall() {
  const [, update] = useAppState();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("main");
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [seconds, setSeconds] = useState(14 * 60 + 59);
  const [finalSeconds, setFinalSeconds] = useState(5 * 60);
  const [feedIdx, setFeedIdx] = useState(0);
  const [pickedUpsells, setPickedUpsells] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
      setFinalSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    tickerRef.current = setInterval(() => {
      setFeedIdx((i) => (i + 1) % LIVE_FEED.length);
    }, 2800);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  const fmt = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  const subscribe = async () => {
    setPurchasing(true);
    try {
      const success = await purchaseMonthly();
      if (success) {
        update({ paywallSeen: true, isPremium: true });
        setStage("upsell");
      }
    } catch (e) {
      console.error("[Paywall] purchase error", e);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        update({ paywallSeen: true, isPremium: true });
        navigate({ to: "/" });
      } else {
        alert("No active subscription found.");
      }
    } finally {
      setRestoring(false);
    }
  };

  const continueFree = () => {
    update({ paywallSeen: true, isPremium: false });
    navigate({ to: "/" });
  };

  const finishUpsell = () => {
    if (pickedUpsells.includes("shield")) update({ momentumShieldDays: 3 });
    navigate({ to: "/" });
  };

  if (stage === "upsell") {
    return (
      <div className="min-h-screen mx-auto max-w-md px-6 pt-12 pb-10 flex flex-col">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider text-primary mb-4">
            <Sparkles className="h-3 w-3" /> One more thing
          </div>
          <h1 className="text-2xl font-bold">Protect what you've built.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Optional. Add it now or find it later in settings.</p>
        </div>
        <div className="mt-8 space-y-3">
          {UPSELLS.map(({ id, icon: Icon, title, desc, price, color }) => {
            const picked = pickedUpsells.includes(id);
            return (
              <button key={id}
                onClick={() => setPickedUpsells(picked ? pickedUpsells.filter(x => x !== id) : [...pickedUpsells, id])}
                className={`w-full rounded-2xl border p-4 text-left transition flex items-center gap-4 ${picked ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                <div className={`h-11 w-11 rounded-2xl grid place-items-center bg-card border border-border ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{price}</p>
                  {picked && <p className="text-[10px] text-primary">Added</p>}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={finishUpsell}
          className="mt-8 h-14 w-full rounded-xl text-primary-foreground font-semibold text-base"
          style={{ background: "var(--gradient-primary)" }}>
          {pickedUpsells.length ? `Add ${pickedUpsells.length} item${pickedUpsells.length > 1 ? "s" : ""} & continue` : "No thanks, continue"}
        </button>
      </div>
    );
  }

  if (stage === "final") {
    return (
      <div className="min-h-screen mx-auto max-w-md px-6 pt-12 pb-10 flex flex-col">
        <div className="flex justify-end">
          <button onClick={continueFree} className="h-9 w-9 grid place-items-center rounded-full border border-border text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center mt-2">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Final offer
          </div>
          <h1 className="mt-4 text-3xl font-bold">Wait — one last thing</h1>
          <p className="mt-2 text-muted-foreground">Lowest price ever. Only on this screen.</p>
        </div>
        <div className="mt-4 mx-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1.5 text-xs text-destructive-foreground">
          Expires in {fmt(finalSeconds)}
        </div>
        <div className="mt-6 rounded-2xl border border-primary bg-primary/10 p-5 shadow-[var(--shadow-glow)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-primary">Annual — 92% off</p>
            <span className="text-[10px] line-through text-muted-foreground">$39.99/yr</span>
          </div>
          <p className="mt-2 text-4xl font-bold">$1.49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="mt-1 text-xs text-muted-foreground">$17.88 billed once a year</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {["Everything in the full plan", "Locked-in price for life", "Cancel anytime"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={subscribe} disabled={purchasing}
          className="mt-6 h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ background: "var(--gradient-primary)" }}>
          {purchasing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : "Claim 92% Discount"}
        </button>
        <button onClick={continueFree} className="mt-3 h-12 w-full rounded-xl text-sm text-muted-foreground">
          No thanks, continue free
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-10 pb-10 flex flex-col gap-5">
      <div className="flex justify-end">
        <button onClick={continueFree} className="h-9 w-9 grid place-items-center rounded-full border border-border text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Headline */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Your plan is ready</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">Your recovery plan is ready.</h1>
        <p className="mt-1 text-muted-foreground text-sm">Join the men who chose differently.</p>
      </div>

      {/* Social proof avatars */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex">
          {AVATARS.map((letter, i) => (
            <div key={i}
              className="h-8 w-8 rounded-full border-2 border-background grid place-items-center text-xs font-bold text-white"
              style={{ background: AVATAR_COLORS[i], marginLeft: i > 0 ? "-8px" : "0" }}>
              {letter}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Marcus, Jaylen, Timo and{" "}
          <span className="text-foreground font-medium">46,847 others</span> already started
        </p>
      </div>

      {/* Live ticker */}
      <div className="rounded-full border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground text-center transition-all">
        {LIVE_FEED[feedIdx]}
      </div>

      {/* Timer */}
      <div className="mx-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1.5 text-xs text-destructive-foreground">
        This offer expires in {fmt(seconds)}
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setPlan("monthly")}
          className={`relative rounded-2xl border p-4 text-left transition ${plan === "monthly" ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Monthly</p>
          <p className="mt-2 text-2xl font-bold">$19.99<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
        </button>
        <button onClick={() => setPlan("annual")}
          className={`relative rounded-2xl border-2 p-4 text-left transition ${plan === "annual" ? "border-amber-400/70 bg-amber-400/5" : "border-amber-400/30 bg-card"}`}>
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: "oklch(0.78 0.16 85)", color: "oklch(0.15 0.03 85)" }}>
            LEGENDARY DEAL — 83% OFF
          </span>
          <p className="text-xs uppercase tracking-wider text-amber-400">Annual</p>
          <p className="mt-2 text-2xl font-bold">$3.33<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
          <p className="text-[11px] text-muted-foreground">$39.99 / year</p>
        </button>
      </div>

      {plan === "annual" && (
        <p className="text-center text-xs text-muted-foreground -mt-2">That's less than one coffee per month.</p>
      )}

      {/* Features */}
      <ul className="space-y-2 text-sm">
        {[
          "AI Coach remembers you — not just today, every session",
          "8 specialized tools for the moments it gets hardest",
          "See which triggers cause your relapses — and break the pattern",
          "Create your own recovery room, lead your community",
          "PRO members are 3x more likely to reach day 90",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-primary shrink-0" /> {f}
          </li>
        ))}
      </ul>

      {/* Testimonials */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Real people, real results</p>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-hide">
          {TESTIMONIALS.map(({ name, age, text }) => (
            <div key={name} className="snap-start shrink-0 w-64 rounded-2xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold text-white"
                  style={{ background: AVATAR_COLORS[AVATARS.indexOf(name[0])] ?? AVATAR_COLORS[0] }}>
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{name}, {age}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">"{text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={subscribe} disabled={purchasing}
        className="h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-70"
        style={{ background: "var(--gradient-primary)" }}>
        {purchasing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : "Start reclaiming your life"}
      </button>
      <button onClick={continueFree} className="h-10 w-full rounded-xl text-sm text-muted-foreground">
        Continue with free plan
      </button>
      <button onClick={handleRestore} disabled={restoring} className="h-8 w-full text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
        {restoring ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        Restore purchases
      </button>
      <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" /> 7-day free trial · Cancel anytime · 256-bit encryption
      </p>
    </div>
  );
}

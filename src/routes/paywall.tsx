import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Sparkles, Crown, Shield, Star, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { purchaseMonthly, restorePurchases } from "@/lib/purchases";

export const Route = createFileRoute("/paywall")({
  component: Paywall,
});

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG        = "#08090e";
const CARD_BG   = "rgba(255,255,255,0.04)";
const CARD_BD   = "rgba(255,255,255,0.08)";
const G         = "#C4873A";
const G_GLOW    = "rgba(196,135,58,0.18)";
const G_MUTED   = "rgba(196,135,58,0.12)";
const TEXT      = "rgba(255,255,255,0.88)";
const TEXT_SUB  = "rgba(255,255,255,0.38)";
const TEXT_DIM  = "rgba(255,255,255,0.22)";

// ── Motion ─────────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const up = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

// ── Static data ────────────────────────────────────────────────────────────────
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
  { name: "Marcus",  age: 24, text: "day 31. got a promotion last week. coincidence? i don't think so." },
  { name: "Jaylen",  age: 19, text: "the tree thing actually makes me not want to ruin it. sounds dumb but it works." },
  { name: "Timo",    age: 28, text: "first time i've gone this long. my girlfriend noticed before i told her." },
  { name: "Arjun",   age: 31, text: "i relapsed once and kept going. old me would've quit. momentum never stopped." },
];

const LIVE_FEED = [
  "Noah just hit Day 7 — \"First week done\"",
  "Arjun survived an urge at 11pm",
  "Samuel reached Gorilla rank today",
  "Kenji — \"This app hits different\"",
  "Marcus just unlocked Strong Tree",
  "Dimitri — Day 60. Brain reset complete.",
  "Jaylen used Momentum Shield last night",
];

const FEATURES = [
  "Multi-habit tracking — run unlimited counters",
  "AI Coach remembers your patterns across sessions",
  "8 specialized tools for when it gets hardest",
  "Full relapse analytics — see your trigger patterns",
  "PRO members are 3× more likely to reach day 90",
];

const UPSELLS = [
  { id: "shield", icon: Shield, title: "Momentum Shield", desc: "Protect your streak for 3 days after a relapse", price: "$2.99" },
  { id: "skin",   icon: Sparkles, title: "Golden Tree Skin", desc: "Exclusive visual for your companion tree",       price: "$1.99" },
  { id: "elite",  icon: Crown,  title: "Elite Status",      desc: "Black card + Hall of Legends eligibility",       price: "$9.99/mo" },
];

type Stage = "main" | "final" | "upsell";

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}

// ── Upsell illustrations ───────────────────────────────────────────────────────
function ShieldIllustration({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <AnimatePresence>
        {active && (
          <motion.div key="pulse" className="absolute rounded-full pointer-events-none"
            style={{ width: 72, height: 72, border: `2px solid ${G}`, borderRadius: "50%" }}
            initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
        )}
      </AnimatePresence>
      <motion.svg width="64" height="72" viewBox="0 0 64 72" fill="none"
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}>
        <defs>
          <linearGradient id="sg" x1="32" y1="0" x2="32" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={G} stopOpacity="0.9" />
            <stop offset="100%" stopColor={G} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d="M32 4 L58 14 L58 36 Q58 56 32 68 Q6 56 6 36 L6 14 Z"
          fill={`${G}18`} stroke="url(#sg)" strokeWidth="1.5" />
        <path d="M22 36 L29 43 L43 29" stroke={G} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </motion.svg>
    </div>
  );
}

function TreeIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="90" height="110" viewBox="0 0 90 120" fill="none">
        <defs>
          <linearGradient id="tg" x1="45" y1="0" x2="45" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8C96A" /><stop offset="100%" stopColor="#7A5510" />
          </linearGradient>
          <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5C3D0E" /><stop offset="50%" stopColor="#8B6520" /><stop offset="100%" stopColor="#5C3D0E" />
          </linearGradient>
        </defs>
        <rect x="37" y="90" width="16" height="24" rx="4" fill="url(#trunk)" />
        <polygon points="45,42 6,92 84,92" fill="url(#tg)" opacity="0.85" />
        <polygon points="45,22 14,68 76,68" fill="url(#tg)" opacity="0.92" />
        <polygon points="45,4 22,46 68,46" fill="url(#tg)" />
      </svg>
    </div>
  );
}

function EliteIllustration({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div style={{
        width: 160, height: 96, borderRadius: 12, position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #0a0a0a 100%)",
        border: `1px solid ${G}44`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
      }}
        initial={{ y: 30, rotate: -6, opacity: 0 }}
        animate={{ y: 0, rotate: -4, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}>
        <motion.div style={{
          position: "absolute", top: 0, bottom: 0, width: 40,
          background: `linear-gradient(90deg, transparent, ${G}${active ? "44" : "1a"}, transparent)`,
        }}
          animate={{ left: ["-20%", "130%"] }}
          transition={{ duration: active ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: active ? 0.2 : 1.2 }} />
        <div style={{ position: "absolute", top: 18, left: 16, width: 24, height: 18, borderRadius: 4,
          background: `linear-gradient(135deg, ${G}88, ${G}44)`, border: `1px solid ${G}66` }} />
        <div style={{ position: "absolute", bottom: 14, left: 16, fontSize: 11, fontWeight: 700,
          color: G, letterSpacing: "0.18em", textTransform: "uppercase" }}>ELITE</div>
        <div style={{ position: "absolute", bottom: 12, right: 16, color: G, fontSize: 16 }}>♛</div>
      </motion.div>
    </div>
  );
}

const ILLUS: Record<string, (active: boolean) => React.ReactNode> = {
  shield: (a) => <ShieldIllustration active={a} />,
  skin:   (_) => <TreeIllustration />,
  elite:  (a) => <EliteIllustration active={a} />,
};
const ILLUS_ICON: Record<string, React.ReactNode> = {
  shield: <Shield className="h-4 w-4" />,
  skin:   <Sparkles className="h-4 w-4" />,
  elite:  <Crown className="h-4 w-4" />,
};

// ── Main component ─────────────────────────────────────────────────────────────
function Paywall() {
  const [, update]     = useAppState();
  const navigate       = useNavigate();
  const [stage, setStage]       = useState<Stage>("main");
  const [plan, setPlan]         = useState<"annual" | "monthly">("annual");
  const [seconds, setSeconds]         = useState(14 * 60 + 59);
  const [finalSeconds, setFinalSeconds] = useState(5 * 60);
  const [feedIdx, setFeedIdx]   = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring]   = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
      setFinalSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % LIVE_FEED.length), 2800);
    return () => clearInterval(t);
  }, []);

  const subscribe = async () => {
    setPurchasing(true);
    try {
      const ok = await purchaseMonthly();
      if (ok) { update({ paywallSeen: true, isPremium: true }); setStage("upsell"); }
    } catch (e) { console.error(e); }
    finally { setPurchasing(false); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) { update({ paywallSeen: true, isPremium: true }); navigate({ to: "/" }); }
      else alert("No active subscription found.");
    } finally { setRestoring(false); }
  };

  const continueFree    = () => setStage("final");
  const skipForReal     = () => { update({ paywallSeen: true }); navigate({ to: "/" }); };
  const finishUpsell = () => {
    if (selected === "shield") update({ momentumShieldDays: 3 });
    navigate({ to: "/" });
  };

  // ── UPSELL ─────────────────────────────────────────────────────────────────
  if (stage === "upsell") {
    return (
      <div style={{ minHeight: "100svh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
        <motion.div className="mx-auto w-full max-w-md px-5 pt-12 pb-10 flex flex-col"
          variants={stagger} initial="hidden" animate="show">

          <motion.div variants={up} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ background: G_MUTED, border: `1px solid ${G}44`, color: G }}>
              ✦ One More Thing
            </span>
          </motion.div>

          <motion.h1 variants={up} className="text-center text-[32px] font-bold leading-tight mb-2"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: TEXT }}>
            Protect what you've built.
          </motion.h1>

          <motion.p variants={up} className="text-center text-sm mb-8" style={{ color: TEXT_SUB }}>
            Optional. Add now or find it later in settings.
          </motion.p>

          <div className="flex flex-col gap-3">
            {UPSELLS.map(({ id, title, desc, price }) => {
              const isSel = selected === id;
              return (
                <motion.div key={id} variants={up}>
                  <motion.button onClick={() => setSelected(isSel ? null : id)}
                    className="w-full text-left" whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                    <motion.div animate={{
                      borderColor: isSel ? G : CARD_BD,
                      boxShadow: isSel ? `0 0 24px ${G_GLOW}` : "none",
                    }} transition={{ duration: 0.2 }}
                      style={{ background: CARD_BG, border: `1px solid`, borderRadius: 18, overflow: "hidden" }}>

                      {/* Illustration */}
                      <div style={{
                        height: 120,
                        background: isSel ? `radial-gradient(ellipse 70% 80% at 50% 60%, ${G}0e 0%, transparent 75%)` : "rgba(0,0,0,0.2)",
                        borderBottom: `1px solid ${isSel ? G + "33" : CARD_BD}`,
                        transition: "background 0.3s ease",
                      }}>
                        {ILLUS[id]?.(isSel)}
                      </div>

                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: G_MUTED, border: `1px solid ${G}33`,
                          display: "flex", alignItems: "center", justifyContent: "center", color: G }}>
                          {ILLUS_ICON[id]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight" style={{ color: TEXT }}>{title}</p>
                          <p className="text-[11px] mt-0.5 leading-tight" style={{ color: TEXT_SUB }}>{desc}</p>
                        </div>
                        <p className="text-sm font-bold shrink-0 mr-2" style={{ color: G }}>{price}</p>
                        <motion.div animate={{ borderColor: isSel ? G : "rgba(255,255,255,0.2)", background: isSel ? G : "transparent" }}
                          transition={{ duration: 0.18 }}
                          style={{ width: 20, height: 20, borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid",
                            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSel && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                              style={{ width: 8, height: 8, borderRadius: "50%", background: BG }} />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={up} className="mt-7">
            <motion.button onClick={finishUpsell} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                width: "100%", height: 56, borderRadius: 16, fontSize: 15, fontWeight: 600,
                background: selected ? `linear-gradient(135deg, ${G}, #a07830)` : "rgba(255,255,255,0.06)",
                color: selected ? "#080a0e" : TEXT_SUB,
                border: selected ? "none" : `1px solid rgba(255,255,255,0.1)`,
                boxShadow: selected ? `0 0 32px ${G_GLOW}` : "none",
                transition: "background 0.25s, color 0.25s, box-shadow 0.25s",
                cursor: "pointer",
              }}>
              {selected
                ? `Add ${UPSELLS.find((u) => u.id === selected)?.title} — ${UPSELLS.find((u) => u.id === selected)?.price}`
                : "No thanks, continue"}
            </motion.button>

            {selected && (
              <motion.button onClick={() => { setSelected(null); finishUpsell(); }}
                style={{ width: "100%", height: 40, marginTop: 8, color: TEXT_DIM, fontSize: 13, cursor: "pointer", background: "none", border: "none" }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileTap={{ opacity: 0.6 }}>
                Skip for now
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── FINAL (last-chance discount) ───────────────────────────────────────────
  if (stage === "final") {
    return (
      <div style={{ minHeight: "100svh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
        <motion.div className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
          variants={stagger} initial="hidden" animate="show">

          {/* Close — this one actually exits */}
          <motion.div variants={up} className="flex justify-end">
            <button onClick={skipForReal}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)",
                border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_SUB, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Badge */}
          <motion.div variants={up} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ background: "rgba(196,58,58,0.12)", border: "1px solid rgba(196,58,58,0.35)", color: "#E07070" }}>
              ⚡ Final Offer
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={up} className="text-center space-y-2">
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(2rem, 8vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, color: TEXT }}>
              Wait — one last thing.
            </h1>
            <p style={{ fontSize: 14, color: TEXT_SUB }}>
              Lowest price we'll ever offer. Only on this screen.
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={up} className="flex justify-center">
            <div style={{ borderRadius: 24, background: "rgba(196,58,58,0.08)", border: "1px solid rgba(196,58,58,0.30)",
              padding: "7px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
                style={{ background: "#E07070", boxShadow: "0 0 6px rgba(224,112,112,0.6)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#E07070", fontVariantNumeric: "tabular-nums" }}>
                Expires in {fmt(finalSeconds)}
              </span>
            </div>
          </motion.div>

          {/* Offer card */}
          <motion.div variants={up} style={{
            borderRadius: 20, padding: "22px 20px",
            background: G_MUTED, border: `1px solid ${G}55`,
            boxShadow: `0 0 32px ${G_GLOW}`,
          }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: G }}>
                Annual — 92% off
              </p>
              <p style={{ fontSize: 11, color: TEXT_DIM, textDecoration: "line-through" }}>$39.99/yr</p>
            </div>
            <p style={{ fontSize: 44, fontWeight: 800, color: TEXT, lineHeight: 1 }}>
              $1.49<span style={{ fontSize: 15, fontWeight: 400, color: TEXT_SUB }}>/month</span>
            </p>
            <p style={{ fontSize: 12, color: TEXT_DIM, marginTop: 4 }}>$17.88 billed once a year</p>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Everything in the full PRO plan", "Locked-in price for life", "Cancel anytime"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: G_MUTED,
                    border: `1px solid ${G}44`, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0 }}>
                    <Check style={{ width: 10, height: 10, color: G, strokeWidth: 3 }} />
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_SUB }}>{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button onClick={subscribe} disabled={purchasing} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                width: "100%", height: 58, borderRadius: 18, fontSize: 16, fontWeight: 700,
                background: `linear-gradient(135deg, ${G}, #E8A84A)`,
                color: BG, border: "none", cursor: "pointer",
                boxShadow: `0 4px 32px ${G_GLOW}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: purchasing ? 0.7 : 1,
              }}>
              {purchasing
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                : "Claim 92% Discount"}
            </motion.button>

            <button onClick={skipForReal} style={{
              width: "100%", height: 44, borderRadius: 14, fontSize: 13,
              background: "none", border: `1px solid rgba(255,255,255,0.07)`,
              color: TEXT_DIM, cursor: "pointer",
            }}>
              No thanks, continue free
            </button>
          </motion.div>

        </motion.div>
      </div>
    );
  }

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
      <motion.div className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
        variants={stagger} initial="hidden" animate="show">

        {/* Close */}
        <motion.div variants={up} className="flex justify-end">
          <button onClick={finishUpsell}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)",
              border: `1px solid rgba(255,255,255,0.1)`, color: TEXT_SUB, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Hero */}
        <motion.div variants={up} className="text-center space-y-2">
          <span className="inline-block text-[10px] font-bold tracking-[0.4em] uppercase"
            style={{ color: G }}>
            PRO Plan
          </span>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(2rem, 8vw, 2.6rem)",
            fontWeight: 700, lineHeight: 1.15, color: TEXT }}>
            Your recovery,<br />fully unlocked.
          </h1>
          <p style={{ color: TEXT_SUB, fontSize: 14 }}>
            Join the men who chose differently.
          </p>
        </motion.div>

        {/* Social proof */}
        <motion.div variants={up} className="flex items-center justify-center gap-3">
          <div className="flex">
            {AVATARS.map((l, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: "50%", marginLeft: i > 0 ? -10 : 0,
                background: AVATAR_COLORS[i], border: `2px solid ${BG}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "white",
              }}>{l}</div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: TEXT_SUB }}>
            Marcus, Jaylen and{" "}
            <span style={{ color: TEXT, fontWeight: 600 }}>46,847 others</span> started
          </p>
        </motion.div>

        {/* Live feed ticker */}
        <motion.div variants={up} style={{
          borderRadius: 24, background: CARD_BG, border: `1px solid ${CARD_BD}`,
          padding: "10px 16px", textAlign: "center", overflow: "hidden",
        }}>
          <AnimatePresence mode="wait">
            <motion.p key={feedIdx} style={{ fontSize: 12, color: TEXT_SUB }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}>
              ✦ {LIVE_FEED[feedIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Countdown */}
        <motion.div variants={up} className="flex justify-center">
          <div style={{ borderRadius: 24, background: "rgba(196,135,58,0.08)", border: `1px solid ${G}30`,
            padding: "7px 18px", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
              style={{ background: G, boxShadow: `0 0 6px ${G}` }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: G, fontVariantNumeric: "tabular-nums" }}>
              Offer expires in {fmt(seconds)}
            </span>
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div variants={up} className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button onClick={() => setPlan("monthly")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            background: plan === "monthly" ? G_MUTED : CARD_BG,
            border: `1px solid ${plan === "monthly" ? G + "55" : CARD_BD}`,
            transition: "all 0.2s ease",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase",
              color: plan === "monthly" ? G : TEXT_DIM }}>Monthly</p>
            <p style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: TEXT }}>
              $19.99<span style={{ fontSize: 11, fontWeight: 400, color: TEXT_SUB }}>/mo</span>
            </p>
          </button>

          {/* Annual — highlighted */}
          <button onClick={() => setPlan("annual")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            position: "relative",
            background: plan === "annual" ? G_MUTED : CARD_BG,
            border: `1px solid ${plan === "annual" ? G + "70" : G + "25"}`,
            boxShadow: plan === "annual" ? `0 0 20px ${G_GLOW}` : "none",
            transition: "all 0.2s ease",
          }}>
            <span style={{
              position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 12,
              background: `linear-gradient(90deg, ${G}, #E8A84A)`, color: BG,
            }}>83% OFF</span>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: G }}>
              Annual
            </p>
            <p style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: TEXT }}>
              $3.33<span style={{ fontSize: 11, fontWeight: 400, color: TEXT_SUB }}>/mo</span>
            </p>
            <p style={{ fontSize: 10, color: TEXT_DIM }}>$39.99 billed yearly</p>
          </button>
        </motion.div>

        {plan === "annual" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", fontSize: 12, color: TEXT_DIM, marginTop: -16 }}>
            That's less than one coffee per month.
          </motion.p>
        )}

        {/* Features */}
        <motion.div variants={up} style={{
          borderRadius: 18, background: CARD_BG, border: `1px solid ${CARD_BD}`,
          padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12,
        }}>
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: G_MUTED,
                border: `1px solid ${G}44`, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1 }}>
                <Check style={{ width: 10, height: 10, color: G, strokeWidth: 3 }} />
              </div>
              <p style={{ fontSize: 13, color: TEXT_SUB, lineHeight: 1.4 }}>{f}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={up}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase",
            color: TEXT_DIM, marginBottom: 12 }}>Real people, real results</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {TESTIMONIALS.map(({ name, age, text }) => (
              <div key={name} style={{
                flexShrink: 0, width: 240, borderRadius: 16, padding: "14px 16px",
                background: CARD_BG, border: `1px solid ${CARD_BD}`, display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: AVATAR_COLORS[AVATARS.indexOf(name[0])] ?? AVATAR_COLORS[0],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "white",
                  }}>{name[0]}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{name}, {age}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} style={{ width: 10, height: 10, fill: G, color: G }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: TEXT_SUB, lineHeight: 1.45 }}>"{text}"</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.button onClick={subscribe} disabled={purchasing} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{
              width: "100%", height: 58, borderRadius: 18, fontSize: 16, fontWeight: 700,
              background: `linear-gradient(135deg, ${G}, #E8A84A)`,
              color: "#08090e", border: "none", cursor: "pointer",
              boxShadow: `0 4px 32px ${G_GLOW}, 0 2px 8px rgba(0,0,0,0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: purchasing ? 0.7 : 1,
            }}>
            {purchasing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              : "Start reclaiming your life"}
          </motion.button>

          <button onClick={continueFree} style={{
            width: "100%", height: 44, borderRadius: 14, fontSize: 13, fontWeight: 500,
            background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`,
            color: TEXT_DIM, cursor: "pointer",
          }}>
            Continue with free plan
          </button>

          <button onClick={handleRestore} disabled={restoring} style={{
            width: "100%", height: 36, background: "none", border: "none",
            fontSize: 12, color: TEXT_DIM, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: restoring ? 0.5 : 1,
          }}>
            {restoring && <Loader2 className="h-3 w-3 animate-spin" />}
            Restore purchase
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: TEXT_DIM,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Lock style={{ width: 11, height: 11 }} />
            7-day free trial · Cancel anytime · 256-bit encryption
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}

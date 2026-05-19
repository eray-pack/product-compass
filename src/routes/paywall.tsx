import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Sparkles, Crown, Shield, Star, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { purchaseMonthly, purchaseAnnual, restorePurchases } from "@/lib/purchases";

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

// ── Main paywall sparkle particles — slow drifting gold ────────────────────────
const MAIN_SPARKLES = [
  { x: 5,  y: 8,  size: 2.0, opacity: 0.58, delay: 0.0,  dur: 9.0 },
  { x: 85, y: 12, size: 1.8, opacity: 0.48, delay: 2.2,  dur: 11.0 },
  { x: 22, y: 35, size: 2.5, opacity: 0.52, delay: 1.1,  dur: 8.5 },
  { x: 78, y: 42, size: 2.0, opacity: 0.44, delay: 3.5,  dur: 10.0 },
  { x: 45, y: 18, size: 1.6, opacity: 0.62, delay: 0.7,  dur: 9.5 },
  { x: 92, y: 55, size: 1.8, opacity: 0.38, delay: 4.0,  dur: 12.0 },
  { x: 8,  y: 60, size: 2.2, opacity: 0.52, delay: 1.8,  dur: 8.0 },
  { x: 65, y: 72, size: 2.5, opacity: 0.48, delay: 5.0,  dur: 10.5 },
  { x: 38, y: 80, size: 1.5, opacity: 0.44, delay: 2.7,  dur: 9.0 },
  { x: 88, y: 78, size: 2.0, opacity: 0.38, delay: 1.4,  dur: 11.5 },
  { x: 18, y: 90, size: 1.8, opacity: 0.48, delay: 6.2,  dur: 8.5 },
  { x: 55, y: 28, size: 2.2, opacity: 0.52, delay: 3.8,  dur: 10.0 },
  { x: 72, y: 15, size: 1.5, opacity: 0.44, delay: 0.5,  dur: 9.5 },
  { x: 30, y: 65, size: 2.0, opacity: 0.58, delay: 4.6,  dur: 11.0 },
  { x: 95, y: 32, size: 1.8, opacity: 0.38, delay: 2.0,  dur: 8.0 },
  { x: 12, y: 48, size: 2.5, opacity: 0.48, delay: 5.5,  dur: 10.5 },
  { x: 60, y: 95, size: 1.5, opacity: 0.52, delay: 1.5,  dur: 9.0 },
  { x: 42, y: 5,  size: 2.0, opacity: 0.44, delay: 7.0,  dur: 12.0 },
];

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

  // Main paywall — routes by selected plan card
  const subscribe = async () => {
    setPurchasing(true);
    try {
      const ok = plan === "annual" ? await purchaseAnnual() : await purchaseMonthly();
      if (ok) { update({ paywallSeen: true, isPremium: true }); setStage("upsell"); }
    } catch (e) { console.error(e); }
    finally { setPurchasing(false); }
  };

  // Final offer — always annual (the 92% off deal shown on that screen)
  const subscribeFinal = async () => {
    setPurchasing(true);
    try {
      const ok = await purchaseAnnual();
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

  // ── FINAL (last-chance discount) — redesigned ─────────────────────────────
  if (stage === "final") {

    // Deterministic sparkle positions — no jitter on re-render
    const SPARKLES = [
      { x: 8,  y: 14, size: 2.5, delay: 0.0,  dur: 3.8 },
      { x: 88, y: 9,  size: 2.0, delay: 0.9,  dur: 4.2 },
      { x: 22, y: 72, size: 3.0, delay: 0.4,  dur: 3.5 },
      { x: 75, y: 68, size: 2.5, delay: 1.6,  dur: 4.0 },
      { x: 50, y: 5,  size: 2.0, delay: 0.7,  dur: 3.6 },
      { x: 93, y: 42, size: 1.8, delay: 1.2,  dur: 4.5 },
      { x: 6,  y: 55, size: 2.2, delay: 0.3,  dur: 3.9 },
      { x: 62, y: 88, size: 2.8, delay: 1.8,  dur: 3.4 },
      { x: 38, y: 92, size: 1.8, delay: 0.6,  dur: 4.1 },
      { x: 82, y: 78, size: 2.0, delay: 1.0,  dur: 3.7 },
      { x: 18, y: 38, size: 1.6, delay: 2.1,  dur: 4.3 },
      { x: 68, y: 22, size: 2.4, delay: 1.4,  dur: 3.5 },
    ];

    return (
      <div style={{
        minHeight: "100svh", fontFamily: "DM Sans, sans-serif",
        position: "relative", overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 28%, #1a0905 0%, #0e0807 40%, #000000 100%)",
      }}>

        {/* ── Aurora: crimson + ember gold blobs ── */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <motion.div
            animate={{ x: ["0vw","22vw","42vw","18vw","0vw"], y: ["0vh","6vh","-4vh","8vh","0vh"],
              scale: [1, 1.08, 0.96, 1.05, 1], opacity: [0.20, 0.26, 0.18, 0.24, 0.20] }}
            transition={{ duration: 46, ease: "easeInOut", repeat: Infinity }}
            style={{ position: "absolute", top: "-18%", left: "-22%",
              width: "80vw", height: "80vw", borderRadius: "50%",
              background: "radial-gradient(circle, #dc2626 0%, transparent 68%)",
              filter: "blur(130px)" }}
          />
          <motion.div
            animate={{ x: ["0vw","-18vw","-36vw","-14vw","0vw"], y: ["0vh","8vh","2vh","10vh","0vh"],
              scale: [1, 0.94, 1.10, 0.98, 1], opacity: [0.18, 0.14, 0.22, 0.16, 0.18] }}
            transition={{ duration: 52, ease: "easeInOut", repeat: Infinity, delay: 6 }}
            style={{ position: "absolute", top: "5%", right: "-25%",
              width: "72vw", height: "72vw", borderRadius: "50%",
              background: "radial-gradient(circle, #C4873A 0%, transparent 68%)",
              filter: "blur(120px)" }}
          />
          <motion.div
            animate={{ x: ["0vw","12vw","-8vw","16vw","0vw"], y: ["0vh","-6vh","4vh","-8vh","0vh"],
              scale: [1, 1.06, 0.98, 1.04, 1], opacity: [0.12, 0.18, 0.10, 0.16, 0.12] }}
            transition={{ duration: 38, ease: "easeInOut", repeat: Infinity, delay: 12 }}
            style={{ position: "absolute", bottom: "-10%", left: "15%",
              width: "60vw", height: "60vw", borderRadius: "50%",
              background: "radial-gradient(circle, #b91c1c 0%, transparent 65%)",
              filter: "blur(110px)" }}
          />
        </div>

        {/* ── Breathing mesh grid ── */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.030, 0.048, 0.030] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
          style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        >
          <svg width="100%" height="100%" viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMid slice" fill="none">
            <line x1="-20" y1="0"   x2="240" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.6"/>
            <line x1="130" y1="0"   x2="390" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.5"/>
            <line x1="260" y1="0"   x2="520" y2="844" stroke="rgba(220,38,38,0.7)"   strokeWidth="0.5"/>
            <line x1="420" y1="0"   x2="160" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.6"/>
            <line x1="280" y1="0"   x2="20"  y2="844" stroke="rgba(220,38,38,0.7)"   strokeWidth="0.5"/>
          </svg>
        </motion.div>

        {/* ── Floating gold sparkle particles ── */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {SPARKLES.map((p, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -22, 0], opacity: [0, 0.75, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
              style={{
                position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                width: p.size, height: p.size, borderRadius: "50%",
                background: i % 3 === 0 ? "#dc2626" : "#C4873A",
                boxShadow: i % 3 === 0
                  ? "0 0 6px 2px rgba(220,38,38,0.70)"
                  : "0 0 6px 2px rgba(196,135,58,0.75)",
              }}
            />
          ))}
        </div>

        {/* ── Page content ── */}
        <motion.div
          className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
          style={{ position: "relative", zIndex: 1 }}
          variants={stagger} initial="hidden" animate="show"
        >

          {/* Close */}
          <motion.div variants={up} className="flex justify-end">
            <button onClick={skipForReal}
              style={{ width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                color: TEXT_SUB, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Pulsing FINAL OFFER badge */}
          <motion.div variants={up} className="flex justify-center">
            <motion.span
              animate={{
                scale: [1, 1.07, 1],
                boxShadow: [
                  "0 0 0px rgba(220,38,38,0)",
                  "0 0 20px rgba(220,38,38,0.55), 0 0 40px rgba(220,38,38,0.20)",
                  "0 0 0px rgba(220,38,38,0)",
                ],
              }}
              transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ background: "rgba(220,38,38,0.16)", border: "1px solid rgba(220,38,38,0.45)", color: "#FF7575" }}
            >
              ⚡ Final Offer
            </motion.span>
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

          {/* Countdown — sharp, crisp */}
          <motion.div variants={up} className="flex justify-center">
            <div style={{
              borderRadius: 24,
              background: "rgba(220,38,38,0.10)",
              border: "1px solid rgba(220,38,38,0.38)",
              padding: "8px 20px",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 0 18px rgba(220,38,38,0.18)",
            }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                  background: "#FF4444", boxShadow: "0 0 8px rgba(255,68,68,0.80)", flexShrink: 0 }}
              />
              <span style={{
                fontSize: 14, fontWeight: 800, letterSpacing: "0.04em",
                color: "#FF5555", fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 12px rgba(255,85,85,0.55)",
              }}>
                Expires in {fmt(finalSeconds)}
              </span>
            </div>
          </motion.div>

          {/* Offer card */}
          <motion.div variants={up} style={{
            borderRadius: 22, padding: "24px 22px",
            background: "linear-gradient(145deg, rgba(30,14,6,0.92) 0%, rgba(18,8,2,0.96) 100%)",
            border: `1px solid ${G}55`,
            boxShadow: `0 0 0 1px rgba(196,135,58,0.10), 0 8px 48px rgba(196,135,58,0.18), 0 2px 12px rgba(0,0,0,0.60)`,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.38em", textTransform: "uppercase", color: G }}>
                Annual — 92% off
              </p>
              <p style={{ fontSize: 11, color: TEXT_DIM, textDecoration: "line-through" }}>$39.99/yr</p>
            </div>

            <div className="flex items-end gap-2 mt-2 mb-1">
              <p style={{ fontSize: 52, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em" }}>
                $1.49
              </p>
              <p style={{ fontSize: 15, fontWeight: 400, color: TEXT_SUB, paddingBottom: 8 }}>/month</p>
            </div>
            <p style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 18 }}>$17.88 billed once a year</p>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${G}33, transparent)`, marginBottom: 16 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Everything in the full PRO plan",
                "Locked-in price for life",
                "Cancel anytime — no questions asked",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div style={{ width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(196,135,58,0.14)", border: `1px solid ${G}55`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check style={{ width: 11, height: 11, color: G, strokeWidth: 3 }} />
                  </div>
                  <p style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button
              onClick={subscribeFinal} disabled={purchasing}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: purchasing ? "none" : [
                  `0 4px 24px rgba(196,135,58,0.30)`,
                  `0 4px 42px rgba(196,135,58,0.58)`,
                  `0 4px 24px rgba(196,135,58,0.30)`,
                ],
              }}
              transition={{ type: "spring", stiffness: 500, damping: 20,
                boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
              style={{
                width: "100%", height: 60, borderRadius: 18, fontSize: 16, fontWeight: 800,
                background: `linear-gradient(135deg, #E8A84A 0%, ${G} 50%, #b86a1a 100%)`,
                color: "#0e0807", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: purchasing ? 0.7 : 1,
                letterSpacing: "0.01em",
              }}>
              {purchasing
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                : "Claim 92% Discount"}
            </motion.button>

            <button onClick={skipForReal} style={{
              width: "100%", height: 44, borderRadius: 14, fontSize: 13,
              background: "none", border: "1px solid rgba(255,255,255,0.07)",
              color: TEXT_DIM, cursor: "pointer",
            }}>
              No thanks, continue free
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

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100svh",
      fontFamily: "DM Sans, sans-serif",
      position: "relative",
      overflow: "hidden",
      background: "radial-gradient(ellipse at 50% 32%, #0c0812 0%, #07050f 48%, #030205 100%)",
    }}>

      {/* ── Aurora blobs — gold + indigo, calm and slow ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%","10%","18%","6%","0%"], y: ["0%","5%","-3%","7%","0%"], scale: [1,1.06,0.96,1.04,1], opacity: [0.18,0.24,0.16,0.22,0.18] }}
          transition={{ duration: 50, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", top: "-20%", left: "5%",
            width: "80vw", height: "80vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.30) 0%, transparent 65%)",
            filter: "blur(150px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","-12%","-20%","-8%","0%"], y: ["0%","7%","3%","9%","0%"], scale: [1,0.92,1.10,0.96,1], opacity: [0.14,0.10,0.18,0.12,0.14] }}
          transition={{ duration: 58, ease: "easeInOut", repeat: Infinity, delay: 10 }}
          style={{
            position: "absolute", top: "8%", right: "-22%",
            width: "68vw", height: "68vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(80,110,200,0.28) 0%, transparent 65%)",
            filter: "blur(140px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","8%","-5%","12%","0%"], y: ["0%","-10%","6%","-8%","0%"], scale: [1,1.08,0.94,1.05,1], opacity: [0.10,0.16,0.08,0.14,0.10] }}
          transition={{ duration: 44, ease: "easeInOut", repeat: Infinity, delay: 20 }}
          style={{
            position: "absolute", top: "45%", left: "-18%",
            width: "58vw", height: "58vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.22) 0%, transparent 65%)",
            filter: "blur(130px)",
          }}
        />
      </div>

      {/* ── Interconnected network grid — pulses on 6s cycle ── */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.22, 0.48, 0.22] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
          {/* Network lines */}
          <g stroke="rgba(196,135,58,0.38)" strokeWidth="0.55">
            <line x1="0"   y1="120" x2="80"  y2="60"/>
            <line x1="80"  y1="60"  x2="195" y2="90"/>
            <line x1="195" y1="90"  x2="310" y2="50"/>
            <line x1="310" y1="50"  x2="390" y2="140"/>
            <line x1="0"   y1="120" x2="30"  y2="250"/>
            <line x1="80"  y1="60"  x2="130" y2="300"/>
            <line x1="195" y1="90"  x2="260" y2="230"/>
            <line x1="310" y1="50"  x2="360" y2="290"/>
            <line x1="390" y1="140" x2="360" y2="290"/>
            <line x1="30"  y1="250" x2="130" y2="300"/>
            <line x1="130" y1="300" x2="260" y2="230"/>
            <line x1="260" y1="230" x2="360" y2="290"/>
            <line x1="30"  y1="250" x2="60"  y2="420"/>
            <line x1="130" y1="300" x2="190" y2="380"/>
            <line x1="260" y1="230" x2="310" y2="450"/>
            <line x1="360" y1="290" x2="390" y2="400"/>
            <line x1="60"  y1="420" x2="190" y2="380"/>
            <line x1="190" y1="380" x2="310" y2="450"/>
            <line x1="310" y1="450" x2="390" y2="400"/>
            <line x1="60"  y1="420" x2="20"  y2="560"/>
            <line x1="190" y1="380" x2="140" y2="520"/>
            <line x1="310" y1="450" x2="250" y2="590"/>
            <line x1="390" y1="400" x2="370" y2="540"/>
            <line x1="20"  y1="560" x2="140" y2="520"/>
            <line x1="140" y1="520" x2="250" y2="590"/>
            <line x1="250" y1="590" x2="370" y2="540"/>
            <line x1="20"  y1="560" x2="80"  y2="690"/>
            <line x1="140" y1="520" x2="200" y2="650"/>
            <line x1="250" y1="590" x2="320" y2="710"/>
            <line x1="370" y1="540" x2="390" y2="660"/>
            <line x1="80"  y1="690" x2="200" y2="650"/>
            <line x1="200" y1="650" x2="320" y2="710"/>
            <line x1="320" y1="710" x2="390" y2="660"/>
            <line x1="80"  y1="690" x2="30"  y2="820"/>
            <line x1="200" y1="650" x2="195" y2="780"/>
            <line x1="320" y1="710" x2="360" y2="830"/>
            <line x1="30"  y1="820" x2="195" y2="780"/>
            <line x1="195" y1="780" x2="360" y2="830"/>
            {/* Cross-diagonals for depth */}
            <line x1="80"  y1="60"  x2="260" y2="230"/>
            <line x1="195" y1="90"  x2="130" y2="300"/>
            <line x1="60"  y1="420" x2="140" y2="520"/>
            <line x1="190" y1="380" x2="250" y2="590"/>
            <line x1="140" y1="520" x2="200" y2="650"/>
            <line x1="80"  y1="690" x2="195" y2="780"/>
          </g>
          {/* Gold network nodes */}
          <g fill="rgba(196,135,58,0.55)">
            <circle cx="80"  cy="60"  r="2.5"/><circle cx="195" cy="90"  r="2.0"/><circle cx="310" cy="50"  r="2.5"/>
            <circle cx="130" cy="300" r="3.0"/><circle cx="260" cy="230" r="2.5"/><circle cx="360" cy="290" r="2.0"/>
            <circle cx="190" cy="380" r="3.0"/><circle cx="310" cy="450" r="2.5"/>
            <circle cx="140" cy="520" r="3.0"/><circle cx="250" cy="590" r="2.5"/>
            <circle cx="200" cy="650" r="3.0"/><circle cx="320" cy="710" r="2.5"/>
            <circle cx="195" cy="780" r="2.5"/>
          </g>
          {/* Blue accent nodes */}
          <g fill="rgba(100,140,220,0.42)">
            <circle cx="195" cy="90"  r="1.5"/>
            <circle cx="60"  cy="420" r="1.5"/>
            <circle cx="370" cy="540" r="1.5"/>
            <circle cx="195" cy="780" r="1.5"/>
          </g>
        </svg>
      </motion.div>

      {/* ── Slow drifting gold + blue sparkle particles ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {MAIN_SPARKLES.map((p, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -28, 0], opacity: [0, p.opacity, 0], scale: [0.4, 1.1, 0.4] }}
            transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: "50%",
              background: i % 5 === 0 ? "rgba(110,150,230,0.95)" : "#C4873A",
              boxShadow: i % 5 === 0
                ? "0 0 5px 1px rgba(110,150,230,0.55)"
                : "0 0 5px 2px rgba(196,135,58,0.60)",
            }}
          />
        ))}
      </div>

      {/* ── Page content ── */}
      <motion.div className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
        style={{ position: "relative", zIndex: 1 }}
        variants={stagger} initial="hidden" animate="show">

        {/* Close */}
        <motion.div variants={up} className="flex justify-end">
          <button onClick={finishUpsell}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(196,135,58,0.22)",
              color: TEXT_SUB, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
            <X className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Hero */}
        <motion.div variants={up} className="text-center space-y-2">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "#C9A84C",
            padding: "4px 16px", borderRadius: 99,
            background: "rgba(196,135,58,0.08)",
            border: "1px solid rgba(196,135,58,0.24)",
          }}>
            ✦ PRO PLAN ✦
          </span>
          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(2rem, 8vw, 2.6rem)",
            fontWeight: 700, lineHeight: 1.15, color: TEXT,
            textShadow: "0 0 80px rgba(196,135,58,0.14)",
          }}>
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
                background: AVATAR_COLORS[i],
                border: "2px solid rgba(3,2,5,0.90)",
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
          borderRadius: 24,
          background: "linear-gradient(145deg, rgba(12,8,18,0.78) 0%, rgba(7,5,15,0.84) 100%)",
          border: "1px solid rgba(196,135,58,0.18)",
          padding: "10px 16px", textAlign: "center", overflow: "hidden",
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.05), 0 2px 20px rgba(0,0,0,0.22)",
        }}>
          <AnimatePresence mode="wait">
            <motion.p key={feedIdx} style={{ fontSize: 12, color: TEXT_SUB }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}>
              ✦ {LIVE_FEED[feedIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Countdown — refined dark gold, sophisticated pulse */}
        <motion.div variants={up} className="flex justify-center">
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(28,20,8,0.88) 0%, rgba(16,11,4,0.92) 100%)",
            border: "1px solid rgba(196,135,58,0.34)",
            padding: "8px 20px",
            display: "inline-flex", alignItems: "center", gap: 10,
            boxShadow: "0 0 22px rgba(196,135,58,0.10), inset 0 1px 0 rgba(196,135,58,0.14)",
            backdropFilter: "blur(10px)",
          }}>
            <motion.span
              animate={{ opacity: [1, 0.30, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: "#C9A84C", boxShadow: "0 0 6px rgba(201,168,76,0.70)", flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
              color: "#C9A84C", fontVariantNumeric: "tabular-nums",
            }}>
              Offer expires in {fmt(seconds)}
            </span>
          </div>
        </motion.div>

        {/* Pricing cards — etched gold borders */}
        <motion.div variants={up} className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button onClick={() => setPlan("monthly")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            background: plan === "monthly"
              ? "linear-gradient(145deg, rgba(196,135,58,0.10) 0%, rgba(196,135,58,0.05) 100%)"
              : "rgba(255,255,255,0.025)",
            border: `1px solid ${plan === "monthly" ? "rgba(196,135,58,0.52)" : "rgba(196,135,58,0.16)"}`,
            boxShadow: plan === "monthly"
              ? "inset 0 0 0 1px rgba(196,135,58,0.08), 0 0 26px rgba(196,135,58,0.12), 0 1px 0 rgba(196,135,58,0.20) inset"
              : "inset 0 0 0 1px rgba(255,255,255,0.02)",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase",
              color: plan === "monthly" ? G : TEXT_DIM,
            }}>Monthly</p>
            <p style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: TEXT }}>
              $19.99<span style={{ fontSize: 11, fontWeight: 400, color: TEXT_SUB }}>/mo</span>
            </p>
          </button>

          {/* Annual — highlighted */}
          <button onClick={() => setPlan("annual")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            position: "relative",
            background: plan === "annual"
              ? "linear-gradient(145deg, rgba(196,135,58,0.12) 0%, rgba(196,135,58,0.06) 100%)"
              : "rgba(255,255,255,0.025)",
            border: `1px solid ${plan === "annual" ? "rgba(196,135,58,0.62)" : "rgba(196,135,58,0.22)"}`,
            boxShadow: plan === "annual"
              ? "inset 0 0 0 1px rgba(196,135,58,0.10), 0 0 34px rgba(196,135,58,0.16), 0 1px 0 rgba(196,135,58,0.24) inset"
              : "inset 0 0 0 1px rgba(196,135,58,0.04)",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
          }}>
            <span style={{
              position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 12,
              background: "linear-gradient(90deg, #C4873A, #E8A84A)", color: "#030205",
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
          borderRadius: 20,
          background: "linear-gradient(145deg, rgba(12,8,18,0.86) 0%, rgba(7,5,15,0.92) 100%)",
          border: "1px solid rgba(196,135,58,0.18)",
          boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.05), 0 0 30px rgba(196,135,58,0.04)",
          padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12,
          backdropFilter: "blur(12px)",
        }}>
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(196,135,58,0.10)",
                border: "1px solid rgba(196,135,58,0.36)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                <Check style={{ width: 10, height: 10, color: G, strokeWidth: 3 }} />
              </div>
              <p style={{ fontSize: 13, color: TEXT_SUB, lineHeight: 1.4 }}>{f}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={up}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase",
            color: TEXT_DIM, marginBottom: 12,
          }}>Real people, real results</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {TESTIMONIALS.map(({ name, age, text }) => (
              <div key={name} style={{
                flexShrink: 0, width: 240, borderRadius: 18, padding: "14px 16px",
                background: "linear-gradient(145deg, rgba(12,8,18,0.90) 0%, rgba(7,5,15,0.94) 100%)",
                border: "1px solid rgba(196,135,58,0.16)",
                boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.04), 0 2px 20px rgba(0,0,0,0.28)",
                display: "flex", flexDirection: "column", gap: 10,
                backdropFilter: "blur(8px)",
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

        {/* CTA — brushed matte gold with shimmer sweep */}
        <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.button
            onClick={subscribe} disabled={purchasing}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{
              width: "100%", height: 58, borderRadius: 18, fontSize: 16, fontWeight: 700,
              background: "linear-gradient(145deg, #D4954A 0%, #C4873A 35%, #A87030 65%, #C08840 100%)",
              color: "#0c0812", border: "none", cursor: "pointer",
              boxShadow: "0 4px 32px rgba(196,135,58,0.28), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              position: "relative", overflow: "hidden",
              opacity: purchasing ? 0.7 : 1,
              letterSpacing: "0.01em",
            }}>
            {/* Brushed shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "280%"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.2 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "32%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
                pointerEvents: "none",
              }}
            />
            {purchasing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              : "Start reclaiming your life"}
          </motion.button>

          <button onClick={continueFree} style={{
            width: "100%", height: 44, borderRadius: 14, fontSize: 13, fontWeight: 500,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(196,135,58,0.14)",
            color: TEXT_DIM, cursor: "pointer",
          }}>
            Continue with free plan
          </button>

          <button onClick={handleRestore} disabled={restoring} style={{
            width: "100%", height: 36, background: "none", border: "none",
            fontSize: 12, color: TEXT_DIM, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: restoring ? 0.5 : 1,
          }}>
            {restoring && <Loader2 className="h-3 w-3 animate-spin" />}
            Restore purchase
          </button>

          <p style={{
            textAlign: "center", fontSize: 11, color: TEXT_DIM,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Lock style={{ width: 11, height: 11 }} />
            7-day free trial · Cancel anytime · 256-bit encryption
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}

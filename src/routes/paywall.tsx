import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Sparkles, Crown, Shield, Star } from "lucide-react";
import { useAppState } from "@/lib/store";

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

// ── Design tokens ─────────────────────────────────────────────────────────────
const G = "#C9A84C";            // gold
const CARD_BG = "#0f0c06";
const CARD_BORDER = "#2a2010";
const BG = "#090705";

// ── Entrance variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
};

// ── Preview illustrations ─────────────────────────────────────────────────────

function ShieldPreview({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Pulse ring — only when selected */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="pulse"
            className="absolute rounded-full pointer-events-none"
            style={{ width: 72, height: 72, border: `2px solid ${G}`, borderRadius: "50%" }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      <motion.svg
        width="64" height="72" viewBox="0 0 64 72" fill="none"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="32" y1="0" x2="32" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={G} stopOpacity="0.9" />
            <stop offset="100%" stopColor={G} stopOpacity="0.3" />
          </linearGradient>
          <filter id="shieldGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Shield body */}
        <path
          d="M32 4 L58 14 L58 36 Q58 56 32 68 Q6 56 6 36 L6 14 Z"
          fill={`${G}18`}
          stroke="url(#shieldGrad)"
          strokeWidth="1.5"
          filter="url(#shieldGlow)"
        />
        {/* Inner shine */}
        <path
          d="M32 12 L50 20 L50 36 Q50 50 32 60 Q14 50 14 36 L14 20 Z"
          fill={`${G}0a`}
          stroke={`${G}44`}
          strokeWidth="1"
        />
        {/* Checkmark */}
        <path
          d="M22 36 L29 43 L43 29"
          stroke={G}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </motion.svg>
    </div>
  );
}

const TREE_PARTS = [
  // [cx, cy, rx, ry] — trunk + 5 foliage blobs
  { cx: 50, cy: 98, rx: 5, ry: 12 },   // trunk
  { cx: 50, cy: 75, rx: 22, ry: 16 },  // bottom canopy
  { cx: 50, cy: 58, rx: 17, ry: 14 },  // mid canopy
  { cx: 38, cy: 52, rx: 12, ry: 10 },  // left branch
  { cx: 62, cy: 50, rx: 12, ry: 10 },  // right branch
  { cx: 50, cy: 40, rx: 13, ry: 12 },  // top canopy
];

const SPARKLE_POS = [
  { x: 28, delay: 0 },
  { x: 50, delay: 0.3 },
  { x: 68, delay: 0.6 },
  { x: 42, delay: 0.9 },
];

function TreePreview({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Floating sparkles when selected */}
      <AnimatePresence>
        {active && SPARKLE_POS.map((sp, i) => (
          <motion.div
            key={`sp-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 5, height: 5,
              background: G,
              boxShadow: `0 0 6px ${G}`,
              left: `${sp.x}%`,
              bottom: "22%",
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -38, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, delay: sp.delay, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
      <svg width="90" height="120" viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="treeGrad" x1="45" y1="0" x2="45" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E8C96A"/>
            <stop offset="100%" stopColor="#7A5510"/>
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5C3D0E"/>
            <stop offset="50%" stopColor="#8B6520"/>
            <stop offset="100%" stopColor="#5C3D0E"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect x="37" y="90" width="16" height="24" rx="4" fill="url(#trunkGrad)"/>
        <polygon points="45,42 6,92 84,92" fill="url(#treeGrad)" opacity="0.85"/>
        <polygon points="45,22 14,68 76,68" fill="url(#treeGrad)" opacity="0.92"/>
        <polygon points="45,4 22,46 68,46" fill="url(#treeGrad)"/>
        <polygon points="45,4 22,46 45,46" fill="#E8C96A" opacity="0.12"/>
        <polygon points="45,22 14,68 45,68" fill="#E8C96A" opacity="0.08"/>
        <polygon points="45,42 6,92 45,92" fill="#E8C96A" opacity="0.06"/>
        <g filter="url(#glow)" transform="translate(45,4)">
          <polygon points="0,-7 1.8,-2.2 6.6,-2.2 2.8,0.8 4.2,5.6 0,2.8 -4.2,5.6 -2.8,0.8 -6.6,-2.2 -1.8,-2.2" fill="#E8C96A"/>
        </g>
      </svg>
    </div>
  );
}

function ElitePreview({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <motion.div
        style={{
          width: 160, height: 96,
          borderRadius: 12,
          background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #0a0a0a 100%)",
          border: `1px solid ${G}44`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${G}22`,
          position: "relative",
          overflow: "hidden",
        }}
        initial={{ y: 30, rotate: -6, opacity: 0 }}
        animate={{ y: 0, rotate: -4, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* Shimmer scan line — always on, more visible when active */}
        <motion.div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            width: 40,
            background: `linear-gradient(90deg, transparent, ${G}${active ? "44" : "1a"}, transparent)`,
            borderRadius: 4,
          }}
          animate={{ left: ["-20%", "130%"] }}
          transition={{ duration: active ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: active ? 0.2 : 1.2 }}
        />
        {/* Chip */}
        <div style={{
          position: "absolute", top: 18, left: 16,
          width: 24, height: 18, borderRadius: 4,
          background: `linear-gradient(135deg, ${G}88, ${G}44)`,
          border: `1px solid ${G}66`,
        }} />
        {/* ELITE label */}
        <div style={{
          position: "absolute", bottom: 14, left: 16,
          fontFamily: "DM Sans, sans-serif",
          fontSize: 11, fontWeight: 700,
          color: G, letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}>
          ELITE
        </div>
        {/* Crown icon */}
        <div style={{
          position: "absolute", bottom: 12, right: 16,
          color: G, opacity: 0.8, fontSize: 16,
        }}>♛</div>
        {/* Four dots */}
        <div style={{
          position: "absolute", bottom: 14, left: "40%",
          display: "flex", gap: 5,
        }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: `${G}55` }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Icon map for info row ─────────────────────────────────────────────────────
const PREVIEW_MAP: Record<string, (active: boolean) => React.ReactNode> = {
  shield: (a) => <ShieldPreview active={a} />,
  skin:   (a) => <TreePreview active={a} />,
  elite:  (a) => <ElitePreview active={a} />,
};

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <Shield className="h-4 w-4" />,
  skin:   <Sparkles className="h-4 w-4" />,
  elite:  <Crown className="h-4 w-4" />,
};

// ── Main component ────────────────────────────────────────────────────────────
function Paywall() {
  const [, update] = useAppState();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("main");
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [seconds, setSeconds] = useState(14 * 60 + 59);
  const [finalSeconds, setFinalSeconds] = useState(5 * 60);
  const [feedIdx, setFeedIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
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

  const subscribe = () => {
    update({ paywallSeen: true, isPremium: true });
    setStage("upsell");
  };

  const continueFree = () => {
    update({ paywallSeen: true, isPremium: false });
    navigate({ to: "/" });
  };

  const finishUpsell = () => {
    if (selected === "shield") update({ momentumShieldDays: 3 });
    navigate({ to: "/" });
  };

  // ── UPSELL STAGE ───────────────────────────────────────────────────────────
  if (stage === "upsell") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: BG, fontFamily: "DM Sans, sans-serif" }}
      >
        <motion.div
          className="mx-auto w-full max-w-md px-5 pt-12 pb-10 flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-5">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase"
              style={{
                background: `${G}12`,
                border: `1px solid ${G}44`,
                color: G,
              }}
            >
              ✦ One More Thing
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-center text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: "#f5f0e8" }}
          >
            Protect what you've built.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm mb-7"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Optional. Add it now or find it later in settings.
          </motion.p>

          {/* Cards */}
          <div className="flex flex-col gap-3">
            {UPSELLS.map(({ id, title, desc, price }) => {
              const isSelected = selected === id;
              return (
                <motion.div key={id} variants={itemVariants}>
                  <motion.button
                    onClick={() => setSelected(isSelected ? null : id)}
                    className="w-full text-left"
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <motion.div
                      animate={{
                        borderColor: isSelected ? G : CARD_BORDER,
                        boxShadow: isSelected
                          ? `0 0 20px rgba(201,168,76,0.15), inset 0 0 0 1px ${G}22`
                          : "none",
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: CARD_BG,
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderRadius: 18,
                        overflow: "hidden",
                      }}
                    >
                      {/* Preview zone */}
                      <div
                        style={{
                          height: 130,
                          background: isSelected
                            ? `radial-gradient(ellipse 70% 80% at 50% 60%, ${G}0d 0%, transparent 75%)`
                            : "rgba(0,0,0,0.3)",
                          borderBottom: `1px solid ${isSelected ? G + "33" : CARD_BORDER}`,
                          transition: "background 0.35s ease",
                          position: "relative",
                        }}
                      >
                        {PREVIEW_MAP[id]?.(isSelected)}
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        {/* Icon box */}
                        <div
                          style={{
                            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                            background: `${G}14`,
                            border: `1px solid ${G}33`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: G,
                          }}
                        >
                          {ICON_MAP[id]}
                        </div>

                        {/* Name + desc */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight" style={{ color: "#f5f0e8" }}>
                            {title}
                          </p>
                          <p className="text-[11px] mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.38)" }}>
                            {desc}
                          </p>
                        </div>

                        {/* Price */}
                        <p className="text-sm font-bold shrink-0 mr-2" style={{ color: G }}>
                          {price}
                        </p>

                        {/* Radio circle */}
                        <motion.div
                          animate={{
                            borderColor: isSelected ? G : "rgba(255,255,255,0.2)",
                            background: isSelected ? G : "transparent",
                          }}
                          transition={{ duration: 0.18 }}
                          style={{
                            width: 20, height: 20, borderRadius: "50%",
                            borderWidth: 1.5, borderStyle: "solid",
                            flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{ width: 8, height: 8, borderRadius: "50%", background: "#090705" }}
                            />
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom button */}
          <motion.div variants={itemVariants} className="mt-7">
            <motion.button
              onClick={finishUpsell}
              className="w-full h-14 font-semibold text-sm"
              style={{
                background: selected
                  ? `linear-gradient(135deg, ${G}, #a07830)`
                  : "rgba(255,255,255,0.06)",
                color: selected ? "#090705" : "rgba(255,255,255,0.45)",
                borderRadius: 14,
                border: selected ? "none" : `1px solid rgba(255,255,255,0.1)`,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.01em",
                boxShadow: selected ? `0 0 28px ${G}44` : "none",
                transition: "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {selected
                ? (() => {
                    const item = UPSELLS.find((u) => u.id === selected);
                    return `Add ${item?.title} — ${item?.price}`;
                  })()
                : "No thanks, continue"}
            </motion.button>

            {selected && (
              <motion.button
                onClick={() => { setSelected(null); finishUpsell(); }}
                className="w-full h-10 mt-2 text-sm"
                style={{ color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileTap={{ opacity: 0.6 }}
              >
                Skip for now
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── FINAL STAGE ────────────────────────────────────────────────────────────
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
        <button onClick={subscribe}
          className="mt-6 h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}>
          Claim 92% Discount
        </button>
        <button onClick={continueFree} className="mt-3 h-12 w-full rounded-xl text-sm text-muted-foreground">
          No thanks, continue free
        </button>
      </div>
    );
  }

  // ── MAIN STAGE ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mx-auto max-w-md px-6 pt-10 pb-10 flex flex-col gap-5">
      <div className="flex justify-end">
        <button onClick={continueFree} className="h-9 w-9 grid place-items-center rounded-full border border-border text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Your plan is ready</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">Your recovery plan is ready.</h1>
        <p className="mt-1 text-muted-foreground text-sm">Join the men who chose differently.</p>
      </div>

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

      <div className="rounded-full border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground text-center transition-all">
        {LIVE_FEED[feedIdx]}
      </div>

      <div className="mx-auto rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1.5 text-xs text-destructive-foreground">
        This offer expires in {fmt(seconds)}
      </div>

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

      <ul className="space-y-2 text-sm">
        {[
          "Personalized brain recovery timeline",
          "SOS urge surfing tools, anytime",
          "Smart reminders tailored to you",
          "Daily reframes + momentum tracking",
          "Life Tree — your sacred progress symbol",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-primary shrink-0" /> {f}
          </li>
        ))}
      </ul>

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

      <button onClick={subscribe}
        className="h-14 w-full rounded-xl text-primary-foreground font-semibold text-base shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}>
        Start reclaiming your life
      </button>
      <button onClick={continueFree} className="h-10 w-full rounded-xl text-sm text-muted-foreground">
        Continue with free plan
      </button>
      <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" /> 7-day free trial · Cancel anytime · 256-bit encryption
      </p>
    </div>
  );
}

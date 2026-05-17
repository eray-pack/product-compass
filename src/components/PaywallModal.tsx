import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { usePaywallOpen, closePaywall, triggerPaywall } from "@/lib/paywall";

// ── Tokens (hardcoded — no CSS variables) ─────────────────────────────────────
const BG       = "#090705";
const CARD_BG  = "#0f0c06";
const GOLD     = "#C9A84C";
const WHITE    = "#f5f0e8";
const MUTED    = "#5a5040";
const BORDER   = "1px solid #1e1a10";
const SEL_BORDER = "1.5px solid #C9A84C";
const SEL_SHADOW = "0 0 16px rgba(201,168,76,0.15)";
const GOLD_BTN_BG = "linear-gradient(135deg,#C9A84C,#E8C96A)";

const RENAG_AFTER_MS = 24 * 60 * 60 * 1000;
const TIMER_START    = 14 * 60 + 51;

// ── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Marcus, 24", text: "day 31. got a promotion last week. coincidence? i don't think so" },
  { name: "Jaylen, 19", text: "i was sceptical but the tree thing actually makes me not want to ruin it" },
  { name: "Timo, 28",   text: "first time i've gone this long. my girlfriend noticed before i told her" },
  { name: "Arjun, 31",  text: "the momentum thing is genius. i relapsed once and kept going. old me would've quit" },
];

const FEATURES = [
  { icon: "🧠", label: "AI Coach" },
  { icon: "🆘", label: "SOS Tools" },
  { icon: "⏰", label: "Daily Check-in" },
  { icon: "📈", label: "Progress" },
  { icon: "🌳", label: "Sacred Tree" },
  { icon: "🎮", label: "Craving Games" },
];

// ── Variants ─────────────────────────────────────────────────────────────────
export const cV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
export const iV = {
  hidden:  { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { type: "spring" as const, stiffness: 380, damping: 26 } },
};

// ── Flip clock ────────────────────────────────────────────────────────────────
function FlipDigit({ value, id }: { value: string; id: string }) {
  return (
    <span style={{ overflow: "hidden", display: "inline-block", minWidth: "0.55em", textAlign: "center" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`${id}${value}`}
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y:  18, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          style={{ display: "block" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FlipClock({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      fontFamily: "'DM Mono','Courier New',monospace",
      fontSize: 34, fontWeight: 700, color: GOLD, letterSpacing: "-0.02em",
    }}>
      <FlipDigit id="m0" value={mm[0]} />
      <FlipDigit id="m1" value={mm[1]} />
      <span style={{ opacity: 0.4, margin: "0 2px" }}>:</span>
      <FlipDigit id="s0" value={ss[0]} />
      <FlipDigit id="s1" value={ss[1]} />
    </div>
  );
}

// ── Shared paywall content ────────────────────────────────────────────────────
export interface PaywallContentProps {
  timerSeconds: number;
  plan: "annual" | "monthly";
  onPlanChange: (p: "annual" | "monthly") => void;
  onClaim: () => void;
  onDismiss: () => void;
  purchasing?: boolean;
  isFinalOffer?: boolean;
}

export function PaywallContent({
  timerSeconds,
  plan,
  onPlanChange,
  onClaim,
  onDismiss,
  purchasing = false,
  isFinalOffer = false,
}: PaywallContentProps) {
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      variants={cV}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 22 }}
    >
      {/* ── Timer ── */}
      <motion.div variants={iV} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <FlipClock seconds={timerSeconds} />
        <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
          offer expires
        </p>
      </motion.div>

      {/* ── Headline ── */}
      <motion.div variants={iV} style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 16, fontWeight: 700, fontStyle: "italic",
          color: GOLD, margin: "0 0 8px", letterSpacing: 0,
        }}>
          {isFinalOffer ? "Final Offer" : "Unlock Pro"}
        </p>
        <h1 style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 30, fontWeight: 700, color: WHITE,
          margin: "0 0 6px", lineHeight: 1.15,
        }}>
          {isFinalOffer ? "One last chance." : "Reclaim your life."}
        </h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
          {isFinalOffer
            ? "Lowest price ever. Only on this screen."
            : "Join 46,000+ men who chose differently."}
        </p>
      </motion.div>

      {/* ── Plan cards ── */}
      <motion.div variants={iV} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {(["annual", "monthly"] as const).map((p) => {
          const isAnnual = p === "annual";
          const sel = plan === p;
          return (
            <motion.button
              key={p}
              onClick={() => onPlanChange(p)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              style={{
                position: "relative",
                background: "none", border: "none",
                padding: isAnnual ? "12px 0 0" : 0,
                cursor: "pointer", textAlign: "left",
              }}
            >
              {isAnnual && (
                <span style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                  padding: "3px 9px", borderRadius: 20,
                  background: GOLD_BTN_BG,
                  color: BG, whiteSpace: "nowrap", zIndex: 1, lineHeight: 1.6,
                }}>
                  83% OFF
                </span>
              )}
              <motion.div
                animate={{
                  borderColor: sel ? GOLD : "#1e1a10",
                  boxShadow: sel ? SEL_SHADOW : "none",
                }}
                transition={{ duration: 0.2 }}
                style={{
                  background: CARD_BG,
                  borderWidth: 1.5, borderStyle: "solid",
                  borderRadius: 16, padding: "16px 14px",
                }}
              >
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: sel ? GOLD : MUTED,
                  margin: "0 0 8px",
                }}>
                  {isAnnual ? "Annual" : "Monthly"}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1 }}>
                  {isAnnual ? "$3.33" : "$19.99"}
                </p>
                <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0" }}>per month</p>
                {isAnnual && (
                  <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0", opacity: 0.6 }}>
                    billed $39.99/yr
                  </p>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Feature grid ── */}
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
      >
        {FEATURES.map(({ icon, label }) => (
          <motion.div
            key={label}
            variants={iV}
            style={{
              background: CARD_BG,
              border: BORDER,
              borderRadius: 14, padding: "14px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
            }}
          >
            <span style={{ fontSize: 22 }}>{icon}</span>
            <p style={{ fontSize: 11, color: MUTED, margin: 0, textAlign: "center", lineHeight: 1.2 }}>
              {label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Testimonial strip ── */}
      <motion.div
        variants={iV}
        style={{
          background: CARD_BG,
          border: BORDER,
          borderRadius: 16, padding: "18px 20px",
          minHeight: 90, display: "flex", alignItems: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%" }}
          >
            <p style={{ fontSize: 13, color: WHITE, margin: "0 0 8px", lineHeight: 1.45 }}>
              "{TESTIMONIALS[tIdx].text}"
            </p>
            <p style={{ fontSize: 11, color: GOLD, margin: 0, fontWeight: 600 }}>
              — {TESTIMONIALS[tIdx].name}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── CTA ── */}
      <motion.div variants={iV}>
        <motion.button
          onClick={onClaim}
          disabled={purchasing}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          style={{
            width: "100%", height: 56,
            background: GOLD_BTN_BG,
            border: "none", borderRadius: 16,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15, fontWeight: 700, color: BG,
            boxShadow: "0 0 32px rgba(201,168,76,0.35)",
            cursor: purchasing ? "not-allowed" : "pointer",
            opacity: purchasing ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, overflow: "hidden",
          }}
        >
          {purchasing ? (
            <>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              Processing…
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.span
                key={plan}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {plan === "annual" ? "Get Annual — $3.33/mo" : "Get Monthly — $19.99/mo"}
              </motion.span>
            </AnimatePresence>
          )}
        </motion.button>
      </motion.div>

      {/* ── Dismiss ── */}
      <motion.div variants={iV} style={{ textAlign: "center" }}>
        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: MUTED,
            fontFamily: "DM Sans, sans-serif", padding: "6px 0",
          }}
        >
          No thanks
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Modal overlay ─────────────────────────────────────────────────────────────
export function PaywallModal() {
  const open                = usePaywallOpen();
  const [state, update]     = useAppState();
  const [seconds, setSeconds] = useState(TIMER_START);
  const [plan, setPlan]     = useState<"annual" | "monthly">("annual");
  const hasOpenedRef        = useRef(false);

  useEffect(() => {
    if (!open) return;
    hasOpenedRef.current = true;
    setSeconds(TIMER_START);
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (!hasOpenedRef.current) return;
    const t = setTimeout(() => triggerPaywall(), RENAG_AFTER_MS);
    return () => clearTimeout(t);
  }, [open]);

  const isFinalOffer = state.paywallSeen && !state.isPremium;

  if (!open) return null;

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
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        style={{
          position: "relative", width: "100%", maxWidth: 480,
          background: CARD_BG,
          border: "1px solid #2a2010",
          borderRadius: "24px 24px 0 0",
          maxHeight: "93dvh", overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2a2010" }} />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 16, zIndex: 10,
            width: 32, height: 32, borderRadius: "50%",
            background: "#1a1508",
            border: "1px solid #2a2010",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: MUTED,
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>

        <div style={{ padding: "16px 20px 36px" }}>
          <PaywallContent
            timerSeconds={seconds}
            plan={plan}
            onPlanChange={setPlan}
            onClaim={claim}
            onDismiss={dismiss}
            isFinalOffer={isFinalOffer}
          />
        </div>
      </motion.div>
    </div>
  );
}

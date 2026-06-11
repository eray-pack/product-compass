import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState } from "@/lib/store";
import { usePaywallOpen, closePaywall, triggerPaywall } from "@/lib/paywall";
import { Capacitor } from "@capacitor/core";
import { purchaseAnnual, purchaseMonthly } from "@/lib/purchases";

// ── Tokens ─────────────────────────────────────────────────────────────────────
const GOLD          = "#C9A84C";
const WHITE         = "#f5f0e8";
const MUTED         = "#5a5040";
const CARD_BG_HEX   = "#080512";
const BORDER_SUB    = "1px solid rgba(201,168,76,0.09)";
const SEL_SHADOW_ANNUAL  = "0 0 0 0.5px rgba(232,200,100,0.42), 0 0 22px rgba(201,168,76,0.30), 0 0 44px rgba(201,168,76,0.14)";
const SEL_SHADOW_MONTHLY = "0 0 16px rgba(201,168,76,0.16)";
const GOLD_BTN_BG   = "linear-gradient(145deg, #D4954A 0%, #C4873A 35%, #A87030 65%, #C08840 100%)";

const RENAG_AFTER_MS = 24 * 60 * 60 * 1000;
const TIMER_START    = 14 * 60 + 51;

// ── Sparkle particles ─────────────────────────────────────────────────────────
const MODAL_SPARKLES = [
  { x: 7,  y: 10, size: 2.0, delay: 0.0, dur: 8.0,  blue: false },
  { x: 22, y: 4,  size: 1.5, delay: 1.3, dur: 9.5,  blue: false },
  { x: 38, y: 16, size: 2.2, delay: 2.8, dur: 7.5,  blue: false },
  { x: 57, y: 7,  size: 1.8, delay: 0.7, dur: 10.0, blue: true  },
  { x: 73, y: 13, size: 2.0, delay: 3.5, dur: 8.5,  blue: false },
  { x: 89, y: 5,  size: 1.6, delay: 1.9, dur: 9.0,  blue: false },
  { x: 15, y: 38, size: 1.8, delay: 4.3, dur: 8.2,  blue: false },
  { x: 44, y: 32, size: 1.5, delay: 0.5, dur: 11.0, blue: false },
  { x: 79, y: 45, size: 2.3, delay: 2.1, dur: 7.8,  blue: true  },
  { x: 30, y: 60, size: 1.8, delay: 5.1, dur: 9.2,  blue: false },
  { x: 64, y: 68, size: 2.0, delay: 1.6, dur: 8.4,  blue: false },
  { x: 91, y: 55, size: 1.6, delay: 3.9, dur: 10.5, blue: false },
];

// ── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Marcus, 24", text: "day 31. got a promotion last week. coincidence? i don't think so" },
  { name: "Jaylen, 19", text: "i was sceptical but the tree thing actually makes me not want to ruin it" },
  { name: "Timo, 28",   text: "first time i've gone this long. my girlfriend noticed before i told her" },
  { name: "Arjun, 31",  text: "the momentum thing is genius. i relapsed once and kept going. old me would've quit" },
];

const FEATURE_META = [
  { icon: "🔗", labelKey: "multipleAddictions", descKey: "multipleAddictionsDesc", glow: "#C9A84C" },
  { icon: "🧠", labelKey: "aiCoach",       descKey: "aiCoachDesc",       glow: "#7C3AED" },
  { icon: "📊", labelKey: "progress",      descKey: "progressDesc",      glow: "#10B981" },
  { icon: "🎮", labelKey: "proGames",      descKey: "proGamesDesc",      glow: "#F97316" },
  { icon: "🌳", labelKey: "sacredTree",    descKey: "sacredTreeDesc",    glow: "#16A34A" },
  { icon: "🐺", labelKey: "wolfCompanion", descKey: "wolfCompanionDesc", glow: "#6366F1" },
  { icon: "🆘", labelKey: "sosTools",      descKey: "sosToolsDesc",      glow: "#EF4444" },
  { icon: "🏆", labelKey: "milestones",    descKey: "milestonesDesc",    glow: "#C9A84C" },
  { icon: "💬", labelKey: "community",     descKey: "communityDesc",     glow: "#0EA5E9" },
  { icon: "⚡", labelKey: "xpMultiplier",  descKey: "xpMultiplierDesc",  glow: "#EAB308" },
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
  const { t } = useTranslation();
  const [tIdx, setTIdx] = useState(0);

  const FEATURES = FEATURE_META.map(({ icon, labelKey, descKey, glow }) => ({
    icon,
    label: t(`paywall.features.${labelKey}`),
    desc:  t(`paywall.features.${descKey}`),
    glow,
  }));

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
      {/* ── Headline ── */}
      <motion.div variants={iV} style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 16, fontWeight: 700, fontStyle: "italic",
          color: GOLD, margin: "0 0 8px", letterSpacing: 0,
        }}>
          {isFinalOffer ? t("paywall.finalOffer") : t("paywall.unlockPro")}
        </p>
        <h1 style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 30, fontWeight: 700, color: WHITE,
          margin: "0 0 6px", lineHeight: 1.15,
        }}>
          {isFinalOffer ? t("paywall.oneLast") : t("paywall.reclaimYourLife")}
        </h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
          {isFinalOffer ? t("paywall.finalSubCopy") : t("paywall.subCopy")}
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
                  color: "#050308", whiteSpace: "nowrap", zIndex: 1, lineHeight: 1.6,
                }}>
                  83% OFF
                </span>
              )}
              <motion.div
                animate={{
                  borderColor: sel ? GOLD : "rgba(201,168,76,0.09)",
                  boxShadow: sel
                    ? isAnnual ? SEL_SHADOW_ANNUAL : SEL_SHADOW_MONTHLY
                    : "none",
                }}
                transition={{ duration: 0.2 }}
                style={{
                  background: CARD_BG_HEX,
                  borderWidth: sel && isAnnual ? 1.5 : 1,
                  borderStyle: "solid",
                  borderRadius: 16, padding: "16px 14px",
                }}
              >
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: sel ? GOLD : MUTED,
                  margin: "0 0 8px",
                }}>
                  {isAnnual ? t("paywall.annual") : t("paywall.monthly")}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1 }}>
                  {isAnnual ? "$3.33" : "$19.99"}
                </p>
                <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0" }}>{t("paywall.perMonth")}</p>
                {isAnnual && (
                  <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0", opacity: 0.6 }}>
                    {t("paywall.billedAnnually")}
                  </p>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Feature list ── */}
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        style={{
          background: CARD_BG_HEX,
          border: BORDER_SUB,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {FEATURES.map(({ icon, label, desc, glow }, i) => (
          <motion.div
            key={label}
            variants={iV}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "13px 16px",
              borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none",
            }}
          >
            {/* Glow icon box */}
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: `${glow}18`,
              border: `1px solid ${glow}40`,
              boxShadow: `0 0 10px ${glow}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: WHITE, margin: 0, lineHeight: 1.2 }}>
                {label}
              </p>
              <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0", lineHeight: 1.3 }}>
                {desc}
              </p>
            </div>

            {/* Check */}
            <div style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
              background: `${glow}20`,
              border: `1px solid ${glow}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: glow, fontWeight: 700,
            }}>
              ✓
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Testimonial strip ── */}
      <motion.div
        variants={iV}
        style={{
          background: CARD_BG_HEX,
          border: BORDER_SUB,
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
            position: "relative",
            width: "100%", height: 56,
            background: GOLD_BTN_BG,
            border: "none", borderRadius: 16,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 15, fontWeight: 700, color: "#050308",
            boxShadow: "0 4px 24px rgba(196,135,58,0.42), 0 1px 8px rgba(0,0,0,0.60)",
            cursor: purchasing ? "not-allowed" : "pointer",
            opacity: purchasing ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, overflow: "hidden",
          }}
        >
          {/* Shimmer sweep */}
          {!purchasing && (
            <motion.div
              animate={{ x: ["-100%", "280%"] }}
              transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.2 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "60%",
                background: "linear-gradient(105deg, transparent 20%, rgba(255,245,200,0.38) 50%, transparent 80%)",
                pointerEvents: "none",
              }}
            />
          )}
          {purchasing ? (
            <>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              {t("paywall.processing")}
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.span
                key={plan}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ position: "relative", zIndex: 1 }}
              >
                {plan === "annual" ? t("paywall.getAnnual") : t("paywall.getMonthly")}
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
          {t("paywall.noThanks")}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Modal overlay ─────────────────────────────────────────────────────────────
export function PaywallModal() {
  const open              = usePaywallOpen();
  const [state, update]   = useAppState();
  const [seconds, setSeconds] = useState(TIMER_START);
  const [plan, setPlan]   = useState<"annual" | "monthly">("annual");
  const hasOpenedRef      = useRef(false);
  const dragControls      = useDragControls();

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

  // On native, PRO must come from a REAL App Store purchase through RevenueCat —
  // granting isPremium directly would be an instant App Review rejection (and a
  // free-PRO hole). Web keeps the direct unlock until web billing exists.
  const claim = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const ok = plan === "annual" ? await purchaseAnnual() : await purchaseMonthly();
        if (ok) { update({ isPremium: true }); closePaywall(); }
      } catch {
        // Purchase failed/unavailable — keep the paywall open, no silent unlock
      }
      return;
    }
    update({ isPremium: true });
    closePaywall();
  };

  const dismiss = () => {
    update({ paywallSeen: true });
    closePaywall();
  };

  return (
    <>
      <style>{`
        @keyframes pm-sparkle {
          0%   { transform: translateY(0px) scale(1.0); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-22px) scale(0.80); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          background: "rgba(0,0,0,0.84)", backdropFilter: "blur(6px)",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.7 }}
          onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 500) dismiss(); }}
          style={{
            position: "relative", width: "100%", maxWidth: 480,
            background: "radial-gradient(ellipse at 50% 20%, #0c0812 0%, #07050e 55%, #020104 100%)",
            border: "1px solid rgba(201,168,76,0.13)",
            borderRadius: "24px 24px 0 0",
            maxHeight: "93dvh",
            overflow: "hidden",
          }}
        >
          {/* ── Gold vector grid overlay ── */}
          <svg
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              opacity: 0.05, pointerEvents: "none",
            }}
          >
            <defs>
              <pattern id="pm-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="48" y2="48" stroke="#C9A84C" strokeWidth="0.5" />
                <line x1="48" y1="0" x2="0" y2="48" stroke="#C9A84C" strokeWidth="0.35" />
                <circle cx="0"  cy="0"  r="1.4" fill="#C9A84C" opacity="0.9" />
                <circle cx="48" cy="0"  r="1.4" fill="#C9A84C" opacity="0.9" />
                <circle cx="0"  cy="48" r="1.4" fill="#C9A84C" opacity="0.9" />
                <circle cx="48" cy="48" r="1.4" fill="#C9A84C" opacity="0.9" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pm-grid)" />
          </svg>

          {/* ── Drifting sparkle particles ── */}
          {MODAL_SPARKLES.map((s, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                borderRadius: "50%",
                background: s.blue ? "#8ab4f8" : "#ffd700",
                boxShadow: s.blue
                  ? "0 0 6px 2px rgba(138,180,248,0.72)"
                  : "0 0 7px 2px rgba(255,215,0,0.72)",
                animation: `pm-sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          ))}

          {/* ── Scrollable content ── */}
          <div style={{ position: "relative", zIndex: 1, overflowY: "auto", maxHeight: "93dvh" }}>
            {/* Drag handle — pull down to dismiss */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px", cursor: "grab", touchAction: "none" }}
            >
              <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(201,168,76,0.30)" }} />
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                position: "absolute", top: 14, right: 16, zIndex: 10,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(8,5,18,0.82)",
                border: "1px solid rgba(201,168,76,0.18)",
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
          </div>
        </motion.div>
      </div>
    </>
  );
}

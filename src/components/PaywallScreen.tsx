import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Tokens (hardcoded — no CSS variables) ─────────────────────────────────────
const BG      = "#090705";
const CARD_BG = "#0f0c06";
const GOLD    = "#C9A84C";
const WHITE   = "#ffffff";
const MUTED   = "#5a5040";

// ── Variants ──────────────────────────────────────────────────────────────────
const cV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const iV = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 380, damping: 26 } },
};

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🧠", label: "AI Coach" },
  { icon: "🆘", label: "SOS Tools" },
  { icon: "📊", label: "Progress" },
  { icon: "🌳", label: "Sacred Tree" },
  { icon: "🐺", label: "Wolf Companion" },
  { icon: "🎮", label: "9 Pro Games" },
  { icon: "🏆", label: "Milestones" },
  { icon: "💬", label: "Community" },
  { icon: "⚡", label: "XP Multiplier" },
];

const TESTIMONIALS = [
  { initials: "M", name: "Marcus, 24", quote: "day 31. got a promotion last week." },
  { initials: "J", name: "Jaylen, 19", quote: "actually makes me motivated" },
  { initials: "S", name: "Sven, 22",   quote: "best decision I made this year" },
];

// ── Background particles ───────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 38 }, (_, i) => ({
  x:     (i * 37.3 + 11) % 100,
  y:     (i * 61.7 + 7)  % 100,
  size:  0.8 + (i % 5) * 0.5,
  dur:   3.5 + (i % 7) * 0.9,
  delay: (i * 0.41)      % 4,
  drift: ((i % 3) - 1) * 18,
}));

function PaywallBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{`
        @keyframes pw-float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-60px) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes pw-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Deep vignette bottom */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 100% 55% at 50% 110%, rgba(201,168,76,0.06) 0%, transparent 70%)",
      }} />

      {/* Top crown glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(201,168,76,0.13) 0%, transparent 65%)",
      }} />

      {/* Diagonal fine grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.045 }}>
        <defs>
          <pattern id="pw-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke={GOLD} strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pw-grid)" />
      </svg>

      {/* Floating gold dust */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left:   `${p.x}%`,
            top:    `${p.y}%`,
            width:  p.size,
            height: p.size,
            borderRadius: "50%",
            background: GOLD,
            boxShadow: `0 0 ${p.size * 2}px ${GOLD}`,
            // @ts-ignore
            "--drift": `${p.drift}px`,
            animation: `pw-float ${p.dur}s ${p.delay}s ease-in-out infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* Centre radial fade to keep text readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(9,7,5,0.55) 100%)",
      }} />
    </div>
  );
}

// ── FlipUnit ──────────────────────────────────────────────────────────────────
function FlipUnit({ value }: { value: number }) {
  const str = String(value).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[str[0], str[1]].map((digit, i) => (
        <div
          key={i}
          style={{
            background: CARD_BG,
            border: "1px solid #2a2010",
            borderRadius: 10,
            padding: "8px 10px",
            minWidth: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0,   opacity: 1 }}
              exit={{   y:  16, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                display: "block",
                fontSize: 28,
                fontWeight: 700,
                color: WHITE,
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
interface PlanCardProps {
  id: "annual" | "monthly";
  label: string;
  price: string;
  sub: string;
  badge?: string;
  selected: boolean;
  onSelect: (id: "annual" | "monthly") => void;
}

function PlanCard({ id, label, price, sub, badge, selected, onSelect }: PlanCardProps) {
  return (
    <div style={{ flex: 1, paddingTop: badge ? 12 : 0, position: "relative" }}>
      {badge && (
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#C9A84C,#E8C96A)",
          color: BG,
          fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
          padding: "3px 10px", borderRadius: 20,
          whiteSpace: "nowrap", zIndex: 1, lineHeight: 1.6,
        }}>
          {badge}
        </div>
      )}
      <motion.div
        onClick={() => onSelect(id)}
        animate={{
          borderColor: selected ? GOLD : "#1e1a10",
          boxShadow: selected ? "0 0 16px rgba(201,168,76,0.15)" : "none",
        }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.96 }}
        style={{
          background: CARD_BG,
          borderWidth: 1.5, borderStyle: "solid",
          borderRadius: 20,
          padding: "14px 14px 12px",
          cursor: "pointer",
          position: "relative",
          overflow: "visible",
        }}
      >
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: selected ? GOLD : MUTED,
          margin: "0 0 8px",
        }}>
          {label}
        </p>

        <p style={{ margin: 0, lineHeight: 1 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: WHITE }}>{price}</span>
          <span style={{ fontSize: 12, color: MUTED, marginLeft: 2 }}>/mo</span>
        </p>

        <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0" }}>{sub}</p>

        {/* Radio dot */}
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          width: 18, height: 18, borderRadius: "50%",
          border: `1.5px solid ${selected ? GOLD : "#2a2010"}`,
          background: selected ? GOLD : "transparent",
          transition: "all 0.2s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: BG }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── FeatureIcon ───────────────────────────────────────────────────────────────
function FeatureIcon({ icon, label, index }: { icon: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 24 }}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
      }}
    >
      {/* Icon — unchanged */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "rgba(201,168,76,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 10, color: MUTED, textAlign: "center", lineHeight: 1.2 }}>
        <span style={{ color: GOLD, fontWeight: 700, marginRight: 2 }}>✓</span>{label}
      </span>
    </motion.div>
  );
}

// ── PaywallScreen ─────────────────────────────────────────────────────────────
interface PaywallScreenProps {
  onSubscribe: (plan: "annual" | "monthly") => void;
  onDismiss: () => void;
}

export function PaywallScreen({ onSubscribe, onDismiss }: PaywallScreenProps) {
  const [plan, setPlan]                   = useState<"annual" | "monthly">("annual");
  const [time, setTime]                   = useState(14 * 60 + 51);
  const [activeTestimonial, setActive]    = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(time / 60);
  const secs    = time % 60;

  return (
    <motion.div
      variants={cV}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex", flexDirection: "column",
        height: "100dvh",
        background: BG,
        padding: "16px 20px 24px",
        gap: 16,
        position: "relative",
        fontFamily: "DM Sans, sans-serif",
        overflow: "hidden",
      }}
    >
      <PaywallBackground />

      {/* Close */}
      <motion.button
        variants={iV}
        onClick={onDismiss}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "absolute", top: 16, right: 20, zIndex: 10,
          width: 32, height: 32, borderRadius: "50%",
          background: "#1a1508",
          border: "1px solid #2a2010",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: MUTED, fontSize: 14, cursor: "pointer",
        }}
      >
        ✕
      </motion.button>

      {/* 1 — Timer */}
      <motion.div variants={iV} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", margin: 0 }}>
          Limited offer ends in
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FlipUnit value={minutes} />
          <span style={{ color: GOLD, fontSize: 24, fontWeight: 700, marginBottom: 2 }}>:</span>
          <FlipUnit value={secs} />
        </div>
      </motion.div>

      {/* 2 — Headline */}
      <motion.div variants={iV} style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 16, fontWeight: 700, fontStyle: "italic",
          color: GOLD, margin: "0 0 6px",
        }}>
          Unlock Pro
        </p>
        <h1 style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: 30, fontWeight: 700, color: WHITE,
          margin: 0, lineHeight: 1.15,
        }}>
          Reclaim your life.{" "}
          <span style={{ color: GOLD }}>Every tool. Unlocked.</span>
        </h1>
      </motion.div>

      {/* 3 — Plan cards */}
      <motion.div variants={iV} style={{ display: "flex", gap: 12 }}>
        <PlanCard
          id="annual"
          label="Annual"
          price="$3.33"
          sub="$39.99/year"
          badge="83% OFF"
          selected={plan === "annual"}
          onSelect={setPlan}
        />
        <PlanCard
          id="monthly"
          label="Monthly"
          price="$19.99"
          sub="per month"
          selected={plan === "monthly"}
          onSelect={setPlan}
        />
      </motion.div>

      {/* 4 — Feature grid */}
      <motion.div
        variants={iV}
        style={{
          background: CARD_BG,
          border: "1px solid #1e1a10",
          borderRadius: 18,
          padding: "14px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {FEATURES.map((f, i) => (
          <FeatureIcon key={i} icon={f.icon} label={f.label} index={i} />
        ))}
      </motion.div>

      {/* 5 — Testimonial strip */}
      <motion.div
        variants={iV}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(201,168,76,0.12)",
              border: `1px solid ${GOLD}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: GOLD, fontWeight: 700, flexShrink: 0,
            }}>
              {TESTIMONIALS[activeTestimonial].initials}
            </div>
            <p style={{ fontSize: 12, color: MUTED, flex: 1, lineHeight: 1.3, margin: 0 }}>
              <span style={{ color: GOLD, fontWeight: 600 }}>
                {TESTIMONIALS[activeTestimonial].name}
              </span>{" "}
              — "{TESTIMONIALS[activeTestimonial].quote}"
            </p>
            <span style={{ color: GOLD, fontSize: 11, flexShrink: 0 }}>★★★★★</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 6 — CTA */}
      <motion.div
        variants={iV}
        style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}
      >
        <motion.button
          onClick={() => onSubscribe(plan)}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#C9A84C,#E8C96A)",
            border: "none", borderRadius: 14,
            padding: "15px 0",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 16, fontWeight: 700,
            color: BG,
            cursor: "pointer",
            boxShadow: "0 0 28px rgba(201,168,76,0.3)",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={plan}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={{ display: "block" }}
            >
              {plan === "annual" ? "Get Annual — $3.33/mo" : "Get Monthly — $19.99/mo"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none",
            color: MUTED,
            fontSize: 13, cursor: "pointer",
            padding: "4px 0",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "@/components/BottomNav";

// ── Variants ──────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 26 },
  },
};

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
  { icon: "🧠", label: "Brain Reset" },
  { icon: "🆘", label: "SOS Mode" },
  { icon: "⏰", label: "Smart Alerts" },
  { icon: "📈", label: "Momentum" },
  { icon: "🌳", label: "Life Tree" },
  { icon: "🎮", label: "Craving Games" },
];

const testimonials = [
  { initials: "M", name: "Marcus, 24", quote: "day 31. got a promotion last week." },
  { initials: "J", name: "Jaylen, 19", quote: "actually makes me motivated" },
  { initials: "S", name: "Sven, 22",   quote: "best decision I made this year" },
];

// ── FlipUnit ──────────────────────────────────────────────────────────────────
function FlipUnit({ value }: { value: number }) {
  const str = String(value).padStart(2, "0");
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[str[0], str[1]].map((digit, i) => (
        <div
          key={i}
          style={{
            background: "#0f0c06",
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
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                display: "block",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
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
    <motion.div
      onClick={() => onSelect(id)}
      animate={{
        borderColor: selected ? "#C9A84C" : "#1e1a10",
        boxShadow: selected ? "0 0 20px rgba(201,168,76,0.15)" : "none",
      }}
      transition={{ duration: 0.25 }}
      whileTap={{ scale: 0.96 }}
      style={{
        flex: 1,
        background: "#0f0c06",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 20,
        padding: "14px 14px 12px",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -11,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#C9A84C",
            color: "#090705",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.15em",
            padding: "3px 10px",
            borderRadius: 20,
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </div>
      )}

      {/* Label */}
      <p
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: selected ? "#C9A84C" : "#5a5040",
          marginBottom: 8,
        }}
      >
        {label}
      </p>

      {/* Price */}
      <p style={{ margin: 0, lineHeight: 1 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>{price}</span>
        <span style={{ fontSize: 12, color: "#5a5040", marginLeft: 2 }}>/mo</span>
      </p>

      {/* Sub */}
      <p style={{ fontSize: 10, color: "#5a5040", margin: "4px 0 0" }}>{sub}</p>

      {/* Radio */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `1.5px solid ${selected ? "#C9A84C" : "#2a2010"}`,
          background: selected ? "#C9A84C" : "transparent",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#090705" }}
          />
        )}
      </div>
    </motion.div>
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 10,
          color: "#888",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
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
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [time, setTime] = useState(14 * 60 + 51);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % testimonials.length), 3000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <motion.div
      className="flex flex-col h-dvh bg-[#090705] px-5 pt-4 pb-6 gap-4 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* 1. CLOSE BUTTON */}
      <motion.button
        variants={item}
        onClick={onDismiss}
        className="absolute top-4 right-5 w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/40 text-sm"
        style={{ border: "none", cursor: "pointer", zIndex: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>

      {/* 2. FLIP CLOCK TIMER */}
      <motion.div variants={item} className="flex flex-col items-center gap-1 pt-2">
        <p className="text-[10px] tracking-[3px] text-[#C9A84C] uppercase">This offer expires in</p>
        <div className="flex items-center gap-2">
          <FlipUnit value={minutes} />
          <span className="text-[#C9A84C] text-2xl font-bold mb-1">:</span>
          <FlipUnit value={seconds} />
        </div>
      </motion.div>

      {/* 3. HEADLINE */}
      <motion.div variants={item} className="text-center">
        <div style={{ marginBottom: 4 }}><SectionTitle>Unlock Pro</SectionTitle></div>
        <h1
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#fff",
            margin: 0,
          }}
        >
          Your full recovery,
          <br />
          <em style={{ color: "#C9A84C", fontStyle: "normal" }}>unlocked.</em>
        </h1>
      </motion.div>

      {/* 4. PLAN CARDS */}
      <motion.div variants={item} className="flex gap-3">
        <PlanCard
          id="annual"
          label="ANNUAL"
          price="$3.33"
          sub="$39.99/year"
          badge="83% OFF"
          selected={plan === "annual"}
          onSelect={setPlan}
        />
        <PlanCard
          id="monthly"
          label="MONTHLY"
          price="$19.99"
          sub="per month"
          selected={plan === "monthly"}
          onSelect={setPlan}
        />
      </motion.div>

      {/* 5. FEATURE ICON GRID */}
      <motion.div
        variants={item}
        style={{
          background: "#0f0c06",
          border: "1px solid #1e1a10",
          borderRadius: 18,
          padding: "14px 16px",
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          {features.map((f, i) => (
            <FeatureIcon key={i} icon={f.icon} label={f.label} index={i} />
          ))}
        </div>
      </motion.div>

      {/* 6. TESTIMONIAL STRIP */}
      <motion.div variants={item} className="flex items-center gap-3 px-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTestimonial}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 w-full"
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(201,168,76,0.15)",
                border: "1px solid #C9A84C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#C9A84C",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {testimonials[activeTestimonial].initials}
            </div>
            <p style={{ fontSize: 12, color: "#888", flex: 1, lineHeight: 1.3, margin: 0 }}>
              <span style={{ color: "#C9A84C", fontWeight: 600 }}>
                {testimonials[activeTestimonial].name}
              </span>{" "}
              — "{testimonials[activeTestimonial].quote}"
            </p>
            <span style={{ color: "#C9A84C", fontSize: 11, flexShrink: 0 }}>★★★★★</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 7. CTA BUTTON */}
      <motion.div variants={item} className="mt-auto flex flex-col gap-2">
        <motion.button
          onClick={() => onSubscribe(plan)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #C9A84C, #ddb84a, #C9A84C)",
            border: "none",
            borderRadius: 14,
            padding: "15px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "#090705",
            cursor: "pointer",
            boxShadow: "0 0 28px rgba(201,168,76,0.3)",
            overflow: "hidden",
            position: "relative",
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
            background: "none",
            border: "none",
            color: "#3a3020",
            fontSize: 13,
            cursor: "pointer",
            padding: "4px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
}

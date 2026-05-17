import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Shield, Sparkles, Crown } from "lucide-react";
import { useAppState } from "@/lib/store";
import { purchaseMonthly, restorePurchases } from "@/lib/purchases";
import { PaywallContent, cV, iV } from "@/components/PaywallModal";

export const Route = createFileRoute("/paywall")({
  component: Paywall,
});

// ── Tokens (hardcoded — no CSS variables) ─────────────────────────────────────
const BG       = "#090705";
const CARD_BG  = "#0f0c06";
const GOLD     = "#C9A84C";
const WHITE    = "#f5f0e8";
const MUTED    = "#5a5040";
const GOLD_BTN_BG = "linear-gradient(135deg,#C9A84C,#E8C96A)";

// ── Upsell data ───────────────────────────────────────────────────────────────
const UPSELLS = [
  { id: "shield", Icon: Shield,   title: "Momentum Shield",  desc: "Protect your streak for 3 days",         price: "$2.99" },
  { id: "skin",   Icon: Sparkles, title: "Golden Tree Skin", desc: "Exclusive visual upgrade for your tree",  price: "$1.99" },
  { id: "elite",  Icon: Crown,    title: "Elite Status",     desc: "Black card + Hall of Legends access",     price: "$9.99/mo" },
];

// ── Paywall page ──────────────────────────────────────────────────────────────
function Paywall() {
  const [, update]          = useAppState();
  const navigate            = useNavigate();
  const [plan, setPlan]     = useState<"annual" | "monthly">("annual");
  const [seconds, setSeconds] = useState(14 * 60 + 51);
  const [selected, setSelected] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring]   = useState(false);
  const [stage, setStage]   = useState<"main" | "upsell">("main");

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const claim = async () => {
    setPurchasing(true);
    try {
      const ok = await purchaseMonthly();
      if (ok) {
        update({ isPremium: true, paywallSeen: true });
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
      const ok = await restorePurchases();
      if (ok) {
        update({ isPremium: true, paywallSeen: true });
        navigate({ to: "/" });
      } else {
        alert("No active subscription found.");
      }
    } finally {
      setRestoring(false);
    }
  };

  const dismiss = () => {
    update({ paywallSeen: true });
    navigate({ to: "/" });
  };

  const finishUpsell = () => {
    if (selected === "shield") update({ momentumShieldDays: 3 });
    navigate({ to: "/" });
  };

  // ── Upsell stage ──────────────────────────────────────────────────────────
  if (stage === "upsell") {
    return (
      <div style={{ minHeight: "100dvh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
        <motion.div
          className="mx-auto max-w-md px-5 pt-12 pb-12"
          variants={cV}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: 22 }}
        >
          {/* Headline */}
          <motion.div variants={iV} style={{ textAlign: "center" }}>
            <p style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 16, fontWeight: 700, fontStyle: "italic",
              color: GOLD, margin: "0 0 8px",
            }}>
              One More Thing
            </p>
            <h1 style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 28, fontWeight: 700, color: WHITE,
              margin: "0 0 6px", lineHeight: 1.15,
            }}>
              Protect what you've built.
            </h1>
            <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
              Optional. Add it now or find it later in settings.
            </p>
          </motion.div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {UPSELLS.map(({ id, Icon, title, desc, price }) => {
              const sel = selected === id;
              return (
                <motion.button
                  key={id}
                  variants={iV}
                  onClick={() => setSelected(sel ? null : id)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                >
                  <motion.div
                    animate={{
                      borderColor: sel ? GOLD : "#1e1a10",
                      boxShadow: sel ? "0 0 16px rgba(201,168,76,0.15)" : "none",
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: CARD_BG,
                      borderWidth: 1.5, borderStyle: "solid", borderRadius: 16,
                      padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: GOLD,
                    }}>
                      <Icon style={{ width: 18, height: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: WHITE, margin: "0 0 2px" }}>{title}</p>
                      <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{desc}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: GOLD, flexShrink: 0 }}>{price}</p>
                    <motion.div
                      animate={{
                        borderColor: sel ? GOLD : "#3a3020",
                        background: sel ? GOLD : "transparent",
                      }}
                      transition={{ duration: 0.18 }}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        borderWidth: 1.5, borderStyle: "solid", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {sel && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ width: 8, height: 8, borderRadius: "50%", background: BG }}
                        />
                      )}
                    </motion.div>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div variants={iV}>
            <motion.button
              onClick={finishUpsell}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                width: "100%", height: 54, borderRadius: 16, border: "none",
                background: selected ? GOLD_BTN_BG : "#1a1508",
                color: selected ? BG : MUTED,
                fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 700,
                cursor: "pointer",
                boxShadow: selected ? "0 0 28px rgba(201,168,76,0.35)" : "none",
                transition: "background 0.25s, color 0.25s, box-shadow 0.25s",
              }}
            >
              {selected
                ? `Add ${UPSELLS.find((u) => u.id === selected)?.title} — ${UPSELLS.find((u) => u.id === selected)?.price}`
                : "No thanks, continue"}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Main stage ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
      <div className="mx-auto max-w-md px-5 pt-10 pb-12">
        <PaywallContent
          timerSeconds={seconds}
          plan={plan}
          onPlanChange={setPlan}
          onClaim={claim}
          onDismiss={dismiss}
          purchasing={purchasing}
        />

        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          <button
            onClick={handleRestore}
            disabled={restoring}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: MUTED,
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {restoring && <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />}
            Restore purchases
          </button>
          <p style={{
            fontSize: 12, color: MUTED, opacity: 0.6,
            display: "flex", alignItems: "center", gap: 5, margin: 0,
          }}>
            <Lock style={{ width: 11, height: 11 }} />
            7-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

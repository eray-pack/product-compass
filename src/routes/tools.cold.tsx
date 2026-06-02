import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Snowflake, Zap, Brain, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/tools/cold")({
  component: Cold,
});

const BLUE  = "#60A5FA";
const CYAN  = "#22D3EE";
const GOLD  = "#C9A84C";
const WHITE = "#f0ece4";
const MUTED = "rgba(255,255,255,0.38)";
const BG    = "#04080f";

const STEP_TIMES = [null, "0:00", "0:10", "1:00", "1:30", "2:00"] as const;
const WHY_GLOWS  = ["#8B5CF6", CYAN, "#22C55E"] as const;
const WHY_ICONS  = [Brain, Zap, TrendingUp] as const;

const iV = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, type: "spring" as const, stiffness: 320, damping: 26 },
  }),
};

function Cold() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const WHY_CARDS = [
    { icon: WHY_ICONS[0], glow: WHY_GLOWS[0], title: t("coldPage.dopamineReset"),   desc: t("coldPage.dopamineResetDesc") },
    { icon: WHY_ICONS[1], glow: WHY_GLOWS[1], title: t("coldPage.urgeSuppressor"),  desc: t("coldPage.urgeSuppressorDesc") },
    { icon: WHY_ICONS[2], glow: WHY_GLOWS[2], title: t("coldPage.willpowerTraining"), desc: t("coldPage.willpowerTrainingDesc") },
  ];

  const STEPS = [
    { num: 1, text: t("coldPage.step1"), time: STEP_TIMES[0] },
    { num: 2, text: t("coldPage.step2"), time: STEP_TIMES[1] },
    { num: 3, text: t("coldPage.step3"), time: STEP_TIMES[2] },
    { num: 4, text: t("coldPage.step4"), time: STEP_TIMES[3] },
    { num: 5, text: t("coldPage.step5"), time: STEP_TIMES[4] },
    { num: 6, text: t("coldPage.step6"), time: STEP_TIMES[5] },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: BG,
      fontFamily: "DM Sans, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Atmospheric blue glow top */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "90%", height: 220, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 0%, ${BLUE}18 0%, transparent 70%)`,
      }} />
      {/* Cyan glow mid */}
      <div style={{
        position: "absolute", top: "30%", right: "-20%",
        width: 300, height: 300, pointerEvents: "none", borderRadius: "50%",
        background: `radial-gradient(circle, ${CYAN}08 0%, transparent 70%)`,
      }} />

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "52px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* Back button */}
        <button
          onClick={() => navigate({ to: "/tools" })}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20, padding: "7px 14px 7px 10px",
            color: MUTED, fontSize: 13, cursor: "pointer",
            marginBottom: 36,
          }}
        >
          <ArrowLeft size={14} /> {t("common.back")}
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `radial-gradient(circle, ${BLUE}22 0%, transparent 70%)`,
            border: `1px solid ${BLUE}40`,
            boxShadow: `0 0 40px ${BLUE}22`,
            display: "grid", placeItems: "center",
            margin: "0 auto 20px",
          }}>
            <Snowflake size={32} style={{ color: BLUE }} />
          </div>

          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: 32, fontWeight: 700, color: WHITE,
            margin: "0 0 10px", lineHeight: 1.15,
          }}>
            {t("coldPage.title")}
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            {t("coldPage.subtitle")}<br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>{t("coldPage.subtitleAccent")}</span>
          </p>
        </motion.div>

        {/* Why it works */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}
        >
          {t("coldPage.whyItWorks")}
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
          {WHY_CARDS.map(({ icon: Icon, glow, title, desc }, i) => (
            <motion.div
              key={title}
              custom={i}
              variants={iV}
              initial="hidden"
              animate="visible"
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px",
                background: `${glow}0a`,
                border: `1px solid ${glow}28`,
                borderRadius: 16,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: `${glow}14`,
                border: `1px solid ${glow}35`,
                boxShadow: `0 0 14px ${glow}18`,
                display: "grid", placeItems: "center",
              }}>
                <Icon size={16} style={{ color: glow }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: WHITE, margin: "0 0 3px" }}>{title}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Steps */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 12px" }}
        >
          {t("coldPage.theProtocol")}
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {STEPS.map(({ num, text, time }, i) => (
            <motion.div
              key={num}
              custom={i + 3}
              variants={iV}
              initial="hidden"
              animate="visible"
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 16px",
                background: `${CYAN}08`,
                border: `1px solid ${CYAN}20`,
                borderRadius: 16,
                position: "relative",
              }}
            >
              {/* Step number */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: `${BLUE}18`,
                border: `1px solid ${BLUE}40`,
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700, color: BLUE,
              }}>
                {num}
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.6, flex: 1 }}>
                {text}
              </p>

              {/* Timestamp badge */}
              {time && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: CYAN,
                  background: `${CYAN}14`,
                  border: `1px solid ${CYAN}30`,
                  borderRadius: 8, padding: "3px 8px",
                  flexShrink: 0, letterSpacing: "0.05em",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {time}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            marginTop: 24, padding: "14px 18px",
            background: `${GOLD}0a`,
            border: `1px solid ${GOLD}28`,
            borderRadius: 14,
          }}
        >
          <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.7, textAlign: "center" }}>
            <span style={{ color: GOLD, fontWeight: 600 }}>{t("coldPage.scienceLabel")}</span> {t("coldPage.scienceText")}
          </p>
        </motion.div>

      </div>
    </div>
  );
}

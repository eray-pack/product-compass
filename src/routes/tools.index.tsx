import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Brain, Snowflake, GitBranch, Plus, Lock } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/tools/")({
  component: Tools,
});

// ── Design tokens ─────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderTop: "1px solid rgba(201,168,76,0.14)",
  borderRadius: 24,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

// Capsule CTA buttons — etched glass pill style
const GOLD_OUTLINE: React.CSSProperties = {
  color: "#debc7a",
  border: "1px solid rgba(201,168,76,0.38)",
  background: "rgba(201,168,76,0.08)",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  padding: "6px 16px",
  flexShrink: 0,
  letterSpacing: "0.03em",
  textShadow: "0 0 8px rgba(201,168,76,0.30)",
  cursor: "pointer",
};

const ICON_WRAP = (color: string): React.CSSProperties => ({
  height: 40,
  width: 40,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: `${color}14`,
  border: `1px solid ${color}42`,
  boxShadow: `0 0 16px 3px ${color}26`,
  color,
  flexShrink: 0,
  position: "relative",
});

const REFRAME_COUNT = 5;

// ── Game badge animation ──────────────────────────────────────────────────────
type AmbientType = "pulse" | "rotate" | "breathe" | "float" | "none";

const gameContainer: Variants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const gameItem: Variants = {
  hidden:   { opacity: 0, scale: 0.82 },
  visible:  { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ── CoachRobot SVG ────────────────────────────────────────────────────────────
function CoachRobot() {
  return (
    <svg width="52" height="66" viewBox="0 0 52 66" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible" className="robot-body">
      <line x1="26" y1="9" x2="26" y2="2" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="2" r="2.5" fill="#C9A84C" />
      <rect x="8" y="9" width="36" height="22" rx="6" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <circle cx="19" cy="20" r="3.5" fill="#C9A84C" opacity="0.85" />
      <circle cx="33" cy="20" r="3.5" fill="#C9A84C" opacity="0.85" />
      <circle cx="20.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <circle cx="34.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <path d="M 20 26 Q 26 30.5 32 26" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <rect x="21" y="31" width="10" height="5" rx="2.5" fill="#261F15" />
      <rect x="5" y="36" width="42" height="26" rx="6" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <rect x="14" y="42" width="24" height="12" rx="3" fill="#261F15" stroke="#C9A84C" strokeWidth="0.6" opacity="0.75" />
      <circle cx="23" cy="48" r="2.5" fill="#C9A84C" opacity="0.35" />
      <circle cx="30" cy="48" r="2.5" fill="#C9A84C" opacity="0.9" />
      <rect x="0" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <rect x="43" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" className="robot-wave-arm" />
    </svg>
  );
}

// ── Cut-the-Signal game circles ───────────────────────────────────────────────
function SignalGame({
  to, glow, label, icon, ambient = "none",
}: {
  to: string; glow: string; label: string; icon: React.ReactNode; ambient?: AmbientType;
}) {
  return (
    // Outer stagger item — entry animation driven by parent container
    <motion.div variants={gameItem} className="flex flex-col items-center">
      <Link to={to} className="flex flex-col items-center gap-3" style={{ textDecoration: "none" }}>

        {/* ── Badge circle — hover + tap ── */}
        <motion.div
          whileHover={{
            scale: 1.06,
            filter: "brightness(1.25)",
            boxShadow: `0 0 30px 10px ${glow}55, 0 0 12px 3px ${glow}44`,
            transition: { duration: 0.18, ease: "easeOut" },
          }}
          whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
          style={{
            position: "relative",
            height: 68, width: 68,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${glow}44`,
            boxShadow: `0 0 20px 4px ${glow}35, 0 0 6px 1px ${glow}22`,
          }}
        >
          {/* ── Pulsing neon ring — Mind Pulse & Echo Chamber ── */}
          {ambient === "pulse" && (
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: `1.5px solid ${glow}`,
                pointerEvents: "none",
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
          )}

          {/* ── Rotating dashed ring — Impulse Shift & Steady Hand ── */}
          {ambient === "rotate" && (
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                border: `1.5px dashed ${glow}80`,
                pointerEvents: "none",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
          )}

          {/* ── Icon — static, breathing, or floating ── */}
          {ambient === "breathe" ? (
            <motion.div
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {icon}
            </motion.div>
          ) : ambient === "float" ? (
            <motion.div
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {icon}
            </motion.div>
          ) : (
            icon
          )}
        </motion.div>

        <span style={{
          fontSize: 11, fontWeight: 600,
          color: "rgba(255,255,255,0.65)",
          textAlign: "center", lineHeight: 1.3, maxWidth: 72,
        }}>
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

// ── Mini icons for signal games ───────────────────────────────────────────────
function MindPulseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#6BAED6" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="6" fill="#6BAED6" fillOpacity="0.15" stroke="#6BAED6" strokeWidth="1.3"/>
      <path d="M5 15 L9 15 L11 10 L13 20 L15 13 L17 17 L19 15 L25 15" stroke="#6BAED6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ImpulseShiftIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="7"  stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.65"/>
      <circle cx="15" cy="15" r="2.2" fill="#C9A84C"/>
      <line x1="15" y1="2"  x2="15" y2="6"  stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="24" x2="15" y2="28" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="15" x2="6"  y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="15" x2="28" y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function NeuralLinkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="8" y1="8" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="8" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8" y1="8" x2="22" y2="8"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8" y1="22" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8" y1="8" x2="8" y2="22"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="22" y1="8" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <circle cx="8"  cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="8"  cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="15" cy="15" r="3.5" fill="#6BAA75" fillOpacity="0.3" stroke="#6BAA75" strokeWidth="1.4"/>
    </svg>
  );
}
function ColdSwitchIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M4 11 H19 M16 8 L19 11 L16 14" stroke="#00BCD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 19 H11 M14 16 L11 19 L14 22" stroke="#00BCD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="19" y1="11" x2="11" y2="19" stroke="#00BCD4" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 2"/>
    </svg>
  );
}
function VoidStareIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M2 15 Q15 4 28 15 Q15 26 2 15Z" stroke="#7B2FBE" strokeWidth="1.5" fill="#7B2FBE" fillOpacity="0.10"/>
      <circle cx="15" cy="15" r="5" fill="#7B2FBE" fillOpacity="0.28" stroke="#7B2FBE" strokeWidth="1.3"/>
      <circle cx="15" cy="15" r="2.5" fill="#7B2FBE"/>
      <circle cx="17" cy="13" r="1.2" fill="#FFF" opacity="0.45"/>
    </svg>
  );
}
function ClarityClimbIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M3 26 L15 5 L27 26 Z" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" fill="#10B981" fillOpacity="0.08"/>
      <path d="M11 19 L15 14 L19 19" stroke="#10B981" strokeWidth="1.4" strokeLinejoin="round" fill="none" opacity="0.65"/>
      <path d="M15 14 L15 8" stroke="#10B981" strokeWidth="1.3" strokeDasharray="2 2" strokeLinecap="round" opacity="0.7"/>
      <circle cx="15" cy="5" r="2.8" fill="#FFD700" opacity="0.85"/>
    </svg>
  );
}
function EchoChamberIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="3" fill="#F97316"/>
      <path d="M7 7 Q1 15 7 23"  stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M23 7 Q29 15 23 23" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M10 11 Q6 15 10 19"  stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M20 11 Q24 15 20 19" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  );
}
function DarkRoomIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="4" y="12" width="12" height="7" rx="2" fill="#4F46E5" fillOpacity="0.22" stroke="#4F46E5" strokeWidth="1.5"/>
      <path d="M16 13 L27 8 L27 22 L16 18 Z" fill="#4F46E5" fillOpacity="0.14" stroke="#4F46E5" strokeWidth="1" strokeOpacity="0.5"/>
      <rect x="14" y="12" width="3" height="7" rx="0.5" fill="#4F46E5" fillOpacity="0.55"/>
      <circle cx="8" cy="15.5" r="1.5" fill="#4F46E5" opacity="0.8"/>
    </svg>
  );
}
function NoiseFilterIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M2 15 L5 11 L7 19 L9 9 L11 21 L13 15" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.38"/>
      <line x1="14.5" y1="7" x2="14.5" y2="23" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
      <path d="M17 15 L19 11 L21 19 L23 11 L25 19 L28 15" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function SteadyHandIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="3" y1="15" x2="27" y2="15" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" opacity="0.28"/>
      <line x1="3" y1="11" x2="27" y2="11" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
      <line x1="3" y1="19" x2="27" y2="19" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
      <circle cx="15" cy="15" r="5" fill="#D97706" fillOpacity="0.18" stroke="#D97706" strokeWidth="1.5"/>
      <circle cx="15" cy="15" r="2.2" fill="#D97706"/>
    </svg>
  );
}
function IdentityStackIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="8" y="14" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.08" stroke="#E11D48" strokeWidth="1" opacity="0.45" transform="rotate(5 16 19)"/>
      <rect x="7" y="12" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.12" stroke="#E11D48" strokeWidth="1.1" opacity="0.65"/>
      <rect x="6" y="10" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.18" stroke="#E11D48" strokeWidth="1.5"/>
      <line x1="9" y1="14.5" x2="19" y2="14.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="9" y1="17.5" x2="15" y2="17.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

type GameEntry = { to: string; glow: string; labelKey: string; icon: React.ReactNode; ambient: AmbientType };

const FREE_GAMES: GameEntry[] = [
  { to: "/tools/breath", glow: "#6BAED6", labelKey: "tools.mindPulse",    icon: <MindPulseIcon />,    ambient: "pulse"  },
  { to: "/tools/tap",    glow: "#C9A84C", labelKey: "tools.impulseShift", icon: <ImpulseShiftIcon />, ambient: "rotate" },
  { to: "/tools/memory", glow: "#6BAA75", labelKey: "tools.neuralLink",   icon: <NeuralLinkIcon />,   ambient: "none"   },
];

const PRO_GAMES: GameEntry[] = [
  { to: "/tools/coldswitch",    glow: "#00BCD4", labelKey: "tools.coldswitch.name",    icon: <ColdSwitchIcon />,    ambient: "none"    },
  { to: "/tools/voidstare",     glow: "#7B2FBE", labelKey: "tools.voidstare.name",     icon: <VoidStareIcon />,     ambient: "breathe" },
  { to: "/tools/clarityclimb",  glow: "#10B981", labelKey: "tools.clarityclimb.name",  icon: <ClarityClimbIcon />,  ambient: "float"   },
  { to: "/tools/echochamber",   glow: "#F97316", labelKey: "tools.echochamber.name",   icon: <EchoChamberIcon />,   ambient: "pulse"   },
  { to: "/tools/darkroom",      glow: "#4F46E5", labelKey: "tools.darkroom.name",      icon: <DarkRoomIcon />,      ambient: "none"    },
  { to: "/tools/noisefilter",   glow: "#2563EB", labelKey: "tools.noisefilter.name",   icon: <NoiseFilterIcon />,   ambient: "none"    },
  { to: "/tools/steadyhand",    glow: "#D97706", labelKey: "tools.steadyhand.name",    icon: <SteadyHandIcon />,    ambient: "rotate"  },
  { to: "/tools/identitystack", glow: "#E11D48", labelKey: "tools.identitystack.name", icon: <IdentityStackIcon />, ambient: "none"    },
];

// ── Main component ────────────────────────────────────────────────────────────
function Tools() {
  const { t } = useTranslation();
  const [state] = useAppState();
  const [reframeIdx, setReframeIdx] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [plans, setPlans] = useState([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <SectionTitle>{t("nav.tools")}</SectionTitle>
        <h1 className="mt-2 text-3xl font-bold">{t("tools.indexSubtitle")}</h1>
      </header>

      {/* ── SOS hero — tactical distress button ─────────────────────────── */}
      <section className="flex justify-center mt-10 mb-2">
        <Link to="/tools/sos" style={{ display: "block", position: "relative" }}>
          {/* Ambient distress ripples */}
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.4], opacity: [0.35, 0] }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 0 }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid rgba(200,60,40,0.70)",
              pointerEvents: "none",
            }}
          />
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.4], opacity: [0.22, 0] }}
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 0, delay: 0.7 }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid rgba(200,60,40,0.50)",
              pointerEvents: "none",
            }}
          />

          {/* Hover glow layer */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute", inset: -18, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,60,40,0.28) 0%, transparent 70%)",
              filter: "blur(12px)",
              pointerEvents: "none",
            }}
          />

          {/* Main button */}
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 500, damping: 18 } }}
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "radial-gradient(circle at 40% 35%, #2a1010, #160808)",
              border: "1.5px solid rgba(200,80,60,0.45)",
              boxShadow: "0 0 40px 10px rgba(200,60,40,0.30), inset 0 0 30px 4px rgba(220,80,60,0.08)",
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.35,
              padding: "0 32px",
              textShadow: "0 0 18px rgba(255,120,100,0.70), 0 1px 3px rgba(0,0,0,0.60)",
              letterSpacing: "0.01em",
            }}>
              {t("tools.sos.heroLine1")}<br />{t("tools.sos.heroLine2")}
            </p>
            <p style={{
              marginTop: 10,
              fontSize: 11.5,
              fontWeight: 700,
              color: "rgba(255,180,160,0.90)",
              lineHeight: 1.5,
              padding: "0 24px",
              letterSpacing: "0.03em",
              textShadow: "0 0 10px rgba(255,100,80,0.50)",
            }}>
              {t("tools.sos.heroSub")}
            </p>
          </motion.div>
        </Link>
      </section>

      {/* ── Tool cards grid ─────────────────────────────────────────────── */}
      <section className="px-4 mt-10 pb-8" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Cyber-Arcade Console ────────────────────────────────────── */}
        <div style={{ ...CARD, padding: "22px 18px 20px", overflow: "hidden" }}>
          <style>{`
            .arcade-scroll::-webkit-scrollbar { display: none; }
            .arcade-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            {/* Animated controller badge */}
            <div style={{
              position: "relative", width: 46, height: 46, display: "grid", placeItems: "center",
              borderRadius: 16, flexShrink: 0,
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.35)",
              boxShadow: "0 0 20px 4px rgba(139,92,246,0.22)",
            }}>
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ color: "#a78bfa" }}>
                  <path d="M2 7 Q2 5 4 5 L5.5 5 Q6 4 8 4 Q10 4 10.5 5 L12 5 Q14 5 14 7 L13.5 11 Q13 13 11.5 13 L10.5 13 Q9.5 12 8 12 Q6.5 12 5.5 13 L4.5 13 Q3 13 2.5 11 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                  <line x1="4.5" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <line x1="5.5" y1="7" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="10.5" cy="7.5" r="0.75" fill="currentColor" opacity="0.95"/>
                  <circle cx="11.8" cy="8.5" r="0.75" fill="currentColor" opacity="0.95"/>
                  <circle cx="10.5" cy="9.5" r="0.75" fill="currentColor" opacity="0.95"/>
                  <circle cx="9.2"  cy="8.5" r="0.75" fill="currentColor" opacity="0.95"/>
                </svg>
              </motion.div>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#ffffff", lineHeight: 1.2 }}>{t("tools.gamesTitle")}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 3 }}>{t("tools.gamesDesc")}</p>
            </div>
          </div>

          {/* Free game cartridges — horizontal scroll */}
          <div
            className="arcade-scroll"
            style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 2 }}
          >
            {FREE_GAMES.map(({ to, glow, labelKey, icon, ambient }) => (
              <Link key={to} to={to} style={{ textDecoration: "none", flexShrink: 0 }}>
                <motion.div
                  whileHover={{
                    scale: 1.04,
                    borderColor: `${glow}70`,
                    boxShadow: `0 0 28px 8px ${glow}35, 0 0 60px 18px ${glow}14`,
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    width: 112,
                    borderRadius: 24,
                    padding: "20px 12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${glow}28`,
                    borderTop: `1px solid ${glow}45`,
                  }}
                >
                  {/* Glowing icon */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{
                      position: "absolute", inset: -10, borderRadius: "50%",
                      background: `radial-gradient(circle, ${glow}38 0%, transparent 72%)`,
                      filter: "blur(8px)", pointerEvents: "none",
                    }} />
                    <motion.div
                      animate={
                        ambient === "pulse"  ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } :
                        ambient === "rotate" ? { rotate: 360 } :
                        ambient === "float"  ? { y: [0, -3, 0] } :
                        {}
                      }
                      transition={
                        ambient === "rotate"
                          ? { repeat: Infinity, duration: 8, ease: "linear" }
                          : { repeat: Infinity, duration: 3, ease: "easeInOut" }
                      }
                      style={{ position: "relative" }}
                    >
                      {icon}
                    </motion.div>
                  </div>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.82)",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}>
                    {t(labelKey)}
                  </p>
                </motion.div>
              </Link>
            ))}

            {/* PRO cartridges or paywall nudge */}
            {state.isPremium === true ? (
              PRO_GAMES.map(({ to, glow, labelKey, icon, ambient }) => (
                <Link key={to} to={to} style={{ textDecoration: "none", flexShrink: 0 }}>
                  <motion.div
                    whileHover={{
                      scale: 1.04,
                      borderColor: `${glow}70`,
                      boxShadow: `0 0 28px 8px ${glow}35, 0 0 60px 18px ${glow}14`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      width: 112,
                      borderRadius: 24,
                      padding: "20px 12px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: `1px solid ${glow}28`,
                      borderTop: `1px solid ${glow}45`,
                    }}
                  >
                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{
                        position: "absolute", inset: -10, borderRadius: "50%",
                        background: `radial-gradient(circle, ${glow}38 0%, transparent 72%)`,
                        filter: "blur(8px)", pointerEvents: "none",
                      }} />
                      <motion.div
                        animate={
                          ambient === "pulse"   ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } :
                          ambient === "rotate"  ? { rotate: 360 } :
                          ambient === "breathe" ? { scale: [1, 1.06, 1] } :
                          ambient === "float"   ? { y: [0, -3, 0] } :
                          {}
                        }
                        transition={
                          ambient === "rotate"
                            ? { repeat: Infinity, duration: 8, ease: "linear" }
                            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
                        }
                        style={{ position: "relative" }}
                      >
                        {icon}
                      </motion.div>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.82)", textAlign: "center", lineHeight: 1.3 }}>
                      {t(labelKey)}
                    </p>
                  </motion.div>
                </Link>
              ))
            ) : (
              /* Paywall teaser card */
              <motion.button
                onClick={() => triggerPaywall()}
                whileHover={{ scale: 1.04, borderColor: "rgba(201,168,76,0.55)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.18 }}
                style={{
                  flexShrink: 0, width: 112, borderRadius: 24,
                  padding: "20px 12px 16px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  background: "rgba(201,168,76,0.05)",
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(201,168,76,0.22)",
                  borderTop: "1px solid rgba(201,168,76,0.38)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 84 }}>
                  {PRO_GAMES.slice(0, 6).map(({ labelKey, glow }) => (
                    <span key={labelKey} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 7, fontWeight: 700, width: 18, height: 18, background: `${glow}20`, border: `1px solid ${glow}55`, color: glow }}>
                      {t(labelKey)[0]}
                    </span>
                  ))}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.38)", background: "rgba(201,168,76,0.08)", borderRadius: 999, padding: "2px 8px" }}>
                  <Lock style={{ height: 9, width: 9 }} /> +{PRO_GAMES.length} PRO
                </span>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.4, textAlign: "center" }}>
                  {t("tools.moreGames")}
                </p>
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Recovery Coach ──────────────────────────────────────────── */}
        <motion.div
          whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.20)" }}
          transition={{ duration: 0.2 }}
          style={{ ...CARD, borderColor: "rgba(201,168,76,0.30)", borderTopColor: "rgba(201,168,76,0.40)" }}
        >
          <Link
            to="/tools/coach"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 22px", gap: 6, textDecoration: "none" }}
          >
            {/* Ambient glow behind robot */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                position: "absolute", inset: -18, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.20) 0%, transparent 70%)",
                filter: "blur(12px)",
                pointerEvents: "none",
              }} />
              <CoachRobot />
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#ffffff", marginTop: 10 }}>{t("tools.coach.name")}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{t("tools.coach.tagline")}</p>
            <span style={{ ...GOLD_OUTLINE, marginTop: 6 }}>{t("tools.coach.cta") || "Start →"}</span>
          </Link>
        </motion.div>

        {/* ── Reframe + Cold Exposure — two-column ────────────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Reframe */}
          <motion.div
            style={{ ...CARD, display: "flex", flexDirection: "column", gap: 14, padding: 18 }}
            whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.18)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div style={ICON_WRAP("#C9A84C")}>
                <Brain style={{ height: 16, width: 16 }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>{t("tools.reframeTitle")}</p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{t("tools.reframeDesc")}</p>
            <motion.button
              onClick={() => setReframeIdx(Math.floor(Math.random() * REFRAME_COUNT))}
              style={GOLD_OUTLINE}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
            >
              {t("tools.reframeCta")}
            </motion.button>
            {reframeIdx !== null && (
              <p style={{ fontSize: 11.5, lineHeight: 1.6, fontStyle: "italic", color: "rgba(245,237,224,0.78)", marginTop: -4 }}>
                "{t(`tools.reframes.${reframeIdx}`)}"
              </p>
            )}
          </motion.div>

          {/* Cold Exposure */}
          <motion.div
            style={{ ...CARD, display: "flex", flexDirection: "column", gap: 14, padding: 18 }}
            whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.18)" }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/tools/cold" style={{ display: "flex", flexDirection: "column", gap: 14, textDecoration: "none" }}>
              <div className="flex items-center gap-2">
                <div style={ICON_WRAP("#5BB8D4")}>
                  <Snowflake style={{ height: 16, width: 16 }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>{t("tools.coldTitle")}</p>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{t("tools.coldDesc")}</p>
              <span style={{ ...GOLD_OUTLINE, display: "inline-block", textAlign: "center" }}>
                {t("tools.coldCta")}
              </span>
            </Link>
          </motion.div>
        </div>

        {/* ── Implementation Plan ─────────────────────────────────────── */}
        <motion.div
          style={{ ...CARD, padding: 20 }}
          whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.16)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div style={ICON_WRAP("#C9A84C")}>
                <GitBranch style={{ height: 16, width: 16 }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>{t("tools.planTitle")}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{t("tools.planDesc")}</p>
              </div>
            </div>
            <motion.button
              onClick={() => setPlanOpen((v) => !v)}
              style={GOLD_OUTLINE}
              whileTap={{ scale: 0.93, transition: { duration: 0.1 } }}
            >
              {planOpen ? t("tools.planClose") : t("tools.planAdd")}
            </motion.button>
          </div>

          {/* Existing plans — nested etched layer */}
          {plans.length > 0 && (
            <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {plans.map((p, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    padding: "12px 16px",
                    borderRadius: 16,
                    background: "rgba(0,0,0,0.22)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: "rgba(245,237,224,0.72)",
                  }}
                >
                  <span>{t("tools.planIfI")} </span>
                  <span style={{ fontWeight: 700, color: "#f5ede0" }}>{p.trigger}</span>
                  <span>, {t("tools.planIWill")} </span>
                  <span style={{ fontWeight: 700, color: "#debc7a" }}>{p.action}</span>
                  <span>.</span>
                </li>
              ))}
            </ul>
          )}

          {/* Add-plan form */}
          {planOpen && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder={t("tools.planTriggerPlaceholder")}
                style={{
                  width: "100%", borderRadius: 12, fontSize: 13, padding: "10px 16px", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "#f5ede0",
                }}
              />
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder={t("tools.planActionPlaceholder")}
                style={{
                  width: "100%", borderRadius: 12, fontSize: 13, padding: "10px 16px", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  color: "#f5ede0",
                }}
              />
              <motion.button
                onClick={() => {
                  if (trigger.trim() && action.trim()) {
                    setPlans([...plans, { trigger, action }]);
                    setTrigger(""); setAction(""); setPlanOpen(false);
                  }
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%", borderRadius: 12, padding: "11px 16px", fontSize: 13,
                  fontWeight: 700, color: "#090705",
                  background: "linear-gradient(135deg, #C9A84C, #E8C96A)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  cursor: "pointer",
                }}
              >
                <Plus style={{ height: 15, width: 15 }} /> {t("tools.planSave")}
              </motion.button>
            </div>
          )}
        </motion.div>

      </section>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Brain, Snowflake, GitBranch, Plus, Lock, ChevronDown, Trophy } from "lucide-react";
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
      <circle cx="15" cy="15" r="12" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.55"/>
      <circle cx="15" cy="15" r="6" fill="#38bdf8" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="1.3"/>
      <path d="M5 15 L9 15 L11 10 L13 20 L15 13 L17 17 L19 15 L25 15" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ImpulseShiftIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#debc7a" strokeWidth="1.2" strokeOpacity="0.55"/>
      <circle cx="15" cy="15" r="7"  stroke="#debc7a" strokeWidth="1.2" strokeOpacity="0.70"/>
      <circle cx="15" cy="15" r="2.2" fill="#debc7a"/>
      <line x1="15" y1="2"  x2="15" y2="6"  stroke="#debc7a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="24" x2="15" y2="28" stroke="#debc7a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="15" x2="6"  y2="15" stroke="#debc7a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="15" x2="28" y2="15" stroke="#debc7a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function NeuralLinkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="8" y1="8" x2="15" y2="15" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.75"/>
      <line x1="22" y1="8" x2="15" y2="15" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.75"/>
      <line x1="8" y1="22" x2="15" y2="15" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.75"/>
      <line x1="22" y1="22" x2="15" y2="15" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.75"/>
      <line x1="8" y1="8" x2="22" y2="8"  stroke="#4ade80" strokeWidth="1.0" strokeOpacity="0.42"/>
      <line x1="8" y1="22" x2="22" y2="22" stroke="#4ade80" strokeWidth="1.0" strokeOpacity="0.42"/>
      <line x1="8" y1="8" x2="8" y2="22"  stroke="#4ade80" strokeWidth="1.0" strokeOpacity="0.42"/>
      <line x1="22" y1="8" x2="22" y2="22" stroke="#4ade80" strokeWidth="1.0" strokeOpacity="0.42"/>
      <circle cx="8"  cy="8"  r="2.8" fill="#4ade80" fillOpacity="0.22" stroke="#4ade80" strokeWidth="1.3"/>
      <circle cx="22" cy="8"  r="2.8" fill="#4ade80" fillOpacity="0.22" stroke="#4ade80" strokeWidth="1.3"/>
      <circle cx="8"  cy="22" r="2.8" fill="#4ade80" fillOpacity="0.22" stroke="#4ade80" strokeWidth="1.3"/>
      <circle cx="22" cy="22" r="2.8" fill="#4ade80" fillOpacity="0.22" stroke="#4ade80" strokeWidth="1.3"/>
      <circle cx="15" cy="15" r="3.5" fill="#4ade80" fillOpacity="0.32" stroke="#4ade80" strokeWidth="1.5"/>
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

function NebulaFlowIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      {/* 4-pointed star — centre */}
      <path d="M15 6 L16.1 13.9 L24 15 L16.1 16.1 L15 24 L13.9 16.1 L6 15 L13.9 13.9 Z"
        fill="#d946ef" opacity="0.95"/>
      {/* 4-pointed star — top-right, smaller */}
      <path d="M22 5 L22.7 8.3 L26 9 L22.7 9.7 L22 13 L21.3 9.7 L18 9 L21.3 8.3 Z"
        fill="#a855f7" opacity="0.85"/>
      {/* 4-pointed star — bottom-left, smaller */}
      <path d="M8 18 L8.7 21.3 L12 22 L8.7 22.7 L8 26 L7.3 22.7 L4 22 L7.3 21.3 Z"
        fill="#c026d3" opacity="0.75"/>
      {/* tiny sparkle — top-left */}
      <path d="M9 7 L9.5 9.5 L12 10 L9.5 10.5 L9 13 L8.5 10.5 L6 10 L8.5 9.5 Z"
        fill="#e879f9" opacity="0.60"/>
    </svg>
  );
}

type GameEntry = {
  to: string; glow: string; labelKey: string; icon: React.ReactNode; ambient: AmbientType;
  idleFilter?: string; hoverFilter?: string; hoverRotate?: number;
};

const FREE_GAMES: GameEntry[] = [
  {
    to: "/tools/breath", glow: "#38bdf8", labelKey: "tools.mindPulse",
    icon: <MindPulseIcon />, ambient: "pulse",
    idleFilter:  "drop-shadow(0 0 7px rgba(56,189,248,0.60))",
    hoverFilter: "drop-shadow(0 0 16px rgba(56,189,248,1.0)) drop-shadow(0 0 32px rgba(56,189,248,0.45))",
    hoverRotate: 8,
  },
  {
    to: "/tools/tap", glow: "#debc7a", labelKey: "tools.impulseShift",
    icon: <ImpulseShiftIcon />, ambient: "rotate",
    idleFilter:  "drop-shadow(0 0 7px rgba(222,188,122,0.60))",
    hoverFilter: "drop-shadow(0 0 16px rgba(222,188,122,1.0)) drop-shadow(0 0 32px rgba(222,188,122,0.45))",
    hoverRotate: 0,
  },
  {
    to: "/tools/memory", glow: "#4ade80", labelKey: "tools.neuralLink",
    icon: <NeuralLinkIcon />, ambient: "breathe",
    idleFilter:  "drop-shadow(0 0 7px rgba(74,222,128,0.58))",
    hoverFilter: "drop-shadow(0 0 16px rgba(74,222,128,1.0)) drop-shadow(0 0 32px rgba(74,222,128,0.45))",
    hoverRotate: 5,
  },
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
  { to: "/tools/nebulaflow",    glow: "#A855F7", labelKey: "tools.nebulaflow.name",    icon: <NebulaFlowIcon />,    ambient: "pulse"   },
];

// ── Arcade panel static texture ───────────────────────────────────────────────
function ArcadeTextureSVG() {
  // Centre of the concentric pattern — slightly above mid-height so rings
  // feel like they're converging behind the free-games row.
  const cx = 190, cy = 150;

  // Pre-compute 36 spoke endpoints (every 10°) from the centre point.
  const spokes = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180;
    return { x2: cx + 640 * Math.cos(a), y2: cy + 640 * Math.sin(a) };
  });

  // 16 concentric ring radii — tight near the centre, wider apart at the edge.
  const rings = [20, 40, 62, 86, 112, 140, 170, 202, 236, 272, 312, 356, 404, 456, 512, 572];

  // 12 tick marks on ring #4 (r=112) — like watch-dial hour marks.
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return {
      x1: cx + 104 * Math.cos(a), y1: cy + 104 * Math.sin(a),
      x2: cx + 120 * Math.cos(a), y2: cy + 120 * Math.sin(a),
    };
  });

  return (
    <svg
      aria-hidden
      style={{ display: "block", width: "100%", height: "100%" }}
      viewBox="0 0 380 360"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Micro-engraving grid — 16 × 16 px square lattice */}
        <pattern id="atx-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.032)" strokeWidth="0.4"/>
        </pattern>
        {/* Centre ambient glow — lifts the convergence point */}
        <radialGradient id="atx-glow" cx="50%" cy="42%" r="40%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.052)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        {/* Corner vignette — darkens edges so they frame the texture */}
        <radialGradient id="atx-vignette" cx="50%" cy="50%" r="74%">
          <stop offset="55%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.60)" />
        </radialGradient>
      </defs>

      {/* ── Base fill — slate-blue frosted ── */}
      <rect width="380" height="360" fill="#1e2030" fillOpacity="0.0" />

      {/* ── Fine crosshatch micro-engraving ── */}
      <rect width="380" height="360" fill="url(#atx-grid)" />

      {/* ── Radiating spokes ── */}
      {spokes.map((s, i) => (
        <line key={i} x1={cx} y1={cy} x2={s.x2} y2={s.y2}
          stroke="rgba(255,255,255,0.038)" strokeWidth="0.5" />
      ))}

      {/* ── Concentric rings — inner ones slightly brighter ── */}
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={r <= 62 ? "rgba(255,255,255,0.10)" : r <= 140 ? "rgba(255,255,255,0.062)" : "rgba(255,255,255,0.038)"}
          strokeWidth={r <= 40 ? "0.9" : "0.55"}
        />
      ))}

      {/* ── Watch-dial tick marks on ring 4 ── */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="rgba(255,255,255,0.12)" strokeWidth="0.85" strokeLinecap="round" />
      ))}

      {/* ── Gold corner bracket arcs ── */}
      <path d="M 20 56 A 44 44 0 0 1 56 20" stroke="rgba(201,168,76,0.11)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      <path d="M 324 20 A 44 44 0 0 1 360 56" stroke="rgba(201,168,76,0.11)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      <path d="M 20 304 A 44 44 0 0 0 56 340" stroke="rgba(201,168,76,0.11)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
      <path d="M 360 304 A 44 44 0 0 1 324 340" stroke="rgba(201,168,76,0.11)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

      {/* ── Secondary bracket tick-marks near each corner ── */}
      <line x1="20"  y1="76"  x2="30"  y2="76"  stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="76"  y1="20"  x2="76"  y2="30"  stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="304" y1="20"  x2="304" y2="30"  stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="350" y1="76"  x2="360" y2="76"  stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="20"  y1="284" x2="30"  y2="284" stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="76"  y1="330" x2="76"  y2="340" stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="304" y1="330" x2="304" y2="340" stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>
      <line x1="350" y1="284" x2="360" y2="284" stroke="rgba(201,168,76,0.07)" strokeWidth="0.7" strokeLinecap="round"/>

      {/* ── Centre convergence glow ── */}
      <rect width="380" height="360" fill="url(#atx-glow)" />

      {/* ── Edge vignette — frames & grounds the texture ── */}
      <rect width="380" height="360" fill="url(#atx-vignette)" />
    </svg>
  );
}

// ── Arcade badge helpers ──────────────────────────────────────────────────────

function getGlowFilter(glow: string): string {
  const blues   = ["#38bdf8", "#6BAED6", "#2563EB", "#7B2FBE", "#4F46E5", "#00BCD4"];
  const greens  = ["#4ade80", "#6BAA75", "#10B981"];
  if (blues.includes(glow))  return "drop-shadow(0 0 9px rgba(56,189,248,0.70))";
  if (greens.includes(glow)) return "drop-shadow(0 0 9px rgba(74,222,128,0.70))";
  return "drop-shadow(0 0 9px rgba(222,188,122,0.70))";
}

function ArcadeBadge({
  to, glow, label, icon, ambient, locked, onLockedTap,
}: {
  to: string; glow: string; label: string; icon: React.ReactNode;
  ambient: AmbientType; locked?: boolean; onLockedTap?: () => void;
}) {
  const glowFilter = getGlowFilter(glow);

  const circle = (
    <div style={{ position: "relative" }}>
      {/* Outer ambient halo — colour bleeds softly behind the button */}
      {!locked && (
        <motion.div
          aria-hidden
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.92, 1.08, 0.92] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: -10, borderRadius: "50%",
            background: `radial-gradient(circle, ${glow}40 0%, transparent 70%)`,
            filter: "blur(9px)", pointerEvents: "none",
          }}
        />
      )}

      {/* Badge circle — solid black, metallic bevel, clipped */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          position: "relative", width: 64, height: 64, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          // Solid black base
          background: locked ? "#0c0c0e" : "#000000",
          // Metallic chamfered rim: top-left highlight + bottom-right shadow + coloured outer ring
          border: `1.5px solid ${locked ? "rgba(255,255,255,0.10)" : glow + "70"}`,
          boxShadow: locked ? "none" : [
            `inset 0 1.5px 0 rgba(255,255,255,0.16)`,
            `inset 0 -1.5px 0 rgba(0,0,0,0.95)`,
            `inset 1.5px 0 0 rgba(255,255,255,0.08)`,
            `inset -1.5px 0 0 rgba(0,0,0,0.60)`,
            `0 0 0 1px rgba(255,255,255,0.07)`,
            `0 5px 18px rgba(0,0,0,0.90)`,
            `0 0 22px 5px ${glow}30`,
          ].join(", "),
          filter: locked ? "none" : glowFilter,
          opacity: locked ? 0.40 : 1,
        }}
      >
        {/* ── Inner power nebula glow — behind the icon ── */}
        {!locked && (
          <motion.div
            aria-hidden
            animate={{ opacity: [0.22, 0.52, 0.22], scale: [0.70, 1.05, 0.70] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: `radial-gradient(circle at 50% 58%, ${glow}80 0%, ${glow}38 36%, transparent 68%)`,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* ── Glint — diagonal sheen sweeping across the black surface ── */}
        {!locked && (
          <motion.div
            aria-hidden
            animate={{ x: ["-72px", "72px"] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 2.8 }}
            style={{
              position: "absolute",
              top: "-8px", left: "-8px",
              width: "28px", height: "88px",
              background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
              filter: "blur(3px)",
              transform: "rotate(22deg)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}

        {/* ── Icon — sits above glow and glint ── */}
        {!locked ? (
          <motion.div
            style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            animate={
              ambient === "rotate"  ? { rotate: 360 } :
              ambient === "breathe" ? { scale: [1, 1.08, 1] } :
              ambient === "float"   ? { y: [0, -2, 0] } :
              ambient === "pulse"   ? { opacity: [0.80, 1, 0.80] } :
              {}
            }
            transition={
              ambient === "rotate"
                ? { repeat: Infinity, duration: 8, ease: "linear" }
                : { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }
          >
            {icon}
          </motion.div>
        ) : (
          <div style={{ position: "relative", zIndex: 1 }}>{icon}</div>
        )}

        {/* ── Lock overlay ── */}
        {locked && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            display: "grid", placeItems: "center", zIndex: 3,
          }}>
            <Lock style={{ height: 14, width: 14, color: "#C9A84C" }} />
          </div>
        )}
      </motion.div>
    </div>
  );

  if (locked) {
    return (
      <button
        onClick={onLockedTap}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}
      >
        {circle}
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)", textAlign: "center", lineHeight: 1.3, maxWidth: 72 }}>
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link to={to} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.16 }}
      >
        {circle}
      </motion.div>
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 1.3, maxWidth: 72 }}>
        {label}
      </span>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Tools() {
  const { t } = useTranslation();
  const [state] = useAppState();
  const [reframeIdx, setReframeIdx] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbFilter, setLbFilter] = useState("All");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [plans, setPlans] = useState([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      {/* ── Aurora Borealis background ───────────────────────────────────── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>

        {/*
          Purple blob — anchored top-left.
          Drifts RIGHT across the screen (passing the green), oscillates vertically
          with a gentle breathing scale, then eases all the way back. 50s cycle.
        */}
        <motion.div
          animate={{
            x:       ["0vw", "25vw", "48vw", "25vw", "0vw"],
            y:       ["0vh",  "4vh", "-3vh",  "6vh",  "0vh"],
            scale:   [1,      1.06,   0.97,   1.04,   1],
            opacity: [0.22,   0.26,   0.20,   0.24,   0.22],
          }}
          transition={{
            duration:   50,
            ease:       "easeInOut",
            repeat:     Infinity,
            repeatType: "loop",
          }}
          style={{
            position:     "absolute",
            top:          "-15%",
            left:         "-20%",
            width:        "80vw",
            height:       "80vw",
            borderRadius: "50%",
            background:   "radial-gradient(circle, #a855f7 0%, transparent 65%)",
            filter:       "blur(140px)",
          }}
        />

        {/*
          Green blob — anchored top-right.
          Drifts LEFT (opposite direction), slightly different vertical oscillation
          so the two blobs pass each other asymmetrically. 55s cycle.
        */}
        <motion.div
          animate={{
            x:       ["0vw", "-26vw", "-50vw", "-26vw", "0vw"],
            y:       ["0vh",  "6vh",   "2vh",  "-4vh",  "0vh"],
            scale:   [1,      0.95,    1.08,    0.98,    1],
            opacity: [0.22,   0.20,    0.25,    0.21,    0.22],
          }}
          transition={{
            duration:   55,
            ease:       "easeInOut",
            repeat:     Infinity,
            repeatType: "loop",
          }}
          style={{
            position:     "absolute",
            top:          "-12%",
            right:        "-24%",
            width:        "75vw",
            height:       "75vw",
            borderRadius: "50%",
            background:   "radial-gradient(circle, #10b981 0%, transparent 65%)",
            filter:       "blur(140px)",
          }}
        />

        {/*
          Indigo blob — fixed centre-low anchor, very slow gentle breathe only.
          Acts as the deep atmospheric floor that never moves far.
          60s cycle so it never phases with either moving blob.
        */}
        <motion.div
          animate={{
            x:       ["0vw",  "4vw", "-5vw",  "2vw",  "0vw"],
            y:       ["0vh", "-5vh",  "8vh",  "-3vh",  "0vh"],
            scale:   [1,      1.04,   0.96,    1.03,   1],
            opacity: [0.18,   0.22,   0.15,    0.20,   0.18],
          }}
          transition={{
            duration:   60,
            ease:       "easeInOut",
            repeat:     Infinity,
            repeatType: "loop",
          }}
          style={{
            position:     "absolute",
            top:          "18%",
            left:         "8%",
            width:        "90vw",
            height:       "70vw",
            borderRadius: "50%",
            background:   "radial-gradient(circle, #6366f1 0%, transparent 65%)",
            filter:       "blur(150px)",
          }}
        />
      </div>

      {/* ── Content (above aurora) ────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <SectionTitle>{t("nav.tools")}</SectionTitle>
        <h1 className="mt-2 text-3xl font-bold">{t("tools.indexSubtitle")}</h1>
      </header>

      {/* ── SOS hero — tactical distress button ─────────────────────────── */}
      <section className="flex justify-center mt-10 mb-2">
        <Link to="/tools/sos" style={{ display: "block", position: "relative" }}>

          {/* ── Constant warm amber ambient blob ── */}
          <motion.span
            aria-hidden
            animate={{ opacity: [0.48, 0.78, 0.48], scale: [0.94, 1.10, 0.94] }}
            transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute", inset: -30, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,135,58,0.26) 0%, transparent 64%)",
              filter: "blur(18px)",
              pointerEvents: "none",
            }}
          />

          {/* ── Amber aura ring 1 — close, slow breathe ── */}
          <motion.span
            aria-hidden
            animate={{ scale: [0.94, 1.20, 0.94], opacity: [0.55, 0.16, 0.55] }}
            transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute", inset: -6, borderRadius: "50%",
              border: "1.5px solid rgba(196,135,58,0.65)",
              boxShadow: "0 0 14px 3px rgba(196,135,58,0.24)",
              pointerEvents: "none",
            }}
          />

          {/* ── Amber aura ring 2 — wider, offset timing ── */}
          <motion.span
            aria-hidden
            animate={{ scale: [1.0, 1.30, 1.0], opacity: [0.30, 0.06, 0.30] }}
            transition={{ duration: 5.0, ease: "easeInOut", repeat: Infinity, delay: 1.4 }}
            style={{
              position: "absolute", inset: -16, borderRadius: "50%",
              border: "1px solid rgba(232,168,74,0.48)",
              pointerEvents: "none",
            }}
          />

          {/* ── Crimson distress ripple 1 ── */}
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.42], opacity: [0.32, 0] }}
            transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid rgba(200,60,40,0.62)",
              pointerEvents: "none",
            }}
          />
          {/* ── Crimson distress ripple 2 ── */}
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.42], opacity: [0.18, 0] }}
            transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity, delay: 0.85 }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1.5px solid rgba(200,60,40,0.42)",
              pointerEvents: "none",
            }}
          />

          {/* ── Hover glow — amber + ember blend ── */}
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "absolute", inset: -24, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,135,58,0.32) 0%, rgba(200,60,40,0.16) 52%, transparent 70%)",
              filter: "blur(16px)",
              pointerEvents: "none",
            }}
          />

          {/* ── Main button ── */}
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
              border: "1.5px solid rgba(196,135,58,0.36)",
              boxShadow: [
                "0 0 0 1px rgba(200,80,60,0.22)",
                "0 0 42px 12px rgba(200,60,40,0.28)",
                "0 0 80px 24px rgba(196,135,58,0.13)",
                "inset 0 0 32px 5px rgba(220,80,60,0.08)",
                "inset 0 0 64px 12px rgba(196,135,58,0.04)",
              ].join(", "),
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.22,
              padding: "0 26px",
              textShadow: "0 0 22px rgba(255,120,100,0.65), 0 1px 3px rgba(0,0,0,0.65)",
              letterSpacing: "-0.01em",
            }}>
              {t("tools.sos.heroLine1")}<br />{t("tools.sos.heroLine2")}
            </p>
            <p style={{
              marginTop: 13,
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,232,212,0.96)",
              lineHeight: 1.38,
              padding: "0 20px",
              letterSpacing: "0.025em",
              textShadow: "0 0 14px rgba(196,135,58,0.50), 0 1px 2px rgba(0,0,0,0.55)",
            }}>
              {t("tools.sos.heroSub")}
            </p>
          </motion.div>
        </Link>
      </section>

      {/* ── Tool cards grid ─────────────────────────────────────────────── */}
      <section className="px-4 mt-10 pb-8" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Cyber-Arcade Accordion ───────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Premium gold header pill ── */}
          <motion.button
            onClick={() => setGamesOpen((v) => !v)}
            whileHover={{ borderColor: "rgba(222,188,122,0.30)" }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-4 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderTop: "1px solid rgba(201,168,76,0.22)",
              borderRadius: 20,
              padding: "18px 20px",
              position: "relative",
            }}
          >
            {/* Gold controller badge */}
            <div style={{
              width: 44, height: 44, display: "grid", placeItems: "center",
              borderRadius: 14, flexShrink: 0,
              background: "rgba(222,188,122,0.10)",
              border: "1px solid rgba(222,188,122,0.32)",
              boxShadow: "0 0 18px 3px rgba(222,188,122,0.18)",
              filter: "drop-shadow(0 0 12px rgba(222,188,122,0.70))",
            }}>
              <motion.div
                animate={{ rotate: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ color: "#debc7a" }}>
                  <path d="M2 7 Q2 5 4 5 L5.5 5 Q6 4 8 4 Q10 4 10.5 5 L12 5 Q14 5 14 7 L13.5 11 Q13 13 11.5 13 L10.5 13 Q9.5 12 8 12 Q6.5 12 5.5 13 L4.5 13 Q3 13 2.5 11 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                  <line x1="4.5" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <line x1="5.5" y1="7" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="10.5" cy="7.5" r="0.8" fill="currentColor"/>
                  <circle cx="11.8" cy="8.5" r="0.8" fill="currentColor"/>
                  <circle cx="10.5" cy="9.5" r="0.8" fill="currentColor"/>
                  <circle cx="9.2"  cy="8.5" r="0.8" fill="currentColor"/>
                </svg>
              </motion.div>
            </div>

            {/* Centred text block */}
            <div className="flex-1 text-center">
              <p style={{ fontWeight: 700, fontSize: 14, color: "#ffffff", lineHeight: 1.2 }}>{t("tools.gamesTitle")}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 2 }}>{t("tools.gamesDesc")}</p>
            </div>

            {/* Rotating gold chevron */}
            <motion.div
              animate={{ rotate: gamesOpen ? 180 : 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              style={{ flexShrink: 0, display: "flex" }}
            >
              <ChevronDown style={{ height: 16, width: 16, color: "rgba(222,188,122,0.60)" }} />
            </motion.div>
          </motion.button>

          {/* ── Slide-in glass dropdown ── */}
          <AnimatePresence initial={false}>
            {gamesOpen && (
              <motion.div
                key="arcade-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div style={{
                  position: "relative",
                  overflow: "hidden",
                  background: "rgba(30,32,48,0.58)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderTop: "1px solid rgba(201,168,76,0.18)",
                  borderRadius: 20,
                  padding: "22px 20px 24px",
                }}>

                  {/* ── Rotating etched-glass texture — z-0 ── */}
                  {/*
                    Oversized by 150 % and offset by −25 % so the rotating
                    rectangle always fully covers the panel at every angle.
                    The panel's own overflow:hidden clips the excess cleanly.
                  */}
                  <motion.div
                    aria-hidden
                    animate={{
                      scale:   [1, 1.03, 1],
                      opacity: [0.8, 0.95, 0.8],
                      y:       [0, 5, 0],
                    }}
                    transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                    style={{
                      position: "absolute",
                      top: "-25%", left: "-25%",
                      width: "150%", height: "150%",
                      zIndex: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <ArcadeTextureSVG />
                  </motion.div>

                  {/* ── Content — above texture ── */}
                  <div style={{ position: "relative", zIndex: 1 }}>

                  {/* Free games — 3-column circle grid */}
                  <motion.div
                    variants={gameContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-3"
                    style={{ gap: "24px 8px" }}
                  >
                    {FREE_GAMES.map(({ to, glow, labelKey, icon, ambient }) => (
                      <ArcadeBadge
                        key={to}
                        to={to}
                        glow={glow}
                        label={t(labelKey)}
                        icon={icon}
                        ambient={ambient}
                      />
                    ))}
                  </motion.div>

                  {/* PRO section */}
                  {state.isPremium === true ? (
                    <>
                      <div style={{ margin: "22px 0 18px", height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.32) 20%, rgba(201,168,76,0.32) 80%, transparent)" }} />
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.72, textAlign: "center", marginBottom: 18 }}>
                        {t("tools.gamesProTitle")}
                      </p>
                      <div className="grid grid-cols-3" style={{ gap: "24px 8px" }}>
                        {PRO_GAMES.map(({ to, glow, labelKey, icon, ambient }) => (
                          <ArcadeBadge
                            key={to}
                            to={to}
                            glow={glow}
                            label={t(labelKey)}
                            icon={icon}
                            ambient={ambient}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    /* ── Locked PRO row ── */
                    <motion.button
                      onClick={() => triggerPaywall()}
                      whileHover={{ borderColor: "rgba(201,168,76,0.44)", scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        width: "100%",
                        marginTop: 18,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 18px",
                        borderRadius: 18,
                        background: "rgba(201,168,76,0.05)",
                        border: "1px solid rgba(201,168,76,0.20)",
                        borderTop: "1px solid rgba(201,168,76,0.32)",
                        cursor: "pointer",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}
                    >
                      {/* Sleek golden padlock badge */}
                      <div style={{
                        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                        display: "grid", placeItems: "center",
                        background: "rgba(201,168,76,0.09)",
                        border: "1.5px solid rgba(201,168,76,0.32)",
                        boxShadow: "0 0 16px 3px rgba(201,168,76,0.16)",
                        filter: "drop-shadow(0 0 8px rgba(222,188,122,0.50))",
                      }}>
                        <Lock style={{ height: 17, width: 17, color: "#debc7a" }} />
                      </div>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginBottom: 3 }}>
                          {t("tools.gamesProLocked")}
                        </p>
                        <p style={{ fontSize: 11, color: "#debc7a", opacity: 0.70, lineHeight: 1.45 }}>
                          {t("tools.gamesProLockedSub")}
                        </p>
                      </div>
                      <ChevronDown style={{ height: 14, width: 14, color: "rgba(201,168,76,0.55)", transform: "rotate(-90deg)", flexShrink: 0 }} />
                    </motion.button>
                  )}
                  </div>{/* end content z-1 */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* ── Trophy / Leaderboard ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 8px" }}>
          <motion.button
            onClick={() => setLbOpen(true)}
            animate={{ boxShadow: ["0 0 20px rgba(201,168,76,0.3)", "0 0 35px rgba(201,168,76,0.6)", "0 0 20px rgba(201,168,76,0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileTap={{ scale: 0.93 }}
            style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "rgba(201,168,76,0.10)",
              border: "1px solid rgba(201,168,76,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Trophy size={28} color="#C9A84C" strokeWidth={1.8}/>
          </motion.button>
          <span style={{ fontSize: 11, color: "#C9A84C", marginTop: 8, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "DM Sans, sans-serif" }}>
            Leaderboard
          </span>
        </div>

      </section>

      </div>{/* end content z-1 */}

      {/* ── Leaderboard modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {lbOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="lb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setLbOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 50 }}
            />

            {/* Sheet */}
            <motion.div
              key="lb-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                height: "80vh", zIndex: 51,
                background: "#090705",
                borderRadius: "24px 24px 0 0",
                borderTop: "1px solid #1e1a10",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Cormorant Garamond font */}
              <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,600&display=swap');`}</style>

              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 8, flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2a2010" }} />
              </div>

              {/* Inner container */}
              <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px 32px" }}>
                <div style={{
                  background: "#0f0c06",
                  border: "1px solid #1e1a10",
                  borderRadius: 20,
                  padding: 20,
                }}>

                  {/* Header */}
                  <h2 style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 22,
                    fontStyle: "italic",
                    fontWeight: 600,
                    color: "#C9A84C",
                    lineHeight: 1.2,
                  }}>
                    Leaderboard
                  </h2>
                  <p style={{
                    margin: "4px 0 16px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.40)",
                    fontFamily: "DM Sans, sans-serif",
                  }}>
                    Top players this week
                  </p>

                  {/* Filter pills */}
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
                    {["All", "Steady Hand", "Clarity Climb", "Cold Switch", "Mind Pulse"].map(f => (
                      <button
                        key={f}
                        onClick={() => setLbFilter(f)}
                        style={{
                          flexShrink: 0,
                          padding: "6px 16px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: lbFilter === f ? 700 : 500,
                          fontFamily: "DM Sans, sans-serif",
                          cursor: "pointer",
                          border: lbFilter === f ? "none" : "1px solid #1e1a10",
                          background: lbFilter === f ? "#C9A84C" : "#0f0c06",
                          color: lbFilter === f ? "#090705" : "#5a5040",
                          transition: "background 0.18s, color 0.18s",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Column labels */}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    paddingBottom: 8,
                    borderBottom: "1px solid #1e1a10",
                    marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", fontFamily: "DM Sans, sans-serif" }}>
                      Player
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", fontFamily: "DM Sans, sans-serif" }}>
                      Score
                    </span>
                  </div>

                  {/* Rows */}
                  {([
                    { rank: 1,  username: "Marcus", score: 2840, game: "Steady Hand"   },
                    { rank: 2,  username: "Jaylen", score: 2210, game: "Clarity Climb" },
                    { rank: 3,  username: "Sven",   score: 1990, game: "Cold Switch"   },
                    { rank: 4,  username: "Alex",   score: 1750, game: "Mind Pulse"    },
                    { rank: 5,  username: "Ryan",   score: 1420, game: "Steady Hand"   },
                    { rank: 6,  username: "Tobias", score: 1180, game: "Clarity Climb" },
                    { rank: 7,  username: "Dante",  score:  940, game: "Mind Pulse"    },
                    { rank: 8,  username: "Elias",  score:  780, game: "Cold Switch"   },
                    { rank: 9,  username: "Noah",   score:  610, game: "Steady Hand"   },
                    { rank: 10, username: "Luka",   score:  490, game: "Clarity Climb" },
                  ] as { rank: number; username: string; score: number; game: string }[])
                    .filter(r => lbFilter === "All" || r.game === lbFilter)
                    .map((row, i) => {
                      const TOP3: Record<number, { icon: string; borderColor: string; bg?: string }> = {
                        1: { icon: "👑", borderColor: "#C9A84C", bg: "rgba(201,168,76,0.06)" },
                        2: { icon: "🥈", borderColor: "#a0a0b0" },
                        3: { icon: "🥉", borderColor: "#cd7f32" },
                      };
                      const top3 = TOP3[row.rank];
                      const isTop3 = !!top3;

                      return (
                        <motion.div
                          key={row.username}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, type: "spring", stiffness: 380, damping: 26 }}
                          style={{
                            minHeight: 56,
                            padding: "0 0 0 12px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            fontFamily: "DM Sans, sans-serif",
                            borderBottom: "1px solid #1e1a10",
                            borderLeft: isTop3 ? `2px solid ${top3.borderColor}` : "2px solid transparent",
                            background: top3?.bg ?? "transparent",
                            marginLeft: -4,
                            paddingRight: 0,
                          }}
                        >
                          {/* Left: badge + name */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                            {/* Rank badge */}
                            <div style={{
                              width: 30, height: 30,
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              background: isTop3 ? `${top3.borderColor}18` : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isTop3 ? `${top3.borderColor}40` : "rgba(255,255,255,0.08)"}`,
                            }}>
                              {isTop3
                                ? <span style={{ fontSize: 14, lineHeight: 1 }}>{top3.icon}</span>
                                : <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.30)" }}>{row.rank}</span>
                              }
                            </div>

                            {/* Name + game */}
                            <div style={{ padding: "14px 0" }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isTop3 ? "#f0e8d0" : "rgba(255,255,255,0.75)", lineHeight: 1.25 }}>
                                {row.username}
                              </p>
                              {lbFilter === "All" && (
                                <p style={{ margin: 0, fontSize: 11, color: "#5a5040", lineHeight: 1.2 }}>
                                  {row.game}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: score */}
                          <div style={{ textAlign: "right", paddingRight: 4 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#C9A84C" }}>
                              {row.score.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 10, color: "#3a3020", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                              pts
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  }
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

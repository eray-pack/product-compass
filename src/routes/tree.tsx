import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Coins, Lock, CreditCard, Share2, Users, Crown, Globe } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tree3D } from "@/components/Tree3D";
import { Wolf3D } from "@/components/Wolf3D";
import { CartoonTree } from "@/components/CartoonTree";
import { CompanionAvatar } from "@/components/avatars/CompanionAvatar";

export const Route = createFileRoute("/tree")({
  component: TreePage,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const UPGRADES = [
  { id: "leaves-gold",    name: "Golden leaves",    desc: "Mark a milestone forever",          costPoints: 80,  costMoney: 1.99 },
  { id: "branch-mind",   name: "Mind branch",      desc: "Adds a meditation streak slot",      costPoints: 150, costMoney: 2.99 },
  { id: "branch-body",   name: "Body branch",      desc: "Adds a fitness streak slot",         costPoints: 150, costMoney: 2.99 },
  { id: "ornament-streak",name: "Streak ornament", desc: "+30 day streak shield",              costPoints: 250, costMoney: 4.99, pro: true },
  { id: "root-deep",     name: "Deep roots",       desc: "Permanent +10% XP from challenges", costPoints: 500, costMoney: 7.99, pro: true },
];

const RANK_BY_STAGE = ["Beginning", "Awakening", "Building", "Established", "Rising", "Legendary"];
const TOP_PCT_BY_STAGE = [82, 61, 40, 25, 13, 3];
const STAGE_NAMES = ["Day 1", "Week 1", "2 Weeks", "Month 1", "2 Months", "90 Days"];

const HALL_OF_LEGENDS = [
  { name: "Dimitri K.", day: 412 },
  { name: "Samuel R.", day: 287 },
  { name: "Kenji T.", day: 156 },
];

// ── Wolf companion constants ───────────────────────────────────────────────────
const WOLF_UPGRADES = [
  { id: "wolf-raw-meat",     name: "Raw meat",         desc: "Feed the wolf — grants +20 bonus XP",          costPoints: 80,  costMoney: 1.99 },
  { id: "wolf-pack-bond",    name: "Wolf pack bond",   desc: "Unlocks pack howl animation",                   costPoints: 150, costMoney: 2.99 },
  { id: "wolf-thick-fur",    name: "Thick fur coat",   desc: "Winter coat — amber highlights on Stage 4+",    costPoints: 150, costMoney: 2.99 },
  { id: "wolf-alpha-mark",   name: "Alpha marking",    desc: "Branded alpha symbol on the wolf's shoulder",   costPoints: 250, costMoney: 4.99, pro: true },
  { id: "wolf-ancient",      name: "Ancient instinct", desc: "Permanent +10% XP from every challenge",        costPoints: 400, costMoney: 6.99, pro: true },
];

const WOLF_RANK_BY_STAGE = ["Beginning", "Awakening", "Building", "Established", "Rising", "Fierce", "Dominant", "Legendary"];
const WOLF_TOP_PCT_BY_STAGE = [82, 66, 50, 38, 25, 14, 6, 1];

// XP thresholds per wolf stage — mirrors treeStage() in store.ts
const WOLF_XP_PREV = [0, 100, 250, 500, 1000, 1750, 2750, 4000] as const;

function wolfXPStage(xp: number): { stage: 0|1|2|3|4|5|6|7; name: string; next: number } {
  if (xp < 100)  return { stage: 0, name: "Newborn",    next: 100  };
  if (xp < 250)  return { stage: 1, name: "Pup",        next: 250  };
  if (xp < 500)  return { stage: 2, name: "Young",      next: 500  };
  if (xp < 1000) return { stage: 3, name: "Adolescent", next: 1000 };
  if (xp < 1750) return { stage: 4, name: "Adult",      next: 1750 };
  if (xp < 2750) return { stage: 5, name: "Strong",     next: 2750 };
  if (xp < 4000) return { stage: 6, name: "Alpha",      next: 4000 };
  return { stage: 7, name: "Legendary", next: xp };
}

// ── Deterministic star positions (avoids jitter on re-render) ─────────────────
const NIGHT_STARS = [
  [5,5,2,0],[12,15,1.5,0.6],[18,8,1,1.4],[25,22,2.5,0.2],[32,12,1,1.8],
  [40,4,1.8,0.9],[47,18,1.2,2.3],[53,9,2,0.4],[60,25,1,1.1],[67,7,1.5,2.0],
  [74,20,1.2,0.7],[81,5,1.8,1.5],[88,16,1,0.3],[93,28,2,2.4],[8,32,1.2,1.0],
  [20,42,1.5,0.5],[35,35,1,2.1],[50,48,1.8,0.8],[65,38,1.2,1.7],[78,45,1,0.2],
  [90,33,1.5,2.8],[15,52,1,1.3],[42,55,2,0.6],[68,50,1.2,2.2],[85,55,1,1.0],
] as const;


// ── Companion health — driven by login frequency (last 7 days) ────────────────
type HealthState = "thriving" | "growing" | "fading" | "neglected";

const HEALTH_CONFIG: Record<HealthState, {
  label: string;
  emoji: string;
  color: string;
  desc: string;
  companionFilter: string;
  sceneOverlay: string;
}> = {
  thriving:  { label: "Thriving",  emoji: "🌿", color: "#3fb86a", desc: "You show up every day.",              companionFilter: "none",                                         sceneOverlay: "transparent" },
  growing:   { label: "Growing",   emoji: "🌱", color: "#8fbe5a", desc: "Keep the rhythm going.",             companionFilter: "saturate(0.80) brightness(0.95)",              sceneOverlay: "rgba(0,0,0,0.06)" },
  fading:    { label: "Fading",    emoji: "🍂", color: "#C9A84C", desc: "It misses you. Come back more.",     companionFilter: "saturate(0.45) brightness(0.80) sepia(0.25)",  sceneOverlay: "rgba(20,10,0,0.22)" },
  neglected: { label: "Neglected", emoji: "🪨", color: "#7a6a5a", desc: "It's barely holding on. Open up.",  companionFilter: "saturate(0.15) brightness(0.62) sepia(0.35)",  sceneOverlay: "rgba(8,8,8,0.40)" },
};

function getCompanionHealth(loginHistory: number[]): { state: HealthState; daysThisWeek: number } {
  const daySet = new Set(
    (loginHistory ?? []).map((ts) => new Date(ts).toISOString().slice(0, 10))
  );
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (daySet.has(d)) count++;
  }
  const state: HealthState = count >= 6 ? "thriving" : count >= 4 ? "growing" : count >= 2 ? "fading" : "neglected";
  return { state, daysThisWeek: count };
}

// ── Background: Tree — timezone-based sky ─────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const SKY_CONFIGS = {
  morning: {
    gradient: "linear-gradient(180deg, #0D0400 0%, #5C1E00 18%, #C04A10 38%, #E87828 58%, #F5B060 78%, #FFD898 100%)",
    label: "Morning",
    emoji: "🌅",
  },
  afternoon: {
    gradient: "linear-gradient(180deg, #0A1A5E 0%, #1040B0 28%, #2868D0 55%, #5090E0 80%, #80B8F0 100%)",
    label: "Afternoon",
    emoji: "☀️",
  },
  evening: {
    gradient: "linear-gradient(180deg, #0A0020 0%, #3A0858 18%, #8A2820 38%, #C84C18 55%, #E8800A 72%, #F5B040 88%, #FFD888 100%)",
    label: "Evening",
    emoji: "🌇",
  },
  night: {
    gradient: "linear-gradient(180deg, #010308 0%, #030820 28%, #080D2A 55%, #0E1238 80%, #141840 100%)",
    label: "Night",
    emoji: "🌙",
  },
} as const;

function TreeSkyBackground({ timeOfDay }: { timeOfDay: keyof typeof SKY_CONFIGS }) {
  const isNight = timeOfDay === "night";
  const isMorning = timeOfDay === "morning";
  const isAfternoon = timeOfDay === "afternoon";
  const isEvening = timeOfDay === "evening";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: SKY_CONFIGS[timeOfDay].gradient }}/>

      {/* Night: stars + moon */}
      {isNight && (
        <>
          {NIGHT_STARS.map(([x, y, size, delay], i) => (
            <div
              key={i}
              className="absolute rounded-full anim-star"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: "white",
                "--star-dur": `${1.8 + (i % 6) * 0.35}s`,
                "--star-delay": `${delay}s`,
              } as React.CSSProperties}
            />
          ))}
          {/* Crescent moon */}
          <svg className="absolute" style={{ top: "8%", right: "12%" }} width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="18" fill="#F5E8C0" opacity="0.92"/>
            <circle cx="31" cy="18" r="14" fill="#0E1238"/>
            <circle cx="24" cy="24" r="18" fill="#F5E8C0" opacity="0.08"/>
          </svg>
        </>
      )}

      {/* Morning: sun rising glow */}
      {isMorning && (
        <>
          <div
            className="absolute anim-sun"
            style={{
              bottom: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFE082 0%, #FFB300 50%, transparent 75%)",
              boxShadow: "0 0 60px 30px rgba(255,180,50,0.5), 0 0 120px 60px rgba(255,130,20,0.25)",
            }}
          />
          {/* Rays */}
          <div
            className="absolute anim-sun"
            style={{
              bottom: "18%",
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,180,80,0.35), transparent)",
            }}
          />
        </>
      )}

      {/* Afternoon: bright sun */}
      {isAfternoon && (
        <div
          className="absolute anim-sun"
          style={{
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFFDE7 0%, #FFE082 40%, transparent 70%)",
            boxShadow: "0 0 50px 25px rgba(255,230,100,0.5), 0 0 100px 50px rgba(200,180,60,0.25)",
          }}
        />
      )}

      {/* Evening: sunset gradient + horizon glow */}
      {isEvening && (
        <div
          className="absolute bottom-0 inset-x-0 h-1/3 anim-sun"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(240,120,30,0.55), transparent 70%)",
          }}
        />
      )}

      {/* Ground line */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "rgba(255,200,100,0.2)" }}/>
    </div>
  );
}


// ── Router ────────────────────────────────────────────────────────────────────
function TreePage() {
  const [state, update] = useAppState();
  const day = dayCount(state.startDate);
  const companion = state.companion ?? "tree";

  if (companion === "wolf") {
    return <WolfPage state={state} update={update} day={day} />;
  }
  return <LifeTreePage state={state} update={update} day={day} />;
}

// ── Background: Dark forest at night with moon ────────────────────────────────
const FOREST_STARS = [
  [8,4,1.5,0],[16,10,1,0.5],[24,3,2,1.2],[34,14,1.2,0.8],[44,6,1.8,0.3],
  [56,11,1,1.5],[64,4,1.5,0.7],[72,9,2,0.2],[82,2,1.2,1.8],[90,13,1.5,0.9],
  [96,5,1,1.1],[4,20,1.2,2],[18,26,1,0.4],[28,18,1.8,1.6],[38,28,1,0.1],
  [50,22,1.5,2.2],[60,27,1.2,0.6],[68,20,2,1.4],[76,32,1,2.5],[85,24,1.5,0.3],
  [92,19,1.2,1.9],[12,36,1,2.8],[35,38,1.5,1.0],[58,35,1.2,0.7],[79,38,1,2.1],
] as const;

function WolfBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep forest night sky */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020508 0%, #040A10 22%, #061218 48%, #071622 75%, #09181E 100%)",
      }}/>
      {/* Forest ambient glow — moonlight */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(140,180,220,0.10), transparent 60%)",
      }}/>
      {/* Ground mist */}
      <div className="absolute bottom-0 inset-x-0 h-1/3" style={{
        background: "radial-gradient(ellipse 100% 60% at 50% 110%, rgba(20,60,40,0.30), transparent)",
      }}/>
      {/* Amber eye-glow atmosphere (wolf presence) */}
      <div className="absolute bottom-0 inset-x-0 h-1/2" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(196,135,58,0.07), transparent)",
      }}/>

      {/* Stars */}
      {FOREST_STARS.map(([x, y, size, delay], i) => (
        <div
          key={i}
          className="absolute rounded-full anim-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: "white",
            "--star-dur": `${2 + (i % 5) * 0.4}s`,
            "--star-delay": `${delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Moon */}
      <svg className="absolute" style={{ top: "5%", right: "10%" }} width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="16" fill="#E8DFC0" opacity="0.88"/>
        <circle cx="28" cy="16" r="12" fill="#040A10"/>
        <circle cx="22" cy="22" r="16" fill="#E8DFC0" opacity="0.07"/>
      </svg>

      {/* Forest tree silhouettes — back layer */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 400 160"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Back trees */}
        <path d="M0 160 L0 80 L12 60 L24 80 L24 160Z" fill="#050D14"/>
        <path d="M18 160 L18 65 L32 40 L46 65 L46 160Z" fill="#040B11"/>
        <path d="M40 160 L40 75 L55 52 L70 75 L70 160Z" fill="#050D14"/>
        <path d="M60 160 L60 90 L72 70 L84 90 L84 160Z" fill="#040B11"/>
        <path d="M80 160 L80 60 L96 32 L112 60 L112 160Z" fill="#060E16"/>
        <path d="M105 160 L105 78 L118 55 L131 78 L131 160Z" fill="#050D14"/>
        <path d="M125 160 L125 65 L140 40 L155 65 L155 160Z" fill="#040B11"/>
        <path d="M148 160 L148 80 L162 58 L176 80 L176 160Z" fill="#050D14"/>
        <path d="M170 160 L170 55 L188 28 L206 55 L206 160Z" fill="#060E16"/>
        <path d="M200 160 L200 72 L214 48 L228 72 L228 160Z" fill="#050D14"/>
        <path d="M222 160 L222 62 L238 38 L254 62 L254 160Z" fill="#040B11"/>
        <path d="M248 160 L248 78 L262 55 L276 78 L276 160Z" fill="#050D14"/>
        <path d="M270 160 L270 50 L288 22 L306 50 L306 160Z" fill="#060E16"/>
        <path d="M300 160 L300 70 L315 46 L330 70 L330 160Z" fill="#050D14"/>
        <path d="M324 160 L324 80 L338 60 L352 80 L352 160Z" fill="#040B11"/>
        <path d="M346 160 L346 65 L362 40 L378 65 L378 160Z" fill="#050D14"/>
        <path d="M370 160 L370 75 L386 52 L400 75 L400 160Z" fill="#060E16"/>
        {/* Ground */}
        <rect x="0" y="148" width="400" height="12" fill="#03080E"/>
      </svg>

      {/* Top vignette */}
      <div className="absolute top-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(2,5,8,0.7), transparent)" }}/>
    </div>
  );
}

// ── Golden Leaf icon SVG ─────────────────────────────────────────────────────
function GoldenLeafSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
      <defs>
        <linearGradient id="lf-gold" x1="6" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F0D47A" />
          <stop offset="50%"  stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8C6520" />
        </linearGradient>
        <linearGradient id="lf-shine" x1="9" y1="3" x2="15" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.38)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Main leaf body */}
      <path d="M13 2 C18.5 4 22.5 9 21 15 C19.5 21 15.5 23.5 13 24.5 C10.5 23.5 6.5 21 5 15 C3.5 9 7.5 4 13 2Z"
        fill="url(#lf-gold)" />
      {/* Surface shine facet */}
      <path d="M13 2 C16.5 4 20 7.5 19.5 12 C17 9 14.5 5.5 13 2Z"
        fill="url(#lf-shine)" opacity="0.75" />
      {/* Central vein */}
      <line x1="13" y1="4.5" x2="13" y2="23.5"
        stroke="rgba(255,255,255,0.42)" strokeWidth="0.85" strokeLinecap="round" />
      {/* Left lateral veins */}
      <line x1="13" y1="9"  x2="7"   y2="12.5" stroke="rgba(255,255,255,0.30)" strokeWidth="0.65" strokeLinecap="round" />
      <line x1="13" y1="13" x2="6.5" y2="17"   stroke="rgba(255,255,255,0.24)" strokeWidth="0.60" strokeLinecap="round" />
      <line x1="13" y1="17" x2="8"   y2="20"   stroke="rgba(255,255,255,0.18)" strokeWidth="0.55" strokeLinecap="round" />
      {/* Right lateral veins */}
      <line x1="13" y1="9"  x2="19"  y2="12.5" stroke="rgba(255,255,255,0.30)" strokeWidth="0.65" strokeLinecap="round" />
      <line x1="13" y1="13" x2="19.5" y2="17"  stroke="rgba(255,255,255,0.24)" strokeWidth="0.60" strokeLinecap="round" />
      <line x1="13" y1="17" x2="18"  y2="20"   stroke="rgba(255,255,255,0.18)" strokeWidth="0.55" strokeLinecap="round" />
      {/* Stem */}
      <path d="M13 24.5 Q12.5 26 12 26.5" stroke="#8C6520" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Golden Leaf premium badge (leaves-gold item only) ─────────────────────────
function GoldenLeafBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // 10 particle positions on a ring r=30 centred in the 72px particle div (center=36,36)
  const particles = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 * Math.PI) / 180;
    return {
      x: 36 + 30 * Math.cos(a) - 1.5,
      y: 36 + 30 * Math.sin(a) - 1.5,
      big: i % 3 === 0,
      bright: i % 2 === 0,
    };
  });

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer golden halo burst ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0.12, 0.55] }}
        transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,201,106,0.70) 0%, rgba(201,168,76,0.35) 38%, transparent 68%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Rotating particle dust swirl ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.5, 1.3, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: i * 0.22 }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2,
              height: p.big ? 3.5 : 2,
              borderRadius: "50%",
              background: p.bright ? "#F0D47A" : "#C9A84C",
              boxShadow: `0 0 5px 1.5px rgba(222,188,122,0.75)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — burnished metallic chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #2a1f0e 0%, #0d0b07 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.18)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.09)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            "0 0 0 1.5px rgba(201,168,76,0.60)",
            "0 0 0 3.5px rgba(201,168,76,0.14)",
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 32px 10px rgba(201,168,76,${canAfford && !owned ? "0.38" : "0.18"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner nebula glow */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.28, 0.58, 0.28], scale: [0.72, 1.06, 0.72] }}
          transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 50% 58%, rgba(232,201,106,0.68) 0%, rgba(201,168,76,0.32) 40%, transparent 68%)",
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "linear", repeatDelay: 2.8 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Leaf icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        >
          <GoldenLeafSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Mind Branch icon SVG ─────────────────────────────────────────────────────
function MindBranchSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="mb-trunk" x1="14" y1="26" x2="14" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4338ca" />
          <stop offset="55%"  stopColor="#6366f1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="mb-node-l" x1="3" y1="8" x2="10" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="mb-node-r" x1="18" y1="4" x2="25" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* ── Main trunk ── */}
      <path d="M14 26 L14 17" stroke="url(#mb-trunk)" strokeWidth="2.0" strokeLinecap="round"/>

      {/* ── Primary left branch ── */}
      <path d="M14 17 Q10 14 7 11" stroke="url(#mb-trunk)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* ── Primary right branch ── */}
      <path d="M14 17 Q18 14 21 11" stroke="url(#mb-trunk)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* ── Central upward branch ── */}
      <path d="M14 17 L14 11" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/>

      {/* ── Secondary left branches ── */}
      <path d="M7 11 Q4.5 8.5 3.5 6"   stroke="#818cf8" strokeWidth="1.05" strokeLinecap="round" fill="none" opacity="0.90"/>
      <path d="M7 11 Q8 8 9.5 6"       stroke="#818cf8" strokeWidth="1.05" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* ── Secondary right branches ── */}
      <path d="M21 11 Q23.5 8.5 24.5 6" stroke="#38bdf8" strokeWidth="1.05" strokeLinecap="round" fill="none" opacity="0.90"/>
      <path d="M21 11 Q20 8 18.5 6"     stroke="#38bdf8" strokeWidth="1.05" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* ── Central secondary ── */}
      <path d="M14 11 Q12.5 8 12 5.5"  stroke="#6366f1" strokeWidth="0.95" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M14 11 Q15.5 8 16 5.5"  stroke="#6366f1" strokeWidth="0.95" strokeLinecap="round" fill="none" opacity="0.85"/>

      {/* ── Neural nodes at tips ── */}
      <circle cx="3.5"  cy="6"   r="2.2" fill="url(#mb-node-l)" />
      <circle cx="9.5"  cy="6"   r="2.2" fill="url(#mb-node-l)" />
      <circle cx="14"   cy="5.5" r="2.2" fill="#818cf8" />
      <circle cx="18.5" cy="5.5" r="2.2" fill="url(#mb-node-r)" />
      <circle cx="24.5" cy="6"   r="2.2" fill="url(#mb-node-r)" />
      {/* Junction nodes */}
      <circle cx="7"    cy="11"  r="1.6" fill="#6366f1" opacity="0.85"/>
      <circle cx="21"   cy="11"  r="1.6" fill="#6366f1" opacity="0.85"/>
      <circle cx="14"   cy="11"  r="1.6" fill="#818cf8" opacity="0.85"/>

      {/* ── Specular highlight on tip nodes ── */}
      <circle cx="3"    cy="5.4" r="0.85" fill="white" opacity="0.45"/>
      <circle cx="9"    cy="5.4" r="0.85" fill="white" opacity="0.45"/>
      <circle cx="13.5" cy="4.9" r="0.85" fill="white" opacity="0.45"/>
      <circle cx="18"   cy="4.9" r="0.85" fill="white" opacity="0.45"/>
      <circle cx="24"   cy="5.4" r="0.85" fill="white" opacity="0.45"/>
    </svg>
  );
}

// ── Mind Branch premium badge (branch-mind item only) ────────────────────────
function MindBranchBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  const primary = "#6366f1";   // indigo
  const accent  = "#38bdf8";   // sky-blue

  // 10 particles on r=30 ring, in the 72px swirl div (center=36,36)
  const particles = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 * Math.PI) / 180;
    return {
      x:      36 + 30 * Math.cos(a) - 1.5,
      y:      36 + 30 * Math.sin(a) - 1.5,
      big:    i % 3 === 0,
      bright: i % 2 === 0,
    };
  });

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer indigo-to-cyan halo burst ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.45, 1], opacity: [0.50, 0.10, 0.50] }}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(99,102,241,0.65) 0%, rgba(56,189,248,0.28) 42%, transparent 68%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Rotating particle dust swirl ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.22, 1, 0.22], scale: [0.5, 1.3, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: i * 0.24 }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2,
              height: p.big ? 3.5 : 2,
              borderRadius: "50%",
              background: p.bright ? accent : primary,
              boxShadow: `0 0 5px 1.5px rgba(99,102,241,0.80)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — burnished dark-chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #12112a 0%, #07060f 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px ${primary}88`,
            `0 0 0 3.5px ${primary}18`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 30px 8px rgba(99,102,241,${canAfford && !owned ? "0.42" : "0.20"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner nebula — indigo-cyan glow behind icon */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.72, 1.06, 0.72] }}
          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 55%, rgba(99,102,241,0.70) 0%, rgba(56,189,248,0.30) 42%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "linear", repeatDelay: 3.0 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.20) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Branch icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
        >
          <MindBranchSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Body Branch icon SVG ─────────────────────────────────────────────────────
function BodyBranchSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="bb-arm" x1="5" y1="26" x2="18" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#b91c1c" />
          <stop offset="45%"  stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="bb-branch" x1="14" y1="10" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="bb-shine" x1="8" y1="18" x2="12" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.28)" />
        </linearGradient>
      </defs>

      {/* ── Arm silhouette — flex/curl pose ── */}
      {/* Lower forearm from bottom-left */}
      <path d="M5 26 Q7 22 9 19"
        stroke="url(#bb-arm)" strokeWidth="4.0" strokeLinecap="round" fill="none"/>
      {/* Bicep — thicker stroke = muscle mass */}
      <path d="M9 19 Q11 15 13 12"
        stroke="url(#bb-arm)" strokeWidth="5.0" strokeLinecap="round" fill="none"/>
      {/* Upper arm narrowing toward wrist */}
      <path d="M13 12 Q15 10 17 8"
        stroke="url(#bb-arm)" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
      {/* Specular shine on bicep */}
      <path d="M10 17 Q11.5 14 13 12"
        stroke="url(#bb-shine)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* ── Branch growing from fist ── */}
      <path d="M17 8 L17 4" stroke="url(#bb-branch)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 6.5 Q14 4.5 13 2.5" stroke="url(#bb-branch)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M17 5.5 Q20 3.5 21 2"   stroke="url(#bb-branch)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

      {/* ── Neural-style tip nodes ── */}
      <circle cx="13" cy="2.5" r="2.0" fill="#fde68a" />
      <circle cx="21" cy="2"   r="2.0" fill="#f59e0b" />
      <circle cx="17" cy="4"   r="1.5" fill="#fde68a" opacity="0.90"/>
      <circle cx="12.4" cy="2.0" r="0.75" fill="white" opacity="0.50"/>
      <circle cx="20.5" cy="1.5" r="0.75" fill="white" opacity="0.50"/>
    </svg>
  );
}

// ── Body Branch premium badge (branch-body item only) ────────────────────────
function BodyBranchBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  const primary = "#ef4444";
  const accent  = "#f59e0b";

  // 12 particles — faster, more energetic feel
  const particles = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return {
      x:      36 + 30 * Math.cos(a) - 1.5,
      y:      36 + 30 * Math.sin(a) - 1.5,
      big:    i % 3 === 0,
      bright: i % 2 === 0,
    };
  });

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer red-amber power burst halo ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.52, 1], opacity: [0.58, 0.10, 0.58] }}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(239,68,68,0.72) 0%, rgba(245,158,11,0.36) 42%, transparent 68%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Rotating particle swirl ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.22, 1, 0.22], scale: [0.5, 1.4, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut", delay: i * 0.17 }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2,
              height: p.big ? 3.5 : 2,
              borderRadius: "50%",
              background: p.bright ? accent : primary,
              boxShadow: `0 0 5px 1.5px rgba(239,68,68,0.82)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — dark red chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #1a0808 0%, #0a0404 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px ${primary}88`,
            `0 0 0 3.5px ${primary}18`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 30px 8px rgba(239,68,68,${canAfford && !owned ? "0.46" : "0.22"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner nebula — red core fading to amber */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.32, 0.68, 0.32], scale: [0.68, 1.10, 0.68] }}
          transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 58%, rgba(239,68,68,0.78) 0%, rgba(245,158,11,0.32) 42%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 2.2 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.24) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Arm icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.09, 1] }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        >
          <BodyBranchSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Streak Ornament icon SVG ──────────────────────────────────────────────────
function StreakOrnamentSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="so-shield" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#93c5fd" />
          <stop offset="40%"  stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="so-gem" x1="11" y1="10" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="so-shine" x1="10" y1="3" x2="16" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* ── Shield body ── */}
      <path d="M14 2 L23 5.5 L23 13.5 Q23 21 14 26 Q5 21 5 13.5 L5 5.5 Z"
        fill="url(#so-shield)" opacity="0.88"/>
      <path d="M14 2 L23 5.5 L23 13.5 Q23 21 14 26 Q5 21 5 13.5 L5 5.5 Z"
        fill="none" stroke="rgba(147,197,253,0.65)" strokeWidth="1.0"/>
      {/* Inner inset */}
      <path d="M14 5 L20.5 7.8 L20.5 13.5 Q20.5 19.5 14 23.5 Q7.5 19.5 7.5 13.5 L7.5 7.8 Z"
        fill="none" stroke="rgba(147,197,253,0.28)" strokeWidth="0.75"/>

      {/* ── Filigree ── */}
      <line x1="14" y1="5.5" x2="14" y2="10"      stroke="rgba(147,197,253,0.55)" strokeWidth="0.75"/>
      <line x1="9.5" y1="12.5" x2="18.5" y2="12.5" stroke="rgba(147,197,253,0.38)" strokeWidth="0.70"/>
      <path d="M10 8.5 Q7.5 11 9 13.5"   stroke="rgba(147,197,253,0.48)" strokeWidth="0.70" strokeLinecap="round" fill="none"/>
      <path d="M18 8.5 Q20.5 11 19 13.5" stroke="rgba(147,197,253,0.48)" strokeWidth="0.70" strokeLinecap="round" fill="none"/>
      <path d="M10.5 18 Q14 20.5 17.5 18" stroke="rgba(147,197,253,0.40)" strokeWidth="0.70" strokeLinecap="round" fill="none"/>
      <circle cx="9.5"  cy="8.5" r="0.90" fill="rgba(147,197,253,0.55)"/>
      <circle cx="18.5" cy="8.5" r="0.90" fill="rgba(147,197,253,0.55)"/>

      {/* ── Central emerald gem ── */}
      <polygon points="14,10 17,13.5 14,17 11,13.5" fill="url(#so-gem)"/>
      <polygon points="14,10 17,13.5 14,17 11,13.5" fill="none" stroke="rgba(110,231,183,0.65)" strokeWidth="0.75"/>
      <polygon points="14,10 17,13.5 14,13.5" fill="rgba(255,255,255,0.22)"/>
      <line x1="14" y1="10" x2="14" y2="17"     stroke="rgba(110,231,183,0.38)" strokeWidth="0.55"/>
      <line x1="11" y1="13.5" x2="17" y2="13.5" stroke="rgba(110,231,183,0.38)" strokeWidth="0.55"/>

      {/* ── Shine facet ── */}
      <path d="M14 2.5 L21.5 5.5 L21.5 10 Q17 6.5 14 5.5 Q11 5 7 8.5 L7 5.5 Z"
        fill="url(#so-shine)" opacity="0.45"/>

      {/* ── Crown sparkle + corner accents ── */}
      <circle cx="14" cy="2"  r="1.5"  fill="white" opacity="0.88"/>
      <circle cx="5"  cy="5.5" r="0.80" fill="#93c5fd" opacity="0.72"/>
      <circle cx="23" cy="5.5" r="0.80" fill="#93c5fd" opacity="0.72"/>
    </svg>
  );
}

// ── Streak Ornament premium badge (ornament-streak item only) ─────────────────
function StreakOrnamentBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  const primary = "#3b82f6";
  const accent  = "#10b981";

  // Two-tier hexagonal + diamond pattern — geometric shield feel
  const particles = [
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 * Math.PI) / 180;
      return { x: 36 + 28 * Math.cos(a) - 1.5, y: 36 + 28 * Math.sin(a) - 1.5, big: false, bright: i % 2 === 0 };
    }),
    ...Array.from({ length: 4 }, (_, i) => {
      const a = ((i * 90 + 45) * Math.PI) / 180;
      return { x: 36 + 20 * Math.cos(a) - 1.5, y: 36 + 20 * Math.sin(a) - 1.5, big: true,  bright: i % 2 !== 0 };
    }),
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer sapphire-emerald protective aura ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.44, 1], opacity: [0.46, 0.08, 0.46] }}
        transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(59,130,246,0.68) 0%, rgba(16,185,129,0.30) 45%, transparent 68%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Counter-rotating geometric particles ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.20, 0.92, 0.20], scale: [0.6, 1.2, 0.6] }}
            transition={{ repeat: Infinity, duration: 3.0, ease: "easeInOut", delay: i * 0.30 }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2,
              height: p.big ? 3.5 : 2,
              borderRadius: p.big ? "2px" : "50%",
              background: p.bright ? accent : primary,
              boxShadow: `0 0 5px 1.5px rgba(59,130,246,0.82)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — dark blue chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #0a0f1e 0%, #04070f 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px ${primary}80`,
            `0 0 0 3.5px ${primary}16`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 28px 8px rgba(59,130,246,${canAfford && !owned ? "0.44" : "0.18"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner nebula — sapphire → emerald */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.22, 0.52, 0.22], scale: [0.72, 1.06, 0.72] }}
          transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 55%, rgba(59,130,246,0.70) 0%, rgba(16,185,129,0.28) 45%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep — slower, more majestic */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 3.8, ease: "linear", repeatDelay: 4.2 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Shield icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
        >
          <StreakOrnamentSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Deep Roots icon SVG ──────────────────────────────────────────────────────
function DeepRootsSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="dr-trunk" x1="14" y1="3" x2="14" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f0d47a" />
          <stop offset="55%"  stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#a0522d" />
        </linearGradient>
        <linearGradient id="dr-root-l" x1="14" y1="13" x2="3" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="dr-root-r" x1="14" y1="13" x2="25" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* ── Trunk stub — illuminated surface entry ── */}
      <path d="M14 3 L14 13" stroke="url(#dr-trunk)" strokeWidth="2.2" strokeLinecap="round"/>

      {/* ── Primary left root ── */}
      <path d="M14 13 Q9 16 6 19" stroke="url(#dr-root-l)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* ── Primary right root ── */}
      <path d="M14 13 Q19 16 22 19" stroke="url(#dr-root-r)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* ── Central downward root ── */}
      <path d="M14 13 L14 21" stroke="url(#dr-trunk)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* ── Secondary left roots ── */}
      <path d="M6 19 Q3.5 21 2.5 24"  stroke="#a0522d" strokeWidth="1.15" strokeLinecap="round" fill="none" opacity="0.90"/>
      <path d="M6 19 Q7 21.5 8 24.5"  stroke="#a0522d" strokeWidth="1.15" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* ── Secondary right roots ── */}
      <path d="M22 19 Q24.5 21 25.5 24" stroke="#d97706" strokeWidth="1.15" strokeLinecap="round" fill="none" opacity="0.90"/>
      <path d="M22 19 Q21 21.5 20 24.5" stroke="#d97706" strokeWidth="1.15" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* ── Center secondary ── */}
      <path d="M14 21 Q12 23 11 25.5"  stroke="#a0522d" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M14 21 Q16 23 17 25.5"  stroke="#d97706" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.85"/>

      {/* ── Root tip glow nodes ── */}
      <circle cx="2.5"  cy="24"   r="1.9" fill="#d97706" />
      <circle cx="8"    cy="24.5" r="1.9" fill="#c9a84c" />
      <circle cx="25.5" cy="24"   r="1.9" fill="#d97706" />
      <circle cx="20"   cy="24.5" r="1.9" fill="#c9a84c" />
      <circle cx="11"   cy="25.5" r="1.5" fill="#a0522d" opacity="0.90"/>
      <circle cx="17"   cy="25.5" r="1.5" fill="#d97706" opacity="0.90"/>
      {/* Junction nodes */}
      <circle cx="6"    cy="19"   r="1.6" fill="#c9a84c" opacity="0.85"/>
      <circle cx="22"   cy="19"   r="1.6" fill="#d97706" opacity="0.85"/>
      <circle cx="14"   cy="21"   r="1.4" fill="#c9a84c" opacity="0.85"/>

      {/* ── Surface stump — bright inner core ── */}
      <circle cx="14" cy="3" r="2.6" fill="#c9a84c" opacity="0.90"/>
      <circle cx="14" cy="3" r="1.5" fill="#f0d47a"/>
      <circle cx="13.3" cy="2.4" r="0.65" fill="white" opacity="0.55"/>

      {/* ── Inner luminous glow along trunk ── */}
      <path d="M14 3 L14 13" stroke="rgba(240,212,122,0.60)" strokeWidth="0.85" strokeLinecap="round"/>

      {/* ── Specular on root tips ── */}
      <circle cx="2.1"  cy="23.5" r="0.70" fill="white" opacity="0.42"/>
      <circle cx="7.5"  cy="24.0" r="0.70" fill="white" opacity="0.42"/>
      <circle cx="25.1" cy="23.5" r="0.70" fill="white" opacity="0.42"/>
      <circle cx="19.5" cy="24.0" r="0.70" fill="white" opacity="0.42"/>
    </svg>
  );
}

// ── Deep Roots premium badge (root-deep item only) ────────────────────────────
function DeepRootsBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  const primary = "#a0522d";
  const accent  = "#c9a84c";

  // Tendril-spread pattern — inner + outer ring at offset angles
  const particles = [
    ...Array.from({ length: 8 }, (_, i) => {
      const a = ((i * 45 + 10) * Math.PI) / 180;
      return { x: 36 + 30 * Math.cos(a) - 1.5, y: 36 + 30 * Math.sin(a) - 1.5, big: i % 2 === 0, bright: i % 3 === 0 };
    }),
    ...Array.from({ length: 4 }, (_, i) => {
      const a = ((i * 90 + 22) * Math.PI) / 180;
      return { x: 36 + 20 * Math.cos(a) - 1.5, y: 36 + 20 * Math.sin(a) - 1.5, big: false, bright: true };
    }),
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer bronze-gold deep-earth halo ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.40, 1], opacity: [0.62, 0.12, 0.62] }}
        transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(160,82,45,0.72) 0%, rgba(201,168,76,0.34) 42%, transparent 68%)`,
          filter: "blur(11px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Slowly rotating earth tendril particles ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.25, 0.88, 0.25], scale: [0.5, 1.28, 0.5] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: i * 0.28 }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2,
              height: p.big ? 3.5 : 2,
              borderRadius: "50%",
              background: p.bright ? accent : primary,
              boxShadow: `0 0 5px 1.5px rgba(201,168,76,0.76)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — earth dark chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #1a1208 0%, #080604 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.14)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.07)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(160,82,45,0.70)`,
            `0 0 0 3.5px rgba(160,82,45,0.16)`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 32px 10px rgba(160,82,45,${canAfford && !owned ? "0.44" : "0.20"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner nebula — gold core → bronze → dark */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.32, 0.72, 0.32], scale: [0.68, 1.12, 0.68] }}
          transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 62%, rgba(201,168,76,0.72) 0%, rgba(160,82,45,0.36) 40%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "linear", repeatDelay: 4.8 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Roots icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.88, 1, 0.88] }}
          transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
        >
          <DeepRootsSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Raw Meat icon SVG ─────────────────────────────────────────────────────────
function RawMeatSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <radialGradient id="rm-meat" cx="45%" cy="52%" r="52%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#ff4444" />
          <stop offset="38%"  stopColor="#cc1a1a" />
          <stop offset="72%"  stopColor="#8b0000" />
          <stop offset="100%" stopColor="#4a0000" />
        </radialGradient>
        <linearGradient id="rm-bone" x1="16" y1="3" x2="26" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f5f0e8" />
          <stop offset="100%" stopColor="#c8bfaa" />
        </linearGradient>
      </defs>

      {/* ── Steak silhouette ── */}
      <path d="M3 18 Q2 12 5 8 Q8 4 13 4 Q19 4 22 8 Q26 10 25 16 Q24 22 20 24 Q16 27 11 25 Q5 23 3 18Z"
        fill="url(#rm-meat)" />

      {/* ── Bone cap (top-right) ── */}
      <circle cx="19.5" cy="5.5" r="2.4" fill="url(#rm-bone)" />
      <circle cx="23.0" cy="5.5" r="2.4" fill="#e8e2d5" />
      <circle cx="19.5" cy="9.0" r="2.2" fill="url(#rm-bone)" />
      <circle cx="23.0" cy="9.0" r="2.2" fill="#ddd6c8" />
      <rect x="20.2" y="5.5" width="2.6" height="3.5" rx="0.8" fill="#ede8dc" />
      {/* Bone specular */}
      <circle cx="19.0" cy="5.0" r="0.8" fill="white" opacity="0.55"/>
      <circle cx="22.5" cy="5.0" r="0.8" fill="white" opacity="0.45"/>

      {/* ── Marbling / fat streaks ── */}
      <path d="M8 15 Q11 13 14 14 Q17 15 19 13"
        stroke="rgba(255,210,170,0.52)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M7 19 Q10 17 13 18"
        stroke="rgba(255,210,170,0.38)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      <path d="M15 20 Q17 18.5 19.5 19.5"
        stroke="rgba(255,210,170,0.42)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>

      {/* ── Surface specular ── */}
      <ellipse cx="9" cy="11" rx="3.5" ry="2" fill="rgba(255,80,80,0.28)" transform="rotate(-20 9 11)"/>
    </svg>
  );
}

// ── Raw Meat badge (wolf-raw-meat item only) ──────────────────────────────────
function RawMeatBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // Smoke wisps — scattered around top of badge
  const smokeParticles = [
    { x: 15, baseY: 6,  driftY: -10, driftX:  2, delay: 0.0, size: 3.5 },
    { x: 24, baseY: 4,  driftY: -12, driftX: -2, delay: 0.6, size: 2.5 },
    { x: 32, baseY: 6,  driftY: -10, driftX:  3, delay: 1.2, size: 3.0 },
    { x: 20, baseY: 8,  driftY: -8,  driftX: -3, delay: 1.8, size: 2.0 },
    { x: 28, baseY: 5,  driftY: -11, driftX:  1, delay: 0.9, size: 2.5 },
    { x: 12, baseY: 9,  driftY: -9,  driftX: -1, delay: 1.5, size: 2.0 },
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer blood-red power burst ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.58, 1], opacity: [0.68, 0.08, 0.68] }}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(220,38,38,0.82) 0%, rgba(153,27,27,0.44) 38%, transparent 68%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Secondary crimson pulse ring ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.80, 1.70, 0.80], opacity: [0.40, 0, 0.40] }}
        transition={{ duration: 2.6, ease: "easeOut", repeat: Infinity, delay: 0.65 }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: "1.5px solid rgba(220,38,38,0.58)",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating smoke / ember wisps ── */}
      <div aria-hidden style={{ position: "absolute", inset: -12, overflow: "visible", pointerEvents: "none" }}>
        {smokeParticles.map((p, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, p.driftY],
              x: [0, p.driftX],
              opacity: [0, i % 2 === 0 ? 0.62 : 0.45, 0],
              scale: [0.5, 1.5, 0.6],
            }}
            transition={{ repeat: Infinity, duration: 2.0 + i * 0.25, ease: "easeOut", delay: p.delay }}
            style={{
              position: "absolute",
              left: p.x, top: p.baseY,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: i % 2 === 0 ? `rgba(220,38,38,0.80)` : `rgba(80,10,10,0.70)`,
              filter: "blur(1.8px)",
            }}
          />
        ))}
      </div>

      {/* ── Main badge circle — dark steel with crimson core ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #1c0505 0%, #080101 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.14)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.07)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(220,38,38,0.74)`,
            `0 0 0 3.5px rgba(220,38,38,0.18)`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 34px 12px rgba(220,38,38,${canAfford && !owned ? "0.56" : "0.22"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner blood-red nebula */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.28, 0.65, 0.28], scale: [0.68, 1.12, 0.68] }}
          transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 58%, rgba(220,38,38,0.74) 0%, rgba(153,27,27,0.38) 42%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "linear", repeatDelay: 3.0 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,100,100,0.24) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Steak icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
        >
          <RawMeatSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Wolf Pack Bond icon SVG ───────────────────────────────────────────────────
function WolfPackBondSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <radialGradient id="wpb-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(226,232,240,0.60)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0)" />
        </radialGradient>
        <linearGradient id="wpb-wolf" x1="6" y1="27" x2="16" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e293b" />
          <stop offset="55%"  stopColor="#334155" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* ── Crescent moon (top-right) ── */}
      {/* Outer disc */}
      <circle cx="21.5" cy="6" r="5.2" fill="#c8d4e8" />
      {/* Inner cutout to form crescent */}
      <circle cx="23.8" cy="4.8" r="4.4" fill="#080b14" />
      {/* Subtle glow around crescent */}
      <circle cx="21.5" cy="6" r="5.2" fill="none" stroke="rgba(200,212,232,0.38)" strokeWidth="0.8"/>

      {/* ── Wolf silhouette — head thrown back, howling ── */}
      {/* Body/haunches */}
      <path d="M5 27 Q5 22 7.5 18.5 Q9 16 11.5 15 Q13 14.2 14.5 14.5 Q17 15 18 17.5 Q19 20 19 27Z"
        fill="url(#wpb-wolf)" />
      {/* Neck arching back */}
      <path d="M11 15 Q11.5 11.5 12.5 9 Q13.5 6.5 14.5 5.5 Q15.5 4.5 16.5 5 Q17.5 5.5 17.5 7.5 Q17.5 9.5 18 13"
        fill="url(#wpb-wolf)" />
      {/* Head angled upward */}
      <ellipse cx="15" cy="5.8" rx="3.2" ry="2.5" fill="#334155" transform="rotate(-30 15 5.8)" />
      {/* Muzzle / open howl snout */}
      <path d="M16.5 4.2 Q18.5 2.5 19.5 3.2 Q19.8 3.8 18.5 4.8 Q17.5 5.5 16 5Z"
        fill="#475569" />
      {/* Ears */}
      <path d="M12.5 4.5 Q12.8 2.2 14.2 3 Q14.6 4 13.5 5Z" fill="#334155"/>
      <path d="M15.5 3.5 Q17 1.5 18 2.5 Q17.8 3.5 16.5 4.5Z" fill="#334155"/>
      {/* Eye glint */}
      <circle cx="14" cy="5.5" r="0.75" fill="rgba(148,163,184,0.75)" />
      {/* Front legs */}
      <path d="M8 21 Q7.5 24 7.5 27" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M11.5 21 Q11.5 24 11.5 27" stroke="#1e293b" strokeWidth="2.0" strokeLinecap="round" fill="none"/>
      {/* Tail sweeping up */}
      <path d="M19 21 Q22 18 23 15 Q23.5 13 22 12.5"
        stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Wolf Pack Bond badge (wolf-pack-bond item only) ───────────────────────────
function WolfPackBondBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // Audio wave bars — simulate a sound-wave / howl visualiser
  const waveBars = [
    { x: 5,  h: 8,  delay: 0.00 },
    { x: 9,  h: 14, delay: 0.14 },
    { x: 13, h: 20, delay: 0.28 },
    { x: 17, h: 26, delay: 0.42 },
    { x: 21, h: 20, delay: 0.28 },
    { x: 25, h: 14, delay: 0.14 },
    { x: 29, h: 8,  delay: 0.00 },
    { x: 33, h: 12, delay: 0.20 },
    { x: 37, h: 6,  delay: 0.08 },
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer moonlight silver-blue halo ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.50, 1], opacity: [0.54, 0.08, 0.54] }}
        transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(96,165,250,0.65) 0%, rgba(148,163,184,0.28) 42%, transparent 68%)`,
          filter: "blur(11px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Floating howl audio wave bars ── */}
      <div aria-hidden style={{ position: "absolute", inset: -12, overflow: "visible", pointerEvents: "none" }}>
        {waveBars.map((bar, i) => (
          <motion.div
            key={i}
            animate={{
              scaleY: [0.25, 1.0, 0.25],
              opacity: [0.22, 0.70, 0.22],
            }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut", delay: bar.delay }}
            style={{
              position: "absolute",
              left: bar.x,
              top: "50%",
              marginTop: -(bar.h / 2),
              width: 2.2,
              height: bar.h,
              borderRadius: 2,
              background: i % 2 === 0 ? `rgba(96,165,250,0.85)` : `rgba(226,232,240,0.72)`,
              transformOrigin: "center",
              boxShadow: `0 0 4px 1px rgba(96,165,250,0.50)`,
            }}
          />
        ))}
      </div>

      {/* ── Main badge circle — midnight chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #0b0f1e 0%, #030408 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(96,165,250,0.66)`,
            `0 0 0 3.5px rgba(96,165,250,0.14)`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 30px 10px rgba(96,165,250,${canAfford && !owned ? "0.42" : "0.18"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner moonlight nebula */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.24, 0.56, 0.24], scale: [0.72, 1.08, 0.72] }}
          transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 45%, rgba(96,165,250,0.68) 0%, rgba(148,163,184,0.28) 42%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 4.2, ease: "linear", repeatDelay: 4.0 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(200,220,255,0.22) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Wolf howl icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 4.0, ease: "easeInOut", repeat: Infinity }}
        >
          <WolfPackBondSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Etched Glass Shop Card ────────────────────────────────────────────────────
function ShopCard({
  item,
  owned,
  canAfford,
  onBuyPoints,
  onBuyMoney,
}: {
  item: { id: string; name: string; desc: string; costPoints: number; costMoney: number; pro?: boolean };
  owned: boolean;
  canAfford: boolean;
  onBuyPoints: () => void;
  onBuyMoney: () => void;
}) {
  return (
    <div
      style={{
        background: canAfford && !owned
          ? "radial-gradient(ellipse at 12% 50%, rgba(201,168,76,0.09) 0%, transparent 62%), rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 28,
        padding: 20,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Energy badge icon */}
        {item.id === "leaves-gold" ? (
          <GoldenLeafBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "branch-mind" ? (
          <MindBranchBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "branch-body" ? (
          <BodyBranchBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "ornament-streak" ? (
          <StreakOrnamentBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "root-deep" ? (
          <DeepRootsBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "wolf-raw-meat" ? (
          <RawMeatBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "wolf-pack-bond" ? (
          <WolfPackBondBadge canAfford={canAfford} owned={owned} />
        ) : (
          <div style={{ position: "relative", flexShrink: 0, width: 48, height: 48 }}>
            {canAfford && !owned && (
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.10, 0.45] }}
                transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
                style={{
                  position: "absolute", inset: -7, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(201,168,76,0.45) 0%, transparent 72%)",
                  filter: "blur(6px)",
                  pointerEvents: "none",
                }}
              />
            )}
            <motion.div
              animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                display: "grid", placeItems: "center",
                background: owned
                  ? "rgba(255,255,255,0.05)"
                  : canAfford
                  ? "rgba(201,168,76,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${owned ? "rgba(255,255,255,0.09)" : canAfford ? "rgba(201,168,76,0.42)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: canAfford && !owned ? "0 0 18px 3px rgba(201,168,76,0.20)" : "none",
              }}
            >
              <Sparkles style={{ height: 20, width: 20, color: owned ? "rgba(255,255,255,0.28)" : canAfford ? "#C9A84C" : "rgba(255,255,255,0.25)" }} />
            </motion.div>
          </div>
        )}

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>{item.name}</p>
            {item.pro && <Lock style={{ height: 11, width: 11, color: "#C9A84C", flexShrink: 0 }} />}
          </div>
          <p style={{ fontSize: 11, color: "#debc7a", opacity: 0.78, lineHeight: 1.4 }}>{item.desc}</p>
        </div>

        {/* Owned badge */}
        {owned && (
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            padding: "3px 10px", borderRadius: 999, flexShrink: 0,
            background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.30)",
            color: "rgba(34,197,94,0.88)",
          }}>
            Owned
          </span>
        )}
      </div>

      {/* Buy buttons */}
      {!owned && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          {/* Points glass pill */}
          <motion.button
            onClick={onBuyPoints}
            disabled={!canAfford}
            whileHover={canAfford ? { scale: 1.05 } : {}}
            whileTap={canAfford ? { scale: 0.94, transition: { type: "spring", stiffness: 500, damping: 18 } } : {}}
            style={{
              height: 40, borderRadius: 999,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 700,
              background: canAfford ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${canAfford ? "rgba(201,168,76,0.38)" : "rgba(255,255,255,0.07)"}`,
              color: canAfford ? "#debc7a" : "rgba(255,255,255,0.22)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              cursor: canAfford ? "pointer" : "default",
              textShadow: canAfford ? "0 0 8px rgba(201,168,76,0.35)" : "none",
            }}
          >
            <Coins style={{ height: 13, width: 13 }} /> {item.costPoints} pts
          </motion.button>

          {/* Money glass pill */}
          <motion.button
            onClick={onBuyMoney}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94, transition: { type: "spring", stiffness: 500, damping: 18 } }}
            style={{
              height: 40, borderRadius: 999,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 700,
              background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)",
              border: "1px solid rgba(201,168,76,0.42)",
              color: "#debc7a",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              cursor: "pointer",
              textShadow: "0 0 8px rgba(201,168,76,0.40)",
            }}
          >
            <CreditCard style={{ height: 13, width: 13 }} /> ${item.costMoney}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ── Wolf companion page ───────────────────────────────────────────────────────
function WolfPage({
  state,
  update,
  day,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
  day: number;
}) {
  const wolfStage = wolfXPStage(state.treeXP);
  const prevThreshold = WOLF_XP_PREV[wolfStage.stage];
  const pct =
    wolfStage.stage >= 7
      ? 100
      : Math.min(100, ((state.treeXP - prevThreshold) / (wolfStage.next - prevThreshold)) * 100);
  const { state: healthState, daysThisWeek } = getCompanionHealth(state.loginHistory);
  const health = HEALTH_CONFIG[healthState];

  const buyWithPoints = (id: string, cost: number, pro?: boolean) => {
    if (pro && !state.isPremium) { triggerPaywall(); return; }
    if (state.points < cost) return;
    update((s) => ({
      points: s.points - cost,
      treeXP: s.treeXP + Math.floor(cost / 2),
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
    }));
  };

  const [wolfStyle, setWolfStyle] = useState<"3d" | "cartoon">(() => {
    try { return (localStorage.getItem("stopamine.wolf-style") as "3d" | "cartoon") ?? "cartoon"; }
    catch { return "cartoon"; }
  });

  function toggleWolfStyle(s: "3d" | "cartoon") {
    setWolfStyle(s);
    try { localStorage.setItem("stopamine.wolf-style", s); } catch {}
  }

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 16, fontWeight: 700, fontStyle: "italic", color: "#C9A84C", letterSpacing: 0, margin: 0 }}>Your Companion</p>
        <h1 className="mt-2 text-3xl font-bold">Your Wolf</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This wolf is yours. Every clean day makes it stronger.
        </p>
      </header>

      {/* Wolf scene — full-bleed */}
      <section className="mt-4 relative" style={{ height: 360 }}>
        <div className="absolute inset-0 overflow-hidden">
          <WolfBackground />
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000"
          style={{ background: health.sceneOverlay }} />
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{ height: 100, background: "linear-gradient(to bottom, transparent, #080604)" }} />

        {/* Stage — top left */}
        <div className="absolute top-4 left-5 z-20">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#C9A84C", background: "rgba(0,0,0,0.40)",
            border: "1px solid rgba(201,168,76,0.30)",
            borderRadius: 999, padding: "4px 10px", backdropFilter: "blur(10px)",
          }}>
            Stage {wolfStage.stage} · {wolfStage.name}
          </span>
        </div>

        {/* Style toggle — top right */}
        <div className="absolute top-4 right-5 z-20">
          <div style={{
            display: "inline-flex", borderRadius: 999, padding: 3,
            background: "rgba(0,0,0,0.40)", border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(10px)",
          }}>
            {(["cartoon", "3d"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => toggleWolfStyle(opt)}
                style={{
                  padding: "3px 12px", borderRadius: 999,
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  border: wolfStyle === opt ? "1px solid rgba(201,168,76,0.50)" : "1px solid transparent",
                  background: wolfStyle === opt ? "rgba(201,168,76,0.18)" : "transparent",
                  color: wolfStyle === opt ? "#C9A84C" : "rgba(255,255,255,0.35)",
                  cursor: "pointer", transition: "all 0.18s",
                }}
              >
                {opt === "3d" ? "3D" : "Cartoon"}
              </button>
            ))}
          </div>
        </div>

        {/* Wolf visual */}
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ filter: health.companionFilter, transition: "filter 1.2s ease" }}>
          {wolfStyle === "3d" ? (
            <div className="w-full h-full">
              <Wolf3D stage={wolfStage.stage} />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <div className="companion-3d anim-tree-float" style={{ width: "160px", height: "192px", marginBottom: "-12px" }}>
                <CompanionAvatar type="wolf" day={day} stage={wolfStage.stage} relapseCount={state.relapses.length} className="w-full h-full" />
              </div>
              <div style={{ width: "170px", height: "36px", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 30%, #2d6a3f, #1a4028)", boxShadow: "0 0 28px 10px rgba(20,80,40,0.28)", border: "1px solid rgba(45,110,65,0.40)" }} />
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-5 inset-x-5 z-20 flex items-center justify-between">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C9A84C", background: "rgba(0,0,0,0.38)", border: "1px solid rgba(201,168,76,0.30)", borderRadius: 999, padding: "4px 10px", backdropFilter: "blur(10px)" }}>
            <Crown style={{ height: 11, width: 11 }} /> {WOLF_RANK_BY_STAGE[wolfStage.stage]}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: health.color, background: "rgba(0,0,0,0.38)", border: `1px solid ${health.color}40`, borderRadius: 999, padding: "4px 10px", backdropFilter: "blur(10px)" }}>
            {health.emoji} {health.label} · {daysThisWeek}/7
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 999, padding: "4px 10px", backdropFilter: "blur(10px)" }}>
            <Sparkles style={{ height: 11, width: 11 }} /> Day {day}
          </span>
        </div>
      </section>

      {/* XP + stats */}
      <section className="px-6 mt-2">
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(201,168,76,0.12)", borderRadius: 20, padding: "16px 18px" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">{wolfStage.name}</span>
            <span className="text-muted-foreground tabular-nums">{state.treeXP} / {wolfStage.next} XP</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C9A84C, #E8C06A)" }} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs text-muted-foreground">
              <Globe className="inline h-3.5 w-3.5 text-success mr-1" />
              Top <span className="text-success font-semibold">{WOLF_TOP_PCT_BY_STAGE[wolfStage.stage]}%</span> of all users
            </p>
            <p className="text-xs" style={{ color: health.color, opacity: 0.85 }}>{health.emoji} {health.desc}</p>
          </div>
        </div>
      </section>

      {/* Hall of Legends */}
      <section className="px-6 mt-3">
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(201,168,76,0.12)", borderRadius: 20, padding: "14px 18px" }}>
          <p className="text-[9px] font-bold tracking-[0.32em] uppercase mb-3" style={{ color: "rgba(196,135,58,0.55)" }}>Hall of Legends</p>
          <div className="space-y-2.5">
            {HALL_OF_LEGENDS.map((u, i) => (
              <div key={u.name} className="flex items-center gap-2.5">
                <Crown className="h-3 w-3 shrink-0" style={{ color: "#C4873A", opacity: i === 0 ? 1 : i === 1 ? 0.65 : 0.40 }} />
                <span className="flex-1 text-[12px] font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{u.name}</span>
                <span className="text-[11px] tabular-nums" style={{ color: "rgba(196,135,58,0.70)" }}>Day {u.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share card */}
      <section className="px-6 mt-4">
        <ShareWolfCard wolfStage={wolfStage} day={day} xp={state.treeXP} />
      </section>

      {/* Remember why */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs uppercase tracking-wider text-primary">Remember why</p>
          <p className="mt-2 text-base leading-snug">
            Every clean day sharpens who this wolf becomes.
          </p>
        </div>
      </section>

      {/* Feed your wolf — etched glass shop */}
      <section className="px-6 mt-6">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82, marginBottom: 4 }}>
          Feed your wolf
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 16, lineHeight: 1.5 }}>
          Spend points you've earned — or speed it up.
        </p>
        {WOLF_UPGRADES.map((u) => {
          const owned = state.treeUnlocks.includes(u.id);
          const canAfford = state.points >= u.costPoints;
          return (
            <ShopCard
              key={u.id}
              item={u}
              owned={owned}
              canAfford={canAfford}
              onBuyPoints={() => buyWithPoints(u.id, u.costPoints, u.pro)}
              onBuyMoney={() => triggerPaywall()}
            />
          );
        })}
      </section>

      <section className="px-6 mt-4 mb-2">
        <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(201,168,76,0.10)", borderRadius: 24, padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.6 }}>
            <span style={{ color: "#f5ede0", fontWeight: 700 }}>You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ── Life Tree page (original, enhanced) ──────────────────────────────────────
function LifeTreePage({
  state,
  update,
  day,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
  day: number;
}) {
  const stage = treeStage(state.treeXP);
  const prevThreshold = stage.stage === 0 ? 0 : [0, 100, 300, 700, 1500, 3000][stage.stage];
  const pct =
    stage.stage >= 5
      ? 100
      : Math.min(100, ((state.treeXP - prevThreshold) / (stage.next - prevThreshold)) * 100);
  const timeOfDay = getTimeOfDay();
  const skyCfg = SKY_CONFIGS[timeOfDay];
  const { state: healthState, daysThisWeek } = getCompanionHealth(state.loginHistory);
  const health = HEALTH_CONFIG[healthState];

  const [treeStyle, setTreeStyle] = useState<"3d" | "cartoon">(() => {
    try { return (localStorage.getItem("stopamine.tree-style") as "3d" | "cartoon") ?? "cartoon"; }
    catch { return "cartoon"; }
  });

  function toggleTreeStyle(style: "3d" | "cartoon") {
    setTreeStyle(style);
    try { localStorage.setItem("stopamine.tree-style", style); } catch {}
  }

  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  const buyWithPoints = (id: string, cost: number, pro?: boolean) => {
    if (pro && !state.isPremium) { triggerPaywall(); return; }
    if (state.points < cost) {
      setShopFeedback(`Need ${cost - state.points} more credits`);
      setTimeout(() => setShopFeedback(null), 2200);
      return;
    }
    update((s) => ({
      points: s.points - cost,
      treeXP: s.treeXP + Math.floor(cost / 2),
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
    }));
    setShopFeedback("Unlocked!");
    setTimeout(() => setShopFeedback(null), 2000);
  };

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <SectionTitle>Sacred Ground</SectionTitle>
        <h1 className="mt-2 text-3xl font-bold">Your Life Tree</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This tree is sacred. Every clean day is permanently etched into it.
        </p>
      </header>

      {/* Info line — logins feed the tree */}
      <div className="px-6 mt-3 mb-1 flex items-center gap-2">
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.02em" }}>
          Every day you open the app waters your tree · <span style={{ color: health.color }}>{daysThisWeek}/7 this week</span>
        </span>
      </div>

      {/* Tree scene — full-bleed, no card frame */}
      <section className="mt-4 relative" style={{ height: 360 }}>
        {/* Sky fills the section only in 3D mode; cartoon mode uses its own oval */}
        {treeStyle === "3d" && (
          <>
            <div className="absolute inset-0 overflow-hidden">
              <TreeSkyBackground timeOfDay={timeOfDay} />
            </div>
            <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000"
              style={{ background: health.sceneOverlay }} />
          </>
        )}

        {/* Bottom fade — sky bleeds into page background */}
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{ height: 100, background: "linear-gradient(to bottom, transparent, #080604)" }} />

        {/* Stage badge — top left */}
        <div className="absolute top-4 left-5 z-20">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#C9A84C", background: "rgba(0,0,0,0.40)",
            border: "1px solid rgba(201,168,76,0.30)",
            borderRadius: 999, padding: "4px 10px",
            backdropFilter: "blur(10px)",
          }}>
            Stage {stage.stage} · {stage.name}
          </span>
        </div>

        {/* Style toggle — top right */}
        <div className="absolute top-4 right-5 z-20">
          <div style={{
            display: "inline-flex", borderRadius: 999, padding: 3,
            background: "rgba(0,0,0,0.40)", border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(10px)",
          }}>
            {(["cartoon", "3d"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => toggleTreeStyle(opt)}
                style={{
                  padding: "3px 12px", borderRadius: 999,
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  border: treeStyle === opt ? "1px solid rgba(201,168,76,0.50)" : "1px solid transparent",
                  background: treeStyle === opt ? "rgba(201,168,76,0.18)" : "transparent",
                  color: treeStyle === opt ? "#C9A84C" : "rgba(255,255,255,0.35)",
                  cursor: "pointer", transition: "all 0.18s",
                }}
              >
                {opt === "3d" ? "3D" : "Cartoon"}
              </button>
            ))}
          </div>
        </div>

        {/* Tree visual */}
        {treeStyle === "3d" ? (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ filter: health.companionFilter, transition: "filter 1.2s ease" }}>
            <div className="companion-3d anim-tree-float" style={{ width: "100%", height: "100%" }}>
              <Tree3D day={day} />
            </div>
          </div>
        ) : (
          /* Cartoon: oval scene — sky inside circle, edges fade out into black */
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div style={{
              position: "relative", width: 300, height: 300,
              maskImage: "radial-gradient(ellipse at center, black 52%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 52%, transparent 80%)",
              filter: health.companionFilter,
              transition: "filter 1.2s ease",
            }}>
              {/* Sky fills the oval */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "50%" }}>
                <TreeSkyBackground timeOfDay={timeOfDay} />
                <div style={{ position: "absolute", inset: 0, background: health.sceneOverlay, pointerEvents: "none" }} />
              </div>
              {/* Tree centered */}
              <div className="anim-tree-float" style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
              }}>
                <CartoonTree day={day} xp={state.treeXP} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom row — rank left, health center, day right */}
        <div className="absolute bottom-5 inset-x-5 z-20 flex items-center justify-between">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#C9A84C", background: "rgba(0,0,0,0.38)",
            border: "1px solid rgba(201,168,76,0.30)", borderRadius: 999, padding: "4px 10px",
            backdropFilter: "blur(10px)",
          }}>
            <Crown style={{ height: 11, width: 11 }} /> {RANK_BY_STAGE[stage.stage]}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 600,
            color: health.color, background: "rgba(0,0,0,0.38)",
            border: `1px solid ${health.color}40`, borderRadius: 999, padding: "4px 10px",
            backdropFilter: "blur(10px)",
          }}>
            {health.emoji} {health.label} · {daysThisWeek}/7
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)",
            background: "rgba(0,0,0,0.38)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 999, padding: "4px 10px", backdropFilter: "blur(10px)",
          }}>
            <Sparkles style={{ height: 11, width: 11 }} /> Day {day}
          </span>
        </div>
      </section>

      {/* XP + stats — sits on dark page background naturally */}
      <section className="px-6 mt-2">
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 20, padding: "16px 18px",
        }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">{stage.name}</span>
            <span className="text-muted-foreground tabular-nums">{state.treeXP} / {stage.next} XP</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C9A84C, #E8C06A)" }} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs text-muted-foreground">
              <Globe className="inline h-3.5 w-3.5 text-success mr-1" />
              Top <span className="text-success font-semibold">{TOP_PCT_BY_STAGE[stage.stage]}%</span> of all users
            </p>
            <p className="text-xs" style={{ color: health.color, opacity: 0.85 }}>
              {health.emoji} {health.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Hall of Legends */}
      <section className="px-6 mt-3">
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 20, padding: "14px 18px",
        }}>
          <p className="text-[9px] font-bold tracking-[0.32em] uppercase mb-3" style={{ color: "rgba(196,135,58,0.55)" }}>Hall of Legends</p>
          <div className="space-y-2.5">
            {HALL_OF_LEGENDS.map((u, i) => (
              <div key={u.name} className="flex items-center gap-2.5">
                <Crown className="h-3 w-3 shrink-0" style={{ color: "#C4873A", opacity: i === 0 ? 1 : i === 1 ? 0.65 : 0.40 }} />
                <span className="flex-1 text-[12px] font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{u.name}</span>
                <span className="text-[11px] tabular-nums" style={{ color: "rgba(196,135,58,0.70)" }}>Day {u.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social share */}
      <section className="px-6 mt-4">
        <ShareTreeCard stage={stage} day={day} xp={state.treeXP} />
      </section>

      {/* Why this matters */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs uppercase tracking-wider text-primary">Remember why</p>
          <p className="mt-2 text-base leading-snug">
            You started this for{" "}
            <span className="text-primary font-medium">
              {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
            </span>
            . Every day this tree grows, that future gets closer.
          </p>
        </div>
      </section>

      {/* Daily credit claim */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10);
        const claimed = state.lastDailyClaimDate === today;
        return (
          <section className="px-6 mt-4">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={claimed}
              onClick={() => {
                if (claimed) return;
                update((s) => ({ points: s.points + 25, lastDailyClaimDate: today }));
              }}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: claimed ? "rgba(255,255,255,0.03)" : "radial-gradient(ellipse at 10% 50%, rgba(201,168,76,0.14) 0%, transparent 70%), rgba(255,255,255,0.04)",
                border: claimed ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(201,168,76,0.30)",
                cursor: claimed ? "default" : "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{claimed ? "✅" : "🎁"}</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: claimed ? "rgba(255,255,255,0.35)" : "#f5ede0", marginBottom: 1 }}>
                    {claimed ? "Daily bonus claimed" : "Claim daily bonus"}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)" }}>
                    {claimed ? "Come back tomorrow" : "Log in every day to keep your tree alive"}
                  </p>
                </div>
              </div>
              {!claimed && (
                <span style={{
                  fontSize: 12, fontWeight: 800, color: "#C9A84C",
                  background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)",
                  borderRadius: 999, padding: "4px 12px",
                }}>
                  +25
                </span>
              )}
            </motion.button>
          </section>
        );
      })()}

      {/* Upgrades — etched glass shop */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-1">
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82 }}>
            Grow your tree
          </p>
          {shopFeedback && (
            <span style={{ fontSize: 11, fontWeight: 600, color: shopFeedback === "Unlocked!" ? "#3fb86a" : "#C9A84C", transition: "opacity 0.3s" }}>
              {shopFeedback}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 16, lineHeight: 1.5 }}>
          Spend credits you've earned — or speed it up.
        </p>
        {UPGRADES.map((u) => {
          const owned = state.treeUnlocks.includes(u.id);
          const canAfford = state.points >= u.costPoints;
          return (
            <ShopCard
              key={u.id}
              item={u}
              owned={owned}
              canAfford={canAfford}
              onBuyPoints={() => buyWithPoints(u.id, u.costPoints, u.pro)}
              onBuyMoney={() => triggerPaywall()}
            />
          );
        })}
      </section>

      <section className="px-6 mt-4 mb-2">
        <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(201,168,76,0.10)", borderRadius: 24, padding: 20, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.6 }}>
            <span style={{ color: "#f5ede0", fontWeight: 700 }}>You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ── Shared community feed data ────────────────────────────────────────────────
const COMMUNITY_FEED = [
  { name: "Marcus", stage: "Strong tree", day: 61, xp: 2340 },
  { name: "Jaylen", stage: "Young tree",  day: 34, xp: 980  },
  { name: "Timo",   stage: "Sapling",     day: 19, xp: 420  },
  { name: "Arjun",  stage: "Ancient tree",day: 112,xp: 4100 },
  { name: "Noah",   stage: "Sprout",      day: 8,  xp: 180  },
];

// ── Wolf share card ───────────────────────────────────────────────────────────
function ShareWolfCard({
  wolfStage,
  day,
  xp,
}: {
  wolfStage: { name: string; stage: number };
  day: number;
  xp: number;
}) {
  const [shared, setShared] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const shareText = `Day ${day} of my recovery. My Wolf is ${wolfStage.name} (${xp} XP). The hunt never stops. 🐺 #Stopamine`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "linear-gradient(135deg, oklch(0.18 0.06 265 / 0.5), oklch(0.22 0.06 260 / 0.6))",
        border: "1px solid oklch(0.78 0.16 85 / 0.35)",
        boxShadow: "0 0 32px -8px oklch(0.78 0.16 85 / 0.30)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/20 grid place-items-center text-primary shrink-0">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">Show the pack your wolf</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Your wolf is proof of real work. Most people never make it this far.
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-card/60 border border-border p-3 text-xs text-muted-foreground italic leading-relaxed">
        "{shareText}"
      </div>
      <button
        onClick={handleShare}
        className="w-full h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        {shared ? "Copied to clipboard" : "Share your wolf"}
      </button>
      <button
        onClick={() => setShowCommunity(!showCommunity)}
        className="w-full h-10 rounded-xl text-xs font-semibold bg-secondary/60 text-foreground border border-border inline-flex items-center justify-center gap-1.5"
      >
        <Users className="h-3.5 w-3.5" /> {showCommunity ? "Hide community" : "See the pack"}
      </button>
      {showCommunity && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Others holding the line</p>
          {COMMUNITY_FEED.map((u) => (
            <div key={u.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-xs font-bold text-primary">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.stage} · Day {u.day}</p>
              </div>
              <span className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                {u.xp} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tree share card ───────────────────────────────────────────────────────────

function ShareTreeCard({ stage, day, xp }: { stage: { name: string; stage: number }; day: number; xp: number }) {
  const [shared, setShared] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const shareText = `Day ${day} of my recovery. My Life Tree is a ${stage.name} (${xp} XP). Building something real. 🌱 #Stopamine`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "linear-gradient(135deg, oklch(0.28 0.10 155 / 0.5), oklch(0.22 0.06 260 / 0.6))",
        border: "1px solid oklch(0.70 0.16 150 / 0.5)",
        boxShadow: "0 0 32px -8px oklch(0.70 0.16 150 / 0.45)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-success/20 grid place-items-center text-success shrink-0">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">Show the world your tree</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Your tree is proof of real work. Most people never make it this far.
          </p>
        </div>
      </div>
      <div className="rounded-xl bg-card/60 border border-border p-3 text-xs text-muted-foreground italic leading-relaxed">
        "{shareText}"
      </div>
      <button
        onClick={handleShare}
        className="w-full h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        {shared ? "Copied to clipboard" : "Share your tree"}
      </button>
      <button
        onClick={() => setShowCommunity(!showCommunity)}
        className="w-full h-10 rounded-xl text-xs font-semibold bg-secondary/60 text-foreground border border-border inline-flex items-center justify-center gap-1.5"
      >
        <Users className="h-3.5 w-3.5" /> {showCommunity ? "Hide community" : "See community"}
      </button>
      {showCommunity && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Others grinding right now</p>
          {COMMUNITY_FEED.map((u) => (
            <div key={u.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-xs font-bold text-primary">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.stage} · Day {u.day}</p>
              </div>
              <span className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                {u.xp} XP
              </span>
            </div>
          ))}
          <p className="text-[10px] text-center text-muted-foreground pt-1">
            Full community coming soon · r/Stopamine
          </p>
        </div>
      )}
    </div>
  );
}

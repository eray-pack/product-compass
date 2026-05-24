import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Coins, Lock, CreditCard, Share2, Users, Crown, Globe } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  { id: "wolf-pack-bond",    name: "Wolf pack bond",   desc: "Unlocks pack howl animation",                   costPoints: 150, costMoney: 2.99 },
  { id: "wolf-thick-fur",    name: "Thick fur coat",   desc: "Winter coat — amber highlights on Stage 4+",    costPoints: 150, costMoney: 2.99 },
  { id: "wolf-alpha-mark",   name: "Alpha marking",    desc: "Branded alpha symbol on the wolf's shoulder",   costPoints: 250, costMoney: 4.99, pro: true },
  { id: "wolf-ancient",      name: "Ancient instinct", desc: "Permanent +10% XP from every challenge",        costPoints: 400, costMoney: 6.99, pro: true },
];

const WOLF_RANK_BY_STAGE = ["Pup", "Awakening", "Building", "Spirit", "Transcendent"];

// XP thresholds per wolf stage — 5 stages, 0-399 / 400-799 / 800-1199 / 1200-1999 / 2000+
const WOLF_XP_PREV = [0, 400, 800, 1200, 2000] as const;

function wolfXPStage(xp: number): { stage: 0|1|2|3|4; name: string; next: number } {
  if (xp < 400)  return { stage: 0, name: "Newborn Pup",        next: 400  };
  if (xp < 800)  return { stage: 1, name: "Juvenile",           next: 800  };
  if (xp < 1200) return { stage: 2, name: "Adolescent",         next: 1200 };
  if (xp < 2000) return { stage: 3, name: "Spirit Glow",        next: 2000 };
  return { stage: 4, name: "Transcendent Alpha", next: xp };
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
          <svg className="absolute" style={{ top: "22%", right: "24%" }} width="48" height="48" viewBox="0 0 48 48" fill="none">
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
            top: "22%",
            left: "24%",
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

// ── Thick Fur Coat icon SVG ───────────────────────────────────────────────────
function ThickFurSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="tf-base" x1="14" y1="28" x2="14" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#78350f" />
          <stop offset="45%"  stopColor="#b45309" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="tf-tip" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="tf-mid" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* ── Dense underfur base — broad layered arc ── */}
      <path d="M3 26 Q4 20 7 16 Q10 12 14 11 Q18 12 21 16 Q24 20 25 26Z"
        fill="url(#tf-base)" />

      {/* ── Guard hair layer 1 — mid tufts ── */}
      <path d="M5 22 Q5.5 17 7 14"   stroke="#c27a20" strokeWidth="2.0" strokeLinecap="round" fill="none"/>
      <path d="M8 20 Q8.5 15 10 12"  stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M11 18 Q11.5 13 12.5 10" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M14 17 Q14 12 14 9"   stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M17 18 Q17.5 13 18 10" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <path d="M20 20 Q21 15 22 12"  stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M22.5 22 Q23.5 17 25 14" stroke="#c27a20" strokeWidth="2.0" strokeLinecap="round" fill="none"/>

      {/* ── Fluffy tip tufts — lighter, pointed ends ── */}
      <ellipse cx="7"    cy="13.5" rx="1.5" ry="2.2" fill="url(#tf-tip)" transform="rotate(-18 7 13.5)"/>
      <ellipse cx="10"   cy="11.5" rx="1.4" ry="2.0" fill="url(#tf-tip)" transform="rotate(-8 10 11.5)"/>
      <ellipse cx="12.5" cy="9.5"  rx="1.3" ry="1.9" fill="#fde68a" transform="rotate(2 12.5 9.5)"/>
      <ellipse cx="14"   cy="8.5"  rx="1.4" ry="2.1" fill="url(#tf-tip)"/>
      <ellipse cx="15.5" cy="9.5"  rx="1.3" ry="1.9" fill="#fde68a" transform="rotate(-2 15.5 9.5)"/>
      <ellipse cx="18"   cy="11"   rx="1.4" ry="2.0" fill="url(#tf-tip)" transform="rotate(8 18 11)"/>
      <ellipse cx="21"   cy="13"   rx="1.5" ry="2.2" fill="url(#tf-tip)" transform="rotate(18 21 13)"/>

      {/* ── Inner mane fringe — second layer ── */}
      <path d="M8.5 19 Q9 15.5 10.5 13"  stroke="#fbbf24" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.70"/>
      <path d="M13 18 Q13 14 13.5 11.5"  stroke="#fbbf24" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M17 18 Q17.5 14 18 12"    stroke="#fbbf24" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M19.5 19 Q21 15.5 22 13"  stroke="#fbbf24" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.70"/>

      {/* ── Specular sheen across the coat ── */}
      <path d="M9 18 Q14 14 20 17" stroke="rgba(255,236,153,0.32)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Thick Fur Coat badge (wolf-thick-fur item only) ───────────────────────────
function ThickFurBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // Drifting spark micro-particles — 12 distributed around the badge
  const sparks = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 + 8) * Math.PI) / 180;
    const r = i % 3 === 0 ? 28 : 24;
    return {
      x: 36 + r * Math.cos(a) - 1.5,
      y: 36 + r * Math.sin(a) - 1.5,
      big: i % 4 === 0,
      bright: i % 3 === 0,
      delay: i * 0.18,
    };
  });

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer amber-golden aura ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.52, 1], opacity: [0.62, 0.10, 0.62] }}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -14, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(245,158,11,0.78) 0%, rgba(180,83,9,0.38) 40%, transparent 68%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Warm secondary halo ring ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.88, 1.62, 0.88], opacity: [0.38, 0, 0.38] }}
        transition={{ duration: 3.4, ease: "easeOut", repeat: Infinity, delay: 0.75 }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: "1.5px solid rgba(251,191,36,0.55)",
          pointerEvents: "none",
        }}
      />

      {/* ── Slowly drifting spark micro-particles ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {sparks.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.18, 0.90, 0.18], scale: [0.4, 1.4, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: p.delay }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.0 : 1.8,
              height: p.big ? 3.0 : 1.8,
              borderRadius: "50%",
              background: p.bright ? "#fde68a" : "#f59e0b",
              boxShadow: `0 0 5px 2px rgba(251,191,36,0.72)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — dark mahogany chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #1c1005 0%, #090602 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(245,158,11,0.68)`,
            `0 0 0 3.5px rgba(245,158,11,0.16)`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 32px 10px rgba(245,158,11,${canAfford && !owned ? "0.48" : "0.20"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner amber nebula */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.28, 0.60, 0.28], scale: [0.70, 1.10, 0.70] }}
          transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 55%, rgba(251,191,36,0.68) 0%, rgba(180,83,9,0.32) 42%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "linear", repeatDelay: 3.6 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,220,100,0.24) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Fur icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
        >
          <ThickFurSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Alpha Marking icon SVG ─────────────────────────────────────────────────────
function AlphaMarkSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="am-brand" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fff7ed" />
          <stop offset="30%"  stopColor="#fb923c" />
          <stop offset="65%"  stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="am-glow" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(251,146,60,0.55)" />
          <stop offset="100%" stopColor="rgba(234,88,12,0)" />
        </linearGradient>
        <filter id="am-ember">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Outer brand scar / char ring ── */}
      <circle cx="14" cy="14" r="12.5" fill="none"
        stroke="rgba(124,45,18,0.55)" strokeWidth="1.2" strokeDasharray="3 2"/>

      {/* ── Alpha rune — stylised Α with tribal serifs ── */}
      {/* Left leg */}
      <path d="M6 24 L14 4 L22 24" stroke="url(#am-brand)" strokeWidth="3.0" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Crossbar */}
      <path d="M9.5 17 L18.5 17" stroke="url(#am-brand)" strokeWidth="2.4" strokeLinecap="round"/>

      {/* ── Tribal serifs on feet ── */}
      <path d="M4.5 24 L7.5 24" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20.5 24 L23.5 24" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Apex crown ticks */}
      <path d="M14 4 L12.5 6.5" stroke="#fff7ed" strokeWidth="1.2" strokeLinecap="round" opacity="0.70"/>
      <path d="M14 4 L15.5 6.5" stroke="#fff7ed" strokeWidth="1.2" strokeLinecap="round" opacity="0.70"/>

      {/* ── Inner ember glow behind the rune ── */}
      <path d="M6 24 L14 4 L22 24" stroke="rgba(251,146,60,0.28)" strokeWidth="6.0" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#am-ember)"/>

      {/* ── Hot-spot specular on apex ── */}
      <circle cx="14" cy="5" r="1.5" fill="rgba(255,247,237,0.75)"/>
      {/* Char marks — irregular scorch lines */}
      <path d="M10 20 Q11 19 12 20" stroke="rgba(124,45,18,0.65)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      <path d="M16 20 Q17 19 18 20" stroke="rgba(124,45,18,0.65)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Alpha Marking badge (wolf-alpha-mark item only) ───────────────────────────
function AlphaMarkBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // Lava/ember burst particles — two rings for intensity
  const particles = [
    ...Array.from({ length: 8 }, (_, i) => {
      const a = ((i * 45 + 5) * Math.PI) / 180;
      return { x: 36 + 30 * Math.cos(a) - 1.5, y: 36 + 30 * Math.sin(a) - 1.5, big: true,  bright: i % 2 === 0, delay: i * 0.16 };
    }),
    ...Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 + 22) * Math.PI) / 180;
      return { x: 36 + 20 * Math.cos(a) - 1.5, y: 36 + 20 * Math.sin(a) - 1.5, big: false, bright: i % 2 !== 0, delay: i * 0.22 };
    }),
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer searing lava glow ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.70, 1], opacity: [0.72, 0.08, 0.72] }}
        transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(251,146,60,0.88) 0%, rgba(234,88,12,0.48) 35%, transparent 65%)`,
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Second hard pulse ring — neon orange ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.75, 1.80, 0.75], opacity: [0.50, 0, 0.50] }}
        transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity, delay: 0.55 }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: "2px solid rgba(251,146,60,0.68)",
          boxShadow: "0 0 8px 2px rgba(234,88,12,0.45)",
          pointerEvents: "none",
        }}
      />

      {/* ── Third slow ember ring ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.90, 1.50, 0.90], opacity: [0.28, 0, 0.28] }}
        transition={{ duration: 2.8, ease: "easeOut", repeat: Infinity, delay: 1.1 }}
        style={{
          position: "absolute", inset: -6, borderRadius: "50%",
          border: "1px solid rgba(234,88,12,0.40)",
          pointerEvents: "none",
        }}
      />

      {/* ── Lava / ember particles on two rings ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.20, 1.0, 0.20], scale: [0.4, 1.5, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: p.delay }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2.2,
              height: p.big ? 3.5 : 2.2,
              borderRadius: "50%",
              background: p.bright ? "#fb923c" : "#ea580c",
              boxShadow: `0 0 6px 2px rgba(251,146,60,0.80)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — scorched dark chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #1e0a02 0%, #080300 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.16)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.08)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(251,146,60,0.80)`,
            `0 0 0 3.5px rgba(234,88,12,0.22)`,
            "0 6px 22px rgba(0,0,0,0.92)",
            `0 0 38px 14px rgba(234,88,12,${canAfford && !owned ? "0.65" : "0.26"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner lava-core nebula */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.65, 1.15, 0.65] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 55%, rgba(251,146,60,0.80) 0%, rgba(234,88,12,0.42) 38%, transparent 65%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Hot glint sweep — faster for intensity */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear", repeatDelay: 2.0 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(255,180,80,0.30) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Alpha rune icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.09, 1], opacity: [0.90, 1, 0.90] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        >
          <AlphaMarkSVG />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Ancient Instinct icon SVG ─────────────────────────────────────────────────
function AncientInstinctSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <defs>
        <radialGradient id="ai-pad" cx="50%" cy="55%" r="52%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#7c3aed" />
          <stop offset="45%"  stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1e0a3c" />
        </radialGradient>
        <radialGradient id="ai-toe" cx="50%" cy="45%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <radialGradient id="ai-eye" cx="50%" cy="40%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#d1fae5" />
          <stop offset="35%"  stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
        <filter id="ai-glow">
          <feGaussianBlur stdDeviation="0.9" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Main paw pad ── */}
      <path d="M7 16 Q6 11 9 9 Q11 7.5 14 8 Q17 7.5 19 9 Q22 11 21 16 Q20 21 17 23 Q15 24.5 11 23 Q8 21 7 16Z"
        fill="url(#ai-pad)" />

      {/* ── Runic carving lines across the pad ── */}
      <path d="M10 13 L14 11 L18 13" stroke="rgba(167,139,250,0.55)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      <path d="M11 17 L14 15.5 L17 17" stroke="rgba(167,139,250,0.50)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      <path d="M14 11 L14 20" stroke="rgba(167,139,250,0.40)" strokeWidth="0.7" strokeLinecap="round" fill="none"/>

      {/* ── Glowing primal eye at center of pad ── */}
      {/* Eye white / sclera glow */}
      <ellipse cx="14" cy="15.5" rx="3.8" ry="2.6" fill="rgba(16,185,129,0.18)" filter="url(#ai-glow)"/>
      {/* Iris */}
      <ellipse cx="14" cy="15.5" rx="2.8" ry="1.9" fill="url(#ai-eye)" />
      {/* Vertical slit pupil */}
      <ellipse cx="14" cy="15.5" rx="0.75" ry="1.7" fill="#030c07" />
      {/* Eye specular */}
      <ellipse cx="13.2" cy="14.5" rx="0.9" ry="0.55" fill="rgba(209,250,229,0.80)" transform="rotate(-20 13.2 14.5)"/>
      {/* Runic ring around eye */}
      <ellipse cx="14" cy="15.5" rx="2.8" ry="1.9" fill="none"
        stroke="rgba(16,185,129,0.55)" strokeWidth="0.6" strokeDasharray="2.2 1.4"/>

      {/* ── Toe pads — four surrounding the main pad ── */}
      <ellipse cx="9"  cy="8.5"  rx="2.0" ry="1.6" fill="url(#ai-toe)" transform="rotate(-18 9 8.5)"/>
      <ellipse cx="12" cy="6.5"  rx="2.0" ry="1.6" fill="url(#ai-toe)" transform="rotate(-6 12 6.5)"/>
      <ellipse cx="16" cy="6.5"  rx="2.0" ry="1.6" fill="url(#ai-toe)" transform="rotate(6 16 6.5)"/>
      <ellipse cx="19" cy="8.5"  rx="2.0" ry="1.6" fill="url(#ai-toe)" transform="rotate(18 19 8.5)"/>

      {/* ── Runic glyph dots on toe pads ── */}
      <circle cx="9"  cy="8.5"  r="0.65" fill="rgba(167,139,250,0.80)"/>
      <circle cx="12" cy="6.5"  r="0.65" fill="rgba(16,185,129,0.80)"/>
      <circle cx="16" cy="6.5"  r="0.65" fill="rgba(167,139,250,0.80)"/>
      <circle cx="19" cy="8.5"  r="0.65" fill="rgba(16,185,129,0.80)"/>

      {/* ── Pad specular sheen ── */}
      <ellipse cx="11" cy="13" rx="2.8" ry="1.5" fill="rgba(124,58,237,0.30)" transform="rotate(-15 11 13)"/>
    </svg>
  );
}

// ── Ancient Instinct badge (wolf-ancient item only) ───────────────────────────
function AncientInstinctBadge({ canAfford, owned }: { canAfford: boolean; owned: boolean }) {
  // Mystic stardust — two rings, alternating purple / emerald
  const stardust = [
    ...Array.from({ length: 9 }, (_, i) => {
      const a = ((i * 40 + 6)  * Math.PI) / 180;
      return { x: 36 + 30 * Math.cos(a) - 1.5, y: 36 + 30 * Math.sin(a) - 1.5, big: i % 3 === 0, purple: i % 2 === 0, delay: i * 0.20 };
    }),
    ...Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 + 18) * Math.PI) / 180;
      return { x: 36 + 19 * Math.cos(a) - 1.5, y: 36 + 19 * Math.sin(a) - 1.5, big: false,    purple: i % 2 !== 0, delay: i * 0.28 };
    }),
  ];

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>

      {/* ── Outer cosmic purple aura ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.55, 1], opacity: [0.60, 0.08, 0.60] }}
        transition={{ duration: 5.0, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", inset: -16, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,58,237,0.75) 0%, rgba(4,120,87,0.30) 46%, transparent 68%)`,
          filter: "blur(11px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Emerald counter-pulse ring ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.82, 1.68, 0.82], opacity: [0.42, 0, 0.42] }}
        transition={{ duration: 5.0, ease: "easeOut", repeat: Infinity, delay: 1.2 }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: "1.5px solid rgba(16,185,129,0.55)",
          boxShadow: "0 0 6px 1px rgba(16,185,129,0.30)",
          pointerEvents: "none",
        }}
      />

      {/* ── Purple inner shimmer ring ── */}
      <motion.div
        aria-hidden
        animate={{ scale: [0.92, 1.38, 0.92], opacity: [0.30, 0, 0.30] }}
        transition={{ duration: 3.5, ease: "easeOut", repeat: Infinity, delay: 0.6 }}
        style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: "1px solid rgba(124,58,237,0.48)",
          pointerEvents: "none",
        }}
      />

      {/* ── Mystic stardust — dual rings, slow counter-rotation ── */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {stardust.slice(0, 9).map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.15, 0.95, 0.15], scale: [0.3, 1.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: p.delay }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: p.big ? 3.5 : 2.0,
              height: p.big ? 3.5 : 2.0,
              borderRadius: "50%",
              background: p.purple ? "#a78bfa" : "#34d399",
              boxShadow: p.purple
                ? `0 0 6px 2px rgba(167,139,250,0.80)`
                : `0 0 6px 2px rgba(52,211,153,0.80)`,
            }}
          />
        ))}
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ rotate: -360 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: -12, pointerEvents: "none" }}
      >
        {stardust.slice(9).map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.12, 0.88, 0.12], scale: [0.3, 1.4, 0.3] }}
            transition={{ repeat: Infinity, duration: 4.0, ease: "easeInOut", delay: p.delay }}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              width: 2.2,
              height: 2.2,
              borderRadius: "50%",
              background: p.purple ? "#c4b5fd" : "#6ee7b7",
              boxShadow: p.purple
                ? `0 0 5px 1.5px rgba(196,181,253,0.75)`
                : `0 0 5px 1.5px rgba(110,231,183,0.75)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Main badge circle — void-dark chrome ── */}
      <motion.div
        animate={canAfford && !owned ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 5.0, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "relative", width: 48, height: 48, borderRadius: "50%",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          background: "radial-gradient(circle at 38% 30%, #100820 0%, #040108 100%)",
          boxShadow: [
            "inset 0 2px 0 rgba(255,255,255,0.14)",
            "inset 0 -2px 0 rgba(0,0,0,0.95)",
            "inset 2px 0 0 rgba(255,255,255,0.07)",
            "inset -2px 0 0 rgba(0,0,0,0.70)",
            `0 0 0 1.5px rgba(124,58,237,0.65)`,
            `0 0 0 3.5px rgba(16,185,129,0.16)`,
            "0 6px 22px rgba(0,0,0,0.94)",
            `0 0 34px 12px rgba(124,58,237,${canAfford && !owned ? "0.48" : "0.20"})`,
          ].join(", "),
          opacity: owned ? 0.65 : 1,
        }}
      >
        {/* Inner cosmic nebula — purple core fading to emerald edge */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.28, 0.62, 0.28], scale: [0.68, 1.12, 0.68] }}
          transition={{ duration: 5.0, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 48% 52%, rgba(124,58,237,0.72) 0%, rgba(4,120,87,0.32) 45%, transparent 68%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Emerald counter-shimmer at the edge */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.10, 0.38, 0.10], rotate: [0, 180, 360] }}
          transition={{ duration: 8.0, ease: "linear", repeat: Infinity }}
          style={{
            position: "absolute", inset: 4, borderRadius: "50%",
            background: `conic-gradient(from 0deg, transparent 0%, rgba(16,185,129,0.22) 30%, transparent 60%, rgba(124,58,237,0.18) 85%, transparent 100%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />
        {/* Glint sweep */}
        <motion.div
          aria-hidden
          animate={{ x: ["-52px", "52px"] }}
          transition={{ repeat: Infinity, duration: 5.0, ease: "linear", repeatDelay: 5.5 }}
          style={{
            position: "absolute", top: "-8px", left: "-8px",
            width: "22px", height: "64px",
            background: "linear-gradient(108deg, transparent 0%, rgba(180,140,255,0.22) 50%, transparent 100%)",
            filter: "blur(2.5px)", transform: "rotate(22deg)",
            pointerEvents: "none", zIndex: 2,
          }}
        />
        {/* Paw icon */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.88, 1, 0.88] }}
          transition={{ duration: 5.0, ease: "easeInOut", repeat: Infinity }}
        >
          <AncientInstinctSVG />
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
        ) : item.id === "wolf-pack-bond" ? (
          <WolfPackBondBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "wolf-thick-fur" ? (
          <ThickFurBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "wolf-alpha-mark" ? (
          <AlphaMarkBadge canAfford={canAfford} owned={owned} />
        ) : item.id === "wolf-ancient" ? (
          <AncientInstinctBadge canAfford={canAfford} owned={owned} />
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
    wolfStage.stage >= 4
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

  // ── Dev mode (triple-tap "Your Companion") ───────────────────────────────
  const [wolfDevMode, setWolfDevMode] = useState(false);
  const wolfDevTapCount = useRef(0);
  const wolfDevTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleWolfDevTap() {
    wolfDevTapCount.current += 1;
    if (wolfDevTapTimer.current) clearTimeout(wolfDevTapTimer.current);
    wolfDevTapTimer.current = setTimeout(() => { wolfDevTapCount.current = 0; }, 600);
    if (wolfDevTapCount.current >= 3) {
      wolfDevTapCount.current = 0;
      setWolfDevMode((v) => !v);
    }
  }
  const WOLF_XP_STAGES = [
    { label: "🐺 Seed",       xp: 0    },
    { label: "🐾 Pup",        xp: 400  },
    { label: "🌑 Adolescent", xp: 800  },
    { label: "✨ Ancient",    xp: 2000 },
    { label: "⚡ Alpha",      xp: 1600 },
  ];

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <div onClick={handleWolfDevTap} style={{ cursor: "default", userSelect: "none", display: "inline-block" }}>
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 16, fontWeight: 700, fontStyle: "italic", color: "#C9A84C", letterSpacing: 0, margin: 0 }}>Your Companion</p>
        </div>
        <h1 className="mt-2 text-3xl font-bold">Your Wolf</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This wolf is yours. Every clean day makes it stronger.
        </p>
      </header>

      {/* ── Dev panel (triple-tap "Your Companion" to toggle) ────────────── */}
      {wolfDevMode && (
        <div style={{
          margin: "8px 16px 0",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,80,80,0.35)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#ff5555", textTransform: "uppercase" }}>
              🛠 Dev Mode
            </span>
            <button onClick={() => setWolfDevMode(false)} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>

          {/* Stage jumper */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Jump to stage</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {WOLF_XP_STAGES.map((s) => {
              const active = state.treeXP >= s.xp && (s.xp === 2000 ? state.treeXP >= 2000 : state.treeXP < s.xp + 400);
              return (
                <button key={s.xp} onClick={() => update(() => ({ treeXP: s.xp }))}
                  style={{
                    fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                    background: active ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.06)",
                    border: active ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(255,255,255,0.12)",
                    color: active ? "#C9A84C" : "rgba(255,255,255,0.7)",
                    fontWeight: active ? 700 : 400,
                  }}>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Credits */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Credits</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            {[25, 100, 500].map((n) => (
              <button key={n} onClick={() => update((s) => ({ points: s.points + n }))}
                style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#C9A84C" }}>
                +{n}
              </button>
            ))}
            <button onClick={() => update(() => ({ points: 0 }))}
              style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff7777" }}>
              Reset
            </button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{state.points} credits</span>
          </div>

          {/* Upgrades */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Upgrades</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {WOLF_UPGRADES.map((u) => {
              const owned = state.treeUnlocks.includes(u.id);
              return (
                <button key={u.id} onClick={() => update((s) => ({
                  treeUnlocks: owned ? s.treeUnlocks.filter((x) => x !== u.id) : [...s.treeUnlocks, u.id],
                }))}
                  style={{
                    fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                    background: owned ? "rgba(63,184,106,0.18)" : "rgba(255,255,255,0.06)",
                    border: owned ? "1px solid rgba(63,184,106,0.5)" : "1px solid rgba(255,255,255,0.12)",
                    color: owned ? "#3fb86a" : "rgba(255,255,255,0.55)",
                  }}>
                  {owned ? "✓ " : ""}{u.name}
                </button>
              );
            })}
          </div>

          {/* PRO + Reset all */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => update((s) => ({ isPremium: !s.isPremium }))}
              style={{
                fontSize: 11, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                background: state.isPremium ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
                border: state.isPremium ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.15)",
                color: state.isPremium ? "#C9A84C" : "rgba(255,255,255,0.55)",
                fontWeight: 600,
              }}>
              {state.isPremium ? "✓ PRO" : "PRO off"}
            </button>
            <button onClick={() => update(() => ({ treeXP: 0, points: 0, treeUnlocks: [], lastDailyClaimDate: "" }))}
              style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff7777", fontWeight: 600 }}>
              Reset all
            </button>
          </div>
        </div>
      )}


      {/* Wolf scene */}
      <section className="mt-4 relative" style={{ height: 380 }}>

        {/* Circular wolf scene — landscape + wolf fully contained */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div style={{ position: "relative", width: 280, height: 280, flexShrink: 0 }}>

            {/* Atmospheric halo — diffuse gold glow behind circle */}
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                top: "50%", left: "50%", marginTop: -170, marginLeft: -170,
                width: 340, height: 340, borderRadius: "50%",
                background: "radial-gradient(circle, transparent 38%, rgba(196,135,58,0.18) 52%, rgba(196,135,58,0.08) 66%, transparent 80%)",
                pointerEvents: "none", zIndex: 1,
              }}
              animate={{ scale: [1, 1.015, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
            />
            {/* Primary crisp gold ring */}
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                top: "50%", left: "50%", marginTop: -148, marginLeft: -148,
                width: 296, height: 296, borderRadius: "50%",
                border: "2.5px solid rgba(196,135,58,0.88)",
                filter: "blur(1px)",
                boxShadow: "0 0 16px 6px rgba(196,135,58,0.45), 0 0 36px 14px rgba(196,135,58,0.18)",
                pointerEvents: "none", zIndex: 5,
              }}
              animate={{ scale: [1, 1.012, 1], rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Outer softer gold ring */}
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                top: "50%", left: "50%", marginTop: -163, marginLeft: -163,
                width: 326, height: 326, borderRadius: "50%",
                border: "1px solid rgba(196,135,58,0.28)",
                filter: "blur(2px)",
                pointerEvents: "none", zIndex: 5,
              }}
              animate={{ scale: [1, 1.008, 1], rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />

            {/* Hard circle — WolfBackground + wolf clipped inside */}
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: "50%", overflow: "hidden",
              zIndex: 2,
            }}>
              <WolfBackground />
              <div style={{ position: "absolute", inset: 0, background: health.sceneOverlay, pointerEvents: "none" }} />
              {/* Wolf — bottom-anchored so it stands on the ground */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                zIndex: 2,
                filter: health.companionFilter, transition: "filter 1.2s ease",
              }}>
                <div style={{ width: 300, height: 340 }}>
                  <CompanionAvatar type="wolf" day={day} stage={wolfStage.stage} relapseCount={state.relapses.length} className="w-full h-full" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* XP + stats */}
      <section className="px-6 mt-2">
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(201,168,76,0.12)", borderRadius: 20, padding: "16px 18px" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">{wolfStage.name} · {WOLF_RANK_BY_STAGE[wolfStage.stage]}</span>
            <span className="text-muted-foreground tabular-nums">{state.treeXP} / {wolfStage.next} XP</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C9A84C, #E8C06A)" }} />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs text-muted-foreground">
              Day {day} · {state.treeXP} / {wolfStage.next} XP
            </p>
            <p className="text-xs" style={{ color: health.color, opacity: 0.85 }}>{health.label} · {daysThisWeek}/7</p>
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

      {/* ── Companion Switcher ── */}
      <CompanionSwitcher
        isPremium={state.isPremium}
        currentCompanion="wolf"
        onSwitchToTree={() => update({ companion: "tree" })}
        onSwitchToWolf={() => {}}
      />
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

  const [shopFeedback, setShopFeedback] = useState<string | null>(null);

  // ── Dev mode (triple-tap "Sacred Ground") ─────────────────────────────────
  const [devMode, setDevMode] = useState(false);
  const devTapCount = useRef(0);
  const devTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleDevTap() {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 600);
    if (devTapCount.current >= 3) {
      devTapCount.current = 0;
      setDevMode((v) => !v);
    }
  }
  const XP_STAGES = [
    { label: "🌱 Seed",    xp: 0    },
    { label: "🌿 Sprout",  xp: 100  },
    { label: "🌳 Sapling", xp: 300  },
    { label: "🌲 Young",   xp: 700  },
    { label: "💪 Strong",  xp: 1500 },
    { label: "⚡ Ancient", xp: 3000 },
  ];

  // Scroll to shop section when navigated via credits chip (#grow-your-tree)
  useEffect(() => {
    if (window.location.hash === "#grow-your-tree") {
      const el = document.getElementById("grow-your-tree");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    }
  }, []);

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
      <header className="px-6 pt-4">
        <div onClick={handleDevTap} style={{ cursor: "default", userSelect: "none", display: "inline-block" }}>
          <SectionTitle>Sacred Ground</SectionTitle>
        </div>
        <h1 className="mt-0.5 text-2xl font-bold">Your Life Tree</h1>
      </header>

      {/* ── Dev panel (triple-tap "Sacred Ground" to toggle) ─────────────── */}
      {devMode && (
        <div style={{
          margin: "8px 16px 0",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,80,80,0.35)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#ff5555", textTransform: "uppercase" }}>
              🛠 Dev Mode
            </span>
            <button onClick={() => setDevMode(false)} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>

          {/* XP stage jumper */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Jump to stage</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {XP_STAGES.map((s) => (
              <button key={s.xp} onClick={() => update(() => ({ treeXP: s.xp }))}
                style={{
                  fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                  background: state.treeXP === s.xp ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.06)",
                  border: state.treeXP === s.xp ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  color: state.treeXP === s.xp ? "#C9A84C" : "rgba(255,255,255,0.7)",
                  fontWeight: state.treeXP === s.xp ? 700 : 400,
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Credits */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Credits</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[25, 100, 500].map((n) => (
              <button key={n} onClick={() => update((s) => ({ points: s.points + n }))}
                style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#C9A84C" }}>
                +{n}
              </button>
            ))}
            <button onClick={() => update(() => ({ points: 0 }))}
              style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff7777" }}>
              Reset
            </button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", alignSelf: "center", marginLeft: 4 }}>{state.points} credits</span>
          </div>

          {/* Upgrades toggle */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Upgrades</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {UPGRADES.map((u) => {
              const owned = state.treeUnlocks.includes(u.id);
              return (
                <button key={u.id} onClick={() => update((s) => ({
                  treeUnlocks: owned ? s.treeUnlocks.filter((x) => x !== u.id) : [...s.treeUnlocks, u.id],
                }))}
                  style={{
                    fontSize: 11, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                    background: owned ? "rgba(63,184,106,0.18)" : "rgba(255,255,255,0.06)",
                    border: owned ? "1px solid rgba(63,184,106,0.5)" : "1px solid rgba(255,255,255,0.12)",
                    color: owned ? "#3fb86a" : "rgba(255,255,255,0.55)",
                  }}>
                  {owned ? "✓ " : ""}{u.name}
                </button>
              );
            })}
          </div>

          {/* PRO + Reset all */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => update((s) => ({ isPremium: !s.isPremium }))}
              style={{
                fontSize: 11, padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                background: state.isPremium ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
                border: state.isPremium ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(255,255,255,0.15)",
                color: state.isPremium ? "#C9A84C" : "rgba(255,255,255,0.55)",
                fontWeight: 600,
              }}>
              {state.isPremium ? "✓ PRO" : "PRO off"}
            </button>
            <button onClick={() => update(() => ({ treeXP: 0, points: 0, treeUnlocks: [], lastDailyClaimDate: "" }))}
              style={{ fontSize: 11, padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff7777", fontWeight: 600 }}>
              Reset all
            </button>
          </div>
        </div>
      )}

      {/* Tree scene — full-bleed, no card frame */}
      <section className="mt-1 relative" style={{ height: 380 }}>
        {/* Bottom fade — sky bleeds into page background */}
        <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
          style={{ height: 100, background: "linear-gradient(to bottom, transparent, #080604)" }} />

        {/* Tree visual */}
        {/* Cartoon: oval scene — sky inside circle, edges fade out into black */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {/* Single 300px anchor — sized for iPhone, rings + oval positioned relative to this */}
            <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>

              {/* ── Badge-style glow ring ── */}
              {(() => {
                const glowBase = (
                  healthState === "thriving"  ? "rgba(63,184,106,"  :
                  healthState === "growing"   ? "rgba(143,190,90,"  :
                  healthState === "fading"    ? "rgba(201,168,76,"  :
                                               "rgba(122,106,90,"
                );
                return (
                  <>
                    {/* Atmospheric halo — diffuse glow sitting outside the circle */}
                    <motion.div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "50%", left: "50%", marginTop: -188, marginLeft: -188,
                        width: 376, height: 376, borderRadius: "50%",
                        background: `radial-gradient(circle, transparent 38%, ${glowBase}0.22) 52%, ${glowBase}0.10) 66%, transparent 80%)`,
                        pointerEvents: "none", zIndex: 3,
                      }}
                      animate={{ scale: [1, 1.015, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                    />
                    {/* Primary crisp ring — outside the circle */}
                    <motion.div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "50%", left: "50%", marginTop: -172, marginLeft: -172,
                        width: 344, height: 344, borderRadius: "50%",
                        border: `2.5px solid ${glowBase}0.88)`,
                        filter: "blur(1.5px)",
                        boxShadow: `0 0 16px 6px ${glowBase}0.55), 0 0 36px 14px ${glowBase}0.20)`,
                        pointerEvents: "none", zIndex: 3,
                      }}
                      animate={{ scale: [1, 1.012, 1], rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    />
                    {/* Outer softer ring */}
                    <motion.div
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "50%", left: "50%", marginTop: -190, marginLeft: -190,
                        width: 380, height: 380, borderRadius: "50%",
                        border: `1px solid ${glowBase}0.30)`,
                        filter: "blur(2px)",
                        pointerEvents: "none", zIndex: 3,
                      }}
                      animate={{ scale: [1, 1.008, 1], rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                    />
                  </>
                );
              })()}

              {/* Oval — masked sky + tree, fills the 300px anchor */}
              <div style={{
                position: "absolute", inset: 0,
                maskImage: "radial-gradient(ellipse at center, black 62%, transparent 86%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 62%, transparent 86%)",
                zIndex: 2,
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
          </div>
      </section>

      {/* XP + stats */}
      <section className="px-6 mt-2">
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderTop: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 20, padding: "16px 18px",
        }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{stage.name}</span>
              <span style={{ color: "#C9A84C", opacity: 0.65, fontSize: 10 }}>· {RANK_BY_STAGE[stage.stage]}</span>
            </div>
            <span className="text-muted-foreground tabular-nums">Day {day} · {state.treeXP} / {stage.next} XP</span>
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
              {health.emoji} {health.label} · {daysThisWeek}/7
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

      {/* Upgrades — etched glass shop (also contains daily claim) */}
      <section id="grow-your-tree" className="px-6 mt-6">
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

        {/* Daily credit claim */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const claimed = state.lastDailyClaimDate === today;
          return (
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={claimed}
              onClick={() => {
                if (claimed) return;
                update((s) => ({ points: s.points + 25, lastDailyClaimDate: today }));
              }}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: 16, marginBottom: 12,
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
          );
        })()}
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

      {/* ── Companion Switcher ── */}
      <CompanionSwitcher
        isPremium={state.isPremium}
        currentCompanion="tree"
        onSwitchToTree={() => {}}
        onSwitchToWolf={() => {
          if (!state.isPremium) { triggerPaywall(); return; }
          update({ companion: "wolf" });
        }}
      />
    </PageShell>
  );
}

// ── Companion Switcher — sparkle particles (deterministic, no jitter) ─────────
const CS_SPARKLES = [
  { x: 8,  y: 14, size: 1.8, delay: 0.0, dur: 7.5 },
  { x: 28, y: 6,  size: 1.4, delay: 1.6, dur: 8.8 },
  { x: 52, y: 10, size: 2.0, delay: 0.8, dur: 7.0 },
  { x: 75, y: 8,  size: 1.6, delay: 2.4, dur: 9.2 },
  { x: 92, y: 20, size: 1.5, delay: 0.3, dur: 8.0 },
  { x: 15, y: 52, size: 1.8, delay: 3.5, dur: 7.5 },
  { x: 42, y: 60, size: 1.6, delay: 1.1, dur: 9.0 },
  { x: 68, y: 55, size: 2.0, delay: 4.2, dur: 8.0 },
  { x: 85, y: 68, size: 1.4, delay: 2.0, dur: 7.8 },
  { x: 5,  y: 82, size: 1.7, delay: 5.0, dur: 8.5 },
  { x: 35, y: 88, size: 1.5, delay: 1.8, dur: 9.5 },
  { x: 60, y: 92, size: 1.8, delay: 0.5, dur: 7.2 },
];

// ── Companion Switcher ────────────────────────────────────────────────────────
function CompanionSwitcher({
  isPremium,
  currentCompanion,
  onSwitchToTree,
  onSwitchToWolf,
}: {
  isPremium: boolean;
  currentCompanion: "tree" | "wolf";
  onSwitchToTree: () => void;
  onSwitchToWolf: () => void;
}) {
  const treeActive = currentCompanion === "tree";
  const wolfActive = currentCompanion === "wolf";

  return (
    <>
      <style>{`
        /* Outer border wrapper pulses between dim and bright */
        @keyframes cs-border-pulse {
          0%, 100% { opacity: 0.52; }
          50%       { opacity: 1.00; }
        }
        /* Soft halo behind the whole card breathes */
        @keyframes cs-halo-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50%       { opacity: 1.00; transform: scale(1.04); }
        }
        /* Gold sparkle particles float upward and fade */
        @keyframes cs-sparkle {
          0%   { transform: translateY(0px) scale(1.0); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-20px) scale(0.75); opacity: 0; }
        }
        /* ACTIVE badge ripple rings expand and dissolve */
        @keyframes cs-ripple {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.70; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        /* Card border glimmer sweep */
        @keyframes cs-glimmer {
          0%   { opacity: 0.38; }
          50%  { opacity: 0.80; }
          100% { opacity: 0.38; }
        }
      `}</style>

      <section className="px-6 mt-4 pb-4">

        {/* ── Outer ambient halo ── */}
        <div style={{ position: "relative" }}>
          <div aria-hidden style={{
            position: "absolute", inset: -18, borderRadius: 40,
            background: "radial-gradient(ellipse, rgba(201,168,76,0.16) 0%, transparent 68%)",
            filter: "blur(24px)", pointerEvents: "none",
            animation: "cs-halo-pulse 4.0s ease-in-out infinite",
          }} />

          {/* ── Laser-etched gradient border wrapper ── */}
          <div style={{
            padding: 1.5, borderRadius: 24,
            background: "linear-gradient(135deg, rgba(212,175,55,0.80) 0%, rgba(140,100,28,0.35) 28%, rgba(201,168,76,0.75) 50%, rgba(100,70,18,0.30) 72%, rgba(220,188,80,0.80) 100%)",
            animation: "cs-border-pulse 3.6s ease-in-out infinite",
          }}>

            {/* ── Inner card — midnight gradient + grid + sparkles ── */}
            <div style={{
              background: "radial-gradient(ellipse at 50% 30%, #0c0812 0%, #07050e 55%, #020104 100%)",
              borderRadius: 22, padding: "20px 18px 20px",
              position: "relative", overflow: "hidden",
            }}>

              {/* Gold vector grid overlay */}
              <svg aria-hidden style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                opacity: 0.06, pointerEvents: "none",
              }}>
                <defs>
                  <pattern id="cs-grid" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="44" y2="44" stroke="#C9A84C" strokeWidth="0.5"/>
                    <line x1="44" y1="0" x2="0" y2="44" stroke="#C9A84C" strokeWidth="0.35"/>
                    <circle cx="0"  cy="0"  r="1.3" fill="#C9A84C" opacity="0.9"/>
                    <circle cx="44" cy="0"  r="1.3" fill="#C9A84C" opacity="0.9"/>
                    <circle cx="0"  cy="44" r="1.3" fill="#C9A84C" opacity="0.9"/>
                    <circle cx="44" cy="44" r="1.3" fill="#C9A84C" opacity="0.9"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cs-grid)"/>
              </svg>

              {/* Sparkle particles */}
              {CS_SPARKLES.map((s, i) => (
                <div key={i} aria-hidden style={{
                  position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
                  width: s.size, height: s.size, borderRadius: "50%",
                  background: i % 4 === 0 ? "#8ab4f8" : "#ffd700",
                  boxShadow: i % 4 === 0
                    ? "0 0 5px 2px rgba(138,180,248,0.65)"
                    : "0 0 6px 2px rgba(255,215,0,0.65)",
                  animation: `cs-sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                  pointerEvents: "none",
                }} />
              ))}

              {/* ── Header text ── */}
              <p style={{
                position: "relative", zIndex: 1,
                fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase",
                color: "#C9A84C", marginBottom: 5, fontFamily: "DM Sans, sans-serif",
                textShadow: "0 0 16px rgba(201,168,76,0.45)",
              }}>
                Companion
              </p>
              <h3 style={{
                position: "relative", zIndex: 1,
                fontSize: 17, fontWeight: 700, color: "#f5ede0",
                marginBottom: 4, letterSpacing: "-0.01em", fontFamily: "DM Sans, sans-serif",
              }}>
                Choose Your Companion
              </h3>
              <p style={{
                position: "relative", zIndex: 1,
                fontSize: 12, color: "rgba(255,255,255,0.42)", marginBottom: 20,
                lineHeight: 1.55, fontFamily: "DM Sans, sans-serif",
              }}>
                Good if you want an extra one, look at your tree also.
              </p>

              {/* ── Companion cards grid ── */}
              <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

                {/* ════ Sacred Tree card ════ */}
                <motion.button
                  onClick={treeActive ? undefined : onSwitchToTree}
                  whileTap={treeActive ? {} : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  style={{
                    position: "relative", border: "none", borderRadius: 16,
                    padding: "20px 10px 14px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    cursor: treeActive ? "default" : "pointer",
                    textAlign: "center" as const,
                    /* wood-grain texture via layered CSS gradients */
                    background: treeActive
                      ? [
                          "repeating-linear-gradient(-18deg, transparent, transparent 5px, rgba(140,80,20,0.055) 5px, rgba(140,80,20,0.055) 6px)",
                          "linear-gradient(160deg, rgba(30,16,6,0.97) 0%, rgba(18,10,4,0.99) 100%)",
                        ].join(", ")
                      : [
                          "repeating-linear-gradient(-18deg, transparent, transparent 5px, rgba(100,60,15,0.04) 5px, rgba(100,60,15,0.04) 6px)",
                          "linear-gradient(160deg, rgba(20,11,4,0.95) 0%, rgba(12,7,3,0.97) 100%)",
                        ].join(", "),
                    outline: treeActive
                      ? "1.5px solid rgba(212,175,55,0.60)"
                      : "1.5px solid rgba(196,135,58,0.32)",
                    boxShadow: treeActive
                      ? "0 0 0 0.5px rgba(232,200,100,0.24), 0 0 22px rgba(201,168,76,0.18), inset 0 0 30px rgba(140,80,20,0.08)"
                      : "inset 0 0 20px rgba(100,60,15,0.05)",
                    animation: treeActive ? "cs-glimmer 4.2s ease-in-out infinite" : "none",
                  }}
                >
                  {/* ACTIVE badge + ripple rings */}
                  {treeActive && (
                    <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)" }}>
                      {/* Ripple rings */}
                      <div aria-hidden style={{
                        position: "absolute", top: "50%", left: "50%",
                        width: 28, height: 18, borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.55)",
                        animation: "cs-ripple 2.2s ease-out infinite",
                      }}/>
                      <div aria-hidden style={{
                        position: "absolute", top: "50%", left: "50%",
                        width: 28, height: 18, borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.40)",
                        animation: "cs-ripple 2.2s ease-out 0.8s infinite",
                      }}/>
                      <span style={{
                        position: "relative", zIndex: 1,
                        display: "inline-block",
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
                        color: "#050308",
                        background: "linear-gradient(135deg, #e8c96a 0%, #C4873A 50%, #d4af37 100%)",
                        borderRadius: 999, padding: "3.5px 11px", whiteSpace: "nowrap",
                        boxShadow: "0 2px 10px rgba(212,175,55,0.45)",
                      }}>
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Bonsai tree icon */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: treeActive
                      ? "radial-gradient(circle at 40% 35%, rgba(212,175,55,0.18) 0%, rgba(140,80,20,0.08) 60%, transparent 80%)"
                      : "rgba(201,168,76,0.06)",
                    border: `1px solid ${treeActive ? "rgba(212,175,55,0.35)" : "rgba(196,135,58,0.18)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="38" height="40" viewBox="0 0 38 40" fill="none">
                      <defs>
                        <linearGradient id="cs-trunk" x1="19" y1="40" x2="19" y2="10" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#8a5c20"/>
                          <stop offset="55%" stopColor="#c9a84c"/>
                          <stop offset="100%" stopColor="#e8c86a"/>
                        </linearGradient>
                        <radialGradient id="cs-leaf" cx="45%" cy="42%" r="52%">
                          <stop offset="0%" stopColor="#f0d47a"/>
                          <stop offset="60%" stopColor="#c9a84c"/>
                          <stop offset="100%" stopColor="#a07828"/>
                        </radialGradient>
                      </defs>
                      {/* Roots */}
                      <path d="M17 39 Q13 38 10 39" stroke="#8a5c20" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75"/>
                      <path d="M20 39 Q24 38 27 39" stroke="#8a5c20" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75"/>
                      <path d="M18 39 Q15 40 13 39.5" stroke="#8a5c20" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.55"/>
                      {/* Main trunk — gnarled S-curve */}
                      <path d="M19 39 Q17 33 18 27 Q16 21 19 17" stroke="url(#cs-trunk)" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
                      {/* Bark texture lines */}
                      <path d="M18 36 Q16 35.5 15.5 36" stroke="rgba(201,168,76,0.40)" strokeWidth="0.75" strokeLinecap="round" fill="none"/>
                      <path d="M18.5 31 Q20 30.5 20.5 31" stroke="rgba(201,168,76,0.35)" strokeWidth="0.70" strokeLinecap="round" fill="none"/>
                      <path d="M17.5 26 Q15.5 25.5 15 26" stroke="rgba(201,168,76,0.30)" strokeWidth="0.65" strokeLinecap="round" fill="none"/>
                      {/* Left branch */}
                      <path d="M18 23 Q12 18 7 14" stroke="url(#cs-trunk)" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
                      <path d="M7 14 Q4 10 3 7"  stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                      <path d="M7 14 Q9 11 10 8" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                      <path d="M11 18 Q8 15 6 14" stroke="#c9a84c" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.75"/>
                      {/* Right branch */}
                      <path d="M19 20 Q26 15 31 12" stroke="url(#cs-trunk)" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
                      <path d="M31 12 Q34 8 35 6"  stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                      <path d="M31 12 Q30 9 29 7"  stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                      {/* Centre upward branch */}
                      <path d="M19 19 Q19 13 19 9" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                      <path d="M19 9 Q17 6 15 4"  stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                      <path d="M19 9 Q21 6 23 4"  stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                      {/* Leaf clusters */}
                      <ellipse cx="4"  cy="7"  rx="4.5" ry="3.5" fill="url(#cs-leaf)" opacity="0.92"/>
                      <ellipse cx="2"  cy="9"  rx="2.8" ry="2.2" fill="#c9a84c"       opacity="0.70"/>
                      <ellipse cx="10" cy="8"  rx="4.0" ry="3.2" fill="url(#cs-leaf)" opacity="0.90"/>
                      <ellipse cx="7"  cy="13" rx="3.2" ry="2.6" fill="#d4a84c"       opacity="0.72"/>
                      <ellipse cx="15" cy="3"  rx="3.8" ry="3.0" fill="url(#cs-leaf)" opacity="0.93"/>
                      <ellipse cx="19" cy="2"  rx="4.8" ry="3.6" fill="url(#cs-leaf)" opacity="0.96"/>
                      <ellipse cx="23" cy="3"  rx="3.8" ry="3.0" fill="url(#cs-leaf)" opacity="0.93"/>
                      <ellipse cx="29" cy="7"  rx="3.8" ry="3.0" fill="url(#cs-leaf)" opacity="0.90"/>
                      <ellipse cx="35" cy="6"  rx="3.5" ry="2.8" fill="url(#cs-leaf)" opacity="0.92"/>
                      <ellipse cx="28" cy="9"  rx="2.6" ry="2.2" fill="#d4a84c"       opacity="0.70"/>
                      {/* Leaf shimmer highlights */}
                      <ellipse cx="18.5" cy="1.5" rx="2.8" ry="1.6" fill="rgba(255,240,180,0.36)"/>
                      <ellipse cx="4"    cy="6.5" rx="2.0" ry="1.2" fill="rgba(255,240,180,0.28)"/>
                      <ellipse cx="34.5" cy="5.5" rx="1.8" ry="1.1" fill="rgba(255,240,180,0.26)"/>
                    </svg>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", marginBottom: 2, fontFamily: "DM Sans, sans-serif" }}>
                      Sacred Tree
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(201,168,76,0.55)", fontFamily: "DM Sans, sans-serif" }}>
                      {treeActive ? "Your life tree" : "Tap to switch"}
                    </p>
                  </div>
                </motion.button>

                {/* ════ Wolf Companion card ════ */}
                <motion.button
                  onClick={wolfActive ? undefined : onSwitchToWolf}
                  whileTap={wolfActive ? {} : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  style={{
                    position: "relative", border: "none", borderRadius: 16,
                    padding: "20px 10px 14px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    cursor: wolfActive ? "default" : "pointer",
                    textAlign: "center" as const,
                    /* wolf-fur texture: diagonal strands + nebula glow */
                    background: wolfActive
                      ? [
                          "repeating-linear-gradient(-50deg, transparent, transparent 4px, rgba(60,50,35,0.07) 4px, rgba(60,50,35,0.07) 5px)",
                          "radial-gradient(ellipse at 30% 65%, rgba(30,20,70,0.35) 0%, transparent 60%)",
                          "linear-gradient(155deg, rgba(12,8,18,0.97) 0%, rgba(6,4,12,0.99) 100%)",
                        ].join(", ")
                      : isPremium
                        ? [
                            "repeating-linear-gradient(-50deg, transparent, transparent 4px, rgba(50,40,28,0.05) 4px, rgba(50,40,28,0.05) 5px)",
                            "linear-gradient(155deg, rgba(10,6,16,0.95) 0%, rgba(5,3,10,0.97) 100%)",
                          ].join(", ")
                        : "rgba(8,5,14,0.95)",
                    outline: wolfActive
                      ? "1.5px solid rgba(212,175,55,0.60)"
                      : isPremium
                        ? "1.5px solid rgba(196,135,58,0.32)"
                        : "1.5px solid rgba(255,255,255,0.10)",
                    boxShadow: wolfActive
                      ? "0 0 0 0.5px rgba(232,200,100,0.24), 0 0 22px rgba(201,168,76,0.18), inset 0 0 30px rgba(30,20,60,0.25)"
                      : "none",
                    opacity: !isPremium && !wolfActive ? 0.72 : 1,
                    animation: wolfActive ? "cs-glimmer 4.2s ease-in-out 0.6s infinite" : "none",
                  }}
                >
                  {/* ACTIVE badge + ripple (wolf active) */}
                  {wolfActive && (
                    <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)" }}>
                      <div aria-hidden style={{
                        position: "absolute", top: "50%", left: "50%",
                        width: 28, height: 18, borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.55)",
                        animation: "cs-ripple 2.2s ease-out infinite",
                      }}/>
                      <div aria-hidden style={{
                        position: "absolute", top: "50%", left: "50%",
                        width: 28, height: 18, borderRadius: 999,
                        border: "1px solid rgba(212,175,55,0.40)",
                        animation: "cs-ripple 2.2s ease-out 0.8s infinite",
                      }}/>
                      <span style={{
                        position: "relative", zIndex: 1,
                        display: "inline-block",
                        fontSize: 8, fontWeight: 800, letterSpacing: "0.18em",
                        color: "#050308",
                        background: "linear-gradient(135deg, #e8c96a 0%, #C4873A 50%, #d4af37 100%)",
                        borderRadius: 999, padding: "3.5px 11px", whiteSpace: "nowrap",
                        boxShadow: "0 2px 10px rgba(212,175,55,0.45)",
                      }}>
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {/* 🔒 PRO badge (non-premium only) */}
                  {!isPremium && !wolfActive && (
                    <div style={{
                      position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                      display: "flex", alignItems: "center", gap: 3,
                      fontSize: 8, fontWeight: 800, letterSpacing: "0.14em",
                      color: "rgba(255,255,255,0.65)",
                      background: "rgba(15,10,25,0.92)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap",
                    }}>
                      <Lock style={{ width: 7, height: 7 }} />
                      PRO
                    </div>
                  )}

                  {/* Wolf icon — minimalist gold line-art */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: wolfActive
                      ? "radial-gradient(circle at 42% 38%, rgba(20,14,4,0.96) 0%, rgba(10,7,2,0.99) 100%)"
                      : isPremium
                        ? "rgba(10,7,2,0.90)"
                        : "rgba(8,5,2,0.85)",
                    border: `1px solid ${wolfActive ? "rgba(212,175,55,0.40)" : isPremium ? "rgba(196,135,58,0.20)" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: wolfActive
                      ? "inset 0 0 18px rgba(212,175,55,0.10), 0 0 14px rgba(212,175,55,0.18)"
                      : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: !isPremium && !wolfActive ? 0.50 : 1,
                  }}>
                    {/* Fierce forward-facing wolf head — clean gold stroke line-art */}
                    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="cs-wf-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="1.4" result="b"/>
                          <feFlood floodColor="#d4af37" floodOpacity="0.55" result="c"/>
                          <feComposite in="c" in2="b" operator="in" result="g"/>
                          <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>

                      {/* Left ear — sharp upright triangle */}
                      <path d="M13 18 L10 4 L20 14 Z"
                        stroke="#d4af37" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(212,175,55,0.08)"/>
                      {/* Left ear inner */}
                      <path d="M13.5 16 L11.5 7 L18 13 Z"
                        fill="rgba(212,175,55,0.14)" stroke="none"/>

                      {/* Right ear — sharp upright triangle */}
                      <path d="M35 18 L38 4 L28 14 Z"
                        stroke="#d4af37" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(212,175,55,0.08)"/>
                      {/* Right ear inner */}
                      <path d="M34.5 16 L36.5 7 L30 13 Z"
                        fill="rgba(212,175,55,0.14)" stroke="none"/>

                      {/* Head outline — broad angular wolf skull */}
                      <path d="M13 18 Q8 20 7 26 Q6 31 9 34 Q12 37 16 38 Q20 39 24 39 Q28 39 32 38 Q36 37 39 34 Q42 31 41 26 Q40 20 35 18 Q31 14 24 14 Q17 14 13 18 Z"
                        stroke="#d4af37" strokeWidth="1.5" strokeLinejoin="round"
                        fill="rgba(212,175,55,0.04)" filter="url(#cs-wf-glow)"/>

                      {/* Muzzle — angular forward snout */}
                      <path d="M16 34 Q18 40 24 42 Q30 40 32 34 Q29 36 24 36 Q19 36 16 34 Z"
                        stroke="#d4af37" strokeWidth="1.3" strokeLinejoin="round" fill="rgba(212,175,55,0.06)"/>

                      {/* Centre brow ridge — gives ferocity */}
                      <path d="M20 22 Q24 20 28 22"
                        stroke="#d4af37" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.75"/>

                      {/* Left brow furrow */}
                      <path d="M13 21 Q16 19 18 21"
                        stroke="#d4af37" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.60"/>
                      {/* Right brow furrow */}
                      <path d="M35 21 Q32 19 30 21"
                        stroke="#d4af37" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.60"/>

                      {/* Left eye — almond shape */}
                      <path d="M15 26 Q17 23 20 25 Q18 28 15 26 Z"
                        stroke="#d4af37" strokeWidth="1.1" strokeLinejoin="round" fill="rgba(212,175,55,0.18)"/>
                      {/* Left pupil slit */}
                      <line x1="17.5" y1="24.5" x2="17.5" y2="27" stroke="rgba(10,6,2,0.90)" strokeWidth="1.2" strokeLinecap="round"/>

                      {/* Right eye — almond shape */}
                      <path d="M33 26 Q31 23 28 25 Q30 28 33 26 Z"
                        stroke="#d4af37" strokeWidth="1.1" strokeLinejoin="round" fill="rgba(212,175,55,0.18)"/>
                      {/* Right pupil slit */}
                      <line x1="30.5" y1="24.5" x2="30.5" y2="27" stroke="rgba(10,6,2,0.90)" strokeWidth="1.2" strokeLinecap="round"/>

                      {/* Nose bridge */}
                      <line x1="24" y1="28" x2="24" y2="33" stroke="#d4af37" strokeWidth="1.0" strokeLinecap="round" opacity="0.55"/>
                      {/* Nose tip */}
                      <ellipse cx="24" cy="34" rx="3" ry="1.8" fill="rgba(212,175,55,0.22)" stroke="#d4af37" strokeWidth="1.0"/>

                      {/* Chin tuft lines */}
                      <path d="M20 38 Q22 40 24 41" stroke="#d4af37" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45"/>
                      <path d="M28 38 Q26 40 24 41" stroke="#d4af37" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45"/>

                      {/* Neck / collar */}
                      <path d="M16 38 Q14 43 16 46 Q20 48 24 48 Q28 48 32 46 Q34 43 32 38"
                        stroke="#d4af37" strokeWidth="1.2" strokeLinecap="round" fill="rgba(212,175,55,0.04)"/>
                      {/* Chest fur line */}
                      <path d="M18 44 Q24 47 30 44" stroke="#d4af37" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.40"/>
                    </svg>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <p style={{
                      fontSize: 12, fontWeight: 700, marginBottom: 2, fontFamily: "DM Sans, sans-serif",
                      color: wolfActive ? "#C9A84C" : isPremium ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)",
                    }}>
                      Wolf Companion
                    </p>
                    <p style={{
                      fontSize: 10, fontFamily: "DM Sans, sans-serif",
                      color: wolfActive
                        ? "rgba(201,168,76,0.55)"
                        : isPremium ? "rgba(201,168,76,0.55)"
                        : "rgba(255,255,255,0.28)",
                    }}>
                      {wolfActive ? "Your wolf" : isPremium ? "Tap to switch" : "Unlock with Pro"}
                    </p>
                  </div>
                </motion.button>

              </div>{/* end cards grid */}
            </div>{/* end inner card */}
          </div>{/* end border wrapper */}
        </div>{/* end relative position wrapper */}
      </section>
    </>
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

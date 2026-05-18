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

  const buyWithPoints = (id: string, cost: number, pro?: boolean) => {
    if (pro && !state.isPremium) { triggerPaywall(); return; }
    if (state.points < cost) return;
    update((s) => ({
      points: s.points - cost,
      treeXP: s.treeXP + Math.floor(cost / 2),
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
    }));
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

      {/* Tree scene — full-bleed, no card frame */}
      <section className="mt-4 relative" style={{ height: 360 }}>
        {/* Sky fills the section edge-to-edge */}
        <div className="absolute inset-0 overflow-hidden">
          <TreeSkyBackground timeOfDay={timeOfDay} />
        </div>

        {/* Health overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none transition-all duration-1000"
          style={{ background: health.sceneOverlay }} />

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
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ filter: health.companionFilter, transition: "filter 1.2s ease" }}>
          {treeStyle === "3d" ? (
            <div className="companion-3d anim-tree-float" style={{ width: "100%", height: "100%" }}>
              <Tree3D day={day} />
            </div>
          ) : (
            <div className="anim-tree-float" style={{ width: "100%", height: "100%" }}>
              <CartoonTree day={day} xp={state.treeXP} />
            </div>
          )}
        </div>

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

      {/* Upgrades — etched glass shop */}
      <section className="px-6 mt-6">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82, marginBottom: 4 }}>
          Grow your tree
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 16, lineHeight: 1.5 }}>
          Spend points you've earned — or speed it up.
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

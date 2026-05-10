import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Coins, Lock, CreditCard, Share2, Users, Crown, Globe } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useState } from "react";
import { Tree3D } from "@/components/Tree3D";
import { CompanionAvatar, dayToStage, STAGE_DAYS, COMPANION_LABELS } from "@/components/avatars/CompanionAvatar";

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

// CSS animation class per stage (0–5)
const STAGE_ANIMS = [
  "anim-crawl",
  "anim-wobble",
  "anim-jump",
  "anim-sway",
  "anim-jog",
  "anim-confident",
] as const;

const HALL_OF_LEGENDS = [
  { name: "Dimitri K.", day: 412 },
  { name: "Samuel R.", day: 287 },
  { name: "Kenji T.", day: 156 },
];

// ── Deterministic star positions (avoids jitter on re-render) ─────────────────
const MAN_STARS = [
  [7,4,1.5,0],[14,11,1,0.5],[22,3,2,1.2],[30,17,1.2,0.8],[41,7,1.8,0.3],
  [54,14,1,1.5],[62,5,1.5,0.7],[70,10,2,0.2],[79,2,1.2,1.8],[88,15,1.5,0.9],
  [95,6,1,1.1],[3,21,1.2,2],[17,27,1,0.4],[26,19,1.8,1.6],[37,31,1,0.1],
  [48,24,1.5,2.2],[59,29,1.2,0.6],[67,22,2,1.4],[74,34,1,2.5],[83,26,1.5,0.3],
  [91,21,1.2,1.9],[10,38,1,2.8],[33,41,1.5,1.0],[57,37,1.2,0.7],[77,40,1,2.1],
] as const;

const NIGHT_STARS = [
  [5,5,2,0],[12,15,1.5,0.6],[18,8,1,1.4],[25,22,2.5,0.2],[32,12,1,1.8],
  [40,4,1.8,0.9],[47,18,1.2,2.3],[53,9,2,0.4],[60,25,1,1.1],[67,7,1.5,2.0],
  [74,20,1.2,0.7],[81,5,1.8,1.5],[88,16,1,0.3],[93,28,2,2.4],[8,32,1.2,1.0],
  [20,42,1.5,0.5],[35,35,1,2.1],[50,48,1.8,0.8],[65,38,1.2,1.7],[78,45,1,0.2],
  [90,33,1.5,2.8],[15,52,1,1.3],[42,55,2,0.6],[68,50,1.2,2.2],[85,55,1,1.0],
] as const;

// ── Background: Man — dark navy office / city ─────────────────────────────────
function ManBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Navy sky gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020A1C 0%, #071030 25%, #0D1848 55%, #162260 100%)",
      }}/>
      {/* Ambient city glow from below */}
      <div className="absolute bottom-0 inset-x-0 h-2/3" style={{
        background: "radial-gradient(ellipse 90% 55% at 50% 110%, rgba(60,100,220,0.22), transparent)",
      }}/>
      {/* Stars */}
      {MAN_STARS.map(([x, y, size, delay], i) => (
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
      {/* City skyline SVG */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 400 180"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Back layer: tall distant buildings ── */}
        <rect x="0"   y="105" width="28" height="75" fill="#050E28"/>
        <rect x="22"  y="82"  width="22" height="98" fill="#040C22"/>
        <rect x="47"  y="58"  width="30" height="122" fill="#050E28"/>
        <rect x="80"  y="95"  width="18" height="85" fill="#04102A"/>
        <rect x="102" y="48"  width="33" height="132" fill="#050E28"/>
        <rect x="140" y="78"  width="24" height="102" fill="#040C22"/>
        <rect x="166" y="38"  width="38" height="142" fill="#081640"/>
        <rect x="208" y="72"  width="26" height="108" fill="#040C22"/>
        <rect x="238" y="55"  width="30" height="125" fill="#050E28"/>
        <rect x="272" y="88"  width="22" height="92" fill="#04102A"/>
        <rect x="298" y="43"  width="36" height="137" fill="#050E28"/>
        <rect x="338" y="80"  width="24" height="100" fill="#040C22"/>
        <rect x="365" y="62"  width="20" height="118" fill="#04102A"/>

        {/* ── Front layer: closer buildings ── */}
        <rect x="0"   y="125" width="32" height="55" fill="#091840"/>
        <rect x="36"  y="108" width="18" height="72" fill="#0C1E4A"/>
        <rect x="58"  y="98"  width="26" height="82" fill="#091840"/>
        <rect x="90"  y="112" width="16" height="68" fill="#0C1E4A"/>
        <rect x="112" y="88"  width="30" height="92" fill="#091840"/>
        <rect x="148" y="104" width="20" height="76" fill="#0C1E4A"/>
        <rect x="174" y="82"  width="34" height="98" fill="#091840"/>
        <rect x="214" y="110" width="18" height="70" fill="#0C1E4A"/>
        <rect x="238" y="92"  width="28" height="88" fill="#091840"/>
        <rect x="272" y="118" width="16" height="62" fill="#0C1E4A"/>
        <rect x="294" y="90"  width="30" height="90" fill="#091840"/>
        <rect x="330" y="108" width="20" height="72" fill="#0C1E4A"/>
        <rect x="356" y="95"  width="26" height="85" fill="#091840"/>

        {/* ── Window lights (amber + cool blue) ── */}
        {/* Tall center building */}
        <rect x="173" y="90"  width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.75"/>
        <rect x="182" y="90"  width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.55"/>
        <rect x="191" y="90"  width="5" height="5" rx="0.5" fill="#B0C4FF" opacity="0.60"/>
        <rect x="173" y="100" width="5" height="5" rx="0.5" fill="#B0C4FF" opacity="0.50"/>
        <rect x="182" y="100" width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.80"/>
        <rect x="191" y="100" width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.40"/>
        <rect x="173" y="110" width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.65"/>
        <rect x="182" y="110" width="5" height="5" rx="0.5" fill="#B0C4FF" opacity="0.55"/>
        <rect x="191" y="110" width="5" height="5" rx="0.5" fill="#FFE082" opacity="0.85"/>

        {/* Left cluster */}
        <rect x="113" y="95"  width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.70"/>
        <rect x="121" y="95"  width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.45"/>
        <rect x="113" y="103" width="4" height="4" rx="0.5" fill="#B0C4FF" opacity="0.55"/>
        <rect x="121" y="103" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.80"/>
        <rect x="113" y="111" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.60"/>
        <rect x="121" y="111" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.35"/>

        {/* Right cluster */}
        <rect x="295" y="97"  width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.75"/>
        <rect x="303" y="97"  width="4" height="4" rx="0.5" fill="#B0C4FF" opacity="0.55"/>
        <rect x="295" y="105" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.50"/>
        <rect x="303" y="105" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.80"/>
        <rect x="295" y="113" width="4" height="4" rx="0.5" fill="#B0C4FF" opacity="0.65"/>
        <rect x="303" y="113" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.40"/>

        {/* Far right */}
        <rect x="340" y="115" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.65"/>
        <rect x="348" y="115" width="4" height="4" rx="0.5" fill="#FFE082" opacity="0.45"/>
        <rect x="340" y="123" width="4" height="4" rx="0.5" fill="#B0C4FF" opacity="0.55"/>

        {/* ── Street / ground ── */}
        <rect x="0" y="172" width="400" height="8" fill="#040D24"/>
        {/* Street lamp glow */}
        <ellipse cx="80"  cy="165" rx="14" ry="6" fill="#FFE082" opacity="0.08"/>
        <ellipse cx="220" cy="165" rx="14" ry="6" fill="#FFE082" opacity="0.08"/>
        <ellipse cx="340" cy="165" rx="14" ry="6" fill="#FFE082" opacity="0.08"/>
      </svg>

      {/* Top vignette */}
      <div className="absolute top-0 inset-x-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(2,10,28,0.6), transparent)" }}/>
    </div>
  );
}

// ── Background: Woman — deep teal / emerald with botanicals ──────────────────
const LEAF_DEFS = [
  // [x%, y%, scale, rotate, delay, dur]
  [2,  55, 1.2,  10, 0,   5.5],
  [6,  78, 0.9, -15, 1.2, 6.0],
  [90, 50, 1.3,  -8, 0.5, 5.0],
  [93, 72, 1.0,  20, 2.0, 6.5],
  [15, 88, 0.8, -20, 0.8, 4.8],
  [82, 88, 1.1,  15, 1.5, 5.2],
  [0,  40, 0.7,  30, 2.5, 7.0],
  [96, 35, 0.8, -25, 0.3, 6.2],
] as const;

function WomanBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Teal/emerald gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, #031A18 0%, #052820 28%, #083830 55%, #0A2E28 100%)",
      }}/>
      {/* Radial glow center */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(20,90,70,0.35), transparent 70%)",
      }}/>
      {/* Subtle golden particle haze */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(180,150,60,0.10), transparent)",
      }}/>

      {/* Botanical leaf silhouettes */}
      {LEAF_DEFS.map(([x, y, scale, rotate, delay, dur], i) => (
        <svg
          key={i}
          className="absolute anim-leaf"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rotate}deg) scale(${scale})`,
            "--leaf-dur": `${dur}s`,
            "--leaf-delay": `${delay}s`,
          } as React.CSSProperties}
          width="64"
          height="80"
          viewBox="0 0 64 80"
          fill="none"
        >
          <path
            d="M32 78 C32 78 5 55 5 32 C5 12 16 2 32 2 C48 2 59 12 59 32 C59 55 32 78 32 78Z"
            fill="#0D5040"
            opacity="0.7"
          />
          <path
            d="M32 78 C32 78 12 58 14 38 C16 22 22 10 32 6"
            stroke="#1A7060"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M32 78 L32 10"
            stroke="#1A7060"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />
        </svg>
      ))}

      {/* Tiny glowing particles */}
      {[
        [30,40],[45,25],[62,55],[18,65],[75,30],[52,72],[25,80],[68,18],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full anim-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: "3px",
            height: "3px",
            background: "rgba(100,220,180,0.7)",
            "--star-dur": `${3 + (i % 4) * 0.5}s`,
            "--star-delay": `${i * 0.4}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Bottom vignette blending into page */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(0deg, var(--background), transparent)" }}
      />
    </div>
  );
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

// ── Money-counting animated overlay (stage 5 only) ────────────────────────────
function MoneyCountingOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ perspective: "400px" }}>
      {/* Animated bill near hand area */}
      <div
        className="absolute anim-bill"
        style={{ bottom: "24%", left: "50%", transform: "translateX(-50%)", width: "52px" }}
      >
        <svg viewBox="0 0 52 20" width="52" height="20" fill="none">
          <rect x="1" y="1" width="50" height="18" rx="2.5" fill="#2E7D32" opacity="0.95"/>
          <rect x="1" y="1" width="50" height="18" rx="2.5" stroke="#1B5E20" strokeWidth="0.8" fill="none"/>
          <rect x="3" y="3" width="46" height="14" rx="1.5" stroke="#4CAF50" strokeWidth="0.5" fill="none" opacity="0.4"/>
          <circle cx="26" cy="10" r="5" fill="#1B5E20" opacity="0.8"/>
          <circle cx="26" cy="10" r="3.5" fill="#2E7D32" opacity="0.6"/>
          <text x="26" y="13" textAnchor="middle" fill="#A5D6A7" fontSize="5" fontFamily="monospace" fontWeight="bold">$100</text>
          <rect x="3"  y="7" width="8" height="6" rx="1" fill="#388E3C" opacity="0.5"/>
          <rect x="41" y="7" width="8" height="6" rx="1" fill="#388E3C" opacity="0.5"/>
        </svg>
      </div>
      {/* Second bill slightly offset */}
      <div
        className="absolute anim-bill"
        style={{
          bottom: "26%",
          left: "calc(50% + 6px)",
          transform: "translateX(-50%)",
          width: "52px",
          animationDelay: "0.22s",
          opacity: 0.7,
        }}
      >
        <svg viewBox="0 0 52 20" width="52" height="20" fill="none">
          <rect x="1" y="1" width="50" height="18" rx="2.5" fill="#388E3C" opacity="0.9"/>
          <rect x="1" y="1" width="50" height="18" rx="2.5" stroke="#2E7D32" strokeWidth="0.8" fill="none"/>
          <circle cx="26" cy="10" r="5" fill="#2E7D32" opacity="0.7"/>
          <text x="26" y="13" textAnchor="middle" fill="#C8E6C9" fontSize="5" fontFamily="monospace" fontWeight="bold">$100</text>
        </svg>
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function TreePage() {
  const [state, update] = useAppState();
  const day = dayCount(state.startDate);
  const companion = state.companion ?? "tree";

  if (companion !== "tree") {
    return <CompanionPage state={state} update={update} day={day} />;
  }
  return <LifeTreePage state={state} update={update} day={day} />;
}

// ── Non-tree companion page ───────────────────────────────────────────────────
function CompanionPage({
  state,
  update: _update,
  day,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
  day: number;
}) {
  const companion = state.companion as "man" | "woman";
  const stage = dayToStage(day);
  const nextStageDay = STAGE_DAYS[stage + 1] as number | undefined;
  const daysLeft = nextStageDay != null ? nextStageDay - day : 0;
  const stagePct =
    nextStageDay != null
      ? Math.min(100, Math.round(((day - STAGE_DAYS[stage]) / (nextStageDay - STAGE_DAYS[stage])) * 100))
      : 100;
  const { name, tagline } = COMPANION_LABELS[companion];
  const animClass = STAGE_ANIMS[stage];

  return (
    <PageShell>
      {/* ── Hero viewport ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "62vh", minHeight: "380px" }}>
        {/* Themed background */}
        {companion === "man" ? <ManBackground /> : <WomanBackground />}

        {/* Rank badge — top left */}
        <div className="absolute top-14 left-5 z-20">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: "oklch(0.92 0.14 90)",
              background: "linear-gradient(135deg, oklch(0.35 0.08 75 / 0.55), oklch(0.5 0.14 85 / 0.35))",
              border: "1px solid oklch(0.78 0.16 85 / 0.65)",
              boxShadow: "0 0 18px -4px oklch(0.78 0.16 85 / 0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Crown className="h-3 w-3" />
            {RANK_BY_STAGE[stage]}
          </div>
        </div>

        {/* Day counter — top right */}
        <div className="absolute top-14 right-5 z-20">
          <div
            className="px-3 py-1.5 rounded-full text-[10px] font-bold tabular-nums"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            Day {day}
          </div>
        </div>

        {/* Character — centered, large, animated */}
        <div className="absolute inset-0 flex items-end justify-center pb-6 z-10">
          <div
            className={`relative companion-3d ${animClass}`}
            style={{ width: "160px", height: "210px" }}
          >
            <CompanionAvatar
              type={companion}
              day={day}
              relapseCount={state.relapses.length}
              className="w-full h-full"
            />
            {stage === 5 && <MoneyCountingOverlay />}
          </div>
        </div>

        {/* Stage pill — bottom center */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <span
            className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.80)",
              backdropFilter: "blur(10px)",
            }}
          >
            Stage {stage + 1} · {STAGE_NAMES[stage]}
          </span>
        </div>

        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 inset-x-0 h-20 pointer-events-none z-10"
          style={{ background: "linear-gradient(0deg, var(--background), transparent)" }}
        />
      </div>

      {/* ── Info section ──────────────────────────────────────────────────── */}
      <div className="px-5 mt-6 space-y-4">
        {/* Name + tagline */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground">
            Your Companion
          </p>
          <h1 className="mt-1 text-2xl font-bold">{name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{tagline}</p>
        </div>

        {/* Evolution progress */}
        <div
          className="rounded-2xl p-4 border border-border/60"
          style={{ background: "var(--gradient-surface)" }}
        >
          {nextStageDay != null ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">Next evolution</p>
                <span className="text-xs font-bold tabular-nums" style={{ color: "var(--primary)" }}>
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} away
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stagePct}%`, background: "var(--gradient-primary)" }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/60">
                <span>Stage {stage + 1}</span>
                <span>Stage {Math.min(stage + 2, 6)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-center" style={{ color: "var(--primary)" }}>
              Peak form achieved. Legendary.
            </p>
          )}
        </div>

        {/* Community rank */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, oklch(0.28 0.10 155 / 0.45), oklch(0.22 0.06 260 / 0.55))",
            border: "1px solid oklch(0.70 0.16 150 / 0.45)",
          }}
        >
          <Globe className="h-4 w-4 text-success shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your companion ranks in the{" "}
            <span className="text-success font-semibold">top {TOP_PCT_BY_STAGE[stage]}%</span> of all Stopamine users
          </p>
        </div>

        {/* Why this matters */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Remember why</p>
          <p className="mt-2 text-sm leading-snug">
            You started this for{" "}
            <span className="text-primary font-medium">
              {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
            </span>
            . Every clean day shapes who this person becomes.
          </p>
        </div>

        {/* Hall of Legends */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} />
            <h2 className="text-sm font-bold">Hall of Legends</h2>
          </div>
          <div className="space-y-2">
            {HALL_OF_LEGENDS.map((u, i) => (
              <div
                key={u.name}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{
                  background: "linear-gradient(135deg, oklch(0.24 0.04 80 / 0.5), oklch(0.20 0.025 260 / 0.6))",
                  border: "1px solid oklch(0.78 0.16 85 / 0.40)",
                  boxShadow: "0 0 20px -8px oklch(0.78 0.16 85 / 0.35)",
                }}
              >
                <div
                  className="h-10 w-10 rounded-full grid place-items-center shrink-0"
                  style={{ background: "linear-gradient(135deg, oklch(0.5 0.14 85), oklch(0.35 0.1 75))" }}
                >
                  <Crown className="h-4 w-4" style={{ color: "oklch(0.97 0.12 95)" }}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Legendary · Day {u.day}</p>
                </div>
                <span className="text-[10px] font-bold shrink-0" style={{ color: "oklch(0.85 0.14 85)" }}>
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-center text-muted-foreground mt-3 italic">
            One day, your name belongs here.
          </p>
        </div>

        {/* Closer quote */}
        <div className="rounded-2xl border border-border bg-card p-5 text-center mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </div>
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
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sacred Ground</p>
        <h1 className="mt-2 text-3xl font-bold">Your Life Tree</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This tree is sacred. Every clean day is permanently etched into it.
        </p>
      </header>

      {/* Tree visual — with timezone sky background + Y-axis rotation */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
          {/* Sky viewport */}
          <div className="relative" style={{ height: "280px" }}>
            <TreeSkyBackground timeOfDay={timeOfDay} />

            {/* Floating stage badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full backdrop-blur-sm">
                Stage {stage.stage} · {stage.name}
              </span>
            </div>

            {/* Time of day badge */}
            <div className="absolute top-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.38)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {skyCfg.emoji} {skyCfg.label}
              </span>
            </div>

            {/* Rank badge */}
            <div className="absolute bottom-3 left-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: "oklch(0.92 0.14 90)",
                  background: "linear-gradient(135deg, oklch(0.35 0.08 75 / 0.5), oklch(0.5 0.14 85 / 0.30))",
                  border: "1px solid oklch(0.78 0.16 85 / 0.65)",
                  boxShadow: "0 0 16px -2px oklch(0.78 0.16 85 / 0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Crown className="h-3 w-3" /> {RANK_BY_STAGE[stage.stage]}
              </span>
            </div>

            {/* Day badge */}
            <div className="absolute bottom-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded-full"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <Sparkles className="h-3 w-3" /> Day {day} of you
              </span>
            </div>

            {/* Rotating tree */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="companion-3d anim-tree-float" style={{ width: "100%", height: "100%" }}>
                <Tree3D day={day} />
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="px-5 py-4 border-t border-border/60" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">{stage.name}</span>
              <span className="text-muted-foreground tabular-nums">{state.treeXP} / {stage.next} XP</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <Globe className="inline h-3.5 w-3.5 text-success mr-1" />
              Your tree ranks in the{" "}
              <span className="text-success font-semibold">top {TOP_PCT_BY_STAGE[stage.stage]}%</span> of all users
            </p>
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

      {/* Upgrades */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-1">Grow your tree</h2>
        <p className="text-xs text-muted-foreground mb-3">Spend points you've earned — or speed it up.</p>
        <div className="space-y-3">
          {UPGRADES.map((u) => {
            const owned = state.treeUnlocks.includes(u.id);
            const canAfford = state.points >= u.costPoints;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full grid place-items-center bg-success/10 text-success shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      {u.pro && <Lock className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{u.desc}</p>
                  </div>
                  {owned && (
                    <span className="text-[10px] uppercase text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                      Owned
                    </span>
                  )}
                </div>
                {!owned && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => buyWithPoints(u.id, u.costPoints, u.pro)}
                      disabled={!canAfford && !(u.pro && !state.isPremium)}
                      className={`h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 ${
                        canAfford
                          ? "bg-primary/15 text-primary border border-primary/40"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5" /> {u.costPoints} pts
                    </button>
                    <button
                      onClick={() => triggerPaywall()}
                      className="h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> ${u.costMoney}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Hall of Legends */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} />
          <h2 className="text-sm font-bold tracking-wide">Hall of Legends</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">The few who reached Ancient tree. This is what's possible.</p>
        <div className="space-y-2">
          {HALL_OF_LEGENDS.map((u, i) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, oklch(0.24 0.04 80 / 0.5), oklch(0.20 0.025 260 / 0.6))",
                border: "1px solid oklch(0.78 0.16 85 / 0.45)",
                boxShadow: "0 0 20px -8px oklch(0.78 0.16 85 / 0.4)",
              }}
            >
              <div
                className="h-11 w-11 rounded-full grid place-items-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.14 85), oklch(0.35 0.1 75))",
                  boxShadow: "inset 0 0 6px oklch(0.95 0.1 90 / 0.4)",
                }}
              >
                <Crown className="h-5 w-5" style={{ color: "oklch(0.97 0.12 95)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{u.name}</p>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      color: "oklch(0.95 0.12 90)",
                      border: "1px solid oklch(0.78 0.16 85 / 0.6)",
                      background: "oklch(0.5 0.14 85 / 0.15)",
                    }}
                  >
                    Legendary
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Ancient tree · Day {u.day}</p>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: "oklch(0.85 0.14 85)" }}>
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-3 italic">
          One day, your name belongs here.
        </p>
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ── Share card (unchanged) ────────────────────────────────────────────────────
const COMMUNITY_FEED = [
  { name: "Marcus", stage: "Strong tree", day: 61, xp: 2340 },
  { name: "Jaylen", stage: "Young tree",  day: 34, xp: 980  },
  { name: "Timo",   stage: "Sapling",     day: 19, xp: 420  },
  { name: "Arjun",  stage: "Ancient tree",day: 112,xp: 4100 },
  { name: "Noah",   stage: "Sprout",      day: 8,  xp: 180  },
];

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

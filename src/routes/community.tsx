import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { PremiumBackground } from "@/components/PremiumBackground";
import { useAppState, treeStage, dayCount, flagshipAddiction } from "@/lib/store";
import { currentBadge, BADGES } from "@/lib/badges";
import { supabase } from "@/lib/supabase";
import { triggerPaywall } from "@/lib/paywall";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Send, Lock, Plus, Users, Globe, Book, Dumbbell,
  Heart, MessageCircle, Crown, Shield, Check, X, Link2, Copy, Key,
} from "lucide-react";
// @ts-ignore — react-simple-maps v3 ships no bundled types
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
// @ts-ignore — world-atlas ships plain JSON, no types needed
import topology from "world-atlas/countries-110m.json";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Room = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  memberCount: number;
  isGlobal?: boolean;
  locked?: boolean;
  joined?: boolean;
};

type Message = {
  id: string;
  userId: string;
  name: string;
  initial: string;
  avatarColor: string;
  rank: string;
  text: string;
  ts: number;
};

// ─── Static data ──────────────────────────────────────────────────────────────
const ROOMS: Room[] = [
  { id: "global",        name: "Global",           description: "Everyone is here. Show up daily.",                icon: Globe,    color: "oklch(0.55 0.18 260)", memberCount: 46847, isGlobal: true },
  { id: "bible",         name: "Faith & Recovery",  description: "Recovery through faith. All beliefs welcome.",   icon: Book,     color: "oklch(0.55 0.17 60)",  memberCount: 3241 },
  { id: "fitness",       name: "Fitness Mode",      description: "Replace the habit with movement.",               icon: Dumbbell, color: "oklch(0.52 0.16 145)", memberCount: 5890 },
  { id: "relationships", name: "Relationships",     description: "How this affects the people around us.",         icon: Heart,    color: "oklch(0.55 0.18 10)",  memberCount: 2107 },
  { id: "mental",        name: "Mental Health",     description: "Anxiety, depression, and addiction.",            icon: Shield,   color: "oklch(0.50 0.15 290)", memberCount: 4562 },
];

// Avatar clusters per room — shown in the card
const ROOM_AVATARS: Record<string, { initial: string; bg: string }[]> = {
  global:        [{ initial: "M", bg: "#4B7FCC" }, { initial: "J", bg: "#4A9A6E" }, { initial: "A", bg: "#8B6BD4" }, { initial: "R", bg: "#CC7044" }, { initial: "T", bg: "#4A8CA0" }],
  bible:         [{ initial: "S", bg: "#B8933A" }, { initial: "D", bg: "#A07838" }, { initial: "E", bg: "#C4A05A" }, { initial: "R", bg: "#8B6B30" }],
  fitness:       [{ initial: "K", bg: "#3A8B5C" }, { initial: "M", bg: "#4B9E6E" }, { initial: "C", bg: "#2E7A50" }, { initial: "B", bg: "#5FAA78" }],
  relationships: [{ initial: "L", bg: "#B8404A" }, { initial: "P", bg: "#CC5560" }, { initial: "R", bg: "#A03040" }, { initial: "H", bg: "#D46070" }],
  mental:        [{ initial: "T", bg: "#5A4AB8" }, { initial: "N", bg: "#7060CC" }, { initial: "G", bg: "#4A3A9E" }, { initial: "V", bg: "#6858D0" }],
};

function makeMockMessages(): Record<string, Message[]> {
  const now = Date.now();
  return {
    global: [
      { id: "1", userId: "u1", name: "Marcus",  initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Titan",    text: "day 61 checking in. feeling sharp today.", ts: now - 1000 * 60 * 4 },
      { id: "2", userId: "u2", name: "Arjun",   initial: "A", avatarColor: "oklch(0.50 0.15 290)", rank: "Legend",   text: "112 days. the urges barely register anymore. it gets easier.", ts: now - 1000 * 60 * 3 },
      { id: "3", userId: "u3", name: "Timo",    initial: "T", avatarColor: "oklch(0.55 0.17 30)",  rank: "Ironmind", text: "used the sos button last night. worked. still going.", ts: now - 1000 * 60 * 2 },
      { id: "4", userId: "u4", name: "Noah",    initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awaken",   text: "first week done. harder than i thought but i'm here", ts: now - 1000 * 60 * 1 },
      { id: "5", userId: "u5", name: "Jaylen",  initial: "J", avatarColor: "oklch(0.52 0.16 145)", rank: "Warrior",  text: "relapsed on day 28 but came back day 29. momentum never stopped.", ts: now - 1000 * 30 },
    ],
    bible: [
      { id: "b1", userId: "u6", name: "Samuel",  initial: "S", avatarColor: "oklch(0.55 0.17 60)", rank: "Titan",  text: "praying for everyone here tonight. you're not alone in this.", ts: now - 1000 * 60 * 5 },
      { id: "b2", userId: "u7", name: "Dimitri", initial: "D", avatarColor: "oklch(0.56 0.16 60)", rank: "Legend", text: "1 Cor 10:13 — he will not let you be tempted beyond what you can bear.", ts: now - 1000 * 60 * 2 },
    ],
    fitness: [
      { id: "f1", userId: "u8", name: "Kenji",  initial: "K", avatarColor: "oklch(0.54 0.14 180)", rank: "Titan", text: "replaced the urge with a cold shower + 20 pushups. works every time.", ts: now - 1000 * 60 * 8 },
      { id: "f2", userId: "u9", name: "Marcus", initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Titan", text: "ran 5k this morning. day 61. body feels different.", ts: now - 1000 * 60 * 3 },
    ],
    relationships: [],
    mental: [
      { id: "m1", userId: "u10", name: "Timo", initial: "T", avatarColor: "oklch(0.55 0.17 30)",  rank: "Disciplined", text: "anyone else notice anxiety drops significantly after 2 weeks clean?", ts: now - 1000 * 60 * 10 },
      { id: "m2", userId: "u11", name: "Noah", initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awakened",    text: "yes. the brain fog lifted around day 10 for me.", ts: now - 1000 * 60 * 6 },
    ],
  };
}

// Badge name → color (matches BADGES in badges.ts)
const BADGE_COLORS: Record<string, { color: string; glow: string }> = {
  Spark:    { color: "#E07A45", glow: "rgba(224,122,69,0.15)"  },
  Riser:   { color: "#D06030", glow: "rgba(208,96,48,0.15)"   },
  Awaken:  { color: "#9060C8", glow: "rgba(144,96,200,0.15)"  },
  Clarity: { color: "#4A8FCC", glow: "rgba(74,143,204,0.15)"  },
  Warrior: { color: "#7050C0", glow: "rgba(112,80,192,0.15)"  },
  Ironmind:{ color: "#3870B0", glow: "rgba(56,112,176,0.15)"  },
  Forge:   { color: "#B84830", glow: "rgba(184,72,48,0.15)"   },
  Titan:   { color: "#507090", glow: "rgba(80,112,144,0.15)"  },
  Gorilla: { color: "#2E7A50", glow: "rgba(46,122,80,0.15)"   },
  Apex:    { color: "#C4873A", glow: "rgba(196,135,58,0.15)"  },
  Legend:  { color: "#D4AF37", glow: "rgba(212,175,55,0.15)"  },
};

const COOLDOWN_SECS = 10;

// ─── Social stickiness ────────────────────────────────────────────────────────
const TICKER_STATS = [
  "2.3M clean days logged community-wide",
  "1,847 people succeeding today",
  "312 urges survived this hour",
  "46,847 members fighting alongside you",
  "94% who reach day 7 make it to day 30",
];

const ROOM_GOALS: Record<string, { current: number; goal: number; label: string }> = {
  global:        { current: 2341850, goal: 2500000, label: "community clean days" },
  bible:         { current: 89240,   goal: 100000,  label: "days of faith" },
  fitness:       { current: 147600,  goal: 200000,  label: "workouts logged" },
  relationships: { current: 41200,   goal: 75000,   label: "days rebuilding trust" },
  mental:        { current: 98450,   goal: 150000,  label: "days of clarity" },
};

function formatGoal(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}`;
}

function ImpactTicker() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx((i) => (i + 1) % TICKER_STATS.length); setShow(true); }, 380);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse"
        style={{ background: "#C4873A", boxShadow: "0 0 6px #C4873A" }}
      />
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : -5 }}
        transition={{ duration: 0.32 }}
        className="text-[11px] font-medium"
        style={{ color: "rgba(201,168,76,0.75)" }}
      >
        {TICKER_STATS[idx]}
      </motion.span>
    </div>
  );
}

function CollectiveGoalBar({ roomId, color }: { roomId: string; color: string }) {
  const goal = ROOM_GOALS[roomId];
  if (!goal) return null;
  const pct = Math.min(100, Math.round((goal.current / goal.goal) * 100));

  return (
    <div className="mt-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>
          Collective Goal
        </span>
        <span className="text-[9px] font-bold tabular-nums" style={{ color }}>
          {formatGoal(goal.current)} / {formatGoal(goal.goal)} {goal.label}
        </span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          style={{ background: `linear-gradient(90deg, ${color}70, ${color})` }}
        />
      </div>
    </div>
  );
}

function GlobalCheckInBar({ checkedIn, onCheckIn }: { checkedIn: boolean; onCheckIn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mx-4 mt-3 px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
      style={{
        background: checkedIn ? "rgba(196,135,58,0.07)" : "rgba(255,255,255,0.03)",
        border: checkedIn ? "1px solid rgba(196,135,58,0.22)" : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${checkedIn ? "animate-pulse" : ""}`}
          style={{
            background: checkedIn ? "#C4873A" : "rgba(255,255,255,0.18)",
            boxShadow: checkedIn ? "0 0 8px rgba(196,135,58,0.7)" : "none",
          }}
        />
        <span
          className="text-[11px] font-medium truncate"
          style={{ color: checkedIn ? "#C4873A" : "rgba(255,255,255,0.38)" }}
        >
          {checkedIn ? "You're present · Glowing on the map for 24h" : "Mark your presence on the global map"}
        </span>
      </div>
      {checkedIn ? (
        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "#C4873A" }} />
      ) : (
        <button
          onClick={onCheckIn}
          className="text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all active:scale-95 shrink-0"
          style={{
            background: "rgba(196,135,58,0.10)",
            border: "1px solid rgba(196,135,58,0.32)",
            color: "#C4873A",
            letterSpacing: "0.03em",
          }}
        >
          Check In
        </button>
      )}
    </motion.div>
  );
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

// ─── Heartbeat map — world coordinate pool ───────────────────────────────────
// [longitude, latitude] — GeoJSON convention
const WORLD_POOL: [number, number][] = [
  [-74,    41    ], // New York
  [-0.1,   51.5  ], // London
  [4.9,    52.4  ], // Amsterdam
  [2.3,    48.9  ], // Paris
  [13.4,   52.5  ], // Berlin
  [-46.6, -23.5  ], // São Paulo
  [3.4,    6.5   ], // Lagos
  [55.3,   25.2  ], // Dubai
  [72.8,   19.1  ], // Mumbai
  [103.8,   1.3  ], // Singapore
  [139.7,  35.7  ], // Tokyo
  [151.2, -33.9  ], // Sydney
  [-87.6,  41.8  ], // Chicago
  [-118.2, 34.0  ], // Los Angeles
  [-43.2, -22.9  ], // Rio de Janeiro
  [-3.7,   40.4  ], // Madrid
  [12.5,   41.9  ], // Rome
  [28.9,   41.0  ], // Istanbul
  [37.6,   55.7  ], // Moscow
  [116.4,  39.9  ], // Beijing
  [121.5,  31.2  ], // Shanghai
  [126.9,  37.6  ], // Seoul
  [100.5,  13.7  ], // Bangkok
  [106.8,  -6.2  ], // Jakarta
  [31.2,   30.1  ], // Cairo
  [18.4,  -33.9  ], // Cape Town
  [36.8,   -1.3  ], // Nairobi
  [-99.1,  19.4  ], // Mexico City
  [-79.4,  43.7  ], // Toronto
  [-123.1, 49.3  ], // Vancouver
  [-70.6, -33.4  ], // Santiago
  [-58.4, -34.6  ], // Buenos Aires
  [174.8, -37.0  ], // Auckland
  [77.2,   28.6  ], // Delhi
  [90.4,   23.7  ], // Dhaka
  [23.3,   42.7  ], // Sofia
  [14.5,   46.1  ], // Ljubljana
  [-9.1,   38.7  ], // Lisbon
  [144.9, -37.8  ], // Melbourne
  [-73.6,  45.5  ], // Montreal
];

type DotPhase = "entering" | "visible" | "exiting";
type LiveDot  = { id: string; coords: [number, number]; phase: DotPhase; ringDelay: number };

const TARGET_DOT_COUNT = 18;

function pickFreeCoord(used: Set<string>): [number, number] {
  const free = WORLD_POOL.filter((c) => !used.has(`${c[0]},${c[1]}`));
  return (free.length ? free : WORLD_POOL)[Math.floor(Math.random() * (free.length || WORLD_POOL.length))];
}

function makeDot(coords: [number, number], phase: DotPhase = "visible"): LiveDot {
  return { id: `d${Date.now()}${Math.random().toString(36).slice(2)}`, coords, phase, ringDelay: Math.random() * 2 };
}

const USER_CHECKIN_COORDS: [number, number] = [-74, 41]; // New York placeholder

function WorldMapHero({ userCheckedIn, extraMembers = 0 }: { userCheckedIn: boolean; extraMembers?: number }) {
  const [liveCount, setLiveCount] = useState(248);

  // ── Initialise dots from a random subset of the world pool ──────────────────
  const [dots, setDots] = useState<LiveDot[]>(() =>
    [...WORLD_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, TARGET_DOT_COUNT)
      .map((c) => makeDot(c, "visible"))
  );

  // ── Live member counter ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((n) => Math.max(240, Math.min(260, n + Math.floor(Math.random() * 5) - 2)));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // ── Heartbeat lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    function heartbeat() {
      if (!active) return;

      setDots((prev) => {
        // Pick a visible dot to expire
        const visibleIdxs = prev.map((d, i) => (d.phase === "visible" ? i : -1)).filter((i) => i >= 0);
        if (visibleIdxs.length === 0) return prev;
        const expireIdx = visibleIdxs[Math.floor(Math.random() * visibleIdxs.length)];

        // Build new dot (entering phase — opacity 0)
        const usedCoords = new Set(prev.map((d) => `${d.coords[0]},${d.coords[1]}`));
        const newCoords = pickFreeCoord(usedCoords);
        const newDot = makeDot(newCoords, "entering");

        const next = prev.map((d, i) => (i === expireIdx ? { ...d, phase: "exiting" as DotPhase } : d));
        return [...next, newDot];
      });

      // After one frame: flip entering → visible (triggers CSS opacity transition)
      setTimeout(() => {
        if (!active) return;
        setDots((prev) =>
          prev.map((d) => (d.phase === "entering" ? { ...d, phase: "visible" as DotPhase } : d))
        );
      }, 32);

      // After opacity fade completes: remove the exiting dot and reschedule
      setTimeout(() => {
        if (!active) return;
        setDots((prev) => prev.filter((d) => d.phase !== "exiting"));
        schedule();
      }, 1600);
    }

    function schedule() {
      // 10-20 second random interval so it never feels like a loop
      const delay = 10000 + Math.random() * 10000;
      timer = setTimeout(heartbeat, delay);
    }

    schedule();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  return (
    <div style={{ marginTop: 8 }} className="px-4">
      {/* ── Live counter ── */}
      <div className="flex items-center justify-center gap-2 pb-2">
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
          style={{ background: "#C4873A", boxShadow: "0 0 6px #C4873A" }}
        />
        <span
          className="text-[11px] font-bold tracking-wider tabular-nums"
          style={{ color: "#C4873A" }}
        >
          {liveCount + extraMembers} active now
        </span>
      </div>

      {/* ── Map ── */}
      {/* Border beam wrapper: 1px padding reveals the rotating gradient as a border */}
      <div style={{ position: "relative", borderRadius: 16, padding: 1, overflow: "hidden" }}>
        <style>{`
          @keyframes rsm-ping {
            0%   { transform: scale(1);   opacity: 0.7; }
            70%  { transform: scale(2.8); opacity: 0;   }
            100% { transform: scale(2.8); opacity: 0;   }
          }
          .rsm-dot-ring {
            transform-box: fill-box;
            transform-origin: center;
            animation: rsm-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes rsm-user-glow {
            0%, 100% { opacity: 0.3; }
            50%       { opacity: 0.8; }
          }
          .rsm-user-ring {
            transform-box: fill-box;
            transform-origin: center;
            animation: rsm-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          @keyframes border-beam-rotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .border-beam-ring {
            position: absolute;
            /* large square centred — covers all edges when rotating */
            width: 200%; height: 200%;
            top: -50%; left: -50%;
            background: conic-gradient(
              from 0deg,
              transparent 60%,
              rgba(196,135,58,0.25) 75%,
              #C4873A 88%,
              rgba(196,135,58,0.25) 96%,
              transparent 100%
            );
            animation: border-beam-rotate 4s linear infinite;
            pointer-events: none;
          }
        `}</style>

        {/* Rotating glow layer */}
        <div className="border-beam-ring" />

        {/* Map content — sits above the glow, clips to border-radius */}
        <div style={{ position: "relative", background: "#000000", borderRadius: 15, overflow: "hidden", lineHeight: 0 }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 110, center: [0, 0] }}
          width={800}
          height={294}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Ocean fill — black background */}
          <rect x={0} y={0} width={800} height={294} fill="#000000" />

          {/* Country shapes */}
          <Geographies geography={topology}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0f1a2e"
                  stroke="#1e3a5f"
                  strokeWidth={0.4}
                  style={{
                    default:  { outline: "none" },
                    hover:    { outline: "none" },
                    pressed:  { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Activity dots — heartbeat lifecycle with fade transitions */}
          {dots.map((dot) => (
            <Marker key={dot.id} coordinates={dot.coords}>
              <g style={{ opacity: dot.phase === "visible" ? 1 : 0, transition: "opacity 1.5s ease" }}>
                {/* Expanding ring — staggered delay per dot */}
                <circle
                  r={3.5}
                  fill="#C4873A"
                  fillOpacity={0.35}
                  className="rsm-dot-ring"
                  style={{ animationDelay: `${dot.ringDelay}s` }}
                />
                {/* Solid gold core */}
                <circle
                  r={2.2}
                  fill="#C4873A"
                  fillOpacity={0.95}
                  style={{ filter: "drop-shadow(0 0 3px #C4873A)" }}
                />
              </g>
            </Marker>
          ))}

          {/* User check-in glow marker */}
          {userCheckedIn && (
            <Marker coordinates={USER_CHECKIN_COORDS}>
              <circle r={7} fill="#E8C060" fillOpacity={0.12} className="rsm-user-ring" style={{ animationDelay: "0s" }} />
              <circle r={7} fill="#E8C060" fillOpacity={0.12} className="rsm-user-ring" style={{ animationDelay: "0.55s" }} />
              <circle
                r={3.8}
                fill="#FFDF80"
                fillOpacity={1}
                style={{ filter: "drop-shadow(0 0 5px #FFDF80) drop-shadow(0 0 12px rgba(255,220,80,0.7))" }}
              />
              <text y={-8} textAnchor="middle" fill="#FFDF80" fontSize={4.5} fontWeight="800" fontFamily="system-ui, sans-serif" letterSpacing="0.4">
                YOU
              </text>
            </Marker>
          )}
        </ComposableMap>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar stack ─────────────────────────────────────────────────────────────
function AvatarStack({ roomId, memberCount, isGlobal }: { roomId: string; memberCount: number; isGlobal?: boolean }) {
  const avatars = ROOM_AVATARS[roomId] ?? [];
  const shown = avatars.slice(0, 4);

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Overlapping circles — classic avatar stack */}
      <div className="flex">
        {shown.map((av, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-full grid place-items-center text-[8px] font-bold text-white"
            style={{
              background: av.bg,
              marginLeft: i > 0 ? -7 : 0,
              zIndex: shown.length - i,
              position: "relative",
              border: "1.5px solid #090705",
              boxSizing: "content-box",
            }}
          >
            {av.initial}
          </div>
        ))}
      </div>

      {/* Live dot + count for global; plain count for others */}
      {isGlobal ? (
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0"
            style={{ background: "#3a9a6e", boxShadow: "0 0 5px #3a9a6e" }}
          />
          <span className="text-[10px] font-medium" style={{ color: "#4aaa80" }}>
            247 active now
          </span>
        </div>
      ) : (
        <span className="text-[10px]" style={{ color: "oklch(0.52 0.015 265 / 0.55)" }}>
          +{formatCount(memberCount - shown.length)} others
        </span>
      )}
    </div>
  );
}

// ─── Founder's Badge toast ───────────────────────────────────────────────────
function FounderBadgeToast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: "calc(16px + env(safe-area-inset-top)", left: 16, right: 16,
        zIndex: 80, maxWidth: 416, margin: "0 auto",
        background: "oklch(0.13 0.020 265 / 0.96)",
        border: "1px solid rgba(201,168,76,0.40)",
        borderRadius: 16, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 14,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 13, flexShrink: 0,
        background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.30)",
        display: "grid", placeItems: "center",
      }}>
        <Crown style={{ width: 18, height: 18, color: "#C9A84C" }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", margin: "0 0 2px" }}>
          Founder's Badge earned
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", margin: 0 }}>
          +50 XP added to your tree
        </p>
      </div>
      <button onClick={onDone} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(255,255,255,0.30)", fontSize: 14 }}>✕</button>
    </motion.div>
  );
}

// ─── Sovereign Invite Modal ───────────────────────────────────────────────────
function SovereignInviteModal({ onClose, onGrantBadge, isPro }: { onClose: () => void; onGrantBadge: () => void; isPro: boolean }) {
  const [copied, setCopied] = useState(false);
  const [badgeGranted] = useState(() => !!localStorage.getItem("stopamine.founder_badge_sender"));

  const inviteCode = useState(() => {
    const existing = localStorage.getItem("stopamine.founder_code");
    if (existing) return existing;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    localStorage.setItem("stopamine.founder_code", code);
    return code;
  })[0];

  const inviteLink = `${window.location.origin}/community?fi=${inviteCode}`;

  // Guard: if PRO status drops while modal is open (e.g. dev panel), close immediately
  useEffect(() => {
    if (!isPro) { onClose(); return; }
    // Grant sender badge one-time — only runs when isPro is confirmed
    if (!localStorage.getItem("stopamine.founder_badge_sender")) {
      localStorage.setItem("stopamine.founder_badge_sender", "1");
      onGrantBadge();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Founding Invite — Stopamine",
        text: "I'm inviting you to join my recovery community with a Founding Invite. You'll earn an exclusive Founder's Badge.",
        url: inviteLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="si-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(10px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
      >
        <motion.div
          key="si-sheet"
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 448,
            /* Brushed Steel & Gold sheet */
            background: "linear-gradient(170deg, rgba(32,26,14,0.99) 0%, rgba(20,18,12,0.99) 60%, rgba(28,22,10,0.99) 100%)",
            borderTop: "1.5px solid rgba(201,168,76,0.42)",
            borderLeft: "1px solid rgba(180,155,90,0.18)",
            borderRight: "1px solid rgba(180,155,90,0.18)",
            borderRadius: "28px 28px 0 0",
            padding: "0 0 calc(36px + env(safe-area-inset-bottom))",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Brushed-steel texture overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "repeating-linear-gradient(94deg, transparent, transparent 4px, rgba(201,168,76,0.018) 4px, rgba(201,168,76,0.018) 5px)",
          }} />
          {/* Warm gold rim glow along the top edge */}
          <div aria-hidden style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.70), transparent)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: "26px 24px 0" }}>
            {/* Drag handle + corner X */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, position: "relative" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(201,168,76,0.22)" }} />
              <button
                onClick={onClose}
                style={{
                  position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                  width: 30, height: 30, borderRadius: 10, border: "none", cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.40)",
                  display: "grid", placeItems: "center",
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Key icon — Architect symbol */}
            <div style={{
              width: 60, height: 60, borderRadius: 20, margin: "0 auto 18px",
              background: "linear-gradient(145deg, rgba(201,168,76,0.16), rgba(120,85,20,0.22))",
              border: "1px solid rgba(201,168,76,0.38)",
              display: "grid", placeItems: "center",
              boxShadow: "0 0 28px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,220,100,0.12)",
            }}>
              <Key style={{ width: 26, height: 26, color: "#C9A84C" }} />
            </div>

            {/* Eyebrow + title */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,168,76,0.55)", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", margin: "0 0 6px" }}>
              Architect Path
            </p>
            <h2 style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 26, fontWeight: 700, fontStyle: "italic",
              color: "#C9A84C", textAlign: "center", margin: "0 0 10px",
              textShadow: "0 0 28px rgba(201,168,76,0.30)",
            }}>
              Sovereign Invites
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", textAlign: "center", lineHeight: 1.6, margin: "0 0 24px" }}>
              Build your legacy by bringing others into the fold. Pro members get exclusive referral tracking and Founder status rewards.
            </p>

            {/* Reward cards */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[
                { label: "You receive", value: "Founder's Badge + 50 XP" },
                { label: "They receive", value: "Founder's Badge + 50 XP" },
              ].map((item) => (
                <div key={item.label} style={{
                  flex: 1, padding: "10px 12px", borderRadius: 12,
                  background: "rgba(201,168,76,0.06)",
                  border: "1px solid rgba(201,168,76,0.18)",
                }}>
                  <p style={{ fontSize: 9, color: "rgba(201,168,76,0.50)", letterSpacing: "0.10em", textTransform: "uppercase", margin: "0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Invite link */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: badgeGranted ? 10 : 20,
              padding: "10px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.09)",
            }}>
              <Link2 style={{ width: 14, height: 14, color: "rgba(201,168,76,0.45)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                {inviteLink}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 8px", borderRadius: 6,
                  color: copied ? "#C9A84C" : "rgba(255,255,255,0.32)",
                  fontSize: 11, fontWeight: 600, flexShrink: 0, transition: "color 0.2s",
                }}
              >
                {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {badgeGranted && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                padding: "8px 12px", borderRadius: 10,
                background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.20)",
              }}>
                <Check style={{ width: 11, height: 11, color: "#C9A84C", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#C9A84C" }}>Founder's Badge already granted to your account</span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleShare}
              style={{
                width: "100%", height: 52, borderRadius: 16, marginBottom: 24,
                background: "linear-gradient(135deg, #9A7830 0%, #C9A84C 30%, #E8C870 55%, #C9A84C 80%, #9A7830 100%)",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700, color: "#1a0f00",
                letterSpacing: "0.05em",
                boxShadow: "0 2px 0 rgba(80,50,10,0.8), 0 6px 28px rgba(201,168,76,0.28)",
              }}
            >
              Send Founding Invite
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Community Pro Modal ──────────────────────────────────────────────────────
const PRO_BENEFITS = [
  { text: "Create unlimited private communities" },
  { text: "Set custom rules and invite-only access" },
  { text: "Full moderation and admin controls" },
  { text: "Exclusive PRO-only streams and events" },
];

function CommunityProModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="pro-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.80)",
          backdropFilter: "blur(10px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}
      >
        <motion.div
          key="pro-sheet"
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 64, opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 448, position: "relative" }}
        >
          {/* Gold-leaf border wrapper — 1.5px gradient border */}
          <div style={{
            background: "linear-gradient(160deg, #C9A84C 0%, #6B4410 18%, #E8C870 36%, #7A5018 54%, #C9A84C 72%, #E8C870 100%)",
            padding: "1.5px 1.5px 0",
            borderRadius: "28px 28px 0 0",
          }}>
            <div style={{
              background: "linear-gradient(170deg, rgba(18,12,4,0.99) 0%, rgba(10,8,2,0.99) 100%)",
              borderRadius: "27px 27px 0 0",
              padding: "26px 24px calc(36px + env(safe-area-inset-bottom))",
              position: "relative", overflow: "hidden",
            }}>
              {/* Subtle stone-grain overlay */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "repeating-linear-gradient(-28deg, transparent, transparent 10px, rgba(201,168,76,0.012) 10px, rgba(201,168,76,0.012) 11px)",
              }} />
              {/* Gold top-glow */}
              <div aria-hidden style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
                background: "linear-gradient(90deg, transparent, rgba(232,200,112,0.65), transparent)",
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Drag handle + corner X */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative" }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(201,168,76,0.25)" }} />
                  <button
                    onClick={onClose}
                    style={{
                      position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                      width: 30, height: 30, borderRadius: 10, border: "none", cursor: "pointer",
                      background: "rgba(201,168,76,0.08)", color: "rgba(201,168,76,0.45)",
                      display: "grid", placeItems: "center",
                    }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {/* Digital Crest / Throne icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <svg width="72" height="78" viewBox="0 0 72 78" fill="none" aria-hidden>
                    {/* Shield */}
                    <path d="M36 4 L66 16 L66 44 Q66 66 36 76 Q6 66 6 44 L6 16 Z"
                      fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.38)" strokeWidth="1.4"/>
                    {/* Inner shield bevel */}
                    <path d="M36 12 L58 22 L58 43 Q58 60 36 68 Q14 60 14 43 L14 22 Z"
                      fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
                    {/* Crown base bar */}
                    <rect x="22" y="39" width="28" height="5" rx="2" fill="rgba(201,168,76,0.60)"/>
                    {/* Crown points */}
                    <path d="M22 39 L22 28 L28 34 L36 26 L44 34 L50 28 L50 39 Z"
                      fill="rgba(201,168,76,0.70)" stroke="rgba(201,168,76,0.90)" strokeWidth="0.8"/>
                    {/* Gem dots on crown tips */}
                    <circle cx="22" cy="27" r="2.8" fill="#C9A84C"/>
                    <circle cx="36" cy="24" r="2.8" fill="#E8C870"/>
                    <circle cx="50" cy="27" r="2.8" fill="#C9A84C"/>
                    {/* Shield dividers */}
                    <line x1="36" y1="46" x2="36" y2="66" stroke="rgba(201,168,76,0.20)" strokeWidth="1"/>
                    <line x1="9"  y1="54" x2="63" y2="54" stroke="rgba(201,168,76,0.20)" strokeWidth="1"/>
                    {/* Heraldic diamonds */}
                    <path d="M24 50 L28 54 L24 58 L20 54 Z" fill="rgba(201,168,76,0.28)"/>
                    <path d="M48 50 L52 54 L48 58 L44 54 Z" fill="rgba(201,168,76,0.28)"/>
                  </svg>
                </div>

                {/* Eyebrow + headline */}
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(201,168,76,0.55)", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", margin: "0 0 6px" }}>
                  Leader Path
                </p>
                <h2 style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: 28, fontWeight: 700, fontStyle: "italic",
                  color: "#C9A84C", textAlign: "center", margin: "0 0 8px",
                  textShadow: "0 0 32px rgba(201,168,76,0.40)",
                }}>
                  Community Creator
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", textAlign: "center", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Build your own space. Set the rules.<br />Lead the recovery.
                </p>

                {/* Benefits */}
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {PRO_BENEFITS.map((b) => (
                    <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.30)",
                        display: "grid", placeItems: "center",
                      }}>
                        <Check style={{ width: 11, height: 11, color: "#C9A84C" }} />
                      </div>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.4 }}>{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA — embossed gold bar */}
                <button
                  onClick={() => { onClose(); triggerPaywall(); }}
                  style={{
                    width: "100%", height: 54, borderRadius: 16,
                    background: "linear-gradient(135deg, #9A7830 0%, #C9A84C 25%, #E8C870 50%, #C9A84C 75%, #9A7830 100%)",
                    border: "none", cursor: "pointer",
                    fontSize: 15, fontWeight: 700, color: "#1a0f00",
                    letterSpacing: "0.05em",
                    boxShadow: "0 2px 0 rgba(60,35,5,0.9), 0 6px 32px rgba(201,168,76,0.30)",
                  }}
                >
                  Upgrade to PRO
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function CommunityPage() {
  const [state, update] = useAppState();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [joinedRooms, setJoinedRooms] = useState<string[]>(["global"]);
  const [showCreate, setShowCreate] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showFounderToast, setShowFounderToast] = useState(false);
  const [userRooms, setUserRooms] = useState<Room[]>([]);
  const [checkedIn, setCheckedIn] = useState(() => {
    const ts = parseInt(localStorage.getItem("stopamine.community.checkin") ?? "0", 10);
    return ts > 0 && Date.now() - ts < 86400000;
  });

  const handleCheckIn = () => {
    localStorage.setItem("stopamine.community.checkin", String(Date.now()));
    setCheckedIn(true);
  };

  // ── Sovereign Invite access guard ────────────────────────────────────────────
  const handleSovereignInvite = () => {
    if (!state.isPremium) {
      setShowProModal(true);
      return;
    }
    setShowInviteModal(true);
  };

  // ── Founder badge ────────────────────────────────────────────────────────────
  const grantFounderBadge = () => {
    update((s) => ({
      badges: s.badges.includes("founder") ? s.badges : [...s.badges, "founder"],
      treeXP: s.treeXP + 50,
    }));
    setShowFounderToast(true);
  };

  // Detect ?fi= invite code on mount (receiver flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fi = params.get("fi");
    if (fi && !localStorage.getItem("stopamine.founder_claimed")) {
      localStorage.setItem("stopamine.founder_claimed", "1");
      grantFounderBadge();
      window.history.replaceState({}, "", "/community");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dev panel ────────────────────────────────────────────────────────────────
  const [devOpen, setDevOpen] = useState(false);
  const [devExtraMembers, setDevExtraMembers] = useState(0);
  const [devRooms, setDevRooms] = useState<Room[]>([]);
  const devTapCount = useRef(0);
  const devTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDevTap() {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 600);
    if (devTapCount.current >= 3) {
      devTapCount.current = 0;
      setDevOpen((v) => !v);
    }
  }

  let devDummyCount = useRef(0);

  useEffect(() => {
    supabase
      .from("rooms")
      .select("id, name, description, member_count")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const fetched: Room[] = data.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          icon: Users,
          color: "oklch(0.55 0.15 220)",
          memberCount: r.member_count,
        }));
        setUserRooms(fetched);
      });
  }, []);

  const handleJoin = (room: Room) => {
    if (!joinedRooms.includes(room.id)) setJoinedRooms((prev) => [...prev, room.id]);
    setActiveRoom(room);
  };

  const handleRoomCreated = (room: Room) => {
    setUserRooms((prev) => [...prev, room]);
    setShowCreate(false);
  };

  if (showCreate) {
    return <CreateRoomScreen onBack={() => setShowCreate(false)} onCreate={handleRoomCreated} />;
  }

  if (activeRoom) {
    return <ChatScreen room={activeRoom} onBack={() => setActiveRoom(null)} />;
  }

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <div onClick={handleDevTap} style={{ cursor: "default", userSelect: "none", display: "inline-block" }}>
          <SectionTitle>Community</SectionTitle>
        </div>
        <div onClick={handleDevTap} style={{ cursor: "default", userSelect: "none", display: "block" }}>
          <h1 className="mt-2 text-3xl font-bold">You're not alone.</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.60 0.018 265 / 0.75)" }}>
          Real people, doing the same work, right now.
        </p>
        <ImpactTicker />
      </header>

      {/* ── Dev Panel (triple-tap "Community" or "You're not alone." to toggle) ── */}
      {devOpen && (
        <div style={{
          margin: "8px 16px 0",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,80,80,0.35)",
          backdropFilter: "blur(16px)",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#ff5555", textTransform: "uppercase" }}>
              🛠 Dev Mode
            </span>
            <button onClick={() => setDevOpen(false)} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>

          {/* ── SECTION 1: ACCESS ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Access</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["FREE", "PRO"] as const).map((tier) => {
              const isActive = tier === "PRO" ? state.isPremium : !state.isPremium;
              return (
                <button key={tier} onClick={() => update({ isPremium: tier === "PRO" })}
                  style={{
                    fontSize: 11, padding: "5px 16px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid rgba(201,168,76,0.55)" : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                  {tier}
                </button>
              );
            })}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", alignSelf: "center", marginLeft: 4 }}>
              {state.isPremium ? "Full access" : "Create locked"}
            </span>
          </div>

          {/* ── SECTION 2: MEMBERS ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Members</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <button
              onClick={() => setDevExtraMembers((n) => n + 100)}
              style={{
                fontSize: 11, padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.30)",
                color: "#C9A84C", fontWeight: 600,
              }}>
              + 100 members
            </button>
            <button
              onClick={() => setDevExtraMembers(0)}
              style={{
                fontSize: 11, padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.55)", fontWeight: 400,
              }}>
              Reset
            </button>
            {devExtraMembers > 0 && (
              <span style={{ fontSize: 11, color: "#C9A84C", alignSelf: "center", marginLeft: 4 }}>
                +{devExtraMembers} added
              </span>
            )}
          </div>

          {/* ── SECTION 3: COMMUNITIES ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Communities</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => {
                devDummyCount.current += 1;
                const n = devDummyCount.current;
                setDevRooms((prev) => [...prev, {
                  id: `dev-${n}`,
                  name: `Test Room ${n}`,
                  description: `Dev dummy community #${n} for testing.`,
                  icon: Users,
                  color: "oklch(0.55 0.15 220)",
                  memberCount: Math.floor(Math.random() * 500) + 50,
                }]);
              }}
              style={{
                fontSize: 11, padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.30)",
                color: "#C9A84C", fontWeight: 600,
              }}>
              Add dummy
            </button>
            <button
              onClick={() => { setDevRooms([]); devDummyCount.current = 0; }}
              style={{
                fontSize: 11, padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.55)", fontWeight: 400,
              }}>
              Clear added
            </button>
            {devRooms.length > 0 && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", alignSelf: "center", marginLeft: 4 }}>
                {devRooms.length} added
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── World map hero ───────────────────────────────────── */}
      <div className="fade-up-1">
        <WorldMapHero userCheckedIn={checkedIn} extraMembers={devExtraMembers} />
      </div>

      {/* ── Global check-in bar ──────────────────────────────── */}
      <GlobalCheckInBar checkedIn={checkedIn} onCheckIn={handleCheckIn} />

      {/* ── Room list ────────────────────────────────────────── */}
      <section className="px-6 mt-2 fade-up-2">
        <div className="space-y-0">
          {[...ROOMS, ...userRooms, ...devRooms].map((room, i, all) => {
            const joined = joinedRooms.includes(room.id);
            const Icon = room.icon;
            return (
              <button
                key={room.id}
                onClick={() => handleJoin(room)}
                className="w-full text-left flex items-start gap-4 py-4 transition-opacity active:opacity-70"
                style={{ borderBottom: i < all.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                {/* Icon */}
                <div
                  className="h-11 w-11 rounded-2xl grid place-items-center shrink-0 mt-0.5"
                  style={{ background: `${room.color}18`, border: `1px solid ${room.color}30` }}
                >
                  <Icon className="h-5 w-5" style={{ color: room.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{room.name}</p>
                        {room.isGlobal && (
                          <span
                            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ color: "var(--primary)", background: "rgba(196,135,58,0.10)", border: "1px solid rgba(196,135,58,0.20)" }}
                          >
                            Live
                          </span>
                        )}
                        {room.locked && !room.isGlobal && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Lock style={{ width: 9, height: 9, color: "rgba(201,168,76,0.55)" }} />
                            <span className="text-[9px]" style={{ color: "rgba(201,168,76,0.55)", letterSpacing: "0.04em" }}>Private</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "oklch(0.55 0.015 265 / 0.75)" }}>
                        {room.description}
                      </p>
                    </div>

                    {/* Pill button */}
                    {joined ? (
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 mt-0.5"
                        style={{ border: "1px solid rgba(201,168,76,0.45)", color: "#C9A84C", background: "rgba(201,168,76,0.06)" }}
                      >
                        Open
                      </div>
                    ) : (
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 mt-0.5"
                        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.50)", background: "rgba(255,255,255,0.04)" }}
                      >
                        Join
                      </div>
                    )}
                  </div>

                  {/* Avatar stack + live/member count */}
                  <AvatarStack roomId={room.id} memberCount={room.memberCount} isGlobal={room.isGlobal} />
                  {/* Collective goal progress bar */}
                  <CollectiveGoalBar roomId={room.id} color={room.color} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────── */}
      <style>{`
        @keyframes si-silver-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(148,180,220,0); }
          50%       { box-shadow: 0 0 0 4px rgba(148,180,220,0.18); }
        }
        .si-silver-pulse { animation: si-silver-pulse 2.8s ease-in-out infinite; }
        .si-badge-hover  { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .si-badge-hover:hover { transform: scale(1.06); }
        .si-badge-hover:active { transform: scale(0.97); }
      `}</style>
      <section className="px-6 mt-6 pb-6 fade-up-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>

        {/* ① Create Community — full-width anchor row */}
        <button
          onClick={() => state.isPremium ? setShowCreate(true) : setShowProModal(true)}
          className="flex items-center gap-3 text-left w-full transition-all active:opacity-70"
          style={{
            padding: "14px 16px",
            borderRadius: 18,
            marginBottom: 12,
            background: state.isPremium
              ? "rgba(255,255,255,0.04)"
              : "rgba(201,168,76,0.05)",
            border: state.isPremium
              ? "1px solid rgba(255,255,255,0.09)"
              : "1px solid rgba(201,168,76,0.18)",
          }}
        >
          <div
            className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
            style={state.isPremium
              ? { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)" }
              : { background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.24)" }}
          >
            {state.isPremium
              ? <Plus className="h-5 w-5" />
              : <Lock className="h-5 w-5" style={{ color: "#C9A84C" }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Create Community</p>
              {!state.isPremium && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.30)", color: "#C9A84C", letterSpacing: "0.05em" }}
                >
                  PRO
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "oklch(0.52 0.015 265 / 0.55)" }}>
              {state.isPremium ? "Set custom rules, invite-only access, full moderation" : "Unlock private communities with custom rules"}
            </p>
          </div>
          {state.isPremium && (
            <div style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}
        </button>

        {/* ② + ③ — 2-column badge grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Sovereign Invite — Royal Gold badge (PRO badge hidden when already PRO) */}
          <button
            onClick={handleSovereignInvite}
            className="si-badge-hover text-left"
            style={{
              padding: "14px 14px 12px",
              borderRadius: 18,
              background: state.isPremium
                ? "linear-gradient(145deg, rgba(201,168,76,0.17) 0%, rgba(120,80,20,0.24) 100%)"
                : "linear-gradient(145deg, rgba(201,168,76,0.09) 0%, rgba(120,80,20,0.13) 100%)",
              border: state.isPremium
                ? "1px solid rgba(201,168,76,0.42)"
                : "1px solid rgba(201,168,76,0.24)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer line */}
            <div style={{
              position: "absolute", top: 0, left: "-60%", width: "40%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,220,120,0.06), transparent)",
              transform: "skewX(-15deg)", pointerEvents: "none",
            }} />

            {/* Icon row — Crown always; PRO badge only when FREE */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: "linear-gradient(135deg, rgba(201,168,76,0.22), rgba(120,80,20,0.30))",
                border: "1px solid rgba(201,168,76,0.40)",
                display: "grid", placeItems: "center",
                boxShadow: state.isPremium ? "0 0 16px rgba(201,168,76,0.28)" : "0 0 10px rgba(201,168,76,0.15)",
              }}>
                <Crown style={{ width: 15, height: 15, color: "#C9A84C" }} />
              </div>
              {/* Badge only visible to FREE users */}
              {!state.isPremium && (
                <span style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: "0.10em",
                  padding: "3px 7px", borderRadius: 999,
                  background: "linear-gradient(90deg, #C9A84C, #E8C870)",
                  color: "#1a0f00",
                }}>
                  PRO
                </span>
              )}
              {/* Active indicator for PRO users */}
              {state.isPremium && (
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#C9A84C",
                  boxShadow: "0 0 8px rgba(201,168,76,0.80)",
                  display: "block",
                }} />
              )}
            </div>

            <p style={{
              fontSize: 12, fontWeight: 700, margin: "0 0 3px", lineHeight: 1.3,
              color: state.isPremium ? "#C9A84C" : "rgba(201,168,76,0.75)",
            }}>
              Sovereign Invite
            </p>
            <p style={{ fontSize: 10, margin: 0, lineHeight: 1.4, color: state.isPremium ? "rgba(201,168,76,0.65)" : "rgba(201,168,76,0.42)" }}>
              {state.isPremium ? "Founding Invite · Badge + 50 XP" : "PRO — Tap to unlock"}
            </p>
          </button>

          {/* Invite to Global — Mystical Silver badge */}
          <button
            onClick={() => {
              const link = `${window.location.origin}/community`;
              if (navigator.share) {
                navigator.share({ title: "Join me on Stopamine", text: "Come join the Global recovery community.", url: link });
              } else {
                navigator.clipboard.writeText(link);
              }
            }}
            className="si-badge-hover si-silver-pulse text-left"
            style={{
              padding: "14px 14px 12px",
              borderRadius: 18,
              background: "linear-gradient(145deg, rgba(148,180,220,0.09) 0%, rgba(80,110,160,0.12) 100%)",
              border: "1px solid rgba(148,180,220,0.22)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Brushed-metal sheen */}
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(92deg, transparent, transparent 3px, rgba(180,210,255,0.018) 3px, rgba(180,210,255,0.018) 4px)",
              pointerEvents: "none",
            }} />
            {/* Globe icon row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: "linear-gradient(135deg, rgba(148,180,220,0.18), rgba(80,110,160,0.22))",
                border: "1px solid rgba(148,180,220,0.30)",
                display: "grid", placeItems: "center",
                boxShadow: "0 0 12px rgba(148,180,220,0.15)",
              }}>
                <Globe style={{ width: 15, height: 15, color: "rgba(180,210,255,0.85)" }} />
              </div>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
                padding: "3px 7px", borderRadius: 999,
                background: "rgba(148,180,220,0.14)",
                border: "1px solid rgba(148,180,220,0.28)",
                color: "rgba(180,210,255,0.80)",
              }}>
                FREE
              </span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(200,220,255,0.90)", margin: "0 0 3px", lineHeight: 1.3 }}>
              Invite to Global
            </p>
            <p style={{ fontSize: 10, color: "rgba(148,180,220,0.55)", margin: 0, lineHeight: 1.4 }}>
              Open to all · Share community link
            </p>
          </button>

        </div>
      </section>

      {/* ── Modals & toasts ──────────────────────────────────── */}
      {showProModal && <CommunityProModal onClose={() => setShowProModal(false)} />}
      {showInviteModal && (
        <SovereignInviteModal
          isPro={state.isPremium}
          onClose={() => setShowInviteModal(false)}
          onGrantBadge={grantFounderBadge}
        />
      )}
      <AnimatePresence>
        {showFounderToast && (
          <FounderBadgeToast onDone={() => setShowFounderToast(false)} />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

// ─── Chat screen ──────────────────────────────────────────────────────────────
function ChatScreen({ room, onBack }: { room: Room; onBack: () => void }) {
  const [state] = useAppState();
  // Flagship = addiction with most days — shown in community regardless of active tab
  const flagship = flagshipAddiction(state);
  const day = flagship ? dayCount(flagship.startDate) : 1;
  const stage = treeStage(state.treeXP);

  const [messages, setMessages] = useState<Message[]>(() => makeMockMessages()[room.id] ?? []);
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userName = state.onboarding?.name ?? "You";
  const userInitial = userName[0]?.toUpperCase() ?? "Y";
  const userBadge = currentBadge(day);
  const userRank  = userBadge?.name ?? "Spark";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || cooldown > 0) return;
    const msg: Message = {
      id: `local-${Date.now()}`, userId: "me", name: userName, initial: userInitial,
      avatarColor: "oklch(0.55 0.18 260)", rank: userRank, text, ts: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    if (room.isGlobal) startCooldown();
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      <PremiumBackground />
      <header className="sticky top-0 z-30 backdrop-blur-xl px-4 py-3 flex items-center gap-3"
        style={{ background: "oklch(0.13 0.020 265 / 0.92)", borderBottom: "1px solid oklch(0.20 0.025 265 / 0.7)" }}>
        <button onClick={onBack}
          className="h-9 w-9 rounded-xl grid place-items-center transition-colors"
          style={{ border: "1px solid oklch(0.22 0.03 265)", color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{room.name}</p>
          <p className="text-[10px] text-muted-foreground">{room.memberCount.toLocaleString()} members</p>
        </div>
        {room.isGlobal && (
          <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ color: "var(--primary)", background: "rgba(196,135,58,0.08)", border: "1px solid rgba(196,135,58,0.20)" }}>
            Live
          </span>
        )}
      </header>

      {room.isGlobal && (
        <div className="px-4 py-2.5" style={{ background: "oklch(0.15 0.020 265 / 0.6)", borderBottom: "1px solid oklch(0.20 0.025 265 / 0.5)" }}>
          <p className="text-[10px] text-center" style={{ color: "oklch(0.52 0.015 265 / 0.7)" }}>
            10-second cooldown between messages · Be kind
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-32">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <MessageCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/50">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === "me";
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <div className="h-8 w-8 rounded-full grid place-items-center text-[11px] font-bold text-white shrink-0 mt-0.5"
                  style={{ background: msg.avatarColor }}>
                  {msg.initial}
                </div>
              )}
              <div className={`max-w-[76%] space-y-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{msg.name}</span>
                    {(() => {
                      const bc = BADGE_COLORS[msg.rank];
                      if (!bc) return null;
                      const badge = BADGES.find(b => b.name === msg.rank);
                      return (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{
                            color: bc.color,
                            background: bc.glow,
                            border: `1px solid ${bc.color}40`,
                            textShadow: `0 0 8px ${bc.color}80`,
                          }}
                        >
                          {badge?.symbol} {msg.rank}
                        </span>
                      );
                    })()}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMe ? "text-primary-foreground rounded-tr-sm" : "rounded-tl-sm"}`}
                  style={isMe
                    ? { background: "var(--gradient-primary)" }
                    : { background: "var(--card)", border: "1px solid oklch(0.22 0.025 265 / 0.6)" }
                  }
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground/50">{timeAgo(msg.ts)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto backdrop-blur-xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        style={{ background: "oklch(0.13 0.020 265 / 0.95)", borderTop: "1px solid oklch(0.20 0.025 265 / 0.7)" }}>
        {cooldown > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <div className="h-0.5 flex-1 rounded-full overflow-hidden" style={{ background: "oklch(0.22 0.03 265)" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${((COOLDOWN_SECS - cooldown) / COOLDOWN_SECS) * 100}%`, background: "var(--gradient-primary)" }} />
            </div>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">Send in {cooldown}s</span>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={cooldown > 0 ? `Wait ${cooldown}s…` : "Say something…"}
            disabled={cooldown > 0}
            className="flex-1 h-11 rounded-xl px-4 text-sm focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(0.25 0.03 265)", color: "var(--foreground)" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || cooldown > 0}
            className="h-11 w-11 rounded-xl grid place-items-center text-primary-foreground disabled:opacity-30 transition"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create room screen ───────────────────────────────────────────────────────
function CreateRoomScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (room: Room) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    setError(null);

    const { data: roomId, error: rpcError } = await supabase.rpc("create_room", {
      p_name: name.trim(),
      p_description: description.trim(),
      p_is_private: isPrivate,
      p_password: null,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    const newRoom: Room = {
      id: roomId as string,
      name: name.trim(),
      description: description.trim(),
      icon: Users,
      color: "oklch(0.55 0.15 220)",
      memberCount: 1,
    };

    setDone(true);
    setTimeout(() => onCreate(newRoom), 1200);
  };

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl grid place-items-center" style={{ background: "oklch(0.52 0.14 150 / 0.15)", color: "oklch(0.60 0.18 150)" }}>
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Community created.</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Your room is live. Invite others to join.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      <PremiumBackground />
      <header className="px-4 pt-12 pb-6 flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl grid place-items-center transition-colors"
          style={{ border: "1px solid oklch(0.22 0.03 265)", color: "var(--muted-foreground)" }}>
          <X className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">Create a community</h1>
      </header>

      <div className="px-6 space-y-5 flex-1">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Community name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dutch Brothers, Night Owls…"
            className="w-full h-12 rounded-xl px-4 text-sm focus:outline-none transition-colors"
            style={{ background: "var(--card)", border: "1px solid oklch(0.25 0.03 265)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this community about?"
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none transition-colors"
            style={{ background: "var(--card)", border: "1px solid oklch(0.25 0.03 265)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex items-center justify-between py-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)", borderBottom: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
          <div>
            <p className="text-sm font-semibold">Private community</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Only people you invite can join</p>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`h-6 w-11 rounded-full transition-colors relative`}
            style={{ background: isPrivate ? "var(--primary)" : "oklch(0.22 0.03 265)" }}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPrivate ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        )}
        <button
          onClick={handleCreate}
          disabled={!name.trim() || loading}
          className="w-full h-12 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-30 transition"
          style={{ background: "var(--gradient-primary)" }}
        >
          {loading ? "Creating…" : "Create community"}
        </button>
      </div>
    </div>
  );
}

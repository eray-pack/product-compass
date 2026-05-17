import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount, activeAddiction } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Send, Lock, Plus, Users, Globe, Book, Dumbbell,
  Heart, MessageCircle, Crown, Shield, Check, X
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
      { id: "1", userId: "u1", name: "Marcus",  initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Elite",       text: "day 61 checking in. feeling sharp today.", ts: now - 1000 * 60 * 4 },
      { id: "2", userId: "u2", name: "Arjun",   initial: "A", avatarColor: "oklch(0.50 0.15 290)", rank: "Legendary",   text: "112 days. the urges barely register anymore. it gets easier.", ts: now - 1000 * 60 * 3 },
      { id: "3", userId: "u3", name: "Timo",    initial: "T", avatarColor: "oklch(0.55 0.17 30)",  rank: "Disciplined", text: "used the sos button last night. worked. still going.", ts: now - 1000 * 60 * 2 },
      { id: "4", userId: "u4", name: "Noah",    initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awakened",    text: "first week done. harder than i thought but i'm here", ts: now - 1000 * 60 * 1 },
      { id: "5", userId: "u5", name: "Jaylen",  initial: "J", avatarColor: "oklch(0.52 0.16 145)", rank: "Respected",   text: "relapsed on day 28 but came back day 29. momentum never stopped.", ts: now - 1000 * 30 },
    ],
    bible: [
      { id: "b1", userId: "u6", name: "Samuel",  initial: "S", avatarColor: "oklch(0.55 0.17 60)", rank: "Elite",     text: "praying for everyone here tonight. you're not alone in this.", ts: now - 1000 * 60 * 5 },
      { id: "b2", userId: "u7", name: "Dimitri", initial: "D", avatarColor: "oklch(0.56 0.16 60)", rank: "Legendary", text: "1 Cor 10:13 — he will not let you be tempted beyond what you can bear.", ts: now - 1000 * 60 * 2 },
    ],
    fitness: [
      { id: "f1", userId: "u8", name: "Kenji",  initial: "K", avatarColor: "oklch(0.54 0.14 180)", rank: "Elite", text: "replaced the urge with a cold shower + 20 pushups. works every time.", ts: now - 1000 * 60 * 8 },
      { id: "f2", userId: "u9", name: "Marcus", initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Elite", text: "ran 5k this morning. day 61. body feels different.", ts: now - 1000 * 60 * 3 },
    ],
    relationships: [],
    mental: [
      { id: "m1", userId: "u10", name: "Timo", initial: "T", avatarColor: "oklch(0.55 0.17 30)",  rank: "Disciplined", text: "anyone else notice anxiety drops significantly after 2 weeks clean?", ts: now - 1000 * 60 * 10 },
      { id: "m2", userId: "u11", name: "Noah", initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awakened",    text: "yes. the brain fog lifted around day 10 for me.", ts: now - 1000 * 60 * 6 },
    ],
  };
}

const RANK_COLORS: Record<string, string> = {
  Legendary:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Elite:       "text-primary bg-primary/10 border-primary/30",
  Respected:   "text-success bg-success/10 border-success/30",
  Disciplined: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Awakened:    "text-muted-foreground bg-secondary border-border",
  Beginner:    "text-muted-foreground bg-secondary border-border",
};

const COOLDOWN_SECS = 10;

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

// ─── Activity dots for the flat world map ────────────────────────────────────
// Coordinates are [longitude, latitude] — GeoJSON convention
const ACTIVITY_DOTS: { name: string; coords: [number, number] }[] = [
  { name: "New York",   coords: [-74,    41    ] },
  { name: "London",     coords: [-0.1,   51.5  ] },
  { name: "Amsterdam",  coords: [4.9,    52.4  ] },
  { name: "Paris",      coords: [2.3,    48.9  ] },
  { name: "Berlin",     coords: [13.4,   52.5  ] },
  { name: "São Paulo",  coords: [-46.6, -23.5  ] },
  { name: "Lagos",      coords: [3.4,    6.5   ] },
  { name: "Dubai",      coords: [55.3,   25.2  ] },
  { name: "Mumbai",     coords: [72.8,   19.1  ] },
  { name: "Singapore",  coords: [103.8,   1.3  ] },
  { name: "Tokyo",      coords: [139.7,  35.7  ] },
  { name: "Sydney",     coords: [151.2, -33.9  ] },
];

function WorldMapHero() {
  const [liveCount, setLiveCount] = useState(248);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((n) => Math.max(240, Math.min(260, n + Math.floor(Math.random() * 5) - 2)));
    }, 3500);
    return () => clearInterval(id);
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
          {liveCount} active now
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

          {/* Activity dots — pulsing gold */}
          {ACTIVITY_DOTS.map(({ name, coords }, i) => (
            <Marker key={name} coordinates={coords}>
              {/* Expanding ring — staggered delay per dot */}
              <circle
                r={3.5}
                fill="#C4873A"
                fillOpacity={0.35}
                className="rsm-dot-ring"
                style={{ animationDelay: `${(i * 0.18) % 2}s` }}
              />
              {/* Solid gold core */}
              <circle
                r={2.2}
                fill="#C4873A"
                fillOpacity={0.95}
                style={{ filter: "drop-shadow(0 0 3px #C4873A)" }}
              />
            </Marker>
          ))}
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
      {/* Overlapping circles */}
      <div className="flex">
        {shown.map((av, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-full grid place-items-center text-[8px] font-bold text-white border border-card"
            style={{
              background: av.bg,
              marginLeft: i > 0 ? -6 : 0,
              zIndex: shown.length - i,
              position: "relative",
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

// ─── Main page ────────────────────────────────────────────────────────────────
function CommunityPage() {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [joinedRooms, setJoinedRooms] = useState<string[]>(["global"]);
  const [showCreate, setShowCreate] = useState(false);
  const [userRooms, setUserRooms] = useState<Room[]>([]);

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
        <SectionTitle>Community</SectionTitle>
        <h1 className="mt-2 text-3xl font-bold">You're not alone.</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "oklch(0.60 0.018 265 / 0.75)" }}>
          Real people, doing the same work, right now.
        </p>
      </header>

      {/* ── World map hero ───────────────────────────────────── */}
      <div className="fade-up-1">
        <WorldMapHero />
      </div>

      {/* ── Room list ────────────────────────────────────────── */}
      <section className="px-6 mt-2 fade-up-2">
        <div className="space-y-0">
          {[...ROOMS, ...userRooms].map((room, i, all) => {
            const joined = joinedRooms.includes(room.id);
            const Icon = room.icon;
            return (
              <button
                key={room.id}
                onClick={() => handleJoin(room)}
                className="w-full text-left flex items-start gap-4 py-4 transition-opacity active:opacity-70"
                style={{ borderBottom: i < all.length - 1 ? "1px solid oklch(0.20 0.025 265 / 0.6)" : "none" }}
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
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "oklch(0.55 0.015 265 / 0.75)" }}>
                        {room.description}
                      </p>
                    </div>

                    {/* Pill button */}
                    {joined ? (
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 mt-0.5"
                        style={{ border: "1px solid oklch(0.28 0.03 265 / 0.55)", color: "var(--muted-foreground)", background: "oklch(0.18 0.02 265 / 0.5)" }}
                      >
                        Open
                      </div>
                    ) : (
                      <div
                        className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 mt-0.5"
                        style={{ border: "1px solid #C4873A66", color: "#C4873A", background: "rgba(196,135,58,0.08)" }}
                      >
                        Join
                      </div>
                    )}
                  </div>

                  {/* Avatar stack + live/member count */}
                  <AvatarStack roomId={room.id} memberCount={room.memberCount} isGlobal={room.isGlobal} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Create community ─────────────────────────────────── */}
      <section className="px-6 mt-8 pb-6 fade-up-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-3 text-left w-full transition-opacity active:opacity-70"
        >
          <div
            className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: "oklch(0.62 0.22 255 / 0.08)", color: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Create a community</p>
            <p className="text-[11px]" style={{ color: "oklch(0.52 0.015 265 / 0.65)" }}>Invite friends, set your own rules</p>
          </div>
        </button>
      </section>
    </PageShell>
  );
}

// ─── Chat screen ──────────────────────────────────────────────────────────────
function ChatScreen({ room, onBack }: { room: Room; onBack: () => void }) {
  const [state] = useAppState();
  const active = activeAddiction(state);
  const day = active ? dayCount(active.startDate) : 1;
  const stage = treeStage(state.treeXP);

  const [messages, setMessages] = useState<Message[]>(() => makeMockMessages()[room.id] ?? []);
  const [input, setInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userName = state.onboarding?.name ?? "You";
  const userInitial = userName[0]?.toUpperCase() ?? "Y";
  const userRank = stage.name === "Ancient tree" ? "Legendary"
    : stage.name === "Strong tree" ? "Elite"
    : stage.name === "Young tree" ? "Respected"
    : stage.name === "Sapling" ? "Disciplined"
    : stage.name === "Sprout" ? "Awakened"
    : "Beginner";

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
    <div className="min-h-screen max-w-md mx-auto flex flex-col" style={{ background: "var(--background)" }}>
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
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${RANK_COLORS[msg.rank]}`}>
                      {msg.rank}
                    </span>
                    {msg.rank === "Legendary" && <Crown className="h-3 w-3 text-amber-400" />}
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
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center px-6 gap-4 text-center" style={{ background: "var(--background)" }}>
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
    <div className="min-h-screen max-w-md mx-auto flex flex-col" style={{ background: "var(--background)" }}>
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

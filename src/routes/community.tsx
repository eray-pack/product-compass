import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount, activeAddiction } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Send, Lock, Plus, Users, Globe, Book, Dumbbell,
  Heart, MessageCircle, Crown, Shield, Check, X
} from "lucide-react";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Static data ─────────────────────────────────────────────────────────────

const ROOMS: Room[] = [
  {
    id: "global",
    name: "Global Chat",
    description: "Everyone is here. 10-second cooldown per message.",
    icon: Globe,
    color: "oklch(0.55 0.18 260)",
    memberCount: 46847,
    isGlobal: true,
  },
  {
    id: "bible",
    name: "Bible & Faith",
    description: "Recovery through faith. All beliefs welcome.",
    icon: Book,
    color: "oklch(0.55 0.17 60)",
    memberCount: 3241,
  },
  {
    id: "fitness",
    name: "Fitness Mode",
    description: "Replace the habit with movement. Share your workouts.",
    icon: Dumbbell,
    color: "oklch(0.52 0.16 145)",
    memberCount: 5890,
  },
  {
    id: "relationships",
    name: "Relationship Talk",
    description: "How this affects the people around us.",
    icon: Heart,
    color: "oklch(0.55 0.18 10)",
    memberCount: 2107,
  },
  {
    id: "mental",
    name: "Mental Health",
    description: "Anxiety, depression, and the connection to addiction.",
    icon: Shield,
    color: "oklch(0.50 0.15 290)",
    memberCount: 4562,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  global: [
    { id: "1", userId: "u1", name: "Marcus", initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Elite", text: "day 61 checking in. feeling sharp today.", ts: Date.now() - 1000 * 60 * 4 },
    { id: "2", userId: "u2", name: "Arjun", initial: "A", avatarColor: "oklch(0.50 0.15 290)", rank: "Legendary", text: "112 days. the urges barely register anymore. it gets easier.", ts: Date.now() - 1000 * 60 * 3 },
    { id: "3", userId: "u3", name: "Timo", initial: "T", avatarColor: "oklch(0.55 0.17 30)", rank: "Disciplined", text: "used the sos button last night. worked. still going.", ts: Date.now() - 1000 * 60 * 2 },
    { id: "4", userId: "u4", name: "Noah", initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awakened", text: "first week done. harder than i thought but i'm here", ts: Date.now() - 1000 * 60 * 1 },
    { id: "5", userId: "u5", name: "Jaylen", initial: "J", avatarColor: "oklch(0.52 0.16 145)", rank: "Respected", text: "relapsed on day 28 but came back day 29. momentum never stopped.", ts: Date.now() - 1000 * 30 },
  ],
  bible: [
    { id: "b1", userId: "u6", name: "Samuel", initial: "S", avatarColor: "oklch(0.55 0.17 60)", rank: "Elite", text: "praying for everyone here tonight. you're not alone in this.", ts: Date.now() - 1000 * 60 * 5 },
    { id: "b2", userId: "u7", name: "Dimitri", initial: "D", avatarColor: "oklch(0.56 0.16 60)", rank: "Legendary", text: "1 Cor 10:13 — he will not let you be tempted beyond what you can bear.", ts: Date.now() - 1000 * 60 * 2 },
  ],
  fitness: [
    { id: "f1", userId: "u8", name: "Kenji", initial: "K", avatarColor: "oklch(0.54 0.14 180)", rank: "Elite", text: "replaced the urge with a cold shower + 20 pushups. works every time.", ts: Date.now() - 1000 * 60 * 8 },
    { id: "f2", userId: "u9", name: "Marcus", initial: "M", avatarColor: "oklch(0.55 0.18 260)", rank: "Elite", text: "ran 5k this morning. day 61. body feels different.", ts: Date.now() - 1000 * 60 * 3 },
  ],
  relationships: [],
  mental: [
    { id: "m1", userId: "u10", name: "Timo", initial: "T", avatarColor: "oklch(0.55 0.17 30)", rank: "Disciplined", text: "anyone else notice anxiety drops significantly after 2 weeks clean?", ts: Date.now() - 1000 * 60 * 10 },
    { id: "m2", userId: "u11", name: "Noah", initial: "N", avatarColor: "oklch(0.53 0.18 200)", rank: "Awakened", text: "yes. the brain fog lifted around day 10 for me.", ts: Date.now() - 1000 * 60 * 6 },
  ],
};

const RANK_COLORS: Record<string, string> = {
  Legendary: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Elite: "text-primary bg-primary/10 border-primary/30",
  Respected: "text-success bg-success/10 border-success/30",
  Disciplined: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Awakened: "text-muted-foreground bg-secondary border-border",
  Beginner: "text-muted-foreground bg-secondary border-border",
};

const COOLDOWN_SECS = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

function CommunityPage() {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [joinedRooms, setJoinedRooms] = useState<string[]>(["global"]);
  const [showCreate, setShowCreate] = useState(false);

  const handleJoin = (room: Room) => {
    if (!joinedRooms.includes(room.id)) {
      setJoinedRooms((prev) => [...prev, room.id]);
    }
    setActiveRoom(room);
  };

  if (showCreate) {
    return <CreateRoomScreen onBack={() => setShowCreate(false)} onCreate={(name) => {
      setShowCreate(false);
    }} />;
  }

  if (activeRoom) {
    return (
      <ChatScreen
        room={activeRoom}
        onBack={() => setActiveRoom(null)}
      />
    );
  }

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Community</p>
        <h1 className="mt-2 text-3xl font-bold">Find your people.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join a room. Talk to real people doing the same work.</p>
      </header>

      {/* Create room */}
      <section className="px-6 mt-6">
        <button onClick={() => setShowCreate(true)}
          className="w-full rounded-2xl border border-dashed border-border bg-card/50 p-4 flex items-center gap-3 hover:border-primary/40 transition">
          <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Create a community</p>
            <p className="text-[11px] text-muted-foreground">Invite friends, set your own rules</p>
          </div>
        </button>
      </section>

      {/* Room list */}
      <section className="px-6 mt-4 space-y-3 pb-4">
        {ROOMS.map((room) => {
          const joined = joinedRooms.includes(room.id);
          const Icon = room.icon;
          return (
            <button key={room.id} onClick={() => handleJoin(room)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left flex items-center gap-4 hover:border-primary/40 transition">
              <div className="h-12 w-12 rounded-2xl grid place-items-center shrink-0"
                style={{ background: `${room.color}22`, border: `1px solid ${room.color}44` }}>
                <Icon className="h-6 w-6" style={{ color: room.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{room.name}</p>
                  {room.isGlobal && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">Live</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{room.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{room.memberCount.toLocaleString()} members</span>
                </div>
              </div>
              <div className="shrink-0">
                {joined ? (
                  <span className="text-[10px] text-primary font-medium">Open →</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground border border-border px-2 py-1 rounded-full">Join</span>
                )}
              </div>
            </button>
          );
        })}
      </section>
    </PageShell>
  );
}

// ─── Chat screen ──────────────────────────────────────────────────────────────

function ChatScreen({ room, onBack }: { room: Room; onBack: () => void }) {
  const [state] = useAppState();
  const active = activeAddiction(state);
  const day = dayCount(active.startDate);
  const stage = treeStage(state.treeXP);

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[room.id] ?? []);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECS);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || cooldown > 0) return;
    const msg: Message = {
      id: `local-${Date.now()}`,
      userId: "me",
      name: userName,
      initial: userInitial,
      avatarColor: "oklch(0.55 0.18 260)",
      rank: userRank,
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
    if (room.isGlobal) startCooldown();
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl border border-border grid place-items-center text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{room.name}</p>
          <p className="text-[10px] text-muted-foreground">{room.memberCount.toLocaleString()} members</p>
        </div>
        {room.isGlobal && (
          <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Live</span>
        )}
      </header>

      {/* Global chat cooldown notice */}
      {room.isGlobal && (
        <div className="px-4 py-2 bg-secondary/40 border-b border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Global chat · 10-second cooldown between messages · Be respectful
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === "me";
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold text-white shrink-0 mt-1"
                  style={{ background: msg.avatarColor }}>
                  {msg.initial}
                </div>
              )}
              <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {!isMe && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{msg.name}</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${RANK_COLORS[msg.rank]}`}>
                      {msg.rank}
                    </span>
                    {msg.rank === "Legendary" && <Crown className="h-3 w-3 text-amber-400" />}
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe
                    ? "text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                }`}
                  style={isMe ? { background: "var(--gradient-primary)" } : {}}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground">{timeAgo(msg.ts)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto border-t border-border bg-card/95 backdrop-blur-xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {cooldown > 0 && (
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${((COOLDOWN_SECS - cooldown) / COOLDOWN_SECS) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">Send in {cooldown}s</span>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Say something..."}
            disabled={cooldown > 0}
            className="flex-1 h-11 rounded-xl border border-border bg-secondary/40 px-4 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || cooldown > 0}
            className="h-11 w-11 rounded-xl grid place-items-center text-primary-foreground disabled:opacity-40 transition"
            style={{ background: "var(--gradient-primary)" }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create room screen ───────────────────────────────────────────────────────

function CreateRoomScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [done, setDone] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    setDone(true);
    setTimeout(() => onCreate(name), 1500);
  };

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-success/15 grid place-items-center text-success">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Community created!</h2>
        <p className="text-sm text-muted-foreground">
          Real communities will be live once we connect Supabase. For now your room is saved locally.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col">
      <header className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl border border-border grid place-items-center text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold">Create a community</h1>
      </header>

      <div className="px-6 space-y-5 flex-1">
        <div>
          <label className="block text-sm font-medium mb-2">Community name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dutch Brothers, Night Owls..."
            className="w-full h-12 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this community about?"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Private community</p>
            <p className="text-[11px] text-muted-foreground">Only people you invite can join</p>
          </div>
          <button onClick={() => setIsPrivate(!isPrivate)}
            className={`h-6 w-11 rounded-full transition-colors ${isPrivate ? "bg-primary" : "bg-secondary"} relative`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPrivate ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {isPrivate && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              You'll get an invite link to share with friends. Live invite system requires Supabase (coming in Week 2).
            </p>
          </div>
        )}

        <button onClick={handleCreate} disabled={!name.trim()}
          className="w-full h-12 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-40 transition"
          style={{ background: "var(--gradient-primary)" }}>
          Create community
        </button>
      </div>
    </div>
  );
}

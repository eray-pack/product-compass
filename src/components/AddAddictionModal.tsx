import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { type Addiction, type AppState } from "@/lib/store";

const CUSTOM_EMOJIS = [
  "☕","🍕","🍔","🍟","🍩","🍫","🧁","🍭","🍷","🍻","🥃","🥤",
  "📺","🎵","🎲","🛒","💸","🛍️","💊","😴","🥊","🎸","🏃","🧘",
  "💪","🔥","🎯","🧩","🎰","💉","🥦","🍰",
];

const PRESET_HABITS: { name: string; emoji: string; desc: string; color: string }[] = [
  {
    name: "Porn",
    emoji: "🧠",
    desc: "Reclaim your focus, energy, and real-world confidence.",
    color: "rgba(196,135,58,0.12)",
  },
  {
    name: "Social media",
    emoji: "📱",
    desc: "Stop the dopamine drain destroying your attention span.",
    color: "rgba(100,149,237,0.10)",
  },
  {
    name: "Sugar",
    emoji: "🍩",
    desc: "Stabilise your energy, mood, and long-term health.",
    color: "rgba(220,80,80,0.10)",
  },
  {
    name: "Alcohol",
    emoji: "🍺",
    desc: "Clear your mind, protect your body, and save your money.",
    color: "rgba(200,160,60,0.10)",
  },
  {
    name: "Nicotine",
    emoji: "🚬",
    desc: "Take back your lungs and break the chemical leash.",
    color: "rgba(150,150,150,0.10)",
  },
  {
    name: "Cannabis",
    emoji: "🌿",
    desc: "Restore motivation, memory, and mental sharpness.",
    color: "rgba(60,180,100,0.10)",
  },
  {
    name: "Gambling",
    emoji: "🎰",
    desc: "Stop feeding the machine — your future is not a bet.",
    color: "rgba(220,50,50,0.10)",
  },
  {
    name: "Gaming",
    emoji: "🎮",
    desc: "Redirect that drive into something that lasts.",
    color: "rgba(100,80,220,0.10)",
  },
  {
    name: "Procrastination",
    emoji: "⏳",
    desc: "The version of you that acts without waiting.",
    color: "rgba(196,135,58,0.08)",
  },
];

interface Props {
  trackedIds: Set<string>;
  onClose: () => void;
  onAdd: (addiction: Addiction) => void;
}

export function AddAddictionModal({ trackedIds, onClose, onAdd }: Props) {
  const [customName,  setCustomName]  = useState("");
  const [customEmoji, setCustomEmoji] = useState("☕");
  const [showCustom,  setShowCustom]  = useState(false);

  const available = PRESET_HABITS.filter(
    (h) => !trackedIds.has(h.name.toLowerCase().replace(/\s+/g, "-"))
  );

  const addHabit = (name: string, emoji: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    if (trackedIds.has(id)) return;
    onAdd({
      id,
      name,
      emoji,
      startDate: Date.now(),
      totalCleanDays: 0,
      urgesSurvived: 0,
    });
  };

  const addCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    addHabit(trimmed, customEmoji);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto border border-border/60"
        style={{ background: "var(--card)" }}
      >
        {/* Content */}
        <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ color: "var(--primary)" }}
            >
              Add a habit
            </p>
            <h2 className="mt-1 text-xl font-bold leading-snug">
              What else are you<br />fighting?
            </h2>
            <p className="mt-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Each battle tracked separately. All XP feeds your tree.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 grid place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset list */}
        <div className="space-y-2">
          {available.map(({ name, emoji, desc, color }) => (
            <button
              key={name}
              onClick={() => addHabit(name, emoji)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border border-border/60 transition-all text-left group"
              style={{ background: color }}
            >
              <span className="text-2xl leading-none shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px]" style={{ color: "rgba(255,255,255,0.88)" }}>
                  {name}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {desc}
                </p>
              </div>
              <Plus
                className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: "rgba(255,255,255,0.22)" }}
              />
            </button>
          ))}

          {/* Custom entry */}
          {showCustom ? (
            <div
              className="rounded-2xl border-2 border-primary p-4 space-y-4"
              style={{ background: "oklch(0.62 0.22 255 / 0.07)" }}
            >
              {/* Emoji picker */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2.5"
                   style={{ color: "rgba(255,255,255,0.35)" }}>
                  Pick an emoji
                </p>
                <div className="grid grid-cols-8 gap-1.5">
                  {CUSTOM_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setCustomEmoji(e)}
                      className="h-9 w-full rounded-xl text-xl flex items-center justify-center transition-all"
                      style={{
                        background: customEmoji === e ? "rgba(196,135,58,0.20)" : "rgba(255,255,255,0.04)",
                        border: customEmoji === e ? "1.5px solid rgba(196,135,58,0.55)" : "1.5px solid transparent",
                        transform: customEmoji === e ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input with selected emoji preview */}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                   style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <span className="text-2xl leading-none shrink-0">{customEmoji}</span>
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                  placeholder="Name your habit…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <button
                onClick={addCustom}
                disabled={!customName.trim()}
                className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-30 inline-flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Check className="h-4 w-4" /> Start tracking
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors text-left text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Something else…
            </button>
          )}
        </div>

        {available.length === 0 && !showCustom && (
          <p className="text-center text-sm text-muted-foreground py-4">
            All preset habits are already tracked.
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

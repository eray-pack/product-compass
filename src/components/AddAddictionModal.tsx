import { useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { useAppState, type Addiction } from "@/lib/store";

const PRESET_HABITS: { name: string; emoji: string }[] = [
  { name: "Porn",          emoji: "🧠" },
  { name: "Social media",  emoji: "📱" },
  { name: "Sugar",         emoji: "🍩" },
  { name: "Alcohol",       emoji: "🍺" },
  { name: "Nicotine",      emoji: "🚬" },
  { name: "Cannabis",      emoji: "🌿" },
  { name: "Gambling",      emoji: "🎰" },
  { name: "Gaming",        emoji: "🎮" },
  { name: "Procrastination", emoji: "⏳" },
];

export function AddAddictionModal({ onClose }: { onClose: () => void }) {
  const [state, update] = useAppState();
  const [customName, setCustomName] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const trackedIds = new Set(state.addictions.map((a) => a.id));

  const available = PRESET_HABITS.filter(
    (h) => !trackedIds.has(h.name.toLowerCase().replace(/\s+/g, "-"))
  );

  const addHabit = (name: string, emoji: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    if (trackedIds.has(id)) return;
    const addiction: Addiction = {
      id,
      name,
      emoji,
      startDate: Date.now(),
      totalCleanDays: 0,
      urgesSurvived: 0,
    };
    update((s) => ({ addictions: [...s.addictions, addiction] }));
    onClose();
  };

  const addCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    addHabit(trimmed, "🔒");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto border border-border/60"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ color: "var(--primary)" }}
            >
              Track a new habit
            </p>
            <h2 className="mt-1 text-xl font-bold">What do you want to quit?</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 grid place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset list */}
        <div className="space-y-2">
          {available.map(({ name, emoji }) => (
            <button
              key={name}
              onClick={() => addHabit(name, emoji)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-colors text-left"
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <span className="flex-1 font-medium text-sm">{name}</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}

          {/* Custom entry */}
          {showCustom ? (
            <div
              className="rounded-2xl border-2 border-primary p-4 space-y-3"
              style={{ background: "oklch(0.62 0.22 255 / 0.07)" }}
            >
              <input
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="e.g. Coffee, Binge eating…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={addCustom}
                disabled={!customName.trim()}
                className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-30 inline-flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Check className="h-4 w-4" /> Add habit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors text-left text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Enter a custom habit…
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
  );
}

import { useEffect, useRef, useState } from "react";
import { Plus, Lock, Flame, X } from "lucide-react";
import { useAppState, dayCount, type Addiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

const PRESETS: { name: string; emoji: string }[] = [
  { name: "Social media", emoji: "📱" },
  { name: "Sugar", emoji: "🍩" },
  { name: "Alcohol", emoji: "🍺" },
  { name: "Nicotine", emoji: "🚬" },
  { name: "Cannabis", emoji: "🌿" },
  { name: "Gambling", emoji: "🎰" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Procrastination", emoji: "⏳" },
];

export function AddictionCarousel() {
  const [state, update] = useAppState();
  const [showAdd, setShowAdd] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Snap to active card on mount / change
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const idx = state.addictions.findIndex((a) => a.id === state.activeAddictionId);
    if (idx >= 0) {
      const card = el.children[idx] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "instant" as ScrollBehavior, inline: "start", block: "nearest" });
    }
  }, [state.activeAddictionId, state.addictions.length]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    const a = state.addictions[idx];
    if (a && a.id !== state.activeAddictionId) {
      update({ activeAddictionId: a.id });
    }
  };

  const addAddiction = (preset: { name: string; emoji: string }) => {
    const id = `${preset.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const a: Addiction = {
      id, name: preset.name, emoji: preset.emoji,
      startDate: Date.now(), totalCleanDays: 0, urgesSurvived: 0,
    };
    update((s) => ({ addictions: [...s.addictions, a], activeAddictionId: id }));
    setShowAdd(false);
  };

  const cards = state.addictions;
  const activeIdx = cards.findIndex((a) => a.id === state.activeAddictionId);

  return (
    <section className="mt-4">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-6 pb-2 -mx-0 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((a) => (
          <AddictionCard key={a.id} a={a} isPremium={state.isPremium} />
        ))}
        <AddNewCard isPremium={state.isPremium} onClick={() => state.isPremium ? setShowAdd(true) : triggerPaywall()} />
      </div>

      {/* dots */}
      <div className="mt-2 flex justify-center gap-1.5">
        {cards.map((a, i) => (
          <span key={a.id} className={`h-1.5 rounded-full transition-all ${i === activeIdx ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
        ))}
        <span className={`h-1.5 w-1.5 rounded-full ${activeIdx === cards.length ? "bg-primary" : "bg-border/60"}`} />
      </div>
      <p className="mt-1 text-center text-[11px] text-muted-foreground">Swipe between addictions →</p>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-end sm:place-items-center" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">New addiction tracker</h3>
              <button onClick={() => setShowAdd(false)} className="h-8 w-8 grid place-items-center rounded-full border border-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Pick what you're quitting. Your day-1 starts now.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => addAddiction(p)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-3 text-sm hover:border-primary hover:bg-primary/10 transition">
                  <span className="text-lg">{p.emoji}</span> {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AddictionCard({ a, isPremium }: { a: Addiction; isPremium: boolean }) {
  const isMain = a.id === "porn";
  const locked = !isPremium && !isMain;
  const day = dayCount(a.startDate);
  return (
    <div className="snap-start shrink-0 w-[calc(100vw-3rem)] max-w-[calc(28rem-3rem)]">
      <div className="relative rounded-2xl p-6 border border-border bg-[var(--gradient-surface)] shadow-[var(--shadow-glow)] overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
            <span className="text-base">{a.emoji}</span> {a.name}
          </p>
          {locked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </div>
        <div className={locked ? "blur-md select-none pointer-events-none" : ""}>
          <h1 className="mt-1 text-5xl font-bold tracking-tight">Day {day}</h1>
          <p className="mt-1 text-xs text-muted-foreground">Clean streak</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-warning">
            <Flame className="h-3.5 w-3.5" /> {a.urgesSurvived} urges survived
          </div>
        </div>
        {locked && (
          <button onClick={triggerPaywall} className="absolute inset-0 grid place-items-center">
            <span className="text-xs font-medium text-primary bg-card/80 border border-primary/30 px-3 py-1.5 rounded-full">
              Unlock this tracker
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function AddNewCard({ onClick, isPremium }: { onClick: () => void; isPremium: boolean }) {
  return (
    <button onClick={onClick}
      className="snap-start shrink-0 w-[calc(100vw-3rem)] max-w-[calc(28rem-3rem)] rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 flex flex-col items-center justify-center gap-2 min-h-[170px] hover:border-primary hover:bg-primary/5 transition">
      <div className="h-10 w-10 rounded-full grid place-items-center bg-primary/10 border border-primary/30">
        <Plus className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-medium">Add another addiction</p>
      <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
        {!isPremium && <Lock className="h-3 w-3" />} Track multiple habits side-by-side
      </p>
    </button>
  );
}

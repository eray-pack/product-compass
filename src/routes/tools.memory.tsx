import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/tools/memory")({
  component: MemoryMatch,
});

const EMOJIS = ["🌊", "🔥", "⚡", "🌿", "💎", "🎯"];
const ALL_CARDS = [...EMOJIS, ...EMOJIS];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function makeCards(): Card[] {
  return shuffle(ALL_CARDS).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

function MemoryMatch() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [cards, setCards] = useState<Card[]>(makeCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  function startGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    lockRef.current = false;
    const fresh = makeCards();
    setCards(fresh);
    setSelected([]);
    setMoves(0);
    setElapsed(0);
    setPhase("playing");
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }

  function flip(id: number) {
    if (lockRef.current || phase !== "playing") return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      return prev.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    });
    setSelected((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length === 2) {
        setMoves((m) => m + 1);
        lockRef.current = true;
        setTimeout(() => {
          setCards((prevCards) => {
            const [a, b] = next.map((i) => prevCards.find((c) => c.id === i)!);
            const isMatch = a && b && a.emoji === b.emoji;
            const updated = prevCards.map((c) =>
              next.includes(c.id)
                ? { ...c, matched: isMatch, flipped: isMatch }
                : c
            );
            const allDone = updated.every((c) => c.matched);
            if (allDone) {
              clearInterval(timerRef.current!);
              setPhase("done");
            }
            return updated;
          });
          setSelected([]);
          lockRef.current = false;
        }, 800);
        return next;
      }
      return next;
    });
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const rating =
    moves <= 10 ? "Legendary" :
    moves <= 14 ? "Sharp mind" :
    moves <= 20 ? "Well played" :
    "Keep training";

  return (
    <div className="min-h-screen flex flex-col pb-6" style={{ background: "var(--background)" }}>
      {/* Back */}
      <button
        onClick={() => { if (timerRef.current) clearInterval(timerRef.current); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="pt-12 pb-4 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Memory Match
        </p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{moves}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Moves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{fmtTime(elapsed)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      {phase === "playing" && (
        <div className="flex-1 px-6">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => {
              const isVisible = card.flipped || card.matched || selected.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => flip(card.id)}
                  className="aspect-square rounded-2xl flex items-center justify-center text-3xl font-bold transition-all duration-300 active:scale-95"
                  style={{
                    background: isVisible
                      ? card.matched
                        ? "oklch(0.60 0.18 150 / 0.18)"
                        : "oklch(0.62 0.18 55 / 0.14)"
                      : "var(--card)",
                    border: `1px solid ${
                      card.matched
                        ? "oklch(0.60 0.18 150 / 0.5)"
                        : isVisible
                        ? "oklch(0.62 0.18 55 / 0.4)"
                        : "var(--border)"
                    }`,
                    boxShadow: card.matched ? "0 0 16px oklch(0.60 0.18 150 / 0.3)" : "none",
                    transform: isVisible ? "rotateY(0deg)" : "rotateY(180deg)",
                  }}
                >
                  {isVisible ? card.emoji : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Idle / Done */}
      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-2">
                <p className="text-5xl">🎯</p>
                <p className="text-xl font-bold mt-2">{rating}</p>
                <p className="text-muted-foreground text-sm">
                  {moves} moves · {fmtTime(elapsed)}
                </p>
              </div>
              <p className="text-sm text-center text-muted-foreground max-w-xs">
                Your focus just overpowered the urge. That's how it works.
              </p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Match all 6 pairs.</p>
              <p className="text-sm text-muted-foreground">
                Flip two cards at a time.<br />Fewer moves = sharper mind.
              </p>
            </div>
          )}
          <button
            onClick={startGame}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80 transition-opacity"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/tools/tap")({
  component: TapTheUrge,
});

const GAME_DURATION = 60; // seconds
const CIRCLE_LIFETIME = 1400; // ms before a circle fades
const SPAWN_INTERVAL = 600; // ms between new circles

const MESSAGES = [
  "Urge popped.",
  "You control it.",
  "Not today.",
  "Power up.",
  "Wired different.",
];

const COLORS = ["#C4873A", "#6BAED6", "#9ECAE1", "#6BAA75", "#C4873A", "#B07FCC"];

interface Circle {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  born: number;
}

function TapTheUrge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [popMsg, setPopMsg] = useState<{ text: string; x: number; y: number; id: number } | null>(null);

  const phaseRef = useRef<"idle" | "playing" | "done">("idle");
  const nextId = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pruneRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    if (spawnRef.current) clearInterval(spawnRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pruneRef.current) clearInterval(pruneRef.current);
  }, []);

  function start() {
    clearAll();
    phaseRef.current = "playing";
    nextId.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    setPhase("playing");
    setCircles([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);

    spawnRef.current = setInterval(() => {
      if (phaseRef.current !== "playing") return;
      const id = nextId.current++;
      const r = 26 + Math.random() * 22;
      const x = r + Math.random() * (300 - r * 2);
      const y = r + Math.random() * (400 - r * 2);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      setCircles((prev) => [...prev, { id, x, y, r, color, born: Date.now() }]);
    }, SPAWN_INTERVAL);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearAll();
          phaseRef.current = "done";
          setPhase("done");
          setCircles([]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    pruneRef.current = setInterval(() => {
      const now = Date.now();
      setCircles((prev) => {
        const expired = prev.filter((c) => now - c.born >= CIRCLE_LIFETIME);
        if (expired.length > 0) {
          comboRef.current = 0;
          setCombo(0);
        }
        return prev.filter((c) => now - c.born < CIRCLE_LIFETIME);
      });
    }, 200);
  }

  function tap(id: number, x: number, y: number) {
    setCircles((prev) => prev.filter((c) => c.id !== id));
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    if (newCombo > maxComboRef.current) {
      maxComboRef.current = newCombo;
      setMaxCombo(newCombo);
    }
    setCombo(newCombo);
    setScore((s) => s + (newCombo >= 3 ? 2 : 1));
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setPopMsg({ text: msg, x, y, id: Date.now() });
    setTimeout(() => setPopMsg(null), 700);
  }

  useEffect(() => () => clearAll(), [clearAll]);

  const endMsg =
    score >= 40 ? "Incredible focus." :
    score >= 25 ? "Strong resistance." :
    score >= 10 ? "Good work." :
    "Keep practicing.";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Back */}
      <button
        onClick={() => { clearAll(); navigate({ to: "/tools" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Tap the Urge
        </p>
        {phase === "playing" && (
          <div className="flex justify-center gap-8 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--primary)" }}>{score}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{timeLeft}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: combo >= 3 ? "#FFD54F" : "var(--foreground)" }}>
                x{combo}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Combo</p>
            </div>
          </div>
        )}
      </div>

      {/* Play area */}
      {phase === "playing" && (
        <div className="flex-1 relative overflow-hidden mx-6 mt-2 rounded-2xl"
          style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          {circles.map((c) => {
            const age = Date.now() - c.born;
            const opacity = Math.max(0, 1 - age / CIRCLE_LIFETIME);
            return (
              <button
                key={c.id}
                onPointerDown={(e) => {
                  e.preventDefault();
                  tap(c.id, c.x, c.y);
                }}
                className="absolute rounded-full active:scale-90 transition-transform"
                style={{
                  left: c.x - c.r,
                  top: c.y - c.r,
                  width: c.r * 2,
                  height: c.r * 2,
                  background: `radial-gradient(circle at 38% 35%, ${c.color}EE, ${c.color}66)`,
                  boxShadow: `0 0 18px ${c.color}66`,
                  opacity,
                  touchAction: "none",
                }}
              />
            );
          })}
          {popMsg && (
            <div
              key={popMsg.id}
              className="absolute pointer-events-none text-xs font-bold animate-fade-up"
              style={{
                left: popMsg.x,
                top: popMsg.y - 20,
                color: "var(--primary)",
                transform: "translateX(-50%)",
                textShadow: "0 0 8px rgba(196,135,58,0.8)",
              }}
            >
              {popMsg.text}
            </div>
          )}
        </div>
      )}

      {/* Idle / Done */}
      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: "var(--primary)" }}>{score}</p>
                <p className="text-muted-foreground text-sm">urges popped</p>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">{maxCombo}x</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best combo</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{endMsg}</p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Pop every urge you see.</p>
              <p className="text-sm text-muted-foreground">
                Glowing circles = cravings.<br />Tap fast. Don't let them fade.
              </p>
            </div>
          )}
          <button
            onClick={start}
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Cpu, Wifi, Zap, Activity, Radio, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/tools/memory")({
  component: MemoryMatch,
});

// ── Palette ───────────────────────────────────────────────────────────────────
const G_BRIGHT = "#00e87a";
const G_MID    = "#1a7a40";
const G_DIM    = "#0a3318";
const BG       = "#010805";

// ── 6 icon pairs ──────────────────────────────────────────────────────────────
const ICONS = [Cpu, Wifi, Zap, Activity, Radio, Target] as const;

// ── Deterministic spark directions (8 per card) ───────────────────────────────
const SPARK_DIRS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const dist  = 22 + (i % 3) * 9;
  const size  = 2 + (i % 3);
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, size };
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Card {
  id: number;
  symbolIdx: number;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCards(): Card[] {
  const idxs = [...Array(6).keys(), ...Array(6).keys()];
  return shuffle(idxs).map((symbolIdx, i) => ({
    id: i, symbolIdx, flipped: false, matched: false,
  }));
}

// ── MatchSparks ───────────────────────────────────────────────────────────────
function MatchSparks() {
  return (
    <>
      {SPARK_DIRS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size,
            left: "50%", top: "50%",
            marginLeft: -p.size / 2, marginTop: -p.size / 2,
            background: G_BRIGHT,
            boxShadow: `0 0 5px 2px ${G_BRIGHT}aa`,
            zIndex: 20,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
          transition={{ duration: 0.52, delay: i * 0.016, ease: [0.2, 0, 0.7, 1] }}
        />
      ))}
    </>
  );
}

// ── Card back face ─────────────────────────────────────────────────────────────
function CardBack() {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(145deg, #020d06 0%, #010a05 50%, #021008 100%)" }}
      />
      {/* Circuit SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 80 80"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <line x1="40" y1="0"  x2="40" y2="80" stroke={G_DIM} strokeWidth="0.6" strokeDasharray="3 5" />
        <line x1="0"  y1="40" x2="80" y2="40" stroke={G_DIM} strokeWidth="0.6" strokeDasharray="3 5" />
        <line x1="20" y1="0"  x2="20" y2="80" stroke={G_DIM} strokeWidth="0.4" opacity="0.6" />
        <line x1="60" y1="0"  x2="60" y2="80" stroke={G_DIM} strokeWidth="0.4" opacity="0.6" />
        <line x1="0"  y1="20" x2="80" y2="20" stroke={G_DIM} strokeWidth="0.4" opacity="0.6" />
        <line x1="0"  y1="60" x2="80" y2="60" stroke={G_DIM} strokeWidth="0.4" opacity="0.6" />
        {/* Center node */}
        <circle cx="40" cy="40" r="9"   stroke={G_MID} strokeWidth="0.8" fill="none" opacity="0.4" />
        <circle cx="40" cy="40" r="3.5" stroke={G_MID} strokeWidth="0.8" fill="none" opacity="0.5" />
        <circle cx="40" cy="40" r="1.5" fill={G_MID} opacity="0.7" />
        {/* Corner nodes */}
        <circle cx="20" cy="20" r="2" fill={G_DIM} opacity="0.9" />
        <circle cx="60" cy="20" r="2" fill={G_DIM} opacity="0.9" />
        <circle cx="20" cy="60" r="2" fill={G_DIM} opacity="0.9" />
        <circle cx="60" cy="60" r="2" fill={G_DIM} opacity="0.9" />
        {/* Circuit traces */}
        <path d="M 20 20 L 40 20 L 40 31" stroke={G_MID} strokeWidth="0.7" opacity="0.45" fill="none" />
        <path d="M 60 20 L 40 20"         stroke={G_DIM} strokeWidth="0.7" opacity="0.5"  fill="none" />
        <path d="M 20 60 L 20 40 L 40 40" stroke={G_MID} strokeWidth="0.7" opacity="0.4"  fill="none" />
        <path d="M 60 60 L 60 40 L 49 40" stroke={G_DIM} strokeWidth="0.7" opacity="0.45" fill="none" />
        {/* Corner L-brackets */}
        <path d="M 5 5 L 5 14 M 5 5 L 14 5"     stroke={G_MID} strokeWidth="1" opacity="0.55" fill="none" />
        <path d="M 75 5 L 66 5 M 75 5 L 75 14"  stroke={G_MID} strokeWidth="1" opacity="0.55" fill="none" />
        <path d="M 5 75 L 5 66 M 5 75 L 14 75"  stroke={G_MID} strokeWidth="1" opacity="0.55" fill="none" />
        <path d="M 75 75 L 66 75 M 75 75 L 75 66" stroke={G_MID} strokeWidth="1" opacity="0.55" fill="none" />
      </svg>
      {/* Border + inner glow */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          border: `1px solid ${G_DIM}`,
          boxShadow: `inset 0 0 14px rgba(0,80,30,0.28)`,
        }}
      />
    </div>
  );
}

// ── Card front face ────────────────────────────────────────────────────────────
function CardFront({ symbolIdx, matched }: { symbolIdx: number; matched: boolean }) {
  const Icon = ICONS[symbolIdx];
  return (
    <div
      className="absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        background: matched
          ? "linear-gradient(145deg, #001a0a 0%, #001408 100%)"
          : "linear-gradient(145deg, #011208 0%, #010a06 100%)",
        border: `1px solid ${matched ? G_BRIGHT + "55" : G_MID + "44"}`,
        boxShadow: matched
          ? `0 0 20px ${G_BRIGHT}44, inset 0 0 18px ${G_BRIGHT}14`
          : "inset 0 0 12px rgba(0,0,0,0.6)",
      }}
    >
      {/* Icon */}
      <Icon
        style={{
          width: 26, height: 26,
          color: matched ? G_BRIGHT : "#2dba6a",
          filter: matched
            ? `drop-shadow(0 0 8px ${G_BRIGHT}) drop-shadow(0 0 20px ${G_BRIGHT}66)`
            : `drop-shadow(0 0 5px ${G_MID}99)`,
          strokeWidth: 1.5,
        }}
      />
      {/* Radial glow behind icon */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 42%, ${matched ? G_BRIGHT : G_MID}22 0%, transparent 62%)`,
        }}
      />
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,80,0.018) 3px, rgba(0,255,80,0.018) 4px)",
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function MemoryMatch() {
  const navigate = useNavigate();
  const [phase, setPhase]       = useState<"idle" | "playing" | "done">("idle");
  const [cards, setCards]       = useState<Card[]>(makeCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves]       = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const [shakingIds, setShakingIds]       = useState<Set<number>>(new Set());
  const [matchPulseIds, setMatchPulseIds] = useState<Set<number>>(new Set());
  const [gameKey, setGameKey]   = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef  = useRef(false);

  function startGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    lockRef.current = false;
    setCards(makeCards());
    setSelected([]);
    setMoves(0);
    setElapsed(0);
    setShakingIds(new Set());
    setMatchPulseIds(new Set());
    setGameKey((k) => k + 1);
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
            const isMatch = a && b && a.symbolIdx === b.symbolIdx;
            const updated = prevCards.map((c) =>
              next.includes(c.id)
                ? { ...c, matched: isMatch, flipped: isMatch }
                : c
            );
            if (isMatch) {
              setMatchPulseIds(new Set(next));
              setTimeout(() => setMatchPulseIds(new Set()), 850);
            } else {
              setShakingIds(new Set(next));
              setTimeout(() => setShakingIds(new Set()), 420);
            }
            const allDone = updated.every((c) => c.matched);
            if (allDone) {
              clearInterval(timerRef.current!);
              setPhase("done");
            }
            return updated;
          });
          setSelected([]);
          lockRef.current = false;
        }, 700);
        return next;
      }
      return next;
    });
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const rating =
    moves <= 10 ? "Legendary" :
    moves <= 14 ? "Sharp mind" :
    moves <= 20 ? "Well played" : "Keep training";

  return (
    <div
      className="min-h-screen flex flex-col pb-6 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* CSS keyframes */}
      <style>{`
        @keyframes cardShake {
          0%   { transform: translateX(0); }
          15%  { transform: translateX(-8px); }
          30%  { transform: translateX(8px); }
          45%  { transform: translateX(-6px); }
          60%  { transform: translateX(6px); }
          75%  { transform: translateX(-3px); }
          90%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        @keyframes cardPulse {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.09); }
          65%  { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Background: circuit grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,80,0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,80,0.038) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
        }}
      />
      {/* Radial atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 38%, rgba(0,50,20,0.32) 0%, transparent 70%)",
        }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 110% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Back button */}
      <button
        onClick={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          navigate({ to: "/tools" });
        }}
        className="absolute top-12 left-5 z-20 h-9 w-9 rounded-full grid place-items-center"
        style={{
          background: "rgba(0,25,10,0.85)",
          border: `1px solid ${G_DIM}`,
          boxShadow: `0 0 10px rgba(0,200,80,0.07)`,
        }}
      >
        <ArrowLeft className="h-4 w-4" style={{ color: "rgba(0,200,80,0.55)" }} />
      </button>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pt-12 pb-3 px-6 text-center relative z-10">
        <motion.p
          className="text-[10px] font-bold tracking-[0.36em] uppercase"
          style={{ color: "rgba(0,200,80,0.32)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Neural Link · Memory Match
        </motion.p>

        {/* Counters */}
        <AnimatePresence>
          {phase === "playing" && (
            <motion.div
              className="flex justify-center gap-10 mt-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center">
                <motion.p
                  key={moves}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: "rgba(255,255,255,0.88)" }}
                  initial={{ scale: 1.55, color: G_BRIGHT }}
                  animate={{ scale: 1, color: "rgba(255,255,255,0.88)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                >
                  {moves}
                </motion.p>
                <p
                  className="text-[9px] uppercase tracking-[0.26em] mt-0.5"
                  style={{ color: "rgba(0,200,80,0.28)" }}
                >
                  Moves
                </p>
              </div>
              <div className="text-center">
                <motion.p
                  key={elapsed}
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: G_BRIGHT }}
                  initial={{ scale: 1.22 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                >
                  {fmtTime(elapsed)}
                </motion.p>
                <p
                  className="text-[9px] uppercase tracking-[0.26em] mt-0.5"
                  style={{ color: "rgba(0,200,80,0.28)" }}
                >
                  Time
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Card grid ───────────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="flex-1 px-4 relative z-10">
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((card) => {
              const isFlipped = card.flipped || card.matched;

              return (
                <motion.div
                  key={`${gameKey}-${card.id}`}
                  className="aspect-square"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: card.id * 0.045,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Shake / pulse wrapper — CSS animations on transform */}
                  <div
                    className="relative w-full h-full"
                    style={{
                      cursor: card.matched ? "default" : "pointer",
                      animation: shakingIds.has(card.id)
                        ? "cardShake 0.38s ease-in-out"
                        : matchPulseIds.has(card.id)
                        ? "cardPulse 0.65s ease-out"
                        : undefined,
                    }}
                    onClick={() => flip(card.id)}
                  >
                    {/* Perspective context for 3D flip */}
                    <div style={{ perspective: "600px", width: "100%", height: "100%" }}>
                      <motion.div
                        className="relative w-full h-full"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <CardBack />
                        <CardFront symbolIdx={card.symbolIdx} matched={card.matched} />
                      </motion.div>
                    </div>

                    {/* Match sparks */}
                    <AnimatePresence>
                      {matchPulseIds.has(card.id) && <MatchSparks key="sparks" />}
                    </AnimatePresence>

                    {/* Persistent outer glow on matched cards */}
                    {card.matched && (
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          boxShadow: `0 0 14px ${G_BRIGHT}44, 0 0 28px ${G_BRIGHT}18`,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Idle / Done ──────────────────────────────────────────────────────── */}
      {phase !== "playing" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7 relative z-10">
          <AnimatePresence mode="wait">
            {phase === "done" ? (
              <motion.div
                key="done"
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <p
                    className="text-6xl font-black tabular-nums"
                    style={{
                      color: G_BRIGHT,
                      textShadow: `0 0 30px ${G_BRIGHT}88, 0 0 60px ${G_BRIGHT}44`,
                    }}
                  >
                    {moves}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "rgba(0,200,80,0.38)" }}>
                    moves
                  </p>
                </motion.div>
                <div>
                  <p className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {rating}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
                    {fmtTime(elapsed)}
                  </p>
                </div>
                <p className="text-sm text-center max-w-xs" style={{ color: "rgba(255,255,255,0.26)" }}>
                  Your focus just overpowered the urge.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="text-center space-y-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                  Rewire the habit loop.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                  Every addiction has a circuit — cue, craving, routine, reward.<br />
                  Each pair you match is a node of that circuit surfacing.<br />
                  Connect them correctly and you interrupt the default pathway,<br />
                  creating space for a new one to take hold.
                </p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 6 }}>
                  {["◈ Flip glowing nodes", "✦ Fewer moves = sharper circuit", "⟡ Working memory training"].map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(74,222,128,0.09)", border: "1px solid rgba(74,222,128,0.22)", color: "rgba(74,222,128,0.80)", letterSpacing: "0.04em" }}>{t}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={startGame}
            className="px-12 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
              letterSpacing: "0.04em",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.95 }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

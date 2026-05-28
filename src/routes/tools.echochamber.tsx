import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/echochamber")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: EchoChamber,
});

const BTN_COLORS = ["#F97316", "#EAB308", "#22C55E", "#3B82F6"];
const BTN_SYMBOLS = ["◆", "●", "■", "▲"];
const FLASH_MS = 480;
const GAP_MS = 180;
const C = "#F97316";
const BG = "#0a0502";

// Deterministic ripple ring positions
const RIPPLES = [
  { r: 110, dur: 3.8, delay: 0 },
  { r: 170, dur: 4.4, delay: 0.9 },
  { r: 230, dur: 5.1, delay: 1.8 },
];

// Particle burst directions for correct tap
const BURST_DIRS = Array.from({ length: 10 }, (_, i) => ({
  x: Math.cos((i / 10) * Math.PI * 2) * 52,
  y: Math.sin((i / 10) * Math.PI * 2) * 52,
}));

function EchoChamber() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "done">("idle");
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [flashBtn, setFlashBtn] = useState<number | null>(null);
  const [pressBtn, setPressBtn] = useState<number | null>(null);
  const [burstBtn, setBurstBtn] = useState<number | null>(null);
  const [shakeBtn, setShakeBtn] = useState<number | null>(null);
  const [inputSeq, setInputSeq] = useState<number[]>([]);
  const [roundKey, setRoundKey] = useState(0);

  const phaseRef = useRef<"idle" | "showing" | "input" | "done">("idle");
  const livesRef = useRef(3);
  const seqRef = useRef<number[]>([]);
  const playId = useRef(0);

  function flashSequence(seq: number[], id: number) {
    phaseRef.current = "showing";
    setPhase("showing");
    setInputSeq([]);
    let i = 0;
    function step() {
      if (playId.current !== id) return;
      if (i >= seq.length) {
        setTimeout(() => {
          if (playId.current !== id) return;
          phaseRef.current = "input";
          setPhase("input");
        }, GAP_MS * 2);
        return;
      }
      setTimeout(() => {
        if (playId.current !== id) return;
        setFlashBtn(seq[i]);
        setTimeout(() => {
          if (playId.current !== id) return;
          setFlashBtn(null);
          i++;
          setTimeout(step, GAP_MS);
        }, FLASH_MS);
      }, GAP_MS);
    }
    step();
  }

  function start() {
    playId.current += 1;
    const id = playId.current;
    livesRef.current = 3;
    setLives(3);
    setRound(1);
    setRoundKey((k) => k + 1);
    const seq = [Math.floor(Math.random() * 4)];
    seqRef.current = seq;
    flashSequence(seq, id);
  }

  function tap(btn: number) {
    if (phaseRef.current !== "input") return;
    setPressBtn(btn);
    setTimeout(() => setPressBtn(null), 180);

    setInputSeq((prev) => {
      const next = [...prev, btn];
      const idx = next.length - 1;
      if (btn !== seqRef.current[idx]) {
        // Wrong
        setShakeBtn(btn);
        setTimeout(() => setShakeBtn(null), 500);
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          playId.current += 1;
          phaseRef.current = "done";
          setPhase("done");
          return [];
        }
        const id = ++playId.current;
        setTimeout(() => flashSequence(seqRef.current, id), 700);
        return [];
      }
      // Correct
      setBurstBtn(btn);
      setTimeout(() => setBurstBtn(null), 400);
      if (next.length === seqRef.current.length) {
        const newSeq = [...seqRef.current, Math.floor(Math.random() * 4)];
        seqRef.current = newSeq;
        setRound(newSeq.length);
        setRoundKey((k) => k + 1);
        const id = ++playId.current;
        setTimeout(() => flashSequence(newSeq, id), 900);
        return [];
      }
      return next;
    });
  }

  useEffect(() => () => { playId.current += 1; }, []);

  const isActive = phase === "showing" || phase === "input";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: BG }}>
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 70% 55% at 50% 60%, ${C}12 0%, transparent 70%)`,
        }} />
        {/* Sound wave ripple rings */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.18 }}>
          {RIPPLES.map((rp, i) => (
            <circle key={i} cx="50%" cy="58%" r={rp.r}
              fill="none" stroke={C} strokeWidth="1"
              style={{ animation: `echoRipple ${rp.dur}s ${rp.delay}s ease-out infinite` }}
            />
          ))}
        </svg>
      </div>

      <style>{`
        @keyframes echoRipple {
          0%   { opacity: 0.5; transform-origin: 50% 58%; transform: scale(0.6); }
          60%  { opacity: 0.15; }
          100% { opacity: 0; transform-origin: 50% 58%; transform: scale(1.35); }
        }
      `}</style>

      <motion.button
        onClick={() => { playId.current += 1; navigate({ to: "/tools", replace: true }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.88 }}
      >
        <ArrowLeft className="h-4 w-4" />
      </motion.button>

      <div className="pt-12 pb-2 px-6 text-center relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: `${C}99` }}>Echo Chamber</p>
        {isActive && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <motion.p
                key={roundKey}
                className="text-2xl font-bold"
                style={{ color: C }}
                initial={{ scale: 1.6, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                {round}
              </motion.p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Round</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{"♥".repeat(lives)}{"♡".repeat(Math.max(0, 3 - lives))}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Lives</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative z-10">
          <motion.p
            className="text-sm"
            style={{ color: `${C}99` }}
            key={phase}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phase === "showing" ? "Watch the pattern…" : "Repeat it back"}
          </motion.p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {BTN_COLORS.map((color, i) => {
              const lit = flashBtn === i || pressBtn === i;
              const bursting = burstBtn === i;
              const shaking = shakeBtn === i;
              return (
                <motion.div
                  key={i}
                  className="aspect-square relative"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={
                    shaking
                      ? { x: [0, -10, 10, -7, 7, -4, 4, 0], scale: 1, opacity: 1 }
                      : { x: 0, scale: 1, opacity: 1 }
                  }
                  transition={
                    shaking
                      ? { duration: 0.42, ease: "easeInOut" }
                      : { delay: i * 0.06, type: "spring", stiffness: 320, damping: 20 }
                  }
                >
                  {/* Burst particles */}
                  <AnimatePresence>
                    {bursting && BURST_DIRS.map((d, pi) => (
                      <motion.div
                        key={pi}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: 6, height: 6,
                          background: color,
                          top: "50%", left: "50%",
                          marginTop: -3, marginLeft: -3,
                        }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: d.x, y: d.y, opacity: 0, scale: 0.3 }}
                        exit={{}}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                      />
                    ))}
                  </AnimatePresence>

                  <motion.button
                    onPointerDown={(e) => { e.preventDefault(); tap(i); }}
                    className="w-full h-full rounded-3xl flex items-center justify-center text-4xl"
                    style={{
                      background: lit ? `${color}44` : `${color}12`,
                      border: `2px solid ${color}${lit ? "FF" : "44"}`,
                      boxShadow: lit ? `0 0 36px ${color}88, 0 0 72px ${color}44` : "none",
                      color,
                      touchAction: "none",
                    }}
                    animate={{
                      scale: lit ? 1.06 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  >
                    {BTN_SYMBOLS[i]}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {!isActive && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 relative z-10">
          {phase === "done" && (
            <>
              <motion.div
                className="text-center space-y-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
              >
                <p className="text-5xl font-bold" style={{ color: C }}>{round}</p>
                <p className="text-sm text-muted-foreground">rounds survived</p>
              </motion.div>
              <motion.p
                className="text-lg font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {round >= 8 ? "Pattern master." : round >= 5 ? "Sharp memory." : "Keep training."}
              </motion.p>
            </>
          )}
          {phase === "idle" && (
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl font-bold">Filter your own voice.</p>
              <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.7 }}>
                In recovery, the mind becomes a chamber of competing voices —<br />
                urges, shame, logic, fear. This game forces you to isolate<br />
                one signal from the chaos and recall it under pressure.<br />
                The pattern you copy is the clarity you're building.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", paddingTop: 8 }}>
                {["◈ Watch the sequence", "✦ Repeat it precisely", "⟡ Signal grows each round"].map(t => (
                  <span key={t} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.25)", color: "rgba(249,115,22,0.80)", letterSpacing: "0.04em" }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}
          <motion.button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C}, #EA580C)`, boxShadow: `0 0 20px ${C}55` }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

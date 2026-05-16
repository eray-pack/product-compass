import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

function EchoChamber() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "done">("idle");
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [flashBtn, setFlashBtn] = useState<number | null>(null);
  const [pressBtn, setPressBtn] = useState<number | null>(null);
  const [inputSeq, setInputSeq] = useState<number[]>([]);

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
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          playId.current += 1;
          phaseRef.current = "done";
          setPhase("done");
          return [];
        }
        // Replay same sequence
        const id = ++playId.current;
        setTimeout(() => flashSequence(seqRef.current, id), 700);
        return [];
      }
      // Correct so far
      if (next.length === seqRef.current.length) {
        // Round complete — grow sequence
        const newSeq = [...seqRef.current, Math.floor(Math.random() * 4)];
        seqRef.current = newSeq;
        setRound(newSeq.length);
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <button
        onClick={() => { playId.current += 1; navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="pt-12 pb-2 px-6 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Echo Chamber</p>
        {isActive && (
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: C }}>{round}</p>
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
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <p className="text-sm text-muted-foreground">
            {phase === "showing" ? "Watch the pattern…" : "Repeat it back"}
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {BTN_COLORS.map((color, i) => {
              const lit = flashBtn === i || pressBtn === i;
              return (
                <button
                  key={i}
                  onPointerDown={(e) => { e.preventDefault(); tap(i); }}
                  className="aspect-square rounded-3xl flex items-center justify-center text-4xl transition-all active:scale-95"
                  style={{
                    background: lit ? `${color}44` : `${color}12`,
                    border: `2px solid ${color}${lit ? "FF" : "44"}`,
                    boxShadow: lit ? `0 0 36px ${color}88` : "none",
                    color,
                    touchAction: "none",
                  }}
                >
                  {BTN_SYMBOLS[i]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isActive && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {phase === "done" && (
            <>
              <div className="text-center space-y-1">
                <p className="text-5xl font-bold" style={{ color: C }}>{round}</p>
                <p className="text-sm text-muted-foreground">rounds survived</p>
              </div>
              <p className="text-lg font-semibold">
                {round >= 8 ? "Pattern master." : round >= 5 ? "Sharp memory." : "Keep training."}
              </p>
            </>
          )}
          {phase === "idle" && (
            <div className="text-center space-y-2">
              <p className="text-xl font-bold">Copy the pattern.</p>
              <p className="text-sm text-muted-foreground">
                Watch the sequence light up.<br />Repeat it back in order.<br />Gets longer each round.
              </p>
            </div>
          )}
          <button
            onClick={start}
            className="px-10 py-3.5 rounded-2xl text-sm font-bold text-white active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${C}, #EA580C)`, boxShadow: `0 0 20px ${C}55` }}
          >
            {phase === "done" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

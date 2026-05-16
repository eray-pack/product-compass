import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadState } from "@/lib/store";

export const Route = createFileRoute("/tools/voidstare")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!loadState().isPremium) throw redirect({ to: "/paywall" });
  },
  component: VoidStare,
});

const MOVE_THRESHOLD = 14;
const C = "#7B2FBE";

function VoidStare() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"idle" | "holding" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startXY = useRef({ x: 0, y: 0 });
  const elapsedRef = useRef(0);
  const phaseRef = useRef<"idle" | "holding" | "done">("idle");

  function clear() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startHold(x: number, y: number) {
    if (phaseRef.current === "holding") return;
    clear();
    startXY.current = { x, y };
    elapsedRef.current = 0;
    phaseRef.current = "holding";
    setElapsed(0);
    setPhase("holding");
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed((t) => t + 1);
    }, 100);
  }

  function stopHold() {
    if (phaseRef.current !== "holding") return;
    clear();
    const t = elapsedRef.current;
    phaseRef.current = "done";
    setPhase("done");
    setBest((b) => Math.max(b, t));
  }

  function handleMove(x: number, y: number) {
    if (phaseRef.current !== "holding") return;
    const dx = Math.abs(x - startXY.current.x);
    const dy = Math.abs(y - startXY.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) stopHold();
  }

  useEffect(() => () => clear(), []);

  const fmtTime = (t: number) => `${(t / 10).toFixed(1)}s`;
  const rings = [50, 80, 110];

  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{ background: "var(--background)", userSelect: "none" }}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; startHold(e.clientX, e.clientY); }}
      onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
      onPointerUp={stopHold}
      onPointerCancel={stopHold}
    >
      <button
        onClick={(e) => { e.stopPropagation(); clear(); navigate({ to: "/" }); }}
        className="absolute top-12 left-5 z-10 h-9 w-9 rounded-full grid place-items-center"
        style={{ background: "oklch(0.20 0.03 265 / 0.8)", border: "1px solid var(--border)" }}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Void Stare</p>

        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
          {rings.map((r) => (
            <div
              key={r}
              className="absolute rounded-full"
              style={{
                width: r * 2,
                height: r * 2,
                border: `1.5px solid ${C}`,
                opacity: phase === "holding" ? 0.55 : 0.18,
                transition: "opacity 0.6s, box-shadow 0.6s",
                boxShadow: phase === "holding" ? `0 0 ${r / 6}px ${C}55` : "none",
              }}
            />
          ))}
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            <ellipse cx="34" cy="34" rx="32" ry="22" stroke={C} strokeWidth="2" opacity="0.9"/>
            <circle cx="34" cy="34" r="14" fill={C} opacity={phase === "holding" ? 0.9 : 0.4}
              style={{ transition: "opacity 0.4s" }}/>
            <circle cx="34" cy="34" r="8" fill="#080B14"/>
            <circle cx="39" cy="29" r="3.5" fill="#FFF" opacity="0.4"/>
          </svg>
          {phase === "holding" && (
            <div className="absolute" style={{ bottom: -52 }}>
              <p className="text-3xl font-bold tabular-nums" style={{ color: C }}>{fmtTime(elapsed)}</p>
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          {phase === "idle" && (
            <>
              <p className="text-xl font-bold">Hold. Don't move.</p>
              <p className="text-sm text-muted-foreground">
                Touch anywhere and stay perfectly still.<br />Any movement stops the timer.
              </p>
            </>
          )}
          {phase === "holding" && (
            <p className="text-sm text-muted-foreground opacity-60">Stay still…</p>
          )}
          {phase === "done" && (
            <>
              <p className="text-4xl font-bold" style={{ color: C }}>{fmtTime(elapsed)}</p>
              <p className="text-sm text-muted-foreground">held still</p>
              {best > elapsed && (
                <p className="text-xs" style={{ color: C }}>Best: {fmtTime(best)}</p>
              )}
              <p className="mt-2 text-sm font-semibold">
                {elapsed >= 300 ? "Extraordinary control." : elapsed >= 100 ? "Strong stillness." : "Keep practicing."}
              </p>
            </>
          )}
        </div>

        {phase !== "holding" && (
          <p className="text-xs text-muted-foreground/50 text-center">
            {phase === "idle" ? "Touch anywhere to begin" : "Touch anywhere to try again"}
          </p>
        )}
      </div>
    </div>
  );
}

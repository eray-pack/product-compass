/* global React, Eyebrow, IconBack, IconCheck */
const { useState, useEffect, useRef } = React;

const PHASES = [{ label: "Inhale", s: 4 }, { label: "Hold", s: 4 }, { label: "Exhale", s: 6 }];
const TOTAL = 180;
const PEAK = 0.38;
const SIGMA = 0.18;
const intensity = (t) => Math.exp(-Math.pow(t - PEAK, 2) / (2 * SIGMA * SIGMA));

function UrgeWaveGraph({ elapsed }) {
  const W = 320, H = 90, PAD_X = 12, PAD_T = 14, PAD_B = 22;
  const innerW = W - PAD_X * 2, innerH = H - PAD_T - PAD_B;
  const STEPS = 120;
  const pts = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    pts.push([PAD_X + t * innerW, PAD_T + innerH * (1 - intensity(t))]);
  }
  const toPath = (p) => p.map((q, i) => `${i === 0 ? "M" : "L"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const cT = Math.min(1, elapsed / TOTAL);
  const cX = PAD_X + cT * innerW;
  const cY = PAD_T + innerH * (1 - intensity(cT));
  const splitIdx = Math.round(cT * STEPS);
  const past = pts.slice(0, splitIdx + 1);
  const future = pts.slice(splitIdx);
  const fillPts = [[PAD_X, PAD_T + innerH], ...past, [cX, PAD_T + innerH]];
  const labelX = Math.min(Math.max(cX, 62), W - 62);

  return (
    <div>
      <Eyebrow track=".20em">Urge Intensity</Eyebrow>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", marginTop: 6 }}>
        <defs>
          <linearGradient id="urge-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 255)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {past.length > 1 && <path d={toPath(fillPts) + " Z"} fill="url(#urge-fill)" />}
        {future.length > 1 && <path d={toPath(future)} fill="none" stroke="oklch(0.40 0.04 265)" strokeWidth="2" strokeLinecap="round" />}
        {past.length > 1 && <path d={toPath(past)} fill="none" stroke="oklch(0.62 0.22 255)" strokeWidth="2.5" strokeLinecap="round" />}
        <text x={PAD_X + 0.12 * innerW} y={PAD_T + innerH * (1 - intensity(0.12)) - 7} textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="0.12em" fill="oklch(0.55 0.18 255)">RISE</text>
        <text x={PAD_X + 0.68 * innerW} y={PAD_T + innerH * (1 - intensity(0.68)) - 7} textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="0.12em" fill="oklch(0.45 0.04 265)">FADE</text>
        <line x1={cX} y1={cY - 4} x2={labelX} y2={PAD_T - 2} stroke="white" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
        <text x={labelX} y={PAD_T - 4} textAnchor="middle" fontSize="7.5" fontWeight="700" letterSpacing="0.1em" fill="white">YOU ARE HERE</text>
        <circle cx={cX} cy={cY} r="6" fill="oklch(0.62 0.22 255)" opacity="0.25" />
        <circle cx={cX} cy={cY} r="3.5" fill="white" />
        <line x1={PAD_X} y1={PAD_T + innerH} x2={W - PAD_X} y2={PAD_T + innerH} stroke="oklch(0.28 0.03 265)" strokeWidth="1" />
        <text x={PAD_X} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">0s</text>
        <text x={W / 2} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">90s</text>
        <text x={W - PAD_X} y={H - 4} fontSize="8" fill="oklch(0.40 0.03 265)" textAnchor="middle">3:00</text>
      </svg>
    </div>
  );
}

function SOSScreen({ onBack }) {
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(PHASES[0].s);
  const idxRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setPhaseLeft((p) => {
        if (p > 1) return p - 1;
        const n = (idxRef.current + 1) % PHASES.length;
        idxRef.current = n;
        setPhaseIdx(n);
        return PHASES[n].s;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const phase = PHASES[phaseIdx];
  const animation = phase.label === "Inhale" ? `breathe-in ${phase.s}s ease-in-out forwards`
    : phase.label === "Exhale" ? `breathe-out ${phase.s}s ease-in-out forwards` : "none";

  return (
    <div style={{ minHeight: "100%", padding: "40px 24px 48px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, color: "var(--muted-foreground)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <IconBack size={16} /> Back
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 9999, border: "1px solid oklch(0.62 0.24 25 / 0.5)", background: "oklch(0.62 0.24 25 / 0.12)" }}>
          <span style={{ position: "relative", display: "inline-flex", height: 8, width: 8 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: 9999, background: "oklch(0.62 0.24 25)", opacity: 0.75, animation: "pulse-ring 2s ease-out infinite" }} />
            <span style={{ position: "relative", height: 8, width: 8, borderRadius: 9999, background: "oklch(0.62 0.24 25)" }} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "oklch(0.62 0.24 25)" }}>Active Urge</span>
        </span>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Eyebrow color="primary" track=".30em">Urge Surfing</Eyebrow>
        <h1 style={{ marginTop: 8, fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>Don't fight it. Watch it.</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--muted-foreground)", maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
          Urges peak around 90 seconds and then fade. Stay with it.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24 }}>
        <div style={{ position: "relative", height: 224, width: 224, display: "grid", placeItems: "center" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 9999, background: "oklch(0.62 0.22 255 / 0.06)" }} />
          <div key={`${phaseIdx}-${elapsed === 0}`} style={{
            height: 144, width: 144, borderRadius: 9999, display: "grid", placeItems: "center",
            background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)",
            animation, transformOrigin: "center",
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".15em", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{phase.label}</p>
              <p style={{ fontSize: 30, fontWeight: 700, color: "white", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginTop: 4 }}>{phaseLeft}s</p>
            </div>
          </div>
        </div>
        <p style={{ marginTop: 24, fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{mm}:{ss}</p>
        <Eyebrow track=".15em">Time with the urge</Eyebrow>
      </div>

      <div style={{ marginTop: 24, borderRadius: 16, border: "1px solid var(--border-soft)", background: "var(--gradient-surface)", padding: 16 }}>
        <UrgeWaveGraph elapsed={elapsed} />
      </div>
    </div>
  );
}

Object.assign(window, { SOSScreen });

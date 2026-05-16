import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Snowflake, GitBranch, Plus, Lock, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

export const Route = createFileRoute("/tools/")({
  component: Tools,
});

const reframes = [
  "Every time you resist, you literally grow new neural pathways.",
  "The urge isn't you — it's old wiring asking for one more hit.",
  "Discomfort now is your prefrontal cortex coming back online.",
  "Each clean day raises your dopamine baseline by a measurable amount.",
  "You're not giving something up. You're getting yourself back.",
];

function CoachRobot() {
  return (
    <svg
      width="52"
      height="66"
      viewBox="0 0 52 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      className="robot-body"
    >
      {/* Antenna */}
      <line x1="26" y1="9" x2="26" y2="2" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="2" r="2.5" fill="#C4873A" />

      {/* Head */}
      <rect x="8" y="9" width="36" height="22" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Eyes */}
      <circle cx="19" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
      <circle cx="33" cy="20" r="3.5" fill="#C4873A" opacity="0.85" />
      {/* Eye shine */}
      <circle cx="20.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <circle cx="34.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />

      {/* Smile */}
      <path d="M 20 26 Q 26 30.5 32 26" stroke="#C4873A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />

      {/* Neck */}
      <rect x="21" y="31" width="10" height="5" rx="2.5" fill="#261F15" />

      {/* Body */}
      <rect x="5" y="36" width="42" height="26" rx="6" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Chest panel */}
      <rect x="14" y="42" width="24" height="12" rx="3" fill="#261F15" stroke="#C4873A" strokeWidth="0.6" opacity="0.75" />
      {/* Indicator dots — left dim, right lit */}
      <circle cx="23" cy="48" r="2.5" fill="#C4873A" opacity="0.35" />
      <circle cx="30" cy="48" r="2.5" fill="#C4873A" opacity="0.9" />

      {/* Left arm — static */}
      <rect x="0" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C4873A" strokeWidth="1.2" />

      {/* Right arm — waving (pivot: top-center of rect = shoulder joint) */}
      <rect
        x="43"
        y="38"
        width="9"
        height="18"
        rx="4.5"
        fill="#1C170F"
        stroke="#C4873A"
        strokeWidth="1.2"
        className="robot-wave-arm"
      />
    </svg>
  );
}

// ── Cut the Signal game circles ───────────────────────────────────────────────
function SignalGame({ to, glow, label, icon }: { to: string; glow: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-3 active:opacity-70 transition-opacity">
      <div
        className="h-[68px] w-[68px] rounded-full grid place-items-center"
        style={{
          background: "var(--card)",
          border: `1.5px solid ${glow}44`,
          boxShadow: `0 0 20px 4px ${glow}35, 0 0 6px 1px ${glow}22`,
        }}
      >
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-foreground/70 text-center leading-tight max-w-[72px]">
        {label}
      </span>
    </Link>
  );
}

function MindPulseIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#6BAED6" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="6" fill="#6BAED6" fillOpacity="0.15" stroke="#6BAED6" strokeWidth="1.3"/>
      <path d="M5 15 L9 15 L11 10 L13 20 L15 13 L17 17 L19 15 L25 15" stroke="#6BAED6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ImpulseShiftIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#C4873A" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="7" stroke="#C4873A" strokeWidth="1.2" strokeOpacity="0.65"/>
      <circle cx="15" cy="15" r="2.2" fill="#C4873A"/>
      <line x1="15" y1="2" x2="15" y2="6"  stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="24" x2="15" y2="28" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="15" x2="6"  y2="15" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="15" x2="28" y2="15" stroke="#C4873A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function NeuralLinkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="8"  y1="8"  x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="8"  x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8"  y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8"  y1="8"  x2="22" y2="8"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8"  y1="22" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8"  y1="8"  x2="8"  y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="22" y1="8"  x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <circle cx="8"  cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="8"  r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="8"  cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="2.8" fill="#6BAA75" fillOpacity="0.2" stroke="#6BAA75" strokeWidth="1.2"/>
      <circle cx="15" cy="15" r="3.5" fill="#6BAA75" fillOpacity="0.3" stroke="#6BAA75" strokeWidth="1.4"/>
    </svg>
  );
}

function ColdSwitchIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M4 11 H19 M16 8 L19 11 L16 14" stroke="#00BCD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 19 H11 M14 16 L11 19 L14 22" stroke="#00BCD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="19" y1="11" x2="11" y2="19" stroke="#00BCD4" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 2"/>
    </svg>
  );
}

function VoidStareIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <ellipse cx="15" cy="15" rx="30" ry="30" stroke="#7B2FBE" strokeOpacity="0" fill="none"/>
      <path d="M2 15 Q15 4 28 15 Q15 26 2 15Z" stroke="#7B2FBE" strokeWidth="1.5" fill="#7B2FBE" fillOpacity="0.10"/>
      <circle cx="15" cy="15" r="5" fill="#7B2FBE" fillOpacity="0.28" stroke="#7B2FBE" strokeWidth="1.3"/>
      <circle cx="15" cy="15" r="2.5" fill="#7B2FBE"/>
      <circle cx="17" cy="13" r="1.2" fill="#FFF" opacity="0.45"/>
    </svg>
  );
}

function ClarityClimbIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M3 26 L15 5 L27 26 Z" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" fill="#10B981" fillOpacity="0.08"/>
      <path d="M11 19 L15 14 L19 19" stroke="#10B981" strokeWidth="1.4" strokeLinejoin="round" fill="none" opacity="0.65"/>
      <path d="M15 14 L15 8" stroke="#10B981" strokeWidth="1.3" strokeDasharray="2 2" strokeLinecap="round" opacity="0.7"/>
      <circle cx="15" cy="5" r="2.8" fill="#FFD700" opacity="0.85"/>
    </svg>
  );
}

function EchoChamberIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="3" fill="#F97316"/>
      <path d="M7 7 Q1 15 7 23"  stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M23 7 Q29 15 23 23" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M10 11 Q6 15 10 19"  stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M20 11 Q24 15 20 19" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  );
}

function DarkRoomIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="4" y="12" width="12" height="7" rx="2" fill="#4F46E5" fillOpacity="0.22" stroke="#4F46E5" strokeWidth="1.5"/>
      <path d="M16 13 L27 8 L27 22 L16 18 Z" fill="#4F46E5" fillOpacity="0.14" stroke="#4F46E5" strokeWidth="1" strokeOpacity="0.5"/>
      <rect x="14" y="12" width="3" height="7" rx="0.5" fill="#4F46E5" fillOpacity="0.55"/>
      <circle cx="8" cy="15.5" r="1.5" fill="#4F46E5" opacity="0.8"/>
    </svg>
  );
}

function NoiseFilterIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M2 15 L5 11 L7 19 L9 9 L11 21 L13 15" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.38"/>
      <line x1="14.5" y1="7" x2="14.5" y2="23" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" opacity="0.65"/>
      <path d="M17 15 L19 11 L21 19 L23 11 L25 19 L28 15" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SteadyHandIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="3" y1="15" x2="27" y2="15" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" opacity="0.28"/>
      <line x1="3" y1="11" x2="27" y2="11" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
      <line x1="3" y1="19" x2="27" y2="19" stroke="#D97706" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
      <circle cx="15" cy="15" r="5" fill="#D97706" fillOpacity="0.18" stroke="#D97706" strokeWidth="1.5"/>
      <circle cx="15" cy="15" r="2.2" fill="#D97706"/>
    </svg>
  );
}

function IdentityStackIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="8" y="14" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.08" stroke="#E11D48" strokeWidth="1" opacity="0.45" transform="rotate(5 16 19)"/>
      <rect x="7" y="12" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.12" stroke="#E11D48" strokeWidth="1.1" opacity="0.65"/>
      <rect x="6" y="10" width="16" height="11" rx="2" fill="#E11D48" fillOpacity="0.18" stroke="#E11D48" strokeWidth="1.5"/>
      <line x1="9"  y1="14.5" x2="19" y2="14.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="9"  y1="17.5" x2="15" y2="17.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

const PRO_GAMES = [
  { to: "/tools/coldswitch",   glow: "#00BCD4", label: "Cold Switch",    icon: <ColdSwitchIcon /> },
  { to: "/tools/voidstare",    glow: "#7B2FBE", label: "Void Stare",     icon: <VoidStareIcon /> },
  { to: "/tools/clarityclimb", glow: "#10B981", label: "Clarity Climb",  icon: <ClarityClimbIcon /> },
  { to: "/tools/echochamber",  glow: "#F97316", label: "Echo Chamber",   icon: <EchoChamberIcon /> },
  { to: "/tools/darkroom",     glow: "#4F46E5", label: "Dark Room",      icon: <DarkRoomIcon /> },
  { to: "/tools/noisefilter",  glow: "#2563EB", label: "Noise Filter",   icon: <NoiseFilterIcon /> },
  { to: "/tools/steadyhand",   glow: "#D97706", label: "Steady Hand",    icon: <SteadyHandIcon /> },
  { to: "/tools/identitystack",glow: "#E11D48", label: "Identity Stack", icon: <IdentityStackIcon /> },
] as const;

function Tools() {
  const [state] = useAppState();
  const [reframe, setReframe] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [plans, setPlans] = useState([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Use what works.</h1>
      </header>

      {/* ── SOS hero — glowing circle ────────────────────────── */}
      <section className="flex justify-center mt-10 mb-2 fade-up-1">
        <Link
          to="/tools/sos"
          className="sos-heartbeat flex flex-col items-center justify-center text-center active:scale-95 transition-transform"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "oklch(0.18 0.06 25)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
            }}
          >
            <p className="text-[15px] font-bold text-white leading-snug px-8">
              Urge hitting?<br />We've got you.
            </p>
            <p className="mt-2 text-[11px] px-6 leading-relaxed" style={{ color: "oklch(0.70 0.06 25)" }}>
              Tap to start urge surfing · 3 min
            </p>
          </div>
        </Link>
      </section>

      {/* ── Cut the Signal Games ─────────────────────────────── */}
      <section className="px-6 mt-10 pt-8 fade-up-2" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <button
          onClick={() => setGamesOpen((v) => !v)}
          className="flex items-center gap-3 w-full text-left"
        >
          <div
            className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: "oklch(0.62 0.18 280 / 0.12)", color: "oklch(0.68 0.18 280)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {/* Controller body */}
              <path d="M2 7 Q2 5 4 5 L5.5 5 Q6 4 8 4 Q10 4 10.5 5 L12 5 Q14 5 14 7 L13.5 11 Q13 13 11.5 13 L10.5 13 Q9.5 12 8 12 Q6.5 12 5.5 13 L4.5 13 Q3 13 2.5 11 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              {/* D-pad left */}
              <line x1="4.5" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="5.5" y1="7" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              {/* Buttons right */}
              <circle cx="10.5" cy="7.5" r="0.7" fill="currentColor" opacity="0.9"/>
              <circle cx="11.8" cy="8.5" r="0.7" fill="currentColor" opacity="0.9"/>
              <circle cx="10.5" cy="9.5" r="0.7" fill="currentColor" opacity="0.9"/>
              <circle cx="9.2" cy="8.5" r="0.7" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Cut the Signal Games</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Train your brain. Beat the urge.</p>
          </div>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200"
            style={{ transform: gamesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {gamesOpen && (
          <div className="mt-5 text-center">
            <div className="flex justify-around">
              <SignalGame to="/tools/breath" glow="#6BAED6" label="Mind Pulse"    icon={<MindPulseIcon />} />
              <SignalGame to="/tools/tap"    glow="#C4873A" label="Impulse Shift" icon={<ImpulseShiftIcon />} />
              <SignalGame to="/tools/memory" glow="#6BAA75" label="Neural Link"   icon={<NeuralLinkIcon />} />
            </div>
            {state.isPremium === true ? (
              <div className="mt-7 grid grid-cols-3 gap-y-6 place-items-center">
                {PRO_GAMES.map(({ to, glow, label, icon }) => (
                  <SignalGame key={to} to={to} glow={glow} label={label} icon={icon} />
                ))}
              </div>
            ) : (
              <button
                onClick={() => triggerPaywall()}
                className="mt-4 flex items-center justify-center gap-1.5 w-full active:opacity-70 transition-opacity flex-wrap"
              >
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}
                >
                  <Lock className="h-3 w-3" /> PRO
                </span>
                <span className="text-[11px] text-muted-foreground/60">More games available</span>
                <span className="flex items-center gap-1">
                  {PRO_GAMES.map(({ label, glow }) => (
                    <span
                      key={label}
                      className="inline-flex items-center justify-center rounded-full text-[8px] font-bold"
                      style={{
                        width: 16, height: 16,
                        background: `${glow}22`,
                        border: `1px solid ${glow}66`,
                        color: glow,
                      }}
                    >
                      {label[0]}
                    </span>
                  ))}
                </span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── Recovery Coach ───────────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 fade-up-3" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <Link to="/tools/coach" className="flex flex-col items-center text-center gap-1 py-1 active:scale-95 transition-transform">
          <CoachRobot />
          <p className="font-semibold text-sm mt-2">Recovery Coach</p>
          <p className="text-[11px] text-muted-foreground">Talk it through. No judgment.</p>
        </Link>
      </section>

      {/* ── Reframe ─────────────────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 fade-up-4" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.10)", color: "var(--primary)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
            >
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reframe</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Rewire your reaction in one thought.</p>
            </div>
          </div>
          <button
            onClick={() => setReframe(reframes[Math.floor(Math.random() * reframes.length)])}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: "var(--primary)", border: "1px solid oklch(0.62 0.22 255 / 0.28)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            Show me one
          </button>
        </div>
        {reframe && (
          <p
            className="mt-5 text-sm leading-relaxed italic"
            style={{ color: "oklch(0.78 0.025 265 / 0.85)" }}
          >
            "{reframe}"
          </p>
        )}
      </section>

      {/* ── Cold Exposure ────────────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <Link to="/tools/cold" className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: "oklch(0.55 0.18 220 / 0.10)", color: "oklch(0.65 0.18 220)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
          >
            <Snowflake className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Cold Exposure</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">2-minute guided cold shower breathing.</p>
          </div>
        </Link>
      </section>

      {/* ── Implementation Plan ──────────────────────────────── */}
      <section className="px-6 mt-6 pt-6 pb-8 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: "oklch(0.62 0.22 255 / 0.10)", color: "var(--primary)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A30, 0 0 4px 1px #C4873A20" }}
            >
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Implementation Plan</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">If/then strategies for your triggers.</p>
            </div>
          </div>
          <button
            onClick={() => setPlanOpen((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ color: "var(--primary)", border: "1px solid oklch(0.62 0.22 255 / 0.28)", background: "oklch(0.62 0.22 255 / 0.06)" }}
          >
            {planOpen ? "Close" : "Add plan"}
          </button>
        </div>

        <ul className="mt-5 space-y-2">
          {plans.map((p, i) => (
            <li key={i} className="text-sm py-3" style={{ borderBottom: "1px solid oklch(0.20 0.025 265 / 0.6)" }}>
              <span className="text-muted-foreground">If I </span>
              <span className="font-medium">{p.trigger}</span>
              <span className="text-muted-foreground">, I will </span>
              <span className="font-medium" style={{ color: "var(--primary)" }}>{p.action}</span>.
            </li>
          ))}
        </ul>

        {planOpen && (
          <div className="mt-4 space-y-2">
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="If I feel… (trigger)"
              className="w-full rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
            />
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="…I will (action)"
              className="w-full rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
            />
            <button
              onClick={() => {
                if (trigger.trim() && action.trim()) {
                  setPlans([...plans, { trigger, action }]);
                  setTrigger(""); setAction(""); setPlanOpen(false);
                }
              }}
              className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-1"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="h-4 w-4" /> Save plan
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

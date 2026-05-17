import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Snowflake, GitBranch, Plus, Lock, ChevronDown } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/tools/")({
  component: Tools,
});

// ── Design tokens ─────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const GOLD_OUTLINE: React.CSSProperties = {
  color: "#C9A84C",
  border: "1px solid rgba(201,168,76,0.35)",
  background: "rgba(201,168,76,0.06)",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 14px",
  flexShrink: 0,
  transition: "background 0.2s",
};

const ICON_WRAP = (color: string): React.CSSProperties => ({
  height: 38,
  width: 38,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: `${color}18`,
  border: `1px solid ${color}40`,
  boxShadow: `0 0 12px 2px ${color}28`,
  color,
  flexShrink: 0,
});

const REFRAME_COUNT = 5;

// ── CoachRobot SVG ────────────────────────────────────────────────────────────
function CoachRobot() {
  return (
    <svg width="52" height="66" viewBox="0 0 52 66" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible" className="robot-body">
      <line x1="26" y1="9" x2="26" y2="2" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="2" r="2.5" fill="#C9A84C" />
      <rect x="8" y="9" width="36" height="22" rx="6" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <circle cx="19" cy="20" r="3.5" fill="#C9A84C" opacity="0.85" />
      <circle cx="33" cy="20" r="3.5" fill="#C9A84C" opacity="0.85" />
      <circle cx="20.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <circle cx="34.2" cy="18.5" r="1.2" fill="#f5ede0" opacity="0.55" />
      <path d="M 20 26 Q 26 30.5 32 26" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85" />
      <rect x="21" y="31" width="10" height="5" rx="2.5" fill="#261F15" />
      <rect x="5" y="36" width="42" height="26" rx="6" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <rect x="14" y="42" width="24" height="12" rx="3" fill="#261F15" stroke="#C9A84C" strokeWidth="0.6" opacity="0.75" />
      <circle cx="23" cy="48" r="2.5" fill="#C9A84C" opacity="0.35" />
      <circle cx="30" cy="48" r="2.5" fill="#C9A84C" opacity="0.9" />
      <rect x="0" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" />
      <rect x="43" y="38" width="9" height="18" rx="4.5" fill="#1C170F" stroke="#C9A84C" strokeWidth="1.2" className="robot-wave-arm" />
    </svg>
  );
}

// ── Cut-the-Signal game circles ───────────────────────────────────────────────
function SignalGame({ to, glow, label, icon }: { to: string; glow: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-3 active:opacity-70 transition-opacity">
      <div style={{ height: 68, width: 68, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.04)", border: `1.5px solid ${glow}44`, boxShadow: `0 0 20px 4px ${glow}35, 0 0 6px 1px ${glow}22` }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 1.3, maxWidth: 72 }}>{label}</span>
    </Link>
  );
}

// ── Mini icons for signal games ───────────────────────────────────────────────
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
      <circle cx="15" cy="15" r="12" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="15" cy="15" r="7"  stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.65"/>
      <circle cx="15" cy="15" r="2.2" fill="#C9A84C"/>
      <line x1="15" y1="2"  x2="15" y2="6"  stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="24" x2="15" y2="28" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2"  y1="15" x2="6"  y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="15" x2="28" y2="15" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function NeuralLinkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <line x1="8" y1="8" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="8" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="22" y1="22" x2="15" y2="15" stroke="#6BAA75" strokeWidth="1.1" strokeOpacity="0.7"/>
      <line x1="8" y1="8" x2="22" y2="8"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8" y1="22" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="8" y1="8" x2="8" y2="22"  stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
      <line x1="22" y1="8" x2="22" y2="22" stroke="#6BAA75" strokeWidth="1.0" strokeOpacity="0.4"/>
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
      <line x1="9" y1="14.5" x2="19" y2="14.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.85"/>
      <line x1="9" y1="17.5" x2="15" y2="17.5" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

const PRO_GAMES = [
  { to: "/tools/coldswitch",    glow: "#00BCD4", labelKey: "tools.coldswitch.name",    icon: <ColdSwitchIcon /> },
  { to: "/tools/voidstare",     glow: "#7B2FBE", labelKey: "tools.voidstare.name",     icon: <VoidStareIcon /> },
  { to: "/tools/clarityclimb",  glow: "#10B981", labelKey: "tools.clarityclimb.name",  icon: <ClarityClimbIcon /> },
  { to: "/tools/echochamber",   glow: "#F97316", labelKey: "tools.echochamber.name",   icon: <EchoChamberIcon /> },
  { to: "/tools/darkroom",      glow: "#4F46E5", labelKey: "tools.darkroom.name",      icon: <DarkRoomIcon /> },
  { to: "/tools/noisefilter",   glow: "#2563EB", labelKey: "tools.noisefilter.name",   icon: <NoiseFilterIcon /> },
  { to: "/tools/steadyhand",    glow: "#D97706", labelKey: "tools.steadyhand.name",    icon: <SteadyHandIcon /> },
  { to: "/tools/identitystack", glow: "#E11D48", labelKey: "tools.identitystack.name", icon: <IdentityStackIcon /> },
] as const;

// ── Main component ────────────────────────────────────────────────────────────
function Tools() {
  const { t } = useTranslation();
  const [state] = useAppState();
  const [reframeIdx, setReframeIdx] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [plans, setPlans] = useState([
    { trigger: "feel bored at night", action: "do 20 push-ups and read for 10 minutes" },
  ]);

  return (
    <PageShell>
      <style>{`
        @keyframes sos-breathe {
          0%, 100% {
            box-shadow:
              0 0 0 0 rgba(220, 80, 60, 0),
              0 0 40px 10px rgba(200, 60, 40, 0.30),
              inset 0 0 30px 4px rgba(220, 80, 60, 0.08);
          }
          50% {
            box-shadow:
              0 0 0 18px rgba(200, 60, 40, 0.07),
              0 0 65px 22px rgba(200, 60, 40, 0.50),
              inset 0 0 40px 8px rgba(220, 80, 60, 0.14);
          }
        }
        .sos-breathe {
          animation: sos-breathe 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <SectionTitle>{t("nav.tools")}</SectionTitle>
        <h1 className="mt-2 text-3xl font-bold">{t("tools.indexSubtitle")}</h1>
      </header>

      {/* ── SOS hero — breathing pulse circle ───────────────────────────── */}
      <section className="flex justify-center mt-10 mb-2">
        <Link
          to="/tools/sos"
          className="sos-breathe flex flex-col items-center justify-center text-center active:scale-95 transition-transform"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, oklch(0.22 0.08 25), oklch(0.14 0.06 25))",
            border: "1.5px solid rgba(200,80,60,0.30)",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 700, color: "#f5ede0", lineHeight: 1.4, padding: "0 32px" }}>
            {t("tools.sos.heroLine1")}<br />{t("tools.sos.heroLine2")}
          </p>
          <p style={{ marginTop: 8, fontSize: 11, color: "oklch(0.65 0.07 25)", lineHeight: 1.5, padding: "0 24px" }}>
            {t("tools.sos.heroSub")}
          </p>
        </Link>
      </section>

      {/* ── Tool cards grid ─────────────────────────────────────────────── */}
      <section className="px-4 mt-10 pb-8 space-y-3">

        {/* Cut the Signal Games — full-width card */}
        <div style={CARD} className="p-4">
          <button
            onClick={() => setGamesOpen((v) => !v)}
            className="flex items-center gap-3 w-full text-left"
          >
            <div style={ICON_WRAP("oklch(0.68 0.18 280)")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "oklch(0.68 0.18 280)" }}>
                <path d="M2 7 Q2 5 4 5 L5.5 5 Q6 4 8 4 Q10 4 10.5 5 L12 5 Q14 5 14 7 L13.5 11 Q13 13 11.5 13 L10.5 13 Q9.5 12 8 12 Q6.5 12 5.5 13 L4.5 13 Q3 13 2.5 11 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                <line x1="4.5" y1="8" x2="6.5" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <line x1="5.5" y1="7" x2="5.5" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="10.5" cy="7.5" r="0.7" fill="currentColor" opacity="0.9"/>
                <circle cx="11.8" cy="8.5" r="0.7" fill="currentColor" opacity="0.9"/>
                <circle cx="10.5" cy="9.5" r="0.7" fill="currentColor" opacity="0.9"/>
                <circle cx="9.2"  cy="8.5" r="0.7" fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 600, fontSize: 14, color: "#f5ede0" }}>{t("tools.gamesTitle")}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>{t("tools.gamesDesc")}</p>
            </div>
            <ChevronDown
              style={{ height: 16, width: 16, color: "rgba(255,255,255,0.35)", transition: "transform 0.2s", transform: gamesOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
            />
          </button>

          {gamesOpen && (
            <div className="mt-5">
              <div className="flex justify-around">
                <SignalGame to="/tools/breath" glow="#6BAED6" label={t("tools.mindPulse")}    icon={<MindPulseIcon />} />
                <SignalGame to="/tools/tap"    glow="#C9A84C" label={t("tools.impulseShift")} icon={<ImpulseShiftIcon />} />
                <SignalGame to="/tools/memory" glow="#6BAA75" label={t("tools.neuralLink")}   icon={<NeuralLinkIcon />} />
              </div>
              {state.isPremium === true ? (
                <div className="mt-7 grid grid-cols-3 gap-y-6 place-items-center">
                  {PRO_GAMES.map(({ to, glow, labelKey, icon }) => (
                    <SignalGame key={to} to={to} glow={glow} label={t(labelKey)} icon={icon} />
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => triggerPaywall()}
                  className="mt-4 flex items-center justify-center gap-1.5 w-full active:opacity-70 transition-opacity flex-wrap"
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.08)" }}>
                    <Lock style={{ height: 10, width: 10 }} /> PRO
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t("tools.moreGames")}</span>
                  <span className="flex items-center gap-1">
                    {PRO_GAMES.map(({ labelKey, glow }) => (
                      <span key={labelKey} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 8, fontWeight: 700, width: 16, height: 16, background: `${glow}22`, border: `1px solid ${glow}66`, color: glow }}>
                        {t(labelKey)[0]}
                      </span>
                    ))}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recovery Coach — full-width card */}
        <Link to="/tools/coach" style={{ ...CARD, border: "1px solid rgba(201,168,76,0.45)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", gap: 4, textDecoration: "none" }} className="active:scale-[0.98] transition-transform">
          <CoachRobot />
          <p style={{ fontWeight: 600, fontSize: 14, color: "#f5ede0", marginTop: 8 }}>{t("tools.coach.name")}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>{t("tools.coach.tagline")}</p>
        </Link>

        {/* Reframe + Cold Exposure — two-column grid */}
        <div className="grid grid-cols-2 gap-3">

          {/* Reframe */}
          <div style={CARD} className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div style={ICON_WRAP("#C9A84C")}>
                <Brain style={{ height: 16, width: 16 }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#f5ede0" }}>{t("tools.reframeTitle")}</p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.45 }}>{t("tools.reframeDesc")}</p>
            <button
              onClick={() => setReframeIdx(Math.floor(Math.random() * REFRAME_COUNT))}
              style={GOLD_OUTLINE}
            >
              {t("tools.reframeCta")}
            </button>
            {reframeIdx !== null && (
              <p style={{ fontSize: 12, lineHeight: 1.55, fontStyle: "italic", color: "rgba(245,237,224,0.80)", marginTop: 2 }}>
                "{t(`tools.reframes.${reframeIdx}`)}"
              </p>
            )}
          </div>

          {/* Cold Exposure */}
          <Link to="/tools/cold" style={{ ...CARD, display: "flex", flexDirection: "column", gap: 12, padding: 16, textDecoration: "none" }} className="active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-2">
              <div style={ICON_WRAP("oklch(0.65 0.18 220)")}>
                <Snowflake style={{ height: 16, width: 16 }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#f5ede0" }}>{t("tools.coldTitle")}</p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", lineHeight: 1.45 }}>{t("tools.coldDesc")}</p>
            <span style={{ ...GOLD_OUTLINE, display: "inline-block", textAlign: "center" }}>
              {t("tools.coldCta")}
            </span>
          </Link>
        </div>

        {/* Implementation Plan — full-width card */}
        <div style={CARD} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div style={ICON_WRAP("#C9A84C")}>
                <GitBranch style={{ height: 16, width: 16 }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#f5ede0" }}>{t("tools.planTitle")}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>{t("tools.planDesc")}</p>
              </div>
            </div>
            <button onClick={() => setPlanOpen((v) => !v)} style={GOLD_OUTLINE}>
              {planOpen ? t("tools.planClose") : t("tools.planAdd")}
            </button>
          </div>

          {/* Existing plans */}
          {plans.length > 0 && (
            <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {plans.map((p, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(201,168,76,0.05)",
                    border: "1px solid rgba(201,168,76,0.12)",
                    color: "rgba(245,237,224,0.75)",
                  }}
                >
                  <span>{t("tools.planIfI")} </span>
                  <span style={{ fontWeight: 600, color: "#f5ede0" }}>{p.trigger}</span>
                  <span>, {t("tools.planIWill")} </span>
                  <span style={{ fontWeight: 600, color: "#C9A84C" }}>{p.action}</span>
                  <span>.</span>
                </li>
              ))}
            </ul>
          )}

          {/* Add-plan form */}
          {planOpen && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder={t("tools.planTriggerPlaceholder")}
                style={{
                  width: "100%", borderRadius: 10, fontSize: 13, padding: "10px 14px", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)",
                  color: "#f5ede0",
                }}
              />
              <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder={t("tools.planActionPlaceholder")}
                style={{
                  width: "100%", borderRadius: 10, fontSize: 13, padding: "10px 14px", outline: "none",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.25)",
                  color: "#f5ede0",
                }}
              />
              <button
                onClick={() => {
                  if (trigger.trim() && action.trim()) {
                    setPlans([...plans, { trigger, action }]);
                    setTrigger(""); setAction(""); setPlanOpen(false);
                  }
                }}
                style={{
                  width: "100%", borderRadius: 10, padding: "10px 14px", fontSize: 13,
                  fontWeight: 700, color: "#090705",
                  background: "linear-gradient(135deg, #C9A84C, #E8C96A)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <Plus style={{ height: 16, width: 16 }} /> {t("tools.planSave")}
              </button>
            </div>
          )}
        </div>

      </section>
    </PageShell>
  );
}

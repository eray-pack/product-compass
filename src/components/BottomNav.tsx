import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Users, BarChart2, Settings } from "lucide-react";
import { loadState, useAppState } from "@/lib/store";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PremiumBackground } from "@/components/PremiumBackground";
import { useTranslation } from "react-i18next";

function useScrollHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "Cormorant Garamond, Georgia, serif",
        fontSize: 16,
        fontWeight: 700,
        fontStyle: "italic",
        color: "#C9A84C",
        letterSpacing: 0,
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

// ── Companion icons ───────────────────────────────────────────────────────────

function TreeIcon({ strokeWidth }: { strokeWidth: number }) {
  return (
    <svg
      width="26" height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="22" x2="12" y2="13" />
      <path d="M5 17l7-4 7 4" />
      <path d="M7 13l5-4 5 4" />
      <path d="M9 9l3-5 3 5" />
    </svg>
  );
}

function WolfIcon({ strokeWidth }: { strokeWidth: number }) {
  return (
    <svg
      width="26" height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8 L6 2 L9 7" />
      <path d="M15 7 L18 2 L20 8" />
      <path d="M4 8 Q4 14 12 14 Q20 14 20 8 Q20 4 15 3 Q12 2 9 3 Q4 4 4 8Z" />
      <path d="M9 12 Q12 15 15 12" />
      <path d="M7 14 Q4 18 5 22" />
      <path d="M17 14 Q20 18 19 22" />
      <path d="M5 22 Q12 20 19 22" />
      <path d="M5 16 Q1 12 3 8" />
    </svg>
  );
}

const COMPANION_ICONS = { tree: TreeIcon, wolf: WolfIcon } as const;

const BASE_NAV_KEYS = [
  { to: "/",          labelKey: "nav.home",      Icon: Home      },
  { to: "/tools",     labelKey: "nav.tools",     Icon: Wrench    },
  { to: "/community", labelKey: "nav.community", Icon: Users     },
  { to: "/progress",  labelKey: "nav.progress",  Icon: BarChart2 },
] as const;

export function BottomNav() {
  const { t } = useTranslation();
  const path         = useRouterState({ select: (r) => r.location.pathname });
  const hidden       = useScrollHide();
  const companion    = loadState().companion ?? "tree";
  const CompanionIcon  = COMPANION_ICONS[companion];
  const companionLabelKey = companion === "wolf" ? "nav.companion" : "nav.tree";
  const [state, update] = useAppState();

  // ── Subscription Debugger (triple-tap Tools tab) ──────────────────────────
  const [debugOpen, setDebugOpen] = useState(false);
  const toolsTapCount = useRef(0);
  const toolsTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleToolsTap() {
    toolsTapCount.current += 1;
    if (toolsTapTimer.current) clearTimeout(toolsTapTimer.current);
    toolsTapTimer.current = setTimeout(() => { toolsTapCount.current = 0; }, 1500);
    if (toolsTapCount.current >= 3) {
      toolsTapCount.current = 0;
      setDebugOpen(true);
    }
  }

  const navItems = [
    { ...BASE_NAV_KEYS[0], label: t(BASE_NAV_KEYS[0].labelKey) },
    { to: "/tree" as const, label: t(companionLabelKey), Icon: null as unknown as typeof Home },
    ...BASE_NAV_KEYS.slice(1).map((n) => ({ ...n, label: t(n.labelKey) })),
  ];

  return (
    <>
    <nav
      className={`fixed bottom-0 inset-x-0 z-40 flex justify-center transition-transform duration-300 ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-[28px]"
        style={{
          background: "oklch(0.13 0.020 265 / 0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid oklch(0.26 0.028 265 / 0.55)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {navItems.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          const sw = active ? 2.3 : 1.7;
          const isTools = to === "/tools";

          return (
            <Link
              key={to}
              to={to}
              onClick={isTools ? handleToolsTap : undefined}
              className="relative flex flex-col items-center transition-all"
              style={{
                color: active ? "#C4873A" : "rgba(255,255,255,0.45)",
                minWidth: active ? 72 : 52,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: active ? 14 : 10,
                paddingRight: active ? 14 : 10,
                borderRadius: 22,
                background: active ? "rgba(196,135,58,0.10)" : "transparent",
                gap: 5,
              }}
            >
              {/* Active glow dot above icon */}
              {active && (
                <span
                  className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 18,
                    height: 2.5,
                    background: "linear-gradient(90deg, #C4873A, #E8A84A)",
                    boxShadow: "0 0 8px rgba(196,135,58,0.7)",
                  }}
                />
              )}

              {to === "/tree" ? (
                <CompanionIcon strokeWidth={sw} />
              ) : (
                <Icon width={26} height={26} strokeWidth={sw} />
              )}

              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 600,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>

    {/* ── Subscription Debugger modal (triple-tap Tools tab) ───────────────── */}
    {debugOpen && (
      <>
        {/* Backdrop */}
        <div
          onClick={() => setDebugOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, backdropFilter: "blur(4px)" }}
        />

        {/* Console panel */}
        <div style={{
          position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", left: 12, right: 12,
          zIndex: 201,
          background: "rgba(4,8,6,0.97)",
          border: "1px solid rgba(52,211,153,0.35)",
          borderRadius: 18,
          boxShadow: "0 0 40px rgba(52,211,153,0.12), 0 0 80px rgba(52,211,153,0.05)",
          overflow: "hidden",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        }}>
          <style>{`
            @keyframes db-cursor { 0%,49%{opacity:1}50%,100%{opacity:0} }
            @keyframes db-scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
          `}</style>

          {/* Scanline overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden",
            background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(52,211,153,0.015) 3px, rgba(52,211,153,0.015) 4px)",
          }}/>

          {/* Header bar */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px solid rgba(52,211,153,0.15)",
            background: "rgba(52,211,153,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(52,211,153,0.50)" }}>●</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#3fd399", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Dev Debugger
              </span>
              <span style={{ fontSize: 10, color: "rgba(52,211,153,0.40)", animation: "db-cursor 1.1s step-end infinite" }}>█</span>
            </div>
            <button onClick={() => setDebugOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(52,211,153,0.40)", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ position: "relative", zIndex: 2, padding: "16px 14px 18px" }}>

            {/* Console log lines */}
            <div style={{ marginBottom: 14 }}>
              {[
                ["SYS", "Subscription Debugger v1.0"],
                ["ENV", `companion: ${companion} | xp: ${state.treeXP}`],
                ["STATE", `isPremium: ${state.isPremium ? "TRUE" : "FALSE"}`],
                ["GAMES", `pro_unlocked: ${state.isPremium ? "9/9" : "0/9"} | free: 3/3`],
              ].map(([tag, msg], i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 10, lineHeight: 1.6, color: "rgba(52,211,153,0.55)" }}>
                  <span style={{ color: tag === "STATE" ? "#E8C87A" : "rgba(52,211,153,0.35)", minWidth: 36 }}>[{tag}]</span>
                  <span style={{ color: tag === "STATE" ? "rgba(232,200,122,0.80)" : "rgba(52,211,153,0.55)" }}>{msg}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(52,211,153,0.10)", marginBottom: 14 }} />

            {/* Pro toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#3fd399", letterSpacing: "0.06em" }}>Pro Mode</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(52,211,153,0.40)" }}>
                  {state.isPremium ? "9 pro games unlocked" : "Simulating free tier — 9 games locked"}
                </p>
              </div>
              <button
                onClick={() => update((s) => ({ isPremium: !s.isPremium }))}
                style={{
                  position: "relative", width: 48, height: 26, borderRadius: 13,
                  background: state.isPremium ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${state.isPremium ? "rgba(52,211,153,0.60)" : "rgba(255,255,255,0.12)"}`,
                  cursor: "pointer", transition: "all 0.22s", flexShrink: 0,
                  boxShadow: state.isPremium ? "0 0 10px rgba(52,211,153,0.30)" : "none",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
                  background: state.isPremium ? "#3fd399" : "rgba(255,255,255,0.25)",
                  left: state.isPremium ? 26 : 3,
                  transition: "all 0.22s",
                  boxShadow: state.isPremium ? "0 0 6px rgba(52,211,153,0.80)" : "none",
                }}/>
              </button>
            </div>

            {/* Companion Switcher unlock toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "8px 10px", borderRadius: 10, background: "rgba(52,211,153,0.03)", border: "1px solid rgba(52,211,153,0.08)" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: state.companionSwitcherUnlocked ? "#3fd399" : "rgba(52,211,153,0.55)", letterSpacing: "0.04em" }}>
                  Unlock Companion Switcher
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(52,211,153,0.32)" }}>
                  {state.companionSwitcherUnlocked ? "Wolf card unlocked (dev override)" : "Wolf locked — tap to test unlock"}
                </p>
              </div>
              <button
                onClick={() => update((s) => ({ companionSwitcherUnlocked: !s.companionSwitcherUnlocked }))}
                style={{
                  position: "relative", width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                  background: state.companionSwitcherUnlocked ? "rgba(52,211,153,0.22)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${state.companionSwitcherUnlocked ? "rgba(52,211,153,0.50)" : "rgba(255,255,255,0.10)"}`,
                  cursor: "pointer", transition: "all 0.22s",
                  boxShadow: state.companionSwitcherUnlocked ? "0 0 8px rgba(52,211,153,0.25)" : "none",
                }}
              >
                <div style={{
                  position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
                  background: state.companionSwitcherUnlocked ? "#3fd399" : "rgba(255,255,255,0.22)",
                  left: state.companionSwitcherUnlocked ? 20 : 2,
                  transition: "all 0.22s",
                  boxShadow: state.companionSwitcherUnlocked ? "0 0 5px rgba(52,211,153,0.70)" : "none",
                }}/>
              </button>
            </div>

            {/* Status rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.10)" }}>
                <span style={{ fontSize: 11, color: "rgba(52,211,153,0.70)" }}>Free games (3)</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3fd399" }}>✓ ACCESSIBLE</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: state.isPremium ? "rgba(52,211,153,0.05)" : "rgba(255,80,80,0.05)", border: `1px solid ${state.isPremium ? "rgba(52,211,153,0.10)" : "rgba(255,80,80,0.15)"}` }}>
                <span style={{ fontSize: 11, color: state.isPremium ? "rgba(52,211,153,0.70)" : "rgba(255,120,120,0.70)" }}>Pro games (9)</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: state.isPremium ? "#3fd399" : "#ff7777" }}>
                  {state.isPremium ? "✓ UNLOCKED" : "⊘ LOCKED"}
                </span>
              </div>
              {!state.isPremium && (
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.20)", fontSize: 10, color: "rgba(201,168,76,0.70)", lineHeight: 1.5 }}>
                  ▲ Upgrade to Pro CTA banner is visible on Tools page
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}

function CreditsChip() {
  const [points, setPoints] = useState(() => loadState().points);
  useEffect(() => {
    const sync = () => setPoints(loadState().points);
    window.addEventListener("focus", sync);
    const id = setInterval(sync, 2000);
    return () => { window.removeEventListener("focus", sync); clearInterval(id); };
  }, []);

  return (
    <Link
      to="/tree#grow-your-tree"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px", borderRadius: 999,
        background: "rgba(201,168,76,0.10)",
        border: "1px solid rgba(201,168,76,0.30)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        textDecoration: "none",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="#C9A84C" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="5" fill="#C9A84C" opacity="0.5"/>
        <circle cx="10" cy="10" r="2.5" fill="#C9A84C"/>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.02em" }}>
        {points}
      </span>
    </Link>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const path       = useRouterState({ select: (r) => r.location.pathname });
  const onSettings = path === "/settings";

  return (
    <div className="min-h-screen pb-32 mx-auto max-w-md">
      <PremiumBackground hideWaves={path === "/" || path === "/tools"} />
      {!onSettings && (
        <div className="fixed top-3 right-4 z-30 flex items-center gap-2">
          <CreditsChip />
          <Link
            to="/settings"
            className="h-9 w-9 rounded-xl grid place-items-center border border-border/60 transition-colors hover:bg-foreground/[0.06]"
            style={{ background: "var(--card)", backdropFilter: "blur(12px)" }}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      )}
      {children}
      <BottomNav />
    </div>
  );
}

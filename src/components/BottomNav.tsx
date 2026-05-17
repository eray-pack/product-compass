import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Users, BarChart2, Settings } from "lucide-react";
import { loadState } from "@/lib/store";
import { useEffect, useRef, useState, type ReactNode } from "react";

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

const BASE_NAV = [
  { to: "/",          label: "Home",     Icon: Home      },
  { to: "/tools",     label: "Tools",    Icon: Wrench    },
  { to: "/community", label: "Community",Icon: Users     },
  { to: "/progress",  label: "Progress", Icon: BarChart2 },
] as const;

export function BottomNav() {
  const path         = useRouterState({ select: (r) => r.location.pathname });
  const hidden       = useScrollHide();
  const companion    = loadState().companion ?? "tree";
  const CompanionIcon  = COMPANION_ICONS[companion];
  const companionLabel = companion === "wolf" ? "Companion" : "Tree";

  const navItems = [
    BASE_NAV[0],
    { to: "/tree" as const, label: companionLabel, Icon: null as unknown as typeof Home },
    ...BASE_NAV.slice(1),
  ];

  return (
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

          return (
            <Link
              key={to}
              to={to}
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
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const path       = useRouterState({ select: (r) => r.location.pathname });
  const onSettings = path === "/settings";

  return (
    <div className="min-h-screen pb-32 mx-auto max-w-md">
      {!onSettings && (
        <Link
          to="/settings"
          className="fixed top-3 right-4 z-30 h-9 w-9 rounded-xl grid place-items-center border border-border/60 transition-colors hover:bg-foreground/[0.06]"
          style={{ background: "var(--card)", backdropFilter: "blur(12px)" }}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}
      {children}
      <BottomNav />
    </div>
  );
}

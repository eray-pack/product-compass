import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Users, BarChart2, Settings } from "lucide-react";
import { loadState } from "@/lib/store";
import type { ReactNode } from "react";

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
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* trunk */}
      <line x1="12" y1="22" x2="12" y2="13" />
      {/* bottom layer */}
      <path d="M5 17l7-4 7 4" />
      {/* middle layer */}
      <path d="M7 13l5-4 5 4" />
      {/* top layer */}
      <path d="M9 9l3-5 3 5" />
    </svg>
  );
}

function WolfIcon({ strokeWidth }: { strokeWidth: number }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ears */}
      <path d="M4 8 L6 2 L9 7" />
      <path d="M15 7 L18 2 L20 8" />
      {/* head */}
      <path d="M4 8 Q4 14 12 14 Q20 14 20 8 Q20 4 15 3 Q12 2 9 3 Q4 4 4 8Z" />
      {/* snout */}
      <path d="M9 12 Q12 15 15 12" />
      {/* body */}
      <path d="M7 14 Q4 18 5 22" />
      <path d="M17 14 Q20 18 19 22" />
      <path d="M5 22 Q12 20 19 22" />
      {/* tail */}
      <path d="M5 16 Q1 12 3 8" />
    </svg>
  );
}

const COMPANION_ICONS = {
  tree: TreeIcon,
  wolf: WolfIcon,
} as const;

// ── Static nav items (companion tab handled separately) ───────────────────────
const BASE_NAV = [
  { to: "/",          label: "Home",      Icon: Home      },
  { to: "/tools",     label: "Tools",     Icon: Wrench    },
  { to: "/community", label: "Community", Icon: Users     },
  { to: "/progress",  label: "Progress",  Icon: BarChart2 },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  // Read companion from localStorage — same source as the rest of the app.
  // loadState() is synchronous and cheap (just a JSON.parse).
  const companion = loadState().companion ?? "tree";
  const CompanionIcon = COMPANION_ICONS[companion];

  const companionLabel = companion === "wolf" ? "Companion" : "Tree";

  // Build ordered nav: Home | Companion | Tools | Community | Progress
  const navItems = [
    BASE_NAV[0],
    { to: "/tree" as const, label: companionLabel, Icon: null as unknown as typeof Home },
    ...BASE_NAV.slice(1),
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-2xl"
      style={{
        background: "oklch(0.11 0.018 265 / 0.92)",
        borderTop: "1px solid oklch(0.20 0.025 265 / 0.6)",
      }}
    >
      <div className="mx-auto max-w-md flex items-stretch">
        {navItems.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          const sw = active ? 2.2 : 1.6;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-2 text-[9.5px] font-semibold tracking-wide transition-all relative ${
                active ? "" : "opacity-50 hover:opacity-80"
              }`}
              style={{ color: active ? "#C4873A" : "rgba(255,255,255,0.85)" }}
            >
              {active && (
                <span
                  className="absolute top-0 inset-x-5 h-[1.5px] rounded-full"
                  style={{ background: "var(--gradient-primary)" }}
                />
              )}
              {to === "/tree" ? (
                <CompanionIcon strokeWidth={sw} />
              ) : (
                <Icon className="h-5 w-5" strokeWidth={sw} />
              )}
              {label}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const onSettings = path === "/settings";

  return (
    <div className="min-h-screen pb-24 mx-auto max-w-md">
      {/* Settings gear — hidden on the settings page itself */}
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

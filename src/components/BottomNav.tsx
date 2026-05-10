import { Link, useRouterState } from "@tanstack/react-router";
import { Home, TreePine, Wrench, Users, BarChart2, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/",          label: "Home",      icon: Home      },
  { to: "/tree",      label: "Tree",      icon: TreePine  },
  { to: "/tools",     label: "Tools",     icon: Wrench    },
  { to: "/community", label: "Community", icon: Users     },
  { to: "/progress",  label: "Progress",  icon: BarChart2 },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 backdrop-blur-xl" style={{ background: "var(--card)" }}>
      <div className="mx-auto max-w-md flex items-stretch">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-2 text-[10px] font-semibold tracking-wide transition-colors relative ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute top-0 inset-x-4 h-[2px] rounded-full bg-primary" />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
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

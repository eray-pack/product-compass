import { Link, useRouterState } from "@tanstack/react-router";
import { Home, TreePine, Wrench, Users, BarChart2 } from "lucide-react";

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
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-xl">
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
              {/* Active indicator line */}
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
  return (
    <div className="min-h-screen pb-24 mx-auto max-w-md">
      {children}
      <BottomNav />
    </div>
  );
}

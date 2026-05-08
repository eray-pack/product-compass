import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Trophy, TreePine, BarChart3 } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/challenges", label: "Quests", icon: Trophy },
  { to: "/tree", label: "Life Tree", icon: TreePine },
  { to: "/progress", label: "Progress", icon: BarChart3 },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
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

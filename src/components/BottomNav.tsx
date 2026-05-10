import { Link, useRouterState } from "@tanstack/react-router";
import { Home, TreePine, BarChart3, Users, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { RelapseModal } from "@/components/RelapseModal";
import { useAppState } from "@/lib/store";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tree", label: "Tree", icon: TreePine },
  { to: "/community", label: "Community", icon: Users },
  { to: "/progress", label: "Progress", icon: BarChart3 },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [state] = useAppState();
  const [showRelapse, setShowRelapse] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-md flex items-center">
          {/* Left two tabs */}
          {NAV_ITEMS.slice(0, 2).map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          {/* Red panic button — dead center */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
            <button
              onClick={() => setShowRelapse(true)}
              className="h-12 w-12 rounded-full bg-destructive grid place-items-center shadow-lg shadow-destructive/30 active:scale-95 transition-transform"
              aria-label="Log relapse"
            >
              <AlertTriangle className="h-5 w-5 text-white" />
            </button>
            <span className="text-[10px] text-destructive font-medium">Relapse</span>
          </div>

          {/* Right two tabs */}
          {NAV_ITEMS.slice(2).map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {showRelapse && (
        <RelapseModal
          onClose={() => setShowRelapse(false)}
          totalCleanDays={state.totalCleanDays}
        />
      )}
    </>
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

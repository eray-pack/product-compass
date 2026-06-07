import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Users, BarChart2, Settings } from "lucide-react";
import { loadState } from "@/lib/store";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PremiumBackground } from "@/components/PremiumBackground";
import { useTranslation } from "react-i18next";

// ── JS elastic bounce — makes page feel springy at scroll edges ───────────────
function useElasticBounce(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startY    = 0;
    let startTime = 0;
    let edgeDy    = 0;    // dy value at the moment we first hit the edge
    let atEdge    = false;
    let edgeSide  = 0;    // 1 = top edge, -1 = bottom edge

    const apply = (y: number, animated: boolean) => {
      el.style.transition = animated
        ? "transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)"
        : "none";
      el.style.transform = y === 0 ? "" : `translateY(${y}px)`;
    };

    const onTouchStart = (e: TouchEvent) => {
      startY    = e.touches[0].clientY;
      startTime = Date.now();
      atEdge    = false;
      edgeSide  = 0;
      // Kill any in-progress spring so it doesn't fight the finger
      el.style.transition = "none";
    };

    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const dy       = currentY - startY;
      const scrollY  = window.scrollY;
      const max      = document.documentElement.scrollHeight - window.innerHeight;

      // Detect the moment we first hit an edge (checked live, not just at touchstart)
      if (!atEdge) {
        if (scrollY <= 0 && dy > 0) {
          atEdge = true; edgeDy = dy; edgeSide = 1;
        } else if (scrollY >= max - 1 && dy < 0) {
          atEdge = true; edgeDy = dy; edgeSide = -1;
        }
      }

      if (atEdge) {
        // Only stretch based on movement PAST the edge point, not the whole gesture
        const excess = dy - edgeDy;
        if (edgeSide === 1) {
          apply(Math.max(0, Math.min(excess * 0.38, 90)), false);
        } else {
          apply(Math.min(0, Math.max(excess * 0.38, -90)), false);
        }
        // If finger reversed back into content, release
        if ((edgeSide === 1 && dy < edgeDy) || (edgeSide === -1 && dy > edgeDy)) {
          atEdge = false; edgeSide = 0;
          apply(0, true);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY     = e.changedTouches[0].clientY;
      const dt       = Math.max(1, Date.now() - startTime);
      const velocity = (endY - startY) / dt;          // px/ms, positive = downward
      const scrollY  = window.scrollY;
      const max      = document.documentElement.scrollHeight - window.innerHeight;

      if (atEdge) {
        // Actively pulling — spring back
        apply(0, true);
      } else if (scrollY <= 6 && velocity > 1.8) {
        // Fast swipe ended right at top — predictive overshoot
        apply(Math.min(velocity * 18, 55), false);
        requestAnimationFrame(() => apply(0, true));
      } else if (scrollY >= max - 6 && velocity < -1.8) {
        // Fast swipe ended right at bottom
        apply(Math.max(velocity * 18, -55), false);
        requestAnimationFrame(() => apply(0, true));
      }

      atEdge = false; edgeSide = 0;
    };

    const onCancel = () => { atEdge = false; edgeSide = 0; apply(0, true); };

    window.addEventListener("touchstart",  onTouchStart, { passive: true });
    window.addEventListener("touchmove",   onTouchMove,  { passive: true });
    window.addEventListener("touchend",    onTouchEnd,   { passive: true });
    window.addEventListener("touchcancel", onCancel,     { passive: true });

    return () => {
      window.removeEventListener("touchstart",  onTouchStart);
      window.removeEventListener("touchmove",   onTouchMove);
      window.removeEventListener("touchend",    onTouchEnd);
      window.removeEventListener("touchcancel", onCancel);
    };
  }, [ref]);
}

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
          background: "rgba(10, 8, 6, 0.97)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      >
        {navItems.map(({ to, label, Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          const sw = active ? 2.2 : 1.8;

          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center transition-all"
              style={{
                color: active ? "#C4873A" : "rgba(255,255,255,0.58)",
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

function LogoPill() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: 999,
        background: "rgba(8,5,1,0.55)",
        border: "1px solid rgba(201,168,76,0.28)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 0 14px rgba(201,168,76,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.30em",
          textTransform: "uppercase" as const,
          color: "#C4873A",
          textShadow: "0 0 12px rgba(196,135,58,0.50)",
        }}
      >
        STOPAMINE
      </span>
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const path       = useRouterState({ select: (r) => r.location.pathname });
  const onSettings = path === "/settings";
  const onHome     = path === "/";
  const onTree     = path === "/tree";

  // Elastic bounce — only applied to the content div, not fixed chrome
  const elasticRef = useRef<HTMLDivElement>(null);
  useElasticBounce(elasticRef);

  return (
    <div className="min-h-screen pb-32 mx-auto max-w-md">
      <PremiumBackground hideWaves={path === "/" || path === "/tools"} />

      {/* ── Fixed chrome — outside elastic wrapper so it never bounces ── */}
      {onHome && (
        <div className="fixed left-4 z-30" style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
          <LogoPill />
        </div>
      )}
      {!onSettings && (
        <div className="fixed right-4 z-30 flex items-center gap-2" style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
          {onTree && <CreditsChip />}
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
      <BottomNav />

      {/* ── Elastic content wrapper — only this moves on overscroll ── */}
      <div ref={elasticRef} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

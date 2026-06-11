import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const GAME_ROUTES = [
  "/tools/echochamber",
  "/tools/clarityclimb",
  "/tools/coldswitch",
  "/tools/steadyhand",
  "/tools/nebulaflow",
  "/tools/tap",
  "/tools/noisefilter",
  "/tools/voidstare",
  "/tools/darkroom",
  "/tools/memory",
  "/tools/identitystack",
];

// Main tabs and auth screens — no back navigation from these
const NO_BACK_ROUTES = ["/", "/tree", "/community", "/progress", "/tools", "/auth", "/paywall", "/onboarding"];

// Pages with their OWN animated swipe-dismiss (usePageSwipeDismiss) — the
// global edge handler must skip them or a single swipe navigates back twice.
const ANIMATED_SWIPE_ROUTES = ["/settings", "/tools/coach", "/games", "/privacy", "/terms"];

function isGameRoute(pathname: string): boolean {
  return GAME_ROUTES.some((r) => pathname.startsWith(r));
}

// Shared back logic — game routes go to /tools, everything else goes history.back()
function navigateBack() {
  const pathname = window.location.pathname;
  if (isGameRoute(pathname)) {
    window.history.replaceState(null, "", "/tools");
    window.dispatchEvent(new PopStateEvent("popstate"));
  } else {
    window.history.back();
  }
}

export function useCapacitorBack(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // ── Android physical back button ──────────────────────────────────────────
    let handle: { remove: () => void } | undefined;

    (async () => {
      try {
        // Bundled normally (installed dep) — externalizing it left a bare
        // specifier the webview couldn't resolve, so this listener never loaded.
        const { App } = await import("@capacitor/app");
        handle = await App.addListener(
          "backButton",
          ({ canGoBack }: { canGoBack: boolean }) => {
            const pathname = window.location.pathname;
            if (NO_BACK_ROUTES.includes(pathname)) {
              if (!canGoBack) App.exitApp();
              return;
            }
            navigateBack();
          },
        );
      } catch {
        // Not available on this platform
      }
    })();

    // ── iOS left-edge swipe back gesture ─────────────────────────────────────
    // Finger-tracked: a gold progress glow grows from the left edge while you
    // drag and a haptic tick fires at the trigger point — the old version
    // jumped back with zero feedback, which read as a bug rather than a gesture.
    const EDGE_SIZE = 28;     // px from left edge to begin tracking
    const MIN_DISTANCE = 80;  // minimum horizontal travel to trigger
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let glow: HTMLDivElement | null = null;
    let ticked = false;

    const skip = () => {
      const pathname = window.location.pathname;
      return NO_BACK_ROUTES.includes(pathname) ||
        ANIMATED_SWIPE_ROUTES.some((r) => pathname.startsWith(r));
    };

    const ensureGlow = () => {
      if (glow) return glow;
      glow = document.createElement("div");
      Object.assign(glow.style, {
        position: "fixed", top: "0", bottom: "0", left: "0", width: "4px",
        background: "linear-gradient(to right, rgba(201,168,76,0.55), rgba(201,168,76,0))",
        opacity: "0", pointerEvents: "none", zIndex: "9999",
        transition: "none",
      } as CSSStyleDeclaration);
      document.body.appendChild(glow);
      return glow;
    };
    const hideGlow = () => {
      if (!glow) return;
      glow.style.transition = "opacity 0.25s ease, width 0.25s ease";
      glow.style.opacity = "0";
      glow.style.width = "4px";
    };

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = startX <= EDGE_SIZE && !skip();
      ticked = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx <= 0 || dy > dx * 0.65) { hideGlow(); return; }
      const g = ensureGlow();
      const progress = Math.min(1, dx / MIN_DISTANCE);
      g.style.transition = "none";
      g.style.opacity = String(0.25 + progress * 0.75);
      g.style.width = `${4 + progress * 26}px`;
      if (progress >= 1 && !ticked) {
        ticked = true;
        import("@/lib/haptics").then((m) => m.hapticLight()); // trigger point reached
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      hideGlow();

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);

      // Must be: rightward, far enough, more horizontal than vertical
      if (deltaX < MIN_DISTANCE || deltaY > deltaX * 0.65) return;
      if (skip()) return;

      navigateBack();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      handle?.remove();
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      glow?.remove();
    };
  }, []);
}

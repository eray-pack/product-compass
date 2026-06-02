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
const NO_BACK_ROUTES = ["/", "/tree", "/community", "/progress", "/tools", "/auth", "/paywall"];

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
        // @ts-ignore — @capacitor/app is a native-only peer dep, marked external in vite.config.ts
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
    // Detects a right swipe starting within EDGE_SIZE px of the left edge
    const EDGE_SIZE = 28;     // px from left edge to begin tracking
    const MIN_DISTANCE = 80;  // minimum horizontal travel to trigger
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      // Only track if finger starts from the left edge
      tracking = startX <= EDGE_SIZE;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);

      // Must be: rightward, far enough, more horizontal than vertical
      if (deltaX < MIN_DISTANCE || deltaY > deltaX * 0.65) return;

      const pathname = window.location.pathname;
      if (NO_BACK_ROUTES.includes(pathname)) return;

      navigateBack();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      handle?.remove();
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
}

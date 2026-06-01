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

function isGameRoute(pathname: string): boolean {
  return GAME_ROUTES.some((r) => pathname.startsWith(r));
}

export function useCapacitorBack(): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handle: { remove: () => void } | undefined;

    (async () => {
      try {
        // @ts-ignore — @capacitor/app is a native-only peer dep, marked external in vite.config.ts
        const { App } = await import("@capacitor/app");
        handle = await App.addListener(
          "backButton",
          ({ canGoBack }: { canGoBack: boolean }) => {
            if (isGameRoute(window.location.pathname)) {
              window.history.replaceState(null, "", "/tools");
              window.dispatchEvent(new PopStateEvent("popstate"));
              return;
            }
            if (canGoBack) {
              window.history.back();
            } else {
              App.exitApp();
            }
          },
        );
      } catch {
        // Not available on this platform
      }
    })();

    return () => {
      handle?.remove();
    };
  }, []);
}

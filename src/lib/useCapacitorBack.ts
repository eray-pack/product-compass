import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

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

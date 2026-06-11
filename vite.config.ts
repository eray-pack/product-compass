// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// NOTE: the ANTHROPIC_API_KEY is intentionally NOT baked into the bundle.
// It only exists as a Cloudflare Worker env binding, read at runtime in
// src/server.ts — baking it via define both broke the reframe feature
// (empty string in CI builds) and risked exposing the key to client code.

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    envPrefix: ["VITE_"],
    optimizeDeps: {
      exclude: [
        "@revenuecat/purchases-capacitor",
        "@capacitor-community/apple-sign-in",
        "@capacitor-community/in-app-review",
        "@capacitor/push-notifications",
      ],
    },
    build: {
      rollupOptions: {
        // push-notifications is NOT installed (dead code references only) so it
        // must stay external. Installed Capacitor plugins (@capacitor/app,
        // apple-sign-in, purchases) are bundled normally — externalizing them
        // left bare import specifiers the webview can't resolve at runtime.
        external: ["@capacitor/push-notifications"],
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-motion": ["framer-motion"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-i18n": ["i18next", "react-i18next"],
            "vendor-icons": ["lucide-react"],
          },
        },
      },
    },
  },
});

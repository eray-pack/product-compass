// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// loadEnv reads .env from the project root at config time (Node.js context).
// The '' prefix means load all vars, not just VITE_* ones.
const localEnv = loadEnv("", process.cwd(), "");

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    envPrefix: ["VITE_", "ANTHROPIC_"],
    define: {
      "process.env.ANTHROPIC_API_KEY": JSON.stringify(
        localEnv.ANTHROPIC_API_KEY ?? "",
      ),
    },
    build: {
      rollupOptions: {
        // Native Capacitor plugins only run on device — exclude from web bundle
        external: ["@capacitor/push-notifications"],
      },
    },
  },
});

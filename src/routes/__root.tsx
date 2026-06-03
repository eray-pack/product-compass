import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCapacitorBack } from "@/lib/useCapacitorBack";

import appCss from "../styles.css?url";
import "@/lib/i18n"; // initialise i18next before any route renders
import { PaywallModal } from "@/components/PaywallModal";
import { BrainLoadingScreen } from "@/components/BrainLoadingScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#0D0A08", color: "#f5ede0" }}>
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-4" style={{ color: "rgba(255,255,255,0.50)" }}>This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium" style={{ background: "#C9A84C", color: "#1F1408" }}>
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#0D0A08", color: "#f5ede0" }}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: "#C9A84C", color: "#1F1408" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" },
      { name: "theme-color", content: "#0b1220" },
      { title: "Stopamine — Rewire your dopamine system" },
      { name: "description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { property: "og:title", content: "Stopamine — Rewire your dopamine system" },
      { name: "twitter:title", content: "Stopamine — Rewire your dopamine system" },
      { property: "og:description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { name: "twitter:description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { property: "og:image", content: "https://stopamineapp.com/og-image.png" },
      { name: "twitter:image", content: "https://stopamineapp.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark", background: "#000000" }}>
      <head>
        {/* Always force dark — runs synchronously before paint, before any CSS loads */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.className='dark';document.documentElement.style.background='#000000';document.documentElement.style.colorScheme='dark';` }} />
        <HeadContent />
      </head>
      <body style={{ background: "transparent", color: "#f5ede0", colorScheme: "dark" }}>{children}<Scripts /></body>
    </html>
  );
}

// Show splash only on the first page load per session
const SPLASH_KEY = "_stopamine_splash";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(false);
  useCapacitorBack();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(SPLASH_KEY)) {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setShowSplash(true);
    }
  }, []);

  // Auth guard — redirect to /auth if not signed in
  // Exclude public routes: /auth, /privacy, /terms (must be readable without an account)
  const PUBLIC_PATHS = ["/auth", "/privacy", "/terms"];
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (PUBLIC_PATHS.some((p) => currentPath.startsWith(p))) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate({ to: "/auth" });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p))) {
        navigate({ to: "/auth" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash && <BrainLoadingScreen onDone={handleSplashDone} />}
      <Outlet />
      <PaywallModal />
    </QueryClientProvider>
  );
}

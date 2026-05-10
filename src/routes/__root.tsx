import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { PaywallModal } from "@/components/PaywallModal";
import { BrainLoadingScreen } from "@/components/BrainLoadingScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0b1220" },
      { title: "Stopamine — Rewire your dopamine system" },
      { name: "description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { property: "og:title", content: "Stopamine — Rewire your dopamine system" },
      { name: "twitter:title", content: "Stopamine — Rewire your dopamine system" },
      { property: "og:description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { name: "twitter:description", content: "A psychological recovery app to help you overcome porn addiction and rebalance your dopamine system." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f5ceca44-7485-474c-8590-a471d11dc27f/id-preview-e4ff1051--2b1d2383-13c7-42ad-91a5-813e9ed1d7fc.lovable.app-1778367128277.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f5ceca44-7485-474c-8590-a471d11dc27f/id-preview-e4ff1051--2b1d2383-13c7-42ad-91a5-813e9ed1d7fc.lovable.app-1778367128277.png" },
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
    <html lang="en" className="dark">
      <head>
        {/* Runs synchronously before paint — prevents theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('stopamine.theme')||'dark';document.documentElement.className=t;}catch(e){}})();` }} />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">{children}<Scripts /></body>
    </html>
  );
}

// Show splash only on the first page load per session
const SPLASH_KEY = "_stopamine_splash";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Start hidden so SSR HTML matches; reveal after client check
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem(SPLASH_KEY)) {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setShowSplash(true);
    }
  }, []);

  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      {showSplash && <BrainLoadingScreen onDone={handleSplashDone} />}
      <Outlet />
      <PaywallModal />
    </QueryClientProvider>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

async function needsOnboarding(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_state")
    .select("onboarding")
    .eq("user_id", userId)
    .single();
  return !data?.onboarding;
}

const INPUT_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didNavigate = useRef(false);

  // Handles OAuth redirect — Supabase fires SIGNED_IN after returning from provider
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user && !didNavigate.current) {
        didNavigate.current = true;
        const isNew = await needsOnboarding(session.user.id);
        navigate({ to: isNew ? "/onboarding" : "/" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleOAuth = async (provider: "apple" | "google" | "azure") => {
    setOauthLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    didNavigate.current = true; // prevent onAuthStateChange double-nav

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); didNavigate.current = false; setLoading(false); return; }
      navigate({ to: "/onboarding" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); didNavigate.current = false; setLoading(false); return; }
      navigate({ to: "/" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 neural-mesh-fine" style={{ background: "#0D0A08" }}>
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground">Stopamine</p>
          <h1 className="text-3xl font-bold day-monument" style={{ color: "var(--foreground)" }}>
            {mode === "login" ? "Welcome back." : "Start your journey."}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Every day you came back counts." : "Your brain is ready to rewire."}
          </p>
        </div>

        {/* Social sign-in */}
        <div className="space-y-3">
          <SocialButton
            onClick={() => handleOAuth("apple")}
            disabled={!!oauthLoading}
            loading={oauthLoading === "apple"}
            icon={<AppleIcon />}
            label="Continue with Apple"
          />
          <SocialButton
            onClick={() => handleOAuth("google")}
            disabled={!!oauthLoading}
            loading={oauthLoading === "google"}
            icon={<GoogleIcon />}
            label="Continue with Google"
          />
          <SocialButton
            onClick={() => handleOAuth("azure")}
            disabled={!!oauthLoading}
            loading={oauthLoading === "azure"}
            icon={<MicrosoftIcon />}
            label="Continue with Microsoft"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground">or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Email / password */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all"
              style={INPUT_STYLE}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all"
              style={INPUT_STYLE}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "No account yet? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="font-semibold"
            style={{ color: "var(--primary)" }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Social button ──────────────────────────────────────────────────────────────

function SocialButton({
  onClick, disabled, loading, icon, label,
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-opacity disabled:opacity-50"
      style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
    >
      {loading ? <span className="opacity-50">...</span> : <>{icon}{label}</>}
    </button>
  );
}

// ── Provider icons ─────────────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.9-155.5-127.4C46 637.5 0 542.5 0 450.4c0-165.1 107.3-252.4 212.7-252.4 56.2 0 103.7 37.8 138.5 37.8 33.4 0 85.5-40.1 149.3-40.1 24 0 108.2 2.6 168.6 81.5zm-226.1-175.1c30.4-36 51.9-86.1 51.9-136.2 0-6.5-.6-13-.6-19.5-49.3 1.9-108.2 32.9-144.6 74.4-27.8 31.7-51.9 81.8-51.9 132.5 0 6.5 1.3 13 1.3 15.1 3.2.6 8.4 1.3 13.6 1.3 44.1 0 98.8-29.8 130.3-67.6z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const notifs = [
  { key: "daily", title: "Daily commitment reminder", sub: "08:00 — your chosen time" },
  { key: "urge", title: "Urge warning", sub: "At your identified trigger times" },
  { key: "milestone", title: "Streak milestone alerts", sub: "Day 7, 14, 30, 60, 90" },
  { key: "weekly", title: "Weekly brain update", sub: "Science fact about recovery" },
  { key: "reframe", title: "Random reframes", sub: "Variable schedule — 2-4×/week" },
];

function Settings() {
  const [state, update] = useAppState();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    daily: true, urge: true, milestone: true, weekly: false, reframe: true,
  });

  const reset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stopamine.v1");
      navigate({ to: "/onboarding" });
    }
  };

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-3xl font-bold">Your setup.</h1>
      </header>

      {state.onboarding && (
        <section className="px-6 mt-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Signed in as</p>
            <p className="mt-1 text-lg font-semibold">{state.onboarding.name || "—"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              "I am becoming someone who <span className="text-primary">{state.onboarding.identity}</span>."
            </p>
          </div>
        </section>
      )}

      <section className="px-6 mt-6">
        <p className="text-sm font-semibold mb-3">Smart notifications</p>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {notifs.map((n) => (
            <label key={n.key} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.sub}</p>
              </div>
              <Toggle
                value={enabled[n.key]}
                onChange={(v) => setEnabled((s) => ({ ...s, [n.key]: v }))}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="px-6 mt-6">
        <button
          onClick={reset}
          className="w-full text-sm text-destructive py-3 rounded-xl border border-destructive/30"
        >
          Reset onboarding (demo)
        </button>
      </section>
    </PageShell>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`h-6 w-11 rounded-full p-0.5 transition ${value ? "bg-primary" : "bg-secondary"}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

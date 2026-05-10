import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, activeAddiction, dayCount } from "@/lib/store";
import { Crown, Plus } from "lucide-react";
import { triggerPaywall } from "@/lib/paywall";
import { AddAddictionModal } from "@/components/AddAddictionModal";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const notifs = [
  { key: "daily",     title: "Daily commitment reminder", sub: "08:00 — your chosen time" },
  { key: "urge",      title: "Urge warning",              sub: "At your identified trigger times" },
  { key: "milestone", title: "Streak milestone alerts",   sub: "Day 7, 14, 30, 60, 90" },
  { key: "weekly",    title: "Weekly brain update",       sub: "Science fact about recovery" },
  { key: "reframe",   title: "Random reframes",           sub: "Variable schedule — 2-4×/week" },
];

function Settings() {
  const [state, update] = useAppState();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    daily: true, urge: true, milestone: true, weekly: false, reframe: true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const active = activeAddiction(state);

  const reset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stopamine.v1");
      localStorage.removeItem("stopamine.v2");
      navigate({ to: "/onboarding" });
    }
  };

  const initials = state.onboarding?.name
    ? state.onboarding.name.slice(0, 2).toUpperCase()
    : "—";

  return (
    <PageShell>
      {/* ── Profile header ───────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">You</p>
      </header>

      {state.onboarding ? (
        <section className="px-6 mt-4">
          <div
            className="rounded-2xl border border-border/60 p-5 flex items-center gap-4"
            style={{ background: "var(--gradient-surface)" }}
          >
            {/* Avatar */}
            <div
              className="h-14 w-14 rounded-2xl grid place-items-center text-xl font-bold text-white shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">
                {state.onboarding.name || "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                "I am becoming someone who{" "}
                <span style={{ color: "var(--primary)" }}>{state.onboarding.identity}</span>."
              </p>
            </div>
          </div>

          {/* PRO badge / upgrade */}
          {state.isPremium ? (
            <div
              className="mt-3 rounded-2xl border border-primary/30 p-3 flex items-center gap-3"
              style={{ background: "oklch(0.62 0.22 255 / 0.07)" }}
            >
              <Crown className="h-5 w-5 shrink-0" style={{ color: "var(--primary)" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>PRO member</p>
                <p className="text-xs text-muted-foreground">All features unlocked</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => triggerPaywall()}
              className="mt-3 w-full rounded-2xl border border-primary/30 p-3 flex items-center gap-3 text-left"
              style={{ background: "oklch(0.62 0.22 255 / 0.07)" }}
            >
              <Crown className="h-5 w-5 shrink-0" style={{ color: "var(--primary)" }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Upgrade to PRO</p>
                <p className="text-xs text-muted-foreground">Unlock full brain recovery analytics</p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                style={{ background: "var(--gradient-primary)", color: "white" }}
              >
                83% OFF
              </span>
            </button>
          )}
        </section>
      ) : null}

      {/* ── Notifications ────────────────────────────────────── */}
      <section className="px-6 mt-6">
        <p className="text-sm font-semibold mb-3">Smart notifications</p>
        <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/40">
          {notifs.map((n) => (
            <label key={n.key} className="flex items-center gap-3 p-4 cursor-pointer">
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

      {/* ── Tracked habits ───────────────────────────────────── */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Tracked habits</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-colors"
            style={{
              color: "var(--primary)",
              borderColor: "oklch(0.62 0.22 255 / 0.35)",
              background: "oklch(0.62 0.22 255 / 0.08)",
            }}
          >
            <Plus className="h-3 w-3" /> Add habit
          </button>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/40">
          {state.addictions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No habits tracked yet.</p>
          ) : (
            state.addictions.map((a) => {
              const day = dayCount(a.startDate);
              const isActive = a.id === state.activeAddictionId || (!state.activeAddictionId && a === state.addictions[0]);
              return (
                <button
                  key={a.id}
                  onClick={() => update({ activeAddictionId: a.id })}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-2xl leading-none">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Day {day}</p>
                  </div>
                  {isActive && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "oklch(0.62 0.22 255 / 0.15)", color: "var(--primary)" }}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* ── Danger zone ──────────────────────────────────────── */}
      <section className="px-6 mt-6 pb-4">
        <button
          onClick={reset}
          className="w-full text-sm font-semibold py-3 rounded-2xl border border-destructive/30 text-destructive transition-colors hover:bg-destructive/5"
        >
          Reset onboarding (demo)
        </button>
      </section>
      {showAddModal && <AddAddictionModal onClose={() => setShowAddModal(false)} />}
    </PageShell>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="h-6 w-11 rounded-full p-0.5 transition-colors shrink-0"
      style={{ background: value ? "var(--primary)" : "oklch(0.22 0.03 265)" }}
    >
      <span
        className="block h-5 w-5 rounded-full bg-white transition-transform shadow-sm"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

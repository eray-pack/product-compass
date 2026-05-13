import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { useAppState, NotificationStyle, NotificationApp, type Addiction } from "@/lib/store";
import { CompanionStage, COMPANION_LABELS, type CompanionType } from "@/components/avatars/CompanionAvatar";
import { WolfSittingPreview } from "@/components/avatars/WolfStages";

const HABIT_MAP: Record<string, { name: string; emoji: string }> = {
  "Social media doomscrolling": { name: "Social media", emoji: "📱" },
  "Sugar / junk food": { name: "Sugar", emoji: "🍩" },
  "Alcohol": { name: "Alcohol", emoji: "🍺" },
  "Nicotine / vaping": { name: "Nicotine", emoji: "🚬" },
  "Cannabis": { name: "Cannabis", emoji: "🌿" },
  "Online gambling / betting": { name: "Gambling", emoji: "🎰" },
  "Video game binges": { name: "Gaming", emoji: "🎮" },
  "Procrastination": { name: "Procrastination", emoji: "⏳" },
};

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const identityOptions = [
  "is in full control of his mind",
  "no longer needs external validation",
  "chooses discomfort over instant gratification",
  "is someone his future self is proud of",
  "shows up with discipline, not mood",
];

const durations = ["Less than 6 months", "1-2 years", "3-5 years", "More than 5 years"];
const costs = ["Relationships", "Focus & work", "Self-confidence", "Sleep", "Social life", "Mental health"];
const triggers = ["Late at night", "When bored", "When stressed", "When alone", "After rejection"];
const otherHabitOptions = [
  "Social media doomscrolling",
  "Sugar / junk food",
  "Alcohol",
  "Nicotine / vaping",
  "Cannabis",
  "Online gambling / betting",
  "Video game binges",
  "Procrastination",
];

function Onboarding() {
  const [, update] = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState("");
  const [pickedCosts, setPickedCosts] = useState<string[]>([]);
  const [pickedTriggers, setPickedTriggers] = useState<string[]>([]);
  const [pickedHabits, setPickedHabits] = useState<string[]>([]);
  const [notifStyles, setNotifStyles] = useState<NotificationStyle[]>([]);
  const [notifApps, setNotifApps] = useState<NotificationApp[]>([]);
  const [identity, setIdentity] = useState("");
  const [customIdentitySelected, setCustomIdentitySelected] = useState(false);
  const [name, setName] = useState("");
  const [companion, setCompanion] = useState<CompanionType | null>(null);

  const next = () => setStep((s) => s + 1);
  const finish = () => {
    const now = Date.now();
    const mainAddiction: Addiction = {
      id: "porn",
      name: "Porn",
      emoji: "🧠",
      startDate: now,
      totalCleanDays: 0,
      urgesSurvived: 0,
    };
    const extraAddictions: Addiction[] = pickedHabits.map((h) => {
      const preset = HABIT_MAP[h] ?? { name: h, emoji: "🔒" };
      return {
        id: preset.name.toLowerCase().replace(/\s+/g, "-"),
        name: preset.name,
        emoji: preset.emoji,
        startDate: now,
        totalCleanDays: 0,
        urgesSurvived: 0,
        premium: true,
      };
    });
    update({
      companion: companion ?? "tree",
      onboarding: {
        duration,
        costs: pickedCosts,
        triggers: pickedTriggers,
        identity,
        name,
        otherHabits: pickedHabits,
        completedAt: now,
      },
      notificationStyles: notifStyles,
      notificationApps: notifApps,
      addictions: [mainAddiction, ...extraAddictions],
      activeAddictionId: mainAddiction.id,
    });
    navigate({ to: "/paywall" });
  };

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const TOTAL = 8;

  return (
    <div className="min-h-screen mx-auto max-w-md flex flex-col">
      <div className="px-6 pt-10">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all"
              style={{ background: i <= step ? "var(--primary)" : "oklch(0.22 0.03 265)" }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col">
        {step === 0 && (
          <Step eyebrow={`Step 1 of ${TOTAL}`} title="Before we start — be honest with yourself"
            subtitle="How long have you been struggling with this?"
            cta={duration ? "Continue" : ""} onContinue={next}>
            <div className="space-y-3">
              {durations.map((d) => (
                <Option key={d} selected={duration === d} onClick={() => setDuration(d)}>{d}</Option>
              ))}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step eyebrow={`Step 2 of ${TOTAL}`} title="What does it cost you?"
            subtitle="Select everything this has taken from you."
            cta={pickedCosts.length ? "These are the things I'm taking back" : ""} onContinue={next}>
            <div className="space-y-3">
              {costs.map((c) => (
                <CheckOption key={c} selected={pickedCosts.includes(c)} onClick={() => toggle(pickedCosts, c, setPickedCosts)}>{c}</CheckOption>
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step eyebrow={`Step 3 of ${TOTAL}`} title="Your trigger profile"
            subtitle="When are you most vulnerable? We'll use this for smart reminders."
            cta={pickedTriggers.length ? "Continue" : ""} onContinue={next}>
            <div className="space-y-3">
              {triggers.map((t) => (
                <CheckOption key={t} selected={pickedTriggers.includes(t)} onClick={() => toggle(pickedTriggers, t, setPickedTriggers)}>{t}</CheckOption>
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step eyebrow={`Step 4 of ${TOTAL}`} title="How do you like to be reminded?"
            subtitle="We'll show up for you in the way that actually works for you — not like a pushy app."
            cta="Continue" onContinue={next}>
            <div className="space-y-3 mb-6">
              {([
                { id: "conversational", label: "A short message, like a text from a friend" },
                { id: "curiosity", label: "A fact or insight that surprises me" },
                { id: "question", label: "A question that makes me think" },
                { id: "quiet", label: "A quiet nudge — nothing intense" },
              ] as { id: NotificationStyle; label: string }[]).map(({ id, label }) => (
                <CheckOption key={id}
                  selected={notifStyles.includes(id)}
                  onClick={() => setNotifStyles(notifStyles.includes(id) ? notifStyles.filter(x => x !== id) : [...notifStyles, id])}>
                  {label}
                </CheckOption>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-3">Which apps do you actually open when they notify you?</p>
            <div className="space-y-3">
              {([
                { id: "messaging", label: "iMessage / WhatsApp" },
                { id: "instagram", label: "Instagram" },
                { id: "email", label: "Email" },
                { id: "rarely", label: "I rarely open notifications" },
              ] as { id: NotificationApp; label: string }[]).map(({ id, label }) => (
                <CheckOption key={id}
                  selected={notifApps.includes(id)}
                  onClick={() => setNotifApps(notifApps.includes(id) ? notifApps.filter(x => x !== id) : [...notifApps, id])}>
                  {label}
                </CheckOption>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">We use this to reach you in a way that feels natural. You're in control — change it anytime.</p>
          </Step>
        )}

        {step === 4 && (
          <Step eyebrow={`Step 5 of ${TOTAL}`} title="Anything else you want to quit?"
            subtitle="With PRO you can track multiple addictions side-by-side. Pick any you'd like to add later — you can skip and add them anytime."
            cta="Continue"
            onContinue={next}>
            <div className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full">
              <Lock className="h-3 w-3" /> Unlocked with PRO
            </div>
            <div className="space-y-3">
              {otherHabitOptions.map((h) => (
                <CheckOption key={h} selected={pickedHabits.includes(h)} onClick={() => toggle(pickedHabits, h, setPickedHabits)}>{h}</CheckOption>
              ))}
            </div>
          </Step>
        )}

        {step === 5 && (
          <div className="flex-1 flex flex-col animate-step-in">
            {/* Blue label */}
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-primary">
              IDENTITY · 04
            </p>

            {/* Heading */}
            <h1 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight">
              Choose who you<br />are becoming.
            </h1>

            {/* Radio options */}
            <div className="mt-8 flex-1 space-y-3">
              {identityOptions.map((option) => (
                <IdentityRadio
                  key={option}
                  selected={identity === option && !customIdentitySelected}
                  onClick={() => {
                    setIdentity(option);
                    setCustomIdentitySelected(false);
                  }}
                >
                  {option}
                </IdentityRadio>
              ))}

              {/* Write your own */}
              {customIdentitySelected ? (
                <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-primary bg-primary/10 transition-all">
                  <span className="h-5 w-5 rounded-full border-2 border-primary flex-shrink-0 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <input
                    autoFocus
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder="e.g. is in full control of his mind"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCustomIdentitySelected(true);
                    setIdentity("");
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all"
                >
                  <span className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Write your own...</span>
                </button>
              )}
            </div>

            {/* CTA */}
            <button
              disabled={!identity.trim()}
              onClick={next}
              className="mt-8 h-14 w-full rounded-2xl text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              style={{ background: identity.trim() ? "var(--gradient-primary)" : "oklch(0.22 0.03 265)" }}
            >
              {identity.trim() ? "This is who I'm becoming" : "Pick an option"}
              {identity.trim() && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        {step === 6 && (
          <div className="flex-1 flex flex-col animate-step-in">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: "var(--primary)" }}>
              COMPANION · Step 7 of {TOTAL}
            </p>
            <h1 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight">
              Choose your<br />recovery companion.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              They grow alongside you — day by day, stage by stage. This is what you're working toward.
            </p>

            {/* Two companion cards */}
            <div className="mt-8 flex gap-4 flex-1">
              {(["tree", "wolf"] as CompanionType[]).map((type) => {
                const { name, tagline } = COMPANION_LABELS[type];
                const selected = companion === type;
                return (
                  <button
                    key={type}
                    onClick={() => setCompanion(type)}
                    className="flex-1 flex flex-col items-center rounded-2xl border-2 transition-all overflow-hidden pb-4"
                    style={{
                      borderColor: selected ? "var(--primary)" : "var(--border)",
                      background: selected ? "var(--primary)" + "12" : "var(--card)",
                    }}
                  >
                    {/* Final-stage preview */}
                    <div className="w-full flex items-end justify-center pt-2 px-2" style={{ height: "160px" }}>
                      {type === "wolf"
                        ? <WolfSittingPreview className="w-full h-full" />
                        : <CompanionStage type="tree" stage={5} className="w-full h-full" />
                      }
                    </div>
                    {/* Selection indicator dot */}
                    <span
                      className="mt-2 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: selected ? "var(--primary)" : "var(--border)",
                        background: selected ? "var(--primary)" : "transparent",
                      }}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <p className="mt-1.5 text-xs font-bold" style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}>
                      {name}
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground text-center px-2 leading-tight">
                      {tagline}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!companion}
              onClick={next}
              className="mt-8 h-14 w-full rounded-2xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              style={{
                background: companion ? "var(--gradient-primary)" : "var(--muted)",
                color: companion ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {companion ? `${COMPANION_LABELS[companion].name} — let's go` : "Choose your companion"}
              {companion && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}

        {step === 7 && (
          <Step eyebrow={`Step 8 of ${TOTAL}`} title="Your commitment"
            subtitle="Read it. Sign it. This is who you are now."
            cta={name.trim() ? "I commit to this" : ""} onContinue={finish}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Identity</p>
              <p className="mt-2 text-xl leading-snug">
                I am becoming someone who <span className="text-primary">{identity || "…"}</span>.
              </p>
            </div>
            <label className="block text-sm text-muted-foreground mt-6 mb-2">Sign with your first name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </Step>
        )}
      </div>
    </div>
  );
}

function Step({ eyebrow, title, subtitle, children, cta, onContinue }: {
  eyebrow: string; title: string; subtitle?: string;
  children: React.ReactNode; cta: string; onContinue: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col animate-step-in">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
      <div className="mt-8 flex-1">{children}</div>
      <button
        disabled={!cta}
        onClick={onContinue}
        className="mt-8 h-14 w-full rounded-2xl text-primary-foreground font-bold inline-flex items-center justify-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        style={{ background: cta ? "var(--gradient-primary)" : "oklch(0.22 0.03 265)" }}
      >
        {cta || "Pick an option"}
        {cta && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all font-medium text-sm"
      style={{
        borderColor: selected ? "var(--primary)" : "oklch(0.22 0.03 265)",
        background: selected ? "oklch(0.62 0.22 255 / 0.10)" : "var(--card)",
        color: selected ? "var(--foreground)" : "var(--muted-foreground)",
      }}
    >
      {children}
    </button>
  );
}

function IdentityRadio({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {/* Radio indicator */}
      <span
        className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-primary" : "border-muted-foreground"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className={`text-sm leading-snug ${selected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        I am someone who <span className={selected ? "text-primary" : ""}>{children}</span>
      </span>
    </button>
  );
}

function CheckOption({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-sm"
      style={{
        borderColor: selected ? "var(--primary)" : "oklch(0.22 0.03 265)",
        background: selected ? "oklch(0.62 0.22 255 / 0.10)" : "var(--card)",
      }}
    >
      <span
        className="h-5 w-5 rounded-md grid place-items-center border-2 shrink-0 transition-all"
        style={{
          background: selected ? "var(--primary)" : "transparent",
          borderColor: selected ? "var(--primary)" : "oklch(0.30 0.025 265)",
        }}
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span
        className="text-left font-medium"
        style={{ color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}
      >
        {children}
      </span>
    </button>
  );
}

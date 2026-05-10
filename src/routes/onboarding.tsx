import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { useAppState, NotificationStyle, NotificationApp, type Addiction } from "@/lib/store";

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
  const [name, setName] = useState("");

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

  const TOTAL = 7;

  return (
    <div className="min-h-screen mx-auto max-w-md flex flex-col">
      <div className="px-6 pt-10">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
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
          <Step eyebrow={`Step 6 of ${TOTAL}`} title="Identity statement"
            subtitle="This becomes your personal mantra, shown to you every day."
            cta={identity.trim() ? "Continue" : ""} onContinue={next}>
            <label className="block text-sm text-muted-foreground mb-3">I am becoming someone who…</label>
            <textarea value={identity} onChange={(e) => setIdentity(e.target.value)}
              placeholder="e.g. is in full control of his mind" rows={4}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg leading-snug focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </Step>
        )}

        {step === 6 && (
          <Step eyebrow={`Step 7 of ${TOTAL}`} title="Your commitment"
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
    <div className="flex-1 flex flex-col">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold leading-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 flex-1">{children}</div>
      <button disabled={!cta} onClick={onContinue}
        className="mt-8 h-14 w-full rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition">
        {cta || "Pick an option"}
        {cta && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Option({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border transition ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function CheckOption({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border transition ${selected ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
      <span className={`h-5 w-5 rounded-md grid place-items-center border ${selected ? "bg-primary border-primary" : "border-border"}`}>
        {selected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
      </span>
      <span className={selected ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </button>
  );
}

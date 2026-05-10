/* global React, Eyebrow, PrimaryButton, IconArrow, IconBack, IconCheck, IconLock */
const { useState } = React;

const STEPS_TOTAL = 7;

const DURATIONS = ["Less than 6 months", "1-2 years", "3-5 years", "More than 5 years"];
const COSTS = ["Relationships", "Focus & work", "Self-confidence", "Sleep", "Social life", "Mental health"];
const TRIGGERS = ["Late at night", "When bored", "When stressed", "When alone", "After rejection"];
const HABITS = ["Social media doomscrolling","Sugar / junk food","Alcohol","Nicotine / vaping","Cannabis","Online gambling / betting","Video game binges","Procrastination"];
const IDENTITIES = [
  "is in full control of his mind",
  "no longer needs external validation",
  "chooses discomfort over instant gratification",
  "is someone his future self is proud of",
  "shows up with discipline, not mood",
];

function StepProgress({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "32px 24px 0" }}>
      {Array.from({ length: STEPS_TOTAL }).map((_, i) => (
        <div key={i} style={{ height: 4, flex: 1, borderRadius: 9999, background: i <= step ? "var(--primary)" : "oklch(0.22 0.03 265)" }} />
      ))}
    </div>
  );
}

function Option({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "14px 20px", borderRadius: 16,
      border: `2px solid ${selected ? "var(--primary)" : "oklch(0.22 0.03 265)"}`,
      background: selected ? "oklch(0.62 0.22 255 / 0.10)" : "var(--card)",
      color: selected ? "var(--foreground)" : "var(--muted-foreground)",
      fontWeight: 500, fontSize: 14, fontFamily: "inherit", cursor: "pointer", transition: "all 200ms",
    }}>{children}</button>
  );
}

function CheckOption({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 16,
      border: `2px solid ${selected ? "var(--primary)" : "oklch(0.22 0.03 265)"}`,
      background: selected ? "oklch(0.62 0.22 255 / 0.10)" : "var(--card)",
      fontFamily: "inherit", cursor: "pointer", transition: "all 200ms",
    }}>
      <span style={{
        height: 20, width: 20, borderRadius: 6, display: "grid", placeItems: "center",
        border: `2px solid ${selected ? "var(--primary)" : "oklch(0.30 0.025 265)"}`,
        background: selected ? "var(--primary)" : "transparent", flexShrink: 0,
      }}>{selected && <IconCheck size={12} sw={2.5} style={{ color: "white" }} />}</span>
      <span style={{ textAlign: "left", fontWeight: 500, fontSize: 14, color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}>{children}</span>
    </button>
  );
}

function IdentityRadio({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderRadius: 16,
      border: `2px solid ${selected ? "var(--primary)" : "oklch(0.22 0.03 265)"}`,
      background: selected ? "oklch(0.62 0.22 255 / 0.10)" : "var(--card)",
      textAlign: "left", fontFamily: "inherit", cursor: "pointer", transition: "all 200ms",
    }}>
      <span style={{
        height: 20, width: 20, borderRadius: 9999, flexShrink: 0,
        border: `2px solid ${selected ? "var(--primary)" : "var(--muted-foreground)"}`,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>{selected && <span style={{ height: 10, width: 10, borderRadius: 9999, background: "var(--primary)" }} />}</span>
      <span style={{ fontSize: 14, lineHeight: 1.3, color: selected ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: selected ? 500 : 400 }}>
        I am someone who <span style={{ color: selected ? "var(--primary)" : "inherit" }}>{children}</span>
      </span>
    </button>
  );
}

function StepShell({ eyebrow, title, subtitle, children, cta, onContinue, ctaEnabled }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 24px 32px", animation: "step-fade-in 300ms ease both" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 style={{ marginTop: 12, fontSize: 32, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{title}</h1>
      {subtitle && <p style={{ marginTop: 8, fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.5 }}>{subtitle}</p>}
      <div style={{ marginTop: 32, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
      <div style={{ marginTop: 32 }}>
        <PrimaryButton onClick={onContinue} disabled={!ctaEnabled}>
          {ctaEnabled ? <>{cta} <IconArrow size={16} sw={2} /></> : "Pick an option"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Onboarding({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState("");
  const [costs, setCosts] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [habits, setHabits] = useState([]);
  const [notifStyles, setNotifStyles] = useState([]);
  const [identity, setIdentity] = useState("");
  const [name, setName] = useState("");

  const next = () => setStep((s) => s + 1);
  const toggle = (arr, v, set) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const NOTIF_STYLES = [
    { id: "conversational", label: "A short message, like a text from a friend" },
    { id: "curiosity", label: "A fact or insight that surprises me" },
    { id: "question", label: "A question that makes me think" },
    { id: "quiet", label: "A quiet nudge — nothing intense" },
  ];

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Back arrow on first step links out */}
      {step === 0 && onBack && (
        <button onClick={onBack} style={{ position: "absolute", top: 56, left: 16, zIndex: 30, padding: 8, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}>
          <IconBack size={18} />
        </button>
      )}
      <StepProgress step={step} />

      {step === 0 && (
        <StepShell eyebrow={`Step 1 of ${STEPS_TOTAL}`} title="Before we start — be honest with yourself"
          subtitle="How long have you been struggling with this?"
          cta="Continue" ctaEnabled={!!duration} onContinue={next}>
          {DURATIONS.map((d) => <Option key={d} selected={duration === d} onClick={() => setDuration(d)}>{d}</Option>)}
        </StepShell>
      )}

      {step === 1 && (
        <StepShell eyebrow={`Step 2 of ${STEPS_TOTAL}`} title="What does it cost you?"
          subtitle="Select everything this has taken from you."
          cta="These are the things I'm taking back" ctaEnabled={costs.length > 0} onContinue={next}>
          {COSTS.map((c) => <CheckOption key={c} selected={costs.includes(c)} onClick={() => toggle(costs, c, setCosts)}>{c}</CheckOption>)}
        </StepShell>
      )}

      {step === 2 && (
        <StepShell eyebrow={`Step 3 of ${STEPS_TOTAL}`} title="Your trigger profile"
          subtitle="When are you most vulnerable? We'll use this for smart reminders."
          cta="Continue" ctaEnabled={triggers.length > 0} onContinue={next}>
          {TRIGGERS.map((t) => <CheckOption key={t} selected={triggers.includes(t)} onClick={() => toggle(triggers, t, setTriggers)}>{t}</CheckOption>)}
        </StepShell>
      )}

      {step === 3 && (
        <StepShell eyebrow={`Step 4 of ${STEPS_TOTAL}`} title="How do you like to be reminded?"
          subtitle="We'll show up for you in the way that actually works for you — not like a pushy app."
          cta="Continue" ctaEnabled={true} onContinue={next}>
          {NOTIF_STYLES.map(({ id, label }) => (
            <CheckOption key={id} selected={notifStyles.includes(id)} onClick={() => toggle(notifStyles, id, setNotifStyles)}>{label}</CheckOption>
          ))}
        </StepShell>
      )}

      {step === 4 && (
        <StepShell eyebrow={`Step 5 of ${STEPS_TOTAL}`} title="Anything else you want to quit?"
          subtitle="With PRO you can track multiple addictions side-by-side. Pick any you'd like to add later."
          cta="Continue" ctaEnabled={true} onContinue={next}>
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: "var(--primary)", background: "oklch(0.62 0.22 255 / 0.10)", border: "1px solid oklch(0.62 0.22 255 / 0.30)", padding: "4px 10px", borderRadius: 9999, marginBottom: 4 }}>
            <IconLock size={12} sw={2} /> Unlocked with PRO
          </div>
          {HABITS.map((h) => <CheckOption key={h} selected={habits.includes(h)} onClick={() => toggle(habits, h, setHabits)}>{h}</CheckOption>)}
        </StepShell>
      )}

      {step === 5 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 24px 32px", animation: "step-fade-in 300ms ease both" }}>
          <Eyebrow color="primary" track=".25em">Identity · 04</Eyebrow>
          <h1 style={{ marginTop: 16, fontSize: 32, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.01em" }}>Choose who you<br />are becoming.</h1>
          <div style={{ marginTop: 32, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {IDENTITIES.map((o) => <IdentityRadio key={o} selected={identity === o} onClick={() => setIdentity(o)}>{o}</IdentityRadio>)}
          </div>
          <div style={{ marginTop: 32 }}>
            <PrimaryButton onClick={next} disabled={!identity}>{identity ? <>This is who I'm becoming <IconArrow size={16} sw={2} /></> : "Pick an option"}</PrimaryButton>
          </div>
        </div>
      )}

      {step === 6 && (
        <StepShell eyebrow={`Step 7 of ${STEPS_TOTAL}`} title="Your commitment"
          subtitle="Read it. Sign it. This is who you are now."
          cta="I commit to this" ctaEnabled={!!name.trim()} onContinue={onDone}>
          <div style={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", padding: 20 }}>
            <Eyebrow>Identity</Eyebrow>
            <p style={{ marginTop: 8, fontSize: 20, lineHeight: 1.3 }}>
              I am becoming someone who <span style={{ color: "var(--primary)" }}>{identity || "…"}</span>.
            </p>
          </div>
          <label style={{ display: "block", fontSize: 13, color: "var(--muted-foreground)", marginTop: 12, marginBottom: 4 }}>Sign with your first name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" style={{
            width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)",
            padding: "12px 16px", fontSize: 18, color: "var(--foreground)", fontFamily: "inherit", outline: "none",
          }} />
        </StepShell>
      )}
    </div>
  );
}

Object.assign(window, { Onboarding });

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppState, NotificationStyle, NotificationApp, type Addiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { CompanionStage, COMPANION_LABELS, type CompanionType } from "@/components/avatars/CompanionAvatar";
import { WolfSittingPreview } from "@/components/avatars/WolfStages";
import { PremiumBackground } from "@/components/PremiumBackground";

// ── Design tokens ──────────────────────────────────────────────────────────────
const G = "#C9A84C";
const CARD_BG = "#0f0c06";
const CARD_BORDER = "#1e1a10";
const BG = "#090705";

// ── Page transition variants ───────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 380, damping: 30 } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.18 } },
};

// ── Static data ────────────────────────────────────────────────────────────────
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

const durations = [
  { emoji: "⚡", label: "Less than 6 months" },
  { emoji: "🔁", label: "1-2 years" },
  { emoji: "⛓️", label: "3-5 years" },
  { emoji: "🪨", label: "More than 5 years" },
];

const costs = [
  { emoji: "💔", label: "Relationships" },
  { emoji: "🧠", label: "Focus & work" },
  { emoji: "🪞", label: "Self-confidence" },
  { emoji: "🌙", label: "Sleep" },
  { emoji: "👥", label: "Social life" },
  { emoji: "🌀", label: "Mental health" },
];

const triggers = [
  { emoji: "🌑", label: "Late at night" },
  { emoji: "😶", label: "When bored" },
  { emoji: "🌊", label: "When stressed" },
  { emoji: "🚪", label: "When alone" },
  { emoji: "💢", label: "After rejection" },
];

const notifStyleOptions: { id: NotificationStyle; emoji: string; label: string }[] = [
  { id: "conversational", emoji: "💬", label: "A short message, like a text from a friend" },
  { id: "curiosity",      emoji: "⚡", label: "A fact or insight that surprises me" },
  { id: "question",       emoji: "🔍", label: "A question that makes me think" },
  { id: "quiet",          emoji: "🍃", label: "A quiet nudge — nothing intense" },
];

const notifAppOptions: { id: NotificationApp; emoji: string; label: string }[] = [
  { id: "messaging",  emoji: "📱", label: "iMessage / WhatsApp" },
  { id: "instagram",  emoji: "📸", label: "Instagram" },
  { id: "email",      emoji: "📧", label: "Email" },
  { id: "rarely",     emoji: "🔕", label: "I rarely open notifications" },
];

const otherHabitOptions = [
  { emoji: "📵", label: "Social media doomscrolling" },
  { emoji: "🍬", label: "Sugar / junk food" },
  { emoji: "🍷", label: "Alcohol" },
  { emoji: "💨", label: "Nicotine / vaping" },
  { emoji: "🌿", label: "Cannabis" },
  { emoji: "🎰", label: "Online gambling / betting" },
  { emoji: "🎮", label: "Video game binges" },
  { emoji: "⏳", label: "Procrastination" },
];

const identityOptions = [
  { emoji: "👑", text: "is in full control of his mind" },
  { emoji: "🛡️", text: "no longer needs external validation" },
  { emoji: "💎", text: "chooses discomfort over instant gratification" },
  { emoji: "🔭", text: "is someone his future self is proud of" },
  { emoji: "⚔️", text: "shows up with discipline, not mood" },
];

// ── Micro-components ───────────────────────────────────────────────────────────

function SerifEm({ children }: { children: React.ReactNode }) {
  return (
    <em style={{
      fontFamily: "Cormorant Garamond, Georgia, serif",
      fontStyle: "italic",
      color: G,
      fontSize: "calc(1em + 4px)",
    }}>
      {children}
    </em>
  );
}

function EmojiCircle({ emoji }: { emoji: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: "rgba(201,168,76,0.1)",
      border: "1px solid rgba(201,168,76,0.15)",
      fontSize: 16, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {emoji}
    </div>
  );
}

function Eyebrow({ step, total }: { step: number; total: number }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "2px",
      color: G, textTransform: "uppercase", marginBottom: 10,
    }}>
      Step {step} of {total}
    </p>
  );
}

// Checkmark that springs in
function SpringCheck() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      style={{ fontSize: 10, color: BG, fontWeight: 900, lineHeight: 1, userSelect: "none" }}
    >
      ✓
    </motion.span>
  );
}

// Single-select option card (radio)
function OptionCard({ emoji, label, selected, onClick }: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{
        borderColor: selected ? G : CARD_BORDER,
        backgroundColor: selected ? "rgba(201,168,76,0.08)" : CARD_BG,
        boxShadow: selected ? "0 0 12px rgba(201,168,76,0.12)" : "0 0 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", borderRadius: 16,
        borderWidth: 1.5, borderStyle: "solid", cursor: "pointer", textAlign: "left",
      }}
    >
      <EmojiCircle emoji={emoji} />
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 500,
        color: selected ? "#fff" : "#5a5040",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {label}
      </span>
      {/* Radio circle */}
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${selected ? G : "#2a2010"}`,
        background: selected ? G : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        <AnimatePresence>{selected && <SpringCheck />}</AnimatePresence>
      </div>
    </motion.button>
  );
}

// Multi-select option card (checkbox)
function CheckCard({ emoji, label, selected, onClick }: {
  emoji: string; label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{
        borderColor: selected ? G : CARD_BORDER,
        backgroundColor: selected ? "rgba(201,168,76,0.08)" : CARD_BG,
        boxShadow: selected ? "0 0 12px rgba(201,168,76,0.12)" : "0 0 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", borderRadius: 16,
        borderWidth: 1.5, borderStyle: "solid", cursor: "pointer", textAlign: "left",
      }}
    >
      <EmojiCircle emoji={emoji} />
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 500,
        color: selected ? "#fff" : "#5a5040",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {label}
      </span>
      {/* Checkbox square */}
      <div style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${selected ? G : "#2a2010"}`,
        background: selected ? G : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        <AnimatePresence>{selected && <SpringCheck />}</AnimatePresence>
      </div>
    </motion.button>
  );
}

// Identity card (radio, shows full sentence)
function IdentityCard({ emoji, text, selected, onClick }: {
  emoji: string; text: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{
        borderColor: selected ? G : CARD_BORDER,
        backgroundColor: selected ? "rgba(201,168,76,0.08)" : CARD_BG,
        boxShadow: selected ? "0 0 12px rgba(201,168,76,0.12)" : "0 0 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.2 }}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "14px 16px", borderRadius: 16,
        borderWidth: 1.5, borderStyle: "solid", cursor: "pointer", textAlign: "left",
      }}
    >
      <EmojiCircle emoji={emoji} />
      <span style={{
        flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.4,
        color: selected ? "#e0d8c8" : "#5a5040",
        fontFamily: "DM Sans, sans-serif",
      }}>
        I am someone who{" "}
        <span style={{ color: selected ? G : "#5a5040" }}>{text}</span>
      </span>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: `1.5px solid ${selected ? G : "#2a2010"}`,
        background: selected ? G : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        <AnimatePresence>{selected && <SpringCheck />}</AnimatePresence>
      </div>
    </motion.button>
  );
}

// Gold gradient CTA button
function GoldButton({ disabled, onClick, children }: {
  disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <motion.button
      disabled={disabled}
      onClick={onClick}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      style={{
        width: "100%", height: 56, borderRadius: 14, border: "none",
        background: disabled ? "#1a1510" : `linear-gradient(135deg, ${G}, #E8C96A)`,
        color: disabled ? "#3a3020" : BG,
        fontFamily: "DM Sans, sans-serif",
        fontSize: 15, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: disabled ? "none" : "0 0 20px rgba(201,168,76,0.25)",
        marginTop: 20,
        transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
      }}
    >
      {children}
    </motion.button>
  );
}

// ── Route ──────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

// ── Main component ─────────────────────────────────────────────────────────────
function Onboarding() {
  const [state, update] = useAppState();
  const [showProAlert, setShowProAlert] = useState(false);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState("");
  const [pickedCosts, setPickedCosts] = useState<string[]>([]);
  const [pickedTriggers, setPickedTriggers] = useState<string[]>([]);
  const [notifStyles, setNotifStyles] = useState<NotificationStyle[]>([]);
  const [notifApps, setNotifApps] = useState<NotificationApp[]>([]);
  const [pickedHabits, setPickedHabits] = useState<string[]>([]);
  const [identity, setIdentity] = useState("");
  const [customIdentitySelected, setCustomIdentitySelected] = useState(false);
  const [companion, setCompanion] = useState<CompanionType | null>(null);
  const [name, setName] = useState("");

  const TOTAL = 9;
  const next = () => setStep((s) => s + 1);

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const finish = () => {
    const now = Date.now();
    const mainAddiction: Addiction = {
      id: "porn", name: "Porn", emoji: "🧠",
      startDate: now, totalCleanDays: 0, urgesSurvived: 0,
    };
    const extraAddictions: Addiction[] = pickedHabits.map((h) => {
      const preset = HABIT_MAP[h] ?? { name: h, emoji: "🔒" };
      return {
        id: preset.name.toLowerCase().replace(/\s+/g, "-"),
        name: preset.name, emoji: preset.emoji,
        startDate: now, totalCleanDays: 0, urgesSurvived: 0, premium: true,
      };
    });
    update({
      companion: companion ?? "tree",
      onboarding: { duration, costs: pickedCosts, triggers: pickedTriggers, identity, name, otherHabits: pickedHabits, completedAt: now },
      notificationStyles: notifStyles,
      notificationApps: notifApps,
      addictions: [mainAddiction, ...extraAddictions],
      activeAddictionId: mainAddiction.id,
    });
    navigate({ to: "/paywall" });
  };

  return (
    <div style={{ background: "transparent", minHeight: "100vh", fontFamily: "DM Sans, sans-serif" }}>
      <PremiumBackground />
      <div style={{ maxWidth: 448, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        <div style={{ paddingTop: 40 }}>
          <div style={{
            width: "100%", height: 3,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 10, overflow: "hidden", marginBottom: 32,
          }}>
            <motion.div
              key={step}
              style={{ height: "100%", background: `linear-gradient(90deg, ${G}, #E8C96A)`, borderRadius: 10 }}
              initial={{ width: `${(step / TOTAL) * 100}%` }}
              animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ── Steps ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ paddingBottom: 48 }}
          >

            {/* STEP 0 — Duration */}
            {step === 0 && (
              <div>
                <Eyebrow step={1} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Before we start — be honest with <SerifEm>yourself</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  How long have you been struggling with this?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {durations.map((d) => (
                    <OptionCard key={d.label} emoji={d.emoji} label={d.label}
                      selected={duration === d.label} onClick={() => setDuration(d.label)} />
                  ))}
                </div>
                <GoldButton disabled={!duration} onClick={next}>
                  {duration ? <><span>Continue</span><ArrowRight size={16} /></> : "Pick an option"}
                </GoldButton>
              </div>
            )}

            {/* STEP 1 — Costs */}
            {step === 1 && (
              <div>
                <Eyebrow step={2} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  What does it cost <SerifEm>you?</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  Select everything this has taken from you.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {costs.map((c) => (
                    <CheckCard key={c.label} emoji={c.emoji} label={c.label}
                      selected={pickedCosts.includes(c.label)}
                      onClick={() => toggle(pickedCosts, c.label, setPickedCosts)} />
                  ))}
                </div>
                <GoldButton disabled={pickedCosts.length === 0} onClick={next}>
                  {pickedCosts.length
                    ? <><span>These are the things I'm taking back</span><ArrowRight size={16} /></>
                    : "Pick at least one"}
                </GoldButton>
              </div>
            )}

            {/* STEP 2 — Triggers */}
            {step === 2 && (
              <div>
                <Eyebrow step={3} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Your trigger <SerifEm>profile</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  When are you most vulnerable? We'll use this for smart reminders.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {triggers.map((t) => (
                    <CheckCard key={t.label} emoji={t.emoji} label={t.label}
                      selected={pickedTriggers.includes(t.label)}
                      onClick={() => toggle(pickedTriggers, t.label, setPickedTriggers)} />
                  ))}
                </div>
                <GoldButton disabled={pickedTriggers.length === 0} onClick={next}>
                  {pickedTriggers.length
                    ? <><span>Continue</span><ArrowRight size={16} /></>
                    : "Pick at least one"}
                </GoldButton>
              </div>
            )}

            {/* STEP 3 — Notification style */}
            {step === 3 && (
              <div>
                <Eyebrow step={4} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  How do you like to be <SerifEm>reminded?</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  We'll show up in the way that actually works for you.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifStyleOptions.map(({ id, emoji, label }) => (
                    <CheckCard key={id} emoji={emoji} label={label}
                      selected={notifStyles.includes(id)}
                      onClick={() => setNotifStyles(
                        notifStyles.includes(id) ? notifStyles.filter(x => x !== id) : [...notifStyles, id]
                      )} />
                  ))}
                </div>
                <GoldButton onClick={next}>
                  <span>Continue</span><ArrowRight size={16} />
                </GoldButton>
              </div>
            )}

            {/* STEP 4 — Notification apps */}
            {step === 4 && (
              <div>
                <Eyebrow step={5} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Which apps do you actually <SerifEm>open?</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  We'll reach you where you are. You're in control — change it anytime.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifAppOptions.map(({ id, emoji, label }) => (
                    <CheckCard key={id} emoji={emoji} label={label}
                      selected={notifApps.includes(id)}
                      onClick={() => setNotifApps(
                        notifApps.includes(id) ? notifApps.filter(x => x !== id) : [...notifApps, id]
                      )} />
                  ))}
                </div>
                <GoldButton onClick={next}>
                  <span>Continue</span><ArrowRight size={16} />
                </GoldButton>
              </div>
            )}

            {/* STEP 5 — Other habits */}
            {step === 5 && (
              <div>
                <Eyebrow step={6} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Anything else you want to <SerifEm>quit?</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 16, lineHeight: 1.5 }}>
                  Skip and add them anytime.
                </p>

                {/* PRO badge — clickable, opens paywall */}
                <button
                  onClick={() => triggerPaywall()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    borderRadius: 12, padding: "10px 16px",
                    marginBottom: 16, width: "100%", textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.18s",
                  }}
                  onPointerEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.18)")}
                  onPointerLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.10)")}
                >
                  <span style={{ fontSize: 18 }}>🔓</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: G, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
                      Unlocked with PRO
                    </p>
                    <p style={{ fontSize: 11, color: "#5a5040", margin: 0 }}>
                      Track multiple addictions side-by-side
                    </p>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 14, color: G, opacity: 0.7 }}>›</span>
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {otherHabitOptions.map((h) => {
                    const isSelected = pickedHabits.includes(h.label);
                    const handleClick = () => {
                      // Always allow deselection
                      if (isSelected) { toggle(pickedHabits, h.label, setPickedHabits); return; }
                      // Free users: max 1 selection
                      if (!state.isPremium && pickedHabits.length >= 1) { setShowProAlert(true); return; }
                      toggle(pickedHabits, h.label, setPickedHabits);
                    };
                    return (
                      <CheckCard key={h.label} emoji={h.emoji} label={h.label}
                        selected={isSelected} onClick={handleClick} />
                    );
                  })}
                </div>

                <GoldButton onClick={next}>
                  <span>Continue</span><ArrowRight size={16} />
                </GoldButton>

                {/* ── Pro upgrade alert modal ── */}
                <AnimatePresence>
                  {showProAlert && (
                    <motion.div
                      key="pro-alert-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => setShowProAlert(false)}
                      style={{
                        position: "fixed", inset: 0, zIndex: 100,
                        background: "rgba(0,0,0,0.72)",
                        display: "flex", alignItems: "flex-end",
                        padding: "0 0 32px",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                      }}
                    >
                      <motion.div
                        key="pro-alert-sheet"
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          width: "100%", maxWidth: 448, margin: "0 auto",
                          background: "linear-gradient(160deg, #1a1508 0%, #0f0c06 100%)",
                          border: "1px solid rgba(201,168,76,0.28)",
                          borderRadius: "24px 24px 16px 16px",
                          padding: "28px 24px 24px",
                          boxShadow: "0 -8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.08)",
                        }}
                      >
                        {/* Icon */}
                        <div style={{
                          width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px",
                          background: "rgba(201,168,76,0.12)",
                          border: "1px solid rgba(201,168,76,0.32)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22,
                        }}>🔒</div>

                        <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", textAlign: "center", margin: "0 0 8px", lineHeight: 1.3 }}>
                          PRO required
                        </p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", textAlign: "center", margin: "0 0 24px", lineHeight: 1.55 }}>
                          You need a Pro account to track multiple addictions side-by-side.
                        </p>

                        {/* Upgrade button */}
                        <button
                          onClick={() => { setShowProAlert(false); triggerPaywall(); }}
                          style={{
                            width: "100%", padding: "14px 0",
                            background: "linear-gradient(135deg, #C9A84C, #E8C96A)",
                            border: "none", borderRadius: 14,
                            fontSize: 15, fontWeight: 700,
                            color: "#1a1000", cursor: "pointer",
                            marginBottom: 10,
                            boxShadow: "0 4px 18px rgba(201,168,76,0.32)",
                          }}
                        >
                          Upgrade Now
                        </button>

                        {/* Dismiss */}
                        <button
                          onClick={() => setShowProAlert(false)}
                          style={{
                            width: "100%", padding: "12px 0",
                            background: "transparent", border: "none",
                            fontSize: 14, color: "rgba(255,255,255,0.38)",
                            cursor: "pointer",
                          }}
                        >
                          Maybe later
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 6 — Identity */}
            {step === 6 && (
              <div>
                <Eyebrow step={7} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 24px" }}>
                  Choose who you are <SerifEm>becoming.</SerifEm>
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {identityOptions.map(({ emoji, text }) => (
                    <IdentityCard key={text} emoji={emoji} text={text}
                      selected={identity === text && !customIdentitySelected}
                      onClick={() => { setIdentity(text); setCustomIdentitySelected(false); }} />
                  ))}

                  {/* Write your own */}
                  {customIdentitySelected ? (
                    <motion.div
                      animate={{
                        borderColor: G,
                        backgroundColor: "rgba(201,168,76,0.08)",
                        boxShadow: "0 0 12px rgba(201,168,76,0.12)",
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px", borderRadius: 16,
                        borderWidth: 1.5, borderStyle: "solid",
                      }}
                    >
                      <EmojiCircle emoji="✏️" />
                      <input
                        autoFocus
                        value={identity}
                        onChange={(e) => setIdentity(e.target.value)}
                        placeholder="e.g. is in full control of his mind"
                        style={{
                          flex: 1, background: "transparent", border: "none", outline: "none",
                          fontSize: 13, color: "#fff", fontFamily: "DM Sans, sans-serif",
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.button
                      onClick={() => { setCustomIdentitySelected(true); setIdentity(""); }}
                      whileTap={{ scale: 0.96 }}
                      animate={{ borderColor: CARD_BORDER, backgroundColor: CARD_BG }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px", borderRadius: 16,
                        borderWidth: 1.5, borderStyle: "solid", cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <EmojiCircle emoji="✏️" />
                      <span style={{ fontSize: 13, color: "#5a5040", fontFamily: "DM Sans, sans-serif" }}>
                        Write your own...
                      </span>
                    </motion.button>
                  )}
                </div>
                <GoldButton disabled={!identity.trim()} onClick={next}>
                  {identity.trim()
                    ? <><span>This is who I'm becoming</span><ArrowRight size={16} /></>
                    : "Pick an option"}
                </GoldButton>
              </div>
            )}

            {/* STEP 7 — Companion */}
            {step === 7 && (
              <div>
                <style>{`
                  @keyframes ob-leaf-float {
                    0%, 100% { transform: translateY(0px) rotate(-2deg); opacity: 0.70; }
                    50%       { transform: translateY(-5px) rotate(2deg);  opacity: 1.00; }
                  }
                  @keyframes ob-dust {
                    0%   { transform: translateY(0px) scale(1);   opacity: 0; }
                    15%  { opacity: 1; }
                    85%  { opacity: 0.8; }
                    100% { transform: translateY(-18px) scale(0.6); opacity: 0; }
                  }
                  @keyframes ob-orb-pulse {
                    0%, 100% { transform: scale(1.0); opacity: 0.80; }
                    50%       { transform: scale(1.18); opacity: 1.00; }
                  }
                  @keyframes ob-eye-glow {
                    0%, 100% { opacity: 0.85; }
                    50%       { opacity: 1.00; }
                  }
                  @keyframes ob-card-halo {
                    0%, 100% { opacity: 0.50; }
                    50%       { opacity: 0.90; }
                  }
                `}</style>
                <Eyebrow step={8} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Choose your recovery <SerifEm>companion.</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  They grow alongside you — day by day, stage by stage.
                </p>
                <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>

                  {/* ══════════════════════════════════════════════
                      TREE CARD
                  ══════════════════════════════════════════════ */}
                  {(() => {
                    const isSelected = companion === "tree";
                    return (
                      <motion.button
                        key="tree"
                        onClick={() => setCompanion("tree")}
                        whileTap={{ scale: 0.97 }}
                        animate={{
                          boxShadow: isSelected
                            ? "0 0 0 1.5px rgba(201,168,76,0.65), 0 0 28px rgba(201,168,76,0.22), 0 0 56px rgba(201,168,76,0.08)"
                            : "0 0 0 1px rgba(201,168,76,0.18)",
                        }}
                        transition={{ duration: 0.25 }}
                        style={{
                          flex: 1, borderRadius: 18, border: "none",
                          cursor: "pointer", overflow: "hidden",
                          display: "flex", flexDirection: "column", alignItems: "center",
                          paddingBottom: 14, position: "relative",
                          background: [
                            "radial-gradient(ellipse at 50% 90%, rgba(10,28,12,0.95) 0%, rgba(4,14,6,0.99) 60%, rgba(2,8,3,1) 100%)",
                          ].join(", "),
                        }}
                      >
                        {/* Subtle card ambient halo when selected */}
                        {isSelected && (
                          <div aria-hidden style={{
                            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                            background: "radial-gradient(ellipse at 50% 60%, rgba(80,160,60,0.10) 0%, transparent 70%)",
                            animation: "ob-card-halo 3.2s ease-in-out infinite",
                          }}/>
                        )}

                        {/* ── Illustration area ── */}
                        <div style={{ width: "100%", height: 160, position: "relative", overflow: "hidden" }}>

                          {/* Deep forest floor gradient */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 50% 110%, rgba(20,60,18,0.55) 0%, transparent 60%)",
                              "radial-gradient(ellipse at 50% 0%,  rgba(5,20,6,0.80) 0%,  transparent 70%)",
                            ].join(", "),
                          }}/>

                          {/* Swirling root mist at the base */}
                          <svg aria-hidden style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 48, opacity: 0.45 }}>
                            <defs>
                              <radialGradient id="ob-root-mist" cx="50%" cy="100%" r="80%">
                                <stop offset="0%" stopColor="#2a6b28" stopOpacity="0.55"/>
                                <stop offset="100%" stopColor="#0a1e08" stopOpacity="0"/>
                              </radialGradient>
                            </defs>
                            <ellipse cx="50%" cy="100%" rx="48%" ry="38%" fill="url(#ob-root-mist)"/>
                          </svg>

                          {/* Gold dust particles */}
                          {[
                            { x: 28, y: 42, s: 2.0, d: 0.0, dur: 6.8 },
                            { x: 52, y: 28, s: 1.6, d: 1.4, dur: 8.2 },
                            { x: 72, y: 50, s: 1.8, d: 0.7, dur: 7.5 },
                            { x: 38, y: 65, s: 1.4, d: 2.2, dur: 9.0 },
                            { x: 62, y: 38, s: 2.2, d: 3.0, dur: 7.0 },
                            { x: 20, y: 72, s: 1.5, d: 1.8, dur: 8.5 },
                          ].map((p, i) => (
                            <div key={i} aria-hidden style={{
                              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                              width: p.s, height: p.s, borderRadius: "50%",
                              background: "#e8c86a",
                              boxShadow: "0 0 4px 1.5px rgba(232,200,106,0.70)",
                              animation: `ob-dust ${p.dur}s ease-in-out ${p.d}s infinite`,
                              pointerEvents: "none",
                            }}/>
                          ))}

                          {/* Sacred bonsai tree SVG */}
                          <svg width="100%" height="160" viewBox="0 0 100 160" fill="none" style={{ position: "absolute", inset: 0 }}>
                            <defs>
                              <linearGradient id="ob-trunk-g" x1="50" y1="155" x2="50" y2="60" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"  stopColor="#6b3f12"/>
                                <stop offset="50%" stopColor="#b8832c"/>
                                <stop offset="100%" stopColor="#d4a84c"/>
                              </linearGradient>
                              <radialGradient id="ob-leaf-g" cx="44%" cy="40%" r="55%">
                                <stop offset="0%"  stopColor="#a8e878"/>
                                <stop offset="45%" stopColor="#5ab840"/>
                                <stop offset="100%" stopColor="#2a6b20"/>
                              </radialGradient>
                              <radialGradient id="ob-leaf-g2" cx="44%" cy="40%" r="55%">
                                <stop offset="0%"  stopColor="#c8f090"/>
                                <stop offset="50%" stopColor="#78d050"/>
                                <stop offset="100%" stopColor="#3a8828"/>
                              </radialGradient>
                              <filter id="ob-leaf-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2.0" result="b"/>
                                <feFlood floodColor="#60c840" floodOpacity="0.45" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-trunk-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.2" result="b"/>
                                <feFlood floodColor="#c8902c" floodOpacity="0.30" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                            </defs>

                            {/* Swirling roots */}
                            <path d="M50 155 Q44 148 38 152 Q32 156 28 154" stroke="url(#ob-trunk-g)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75"/>
                            <path d="M50 155 Q56 148 62 152 Q68 155 72 153" stroke="url(#ob-trunk-g)" strokeWidth="2.0" strokeLinecap="round" fill="none" opacity="0.75"/>
                            <path d="M48 155 Q42 152 36 156 Q30 158 26 157" stroke="url(#ob-trunk-g)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.50"/>
                            <path d="M52 155 Q58 151 66 154 Q74 156 78 155" stroke="url(#ob-trunk-g)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.50"/>

                            {/* Main trunk — gnarled S-curve */}
                            <path d="M50 155 Q46 140 48 125 Q44 110 48 96 Q46 84 50 72"
                              stroke="url(#ob-trunk-g)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#ob-trunk-glow)"/>
                            {/* Bark texture */}
                            <path d="M48 148 Q44 147 43 148" stroke="rgba(212,168,76,0.35)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                            <path d="M49 135 Q53 134 54 135" stroke="rgba(212,168,76,0.28)" strokeWidth="1.0" strokeLinecap="round" fill="none"/>
                            <path d="M47 120 Q43 119 42 120" stroke="rgba(212,168,76,0.25)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>

                            {/* Left branch */}
                            <path d="M48 100 Q36 88 26 78 Q20 72 16 65"
                              stroke="url(#ob-trunk-g)" strokeWidth="3.0" strokeLinecap="round" fill="none"/>
                            <path d="M16 65 Q10 58 8 50" stroke="#b8832c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                            <path d="M16 65 Q20 58 22 50" stroke="#b8832c" strokeWidth="1.6" strokeLinecap="round" fill="none"/>

                            {/* Right branch */}
                            <path d="M50 92 Q64 80 74 70 Q80 64 84 57"
                              stroke="url(#ob-trunk-g)" strokeWidth="3.0" strokeLinecap="round" fill="none"/>
                            <path d="M84 57 Q88 50 90 44" stroke="#b8832c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                            <path d="M84 57 Q82 50 80 44" stroke="#b8832c" strokeWidth="1.6" strokeLinecap="round" fill="none"/>

                            {/* Centre upward branch */}
                            <path d="M50 80 Q50 68 50 56" stroke="#b8832c" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
                            <path d="M50 56 Q46 48 42 40" stroke="#b8832c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                            <path d="M50 56 Q54 48 58 40" stroke="#b8832c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

                            {/* Leaf clusters — glowing emerald-green */}
                            <ellipse cx="8"  cy="48"  rx="11" ry="9"  fill="url(#ob-leaf-g)"  filter="url(#ob-leaf-glow)" opacity="0.90" style={{ animation: "ob-leaf-float 5.5s ease-in-out 0s infinite" }}/>
                            <ellipse cx="4"  cy="56"  rx="7"  ry="5.5" fill="#3a8828"         opacity="0.72"/>
                            <ellipse cx="22" cy="47"  rx="10" ry="8"  fill="url(#ob-leaf-g)"  filter="url(#ob-leaf-glow)" opacity="0.88" style={{ animation: "ob-leaf-float 6.2s ease-in-out 0.8s infinite" }}/>
                            <ellipse cx="42" cy="36"  rx="12" ry="9.5" fill="url(#ob-leaf-g2)" filter="url(#ob-leaf-glow)" opacity="0.95" style={{ animation: "ob-leaf-float 5.8s ease-in-out 0.4s infinite" }}/>
                            <ellipse cx="50" cy="30"  rx="13" ry="10" fill="url(#ob-leaf-g2)" filter="url(#ob-leaf-glow)" opacity="1.00" style={{ animation: "ob-leaf-float 6.5s ease-in-out 1.1s infinite" }}/>
                            <ellipse cx="58" cy="36"  rx="12" ry="9.5" fill="url(#ob-leaf-g2)" filter="url(#ob-leaf-glow)" opacity="0.95" style={{ animation: "ob-leaf-float 5.5s ease-in-out 1.8s infinite" }}/>
                            <ellipse cx="78" cy="41"  rx="10" ry="8"  fill="url(#ob-leaf-g)"  filter="url(#ob-leaf-glow)" opacity="0.88" style={{ animation: "ob-leaf-float 6.0s ease-in-out 0.6s infinite" }}/>
                            <ellipse cx="90" cy="42"  rx="9"  ry="7"  fill="url(#ob-leaf-g)"  filter="url(#ob-leaf-glow)" opacity="0.85" style={{ animation: "ob-leaf-float 7.0s ease-in-out 2.2s infinite" }}/>
                            <ellipse cx="82" cy="50"  rx="7"  ry="5.5" fill="#3a8828"         opacity="0.65"/>

                            {/* Leaf shimmer highlights */}
                            <ellipse cx="50" cy="27"  rx="7"  ry="3.5" fill="rgba(200,250,160,0.30)"/>
                            <ellipse cx="8"  cy="45"  rx="5"  ry="2.5" fill="rgba(200,250,160,0.22)"/>
                            <ellipse cx="90" cy="39"  rx="4"  ry="2.0" fill="rgba(200,250,160,0.20)"/>

                            {/* Ground glow at trunk base */}
                            <ellipse cx="50" cy="156" rx="18" ry="5" fill="rgba(80,160,40,0.18)"/>
                          </svg>
                        </div>

                        {/* Selection dot */}
                        <div style={{
                          marginTop: 10, width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${isSelected ? G : "rgba(201,168,76,0.30)"}`,
                          background: isSelected ? G : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                style={{ width: 6, height: 6, borderRadius: "50%", background: "#030502" }}/>
                            )}
                          </AnimatePresence>
                        </div>
                        <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: isSelected ? G : "#e8d8b0", fontFamily: "DM Sans, sans-serif" }}>
                          The Tree
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(201,168,76,0.45)", textAlign: "center", padding: "0 8px", lineHeight: 1.3, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>
                          Grows stronger with every clean day
                        </p>
                      </motion.button>
                    );
                  })()}

                  {/* ══════════════════════════════════════════════
                      WOLF CARD
                  ══════════════════════════════════════════════ */}
                  {(() => {
                    const isSelected = companion === "wolf";
                    return (
                      <motion.button
                        key="wolf"
                        onClick={() => setCompanion("wolf")}
                        whileTap={{ scale: 0.97 }}
                        animate={{
                          boxShadow: isSelected
                            ? "0 0 0 1.5px rgba(201,168,76,0.65), 0 0 28px rgba(201,168,76,0.22), 0 0 56px rgba(201,168,76,0.08)"
                            : "0 0 0 1px rgba(201,168,76,0.18)",
                        }}
                        transition={{ duration: 0.25 }}
                        style={{
                          flex: 1, borderRadius: 18, border: "none",
                          cursor: "pointer", overflow: "hidden",
                          display: "flex", flexDirection: "column", alignItems: "center",
                          paddingBottom: 14, position: "relative",
                          background: [
                            "repeating-linear-gradient(-48deg, transparent, transparent 3px, rgba(50,40,30,0.06) 3px, rgba(50,40,30,0.06) 4px)",
                            "radial-gradient(ellipse at 30% 60%, rgba(20,10,50,0.45) 0%, transparent 65%)",
                            "linear-gradient(160deg, rgba(10,7,18,0.98) 0%, rgba(5,3,10,1) 100%)",
                          ].join(", "),
                        }}
                      >
                        {/* Nebula glow when selected */}
                        {isSelected && (
                          <div aria-hidden style={{
                            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                            background: "radial-gradient(ellipse at 50% 45%, rgba(60,40,160,0.14) 0%, transparent 70%)",
                            animation: "ob-card-halo 3.8s ease-in-out infinite",
                          }}/>
                        )}

                        {/* ── Illustration area ── */}
                        <div style={{ width: "100%", height: 160, position: "relative", overflow: "hidden" }}>

                          {/* Deep midnight-purple nebula base — bleeds to all edges */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 50% 55%, rgba(55,28,115,0.55) 0%, rgba(28,12,65,0.45) 38%, transparent 68%)",
                              "radial-gradient(ellipse at 15% 20%, rgba(70,35,140,0.30) 0%, transparent 48%)",
                              "radial-gradient(ellipse at 85% 15%, rgba(35,15,90,0.28) 0%, transparent 42%)",
                              "linear-gradient(180deg, rgba(6,3,16,0.95) 0%, rgba(8,4,22,0.88) 50%, rgba(4,2,12,0.98) 100%)",
                            ].join(", "),
                          }}/>

                          {/* Cosmic dust haze bands */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 30% 40%, rgba(80,40,180,0.14) 0%, transparent 50%)",
                              "radial-gradient(ellipse at 75% 65%, rgba(40,20,100,0.12) 0%, transparent 45%)",
                            ].join(", "),
                          }}/>

                          {/* Twinkling star field — 20 stars, varied sizes and brightness */}
                          {[
                            { x: 8,  y: 6,  r: 0.9, o: 0.90 }, { x: 18, y: 14, r: 0.7, o: 0.65 },
                            { x: 30, y: 5,  r: 1.2, o: 0.85 }, { x: 48, y: 8,  r: 0.8, o: 0.70 },
                            { x: 62, y: 4,  r: 1.1, o: 0.92 }, { x: 76, y: 10, r: 0.7, o: 0.60 },
                            { x: 88, y: 7,  r: 1.0, o: 0.80 }, { x: 93, y: 22, r: 0.8, o: 0.72 },
                            { x: 5,  y: 28, r: 1.0, o: 0.68 }, { x: 14, y: 42, r: 0.7, o: 0.55 },
                            { x: 85, y: 35, r: 0.9, o: 0.75 }, { x: 94, y: 50, r: 0.7, o: 0.60 },
                            { x: 4,  y: 58, r: 0.8, o: 0.50 }, { x: 91, y: 65, r: 1.0, o: 0.65 },
                            { x: 22, y: 18, r: 0.6, o: 0.58 }, { x: 70, y: 20, r: 0.8, o: 0.70 },
                            { x: 55, y: 15, r: 1.3, o: 0.88 }, { x: 38, y: 22, r: 0.7, o: 0.55 },
                            { x: 82, y: 48, r: 0.8, o: 0.62 }, { x: 12, y: 70, r: 0.9, o: 0.48 },
                          ].map((s, i) => (
                            <div key={i} aria-hidden style={{
                              position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
                              width: s.r * 2, height: s.r * 2, borderRadius: "50%",
                              background: i % 5 === 0 ? "rgba(180,200,255,0.90)" : "rgba(220,225,255,0.85)",
                              opacity: s.o,
                              boxShadow: i % 4 === 0
                                ? `0 0 ${s.r * 4}px ${s.r}px rgba(160,180,255,0.55)`
                                : `0 0 ${s.r * 3}px ${s.r * 0.5}px rgba(200,210,255,0.40)`,
                            }}/>
                          ))}

                          {/* Wolf pup — chibi, modern cartoon, silver-grey fur */}
                          <svg width="100%" height="160" viewBox="0 0 100 160" fill="none" style={{ position: "absolute", inset: 0 }}>
                            <defs>
                              {/* ── GRADIENTS ── */}
                              <linearGradient id="wf-fur-dark" x1="50" y1="38" x2="50" y2="158" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#7A8092"/>
                                <stop offset="42%"  stopColor="#4A4E5D"/>
                                <stop offset="100%" stopColor="#22242E"/>
                              </linearGradient>
                              <linearGradient id="wf-fur-mid" x1="50" y1="90" x2="50" y2="158" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#A1A8B8"/>
                                <stop offset="60%"  stopColor="#6A7080"/>
                                <stop offset="100%" stopColor="#3A3E4A"/>
                              </linearGradient>
                              <linearGradient id="wf-chest" x1="50" y1="96" x2="50" y2="156" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#FFFFFF"/>
                                <stop offset="35%"  stopColor="#EDF1FF"/>
                                <stop offset="100%" stopColor="#C4CCE0"/>
                              </linearGradient>
                              <linearGradient id="wf-head" x1="50" y1="28" x2="50" y2="92" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#B0B8CC"/>
                                <stop offset="50%"  stopColor="#8890A4"/>
                                <stop offset="100%" stopColor="#5A6070"/>
                              </linearGradient>
                              <radialGradient id="wf-face" cx="50%" cy="42%" r="58%">
                                <stop offset="0%"   stopColor="#DCE4F4"/>
                                <stop offset="55%"  stopColor="#B4BDD0"/>
                                <stop offset="100%" stopColor="#788094"/>
                              </radialGradient>
                              <radialGradient id="wf-muzzle" cx="50%" cy="32%" r="65%">
                                <stop offset="0%"   stopColor="#F2F6FF"/>
                                <stop offset="58%"  stopColor="#D8E0F2"/>
                                <stop offset="100%" stopColor="#A8B2C6"/>
                              </radialGradient>
                              <linearGradient id="wf-ear-out" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%"   stopColor="#5A6070"/>
                                <stop offset="100%" stopColor="#8890A2"/>
                              </linearGradient>
                              <linearGradient id="wf-ear-in" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%"   stopColor="#DDB4C4"/>
                                <stop offset="55%"  stopColor="#C098AE"/>
                                <stop offset="100%" stopColor="#A07888"/>
                              </linearGradient>
                              <linearGradient id="wf-tail" x1="68" y1="140" x2="80" y2="74" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#3A3E4A"/>
                                <stop offset="38%"  stopColor="#7A8092"/>
                                <stop offset="72%"  stopColor="#C0C8DA"/>
                                <stop offset="100%" stopColor="#F4F8FF"/>
                              </linearGradient>
                              <radialGradient id="wf-eye-iris" cx="38%" cy="32%" r="60%">
                                <stop offset="0%"   stopColor="#C8F2FF"/>
                                <stop offset="22%"  stopColor="#3CCEFF"/>
                                <stop offset="58%"  stopColor="#0880E4"/>
                                <stop offset="100%" stopColor="#003C9A"/>
                              </radialGradient>
                              {/* ── FILTERS ── */}
                              <filter id="wf-glow" x="-18%" y="-18%" width="136%" height="136%">
                                <feGaussianBlur stdDeviation="3.2" result="b"/>
                                <feFlood floodColor="#4430A0" floodOpacity="0.30" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="wf-eye-glow" x="-90%" y="-90%" width="280%" height="280%">
                                <feGaussianBlur stdDeviation="2.6" result="b"/>
                                <feFlood floodColor="#18C0FF" floodOpacity="1.0" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="wf-paw-shadow" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="2.2" result="b"/>
                              </filter>
                              <filter id="wf-rim" x="-8%" y="-8%" width="116%" height="116%">
                                <feGaussianBlur stdDeviation="1.1" result="b"/>
                                <feFlood floodColor="#A8C0F0" floodOpacity="0.48" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                            </defs>

                            {/* ── GROUND SHADOW ── */}
                            <ellipse cx="50" cy="156" rx="26" ry="5" fill="rgba(18,12,38,0.48)"/>
                            <ellipse cx="50" cy="158" rx="16" ry="3" fill="rgba(12,8,28,0.32)"/>

                            <g id="wolf-pup">

                              {/* ── L1: TAIL (behind body) ── */}
                              <path d="M 66 138 C 88 130 100 112 98 92 C 96 76 84 66 74 72 C 84 80 86 98 82 114 C 78 128 68 136 62 140 Z"
                                fill="#2A2D38" opacity="0.52"/>
                              <path d="M 66 138 C 88 130 100 112 98 92 C 96 76 84 66 74 72"
                                stroke="#4A4E5D" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#wf-glow)"/>
                              <path d="M 66 138 C 88 130 100 112 98 92 C 96 76 84 66 74 72"
                                stroke="url(#wf-tail)" strokeWidth="9" strokeLinecap="round" fill="none"/>
                              <path d="M 66 138 C 86 132 98 114 96 94 C 94 78 83 68 74 72"
                                stroke="#D0D8EC" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                              {/* Tail tip — white jagged fur */}
                              <path d="M 74 72 C 70 64 76 56 82 62 C 86 66 84 76 78 78 Z" fill="#FFFFFF" opacity="0.88"/>
                              <path d="M 74 72 C 71 64 75 57 81 61" stroke="rgba(242,246,255,0.78)" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
                              <path d="M 77 75 C 74 66 79 59 84 64" stroke="rgba(238,244,255,0.65)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                              <path d="M 71 76 C 69 68 73 62 77 66" stroke="rgba(235,242,255,0.55)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                              <path d="M 79 70 C 77 62 81 56 85 60" stroke="rgba(230,240,255,0.48)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>

                              {/* ── L2: BODY ── */}
                              <path d="M 29 102 C 22 114 20 132 24 146 C 28 156 40 160 50 160 C 60 160 72 156 76 146 C 80 132 78 114 71 102 C 64 93 56 90 50 90 C 44 90 36 93 29 102 Z"
                                fill="url(#wf-fur-dark)" filter="url(#wf-glow)"/>
                              <path d="M 29 102 C 22 114 20 132 24 146"
                                stroke="rgba(182,198,232,0.28)" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#wf-rim)"/>
                              <path d="M 71 102 C 78 114 80 132 76 146"
                                stroke="rgba(182,198,232,0.22)" strokeWidth="4.5" strokeLinecap="round" fill="none" filter="url(#wf-rim)"/>
                              {/* Chest fluff — crisp white gradient */}
                              <path d="M 35 102 C 32 118 32 136 36 150 C 40 157 50 160 50 160 C 50 160 60 157 64 150 C 68 136 68 118 65 102 C 58 94 50 91 50 91 C 50 91 42 94 35 102 Z"
                                fill="url(#wf-chest)" opacity="0.70"/>
                              <ellipse cx="50" cy="124" rx="9" ry="20" fill="rgba(255,255,255,0.20)"/>
                              <path d="M 39 108 C 44 104 50 103 56 104 C 59 105 61 107 62 108" stroke="rgba(238,244,255,0.42)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 38 118 C 43 114 50 113 57 114 C 60 115 62 117 63 118" stroke="rgba(232,240,255,0.30)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              <path d="M 38 128 C 43 124 50 123 57 124 C 60 125 62 127 63 128" stroke="rgba(226,236,255,0.22)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                              <path d="M 39 138 C 44 134 50 133 56 134 C 59 135 61 137 62 138" stroke="rgba(220,232,255,0.16)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>

                              {/* ── L2b: PAWS ── */}
                              <ellipse cx="32" cy="155" rx="11" ry="4.5" fill="rgba(18,12,38,0.35)" filter="url(#wf-paw-shadow)"/>
                              <ellipse cx="68" cy="155" rx="11" ry="4.5" fill="rgba(18,12,38,0.35)" filter="url(#wf-paw-shadow)"/>
                              <path d="M 22 148 C 20 140 21 154 24 158 C 27 162 38 162 42 158 C 45 154 45 142 42 140 C 39 140 36 142 32 142 C 28 142 24 144 22 148 Z"
                                fill="url(#wf-fur-mid)" opacity="0.95"/>
                              <path d="M 22 148 C 20 140 21 154 24 158 C 27 162 38 162 42 158 C 45 154 45 142 42 140 C 39 140 36 142 32 142 C 28 142 24 144 22 148 Z"
                                fill="rgba(210,220,240,0.26)"/>
                              <path d="M 23 154 C 25 158 28 158 29 154" stroke="rgba(162,175,202,0.68)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 29 157 C 31 161 34 161 35 157" stroke="rgba(162,175,202,0.58)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 35 157 C 37 161 40 160 41 156" stroke="rgba(162,175,202,0.48)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 78 148 C 80 140 79 154 76 158 C 73 162 62 162 58 158 C 55 154 55 142 58 140 C 61 140 64 142 68 142 C 72 142 76 144 78 148 Z"
                                fill="url(#wf-fur-mid)" opacity="0.95"/>
                              <path d="M 78 148 C 80 140 79 154 76 158 C 73 162 62 162 58 158 C 55 154 55 142 58 140 C 61 140 64 142 68 142 C 72 142 76 144 78 148 Z"
                                fill="rgba(210,220,240,0.26)"/>
                              <path d="M 77 154 C 75 158 72 158 71 154" stroke="rgba(162,175,202,0.68)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 71 157 C 69 161 66 161 65 157" stroke="rgba(162,175,202,0.58)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 65 157 C 63 161 60 160 59 156" stroke="rgba(162,175,202,0.48)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>

                              {/* ── L3: NECK ── */}
                              <path d="M 34 94 C 30 98 30 108 34 112 C 40 116 50 118 50 118 C 50 118 60 116 66 112 C 70 108 70 98 66 94 C 60 88 40 88 34 94 Z"
                                fill="url(#wf-fur-dark)" filter="url(#wf-glow)"/>

                              {/* ── L4: EARS (behind head) ── */}
                              {/* Left ear outer */}
                              <path d="M 23 44 C 18 30 13 12 20 8 C 27 14 40 26 46 38 Z"
                                fill="url(#wf-ear-out)" filter="url(#wf-glow)" stroke="rgba(145,158,185,0.32)" strokeWidth="0.9" strokeLinejoin="round"/>
                              <path d="M 25 42 C 21 28 17 14 22 10 C 28 15 38 26 43 37 Z" fill="rgba(172,164,196,0.35)"/>
                              <path d="M 27 40 C 24 27 20 15 24 11 C 29 16 36 26 40 36 Z" fill="url(#wf-ear-in)" opacity="0.75"/>
                              {/* Inner ear fur texture cuts */}
                              <path d="M 25 34 C 23 27 21 20 23 15" stroke="rgba(240,205,218,0.48)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 29 37 C 27 29 26 22 28 17" stroke="rgba(235,200,214,0.38)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              <path d="M 33 39 C 31 32 30 25 32 20" stroke="rgba(230,195,210,0.28)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                              {/* Right ear outer */}
                              <path d="M 77 44 C 82 30 87 12 80 8 C 73 14 60 26 54 38 Z"
                                fill="url(#wf-ear-out)" filter="url(#wf-glow)" stroke="rgba(145,158,185,0.32)" strokeWidth="0.9" strokeLinejoin="round"/>
                              <path d="M 75 42 C 79 28 83 14 78 10 C 72 15 62 26 57 37 Z" fill="rgba(172,164,196,0.35)"/>
                              <path d="M 73 40 C 76 27 80 15 76 11 C 71 16 64 26 60 36 Z" fill="url(#wf-ear-in)" opacity="0.75"/>
                              <path d="M 75 34 C 77 27 79 20 77 15" stroke="rgba(240,205,218,0.48)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 71 37 C 73 29 74 22 72 17" stroke="rgba(235,200,214,0.38)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              <path d="M 67 39 C 69 32 70 25 68 20" stroke="rgba(230,195,210,0.28)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

                              {/* ── L5: HEAD — sleek lupine skull, widens at temples then tapers ── */}
                              <path d="M 50 30 C 63 29 74 37 74 50 C 74 63 70 78 62 86 C 58 90 54 92 50 92 C 46 92 42 90 38 86 C 30 78 26 63 26 50 C 26 37 37 29 50 30 Z"
                                fill="url(#wf-head)" filter="url(#wf-glow)"/>
                              <ellipse cx="24" cy="74" rx="8" ry="6" fill="#b8b8c8" opacity="0.85"/>
                              <ellipse cx="76" cy="74" rx="8" ry="6" fill="#b8b8c8" opacity="0.85"/>

                              {/* ── Lower-cheek & jaw fur volume (jagged tufts, below eye-level) ── */}
                              {/* LEFT — upper jaw tuft */}
                              <path d="M 28 69 C 22 72 18 79 22 84 C 25 87 29 85 28 78 Z"
                                fill="url(#wf-head)" opacity="0.82" filter="url(#wf-glow)"/>
                              <path d="M 28 70 C 23 73 20 79 23 83 C 25 85 28 84 28 79 Z"
                                fill="rgba(178,190,218,0.36)"/>
                              {/* LEFT — lower jaw tuft */}
                              <path d="M 30 80 C 23 84 20 90 24 93 C 27 95 31 92 30 87 Z"
                                fill="url(#wf-head)" opacity="0.76" filter="url(#wf-glow)"/>
                              <path d="M 30 81 C 24 85 22 90 25 93 C 27 94 30 92 30 87 Z"
                                fill="rgba(178,190,218,0.28)"/>
                              {/* LEFT — fur direction strokes */}
                              <path d="M 21 74 C 19 78 19 83 21 86" stroke="rgba(202,214,238,0.44)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 20 82 C 18 87 19 91 21 93" stroke="rgba(196,210,234,0.34)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              <path d="M 24 87 C 23 90 23 93 25 95" stroke="rgba(190,204,230,0.26)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

                              {/* RIGHT — upper jaw tuft */}
                              <path d="M 72 69 C 78 72 82 79 78 84 C 75 87 71 85 72 78 Z"
                                fill="url(#wf-head)" opacity="0.82" filter="url(#wf-glow)"/>
                              <path d="M 72 70 C 77 73 80 79 77 83 C 75 85 72 84 72 79 Z"
                                fill="rgba(178,190,218,0.36)"/>
                              {/* RIGHT — lower jaw tuft */}
                              <path d="M 70 80 C 77 84 80 90 76 93 C 73 95 69 92 70 87 Z"
                                fill="url(#wf-head)" opacity="0.76" filter="url(#wf-glow)"/>
                              <path d="M 70 81 C 76 85 78 90 75 93 C 73 94 70 92 70 87 Z"
                                fill="rgba(178,190,218,0.28)"/>
                              {/* RIGHT — fur direction strokes */}
                              <path d="M 79 74 C 81 78 81 83 79 86" stroke="rgba(202,214,238,0.44)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 80 82 C 82 87 81 91 79 93" stroke="rgba(196,210,234,0.34)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              <path d="M 76 87 C 77 90 77 93 75 95" stroke="rgba(190,204,230,0.26)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

                              {/* Face silver mask */}
                              <path d="M 36 36 C 30 46 29 61 34 73 C 39 83 50 89 50 89 C 50 89 61 83 66 73 C 71 61 70 46 64 36 C 60 28 50 27 50 27 C 50 27 40 28 36 36 Z"
                                fill="url(#wf-face)" opacity="0.42"/>
                              {/* Head rim lights — follow updated contour */}
                              <path d="M 26 50 C 26 37 37 29 50 30" stroke="rgba(175,196,235,0.40)" strokeWidth="2.2" fill="none" strokeLinecap="round" filter="url(#wf-rim)"/>
                              <path d="M 74 50 C 74 37 63 29 50 30" stroke="rgba(175,196,235,0.32)" strokeWidth="2.2" fill="none" strokeLinecap="round" filter="url(#wf-rim)"/>
                              {/* Forehead fur strokes */}
                              <path d="M 40 34 C 44 30 50 28 56 30 C 59 31 61 33 63 35" stroke="rgba(225,233,252,0.32)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                              <path d="M 38 40 C 42 37 50 35 58 37 C 61 38 63 40 64 41" stroke="rgba(218,228,250,0.22)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                              {/* Eyebrow arcs — curious, intelligent */}
                              <path d="M 27 52 C 31 46 38 44 45 50" stroke="rgba(36,40,58,0.60)" strokeWidth="2.1" fill="none" strokeLinecap="round"/>
                              <path d="M 73 52 C 69 46 62 44 55 50" stroke="rgba(36,40,58,0.60)" strokeWidth="2.1" fill="none" strokeLinecap="round"/>

                              {/* ── L6: EYES (large anime/chibi glowing blue) ── */}
                              {/* LEFT EYE */}
                              <circle cx="36" cy="62" r="11.5" fill="rgba(4,10,36,0.92)" filter="url(#wf-eye-glow)"
                                style={{ animation: "ob-eye-glow 3s ease-in-out infinite" }}/>
                              <circle cx="36" cy="62" r="9.8"  fill="#010306"/>
                              <circle cx="36" cy="62" r="8.0"  fill="url(#wf-eye-iris)" filter="url(#wf-eye-glow)"
                                style={{ animation: "ob-eye-glow 3s ease-in-out 0.2s infinite" }}/>
                              <circle cx="36" cy="62" r="3.2"  fill="#04020A"/>
                              <ellipse cx="31.5" cy="57.5" rx="3.4" ry="2.6" fill="rgba(238,254,255,0.96)"/>
                              <circle cx="41.0" cy="67.5" r="1.8" fill="rgba(148,228,255,0.65)"/>
                              <circle cx="33.0" cy="59.5" r="1.0" fill="rgba(255,255,255,0.82)"/>
                              <circle cx="36" cy="62" r="8.0"  fill="none" stroke="rgba(0,64,195,0.38)" strokeWidth="1.0"/>
                              {/* RIGHT EYE */}
                              <circle cx="64" cy="62" r="11.5" fill="rgba(4,10,36,0.92)" filter="url(#wf-eye-glow)"
                                style={{ animation: "ob-eye-glow 3s ease-in-out 0.38s infinite" }}/>
                              <circle cx="64" cy="62" r="9.8"  fill="#010306"/>
                              <circle cx="64" cy="62" r="8.0"  fill="url(#wf-eye-iris)" filter="url(#wf-eye-glow)"
                                style={{ animation: "ob-eye-glow 3s ease-in-out 0.58s infinite" }}/>
                              <circle cx="64" cy="62" r="3.2"  fill="#04020A"/>
                              <ellipse cx="59.5" cy="57.5" rx="3.4" ry="2.6" fill="rgba(238,254,255,0.96)"/>
                              <circle cx="69.0" cy="67.5" r="1.8" fill="rgba(148,228,255,0.65)"/>
                              <circle cx="61.0" cy="59.5" r="1.0" fill="rgba(255,255,255,0.82)"/>
                              <circle cx="64" cy="62" r="8.0"  fill="none" stroke="rgba(0,64,195,0.38)" strokeWidth="1.0"/>

                              {/* ── L7: MUZZLE / SNOUT ── */}
                              {/* Depth shadow — 3-D protrusion */}
                              <ellipse cx="50" cy="82" rx="18" ry="12" fill="rgba(16,20,34,0.40)"/>
                              {/* Muzzle — tapered snout path, NOT a circle */}
                              <path d="M 32 76 C 32 68 40 62 50 62 C 60 62 68 68 68 76 C 68 86 62 94 50 96 C 38 94 32 86 32 76 Z"
                                fill="url(#wf-muzzle)"/>


                              {/* Muzzle top convex highlight */}
                              <ellipse cx="50" cy="68" rx="12" ry="5.5" fill="rgba(250,253,255,0.52)"/>
                              {/* Chin shadow */}
                              <path d="M 38 88 C 40 94 50 98 50 98 C 50 98 60 94 62 88 C 61 92 56 96 50 96 C 44 96 39 92 38 88 Z"
                                fill="rgba(150,162,190,0.32)"/>
                              {/* Philtrum */}
                              <line x1="50" y1="74" x2="50" y2="86" stroke="rgba(148,162,192,0.30)" strokeWidth="1.0" strokeLinecap="round"/>
                              {/* Wolf nose — wide inverted triangle */}
                              <path d="M 43 69 Q 50 63 57 69 Q 56 78 50 80 Q 44 78 43 69 Z" fill="#14101E"/>
                              <ellipse cx="46.5" cy="68" rx="3.0" ry="1.9" fill="rgba(255,255,255,0.34)"/>
                              <circle  cx="44.5" cy="66" r="1.1"           fill="rgba(255,255,255,0.22)"/>
                              {/* Whisker dots */}
                              <circle cx="33" cy="77"  r="1.1" fill="rgba(205,216,240,0.65)"/>
                              <circle cx="35" cy="81"  r="1.0" fill="rgba(205,216,240,0.55)"/>
                              <circle cx="37" cy="85"  r="0.9" fill="rgba(205,216,240,0.44)"/>
                              <circle cx="67" cy="77"  r="1.1" fill="rgba(205,216,240,0.65)"/>
                              <circle cx="65" cy="81"  r="1.0" fill="rgba(205,216,240,0.55)"/>
                              <circle cx="63" cy="85"  r="0.9" fill="rgba(205,216,240,0.44)"/>
                              {/* Smile — soft symmetrical 'w' curve, corners sweep gently up */}
                              <path d="M 43 87 Q 46.5 92 50 88.5 Q 53.5 92 57 87"
                                stroke="rgba(96,108,138,0.62)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

                              {/* ── L8: FOREGROUND HIGHLIGHTS ── */}
                              <ellipse cx="50" cy="36" rx="11" ry="6" fill="rgba(218,230,255,0.18)"/>


                            </g>


                          </svg>
                        </div>

                        {/* Selection dot */}
                        <div style={{
                          marginTop: 10, width: 16, height: 16, borderRadius: "50%",
                          border: `1.5px solid ${isSelected ? G : "rgba(201,168,76,0.30)"}`,
                          background: isSelected ? G : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                style={{ width: 6, height: 6, borderRadius: "50%", background: "#030204" }}/>
                            )}
                          </AnimatePresence>
                        </div>
                        <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: isSelected ? G : "#d0c8e0", fontFamily: "DM Sans, sans-serif" }}>
                          The Wolf
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(201,168,76,0.45)", textAlign: "center", padding: "0 8px", lineHeight: 1.3, marginTop: 2, fontFamily: "DM Sans, sans-serif" }}>
                          Gets stronger every day you hold the line
                        </p>
                      </motion.button>
                    );
                  })()}

                </div>
                <GoldButton disabled={!companion} onClick={next}>
                  {companion
                    ? <><span>{COMPANION_LABELS[companion].name} — let's go</span><ArrowRight size={16} /></>
                    : "Choose your companion"}
                </GoldButton>
              </div>
            )}

            {/* STEP 8 — Commitment */}
            {step === 8 && (
              <div>
                <Eyebrow step={9} total={TOTAL} />
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 8px" }}>
                  Your <SerifEm>commitment.</SerifEm>
                </h1>
                <p style={{ fontSize: 14, color: "#5a5040", marginBottom: 24, lineHeight: 1.5 }}>
                  Read it. Sign it. This is who you are now.
                </p>
                <div style={{
                  borderRadius: 16, border: `1px solid ${CARD_BORDER}`,
                  background: CARD_BG, padding: "20px", marginBottom: 24,
                }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "2px", color: "#5a5040", marginBottom: 8 }}>
                    Identity
                  </p>
                  <p style={{ fontSize: 18, lineHeight: 1.6, color: "#ddd", margin: 0 }}>
                    I am becoming someone who{" "}
                    <span style={{ color: G }}>{identity || "…"}</span>.
                  </p>
                </div>
                <label style={{ display: "block", fontSize: 13, color: "#5a5040", marginBottom: 8 }}>
                  Sign with your first name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  style={{
                    width: "100%", borderRadius: 16,
                    border: `1.5px solid ${CARD_BORDER}`,
                    background: CARD_BG, padding: "14px 16px",
                    fontSize: 18, color: "#fff",
                    fontFamily: "DM Sans, sans-serif",
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = G; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = CARD_BORDER; }}
                />
                <GoldButton disabled={!name.trim()} onClick={finish}>
                  {name.trim()
                    ? <><span>I commit to this</span><ArrowRight size={16} /></>
                    : "Sign your name"}
                </GoldButton>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

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

                          {/* Nebula atmosphere */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 70% 30%, rgba(40,20,100,0.35) 0%, transparent 55%)",
                              "radial-gradient(ellipse at 20% 70%, rgba(60,30,120,0.25) 0%, transparent 50%)",
                            ].join(", "),
                          }}/>

                          {/* Star field */}
                          {[
                            { x: 15, y: 12, r: 0.9 }, { x: 78, y: 8,  r: 1.1 }, { x: 88, y: 22, r: 0.8 },
                            { x: 8,  y: 35, r: 1.0 }, { x: 92, y: 48, r: 0.9 }, { x: 68, y: 18, r: 0.7 },
                            { x: 32, y: 14, r: 0.8 }, { x: 55, y: 6,  r: 1.2 }, { x: 82, y: 62, r: 0.8 },
                          ].map((s, i) => (
                            <div key={i} aria-hidden style={{
                              position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
                              width: s.r * 2, height: s.r * 2, borderRadius: "50%",
                              background: "rgba(200,210,255,0.75)",
                              boxShadow: "0 0 3px 1px rgba(180,200,255,0.50)",
                            }}/>
                          ))}

                          {/* Wolf SVG — fierce forward-facing wolf cub, full illustration */}
                          <svg width="100%" height="160" viewBox="0 0 100 160" fill="none" style={{ position: "absolute", inset: 0 }}>
                            <defs>
                              <linearGradient id="ob-wolf-fur" x1="20" y1="30" x2="80" y2="155" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#c8c0b0"/>
                                <stop offset="40%"  stopColor="#888070"/>
                                <stop offset="80%"  stopColor="#504840"/>
                                <stop offset="100%" stopColor="#282018"/>
                              </linearGradient>
                              <linearGradient id="ob-wolf-fur-light" x1="35" y1="30" x2="65" y2="90" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"  stopColor="#e0d8c8"/>
                                <stop offset="100%" stopColor="#a89880"/>
                              </linearGradient>
                              <radialGradient id="ob-eye-l" cx="50%" cy="40%" r="52%">
                                <stop offset="0%"  stopColor="#80dfff"/>
                                <stop offset="40%" stopColor="#28a8f0"/>
                                <stop offset="100%" stopColor="#0050c0"/>
                              </radialGradient>
                              <radialGradient id="ob-orb-g" cx="38%" cy="38%" r="55%">
                                <stop offset="0%"  stopColor="#c0e8ff"/>
                                <stop offset="50%" stopColor="#4090e0"/>
                                <stop offset="100%" stopColor="#1040a0"/>
                              </radialGradient>
                              <filter id="ob-eye-glow-f" x="-80%" y="-80%" width="260%" height="260%">
                                <feGaussianBlur stdDeviation="2.5" result="b"/>
                                <feFlood floodColor="#28b0ff" floodOpacity="1.0" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-orb-glow-f" x="-100%" y="-100%" width="300%" height="300%">
                                <feGaussianBlur stdDeviation="3.0" result="b"/>
                                <feFlood floodColor="#4090ff" floodOpacity="0.90" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-wolf-glow-f" x="-10%" y="-10%" width="120%" height="120%">
                                <feGaussianBlur stdDeviation="2.5" result="b"/>
                                <feFlood floodColor="#6050a0" floodOpacity="0.30" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                            </defs>

                            {/* Left ear */}
                            <path d="M32 68 L26 42 L44 60 Z" fill="url(#ob-wolf-fur)" filter="url(#ob-wolf-glow-f)"/>
                            <path d="M33 66 L28 48 L40 61 Z" fill="rgba(180,160,140,0.30)"/>
                            {/* Right ear */}
                            <path d="M68 68 L74 42 L56 60 Z" fill="url(#ob-wolf-fur)" filter="url(#ob-wolf-glow-f)"/>
                            <path d="M67 66 L72 48 L60 61 Z" fill="rgba(180,160,140,0.30)"/>

                            {/* Head — broad cub skull */}
                            <path d="M30 68 Q22 74 22 84 Q22 96 28 102 Q34 108 42 110 Q50 112 58 110 Q66 108 72 102 Q78 96 78 84 Q78 74 70 68 Q62 62 50 62 Q38 62 30 68 Z"
                              fill="url(#ob-wolf-fur)" filter="url(#ob-wolf-glow-f)"/>

                            {/* Lighter face mask — forehead to muzzle */}
                            <path d="M38 68 Q50 64 62 68 Q68 76 66 88 Q64 98 58 104 Q54 108 50 109 Q46 108 42 104 Q36 98 34 88 Q32 76 38 68 Z"
                              fill="url(#ob-wolf-fur-light)" opacity="0.55"/>

                            {/* Forehead fur detail */}
                            <path d="M42 70 Q50 67 58 70" stroke="rgba(220,210,195,0.35)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                            <path d="M40 75 Q50 71 60 75" stroke="rgba(220,210,195,0.25)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>

                            {/* Brow furrows — fierce */}
                            <path d="M34 76 Q38 72 42 76" stroke="rgba(40,30,20,0.60)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                            <path d="M66 76 Q62 72 58 76" stroke="rgba(40,30,20,0.60)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>

                            {/* LEFT EYE — glowing neon-blue cosmic */}
                            <circle cx="38" cy="82" r="6.5" fill="#060a14" filter="url(#ob-eye-glow-f)" style={{ animation: "ob-eye-glow 2.4s ease-in-out infinite" }}/>
                            <circle cx="38" cy="82" r="5.5" fill="url(#ob-eye-l)" filter="url(#ob-eye-glow-f)" style={{ animation: "ob-eye-glow 2.4s ease-in-out 0.2s infinite" }}/>
                            <ellipse cx="38" cy="82" rx="2.2" ry="3.0" fill="#020408"/>
                            <circle cx="36.5" cy="80.5" r="1.2" fill="rgba(220,240,255,0.80)"/>
                            <circle cx="40.0" cy="83.5" r="0.6" fill="rgba(180,220,255,0.50)"/>

                            {/* RIGHT EYE */}
                            <circle cx="62" cy="82" r="6.5" fill="#060a14" filter="url(#ob-eye-glow-f)" style={{ animation: "ob-eye-glow 2.4s ease-in-out 0.4s infinite" }}/>
                            <circle cx="62" cy="82" r="5.5" fill="url(#ob-eye-l)" filter="url(#ob-eye-glow-f)" style={{ animation: "ob-eye-glow 2.4s ease-in-out 0.6s infinite" }}/>
                            <ellipse cx="62" cy="82" rx="2.2" ry="3.0" fill="#020408"/>
                            <circle cx="60.5" cy="80.5" r="1.2" fill="rgba(220,240,255,0.80)"/>
                            <circle cx="63.8" cy="83.5" r="0.6" fill="rgba(180,220,255,0.50)"/>

                            {/* Nose bridge */}
                            <line x1="50" y1="87" x2="50" y2="97" stroke="rgba(80,60,40,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
                            {/* Nose */}
                            <path d="M44 97 Q50 101 56 97 Q54 105 50 106 Q46 105 44 97 Z" fill="#1a1008" opacity="0.90"/>
                            <ellipse cx="47" cy="98" rx="2.0" ry="1.2" fill="rgba(255,255,255,0.22)"/>

                            {/* Muzzle cheeks */}
                            <ellipse cx="37" cy="97" rx="7" ry="5" fill="url(#ob-wolf-fur-light)" opacity="0.40"/>
                            <ellipse cx="63" cy="97" rx="7" ry="5" fill="url(#ob-wolf-fur-light)" opacity="0.40"/>

                            {/* Chin fur lines */}
                            <path d="M44 104 Q50 108 56 104" stroke="rgba(180,165,145,0.35)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                            <path d="M46 107 Q50 110 54 107" stroke="rgba(180,165,145,0.25)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>

                            {/* Body / chest */}
                            <path d="M28 102 Q22 112 24 128 Q26 142 34 150 Q42 158 50 158 Q58 158 66 150 Q74 142 76 128 Q78 112 72 102 Q64 108 50 109 Q36 108 28 102 Z"
                              fill="url(#ob-wolf-fur)" filter="url(#ob-wolf-glow-f)" opacity="0.90"/>

                            {/* Chest lighter fur */}
                            <path d="M36 108 Q50 112 64 108 Q66 122 64 136 Q58 148 50 152 Q42 148 36 136 Q34 122 36 108 Z"
                              fill="url(#ob-wolf-fur-light)" opacity="0.38"/>

                            {/* Chest fur texture lines */}
                            <path d="M40 116 Q50 114 60 116" stroke="rgba(220,210,195,0.22)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                            <path d="M38 124 Q50 122 62 124" stroke="rgba(220,210,195,0.18)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                            <path d="M40 132 Q50 130 60 132" stroke="rgba(220,210,195,0.15)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>

                            {/* Floating magical orb near right ear */}
                            <circle cx="78" cy="52" r="6.5" fill="url(#ob-orb-g)"
                              filter="url(#ob-orb-glow-f)"
                              style={{ animation: "ob-orb-pulse 2.8s ease-in-out infinite" }}/>
                            <circle cx="78" cy="52" r="6.5" fill="none" stroke="rgba(140,200,255,0.55)" strokeWidth="0.8"/>
                            <circle cx="76" cy="50" r="2.0" fill="rgba(220,240,255,0.65)"/>
                            {/* Orb sparkle trails */}
                            <circle cx="72" cy="44" r="1.4" fill="rgba(100,180,255,0.50)" style={{ animation: "ob-orb-pulse 2.8s ease-in-out 0.5s infinite" }}/>
                            <circle cx="83" cy="46" r="1.0" fill="rgba(100,180,255,0.40)" style={{ animation: "ob-orb-pulse 2.8s ease-in-out 1.0s infinite" }}/>
                            <circle cx="86" cy="58" r="0.8" fill="rgba(100,180,255,0.35)" style={{ animation: "ob-orb-pulse 2.8s ease-in-out 1.4s infinite" }}/>

                            {/* Ground shadow */}
                            <ellipse cx="50" cy="158" rx="22" ry="4" fill="rgba(40,30,80,0.45)"/>
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

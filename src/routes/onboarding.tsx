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

                          {/* Wolf pup SVG — cute, silver-grey, friendly & intelligent */}
                          <svg width="100%" height="160" viewBox="0 0 100 160" fill="none" style={{ position: "absolute", inset: 0 }}>
                            <defs>
                              {/* ── Silver-grey wolf pup fur gradients ── */}
                              <linearGradient id="ob-wf-dark" x1="50" y1="20" x2="50" y2="160" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#9098aa"/>
                                <stop offset="35%"  stopColor="#585e6e"/>
                                <stop offset="70%"  stopColor="#2e3240"/>
                                <stop offset="100%" stopColor="#12141c"/>
                              </linearGradient>
                              <linearGradient id="ob-wf-mid" x1="50" y1="90" x2="50" y2="160" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#b8c0d0"/>
                                <stop offset="50%"  stopColor="#788090"/>
                                <stop offset="100%" stopColor="#48505e"/>
                              </linearGradient>
                              <linearGradient id="ob-wf-light" x1="50" y1="70" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#e8eef8"/>
                                <stop offset="100%" stopColor="#bec8d8"/>
                              </linearGradient>
                              <linearGradient id="ob-wf-silver" x1="40" y1="60" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                                <stop offset="0%"   stopColor="#dce4f0"/>
                                <stop offset="55%"  stopColor="#a8b0c0"/>
                                <stop offset="100%" stopColor="#687080"/>
                              </linearGradient>
                              <radialGradient id="ob-wf-cheek" cx="50%" cy="50%" r="55%">
                                <stop offset="0%"   stopColor="#dde4f0"/>
                                <stop offset="100%" stopColor="#9098a8"/>
                              </radialGradient>
                              {/* ── Eye gradients ── */}
                              <radialGradient id="ob-wf-eye" cx="38%" cy="35%" r="55%">
                                <stop offset="0%"   stopColor="#a8eeff"/>
                                <stop offset="35%"  stopColor="#30b8f8"/>
                                <stop offset="70%"  stopColor="#0870d0"/>
                                <stop offset="100%" stopColor="#003888"/>
                              </radialGradient>
                              <radialGradient id="ob-wf-orb" cx="35%" cy="35%" r="58%">
                                <stop offset="0%"   stopColor="#d0eeff"/>
                                <stop offset="45%"  stopColor="#5098e8"/>
                                <stop offset="100%" stopColor="#1048a8"/>
                              </radialGradient>
                              {/* ── Glow filters ── */}
                              <filter id="ob-wf-body-glow" x="-8%" y="-8%" width="116%" height="116%">
                                <feGaussianBlur stdDeviation="2.8" result="b"/>
                                <feFlood floodColor="#5040a0" floodOpacity="0.28" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-wf-eye-glow" x="-120%" y="-120%" width="340%" height="340%">
                                <feGaussianBlur stdDeviation="3.0" result="b"/>
                                <feFlood floodColor="#20a8ff" floodOpacity="1.0" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-wf-orb-glow" x="-140%" y="-140%" width="380%" height="380%">
                                <feGaussianBlur stdDeviation="4.0" result="b"/>
                                <feFlood floodColor="#3080ff" floodOpacity="0.95" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                              <filter id="ob-wf-rim" x="-5%" y="-5%" width="110%" height="110%">
                                <feGaussianBlur stdDeviation="1.0" result="b"/>
                                <feFlood floodColor="#c0b8e8" floodOpacity="0.40" result="c"/>
                                <feComposite in="c" in2="b" operator="in" result="g"/>
                                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                              </filter>
                            </defs>

                            {/* ── Ground ambient glow ── */}
                            <ellipse cx="50" cy="154" rx="28" ry="6" fill="rgba(60,30,120,0.35)"/>
                            <ellipse cx="50" cy="156" rx="18" ry="3.5" fill="rgba(40,20,90,0.50)"/>

                            {/* ── TAIL — fluffy, curled to the right, resting behind body ── */}
                            <path d="M62 136 Q80 128 88 116 Q94 104 88 92 Q84 86 76 90 Q83 98 80 110 Q76 124 62 132"
                              stroke="url(#ob-wf-dark)" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#ob-wf-body-glow)"/>
                            <path d="M62 136 Q80 128 88 116 Q94 104 88 92 Q84 86 76 90 Q83 98 80 110 Q76 124 62 132"
                              stroke="url(#ob-wf-silver)" strokeWidth="5.5" strokeLinecap="round" fill="none" opacity="0.55"/>
                            {/* Fluffy tail tip highlight */}
                            <path d="M86 94 Q84 87 76 90"
                              stroke="rgba(218,228,244,0.65)" strokeWidth="3" strokeLinecap="round" fill="none"/>

                            {/* ── BODY — chubby seated pup body ── */}
                            <path d="M26 128 Q22 114 24 104 Q28 96 40 94 Q50 92 60 94 Q72 96 76 104 Q78 114 74 128 Q70 150 50 154 Q30 150 26 128 Z"
                              fill="url(#ob-wf-dark)" filter="url(#ob-wf-body-glow)" opacity="0.93"/>
                            {/* Chest pale fur panel */}
                            <path d="M36 98 Q50 94 64 98 Q66 116 64 134 Q58 152 50 154 Q42 152 36 134 Q34 116 36 98 Z"
                              fill="url(#ob-wf-light)" opacity="0.42"/>
                            {/* Chest fur strokes */}
                            <path d="M38 102 Q50 98 62 102" stroke="rgba(232,238,248,0.30)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                            <path d="M37 110 Q50 106 63 110" stroke="rgba(228,234,244,0.22)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                            <path d="M38 118 Q50 114 62 118" stroke="rgba(224,230,240,0.17)" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
                            <path d="M39 126 Q50 122 61 126" stroke="rgba(220,226,236,0.13)" strokeWidth="0.70" fill="none" strokeLinecap="round"/>

                            {/* ── FRONT PAWS ── */}
                            <path d="M32 148 Q28 144 26 150 Q28 156 34 156 Q40 156 40 150 Q38 146 32 148 Z"
                              fill="url(#ob-wf-mid)" opacity="0.88"/>
                            <path d="M68 148 Q72 144 74 150 Q72 156 66 156 Q60 156 60 150 Q62 146 68 148 Z"
                              fill="url(#ob-wf-mid)" opacity="0.88"/>
                            {/* Paw toe lines */}
                            <path d="M29 152 Q31 155 33 152" stroke="rgba(180,190,205,0.55)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                            <path d="M33 153 Q35 156 37 153" stroke="rgba(180,190,205,0.48)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                            <path d="M71 152 Q69 155 67 152" stroke="rgba(180,190,205,0.55)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                            <path d="M67 153 Q65 156 63 153" stroke="rgba(180,190,205,0.48)" strokeWidth="0.8" fill="none" strokeLinecap="round"/>

                            {/* ── NECK — connects head to body ── */}
                            <ellipse cx="50" cy="104" rx="16" ry="9" fill="url(#ob-wf-dark)" filter="url(#ob-wf-body-glow)"/>

                            {/* ── LEFT EAR — tall, sharply pointed wolf ear ── */}
                            <path d="M30 68 L18 32 L46 60 Z"
                              fill="url(#ob-wf-dark)" filter="url(#ob-wf-body-glow)" stroke="rgba(155,165,192,0.30)" strokeWidth="0.7"/>
                            <path d="M31 67 L22 40 L43 60 Z" fill="rgba(185,178,200,0.28)"/>
                            {/* Inner ear — warm pink */}
                            <path d="M33 65 L26 48 L41 61 Z" fill="rgba(215,155,148,0.24)"/>
                            {/* Ear fur tuft */}
                            <path d="M24 50 Q27 42 30 50" stroke="rgba(205,212,230,0.38)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

                            {/* ── RIGHT EAR — tall, sharply pointed wolf ear ── */}
                            <path d="M70 68 L82 32 L54 60 Z"
                              fill="url(#ob-wf-dark)" filter="url(#ob-wf-body-glow)" stroke="rgba(155,165,192,0.30)" strokeWidth="0.7"/>
                            <path d="M69 67 L78 40 L57 60 Z" fill="rgba(185,178,200,0.28)"/>
                            <path d="M67 65 L74 48 L59 61 Z" fill="rgba(215,155,148,0.24)"/>
                            <path d="M76 50 Q73 42 70 50" stroke="rgba(205,212,230,0.38)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

                            {/* ── HEAD — big round pup head ── */}
                            <ellipse cx="50" cy="79" rx="27" ry="23" fill="url(#ob-wf-dark)" filter="url(#ob-wf-body-glow)"/>
                            {/* Face silver mask */}
                            <ellipse cx="50" cy="83" rx="21" ry="19" fill="url(#ob-wf-silver)" opacity="0.50"/>
                            {/* Rim lighting */}
                            <path d="M29 75 Q23 82 23 90 Q23 98 27 104"
                              stroke="rgba(180,192,224,0.35)" strokeWidth="1.8" strokeLinecap="round" fill="none" filter="url(#ob-wf-rim)"/>
                            <path d="M71 75 Q77 82 77 90 Q77 98 73 104"
                              stroke="rgba(180,192,224,0.30)" strokeWidth="1.8" strokeLinecap="round" fill="none" filter="url(#ob-wf-rim)"/>
                            {/* Forehead fur strokes */}
                            <path d="M41 63 Q50 59 59 63" stroke="rgba(228,234,248,0.28)" strokeWidth="1.0" fill="none" strokeLinecap="round"/>
                            <path d="M39 70 Q50 65 61 70" stroke="rgba(224,230,244,0.20)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                            {/* Soft raised brows — curious, intelligent expression */}
                            <path d="M29 73 Q38 68 44 73" stroke="rgba(44,50,68,0.62)" strokeWidth="1.7" fill="none" strokeLinecap="round"/>
                            <path d="M71 73 Q62 68 56 73" stroke="rgba(44,50,68,0.62)" strokeWidth="1.7" fill="none" strokeLinecap="round"/>

                            {/* ── LARGE GLOWING BLUE EYES — round & friendly ── */}
                            {/* LEFT EYE */}
                            <circle cx="38" cy="78" r="9.5" fill="rgba(8,16,42,0.95)" filter="url(#ob-wf-eye-glow)"
                              style={{ animation: "ob-eye-glow 2.8s ease-in-out infinite" }}/>
                            <circle cx="38" cy="78" r="8.0" fill="#03060f"/>
                            <circle cx="38" cy="78" r="6.8" fill="url(#ob-wf-eye)" filter="url(#ob-wf-eye-glow)"
                              style={{ animation: "ob-eye-glow 2.8s ease-in-out 0.15s infinite" }}/>
                            {/* Round pupil — friendly, not slit */}
                            <circle cx="38" cy="78" r="2.6" fill="#010205"/>
                            <circle cx="35.5" cy="75.5" r="2.2" fill="rgba(230,248,255,0.92)"/>
                            <circle cx="41.2" cy="80.8" r="1.0" fill="rgba(180,230,255,0.58)"/>
                            <circle cx="38" cy="78" r="6.8" fill="none" stroke="rgba(0,78,175,0.45)" strokeWidth="0.8"/>

                            {/* RIGHT EYE */}
                            <circle cx="62" cy="78" r="9.5" fill="rgba(8,16,42,0.95)" filter="url(#ob-wf-eye-glow)"
                              style={{ animation: "ob-eye-glow 2.8s ease-in-out 0.3s infinite" }}/>
                            <circle cx="62" cy="78" r="8.0" fill="#03060f"/>
                            <circle cx="62" cy="78" r="6.8" fill="url(#ob-wf-eye)" filter="url(#ob-wf-eye-glow)"
                              style={{ animation: "ob-eye-glow 2.8s ease-in-out 0.45s infinite" }}/>
                            <circle cx="62" cy="78" r="2.6" fill="#010205"/>
                            <circle cx="59.5" cy="75.5" r="2.2" fill="rgba(230,248,255,0.92)"/>
                            <circle cx="65.2" cy="80.8" r="1.0" fill="rgba(180,230,255,0.58)"/>
                            <circle cx="62" cy="78" r="6.8" fill="none" stroke="rgba(0,78,175,0.45)" strokeWidth="0.8"/>

                            {/* ── MUZZLE — pronounced wolf snout projecting forward ── */}
                            {/* Muzzle mass */}
                            <ellipse cx="50" cy="97" rx="14" ry="10" fill="url(#ob-wf-cheek)" opacity="0.85"/>
                            {/* Lighter muzzle center */}
                            <ellipse cx="50" cy="98" rx="10.5" ry="7" fill="rgba(225,232,246,0.55)"/>
                            {/* Snout bridge connecting to brow */}
                            <path d="M46 88 Q50 84 54 88 L53 95 Q51 98 50 98 Q49 98 47 95 Z"
                              fill="rgba(200,210,228,0.40)"/>

                            {/* ── NOSE — wide, defined wolf nose ── */}
                            <path d="M44 91 Q50 97 56 91 Q54 101 50 103 Q46 101 44 91 Z"
                              fill="#0a0810" opacity="0.96"/>
                            <ellipse cx="47" cy="92" rx="2.8" ry="1.5" fill="rgba(255,255,255,0.22)"/>
                            {/* Philtrum */}
                            <line x1="50" y1="97" x2="50" y2="104" stroke="rgba(44,34,24,0.40)" strokeWidth="1.2" strokeLinecap="round"/>

                            {/* ── WHISKER DOTS ── */}
                            <circle cx="36" cy="94"  r="1.0" fill="rgba(212,220,236,0.58)"/>
                            <circle cx="38" cy="97"  r="1.0" fill="rgba(212,220,236,0.52)"/>
                            <circle cx="40" cy="100" r="0.9" fill="rgba(212,220,236,0.44)"/>
                            <circle cx="64" cy="94"  r="1.0" fill="rgba(212,220,236,0.58)"/>
                            <circle cx="62" cy="97"  r="1.0" fill="rgba(212,220,236,0.52)"/>
                            <circle cx="60" cy="100" r="0.9" fill="rgba(212,220,236,0.44)"/>

                            {/* ── Magical orb — floating beside right ear ── */}
                            <circle cx="80" cy="50" r="8.0" fill="url(#ob-wf-orb)"
                              filter="url(#ob-wf-orb-glow)"
                              style={{ animation: "ob-orb-pulse 3.2s ease-in-out infinite" }}/>
                            <circle cx="80" cy="50" r="8.0" fill="none" stroke="rgba(160,210,255,0.60)" strokeWidth="0.9"/>
                            {/* Orb inner shimmer */}
                            <circle cx="77.5" cy="47.5" r="2.8" fill="rgba(230,248,255,0.70)"/>
                            <circle cx="81.5" cy="52.5" r="1.2" fill="rgba(160,210,255,0.45)"/>
                            {/* Orb trailing sparks */}
                            <circle cx="74" cy="40"  r="1.8" fill="rgba(120,190,255,0.55)" style={{ animation: "ob-orb-pulse 3.2s ease-in-out 0.6s infinite" }}/>
                            <circle cx="86" cy="43"  r="1.4" fill="rgba(100,170,255,0.45)" style={{ animation: "ob-orb-pulse 3.2s ease-in-out 1.1s infinite" }}/>
                            <circle cx="88" cy="58"  r="1.0" fill="rgba(90,160,255,0.38)"  style={{ animation: "ob-orb-pulse 3.2s ease-in-out 1.7s infinite" }}/>
                            <circle cx="71" cy="57"  r="1.2" fill="rgba(110,180,255,0.42)" style={{ animation: "ob-orb-pulse 3.2s ease-in-out 0.4s infinite" }}/>

                            {/* ── Ambient body rim glow from orb ── */}
                            <path d="M68 74 Q74 68 78 58" stroke="rgba(80,160,255,0.15)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#ob-wf-eye-glow)"/>
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppState, NotificationStyle, NotificationApp, type Addiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { CompanionStage, COMPANION_LABELS, type CompanionType } from "@/components/avatars/CompanionAvatar";
import wolfStage2Url from "@/assets/wolf-stage2-transparent.png";
import treeStage3YoungUrl from "@/assets/tree-stage3-young.png";
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
                            "repeating-linear-gradient(-48deg, transparent, transparent 3px, rgba(20,40,25,0.06) 3px, rgba(20,40,25,0.06) 4px)",
                            "radial-gradient(ellipse at 30% 60%, rgba(8,28,14,0.45) 0%, transparent 65%)",
                            "linear-gradient(160deg, rgba(4,10,5,0.98) 0%, rgba(2,6,3,1) 100%)",
                          ].join(", "),
                        }}
                      >
                        {/* Subtle card ambient halo when selected */}
                        {isSelected && (
                          <div aria-hidden style={{
                            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                            background: "radial-gradient(ellipse at 50% 45%, rgba(40,120,50,0.14) 0%, transparent 70%)",
                            animation: "ob-card-halo 3.8s ease-in-out infinite",
                          }}/>
                        )}

                        {/* ── Illustration area ── */}
                        <div style={{ width: "100%", height: 160, position: "relative", overflow: "hidden" }}>

                          {/* Deep midnight-green nebula base — mirrors Wolf card night sky */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 50% 55%, rgba(18,55,28,0.55) 0%, rgba(8,28,12,0.45) 38%, transparent 68%)",
                              "radial-gradient(ellipse at 15% 20%, rgba(20,60,30,0.30) 0%, transparent 48%)",
                              "radial-gradient(ellipse at 85% 15%, rgba(10,40,18,0.28) 0%, transparent 42%)",
                              "linear-gradient(180deg, rgba(3,8,5,0.95) 0%, rgba(4,12,6,0.88) 50%, rgba(2,6,3,0.98) 100%)",
                            ].join(", "),
                          }}/>

                          {/* Cosmic dust haze — green tint to match forest atmosphere */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: [
                              "radial-gradient(ellipse at 30% 40%, rgba(30,80,40,0.14) 0%, transparent 50%)",
                              "radial-gradient(ellipse at 75% 65%, rgba(15,50,25,0.12) 0%, transparent 45%)",
                            ].join(", "),
                          }}/>

                          {/* Twinkling star field — same positions as Wolf card */}
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
                              background: i % 5 === 0 ? "rgba(180,220,190,0.90)" : "rgba(210,230,215,0.85)",
                              opacity: s.o,
                              boxShadow: i % 4 === 0
                                ? `0 0 ${s.r * 4}px ${s.r}px rgba(150,210,160,0.55)`
                                : `0 0 ${s.r * 3}px ${s.r * 0.5}px rgba(190,220,200,0.40)`,
                            }}/>
                          ))}

                          {/* Tree — Young stage, bottom-anchored inside the green glow */}
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                            <img
                              src={treeStage3YoungUrl}
                              alt="Young Tree"
                              style={{
                                height: "115%",
                                width: "auto",
                                objectFit: "contain",
                                objectPosition: "center bottom",
                              }}
                            />
                          </div>
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

                          {/* Wolf — Stage 2 Juvenile, bottom-anchored inside the purple glow */}
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                            <img
                              src={wolfStage2Url}
                              alt="Juvenile Wolf"
                              style={{
                                height: "115%",
                                width: "auto",
                                objectFit: "contain",
                                objectPosition: "center bottom",
                              }}
                            />
                          </div>
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

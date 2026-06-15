import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, Flame, Brain, TrendingUp, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppState, dayCount, activeAddiction } from "@/lib/store";
import { getReframe } from "@/lib/reframe";
import { useSheetDismiss } from "@/lib/sheetGesture";
import { hapticWarning, hapticSuccess } from "@/lib/haptics";

const GOLD   = "#C9A84C";
const RED    = "#E05A42";
const GREEN  = "#3fbb80";
const WHITE  = "#f0ece4";
const MUTED  = "rgba(255,255,255,0.38)";
const BG     = "#0a0806";

const TRIGGER_META = [
  { id: "stressed", emoji: "🧠", glow: "#9333EA" },
  { id: "bored",    emoji: "🥱", glow: "#3B82F6" },
  { id: "alone",    emoji: "🌑", glow: "#6366F1" },
  { id: "late",     emoji: "🌌", glow: "#0EA5E9" },
  { id: "online",   emoji: "📱", glow: "#F97316" },
  { id: "unknown",  emoji: "❓", glow: "#C9A84C" },
];

const FALLBACK_REFRAMES = [
  "Your brain followed a well-worn path under pressure. That's not weakness — it's neuroscience. The circuit exists; your job now is to interrupt it earlier next time. Write down the exact moment you could have chosen differently, then close this app and change your environment.",
  "A relapse is information, not a verdict. You now know which condition broke your resistance. Most people who successfully quit do so after multiple attempts — the difference is they analyzed each one. Identify the 60-second window before the decision and plan specifically for it.",
  "The streak was real and it still counts toward your recovery trajectory. One event doesn't erase the receptor sensitivity you've rebuilt. Right now, do something physically demanding for 10 minutes — this interrupts the dopamine cycle and prevents the 'I already failed' spiral.",
];

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return "late night (after midnight)";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "late night";
}

function highlightText(text: string): React.ReactNode {
  const parts = text.split(/(neuroscience|dopamine)/gi);
  return parts.map((part, i) =>
    /^(neuroscience|dopamine)$/i.test(part) ? (
      <span key={i} style={{ color: GOLD, fontWeight: 600 }}>{part}</span>
    ) : part
  );
}

const spring = { type: "spring" as const, stiffness: 340, damping: 28 };
const fadeUp = {
  hidden:  { opacity: 0, y: 18, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: spring },
  exit:    { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.18 } },
};

interface Props { onClose: () => void; totalCleanDays: number; }
type Step = "confirm" | "trigger_select" | "ai_reframe" | "done";

export function RelapseModal({ onClose, totalCleanDays }: Props) {
  const { t } = useTranslation();
  const [state, update] = useAppState();
  // HARD dismiss tier: this sheet can hold an AI-written reframe the user is
  // reading — a casual scroll must never throw it away. The sheet only drags
  // when the content is scrolled to the top AND the pull is deliberate.
  const { y: sheetY, sheetRef, scrollRef } = useSheetDismiss(onClose, { hard: true });
  const [step, setStep]           = useState<Step>("confirm");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [reframeText, setReframeText] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [didReset, setDidReset]   = useState(false);
  const [loggedDay, setLoggedDay] = useState(0);

  const TRIGGERS = TRIGGER_META.map(({ id, emoji, glow }) => ({
    id, emoji, glow, label: t(`relapse.trigger.${id}`),
  }));

  const active          = activeAddiction(state);
  const streakDay       = active?.startDate ? dayCount(active.startDate) : 1;
  // Generic fallback — the modal is habit-agnostic, so never assume a specific
  // habit here. `active` only resolves to undefined when there are no addictions
  // (shouldn't happen post-onboarding); "this habit" keeps the AI reframe neutral.
  const addictionName   = active?.name ?? "this habit";
  const onboardingTriggers = state.onboarding?.triggers ?? [];

  // ── 3-strike system ───────────────────────────────────────────────────────
  // Slips 1 & 2 keep the counter (with an honest heads-up). The 3rd slip this
  // streak resets the counter to 0 — told straight, but framed so they keep going.
  const priorStrikes = active?.startDate
    ? state.relapses.filter((r) => r.ts >= active.startDate).length
    : 0;
  const thisStrike   = priorStrikes + 1;       // the slip about to be logged
  const willReset    = thisStrike >= 3;        // 3rd slip resets

  // Each step starts at its top — the reframe especially must be readable
  // from the first line (it previously opened mid-text on tall content)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const logRelapse = () => {
    hapticWarning(); // logging a relapse is a heavy moment — acknowledge it
    setLoggedDay(streakDay);
    setDidReset(willReset);
    update((s) => {
      const now = Date.now();
      const act = activeAddiction(s);
      const prior = act?.startDate ? s.relapses.filter((r) => r.ts >= act.startDate).length : 0;
      const reset = prior + 1 >= 3;
      return {
        relapses: [...s.relapses, { ts: now, reframeShown: true }],
        ...(reset && act
          ? { addictions: s.addictions.map((a) => (a.id === act.id ? { ...a, startDate: now + 1 } : a)) }
          : {}),
      };
    });
    setStep("trigger_select");
  };

  const handleTriggerSelect = async (triggerId: string) => {
    const trigger = TRIGGERS.find((t) => t.id === triggerId)?.label ?? triggerId;
    setSelectedTrigger(trigger);
    setLoading(true);
    setStep("ai_reframe");
    try {
      const result = await getReframe({ data: { trigger, onboardingTriggers, streakDay, addictionName, timeOfDay: getTimeOfDay() } });
      setReframeText(result.text);
    } catch {
      setReframeText(FALLBACK_REFRAMES[Math.floor(Math.random() * FALLBACK_REFRAMES.length)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <motion.div
        ref={sheetRef}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        style={{ y: sheetY, width: "100%", maxWidth: 480 }}
      >
        {/* Grab handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.22)" }} />
        </div>
      {/* Inner scroller — long reframes scroll here instead of fighting the
          dismiss gesture; capped below the notch so the top is always readable */}
      <div
        ref={scrollRef}
        style={{
          maxHeight: "calc(100dvh - env(safe-area-inset-top) - 72px)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          borderRadius: "28px 28px 0 0",
        }}
      >
      <AnimatePresence mode="wait">
        {step === "confirm" && (
          <motion.div key="confirm" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            style={{ ...MODAL_BASE, overflow: "hidden" }}
          >
            {/* Red top glow */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "80%", height: 120, borderRadius: "0 0 60% 60%",
              background: "radial-gradient(ellipse at 50% 0%, rgba(220,60,40,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <button onClick={onClose} style={CLOSE_BTN}><X size={16} /></button>

            <div style={{ position: "relative" }}>
              {/* Flame icon */}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(220,60,40,0.18) 0%, transparent 70%)",
                border: "1px solid rgba(220,60,40,0.30)",
                boxShadow: "0 0 40px 8px rgba(200,50,30,0.20)",
                display: "grid", placeItems: "center",
                marginBottom: 22,
              }}>
                <Flame size={28} style={{ color: RED }} />
              </div>

              <h2 style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: 26, fontWeight: 700, color: WHITE,
                margin: "0 0 10px", lineHeight: 1.2,
              }}>
                {t("relapse.confirm.title")}
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>
                {t("relapse.confirm.body").split("—")[0].trimEnd()}{" "}—{" "}
                <span style={{ color: "rgba(255,255,255,0.65)" }}>{t("relapse.confirm.body").split("—")[1]?.trimStart()}</span>
              </p>

              {/* ── Honest 3-strike heads-up ── */}
              <div style={{
                marginTop: 20, padding: "12px 14px", borderRadius: 14,
                background: willReset ? "rgba(220,70,50,0.10)" : "rgba(201,168,76,0.07)",
                border: `1px solid ${willReset ? "rgba(220,70,50,0.35)" : "rgba(201,168,76,0.22)"}`,
              }}>
                {/* Strike dots */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: n <= thisStrike ? (willReset ? RED : GOLD) : "rgba(255,255,255,0.14)",
                      boxShadow: n <= thisStrike ? `0 0 8px ${willReset ? "rgba(220,70,50,0.6)" : "rgba(201,168,76,0.5)"}` : "none",
                    }} />
                  ))}
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: willReset ? RED : GOLD, marginLeft: 4 }}>
                    Slip {Math.min(thisStrike, 3)} of 3
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.6, margin: 0 }}>
                  {willReset
                    ? <>This is your <span style={{ color: WHITE, fontWeight: 600 }}>3rd slip</span> this streak — so we keep our promise to be straight with you: logging it <span style={{ color: WHITE, fontWeight: 600 }}>resets your counter to zero</span>. No hiding it.</>
                    : <>Your <span style={{ color: WHITE, fontWeight: 600 }}>{streakDay}-day</span> counter still stands. A <span style={{ color: WHITE, fontWeight: 600 }}>3rd slip resets it to zero</span> — we tell you now so you can feel that line before you reach it.</>}
                </p>
              </div>

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={logRelapse} style={{
                  width: "100%", height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg, #AF2B1C, #D74430)",
                  border: "1px solid rgba(220,70,50,0.50)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 28px rgba(200,50,30,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
                  letterSpacing: "0.01em",
                }}>
                  {t("relapse.confirm.yes")}
                </button>
                <button onClick={onClose} style={{
                  width: "100%", height: 52, borderRadius: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}>
                  {t("relapse.confirm.no")}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "trigger_select" && (
          <motion.div key="trigger" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            style={MODAL_BASE}
          >
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i === 0 ? GOLD : "rgba(255,255,255,0.10)",
                }} />
              ))}
            </div>

            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: MUTED, margin: "0 0 8px" }}>
              {t("relapse.trigger.step")}
            </p>
            <h2 style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: 24, fontWeight: 700, color: WHITE,
              margin: "0 0 6px", lineHeight: 1.25,
            }}>
              {t("relapse.trigger.title")}
            </h2>
            <p style={{ fontSize: 13, color: MUTED, margin: "0 0 20px" }}>
              {t("relapse.trigger.subtitle")}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TRIGGERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTriggerSelect(t.id)}
                  style={{
                    background: `${t.glow}0d`,
                    border: `1px solid ${t.glow}30`,
                    borderRadius: 16,
                    padding: "18px 10px 14px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 10,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${t.glow}70`;
                    el.style.background  = `${t.glow}18`;
                    el.style.boxShadow   = `0 0 18px ${t.glow}22`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${t.glow}30`;
                    el.style.background  = `${t.glow}0d`;
                    el.style.boxShadow   = "none";
                  }}
                >
                  <span style={{ fontSize: 26 }}>{t.emoji}</span>
                  <span style={{
                    fontSize: 12, color: "rgba(255,255,255,0.65)",
                    textAlign: "center", lineHeight: 1.3, fontWeight: 500,
                  }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "ai_reframe" && (
          <motion.div key="reframe" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            style={{ ...MODAL_BASE, overflow: "hidden" }}
          >
            {/* Gold top glow */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "80%", height: 120,
              background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              {/* Progress bar */}
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2, background: GOLD,
                  }} />
                ))}
              </div>

              {/* Brain icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(201,168,76,0.10)",
                border: "1px solid rgba(201,168,76,0.28)",
                boxShadow: "0 0 24px 6px rgba(201,168,76,0.14)",
                display: "grid", placeItems: "center", marginBottom: 20,
              }}>
                <Brain size={24} style={{ color: GOLD }} />
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 0" }}
                  >
                    <Loader2 size={24} style={{ color: GOLD }} className="animate-spin" />
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.20em", color: MUTED, margin: 0 }}>
                      {t("relapse.reframe.analysing")}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.20em", color: GOLD, margin: "0 0 14px" }}>
                      {t("relapse.reframe.readThis")}
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.85, color: WHITE, margin: 0 }}>
                      {highlightText(reframeText ?? "")}
                    </p>

                    {/* Stat card */}
                    <div style={{
                      marginTop: 22, borderRadius: 16,
                      background: "linear-gradient(135deg, rgba(63,187,128,0.07) 0%, rgba(63,187,128,0.03) 100%)",
                      border: "1px solid rgba(63,187,128,0.20)",
                      boxShadow: "0 0 20px rgba(63,187,128,0.08)",
                      padding: "16px 18px",
                      display: "flex", alignItems: "center", gap: 16,
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: "rgba(63,187,128,0.12)",
                        border: "1px solid rgba(63,187,128,0.28)",
                        display: "grid", placeItems: "center", flexShrink: 0,
                      }}>
                        <TrendingUp size={18} style={{ color: GREEN }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{t("relapse.reframe.totalClean")}</p>
                        <p style={{ fontSize: 30, fontWeight: 800, color: WHITE, lineHeight: 1.1, margin: "2px 0 2px" }}>
                          {totalCleanDays}
                        </p>
                        <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: GREEN, margin: 0 }}>
                          {t("common.unchanged")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("done")}
                      style={{
                        marginTop: 20, width: "100%", height: 52,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #8B5E2A, #C9A84C, #E8C96A)",
                        border: "none", color: "#120d04",
                        fontSize: 15, fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 4px 28px rgba(201,168,76,0.35), inset 0 1px 0 rgba(255,255,255,0.20)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {t("relapse.reframe.cta")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" variants={fadeUp} initial="hidden" animate="visible" exit="exit"
            style={{ ...MODAL_BASE, textAlign: "center", overflow: "hidden" }}
          >
            {/* Green top glow */}
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "80%", height: 130,
              background: "radial-gradient(ellipse at 50% 0%, rgba(30,185,100,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(30,185,100,0.16) 0%, transparent 70%)",
                border: "1px solid rgba(30,185,100,0.32)",
                boxShadow: "0 0 44px 10px rgba(30,165,90,0.18)",
                display: "grid", placeItems: "center",
                margin: "0 auto 24px",
              }}>
                <ShieldCheck size={34} style={{ color: GREEN }} />
              </div>

              <h2 style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: 28, fontWeight: 700, color: WHITE,
                margin: "0 0 12px", fontStyle: "italic", lineHeight: 1.2,
              }}>
                {didReset ? "The counter resets — you don't." : t("relapse.done.title")}
              </h2>
              {didReset ? (
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0 }}>
                  That was your third slip, so we keep our word: your counter goes back to{" "}
                  <span style={{ color: WHITE, fontWeight: 600 }}>zero</span> today. That's the hard part — and you deserve the truth over a comfortable lie.{" "}
                  But hear this: you <span style={{ color: GREEN, fontWeight: 600 }}>made it {loggedDay} {loggedDay === 1 ? "day" : "days"}</span>. That happened. Your brain changed in those days and it doesn't un-change. Day 1 again isn't starting over — it's starting with everything you learned. Most people never make it this far even once. Go again.
                </p>
              ) : (
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0 }}>
                  {t("relapse.done.body")}{" "}
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>
                    Your {loggedDay}-{loggedDay === 1 ? "day" : "day"} counter is still standing — {3 - thisStrike} {3 - thisStrike === 1 ? "slip" : "slips"} before it resets. Use that.
                  </span>
                </p>
              )}

              <button
                onClick={onClose}
                style={{
                  marginTop: 28, width: "100%", height: 52,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(30,185,100,0.16), rgba(30,185,100,0.08))",
                  border: "1px solid rgba(30,185,100,0.40)",
                  color: GREEN, fontSize: 15, fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 0 22px rgba(30,185,100,0.12)",
                  letterSpacing: "0.01em",
                }}
              >
                {t("relapse.done.cta")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      </motion.div>
    </Overlay>
  );
}

const MODAL_BASE: React.CSSProperties = {
  position: "relative",
  background: `radial-gradient(ellipse 100% 60% at 50% 0%, #120e0a 0%, ${BG} 60%)`,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "28px 28px 0 0",
  padding: "26px 24px calc(32px + env(safe-area-inset-bottom))",
  width: "100%",
  boxShadow: "0 -24px 80px rgba(0,0,0,0.70), 0 0 0 0.5px rgba(255,255,255,0.05)",
};

const CLOSE_BTN: React.CSSProperties = {
  position: "absolute", top: 16, right: 16,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "50%", width: 30, height: 30,
  display: "grid", placeItems: "center",
  cursor: "pointer", color: "rgba(255,255,255,0.35)",
};

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

import { useState } from "react";
import { ShieldCheck, X, Flame, Brain, TrendingUp, Loader2 } from "lucide-react";
import { useAppState, dayCount, activeAddiction } from "@/lib/store";
import { getReframe } from "@/lib/reframe";

const TRIGGERS = [
  { id: "stressed", label: "I was stressed", emoji: "🧠" },
  { id: "bored", label: "I was bored", emoji: "🥱" },
  { id: "alone", label: "I was alone", emoji: "👥" },
  { id: "late", label: "It was late at night", emoji: "🌌" },
  { id: "online", label: "Something triggered me online", emoji: "📱" },
  { id: "unknown", label: "I don't know", emoji: "❓" },
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
      <span key={i} style={{ color: "#C9A84C", fontWeight: 600 }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

interface Props {
  onClose: () => void;
  totalCleanDays: number;
}

type Step = "confirm" | "trigger_select" | "ai_reframe" | "done";

const MODAL: React.CSSProperties = {
  background: "#0E0B08",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: "28px 24px",
  width: "100%",
  maxWidth: 360,
  margin: "0 16px",
  position: "relative",
};

export function RelapseModal({ onClose, totalCleanDays }: Props) {
  const [state, update] = useAppState();
  const [step, setStep] = useState<Step>("confirm");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [reframeText, setReframeText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = activeAddiction(state);
  const streakDay = active?.startDate ? dayCount(active.startDate) : 1;
  const addictionName = active?.name ?? "Porn";
  const onboardingTriggers = state.onboarding?.triggers ?? [];

  const logRelapse = () => {
    update((s) => ({
      relapses: [...s.relapses, { ts: Date.now(), reframeShown: true }],
    }));
    setStep("trigger_select");
  };

  const handleTriggerSelect = async (triggerId: string) => {
    const trigger = TRIGGERS.find((t) => t.id === triggerId)?.label ?? triggerId;
    setSelectedTrigger(trigger);
    setLoading(true);
    setStep("ai_reframe");

    try {
      const result = await getReframe({
        data: {
          trigger,
          onboardingTriggers,
          streakDay,
          addictionName,
          timeOfDay: getTimeOfDay(),
        },
      });
      setReframeText(result.text);
    } catch {
      setReframeText(FALLBACK_REFRAMES[Math.floor(Math.random() * FALLBACK_REFRAMES.length)]);
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <Overlay>
        <div style={MODAL}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.30)",
              padding: 4,
              lineHeight: 1,
            }}
          >
            <X size={18} />
          </button>

          {/* Flame icon with muted red glow */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(220,60,40,0.10)",
              border: "1px solid rgba(220,60,40,0.22)",
              boxShadow: "0 0 28px 10px rgba(200,50,30,0.16), inset 0 0 16px 2px rgba(220,60,40,0.06)",
              display: "grid",
              placeItems: "center",
              marginBottom: 20,
            }}
          >
            <Flame size={26} style={{ color: "#E05A42" }} />
          </div>

          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#f0ece4",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Did you relapse?
          </h2>
          <p
            style={{
              marginTop: 10,
              fontSize: 14,
              color: "rgba(255,255,255,0.48)",
              lineHeight: 1.65,
              marginBottom: 0,
            }}
          >
            Be honest with yourself. Logging it is an act of courage — your counter stays exactly where it is.
          </p>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={logRelapse}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(175,40,28,0.92), rgba(215,68,48,0.82))",
                border: "1px solid rgba(220,70,50,0.45)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 22px rgba(200,50,30,0.28)",
                letterSpacing: "0.01em",
              }}
            >
              Yes, log it honestly
            </button>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                height: 50,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.55)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              No, I'm still clean
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  if (step === "trigger_select") {
    return (
      <Overlay>
        <div style={MODAL}>
          <p
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.28)",
              margin: "0 0 8px",
            }}
          >
            Step 1 of 2
          </p>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#f0ece4",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            What happened right before?
          </h2>
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "rgba(255,255,255,0.42)",
              marginBottom: 0,
            }}
          >
            Be specific. This shapes your reframe.
          </p>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {TRIGGERS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTriggerSelect(t.id)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "16px 10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.40)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.58)",
                    textAlign: "center",
                    lineHeight: 1.35,
                    fontWeight: 500,
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  if (step === "ai_reframe") {
    return (
      <Overlay>
        <div style={MODAL}>
          {/* Brain icon with gold glow */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(201,168,76,0.10)",
              border: "1px solid rgba(201,168,76,0.28)",
              boxShadow: "0 0 20px 6px rgba(201,168,76,0.14)",
              display: "grid",
              placeItems: "center",
              marginBottom: 20,
            }}
          >
            <Brain size={22} style={{ color: "#C9A84C" }} />
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: "32px 0",
              }}
            >
              <Loader2 size={24} style={{ color: "#C9A84C" }} className="animate-spin" />
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.20em",
                  color: "rgba(255,255,255,0.32)",
                  margin: 0,
                }}
              >
                Analysing your pattern…
              </p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.20em",
                  color: "#C9A84C",
                  margin: "0 0 14px",
                }}
              >
                Read this.
              </p>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.80,
                  color: "#f0ece4",
                  margin: 0,
                }}
              >
                {highlightText(reframeText ?? "")}
              </p>

              {/* Stat card */}
              <div
                style={{
                  marginTop: 22,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(50,185,100,0.10)",
                    border: "1px solid rgba(50,185,100,0.24)",
                    boxShadow: "0 0 12px 3px rgba(50,185,100,0.10)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <TrendingUp size={16} style={{ color: "#3fb86a" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1 }}>
                    Total clean days
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#f0ece4",
                      lineHeight: 1.1,
                      margin: "3px 0 2px",
                    }}
                  >
                    {totalCleanDays}
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#3fb86a",
                      margin: 0,
                    }}
                  >
                    unchanged
                  </p>
                </div>
              </div>

              {/* Day 1 gold gradient button */}
              <button
                onClick={() => setStep("done")}
                style={{
                  marginTop: 20,
                  width: "100%",
                  height: 50,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #8B5E2A, #C9A84C)",
                  border: "none",
                  color: "#1a1206",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 22px rgba(201,168,76,0.28)",
                  letterSpacing: "0.02em",
                }}
              >
                Day 1 starts now. Keep going.
              </button>
            </>
          )}
        </div>
      </Overlay>
    );
  }

  // Step: done
  return (
    <Overlay>
      <div style={{ ...MODAL, textAlign: "center" }}>
        {/* Shield with emerald/teal glow */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(30,185,100,0.10)",
            border: "1px solid rgba(30,185,100,0.28)",
            boxShadow: "0 0 34px 12px rgba(30,165,90,0.16), inset 0 0 20px 3px rgba(30,185,100,0.05)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 22px",
          }}
        >
          <ShieldCheck size={32} style={{ color: "#3fbb80" }} />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#f0ece4",
            margin: 0,
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          You're still in the game.
        </h2>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            color: "rgba(255,255,255,0.48)",
            lineHeight: 1.70,
            marginBottom: 0,
          }}
        >
          Logging that took guts. Close this, open the SOS tools, and identify what triggered it. That's the work.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: 26,
            width: "100%",
            height: 50,
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(30,185,100,0.18), rgba(30,185,100,0.09))",
            border: "1px solid rgba(30,185,100,0.38)",
            color: "#3fbb80",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 0 18px 4px rgba(30,185,100,0.10)",
            letterSpacing: "0.01em",
          }}
        >
          Back to dashboard
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

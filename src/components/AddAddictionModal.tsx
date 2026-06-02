import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type Addiction } from "@/lib/store";

const GOLD  = "#C9A84C";
const WHITE = "#f0ece4";
const MUTED = "rgba(255,255,255,0.36)";
const BG    = "#09070a";

const CUSTOM_EMOJIS = [
  "☕","🍕","🍔","🍟","🍩","🍫","🧁","🍭","🍷","🍻","🥃","🥤",
  "📺","🎵","🎲","🛒","💸","🛍️","💊","😴","🥊","🎸","🏃","🧘",
  "💪","🔥","🎯","🧩","🎰","💉","🥦","🍰",
];

const PRESET_META = [
  { key: "porn",            emoji: "🧠", glow: "#C9A84C" },
  { key: "socialMedia",     emoji: "📱", glow: "#3B82F6" },
  { key: "sugar",           emoji: "🍩", glow: "#F43F5E" },
  { key: "alcohol",         emoji: "🍺", glow: "#F59E0B" },
  { key: "nicotine",        emoji: "🚬", glow: "#94A3B8" },
  { key: "cannabis",        emoji: "🌿", glow: "#22C55E" },
  { key: "gambling",        emoji: "🎰", glow: "#EF4444" },
  { key: "gaming",          emoji: "🎮", glow: "#8B5CF6" },
  { key: "procrastination", emoji: "⏳", glow: "#F97316" },
];

interface Props {
  trackedIds: Set<string>;
  onClose: () => void;
  onAdd: (addiction: Addiction) => void;
}

const spring = { type: "spring" as const, stiffness: 340, damping: 28 };

export function AddAddictionModal({ trackedIds, onClose, onAdd }: Props) {
  const { t } = useTranslation();
  const [customName,  setCustomName]  = useState("");
  const [customEmoji, setCustomEmoji] = useState("☕");
  const [showCustom,  setShowCustom]  = useState(false);
  const [added,       setAdded]       = useState<string | null>(null);

  const PRESET_HABITS = PRESET_META.map(({ key, emoji, glow }) => ({
    name:  t(`addAddict.habits.${key}.name`),
    emoji,
    desc:  t(`addAddict.habits.${key}.desc`),
    glow,
  }));

  const available = PRESET_HABITS.filter(
    (h) => !trackedIds.has(h.name.toLowerCase().replace(/\s+/g, "-"))
  );

  const addHabit = (name: string, emoji: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    if (trackedIds.has(id)) return;
    setAdded(name);
    setTimeout(() => {
      onAdd({ id, name, emoji, startDate: Date.now(), totalCleanDays: 0, urgesSurvived: 0 });
    }, 320);
  };

  const addCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    addHabit(trimmed, customEmoji);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.86)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={spring}
        style={{
          position: "relative",
          width: "100%", maxWidth: 480,
          background: `radial-gradient(ellipse 100% 40% at 50% 0%, #16100a 0%, ${BG} 55%)`,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px 28px 0 0",
          maxHeight: "88dvh",
          overflow: "hidden",
          boxShadow: "0 -24px 80px rgba(0,0,0,0.60)",
        }}
      >
        {/* Gold top glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", height: 100, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)",
        }} />

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(201,168,76,0.22)" }} />
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", maxHeight: "calc(88dvh - 22px)", padding: "16px 20px 40px", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: "0 0 6px" }}>
                {t("addAddict.label")}
              </p>
              <h2 style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: 26, fontWeight: 700, color: WHITE,
                margin: "0 0 6px", lineHeight: 1.2,
              }}>
                {t("addAddict.title")}
              </h2>
              <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                {t("addAddict.subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginLeft: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "grid", placeItems: "center",
                cursor: "pointer", color: MUTED,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Habit list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {available.map(({ name, emoji, desc, glow }) => {
              const isAdded = added === name;
              return (
                <motion.button
                  key={name}
                  onClick={() => addHabit(name, emoji)}
                  animate={isAdded ? { scale: [1, 0.97, 1], opacity: [1, 0.6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: `${glow}0c`,
                    border: `1px solid ${glow}28`,
                    borderRadius: 18,
                    cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${glow}55`;
                    el.style.background  = `${glow}18`;
                    el.style.boxShadow   = `0 0 20px ${glow}18`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = `${glow}28`;
                    el.style.background  = `${glow}0c`;
                    el.style.boxShadow   = "none";
                  }}
                >
                  {/* Icon box */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: `${glow}16`,
                    border: `1px solid ${glow}35`,
                    boxShadow: `0 0 14px ${glow}18`,
                    display: "grid", placeItems: "center",
                    fontSize: 22,
                  }}>
                    {emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: WHITE, margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 11, color: MUTED, margin: "3px 0 0", lineHeight: 1.4 }}>{desc}</p>
                  </div>

                  {/* Plus */}
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: `${glow}18`,
                    border: `1px solid ${glow}40`,
                    display: "grid", placeItems: "center",
                    color: glow,
                  }}>
                    <Plus size={13} />
                  </div>
                </motion.button>
              );
            })}

            {/* Custom entry */}
            <AnimatePresence>
              {showCustom ? (
                <motion.div
                  key="custom-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={spring}
                  style={{
                    borderRadius: 18, padding: 16,
                    background: "rgba(201,168,76,0.06)",
                    border: `1px solid ${GOLD}35`,
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", color: MUTED, margin: "0 0 12px" }}>
                    {t("addAddict.pickEmoji")}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6, marginBottom: 14 }}>
                    {CUSTOM_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setCustomEmoji(e)}
                        style={{
                          height: 36, borderRadius: 10, fontSize: 18,
                          display: "grid", placeItems: "center",
                          background: customEmoji === e ? "rgba(201,168,76,0.22)" : "rgba(255,255,255,0.04)",
                          border: customEmoji === e ? `1.5px solid ${GOLD}60` : "1.5px solid transparent",
                          transform: customEmoji === e ? "scale(1.12)" : "scale(1)",
                          transition: "all 0.12s",
                          cursor: "pointer",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12, marginBottom: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}>
                    <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{customEmoji}</span>
                    <input
                      autoFocus
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustom()}
                      placeholder={t("addAddict.namePlaceholder")}
                      style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        fontSize: 14, color: WHITE,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    />
                  </div>

                  <button
                    onClick={addCustom}
                    disabled={!customName.trim()}
                    style={{
                      width: "100%", height: 46, borderRadius: 13,
                      background: customName.trim()
                        ? "linear-gradient(135deg, #8B5E2A, #C9A84C, #E8C96A)"
                        : "rgba(255,255,255,0.06)",
                      border: "none",
                      color: customName.trim() ? "#120d04" : MUTED,
                      fontSize: 14, fontWeight: 700, cursor: customName.trim() ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "background 0.2s, color 0.2s",
                      boxShadow: customName.trim() ? "0 4px 24px rgba(201,168,76,0.30)" : "none",
                    }}
                  >
                    <Check size={15} /> {t("addAddict.startTracking")}
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="custom-btn"
                  onClick={() => setShowCustom(true)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 18,
                    background: "transparent",
                    border: "1.5px dashed rgba(255,255,255,0.12)",
                    cursor: "pointer", color: MUTED,
                    fontSize: 13, fontWeight: 500,
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${GOLD}50`;
                    e.currentTarget.style.color = GOLD;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = MUTED;
                  }}
                >
                  <Plus size={15} />
                  {t("addAddict.somethingElse")}
                </motion.button>
              )}
            </AnimatePresence>

            {available.length === 0 && !showCustom && (
              <p style={{ textAlign: "center", fontSize: 13, color: MUTED, padding: "16px 0" }}>
                {t("addAddict.allTracked")}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

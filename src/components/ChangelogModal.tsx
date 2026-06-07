import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { CHANGELOG, CURRENT_VERSION, markChangelogSeen } from "@/lib/changelog";
import { dragDismissProps } from "@/lib/sheetGesture";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangelogModal({ open, onClose }: Props) {
  const entry = CHANGELOG.find((e) => e.version === CURRENT_VERSION);

  // Mark seen the moment it appears — not on dismiss
  useEffect(() => {
    if (open) markChangelogSeen();
  }, [open]);

  if (!entry) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — soft fade */}
          <motion.div
            key="changelog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          />

          {/* Sheet — rises from bottom */}
          <motion.div
            key="changelog-sheet"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34, opacity: { duration: 0.3 } }}
            {...dragDismissProps(onClose)}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 61,
              background: "linear-gradient(170deg, #14100a 0%, #0c0905 100%)",
              borderTop: "1px solid rgba(201,168,76,0.22)",
              borderRadius: "24px 24px 0 0",
              padding: "28px 24px 52px",
              touchAction: "none",
            }}
          >
            {/* Ambient glow behind content */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -40,
                left: "50%",
                transform: "translateX(-50%)",
                width: 260,
                height: 120,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(18px)",
              }}
            />

            {/* Handle */}
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.10)",
                margin: "0 auto 28px",
              }}
            />

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.40)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>

            {/* Version chip */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
            >
              <Sparkles size={14} style={{ color: "#C9A84C" }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C9A84C",
                }}
              >
                v{entry.version}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="day-monument"
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#f5ede0",
                marginBottom: 22,
                lineHeight: 1.2,
              }}
            >
              {entry.title}
            </motion.h2>

            {/* Items */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 15 }}>
              {entry.items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.08, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 13 }}
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#C9A84C",
                      boxShadow: "0 0 6px rgba(201,168,76,0.6)",
                      flexShrink: 0,
                      marginTop: 8,
                    }}
                  />
                  <span style={{ fontSize: 15, color: "rgba(245,237,224,0.80)", lineHeight: 1.55 }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* CTA — shimmer glow button */}
            <style>{`
              @keyframes clog-shimmer {
                0%   { background-position: -200% center; }
                100% { background-position:  200% center; }
              }
              .clog-btn {
                background: linear-gradient(
                  90deg,
                  #b8842a 0%,
                  #e0b050 30%,
                  #fff8e8 50%,
                  #e0b050 70%,
                  #b8842a 100%
                );
                background-size: 200% auto;
                animation: clog-shimmer 2.8s linear infinite;
              }
            `}</style>
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + entry.items.length * 0.08 + 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="clog-btn"
              style={{
                marginTop: 30,
                width: "100%",
                height: 54,
                borderRadius: 16,
                color: "#1a1000",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
                boxShadow: "0 0 24px rgba(201,168,76,0.30), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              Let's go
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

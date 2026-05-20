import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { CHANGELOG, CURRENT_VERSION, markChangelogSeen } from "@/lib/changelog";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangelogModal({ open, onClose }: Props) {
  const entry = CHANGELOG.find((e) => e.version === CURRENT_VERSION);
  if (!entry) return null;

  const handleClose = () => {
    markChangelogSeen();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="changelog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />

          {/* Sheet */}
          <motion.div
            key="changelog-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 61,
              background: "#100d07",
              borderTop: "1px solid rgba(201,168,76,0.18)",
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 48px",
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                background: "rgba(255,255,255,0.12)",
                margin: "0 auto 24px",
              }}
            />

            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>

            {/* Version chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
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
            </div>

            {/* Title */}
            <h2
              className="day-monument"
              style={{ fontSize: 24, fontWeight: 700, color: "#f5ede0", marginBottom: 20, lineHeight: 1.2 }}
            >
              {entry.title}
            </h2>

            {/* Items */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {entry.items.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.35 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#C9A84C",
                      flexShrink: 0,
                      marginTop: 7,
                    }}
                  />
                  <span style={{ fontSize: 15, color: "rgba(245,237,224,0.85)", lineHeight: 1.5 }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + entry.items.length * 0.07 + 0.1 }}
              onClick={handleClose}
              style={{
                marginTop: 28,
                width: "100%",
                height: 52,
                borderRadius: 14,
                background: "var(--gradient-primary)",
                color: "var(--primary-foreground)",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
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

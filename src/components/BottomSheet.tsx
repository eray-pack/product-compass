import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";

// ── Tunable gesture constants ─────────────────────────────────────────────────
const DISMISS_THRESHOLD   = 0.4;   // fraction of sheet height dragged → dismiss
const VELOCITY_DISMISS    = 0.5;   // px/ms downward flick → dismiss even if short
const RUBBER_RESISTANCE   = 0.55;  // resistance when over-dragging upward (past open)
const VELOCITY_SAMPLE_MS  = 80;    // velocity computed from movement in this window
const SNAP_SPRING         = { type: "spring", stiffness: 300, damping: 30 } as const;
const DISMISS_TWEEN       = { type: "tween", duration: 0.24, ease: [0.32, 0, 0.67, 0] } as const;
const OPEN_SPRING         = { type: "spring", stiffness: 280, damping: 30 } as const;

const HINT_KEY = "stopamine.sheetHintSeen";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Pinned footer rendered below the scroll area (e.g. a CTA button) */
  footer?: ReactNode;
  /** Sheet height as a CSS value. Default 88vh. */
  height?: string;
  /** Background of the sheet surface */
  background?: string;
  /** Top border accent color */
  borderColor?: string;
  /** Show the grab pill at the top */
  grabber?: boolean;
  ariaLabel?: string;
}

/**
 * Physics-based bottom sheet.
 * - Drags from ANYWHERE on the surface (not just the handle).
 * - Inner content scrolls natively; the sheet only drags when that scroll is
 *   already at the top and you pull DOWN (true iOS sheet behavior).
 * - Finger-tracked in real time via a Framer motion value (compositor transform,
 *   no React re-renders, no CSS transition fighting the finger).
 * - Release: past 40% or a fast downward flick → momentum dismiss; otherwise
 *   spring back to fully open. Reversible mid-gesture.
 * - Backdrop tap is kept as an accessibility fallback.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  footer,
  height = "88vh",
  background = "linear-gradient(180deg, #0a0705 0%, #06050a 50%, #04060a 100%)",
  borderColor = "rgba(201,168,76,0.25)",
  grabber = true,
  ariaLabel,
}: BottomSheetProps) {
  const sheetRef   = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const y          = useMotionValue(0);
  const [hintSeen, setHintSeen] = useState(true);

  // Pulse the grab hint only the first time a sheet is ever opened
  useEffect(() => {
    if (!open) return;
    try {
      const seen = localStorage.getItem(HINT_KEY) === "1";
      setHintSeen(seen);
    } catch { /* ignore */ }
  }, [open]);

  const markHintSeen = () => {
    if (!hintSeen) {
      try { localStorage.setItem(HINT_KEY, "1"); } catch { /* ignore */ }
      setHintSeen(true);
    }
  };

  // Slide in from the bottom on open
  useEffect(() => {
    if (!open) return;
    const h = sheetRef.current?.offsetHeight ?? window.innerHeight;
    y.set(h);
    const controls = animate(y, 0, OPEN_SPRING);
    return () => controls.stop();
  }, [open, y]);

  // Custom drag handler with scroll-at-top gating. Attached non-passive so we
  // can preventDefault to stop page-scroll bleed once a drag is committed.
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !open) return;

    let startY    = 0;
    let dragging  = false;
    let decided   = false;
    let samples: { t: number; y: number }[] = [];

    const sheetHeight = () => sheet.offsetHeight || window.innerHeight;

    const onStart = (e: TouchEvent) => {
      startY   = e.touches[0].clientY;
      dragging = false;
      decided  = false;
      samples  = [{ t: performance.now(), y: startY }];
      y.stop(); // cancel any running spring so the finger takes over instantly
    };

    const onMove = (e: TouchEvent) => {
      const curY = e.touches[0].clientY;
      const dy   = curY - startY;
      const scroller = scrollRef.current;
      const atTop = !scroller || scroller.scrollTop <= 0;

      if (!decided) {
        // Commit to a drag only if we're at the top and pulling down
        if (atTop && dy > 2) { dragging = true; decided = true; }
        else if (Math.abs(dy) > 2) { decided = true; } // it's a scroll — hands off
      }

      if (!dragging) return;

      e.preventDefault(); // stop the page/scroll bleed
      // Past the open position pulls with rubber-band resistance (rare, guards up-drag)
      const offset = dy >= 0 ? dy : dy * RUBBER_RESISTANCE;
      y.set(offset);

      const now = performance.now();
      samples.push({ t: now, y: curY });
      while (samples.length > 2 && now - samples[0].t > VELOCITY_SAMPLE_MS) samples.shift();
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;

      const offset = y.get();
      // velocity over the sample window (px/ms, positive = downward)
      let velocity = 0;
      if (samples.length >= 2) {
        const first = samples[0];
        const last  = samples[samples.length - 1];
        const dt    = last.t - first.t;
        if (dt > 0) velocity = (last.y - first.y) / dt;
      }

      const dismiss = offset > sheetHeight() * DISMISS_THRESHOLD || velocity > VELOCITY_DISMISS;
      if (dismiss) {
        markHintSeen();
        animate(y, sheetHeight(), {
          ...DISMISS_TWEEN,
          // carry the flick velocity into the exit
          velocity: velocity * 1000,
        }).then(onClose);
      } else {
        animate(y, 0, SNAP_SPRING);
      }
    };

    sheet.addEventListener("touchstart", onStart, { passive: true });
    sheet.addEventListener("touchmove",  onMove,  { passive: false });
    sheet.addEventListener("touchend",   onEnd,   { passive: true });
    sheet.addEventListener("touchcancel", onEnd,  { passive: true });
    return () => {
      sheet.removeEventListener("touchstart", onStart);
      sheet.removeEventListener("touchmove",  onMove);
      sheet.removeEventListener("touchend",   onEnd);
      sheet.removeEventListener("touchcancel", onEnd);
    };
  }, [open, y, onClose, hintSeen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop scrim — tap to close (accessibility fallback) */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* Sheet surface */}
          <motion.div
            key="sheet-surface"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            exit={{ y: "100%", transition: DISMISS_TWEEN }}
            style={{
              y,
              position: "fixed", bottom: 0, left: 0, right: 0,
              height, zIndex: 51,
              maxWidth: 448, margin: "0 auto",
              background,
              borderRadius: "24px 24px 0 0",
              borderTop: `1px solid ${borderColor}`,
              boxShadow: "0 -4px 60px rgba(0,0,0,0.5)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              touchAction: "none",
            }}
          >
            {grabber && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 8, flexShrink: 0 }}>
                <div
                  className={hintSeen ? undefined : "sheet-grab-pulse"}
                  style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.28)" }}
                />
              </div>
            )}

            {/* Native-scrolling content area */}
            <div
              ref={scrollRef}
              style={{
                flex: 1, minHeight: 0, overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                scrollbarWidth: "none",
                touchAction: "pan-y",
              }}
            >
              {children}
            </div>

            {footer && <div style={{ flexShrink: 0 }}>{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

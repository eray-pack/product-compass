import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";

// ── Drag-to-dismiss props for short, NON-scrolling bottom sheets ──────────────
// Spread onto a Framer <motion.div> that's a bottom-anchored sheet. The whole
// surface becomes draggable; release past ~100px or a fast downward flick
// dismisses, otherwise it springs back. For sheets WITH an internal scroll area,
// use the BottomSheet component (scroll-at-top gating) instead.
const DRAG_DISMISS_OFFSET   = 100;  // px dragged → dismiss
const DRAG_DISMISS_VELOCITY = 500;  // px/s downward flick → dismiss

// Page-level swipe-to-dismiss tuning
const PAGE_DISMISS_OFFSET   = 130;  // px pulled down → dismiss
const PAGE_DISMISS_VELOCITY = 0.55; // px/ms downward flick → dismiss
const PAGE_SAMPLE_MS        = 80;
const PAGE_SNAP   = { type: "spring", stiffness: 300, damping: 30 } as const;
const PAGE_EXIT   = { type: "tween", duration: 0.24, ease: [0.32, 0, 0.67, 0] } as const;

/**
 * Swipe-to-dismiss for a full scrolling PAGE (a route, not an overlay sheet).
 * Returns a MotionValue<number> to bind to the page's `style={{ y }}`.
 *
 * Gating: a pull only becomes a dismiss-drag when the document is scrolled to
 * the top AND you're pulling down — otherwise the page scrolls natively. While
 * dragging, touchmove is preventDefault'd so the native rubber-band doesn't
 * fight the transform.
 */
export function usePageSwipeDismiss(onDismiss: () => void): MotionValue<number> {
  const y = useMotionValue(0);
  const cb = useRef(onDismiss);
  cb.current = onDismiss;

  useEffect(() => {
    let startY = 0, dragging = false, decided = false;
    let samples: { t: number; y: number }[] = [];

    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      dragging = false; decided = false;
      samples = [{ t: performance.now(), y: startY }];
      y.stop();
    };
    const onMove = (e: TouchEvent) => {
      const cur = e.touches[0].clientY;
      const dy  = cur - startY;
      if (!decided) {
        if (window.scrollY <= 0 && dy > 4) { dragging = true; decided = true; }
        else if (Math.abs(dy) > 4) decided = true; // it's a scroll — hands off
      }
      if (!dragging) return;
      e.preventDefault();
      y.set(dy < 0 ? dy * 0.4 : dy); // tiny resistance if dragged up past origin
      const now = performance.now();
      samples.push({ t: now, y: cur });
      while (samples.length > 2 && now - samples[0].t > PAGE_SAMPLE_MS) samples.shift();
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const offset = y.get();
      let v = 0;
      if (samples.length >= 2) {
        const f = samples[0], l = samples[samples.length - 1];
        const dt = l.t - f.t;
        if (dt > 0) v = (l.y - f.y) / dt;
      }
      if (offset > PAGE_DISMISS_OFFSET || v > PAGE_DISMISS_VELOCITY) {
        animate(y, window.innerHeight, { ...PAGE_EXIT, velocity: v * 1000 }).then(() => cb.current());
      } else {
        animate(y, 0, PAGE_SNAP);
      }
    };

    window.addEventListener("touchstart",  onStart, { passive: true });
    window.addEventListener("touchmove",   onMove,  { passive: false });
    window.addEventListener("touchend",    onEnd,   { passive: true });
    window.addEventListener("touchcancel", onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart",  onStart);
      window.removeEventListener("touchmove",   onMove);
      window.removeEventListener("touchend",    onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [y]);

  return y;
}

export function dragDismissProps(onClose: () => void) {
  return {
    drag: "y" as const,
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: { top: 0.04, bottom: 0.7 },
    onDragEnd: (
      _e: unknown,
      info: { offset: { y: number }; velocity: { y: number } },
    ) => {
      if (info.offset.y > DRAG_DISMISS_OFFSET || info.velocity.y > DRAG_DISMISS_VELOCITY) {
        onClose();
      }
    },
  };
}

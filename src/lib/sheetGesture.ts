import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";

// ── Page elastic overscroll bounce ────────────────────────────────────────────
// JS-driven rubber-band for full pages (the native WKWebView bounce is
// unreliable inside Capacitor). Transforms a content wrapper directly (GPU,
// no React re-renders), engages ONLY at the scroll edges, springs back on
// release. Set transform back to "" at rest so it never breaks position:fixed.
const BOUNCE_MAX        = 150;   // px max stretch (asymptotic, never hard-capped feel)
const BOUNCE_DIMENSION  = 600;   // rubber-band reference dimension
const BOUNCE_CONSTANT   = 0.5;   // lower = stiffer
const BOUNCE_SPRING     = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";

// Fling → bounce (momentum carry-through): a fast scroll that REACHES an edge
// with leftover velocity flows straight into the rubber-band, no hard stop.
const FLING_THRESHOLD   = 0.35;  // px/ms remaining velocity at the edge to trigger
const FLING_SCALE       = 0.55;  // how much scroll velocity converts to bounce impulse
const FLING_MAX_V       = 1500;  // px/s cap on the impulse fed into the spring

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function bounceResist(distance: number) {
  const x = Math.abs(distance);
  const b = (x * BOUNCE_DIMENSION * BOUNCE_CONSTANT) / (BOUNCE_DIMENSION + BOUNCE_CONSTANT * x);
  const capped = Math.min(b, BOUNCE_MAX);
  return distance < 0 ? -capped : capped;
}

// True if the touch began inside an overlay (position:fixed) or its own inner
// scroller — in which case the page bounce must stay out of the way.
function startedInOverlayOrScroller(target: EventTarget | null): boolean {
  let node = target as HTMLElement | null;
  while (node && node !== document.body && node !== document.documentElement) {
    const cs = getComputedStyle(node);
    if (cs.position === "fixed") return true;
    const oy = cs.overflowY;
    if ((oy === "auto" || oy === "scroll") && node.scrollHeight > node.clientHeight + 1) return true;
    node = node.parentElement;
  }
  return false;
}

/**
 * Elastic overscroll for a full page. Bind the returned ref to a wrapper
 * around the page's scrolling content. Pull past the top or bottom and it
 * stretches with rubber-band resistance, then springs back on release.
 */
export function usePageBounce(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let fling: { stop: () => void } | null = null;
    const stopFling = () => { if (fling) { fling.stop(); fling = null; } };
    const setT = (v: number) => {
      const c = clamp(v, -BOUNCE_MAX, BOUNCE_MAX);
      el.style.transform = c === 0 ? "" : `translate3d(0, ${c}px, 0)`;
    };

    // ── Manual pull (finger at the edge) ──────────────────────────────────────
    let startY = 0, dragging = false, decided = false, skip = false, touching = false;
    let rafId = 0, pending = 0;
    const flush = () => { rafId = 0; setT(pending); };
    const queue = (v: number) => { pending = v; if (!rafId) rafId = requestAnimationFrame(flush); };

    const onStart = (e: TouchEvent) => {
      touching = true; dragging = false; decided = false;
      skip = startedInOverlayOrScroller(e.target);
      startY = e.touches[0].clientY;
      stopFling();
      el.style.transition = "none";
    };
    const onMove = (e: TouchEvent) => {
      if (skip) return;
      const dy = e.touches[0].clientY - startY;
      if (!decided) {
        const atTop    = window.scrollY <= 0;
        const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
        if (atTop && dy > 0)         { dragging = true; decided = true; }
        else if (atBottom && dy < 0) { dragging = true; decided = true; }
        else if (Math.abs(dy) > 3)   { decided = true; } // normal scroll — hands off
      }
      if (!dragging) return;
      e.preventDefault();
      queue(bounceResist(dy));
    };
    const onEnd = () => {
      touching = false;
      if (!dragging) return;
      dragging = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      pending = 0;
      el.style.transition = BOUNCE_SPRING;
      el.style.transform = "";
    };

    // ── Fling carry-through (momentum reaches the edge) ───────────────────────
    let lastY = window.scrollY, lastT = performance.now(), vel = 0, cooldown = false;
    const fireFling = (impulsePerMs: number) => {
      cooldown = true;
      stopFling();
      el.style.transition = "none";
      // Spring from 0 → 0 with an initial velocity = overshoot then settle back.
      const v0 = clamp(impulsePerMs * 1000 * FLING_SCALE, -FLING_MAX_V, FLING_MAX_V);
      fling = animate(0, 0, {
        type: "spring", velocity: v0, stiffness: 170, damping: 22,
        restDelta: 0.4, restSpeed: 3,
        onUpdate: (val: number) => setT(val),
        onComplete: () => { el.style.transform = ""; fling = null; },
      });
    };
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastT;
      if (dt > 0) vel = (y - lastY) / dt; // px/ms (negative = toward top)
      lastY = y; lastT = now;
      if (touching || dragging) return;   // finger handles edges directly
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!cooldown) {
        if (y <= 0 && vel < -FLING_THRESHOLD)        fireFling(-vel); // hit top with speed
        else if (y >= max - 1 && vel > FLING_THRESHOLD) fireFling(-vel); // hit bottom
      }
      if (y > 2 && y < max - 2) cooldown = false; // re-arm once away from edges
    };

    window.addEventListener("touchstart",  onStart, { passive: true });
    window.addEventListener("touchmove",   onMove,  { passive: false });
    window.addEventListener("touchend",    onEnd,   { passive: true });
    window.addEventListener("touchcancel", onEnd,   { passive: true });
    window.addEventListener("scroll",      onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      stopFling();
      window.removeEventListener("touchstart",  onStart);
      window.removeEventListener("touchmove",   onMove);
      window.removeEventListener("touchend",    onEnd);
      window.removeEventListener("touchcancel", onEnd);
      window.removeEventListener("scroll",      onScroll);
    };
  }, [ref]);
}

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

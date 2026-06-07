import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";

// ── Page elastic overscroll bounce ────────────────────────────────────────────
// One continuous spring model so it flows like water: the finger tracks a
// soft asymptotic rubber-band (no hard wall), and on release your finger's
// velocity carries straight into the spring-back. A fast scroll that reaches
// an edge feeds its leftover momentum into the same spring. Transform resets
// to "" at rest so it never breaks position:fixed.
const RESIST_ASYMPTOTE  = 240;   // px the pull asymptotically approaches (soft, no wall)
const RESIST_SLOPE      = 0.8;   // tracking at the start of the pull (1 = 1:1 with finger)

// Spring that settles to rest — smooth, minimal oscillation (water, not jelly)
const SPRING = { type: "spring" as const, stiffness: 200, damping: 30, restDelta: 0.2, restSpeed: 2 };
const FLING_SPRING = { type: "spring" as const, stiffness: 190, damping: 26, restDelta: 0.2, restSpeed: 2 };

// Fling → bounce (momentum carry-through)
const FLING_THRESHOLD   = 0.2;   // px/ms remaining velocity at the edge to trigger (gentle)
const FLING_SCALE       = 0.6;   // scroll velocity → bounce impulse
const FLING_MAX_V       = 1800;  // px/s cap on the impulse fed into the spring

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Soft asymptotic resistance — gentle 1:~0.5 at first, approaches the asymptote,
// never hits a flat cap. This is what removes the "wall" feeling.
function bounceResist(distance: number) {
  const sign = distance < 0 ? -1 : 1;
  const x = Math.abs(distance);
  return sign * (x * RESIST_ASYMPTOTE * RESIST_SLOPE) / (RESIST_ASYMPTOTE + RESIST_SLOPE * x);
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
    el.style.willChange = "transform";
    el.style.transition = "none"; // always JS-driven; never let CSS fight the finger

    let offset = 0;                                    // current transform offset (px)
    let anim: { stop: () => void } | null = null;
    const stop = () => { if (anim) { anim.stop(); anim = null; } };
    const setNow = (v: number) => {
      offset = v;
      el.style.transform = v === 0 ? "" : `translate3d(0, ${v}px, 0)`;
    };
    // One spring to rule them all — `from`/`to`/`velocity` cover drag-release,
    // fling, and snap-back identically, so the motion is always continuous.
    const spring = (from: number, velocity: number, cfg = SPRING) => {
      stop();
      anim = animate(from, 0, {
        ...cfg, velocity,
        onUpdate: setNow,
        onComplete: () => { setNow(0); anim = null; },
      });
    };

    // ── Manual pull (finger at the edge) ──────────────────────────────────────
    let startY = 0, dragging = false, decided = false, skip = false, touching = false;
    let maxScroll = 0;
    let rafId = 0, pending = 0;
    let lastMoveY = 0, lastMoveT = 0, dragVel = 0;     // px/ms during the pull
    const flush = () => { rafId = 0; setNow(pending); };
    const queue = (v: number) => { pending = v; if (!rafId) rafId = requestAnimationFrame(flush); };

    const onStart = (e: TouchEvent) => {
      touching = true; dragging = false; decided = false;
      skip = startedInOverlayOrScroller(e.target);
      startY = e.touches[0].clientY;
      lastMoveY = startY; lastMoveT = performance.now(); dragVel = 0;
      maxScroll = document.documentElement.scrollHeight - window.innerHeight; // cache once
      stop();
    };
    const onMove = (e: TouchEvent) => {
      if (skip) return;
      const cy = e.touches[0].clientY;
      const dy = cy - startY;
      if (!decided) {
        // maxScroll = scrollHeight - innerHeight, so "at bottom" is simply
        // scrollY >= maxScroll (NOT scrollY + innerHeight, which double-counts).
        const atTop    = window.scrollY <= 0;
        const atBottom = window.scrollY >= maxScroll - 1;
        if (atTop && dy > 0)         { dragging = true; decided = true; }
        else if (atBottom && dy < 0) { dragging = true; decided = true; }
        else if (Math.abs(dy) > 3)   { decided = true; } // normal scroll — hands off
      }
      if (!dragging) return;
      e.preventDefault();
      queue(bounceResist(dy));
      const now = performance.now();
      const dt = now - lastMoveT;
      if (dt > 0) dragVel = (cy - lastMoveY) / dt;       // track finger velocity
      lastMoveY = cy; lastMoveT = now;
    };
    const onEnd = () => {
      touching = false;
      if (!dragging) return;
      dragging = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      // Carry the finger's release velocity into the spring → continuous flow.
      spring(offset, dragVel * 1000, SPRING);
    };

    // ── Fling carry-through (momentum reaches the edge, no finger) ─────────────
    let lastY = window.scrollY, lastT = performance.now(), vel = 0, cooldown = false;
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastT;
      if (dt > 0) vel = (y - lastY) / dt; // px/ms (negative = toward top)
      lastY = y; lastT = now;
      if (touching || dragging) return;   // finger path owns the edges
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!cooldown) {
        if (y <= 0 && vel < -FLING_THRESHOLD)           { cooldown = true; spring(0, clamp(-vel * 1000 * FLING_SCALE, -FLING_MAX_V, FLING_MAX_V), FLING_SPRING); }
        else if (y >= max - 1 && vel > FLING_THRESHOLD) { cooldown = true; spring(0, clamp(-vel * 1000 * FLING_SCALE, -FLING_MAX_V, FLING_MAX_V), FLING_SPRING); }
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
      stop();
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

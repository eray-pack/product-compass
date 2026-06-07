// ── Drag-to-dismiss props for short, NON-scrolling bottom sheets ──────────────
// Spread onto a Framer <motion.div> that's a bottom-anchored sheet. The whole
// surface becomes draggable; release past ~100px or a fast downward flick
// dismisses, otherwise it springs back. For sheets WITH an internal scroll area,
// use the BottomSheet component (scroll-at-top gating) instead.
const DRAG_DISMISS_OFFSET   = 100;  // px dragged → dismiss
const DRAG_DISMISS_VELOCITY = 500;  // px/s downward flick → dismiss

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

import { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import type { Variants } from "framer-motion";

// ── Shared page entrance animation ───────────────────────────────────────────
// Use these variants on any page to get a staggered bounce-in effect
// that re-triggers every time the user navigates back to the page.

export const pageContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const popUp: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { type: "spring", stiffness: 340, damping: 26 } },
};

export const popUpFast: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 28 } },
};

// Returns an animKey that increments every time the user lands on `pathname`.
// Use as key={animKey} on the motion.div container to re-trigger animation.
export function usePageAnimation(pathname: string): number {
  const location = useLocation();
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (location.pathname === pathname) setAnimKey(k => k + 1);
  }, [location.pathname, pathname]);
  return animKey;
}

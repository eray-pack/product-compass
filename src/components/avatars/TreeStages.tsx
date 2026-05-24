// Tree companion — 6 growth stages across a 90-day recovery journey.
// All 6 stages use PNG assets: seed, sprout, sapling, young, strong, ancient.
// viewBox 0 0 100 130 for SVG stages.

import treeStage0SeedUrl from "@/assets/tree-stage0-seed.png";
import treeStage1SproutUrl from "@/assets/tree-stage1-sprout.png";
import treeStage2SaplingUrl from "@/assets/tree-stage2-sapling.png";
import treeStage3YoungUrl from "@/assets/tree-stage3-young.png";
import treeStage4StrongUrl from "@/assets/tree-stage4-strong.png";
import treeStage5AncientUrl from "@/assets/tree-stage5-ancient.png";

type P = { className?: string };
const V = "0 0 100 130";

/* ── Stage 0 — Seed (day 0–2) ──────────────────────────────────────────── */
export function Tree0({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage0SeedUrl} alt="Seed" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 1 — Sprout (day 3–13) ───────────────────────────────────────── */
export function Tree1({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage1SproutUrl} alt="Sprout" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 2 — Sapling (day 14–29) ─────────────────────────────────────── */
export function Tree2({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage2SaplingUrl} alt="Sapling" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 3 — Young (day 30–59) ───────────────────────────────────────── */
export function Tree3({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage3YoungUrl} alt="Young tree" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 4 — Strong (day 60–89) ──────────────────────────────────────── */
export function Tree4({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage4StrongUrl} alt="Strong tree" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

/* ── Stage 5 — Ancient (day 90+) ───────────────────────────────────────── */
export function Tree5({ className }: P) {
  return (
    <div className={className} style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <img src={treeStage5AncientUrl} alt="Ancient tree" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
    </div>
  );
}

export const TREE_STAGES = [Tree0, Tree1, Tree2, Tree3, Tree4, Tree5] as const;

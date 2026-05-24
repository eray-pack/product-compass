import { dayToStage } from "@/components/avatars/CompanionAvatar";
import treeStage0SeedUrl from "@/assets/tree-stage0-seed.png";
import treeStage1SproutUrl from "@/assets/tree-stage1-sprout.png";
import treeStage2SaplingUrl from "@/assets/tree-stage2-sapling.png";
import treeStage3YoungUrl from "@/assets/tree-stage3-young.png";
import treeStage4StrongUrl from "@/assets/tree-stage4-strong.png";
import treeStage5AncientUrl from "@/assets/tree-stage5-ancient.png";

interface Props {
  day: number;
  xp?: number;
}

/**
 * Illustrated cartoon tree — 6 growth stages driven by clean-day count.
 * All stages use PNG assets: seed → sprout → sapling → young → strong → ancient.
 * Thresholds: 0 days=Seed, 3 days=Sprout, 14=Sapling, 30=Young, 60=Strong, 90=Ancient.
 */
export function CartoonTree({ day }: Props) {
  const stage = dayToStage(day);

  if (stage === 0) {
    return (
      <img
        src={treeStage0SeedUrl}
        alt="Seed"
        style={{ height: "52%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 1) {
    return (
      <img
        src={treeStage1SproutUrl}
        alt="Sprout"
        style={{ height: "62%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 2) {
    return (
      <img
        src={treeStage2SaplingUrl}
        alt="Sapling"
        style={{ height: "76%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 3) {
    return (
      <img
        src={treeStage3YoungUrl}
        alt="Young tree"
        style={{ height: "88%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  if (stage === 4) {
    return (
      <img
        src={treeStage4StrongUrl}
        alt="Strong tree"
        style={{ height: "96%", width: "auto", objectFit: "contain" }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={treeStage5AncientUrl}
      alt="Ancient tree"
      style={{ height: "100%", width: "auto", objectFit: "contain" }}
      aria-hidden
    />
  );
}

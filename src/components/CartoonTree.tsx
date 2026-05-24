import { treeStage, } from "@/lib/store";
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

// Stage index → { asset URL, alt text, display height }
const STAGE_IMAGES = [
  { src: treeStage0SeedUrl,   alt: "Seed",        height: "52%"  },
  { src: treeStage1SproutUrl, alt: "Sprout",       height: "62%"  },
  { src: treeStage2SaplingUrl,alt: "Sapling",      height: "76%"  },
  { src: treeStage3YoungUrl,  alt: "Young tree",   height: "88%"  },
  { src: treeStage4StrongUrl, alt: "Strong tree",  height: "96%"  },
  { src: treeStage5AncientUrl,alt: "Ancient tree", height: "100%" },
] as const;

/**
 * Illustrated cartoon tree — 6 growth stages.
 * When xp is provided, stage is driven by XP thresholds (matches the rest of
 * the Tree page, including the Dev Menu stage jumper). Falls back to clean-day
 * count when xp is omitted.
 */
export function CartoonTree({ day, xp }: Props) {
  const stage = xp !== undefined ? treeStage(xp).stage : dayToStage(day);
  const { src, alt, height } = STAGE_IMAGES[stage];

  return (
    <img
      src={src}
      alt={alt}
      style={{ height, width: "auto", objectFit: "contain" }}
      aria-hidden
    />
  );
}

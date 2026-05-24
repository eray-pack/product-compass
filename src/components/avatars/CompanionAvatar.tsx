import { useEffect, useRef, useState } from "react";
import { TREE_STAGES } from "./TreeStages";
import { WOLF_STAGES } from "./WolfStages";

export type CompanionType = "tree" | "wolf";

interface Props {
  type: CompanionType;
  day: number;
  stage?: number;        // override day-computed stage (e.g. for XP-based progression)
  relapseCount?: number; // increment to trigger regression animation
  className?: string;
}

// Tree: 6 stages (0–5)
export const STAGE_DAYS = [0, 7, 14, 30, 60, 90] as const;

export function dayToStage(day: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (day >= 90) return 5;
  if (day >= 60) return 4;
  if (day >= 30) return 3;
  if (day >= 14) return 2;
  if (day >= 7)  return 1;
  return 0;
}

// Wolf: 8 stages (0–7)
export const WOLF_STAGE_DAYS = [0, 3, 7, 14, 30, 45, 60, 90] as const;

export function wolfDayToStage(day: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  if (day >= 90) return 7;
  if (day >= 60) return 6;
  if (day >= 45) return 5;
  if (day >= 30) return 4;
  if (day >= 14) return 3;
  if (day >= 7)  return 2;
  if (day >= 3)  return 1;
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STAGES: Record<CompanionType, readonly React.ComponentType<any>[]> = {
  tree: TREE_STAGES,
  wolf: WOLF_STAGES,
} as const;

export const COMPANION_LABELS: Record<CompanionType, { name: string; tagline: string }> = {
  tree: { name: "The Tree",  tagline: "Grows stronger with every clean day" },
  wolf: { name: "The Wolf",  tagline: "Gets stronger every day you hold the line" },
};

export function CompanionAvatar({ type, day, stage: stageOverride, relapseCount = 0, className }: Props) {
  const computedStage = type === "wolf" ? wolfDayToStage(day) : dayToStage(day);
  const stage = stageOverride !== undefined ? Math.min(stageOverride, STAGES[type].length - 1) : computedStage;
  const StageComponent = STAGES[type][stage];

  const prevRelapse = useRef(relapseCount);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (relapseCount > prevRelapse.current) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 1000);
      prevRelapse.current = relapseCount;
      return () => clearTimeout(t);
    }
    prevRelapse.current = relapseCount;
  }, [relapseCount]);

  return (
    <div
      className={`transition-transform ${animating ? "companion-relapse" : ""} ${className ?? ""}`}
      style={{ width: "100%", height: "100%" }}
    >
      <StageComponent />
    </div>
  );
}

/** Render a specific stage index regardless of day — for previews. */
export function CompanionStage({
  type,
  stage,
  className,
}: {
  type: CompanionType;
  stage: number;
  className?: string;
}) {
  const StageComponent = STAGES[type][stage];
  return <StageComponent className={className} />;
}

import { useEffect, useRef, useState } from "react";
import { TREE_STAGES } from "./TreeStages";
import { MAN_STAGES } from "./ManStages";
import { WOMAN_STAGES } from "./WomanStages";

export type CompanionType = "tree" | "man" | "woman";

interface Props {
  type: CompanionType;
  day: number;
  relapseCount?: number; // increment to trigger regression animation
  className?: string;
}

export const STAGE_DAYS = [0, 7, 14, 30, 60, 90] as const;

export function dayToStage(day: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (day >= 90) return 5;
  if (day >= 60) return 4;
  if (day >= 30) return 3;
  if (day >= 14) return 2;
  if (day >= 7)  return 1;
  return 0;
}

const STAGES = {
  tree:  TREE_STAGES,
  man:   MAN_STAGES,
  woman: WOMAN_STAGES,
} as const;

export const COMPANION_LABELS: Record<CompanionType, { name: string; tagline: string }> = {
  tree:  { name: "The Tree",  tagline: "Grows stronger with every clean day" },
  man:   { name: "The Man",   tagline: "Evolves from boy to disciplined man" },
  woman: { name: "The Woman", tagline: "Blossoms from girl to accomplished woman" },
};

export function CompanionAvatar({ type, day, relapseCount = 0, className }: Props) {
  const stage = dayToStage(day);
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
    >
      <StageComponent />
    </div>
  );
}

/** Render a specific stage index (0–5) regardless of day — for previews. */
export function CompanionStage({
  type,
  stage,
  className,
}: {
  type: CompanionType;
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
}) {
  const StageComponent = STAGES[type][stage];
  return <StageComponent className={className} />;
}

// ─── Stopamine Badge System ───────────────────────────────────────────────────
// 11 milestones from Day 1 to Day 365.
// Each badge is the identity a man earns — not a label, a name he goes by.

export type Badge = {
  day: number;
  name: string;
  symbol: string;  // single char / emoji used as the badge icon
  color: string;   // primary badge color
  glow: string;    // rgba version for glow
  desc: string;    // short tooltip / motivational caption
};

export const BADGES: Badge[] = [
  { day:   1, name: "Spark",    symbol: "✦", color: "#E07A45", glow: "rgba(224,122,69,0.40)",  desc: "First 24 hours. The hardest step taken." },
  { day:   3, name: "Riser",   symbol: "↑", color: "#D06030", glow: "rgba(208,96,48,0.40)",   desc: "Past the first wave. You're still here." },
  { day:   7, name: "Awaken",  symbol: "◎", color: "#9060C8", glow: "rgba(144,96,200,0.40)",  desc: "A week of clarity. Brain fog lifting." },
  { day:  14, name: "Clarity", symbol: "◆", color: "#4A8FCC", glow: "rgba(74,143,204,0.40)",  desc: "Two weeks. Rewiring has begun." },
  { day:  21, name: "Warrior", symbol: "⬡", color: "#7050C0", glow: "rgba(112,80,192,0.40)",  desc: "Three weeks. Discipline is your identity now." },
  { day:  30, name: "Ironmind",symbol: "⬢", color: "#3870B0", glow: "rgba(56,112,176,0.40)",  desc: "One month. You outlasted your old self." },
  { day:  45, name: "Forge",   symbol: "▲", color: "#B84830", glow: "rgba(184,72,48,0.40)",   desc: "45 days. Built in the fire." },
  { day:  60, name: "Titan",   symbol: "⬛", color: "#507090", glow: "rgba(80,112,144,0.40)",  desc: "Two months. A fundamentally different person." },
  { day:  90, name: "Gorilla", symbol: "◉", color: "#2E7A50", glow: "rgba(46,122,80,0.40)",   desc: "Full dopamine reset. You won." },
  { day: 180, name: "Apex",    symbol: "★", color: "#C4873A", glow: "rgba(196,135,58,0.40)",  desc: "Six months. Mastery, not willpower." },
  { day: 365, name: "Legend",  symbol: "♛", color: "#D4AF37", glow: "rgba(212,175,55,0.40)",  desc: "One year. You redefined who you are." },
];

/** Current highest earned badge for a given day count */
export function currentBadge(day: number): Badge | null {
  const earned = BADGES.filter((b) => day >= b.day);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

/** Next badge not yet earned */
export function nextBadge(day: number): (Badge & { daysAway: number }) | null {
  const next = BADGES.find((b) => day < b.day);
  if (!next) return null;
  return { ...next, daysAway: next.day - day };
}

/** All badges split into earned / upcoming */
export function badgeSplit(day: number) {
  const earned   = BADGES.filter((b) => day >= b.day);
  const upcoming = BADGES.filter((b) => day <  b.day);
  return { earned, upcoming };
}

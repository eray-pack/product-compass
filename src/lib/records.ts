// Personal best scores per arcade game, stored locally on this device.
// This exists so the "Your Records" board only ever shows REAL data the
// user earned — no fabricated leaderboards (App Store 4.3(a) compliance).

export type GameId = "steadyhand" | "clarityclimb" | "coldswitch" | "mindpulse";

const KEY = "stopamine.records.v1";

export function readRecords(): Partial<Record<GameId, number>> {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// Only writes when the score beats the stored best — callers can fire this
// freely on every score change without thrashing localStorage.
export function submitRecord(game: GameId, score: number) {
  if (!Number.isFinite(score) || score <= 0) return;
  try {
    const records = readRecords();
    if ((records[game] ?? 0) >= score) return;
    records[game] = Math.round(score);
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // Storage unavailable (private mode, quota) — records are best-effort.
  }
}

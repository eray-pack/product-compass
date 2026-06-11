// Native App Store rating prompt (SKStoreReviewController via Capacitor).
// Apple's sanctioned way to convert peak moments into REAL App Store reviews —
// the OS draws the sheet, the user writes their own words, and iOS itself
// limits frequency (~3x/year). We additionally gate locally so we only ask at
// genuinely good moments, never during a rough patch.
import { Capacitor } from "@capacitor/core";

const ASKED_KEY = "stopamine.reviewAskedAt";
const MIN_DAYS_BETWEEN_ASKS = 60;

export async function maybeRequestAppReview(opts: { day: number; strikes: number }) {
  if (!Capacitor.isNativePlatform()) return;
  // Only ask users in a good place: a few days in, no slips this streak
  if (opts.day < 3 || opts.strikes > 0) return;
  try {
    const last = Number(localStorage.getItem(ASKED_KEY) ?? 0);
    if (Date.now() - last < MIN_DAYS_BETWEEN_ASKS * 86400000) return;
    localStorage.setItem(ASKED_KEY, String(Date.now()));
    const { InAppReview } = await import("@capacitor-community/in-app-review");
    await InAppReview.requestReview();
  } catch {
    // Never let a review prompt failure surface to the user
  }
}

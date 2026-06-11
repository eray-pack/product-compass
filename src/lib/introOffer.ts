// ── Real intro-offer window ────────────────────────────────────────────────────
// The paywall countdown used to reset on every open (fake urgency — exactly the
// template pattern App Review flagged under 4.3(a)). Instead we persist the
// FIRST ever paywall view and run one honest 24-hour window from it. Once it
// expires, callers hide the timer entirely — it never restarts.

const STORAGE_KEY = "stopamine.introOfferStart";
export const INTRO_OFFER_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Ms remaining in the one-time 24h intro window; 0 once expired (or on SSR). */
export function getIntroOfferRemaining(): number {
  // SSR / pre-hydration: no storage, so render no timer rather than a fake one
  if (typeof window === "undefined" || typeof localStorage === "undefined") return 0;

  let start = Number(localStorage.getItem(STORAGE_KEY));
  if (!Number.isFinite(start) || start <= 0) {
    start = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, String(start));
    } catch {
      // Storage full / private mode — still show this session's window honestly
    }
  }
  return Math.max(0, start + INTRO_OFFER_WINDOW_MS - Date.now());
}

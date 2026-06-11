import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Crown, Loader2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { purchaseMonthly, purchaseAnnual, restorePurchases } from "@/lib/purchases";
import { getIntroOfferRemaining } from "@/lib/introOffer";

export const Route = createFileRoute("/paywall")({
  component: Paywall,
});

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG        = "#08090e";
const CARD_BG   = "rgba(255,255,255,0.04)";
const CARD_BD   = "rgba(255,255,255,0.08)";
const G         = "#C4873A";
const G_GLOW    = "rgba(196,135,58,0.18)";
const G_MUTED   = "rgba(196,135,58,0.12)";
const TEXT      = "rgba(255,255,255,0.88)";
const TEXT_SUB  = "rgba(255,255,255,0.38)";
const TEXT_DIM  = "rgba(255,255,255,0.22)";

// ── Motion ─────────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const up = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

// ── Static data ────────────────────────────────────────────────────────────────
// No invented users, quotes, ratings or stats anywhere below — App Review
// (4.3a) pattern-matches fabricated social proof. Everything here is a real,
// verifiable capability of the app.
const VALUE_PROPS = [
  { title: "Multi-addiction tracking", text: "Quit more than one habit at once — each with its own streak, analytics and milestones." },
  { title: "AI recovery coach",        text: "Personalized reframes and urge support, any hour you need it — including 2am." },
  { title: "20+ psychological tools",  text: "Urge surfing, cold exposure, craving games and more, grounded in CBT techniques." },
  { title: "Honest 3-strike system",   text: "A relapse doesn't erase your progress. Log it honestly and keep your momentum." },
];

// Rotating strip of real app capabilities (replaced a fabricated "live user
// activity" feed with invented names)
const FEATURE_TICKER = [
  "Track multiple addictions side-by-side",
  "AI coach for the urges that hit at 2am",
  "20+ psychological tools, grounded in CBT",
  "3-strike system — relapse without losing everything",
  "Sacred Tree & Wolf companion evolve over 90 days",
];

const FEATURES = [
  "AI Coach — personalized reframes when you need them most",
  "Progress page — full analytics, streaks & milestone timeline",
  "9 PRO craving games — Cold Switch, Void Stare, Echo Chamber & more",
  "Sacred Tree & Wolf companion — evolve them over 90 days",
  "Community — create rooms, connect with others on the same path",
  "XP Multiplier — bonus XP for deep streak milestones",
  "Honest 3-strike system — a relapse logs honestly, momentum survives",
];

type Stage = "main" | "final" | "upsell";

// ── Main paywall sparkle particles — slow drifting gold ────────────────────────
const MAIN_SPARKLES = [
  { x: 5,  y: 8,  size: 2.0, opacity: 0.58, delay: 0.0,  dur: 9.0 },
  { x: 85, y: 12, size: 1.8, opacity: 0.48, delay: 2.2,  dur: 11.0 },
  { x: 22, y: 35, size: 2.5, opacity: 0.52, delay: 1.1,  dur: 8.5 },
  { x: 78, y: 42, size: 2.0, opacity: 0.44, delay: 3.5,  dur: 10.0 },
  { x: 45, y: 18, size: 1.6, opacity: 0.62, delay: 0.7,  dur: 9.5 },
  { x: 92, y: 55, size: 1.8, opacity: 0.38, delay: 4.0,  dur: 12.0 },
  { x: 8,  y: 60, size: 2.2, opacity: 0.52, delay: 1.8,  dur: 8.0 },
  { x: 65, y: 72, size: 2.5, opacity: 0.48, delay: 5.0,  dur: 10.5 },
  { x: 38, y: 80, size: 1.5, opacity: 0.44, delay: 2.7,  dur: 9.0 },
  { x: 88, y: 78, size: 2.0, opacity: 0.38, delay: 1.4,  dur: 11.5 },
  { x: 18, y: 90, size: 1.8, opacity: 0.48, delay: 6.2,  dur: 8.5 },
  { x: 55, y: 28, size: 2.2, opacity: 0.52, delay: 3.8,  dur: 10.0 },
  { x: 72, y: 15, size: 1.5, opacity: 0.44, delay: 0.5,  dur: 9.5 },
  { x: 30, y: 65, size: 2.0, opacity: 0.58, delay: 4.6,  dur: 11.0 },
  { x: 95, y: 32, size: 1.8, opacity: 0.38, delay: 2.0,  dur: 8.0 },
  { x: 12, y: 48, size: 2.5, opacity: 0.48, delay: 5.5,  dur: 10.5 },
  { x: 60, y: 95, size: 1.5, opacity: 0.52, delay: 1.5,  dur: 9.0 },
  { x: 42, y: 5,  size: 2.0, opacity: 0.44, delay: 7.0,  dur: 12.0 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
// h:mm:ss above an hour, m:ss below — the intro window is 24h, so a pure
// minutes display would read as an absurd "1439:59"
function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

// ── Main component ─────────────────────────────────────────────────────────────
function Paywall() {
  const [, update]     = useAppState();
  const navigate       = useNavigate();
  const [stage, setStage]       = useState<Stage>("main");
  const [plan, setPlan]         = useState<"annual" | "monthly">("annual");
  // Real one-time intro window (ms). Starts at 0 so SSR/first paint never
  // shows a timer the client would have to correct (hydration-safe).
  const [introMs, setIntroMs]   = useState(0);
  const [feedIdx, setFeedIdx]   = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring]   = useState(false);

  useEffect(() => {
    // Recompute from the persisted timestamp every tick (drift-proof, and the
    // timer can never restart — it hides itself once the 24h window passes)
    setIntroMs(getIntroOfferRemaining());
    const t = setInterval(() => setIntroMs(getIntroOfferRemaining()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % FEATURE_TICKER.length), 2800);
    return () => clearInterval(t);
  }, []);

  // Main paywall — routes by selected plan card
  const subscribe = async () => {
    setPurchasing(true);
    try {
      const ok = plan === "annual" ? await purchaseAnnual() : await purchaseMonthly();
      if (ok) { update({ paywallSeen: true, isPremium: true }); setStage("upsell"); }
    } catch (e) { console.error(e); }
    finally { setPurchasing(false); }
  };

  // Final offer — always annual (that screen pitches the real annual plan)
  const subscribeFinal = async () => {
    setPurchasing(true);
    try {
      const ok = await purchaseAnnual();
      if (ok) { update({ paywallSeen: true, isPremium: true }); setStage("upsell"); }
    } catch (e) { console.error(e); }
    finally { setPurchasing(false); }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const ok = await restorePurchases();
      if (ok) { update({ paywallSeen: true, isPremium: true }); navigate({ to: "/" }); }
      else alert("No active subscription found.");
    } finally { setRestoring(false); }
  };

  const continueFree    = () => setStage("final");
  const skipForReal     = () => { update({ paywallSeen: true }); navigate({ to: "/" }); };
  const finishUpsell = () => navigate({ to: "/" });

  // ── POST-PURCHASE WELCOME ──────────────────────────────────────────────────
  // The old "upsell" stage sold Momentum Shield $2.99 / Golden Tree Skin $1.99 /
  // Elite Status $9.99/mo with NO StoreKit products and NO functional effect
  // (momentumShieldDays was never read anywhere) — priced fake IAPs are an
  // instant App Review rejection. PRO purchase now lands on an honest welcome.
  if (stage === "upsell") {
    return (
      <div style={{ minHeight: "100svh", background: BG, fontFamily: "DM Sans, sans-serif" }}>
        <motion.div className="mx-auto w-full max-w-md px-5 pt-24 pb-10 flex flex-col items-center text-center"
          variants={stagger} initial="hidden" animate="show">

          <motion.div variants={up} style={{
            width: 84, height: 84, borderRadius: "50%", marginBottom: 26,
            background: `radial-gradient(circle, ${G}22 0%, transparent 70%)`,
            border: `1.5px solid ${G}55`,
            boxShadow: `0 0 44px ${G_GLOW}`,
            display: "grid", placeItems: "center",
          }}>
            <Crown style={{ width: 36, height: 36, color: G }} />
          </motion.div>

          <motion.h1 variants={up} className="text-[34px] font-bold leading-tight mb-3"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif", color: TEXT }}>
            PRO unlocked.
          </motion.h1>

          <motion.p variants={up} className="text-sm mb-10" style={{ color: TEXT_SUB, lineHeight: 1.7, maxWidth: 300 }}>
            Your full recovery toolkit is open — multi-habit tracking, the AI coach,
            every psychological tool, and your companion\'s complete journey.
          </motion.p>

          <motion.div variants={up} style={{ width: "100%" }}>
            <motion.button onClick={finishUpsell} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              style={{
                width: "100%", height: 56, borderRadius: 16, fontSize: 15, fontWeight: 700,
                background: `linear-gradient(135deg, ${G}, #a07830)`,
                color: "#080a0e", border: "none",
                boxShadow: `0 0 32px ${G_GLOW}`,
                cursor: "pointer",
              }}>
              Start your journey
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── FINAL (last chance at the real annual rate) ───────────────────────────
  // Same dramatic design, honest numbers: it sells the REAL $39.99/yr plan
  // ($3.33/mo — 83% less per month than $19.99 monthly), no invented discount.
  if (stage === "final") {

    // Deterministic sparkle positions — no jitter on re-render
    const SPARKLES = [
      { x: 8,  y: 14, size: 2.5, delay: 0.0,  dur: 3.8 },
      { x: 88, y: 9,  size: 2.0, delay: 0.9,  dur: 4.2 },
      { x: 22, y: 72, size: 3.0, delay: 0.4,  dur: 3.5 },
      { x: 75, y: 68, size: 2.5, delay: 1.6,  dur: 4.0 },
      { x: 50, y: 5,  size: 2.0, delay: 0.7,  dur: 3.6 },
      { x: 93, y: 42, size: 1.8, delay: 1.2,  dur: 4.5 },
      { x: 6,  y: 55, size: 2.2, delay: 0.3,  dur: 3.9 },
      { x: 62, y: 88, size: 2.8, delay: 1.8,  dur: 3.4 },
      { x: 38, y: 92, size: 1.8, delay: 0.6,  dur: 4.1 },
      { x: 82, y: 78, size: 2.0, delay: 1.0,  dur: 3.7 },
      { x: 18, y: 38, size: 1.6, delay: 2.1,  dur: 4.3 },
      { x: 68, y: 22, size: 2.4, delay: 1.4,  dur: 3.5 },
    ];

    return (
      <div style={{
        minHeight: "100svh", fontFamily: "DM Sans, sans-serif",
        position: "relative", overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 28%, #1a0905 0%, #0e0807 40%, #000000 100%)",
      }}>

        {/* ── Aurora: crimson + ember gold blobs ── */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <motion.div
            animate={{ x: ["0vw","22vw","42vw","18vw","0vw"], y: ["0vh","6vh","-4vh","8vh","0vh"],
              scale: [1, 1.08, 0.96, 1.05, 1], opacity: [0.20, 0.26, 0.18, 0.24, 0.20] }}
            transition={{ duration: 46, ease: "easeInOut", repeat: Infinity }}
            style={{ position: "absolute", top: "-18%", left: "-22%",
              width: "80vw", height: "80vw", borderRadius: "50%",
              background: "radial-gradient(circle, #dc2626 0%, transparent 68%)",
              filter: "blur(130px)" }}
          />
          <motion.div
            animate={{ x: ["0vw","-18vw","-36vw","-14vw","0vw"], y: ["0vh","8vh","2vh","10vh","0vh"],
              scale: [1, 0.94, 1.10, 0.98, 1], opacity: [0.18, 0.14, 0.22, 0.16, 0.18] }}
            transition={{ duration: 52, ease: "easeInOut", repeat: Infinity, delay: 6 }}
            style={{ position: "absolute", top: "5%", right: "-25%",
              width: "72vw", height: "72vw", borderRadius: "50%",
              background: "radial-gradient(circle, #C4873A 0%, transparent 68%)",
              filter: "blur(120px)" }}
          />
          <motion.div
            animate={{ x: ["0vw","12vw","-8vw","16vw","0vw"], y: ["0vh","-6vh","4vh","-8vh","0vh"],
              scale: [1, 1.06, 0.98, 1.04, 1], opacity: [0.12, 0.18, 0.10, 0.16, 0.12] }}
            transition={{ duration: 38, ease: "easeInOut", repeat: Infinity, delay: 12 }}
            style={{ position: "absolute", bottom: "-10%", left: "15%",
              width: "60vw", height: "60vw", borderRadius: "50%",
              background: "radial-gradient(circle, #b91c1c 0%, transparent 65%)",
              filter: "blur(110px)" }}
          />
        </div>

        {/* ── Breathing mesh grid ── */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.030, 0.048, 0.030] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
          style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        >
          <svg width="100%" height="100%" viewBox="0 0 390 844"
            preserveAspectRatio="xMidYMid slice" fill="none">
            <line x1="-20" y1="0"   x2="240" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.6"/>
            <line x1="130" y1="0"   x2="390" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.5"/>
            <line x1="260" y1="0"   x2="520" y2="844" stroke="rgba(220,38,38,0.7)"   strokeWidth="0.5"/>
            <line x1="420" y1="0"   x2="160" y2="844" stroke="rgba(196,135,58,0.8)"  strokeWidth="0.6"/>
            <line x1="280" y1="0"   x2="20"  y2="844" stroke="rgba(220,38,38,0.7)"   strokeWidth="0.5"/>
          </svg>
        </motion.div>

        {/* ── Floating gold sparkle particles ── */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {SPARKLES.map((p, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -22, 0], opacity: [0, 0.75, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
              style={{
                position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                width: p.size, height: p.size, borderRadius: "50%",
                background: i % 3 === 0 ? "#dc2626" : "#C4873A",
                boxShadow: i % 3 === 0
                  ? "0 0 6px 2px rgba(220,38,38,0.70)"
                  : "0 0 6px 2px rgba(196,135,58,0.75)",
              }}
            />
          ))}
        </div>

        {/* ── Page content ── */}
        <motion.div
          className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
          style={{ position: "relative", zIndex: 1 }}
          variants={stagger} initial="hidden" animate="show"
        >

          {/* Close */}
          <motion.div variants={up} className="flex justify-end">
            <button onClick={skipForReal}
              style={{ width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
                color: TEXT_SUB, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Pulsing FINAL OFFER badge */}
          <motion.div variants={up} className="flex justify-center">
            <motion.span
              animate={{
                scale: [1, 1.07, 1],
                boxShadow: [
                  "0 0 0px rgba(220,38,38,0)",
                  "0 0 20px rgba(220,38,38,0.55), 0 0 40px rgba(220,38,38,0.20)",
                  "0 0 0px rgba(220,38,38,0)",
                ],
              }}
              transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ background: "rgba(220,38,38,0.16)", border: "1px solid rgba(220,38,38,0.45)", color: "#FF7575" }}
            >
              ⚡ Final Offer
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={up} className="text-center space-y-2">
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(2rem, 8vw, 2.6rem)", fontWeight: 700, lineHeight: 1.15, color: TEXT }}>
              Wait — one last thing.
            </h1>
            <p style={{ fontSize: 14, color: TEXT_SUB }}>
              Last chance at the annual rate before you continue free.
            </p>
          </motion.div>

          {/* Countdown — sharp, crisp. Real persisted 24h intro window; once it
              expires the row disappears for good instead of restarting. */}
          {introMs > 0 && (
            <motion.div variants={up} className="flex justify-center">
              <div style={{
                borderRadius: 24,
                background: "rgba(220,38,38,0.10)",
                border: "1px solid rgba(220,38,38,0.38)",
                padding: "8px 20px",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 0 18px rgba(220,38,38,0.18)",
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                    background: "#FF4444", boxShadow: "0 0 8px rgba(255,68,68,0.80)", flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 14, fontWeight: 800, letterSpacing: "0.04em",
                  color: "#FF5555", fontVariantNumeric: "tabular-nums",
                  textShadow: "0 0 12px rgba(255,85,85,0.55)",
                }}>
                  Intro window ends in {fmt(introMs)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Offer card */}
          <motion.div variants={up} style={{
            borderRadius: 22, padding: "24px 22px",
            background: "linear-gradient(145deg, rgba(30,14,6,0.92) 0%, rgba(18,8,2,0.96) 100%)",
            border: `1px solid ${G}55`,
            boxShadow: `0 0 0 1px rgba(196,135,58,0.10), 0 8px 48px rgba(196,135,58,0.18), 0 2px 12px rgba(0,0,0,0.60)`,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          }}>
            {/* Real numbers only: $39.99/yr = $3.33/mo, vs $19.99/mo monthly
                — that's a real 83% lower per-month cost, nothing invented */}
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.38em", textTransform: "uppercase", color: G }}>
                Annual — Best Value
              </p>
              <p style={{ fontSize: 11, color: TEXT_DIM }}>vs $19.99/mo monthly</p>
            </div>

            <div className="flex items-end gap-2 mt-2 mb-1">
              <p style={{ fontSize: 52, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em" }}>
                $3.33
              </p>
              <p style={{ fontSize: 15, fontWeight: 400, color: TEXT_SUB, paddingBottom: 8 }}>/month</p>
            </div>
            <p style={{ fontSize: 12, color: TEXT_DIM, marginBottom: 18 }}>$39.99 billed once a year — 83% less than monthly</p>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${G}33, transparent)`, marginBottom: 16 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Everything in the full PRO plan",
                "$3.33/mo billed annually — 83% less than monthly",
                "Cancel anytime — no questions asked",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div style={{ width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(196,135,58,0.14)", border: `1px solid ${G}55`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check style={{ width: 11, height: 11, color: G, strokeWidth: 3 }} />
                  </div>
                  <p style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button
              onClick={subscribeFinal} disabled={purchasing}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: purchasing ? "none" : [
                  `0 4px 24px rgba(196,135,58,0.30)`,
                  `0 4px 42px rgba(196,135,58,0.58)`,
                  `0 4px 24px rgba(196,135,58,0.30)`,
                ],
              }}
              transition={{ type: "spring", stiffness: 500, damping: 20,
                boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
              style={{
                width: "100%", height: 60, borderRadius: 18, fontSize: 16, fontWeight: 800,
                background: `linear-gradient(135deg, #E8A84A 0%, ${G} 50%, #b86a1a 100%)`,
                color: "#0e0807", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: purchasing ? 0.7 : 1,
                letterSpacing: "0.01em",
              }}>
              {purchasing
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                : "Get Annual — $3.33/mo"}
            </motion.button>

            <button onClick={skipForReal} style={{
              width: "100%", height: 44, borderRadius: 14, fontSize: 13,
              background: "none", border: "1px solid rgba(255,255,255,0.07)",
              color: TEXT_DIM, cursor: "pointer",
            }}>
              No thanks, continue free
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: TEXT_DIM,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Lock style={{ width: 11, height: 11 }} />
              7-day free trial · Cancel anytime · Private by design
            </p>

            {/* Apple 3.1.2: auto-renew disclosure + restore/terms/privacy on every purchase screen */}
            <p style={{ textAlign: "center", fontSize: 10, color: TEXT_DIM, marginTop: 6 }}>
              Subscription auto-renews until cancelled. Manage in App Store settings.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8, fontSize: 11 }}>
              <button onClick={handleRestore} disabled={restoring}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 0 }}>
                {restoring ? "Restoring…" : "Restore Purchases"}
              </button>
              <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
              <a href="/terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms</a>
              <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
              <a href="/privacy" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy</a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    );
  }

  // ── MAIN ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100svh",
      fontFamily: "DM Sans, sans-serif",
      position: "relative",
      overflow: "hidden",
      background: "radial-gradient(ellipse at 50% 32%, #0c0812 0%, #07050f 48%, #030205 100%)",
    }}>

      {/* ── Aurora blobs — gold + indigo, calm and slow ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%","10%","18%","6%","0%"], y: ["0%","5%","-3%","7%","0%"], scale: [1,1.06,0.96,1.04,1], opacity: [0.18,0.24,0.16,0.22,0.18] }}
          transition={{ duration: 50, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute", top: "-20%", left: "5%",
            width: "80vw", height: "80vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.30) 0%, transparent 65%)",
            filter: "blur(150px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","-12%","-20%","-8%","0%"], y: ["0%","7%","3%","9%","0%"], scale: [1,0.92,1.10,0.96,1], opacity: [0.14,0.10,0.18,0.12,0.14] }}
          transition={{ duration: 58, ease: "easeInOut", repeat: Infinity, delay: 10 }}
          style={{
            position: "absolute", top: "8%", right: "-22%",
            width: "68vw", height: "68vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(80,110,200,0.28) 0%, transparent 65%)",
            filter: "blur(140px)",
          }}
        />
        <motion.div
          animate={{ x: ["0%","8%","-5%","12%","0%"], y: ["0%","-10%","6%","-8%","0%"], scale: [1,1.08,0.94,1.05,1], opacity: [0.10,0.16,0.08,0.14,0.10] }}
          transition={{ duration: 44, ease: "easeInOut", repeat: Infinity, delay: 20 }}
          style={{
            position: "absolute", top: "45%", left: "-18%",
            width: "58vw", height: "58vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,135,58,0.22) 0%, transparent 65%)",
            filter: "blur(130px)",
          }}
        />
      </div>

      {/* ── Interconnected network grid — pulses on 6s cycle ── */}
      <motion.div
        aria-hidden
        animate={{ opacity: [0.22, 0.48, 0.22] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
          {/* Network lines */}
          <g stroke="rgba(196,135,58,0.38)" strokeWidth="0.55">
            <line x1="0"   y1="120" x2="80"  y2="60"/>
            <line x1="80"  y1="60"  x2="195" y2="90"/>
            <line x1="195" y1="90"  x2="310" y2="50"/>
            <line x1="310" y1="50"  x2="390" y2="140"/>
            <line x1="0"   y1="120" x2="30"  y2="250"/>
            <line x1="80"  y1="60"  x2="130" y2="300"/>
            <line x1="195" y1="90"  x2="260" y2="230"/>
            <line x1="310" y1="50"  x2="360" y2="290"/>
            <line x1="390" y1="140" x2="360" y2="290"/>
            <line x1="30"  y1="250" x2="130" y2="300"/>
            <line x1="130" y1="300" x2="260" y2="230"/>
            <line x1="260" y1="230" x2="360" y2="290"/>
            <line x1="30"  y1="250" x2="60"  y2="420"/>
            <line x1="130" y1="300" x2="190" y2="380"/>
            <line x1="260" y1="230" x2="310" y2="450"/>
            <line x1="360" y1="290" x2="390" y2="400"/>
            <line x1="60"  y1="420" x2="190" y2="380"/>
            <line x1="190" y1="380" x2="310" y2="450"/>
            <line x1="310" y1="450" x2="390" y2="400"/>
            <line x1="60"  y1="420" x2="20"  y2="560"/>
            <line x1="190" y1="380" x2="140" y2="520"/>
            <line x1="310" y1="450" x2="250" y2="590"/>
            <line x1="390" y1="400" x2="370" y2="540"/>
            <line x1="20"  y1="560" x2="140" y2="520"/>
            <line x1="140" y1="520" x2="250" y2="590"/>
            <line x1="250" y1="590" x2="370" y2="540"/>
            <line x1="20"  y1="560" x2="80"  y2="690"/>
            <line x1="140" y1="520" x2="200" y2="650"/>
            <line x1="250" y1="590" x2="320" y2="710"/>
            <line x1="370" y1="540" x2="390" y2="660"/>
            <line x1="80"  y1="690" x2="200" y2="650"/>
            <line x1="200" y1="650" x2="320" y2="710"/>
            <line x1="320" y1="710" x2="390" y2="660"/>
            <line x1="80"  y1="690" x2="30"  y2="820"/>
            <line x1="200" y1="650" x2="195" y2="780"/>
            <line x1="320" y1="710" x2="360" y2="830"/>
            <line x1="30"  y1="820" x2="195" y2="780"/>
            <line x1="195" y1="780" x2="360" y2="830"/>
            {/* Cross-diagonals for depth */}
            <line x1="80"  y1="60"  x2="260" y2="230"/>
            <line x1="195" y1="90"  x2="130" y2="300"/>
            <line x1="60"  y1="420" x2="140" y2="520"/>
            <line x1="190" y1="380" x2="250" y2="590"/>
            <line x1="140" y1="520" x2="200" y2="650"/>
            <line x1="80"  y1="690" x2="195" y2="780"/>
          </g>
          {/* Gold network nodes */}
          <g fill="rgba(196,135,58,0.55)">
            <circle cx="80"  cy="60"  r="2.5"/><circle cx="195" cy="90"  r="2.0"/><circle cx="310" cy="50"  r="2.5"/>
            <circle cx="130" cy="300" r="3.0"/><circle cx="260" cy="230" r="2.5"/><circle cx="360" cy="290" r="2.0"/>
            <circle cx="190" cy="380" r="3.0"/><circle cx="310" cy="450" r="2.5"/>
            <circle cx="140" cy="520" r="3.0"/><circle cx="250" cy="590" r="2.5"/>
            <circle cx="200" cy="650" r="3.0"/><circle cx="320" cy="710" r="2.5"/>
            <circle cx="195" cy="780" r="2.5"/>
          </g>
          {/* Blue accent nodes */}
          <g fill="rgba(100,140,220,0.42)">
            <circle cx="195" cy="90"  r="1.5"/>
            <circle cx="60"  cy="420" r="1.5"/>
            <circle cx="370" cy="540" r="1.5"/>
            <circle cx="195" cy="780" r="1.5"/>
          </g>
        </svg>
      </motion.div>

      {/* ── Slow drifting gold + blue sparkle particles ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {MAIN_SPARKLES.map((p, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -28, 0], opacity: [0, p.opacity, 0], scale: [0.4, 1.1, 0.4] }}
            transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: "50%",
              background: i % 5 === 0 ? "rgba(110,150,230,0.95)" : "#C4873A",
              boxShadow: i % 5 === 0
                ? "0 0 5px 1px rgba(110,150,230,0.55)"
                : "0 0 5px 2px rgba(196,135,58,0.60)",
            }}
          />
        ))}
      </div>

      {/* ── Page content ── */}
      <motion.div className="mx-auto w-full max-w-md px-5 pt-10 pb-12 flex flex-col gap-6"
        style={{ position: "relative", zIndex: 1 }}
        variants={stagger} initial="hidden" animate="show">

        {/* Close */}
        <motion.div variants={up} className="flex justify-end">
          <button onClick={finishUpsell}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(196,135,58,0.22)",
              color: TEXT_SUB, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
            <X className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Hero */}
        <motion.div variants={up} className="text-center space-y-2">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.5em", textTransform: "uppercase",
            color: "#C9A84C",
            padding: "4px 16px", borderRadius: 99,
            background: "rgba(196,135,58,0.08)",
            border: "1px solid rgba(196,135,58,0.24)",
          }}>
            ✦ PRO PLAN ✦
          </span>
          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "clamp(2rem, 8vw, 2.6rem)",
            fontWeight: 700, lineHeight: 1.15, color: TEXT,
            textShadow: "0 0 80px rgba(196,135,58,0.14)",
          }}>
            Your recovery,<br />fully unlocked.
          </h1>
          <p style={{ color: TEXT_SUB, fontSize: 14 }}>
            Join the men who chose differently.
          </p>
        </motion.div>

        {/* Positioning line — replaced fabricated avatars + invented member
            count ("46,847 others") with an honest statement */}
        <motion.div variants={up} className="flex items-center justify-center gap-3">
          <p style={{ fontSize: 12, color: TEXT_SUB }}>
            Built for people serious about quitting —{" "}
            <span style={{ color: TEXT, fontWeight: 600 }}>no gimmicks, no shortcuts</span>
          </p>
        </motion.div>

        {/* Feature ticker — rotates real capabilities, not invented user activity */}
        <motion.div variants={up} style={{
          borderRadius: 24,
          background: "linear-gradient(145deg, rgba(12,8,18,0.78) 0%, rgba(7,5,15,0.84) 100%)",
          border: "1px solid rgba(196,135,58,0.18)",
          padding: "10px 16px", textAlign: "center", overflow: "hidden",
          backdropFilter: "blur(10px)",
          boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.05), 0 2px 20px rgba(0,0,0,0.22)",
        }}>
          <AnimatePresence mode="wait">
            <motion.p key={feedIdx} style={{ fontSize: 12, color: TEXT_SUB }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}>
              ✦ {FEATURE_TICKER[feedIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Countdown — refined dark gold, sophisticated pulse. Real persisted
            24h intro window: hides forever once expired, never resets. */}
        {introMs > 0 && (
          <motion.div variants={up} className="flex justify-center">
            <div style={{
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(28,20,8,0.88) 0%, rgba(16,11,4,0.92) 100%)",
              border: "1px solid rgba(196,135,58,0.34)",
              padding: "8px 20px",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 0 22px rgba(196,135,58,0.10), inset 0 1px 0 rgba(196,135,58,0.14)",
              backdropFilter: "blur(10px)",
            }}>
              <motion.span
                animate={{ opacity: [1, 0.30, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                  background: "#C9A84C", boxShadow: "0 0 6px rgba(201,168,76,0.70)", flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
                color: "#C9A84C", fontVariantNumeric: "tabular-nums",
              }}>
                Intro window ends in {fmt(introMs)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Pricing cards — etched gold borders */}
        <motion.div variants={up} className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button onClick={() => setPlan("monthly")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            background: plan === "monthly"
              ? "linear-gradient(145deg, rgba(196,135,58,0.10) 0%, rgba(196,135,58,0.05) 100%)"
              : "rgba(255,255,255,0.025)",
            border: `1px solid ${plan === "monthly" ? "rgba(196,135,58,0.52)" : "rgba(196,135,58,0.16)"}`,
            boxShadow: plan === "monthly"
              ? "inset 0 0 0 1px rgba(196,135,58,0.08), 0 0 26px rgba(196,135,58,0.12), 0 1px 0 rgba(196,135,58,0.20) inset"
              : "inset 0 0 0 1px rgba(255,255,255,0.02)",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase",
              color: plan === "monthly" ? G : TEXT_DIM,
            }}>Monthly</p>
            <p style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: TEXT }}>
              $19.99<span style={{ fontSize: 11, fontWeight: 400, color: TEXT_SUB }}>/mo</span>
            </p>
          </button>

          {/* Annual — highlighted */}
          <button onClick={() => setPlan("annual")} style={{
            borderRadius: 18, padding: "16px 14px", textAlign: "left", cursor: "pointer",
            position: "relative",
            background: plan === "annual"
              ? "linear-gradient(145deg, rgba(196,135,58,0.12) 0%, rgba(196,135,58,0.06) 100%)"
              : "rgba(255,255,255,0.025)",
            border: `1px solid ${plan === "annual" ? "rgba(196,135,58,0.62)" : "rgba(196,135,58,0.22)"}`,
            boxShadow: plan === "annual"
              ? "inset 0 0 0 1px rgba(196,135,58,0.10), 0 0 34px rgba(196,135,58,0.16), 0 1px 0 rgba(196,135,58,0.24) inset"
              : "inset 0 0 0 1px rgba(196,135,58,0.04)",
            backdropFilter: "blur(8px)",
            transition: "all 0.3s ease",
          }}>
            <span style={{
              position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
              textTransform: "uppercase", padding: "3px 10px", borderRadius: 12,
              background: "linear-gradient(90deg, #C4873A, #E8A84A)", color: "#030205",
            }}>83% OFF</span>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: G }}>
              Annual
            </p>
            <p style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: TEXT }}>
              $3.33<span style={{ fontSize: 11, fontWeight: 400, color: TEXT_SUB }}>/mo</span>
            </p>
            <p style={{ fontSize: 10, color: TEXT_DIM }}>$39.99 billed yearly</p>
          </button>
        </motion.div>

        {plan === "annual" && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", fontSize: 12, color: TEXT_DIM, marginTop: -16 }}>
            That's less than one coffee per month.
          </motion.p>
        )}

        {/* Features */}
        <motion.div variants={up} style={{
          borderRadius: 20,
          background: "linear-gradient(145deg, rgba(12,8,18,0.86) 0%, rgba(7,5,15,0.92) 100%)",
          border: "1px solid rgba(196,135,58,0.18)",
          boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.05), 0 0 30px rgba(196,135,58,0.04)",
          padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12,
          backdropFilter: "blur(12px)",
        }}>
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(196,135,58,0.10)",
                border: "1px solid rgba(196,135,58,0.36)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                <Check style={{ width: 10, height: 10, color: G, strokeWidth: 3 }} />
              </div>
              <p style={{ fontSize: 13, color: TEXT_SUB, lineHeight: 1.4 }}>{f}</p>
            </div>
          ))}
        </motion.div>

        {/* Value props — same card scroller that used to hold fabricated
            testimonials + 5-star ratings; now sells what the app really does */}
        <motion.div variants={up}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase",
            color: TEXT_DIM, marginBottom: 12,
          }}>What makes PRO different</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {VALUE_PROPS.map(({ title, text }) => (
              <div key={title} style={{
                flexShrink: 0, width: 240, borderRadius: 18, padding: "14px 16px",
                background: "linear-gradient(145deg, rgba(12,8,18,0.90) 0%, rgba(7,5,15,0.94) 100%)",
                border: "1px solid rgba(196,135,58,0.16)",
                boxShadow: "inset 0 0 0 1px rgba(196,135,58,0.04), 0 2px 20px rgba(0,0,0,0.28)",
                display: "flex", flexDirection: "column", gap: 10,
                backdropFilter: "blur(8px)",
              }}>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: G_MUTED, border: `1px solid ${G}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Check style={{ width: 14, height: 14, color: G, strokeWidth: 3 }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{title}</p>
                </div>
                <p style={{ fontSize: 12, color: TEXT_SUB, lineHeight: 1.45 }}>{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA — brushed matte gold with shimmer sweep */}
        <motion.div variants={up} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <motion.button
            onClick={subscribe} disabled={purchasing}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{
              width: "100%", height: 58, borderRadius: 18, fontSize: 16, fontWeight: 700,
              background: "linear-gradient(145deg, #D4954A 0%, #C4873A 35%, #A87030 65%, #C08840 100%)",
              color: "#0c0812", border: "none", cursor: "pointer",
              boxShadow: "0 4px 32px rgba(196,135,58,0.28), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              position: "relative", overflow: "hidden",
              opacity: purchasing ? 0.7 : 1,
              letterSpacing: "0.01em",
            }}>
            {/* Brushed shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "280%"] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.2 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "32%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)",
                pointerEvents: "none",
              }}
            />
            {purchasing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              : "Start reclaiming your life"}
          </motion.button>

          <button onClick={continueFree} style={{
            width: "100%", height: 44, borderRadius: 14, fontSize: 13, fontWeight: 500,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(196,135,58,0.14)",
            color: TEXT_DIM, cursor: "pointer",
          }}>
            Continue with free plan
          </button>

          <button onClick={handleRestore} disabled={restoring} style={{
            width: "100%", height: 36, background: "none", border: "none",
            fontSize: 12, color: TEXT_DIM, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: restoring ? 0.5 : 1,
          }}>
            {restoring && <Loader2 className="h-3 w-3 animate-spin" />}
            Restore purchase
          </button>

          <p style={{
            textAlign: "center", fontSize: 11, color: TEXT_DIM,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Lock style={{ width: 11, height: 11 }} />
            7-day free trial · Cancel anytime · Private by design
          </p>

          {/* Apple 3.1.2: auto-renew disclosure + terms/privacy on the purchase screen */}
          <p style={{ textAlign: "center", fontSize: 10, color: TEXT_DIM, marginTop: 6 }}>
            Subscription auto-renews until cancelled. Manage in App Store settings.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 8, fontSize: 11 }}>
            <a href="/terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms of Use</a>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy Policy</a>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

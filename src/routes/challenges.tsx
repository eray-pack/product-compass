import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Coins, Check, Lock, Sparkles, Gift } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { motion } from "framer-motion";

export const Route = createFileRoute("/challenges")({
  component: ChallengesPage,
});

type Challenge = {
  id: string;
  title: string;
  desc: string;
  points: number;
  category: "Daily" | "Weekly" | "Mind" | "Body";
  pro?: boolean;
};

const CHALLENGES: Challenge[] = [
  { id: "cold-shower",  title: "Take a cold shower",        desc: "2 minutes. Reset your nervous system.",       points: 15, category: "Body"   },
  { id: "no-phone-1h", title: "1 hour phone-free",          desc: "Lock it in another room. Just exist.",         points: 20, category: "Mind"   },
  { id: "walk-30",     title: "30-minute walk outside",     desc: "Sunlight + movement = dopamine reset.",        points: 25, category: "Body"   },
  { id: "journal",     title: "Write down 3 wins",          desc: "Re-anchor your identity in progress.",         points: 10, category: "Daily"  },
  { id: "meditate",    title: "10 min meditation",          desc: "Sit with the urge. Watch it pass.",            points: 15, category: "Mind"   },
  { id: "no-social",   title: "No social media for a day",  desc: "Cut the loop. Reclaim attention.",             points: 40, category: "Weekly", pro: true },
  { id: "deep-work",   title: "2-hour deep work block",     desc: "One task. No tabs. No phone.",                 points: 35, category: "Weekly", pro: true },
  { id: "call-friend", title: "Call someone you trust",     desc: "Real connection rewires reward.",              points: 20, category: "Daily"  },
];

const REWARDS = [
  { id: "tree-leaves",    name: "Grow your Life Tree",   desc: "+50 XP boost",                              cost: 50,  icon: Sparkles },
  { id: "theme",          name: "Unlock Aurora theme",   desc: "Cosmetic upgrade",                          cost: 200, icon: Gift     },
  { id: "streak-shield",  name: "Streak Shield",         desc: "Forgive 1 slip-up without losing streak",   cost: 150, icon: Trophy   },
  { id: "custom-mantra",  name: "Custom mantra pack",    desc: "10 personalized reframes",                  cost: 120, icon: Sparkles },
];

// ── Category pill colors ──────────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  Body:   "rgba(52,211,153,0.70)",
  Mind:   "rgba(147,117,214,0.70)",
  Daily:  "rgba(201,168,76,0.70)",
  Weekly: "rgba(251,146,60,0.70)",
};

function ChallengesPage() {
  const [state, update] = useAppState();

  const completedIds = new Set(state.completedChallenges.map((c) => c.id));

  const complete = (c: Challenge) => {
    if (c.pro && !state.isPremium) { triggerPaywall(); return; }
    if (completedIds.has(c.id)) return;
    update((s) => ({
      points: s.points + c.points,
      treeXP: s.treeXP + c.points,
      completedChallenges: [...s.completedChallenges, { id: c.id, doneAt: Date.now() }],
    }));
  };

  const redeem = (cost: number, id: string) => {
    if (state.points < cost) return;
    update((s) => ({
      points: s.points - cost,
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
      treeXP: id === "tree-leaves" ? s.treeXP + 100 : s.treeXP,
    }));
  };

  return (
    <PageShell>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="px-6 pt-12">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82 }}>
          Quests
        </p>
        <h1 className="mt-2 text-3xl font-bold">Earn while you heal.</h1>
        <p style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.55 }}>
          Every challenge wires a stronger you. Earn points. Spend them on real upgrades.
        </p>
      </header>

      {/* ── Balance module ────────────────────────────────────────────────── */}
      <section className="px-6 mt-5">
        <div
          style={{
            background: "radial-gradient(ellipse at 15% 40%, rgba(201,168,76,0.12) 0%, transparent 60%), rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderTop: "1px solid rgba(201,168,76,0.22)",
            borderRadius: 24,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.75, marginBottom: 6 }}>
              Your points
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {/* Pulsing coin icon */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
              >
                <Coins style={{ height: 28, width: 28, color: "#debc7a", filter: "drop-shadow(0 0 8px rgba(222,188,122,0.60))" }} />
              </motion.div>
              <span style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                textShadow: "0 0 22px rgba(222,188,122,0.70), 0 0 48px rgba(222,188,122,0.32), 0 2px 4px rgba(0,0,0,0.60)",
              }}>
                {state.points}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", textAlign: "right", maxWidth: 130, lineHeight: 1.55 }}>
            Spend on tree growth, themes, streak shields & more.
          </p>
        </div>
      </section>

      {/* ── Challenges ────────────────────────────────────────────────────── */}
      <section className="px-6 mt-7">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82, marginBottom: 14 }}>
          Today's challenges
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CHALLENGES.map((c, i) => {
            const done = completedIds.has(c.id);
            const locked = c.pro && !state.isPremium;
            const catColor = CATEGORY_COLOR[c.category] ?? "rgba(255,255,255,0.50)";

            return (
              <motion.button
                key={c.id}
                onClick={() => complete(c)}
                disabled={done}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                whileHover={!done ? {
                  boxShadow: "0 0 0 1px rgba(201,168,76,0.20), 0 4px 24px rgba(201,168,76,0.10)",
                  borderColor: "rgba(201,168,76,0.30)",
                } : {}}
                whileTap={!done ? { scale: 0.985, transition: { duration: 0.10 } } : {}}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 20,
                  background: done
                    ? "rgba(34,197,94,0.06)"
                    : "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${done ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.09)"}`,
                  borderTop: `1px solid ${done ? "rgba(34,197,94,0.28)" : "rgba(255,255,255,0.12)"}`,
                  opacity: done ? 0.72 : 1,
                  cursor: done ? "default" : "pointer",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Trophy / check badge */}
                <div style={{ position: "relative", flexShrink: 0, width: 44, height: 44 }}>
                  {/* Ambient glow ring — only for completable */}
                  {!done && (
                    <motion.div
                      animate={{ scale: [1, 1.30, 1], opacity: [0.35, 0.06, 0.35] }}
                      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: i * 0.2 }}
                      style={{
                        position: "absolute", inset: -6, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(201,168,76,0.45) 0%, transparent 72%)",
                        filter: "blur(5px)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    display: "grid", placeItems: "center",
                    background: done
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(201,168,76,0.10)",
                    border: `1px solid ${done ? "rgba(34,197,94,0.35)" : "rgba(201,168,76,0.38)"}`,
                    boxShadow: done
                      ? "0 0 14px 2px rgba(34,197,94,0.18)"
                      : "0 0 14px 2px rgba(201,168,76,0.18)",
                  }}>
                    {done
                      ? <Check style={{ height: 18, width: 18, color: "rgba(34,197,94,0.90)" }} />
                      : <Trophy style={{ height: 18, width: 18, color: "#C9A84C", filter: "drop-shadow(0 0 5px rgba(201,168,76,0.55))" }} />
                    }
                  </div>
                </div>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: done ? "rgba(255,255,255,0.55)" : "#ffffff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </p>
                    {locked && <Lock style={{ height: 11, width: 11, color: "#C9A84C", flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.desc}
                  </p>
                  {/* Category pill */}
                  <span style={{
                    display: "inline-block",
                    marginTop: 5,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: catColor,
                    background: catColor.replace("0.70)", "0.08)"),
                    border: `1px solid ${catColor.replace("0.70)", "0.22)")}`,
                    borderRadius: 999,
                    padding: "1px 8px",
                  }}>
                    {c.category}
                  </span>
                </div>

                {/* Points micro-badge */}
                <div style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: done ? "rgba(34,197,94,0.09)" : "rgba(201,168,76,0.10)",
                  border: `1px solid ${done ? "rgba(34,197,94,0.30)" : "rgba(201,168,76,0.38)"}`,
                  color: done ? "rgba(34,197,94,0.85)" : "#debc7a",
                  textShadow: done ? "none" : "0 0 8px rgba(222,188,122,0.35)",
                }}>
                  {done
                    ? <Check style={{ height: 11, width: 11 }} />
                    : <Coins style={{ height: 11, width: 11 }} />
                  }
                  {done ? "Done" : `${c.points} pts`}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Reward shop ───────────────────────────────────────────────────── */}
      <section className="px-6 mt-8 pb-8">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.82, marginBottom: 14 }}>
          Reward shop
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REWARDS.map((r) => {
            const owned = state.treeUnlocks.includes(r.id);
            const canAfford = state.points >= r.cost;
            return (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 18px",
                  borderRadius: 20,
                  background: canAfford && !owned
                    ? "radial-gradient(ellipse at 8% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderTop: "1px solid rgba(201,168,76,0.13)",
                }}
              >
                {/* Icon badge */}
                <div style={{ position: "relative", flexShrink: 0, width: 44, height: 44 }}>
                  {canAfford && !owned && (
                    <motion.div
                      animate={{ scale: [1, 1.30, 1], opacity: [0.40, 0.08, 0.40] }}
                      transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
                      style={{
                        position: "absolute", inset: -6, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(201,168,76,0.40) 0%, transparent 72%)",
                        filter: "blur(5px)", pointerEvents: "none",
                      }}
                    />
                  )}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    display: "grid", placeItems: "center",
                    background: owned ? "rgba(34,197,94,0.08)" : canAfford ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${owned ? "rgba(34,197,94,0.28)" : canAfford ? "rgba(201,168,76,0.38)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: canAfford && !owned ? "0 0 14px 2px rgba(201,168,76,0.16)" : "none",
                  }}>
                    <r.icon style={{ height: 18, width: 18, color: owned ? "rgba(34,197,94,0.80)" : canAfford ? "#C9A84C" : "rgba(255,255,255,0.25)" }} />
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#debc7a", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.desc}
                  </p>
                </div>

                {/* Redeem button */}
                <motion.button
                  onClick={() => redeem(r.cost, r.id)}
                  disabled={owned || !canAfford}
                  whileHover={!owned && canAfford ? { scale: 1.06 } : {}}
                  whileTap={!owned && canAfford ? { scale: 0.93, transition: { type: "spring", stiffness: 500, damping: 18 } } : {}}
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    background: owned
                      ? "rgba(34,197,94,0.09)"
                      : canAfford
                      ? "rgba(201,168,76,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${owned ? "rgba(34,197,94,0.30)" : canAfford ? "rgba(201,168,76,0.40)" : "rgba(255,255,255,0.08)"}`,
                    color: owned ? "rgba(34,197,94,0.85)" : canAfford ? "#debc7a" : "rgba(255,255,255,0.22)",
                    textShadow: canAfford && !owned ? "0 0 8px rgba(222,188,122,0.35)" : "none",
                    cursor: owned || !canAfford ? "default" : "pointer",
                  }}
                >
                  {owned ? "Owned" : (
                    <>
                      <Coins style={{ height: 11, width: 11 }} /> {r.cost}
                    </>
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.22)" }}>
          More rewards unlock as your Life Tree grows.
        </p>
      </section>
    </PageShell>
  );
}

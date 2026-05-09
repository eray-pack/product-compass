import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Coins, Lock, CreditCard, Share2, Users, Crown, Globe } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useState } from "react";

export const Route = createFileRoute("/tree")({
  component: TreePage,
});

const UPGRADES = [
  { id: "leaves-gold", name: "Golden leaves", desc: "Mark a milestone forever", costPoints: 80, costMoney: 1.99 },
  { id: "branch-mind", name: "Mind branch", desc: "Adds a meditation streak slot", costPoints: 150, costMoney: 2.99 },
  { id: "branch-body", name: "Body branch", desc: "Adds a fitness streak slot", costPoints: 150, costMoney: 2.99 },
  { id: "ornament-streak", name: "Streak ornament", desc: "+30 day streak shield", costPoints: 250, costMoney: 4.99, pro: true },
  { id: "root-deep", name: "Deep roots", desc: "Permanent +10% XP from challenges", costPoints: 500, costMoney: 7.99, pro: true },
];

const RANK_BY_STAGE = ["Beginner", "Awakened", "Disciplined", "Respected", "Elite", "Legendary"];
const TOP_PCT_BY_STAGE = [78, 56, 34, 21, 12, 3];

const HALL_OF_LEGENDS = [
  { name: "Dimitri K.", day: 412, xp: 6240 },
  { name: "Samuel R.", day: 287, xp: 4980 },
  { name: "Kenji T.", day: 156, xp: 3420 },
];

function TreePage() {
  const [state, update] = useAppState();
  const day = dayCount(state.startDate);
  const stage = treeStage(state.treeXP);
  const prevThreshold = stage.stage === 0 ? 0 : [0, 100, 300, 700, 1500, 3000][stage.stage];
  const pct = stage.stage >= 5 ? 100 : Math.min(100, ((state.treeXP - prevThreshold) / (stage.next - prevThreshold)) * 100);

  const buyWithPoints = (id: string, cost: number, pro?: boolean) => {
    if (pro && !state.isPremium) { triggerPaywall(); return; }
    if (state.points < cost) return;
    update((s) => ({
      points: s.points - cost,
      treeXP: s.treeXP + Math.floor(cost / 2),
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
    }));
  };

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sacred Ground</p>
        <h1 className="mt-2 text-3xl font-bold">Your Life Tree</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This tree is sacred. Every clean day is permanently etched into it. No one can take it from you.
        </p>
      </header>

      {/* Tree visual */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-[var(--gradient-surface)] p-6 shadow-[var(--shadow-glow)]">
          <div className="aspect-square w-full rounded-xl bg-card/40 border border-border grid place-items-center relative overflow-hidden">
            <Tree stage={stage.stage} />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full">
                Stage {stage.stage} · {stage.name}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: "oklch(0.92 0.14 90)",
                  background: "linear-gradient(135deg, oklch(0.35 0.08 75 / 0.4), oklch(0.5 0.14 85 / 0.25))",
                  border: "1px solid oklch(0.78 0.16 85 / 0.7)",
                  boxShadow: "0 0 16px -2px oklch(0.78 0.16 85 / 0.5), inset 0 0 8px oklch(0.78 0.16 85 / 0.15)",
                }}
              >
                <Crown className="h-3 w-3" /> {RANK_BY_STAGE[stage.stage]}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[10px] text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded-full">
              <Sparkles className="h-3 w-3" /> Day {day} of you
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-success" />
            Your tree ranks in the <span className="text-success font-semibold">top {TOP_PCT_BY_STAGE[stage.stage]}%</span> of all Stopamine users
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stage.name}</span>
              <span className="text-muted-foreground">{state.treeXP} / {stage.next} XP</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Social share */}
      <section className="px-6 mt-4">
        <ShareTreeCard stage={stage} day={day} xp={state.treeXP} />
      </section>

      {/* Why this matters reminder */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs uppercase tracking-wider text-primary">Remember why</p>
          <p className="mt-2 text-base leading-snug">
            You started this for{" "}
            <span className="text-primary font-medium">
              {state.onboarding?.costs?.[0]?.toLowerCase() ?? "your future self"}
            </span>
            . Every day this tree grows, that future gets closer.
          </p>
        </div>
      </section>

      {/* Upgrades */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-1">Grow your tree</h2>
        <p className="text-xs text-muted-foreground mb-3">Spend points you've earned — or speed it up.</p>
        <div className="space-y-3">
          {UPGRADES.map((u) => {
            const owned = state.treeUnlocks.includes(u.id);
            const canAfford = state.points >= u.costPoints;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full grid place-items-center bg-success/10 text-success shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      {u.pro && <Lock className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{u.desc}</p>
                  </div>
                  {owned && <span className="text-[10px] uppercase text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">Owned</span>}
                </div>
                {!owned && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => buyWithPoints(u.id, u.costPoints, u.pro)} disabled={!canAfford && !(u.pro && !state.isPremium)}
                      className={`h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 ${canAfford ? "bg-primary/15 text-primary border border-primary/40" : "bg-secondary text-muted-foreground border border-border"}`}>
                      <Coins className="h-3.5 w-3.5" /> {u.costPoints} pts
                    </button>
                    <button onClick={() => triggerPaywall()}
                      className="h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}>
                      <CreditCard className="h-3.5 w-3.5" /> ${u.costMoney}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">You came back today.</span> That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

const COMMUNITY_FEED = [
  { name: "Marcus", stage: "Strong tree", day: 61, xp: 2340 },
  { name: "Jaylen", stage: "Young tree", day: 34, xp: 980 },
  { name: "Timo", stage: "Sapling", day: 19, xp: 420 },
  { name: "Arjun", stage: "Ancient tree", day: 112, xp: 4100 },
  { name: "Noah", stage: "Sprout", day: 8, xp: 180 },
];

function ShareTreeCard({ stage, day, xp }: { stage: { name: string; stage: number }; day: number; xp: number }) {
  const [shared, setShared] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  const shareText = `Day ${day} of my recovery. My Life Tree is a ${stage.name} (${xp} XP). Building something real. 🌱 #Stopamine`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "linear-gradient(135deg, oklch(0.28 0.1 155 / 0.5), oklch(0.22 0.06 260 / 0.6))",
        border: "1px solid oklch(0.7 0.16 150 / 0.5)",
        boxShadow: "0 0 32px -8px oklch(0.7 0.16 150 / 0.45)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-success/20 grid place-items-center text-success shrink-0">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">Show the world your tree</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Your tree is proof of real work. Most people never make it this far.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card/60 border border-border p-3 text-xs text-muted-foreground italic leading-relaxed">
        "{shareText}"
      </div>

      <button
        onClick={handleShare}
        className="w-full h-12 rounded-xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        {shared ? "Copied to clipboard" : "Show the world your tree"}
      </button>
      <button
        onClick={() => setShowCommunity(!showCommunity)}
        className="w-full h-10 rounded-xl text-xs font-semibold bg-secondary/60 text-foreground border border-border inline-flex items-center justify-center gap-1.5"
      >
        <Users className="h-3.5 w-3.5" /> {showCommunity ? "Hide community" : "See community"}
      </button>

      {showCommunity && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Others grinding right now</p>
          {COMMUNITY_FEED.map((u) => (
            <div key={u.name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-xs font-bold text-primary">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-[10px] text-muted-foreground">{u.stage} · Day {u.day}</p>
              </div>
              <span className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                {u.xp} XP
              </span>
            </div>
          ))}
          <p className="text-[10px] text-center text-muted-foreground pt-1">
            Full community coming soon · r/Stopamine
          </p>
        </div>
      )}
    </div>
  );
}

function Tree({ stage }: { stage: number }) {
  // Simple SVG tree that grows with stage
  const trunkH = 30 + stage * 8;
  const canopyR = 18 + stage * 10;
  const leafCount = stage; // extra leaves
  return (
    <svg viewBox="0 0 200 200" className="h-[80%] w-[80%]">
      <defs>
        <radialGradient id="canopy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.18 150)" />
          <stop offset="100%" stopColor="oklch(0.45 0.14 155)" />
        </radialGradient>
        <linearGradient id="trunk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.06 60)" />
          <stop offset="100%" stopColor="oklch(0.28 0.05 55)" />
        </linearGradient>
      </defs>
      {/* ground */}
      <ellipse cx="100" cy="180" rx="70" ry="6" fill="oklch(0.26 0.025 260)" />
      {/* trunk */}
      <rect x={96} y={180 - trunkH} width="8" height={trunkH} rx="3" fill="url(#trunk)" />
      {/* canopy */}
      {stage >= 1 && (
        <circle cx="100" cy={180 - trunkH - canopyR / 2} r={canopyR} fill="url(#canopy)" opacity="0.95" />
      )}
      {stage >= 2 && (
        <>
          <circle cx={100 - canopyR * 0.6} cy={180 - trunkH - canopyR * 0.3} r={canopyR * 0.7} fill="url(#canopy)" opacity="0.9" />
          <circle cx={100 + canopyR * 0.6} cy={180 - trunkH - canopyR * 0.3} r={canopyR * 0.7} fill="url(#canopy)" opacity="0.9" />
        </>
      )}
      {stage >= 3 && (
        <circle cx="100" cy={180 - trunkH - canopyR * 1.1} r={canopyR * 0.7} fill="url(#canopy)" opacity="0.9" />
      )}
      {/* sparkle leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const a = (i / Math.max(1, leafCount)) * Math.PI * 2;
        const r = canopyR + 4;
        const cx = 100 + Math.cos(a) * r;
        const cy = 180 - trunkH - canopyR / 2 + Math.sin(a) * r;
        return <circle key={i} cx={cx} cy={cy} r="2" fill="oklch(0.85 0.18 90)" opacity="0.85" />;
      })}
      {stage === 0 && (
        // seed
        <ellipse cx="100" cy="172" rx="6" ry="4" fill="oklch(0.5 0.08 60)" />
      )}
    </svg>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Coins, Check, Lock, Sparkles, Gift } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";

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
  { id: "cold-shower", title: "Take a cold shower", desc: "2 minutes. Reset your nervous system.", points: 15, category: "Body" },
  { id: "no-phone-1h", title: "1 hour phone-free", desc: "Lock it in another room. Just exist.", points: 20, category: "Mind" },
  { id: "walk-30", title: "30-minute walk outside", desc: "Sunlight + movement = dopamine reset.", points: 25, category: "Body" },
  { id: "journal", title: "Write down 3 wins", desc: "Re-anchor your identity in progress.", points: 10, category: "Daily" },
  { id: "meditate", title: "10 min meditation", desc: "Sit with the urge. Watch it pass.", points: 15, category: "Mind" },
  { id: "no-social", title: "No social media for a day", desc: "Cut the loop. Reclaim attention.", points: 40, category: "Weekly", pro: true },
  { id: "deep-work", title: "2-hour deep work block", desc: "One task. No tabs. No phone.", points: 35, category: "Weekly", pro: true },
  { id: "call-friend", title: "Call someone you trust", desc: "Real connection rewires reward.", points: 20, category: "Daily" },
];

const REWARDS = [
  { id: "tree-leaves", name: "Grow your Life Tree", desc: "+50 XP boost", cost: 50, icon: Sparkles },
  { id: "theme", name: "Unlock Aurora theme", desc: "Cosmetic upgrade", cost: 200, icon: Gift },
  { id: "streak-shield", name: "Streak Shield", desc: "Forgive 1 slip-up without losing your streak", cost: 150, icon: Trophy },
  { id: "custom-mantra", name: "Custom mantra pack", desc: "10 personalized reframes", cost: 120, icon: Sparkles },
];

function ChallengesPage() {
  const [state, update] = useAppState();

  const completedIds = new Set(state.completedChallenges.map((c) => c.id));

  const complete = (c: Challenge) => {
    if (c.pro && !state.isPremium) { triggerPaywall(); return; }
    if (completedIds.has(c.id)) return;
    update((s) => ({
      points: s.points + c.points,
      treeXP: s.treeXP + Math.floor(c.points / 2),
      completedChallenges: [...s.completedChallenges, { id: c.id, doneAt: Date.now() }],
    }));
  };

  const redeem = (cost: number, id: string) => {
    if (state.points < cost) return;
    update((s) => ({
      points: s.points - cost,
      treeUnlocks: s.treeUnlocks.includes(id) ? s.treeUnlocks : [...s.treeUnlocks, id],
      treeXP: id === "tree-leaves" ? s.treeXP + 50 : s.treeXP,
    }));
  };

  return (
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quests</p>
        <h1 className="mt-2 text-3xl font-bold">Earn while you heal.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every challenge wires a stronger you. Earn points. Spend them on real upgrades.</p>
      </header>

      {/* Points balance */}
      <section className="px-6 mt-5">
        <div className="rounded-2xl p-5 border border-primary/40 bg-primary/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary">Your points</p>
            <p className="mt-1 text-3xl font-bold inline-flex items-center gap-2">
              <Coins className="h-6 w-6 text-warning" /> {state.points}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground text-right max-w-[140px]">
            Spend on tree growth, themes, streak shields & more.
          </p>
        </div>
      </section>

      {/* Challenges */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-3">Today's challenges</h2>
        <div className="space-y-3">
          {CHALLENGES.map((c) => {
            const done = completedIds.has(c.id);
            const locked = c.pro && !state.isPremium;
            return (
              <button key={c.id} onClick={() => complete(c)} disabled={done}
                className={`w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition ${done ? "border-success/50 bg-success/10 opacity-80" : "border-border bg-card hover:border-primary"}`}>
                <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${done ? "bg-success/20 text-success" : "bg-primary/10 text-primary"}`}>
                  {done ? <Check className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    {locked && <Lock className="h-3 w-3 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{c.desc}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">{c.category}</p>
                </div>
                <div className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold ${done ? "text-success" : "text-warning"}`}>
                  <Coins className="h-3.5 w-3.5" /> {c.points}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Rewards shop */}
      <section className="px-6 mt-8">
        <h2 className="text-sm font-semibold mb-3">Reward shop</h2>
        <div className="space-y-3">
          {REWARDS.map((r) => {
            const owned = state.treeUnlocks.includes(r.id);
            const canAfford = state.points >= r.cost;
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full grid place-items-center bg-warning/10 text-warning shrink-0">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.desc}</p>
                </div>
                <button onClick={() => redeem(r.cost, r.id)} disabled={owned || !canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition ${owned ? "bg-success/20 text-success" : canAfford ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {owned ? "Owned" : (<><Coins className="h-3 w-3" /> {r.cost}</>)}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">More rewards unlock as your Life Tree grows.</p>
      </section>
    </PageShell>
  );
}

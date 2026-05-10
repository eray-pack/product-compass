import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount, activeAddiction } from "@/lib/store";
import { Share2, Crown, Flame, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

const MOCK_FEED = [
  { name: "Marcus", initial: "M", color: "oklch(0.55 0.18 260)", stage: "Strong Tree", day: 61, xp: 2340, message: "day 61. feel like a different person.", rank: "Elite" },
  { name: "Arjun", initial: "A", color: "oklch(0.50 0.15 290)", stage: "Ancient Tree", day: 112, xp: 4100, message: "112 days. i don't even think about it anymore.", rank: "Legendary" },
  { name: "Jaylen", initial: "J", color: "oklch(0.52 0.16 145)", stage: "Young Tree", day: 34, xp: 980, message: "relapsed on day 28 but came back. still going.", rank: "Respected" },
  { name: "Timo", initial: "T", color: "oklch(0.55 0.17 30)", stage: "Sapling", day: 19, xp: 420, message: "the sos button saved me last night fr", rank: "Disciplined" },
  { name: "Noah", initial: "N", color: "oklch(0.53 0.18 200)", stage: "Sprout", day: 8, xp: 180, message: "first week done. harder than i thought.", rank: "Awakened" },
  { name: "Dimitri", initial: "D", color: "oklch(0.56 0.16 60)", stage: "Ancient Tree", day: 412, xp: 6240, message: "over a year. if i can do it anyone can.", rank: "Legendary" },
  { name: "Kenji", initial: "K", color: "oklch(0.54 0.14 180)", stage: "Strong Tree", day: 77, xp: 2890, message: "this app hits different. the tree is real.", rank: "Elite" },
];

const RANK_COLORS: Record<string, string> = {
  Legendary: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Elite: "text-primary bg-primary/10 border-primary/30",
  Respected: "text-success bg-success/10 border-success/30",
  Disciplined: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Awakened: "text-muted-foreground bg-secondary border-border",
  Beginner: "text-muted-foreground bg-secondary border-border",
};

function CommunityPage() {
  const [state] = useAppState();
  const active = activeAddiction(state);
  const day = dayCount(active.startDate);
  const stage = treeStage(state.treeXP);
  const [shared, setShared] = useState(false);

  const shareText = `Day ${day} of my recovery. My Life Tree is a ${stage.name}. Building something real. 🌱 #Stopamine`;

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
    <PageShell>
      <header className="px-6 pt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Community</p>
        <h1 className="mt-2 text-3xl font-bold">You're not alone.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Men grinding alongside you. Right now.</p>
      </header>

      {/* Your card */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-primary">Your position</p>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-bold text-white shrink-0"
              style={{ background: "oklch(0.55 0.18 260)" }}>
              {state.onboarding?.name?.[0]?.toUpperCase() ?? "Y"}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{state.onboarding?.name ?? "You"}</p>
              <p className="text-xs text-muted-foreground">{stage.name} · Day {day} · {state.treeXP} XP</p>
            </div>
            <button onClick={handleShare}
              className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center text-primary">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          {shared && <p className="text-xs text-primary text-center">Copied to clipboard!</p>}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Global momentum board</p>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Live</span>
        </div>
        <div className="space-y-3">
          {MOCK_FEED.map((user, i) => (
            <div key={user.name} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                <div className="h-10 w-10 rounded-full grid place-items-center text-sm font-bold text-white shrink-0"
                  style={{ background: user.color }}>
                  {user.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${RANK_COLORS[user.rank]}`}>
                      {user.rank}
                    </span>
                    {user.rank === "Legendary" && <Crown className="h-3 w-3 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{user.stage} · Day {user.day}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-warning">{user.xp} XP</p>
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    <Flame className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] text-muted-foreground">{user.day}d</span>
                  </div>
                </div>
              </div>
              {user.message && (
                <p className="mt-3 text-xs text-muted-foreground italic border-t border-border/50 pt-2">
                  "{user.message}"
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Subreddit teaser */}
      <section className="px-6 mt-6 mb-2">
        <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-2">
          <TrendingUp className="h-5 w-5 text-primary mx-auto" />
          <p className="text-sm font-semibold">r/Stopamine coming soon</p>
          <p className="text-xs text-muted-foreground">A place to share wins, ask for help, and hold each other accountable. No judgement.</p>
        </div>
      </section>
    </PageShell>
  );
}

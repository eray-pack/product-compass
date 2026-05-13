import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Coins, Lock, CreditCard, Share2, Users, Crown, Globe } from "lucide-react";
import { PageShell } from "@/components/BottomNav";
import { useAppState, treeStage, dayCount } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useState } from "react";
import { Tree3D } from "@/components/Tree3D";
import { CompanionAvatar } from "@/components/avatars/CompanionAvatar";

export const Route = createFileRoute("/tree")({
  component: TreePage,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const UPGRADES = [
  { id: "leaves-gold",    name: "Golden leaves",    desc: "Mark a milestone forever",          costPoints: 80,  costMoney: 1.99 },
  { id: "branch-mind",   name: "Mind branch",      desc: "Adds a meditation streak slot",      costPoints: 150, costMoney: 2.99 },
  { id: "branch-body",   name: "Body branch",      desc: "Adds a fitness streak slot",         costPoints: 150, costMoney: 2.99 },
  { id: "ornament-streak",name: "Streak ornament", desc: "+30 day streak shield",              costPoints: 250, costMoney: 4.99, pro: true },
  { id: "root-deep",     name: "Deep roots",       desc: "Permanent +10% XP from challenges", costPoints: 500, costMoney: 7.99, pro: true },
];

const RANK_BY_STAGE = ["Beginning", "Awakening", "Building", "Established", "Rising", "Legendary"];
const TOP_PCT_BY_STAGE = [82, 61, 40, 25, 13, 3];
const STAGE_NAMES = ["Day 1", "Week 1", "2 Weeks", "Month 1", "2 Months", "90 Days"];

const HALL_OF_LEGENDS = [
  { name: "Dimitri K.", day: 412 },
  { name: "Samuel R.", day: 287 },
  { name: "Kenji T.", day: 156 },
];

// ── Wolf companion constants ───────────────────────────────────────────────────
const WOLF_UPGRADES = [
  { id: "wolf-raw-meat",     name: "Raw meat",         desc: "Feed the wolf — grants +20 bonus XP",          costPoints: 80,  costMoney: 1.99 },
  { id: "wolf-pack-bond",    name: "Wolf pack bond",   desc: "Unlocks pack howl animation",                   costPoints: 150, costMoney: 2.99 },
  { id: "wolf-thick-fur",    name: "Thick fur coat",   desc: "Winter coat — amber highlights on Stage 4+",    costPoints: 150, costMoney: 2.99 },
  { id: "wolf-alpha-mark",   name: "Alpha marking",    desc: "Branded alpha symbol on the wolf's shoulder",   costPoints: 250, costMoney: 4.99, pro: true },
  { id: "wolf-ancient",      name: "Ancient instinct", desc: "Permanent +10% XP from every challenge",        costPoints: 400, costMoney: 6.99, pro: true },
];

const WOLF_RANK_BY_STAGE = ["Beginning", "Awakening", "Building", "Established", "Rising", "Fierce", "Dominant", "Legendary"];
const WOLF_TOP_PCT_BY_STAGE = [82, 66, 50, 38, 25, 14, 6, 1];

// XP thresholds per wolf stage — mirrors treeStage() in store.ts
const WOLF_XP_PREV = [0, 100, 250, 500, 1000, 1750, 2750, 4000] as const;

function wolfXPStage(xp: number): { stage: 0|1|2|3|4|5|6|7; name: string; next: number } {
  if (xp < 100)  return { stage: 0, name: "Newborn",    next: 100  };
  if (xp < 250)  return { stage: 1, name: "Pup",        next: 250  };
  if (xp < 500)  return { stage: 2, name: "Young",      next: 500  };
  if (xp < 1000) return { stage: 3, name: "Adolescent", next: 1000 };
  if (xp < 1750) return { stage: 4, name: "Adult",      next: 1750 };
  if (xp < 2750) return { stage: 5, name: "Strong",     next: 2750 };
  if (xp < 4000) return { stage: 6, name: "Alpha",      next: 4000 };
  return { stage: 7, name: "Legendary", next: xp };
}

// ── Deterministic star positions (avoids jitter on re-render) ─────────────────
const NIGHT_STARS = [
  [5,5,2,0],[12,15,1.5,0.6],[18,8,1,1.4],[25,22,2.5,0.2],[32,12,1,1.8],
  [40,4,1.8,0.9],[47,18,1.2,2.3],[53,9,2,0.4],[60,25,1,1.1],[67,7,1.5,2.0],
  [74,20,1.2,0.7],[81,5,1.8,1.5],[88,16,1,0.3],[93,28,2,2.4],[8,32,1.2,1.0],
  [20,42,1.5,0.5],[35,35,1,2.1],[50,48,1.8,0.8],[65,38,1.2,1.7],[78,45,1,0.2],
  [90,33,1.5,2.8],[15,52,1,1.3],[42,55,2,0.6],[68,50,1.2,2.2],[85,55,1,1.0],
] as const;


// ── Background: Tree — timezone-based sky ─────────────────────────────────────
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const SKY_CONFIGS = {
  morning: {
    gradient: "linear-gradient(180deg, #0D0400 0%, #5C1E00 18%, #C04A10 38%, #E87828 58%, #F5B060 78%, #FFD898 100%)",
    label: "Morning",
    emoji: "🌅",
  },
  afternoon: {
    gradient: "linear-gradient(180deg, #0A1A5E 0%, #1040B0 28%, #2868D0 55%, #5090E0 80%, #80B8F0 100%)",
    label: "Afternoon",
    emoji: "☀️",
  },
  evening: {
    gradient: "linear-gradient(180deg, #0A0020 0%, #3A0858 18%, #8A2820 38%, #C84C18 55%, #E8800A 72%, #F5B040 88%, #FFD888 100%)",
    label: "Evening",
    emoji: "🌇",
  },
  night: {
    gradient: "linear-gradient(180deg, #010308 0%, #030820 28%, #080D2A 55%, #0E1238 80%, #141840 100%)",
    label: "Night",
    emoji: "🌙",
  },
} as const;

function TreeSkyBackground({ timeOfDay }: { timeOfDay: keyof typeof SKY_CONFIGS }) {
  const isNight = timeOfDay === "night";
  const isMorning = timeOfDay === "morning";
  const isAfternoon = timeOfDay === "afternoon";
  const isEvening = timeOfDay === "evening";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: SKY_CONFIGS[timeOfDay].gradient }}/>

      {/* Night: stars + moon */}
      {isNight && (
        <>
          {NIGHT_STARS.map(([x, y, size, delay], i) => (
            <div
              key={i}
              className="absolute rounded-full anim-star"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: "white",
                "--star-dur": `${1.8 + (i % 6) * 0.35}s`,
                "--star-delay": `${delay}s`,
              } as React.CSSProperties}
            />
          ))}
          {/* Crescent moon */}
          <svg className="absolute" style={{ top: "8%", right: "12%" }} width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="18" fill="#F5E8C0" opacity="0.92"/>
            <circle cx="31" cy="18" r="14" fill="#0E1238"/>
            <circle cx="24" cy="24" r="18" fill="#F5E8C0" opacity="0.08"/>
          </svg>
        </>
      )}

      {/* Morning: sun rising glow */}
      {isMorning && (
        <>
          <div
            className="absolute anim-sun"
            style={{
              bottom: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFE082 0%, #FFB300 50%, transparent 75%)",
              boxShadow: "0 0 60px 30px rgba(255,180,50,0.5), 0 0 120px 60px rgba(255,130,20,0.25)",
            }}
          />
          {/* Rays */}
          <div
            className="absolute anim-sun"
            style={{
              bottom: "18%",
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255,180,80,0.35), transparent)",
            }}
          />
        </>
      )}

      {/* Afternoon: bright sun */}
      {isAfternoon && (
        <div
          className="absolute anim-sun"
          style={{
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFFDE7 0%, #FFE082 40%, transparent 70%)",
            boxShadow: "0 0 50px 25px rgba(255,230,100,0.5), 0 0 100px 50px rgba(200,180,60,0.25)",
          }}
        />
      )}

      {/* Evening: sunset gradient + horizon glow */}
      {isEvening && (
        <div
          className="absolute bottom-0 inset-x-0 h-1/3 anim-sun"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(240,120,30,0.55), transparent 70%)",
          }}
        />
      )}

      {/* Ground line */}
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "rgba(255,200,100,0.2)" }}/>
    </div>
  );
}


// ── Router ────────────────────────────────────────────────────────────────────
function TreePage() {
  const [state, update] = useAppState();
  const day = dayCount(state.startDate);
  const companion = state.companion ?? "tree";

  if (companion === "wolf") {
    return <WolfPage state={state} update={update} day={day} />;
  }
  return <LifeTreePage state={state} update={update} day={day} />;
}

// ── Background: Dark forest at night with moon ────────────────────────────────
const FOREST_STARS = [
  [8,4,1.5,0],[16,10,1,0.5],[24,3,2,1.2],[34,14,1.2,0.8],[44,6,1.8,0.3],
  [56,11,1,1.5],[64,4,1.5,0.7],[72,9,2,0.2],[82,2,1.2,1.8],[90,13,1.5,0.9],
  [96,5,1,1.1],[4,20,1.2,2],[18,26,1,0.4],[28,18,1.8,1.6],[38,28,1,0.1],
  [50,22,1.5,2.2],[60,27,1.2,0.6],[68,20,2,1.4],[76,32,1,2.5],[85,24,1.5,0.3],
  [92,19,1.2,1.9],[12,36,1,2.8],[35,38,1.5,1.0],[58,35,1.2,0.7],[79,38,1,2.1],
] as const;

function WolfBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep forest night sky */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020508 0%, #040A10 22%, #061218 48%, #071622 75%, #09181E 100%)",
      }}/>
      {/* Forest ambient glow — moonlight */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(140,180,220,0.10), transparent 60%)",
      }}/>
      {/* Ground mist */}
      <div className="absolute bottom-0 inset-x-0 h-1/3" style={{
        background: "radial-gradient(ellipse 100% 60% at 50% 110%, rgba(20,60,40,0.30), transparent)",
      }}/>
      {/* Amber eye-glow atmosphere (wolf presence) */}
      <div className="absolute bottom-0 inset-x-0 h-1/2" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(196,135,58,0.07), transparent)",
      }}/>

      {/* Stars */}
      {FOREST_STARS.map(([x, y, size, delay], i) => (
        <div
          key={i}
          className="absolute rounded-full anim-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: "white",
            "--star-dur": `${2 + (i % 5) * 0.4}s`,
            "--star-delay": `${delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Moon */}
      <svg className="absolute" style={{ top: "5%", right: "10%" }} width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="16" fill="#E8DFC0" opacity="0.88"/>
        <circle cx="28" cy="16" r="12" fill="#040A10"/>
        <circle cx="22" cy="22" r="16" fill="#E8DFC0" opacity="0.07"/>
      </svg>

      {/* Forest tree silhouettes — back layer */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 400 160"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        {/* Back trees */}
        <path d="M0 160 L0 80 L12 60 L24 80 L24 160Z" fill="#050D14"/>
        <path d="M18 160 L18 65 L32 40 L46 65 L46 160Z" fill="#040B11"/>
        <path d="M40 160 L40 75 L55 52 L70 75 L70 160Z" fill="#050D14"/>
        <path d="M60 160 L60 90 L72 70 L84 90 L84 160Z" fill="#040B11"/>
        <path d="M80 160 L80 60 L96 32 L112 60 L112 160Z" fill="#060E16"/>
        <path d="M105 160 L105 78 L118 55 L131 78 L131 160Z" fill="#050D14"/>
        <path d="M125 160 L125 65 L140 40 L155 65 L155 160Z" fill="#040B11"/>
        <path d="M148 160 L148 80 L162 58 L176 80 L176 160Z" fill="#050D14"/>
        <path d="M170 160 L170 55 L188 28 L206 55 L206 160Z" fill="#060E16"/>
        <path d="M200 160 L200 72 L214 48 L228 72 L228 160Z" fill="#050D14"/>
        <path d="M222 160 L222 62 L238 38 L254 62 L254 160Z" fill="#040B11"/>
        <path d="M248 160 L248 78 L262 55 L276 78 L276 160Z" fill="#050D14"/>
        <path d="M270 160 L270 50 L288 22 L306 50 L306 160Z" fill="#060E16"/>
        <path d="M300 160 L300 70 L315 46 L330 70 L330 160Z" fill="#050D14"/>
        <path d="M324 160 L324 80 L338 60 L352 80 L352 160Z" fill="#040B11"/>
        <path d="M346 160 L346 65 L362 40 L378 65 L378 160Z" fill="#050D14"/>
        <path d="M370 160 L370 75 L386 52 L400 75 L400 160Z" fill="#060E16"/>
        {/* Ground */}
        <rect x="0" y="148" width="400" height="12" fill="#03080E"/>
      </svg>

      {/* Top vignette */}
      <div className="absolute top-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(2,5,8,0.7), transparent)" }}/>
    </div>
  );
}

// ── Wolf companion page ───────────────────────────────────────────────────────
function WolfPage({
  state,
  update,
  day,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
  day: number;
}) {
  const wolfStage = wolfXPStage(state.treeXP);
  const prevThreshold = WOLF_XP_PREV[wolfStage.stage];
  const pct =
    wolfStage.stage >= 7
      ? 100
      : Math.min(100, ((state.treeXP - prevThreshold) / (wolfStage.next - prevThreshold)) * 100);

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
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your Companion</p>
        <h1 className="mt-2 text-3xl font-bold">Your Wolf</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          This wolf is yours. Every clean day makes it stronger.
        </p>
      </header>

      {/* Wolf scene — same card layout as Life Tree */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
          {/* Scene viewport */}
          <div className="relative" style={{ height: "280px" }}>
            <WolfBackground />

            {/* Stage badge — top left */}
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full backdrop-blur-sm">
                Stage {wolfStage.stage} · {wolfStage.name}
              </span>
            </div>

            {/* Night badge — top right */}
            <div className="absolute top-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.38)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(8px)",
                }}
              >
                🌙 Night
              </span>
            </div>

            {/* Rank badge — bottom left */}
            <div className="absolute bottom-3 left-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: "oklch(0.92 0.14 90)",
                  background: "linear-gradient(135deg, oklch(0.35 0.08 75 / 0.5), oklch(0.5 0.14 85 / 0.30))",
                  border: "1px solid oklch(0.78 0.16 85 / 0.65)",
                  boxShadow: "0 0 16px -2px oklch(0.78 0.16 85 / 0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Crown className="h-3 w-3" /> {WOLF_RANK_BY_STAGE[wolfStage.stage]}
              </span>
            </div>

            {/* Day badge — bottom right */}
            <div className="absolute bottom-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded-full"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <Sparkles className="h-3 w-3" /> Day {day} of you
              </span>
            </div>

            {/* Wolf on grass platform — centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 z-10">
              <div
                className="companion-3d anim-tree-float"
                style={{ width: "160px", height: "192px", marginBottom: "-12px" }}
              >
                <CompanionAvatar
                  type="wolf"
                  day={day}
                  stage={wolfStage.stage}
                  relapseCount={state.relapses.length}
                  className="w-full h-full"
                />
              </div>
              {/* Grass mound */}
              <div
                style={{
                  width: "170px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at 50% 30%, #2d6a3f, #1a4028)",
                  boxShadow: "0 0 28px 10px rgba(20,80,40,0.28), inset 0 -6px 14px rgba(0,0,0,0.40)",
                  border: "1px solid rgba(45,110,65,0.40)",
                }}
              />
            </div>
          </div>

          {/* XP progress bar — mirrors tree */}
          <div className="px-5 py-4 border-t border-border/60" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">{wolfStage.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {state.treeXP} / {wolfStage.next} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <Globe className="inline h-3.5 w-3.5 text-success mr-1" />
              Your wolf ranks in the{" "}
              <span className="text-success font-semibold">top {WOLF_TOP_PCT_BY_STAGE[wolfStage.stage]}%</span> of all users
            </p>
          </div>
        </div>
      </section>

      {/* Share card */}
      <section className="px-6 mt-4">
        <ShareWolfCard wolfStage={wolfStage} day={day} xp={state.treeXP} />
      </section>

      {/* Remember why */}
      <section className="px-6 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs uppercase tracking-wider text-primary">Remember why</p>
          <p className="mt-2 text-base leading-snug">
            Every clean day sharpens who this wolf becomes.
          </p>
        </div>
      </section>

      {/* Feed your wolf — shop */}
      <section className="px-6 mt-6">
        <h2 className="text-sm font-semibold mb-1">Feed your wolf</h2>
        <p className="text-xs text-muted-foreground mb-3">Spend points you've earned — or speed it up.</p>
        <div className="space-y-3">
          {WOLF_UPGRADES.map((u) => {
            const owned = state.treeUnlocks.includes(u.id);
            const canAfford = state.points >= u.costPoints;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full grid place-items-center shrink-0"
                    style={{ background: "oklch(0.62 0.22 255 / 0.10)", border: "1px solid #C4873A44", boxShadow: "0 0 14px 3px #C4873A20" }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      {u.pro && <Lock className="h-3 w-3 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{u.desc}</p>
                  </div>
                  {owned && (
                    <span className="text-[10px] uppercase text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                      Owned
                    </span>
                  )}
                </div>
                {!owned && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => buyWithPoints(u.id, u.costPoints, u.pro)}
                      disabled={!canAfford && !(u.pro && !state.isPremium)}
                      className={`h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 ${
                        canAfford
                          ? "bg-primary/15 text-primary border border-primary/40"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5" /> {u.costPoints} pts
                    </button>
                    <button
                      onClick={() => triggerPaywall()}
                      className="h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> ${u.costMoney}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Hall of Legends */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} />
          <h2 className="text-sm font-bold tracking-wide">Hall of Legends</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">The few who reached Legendary. This is what's possible.</p>
        <div className="space-y-2">
          {HALL_OF_LEGENDS.map((u, i) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, oklch(0.24 0.04 80 / 0.5), oklch(0.20 0.025 260 / 0.6))",
                border: "1px solid oklch(0.78 0.16 85 / 0.45)",
                boxShadow: "0 0 20px -8px oklch(0.78 0.16 85 / 0.4)",
              }}
            >
              <div
                className="h-11 w-11 rounded-full grid place-items-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.14 85), oklch(0.35 0.1 75))",
                  boxShadow: "inset 0 0 6px oklch(0.95 0.1 90 / 0.4)",
                }}
              >
                <Crown className="h-5 w-5" style={{ color: "oklch(0.97 0.12 95)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{u.name}</p>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      color: "oklch(0.95 0.12 90)",
                      border: "1px solid oklch(0.78 0.16 85 / 0.6)",
                      background: "oklch(0.5 0.14 85 / 0.15)",
                    }}
                  >
                    Legendary
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Alpha Wolf · Day {u.day}</p>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: "oklch(0.85 0.14 85)" }}>
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-3 italic">
          One day, your name belongs here.
        </p>
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-5 text-center mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ── Life Tree page (original, enhanced) ──────────────────────────────────────
function LifeTreePage({
  state,
  update,
  day,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
  day: number;
}) {
  const stage = treeStage(state.treeXP);
  const prevThreshold = stage.stage === 0 ? 0 : [0, 100, 300, 700, 1500, 3000][stage.stage];
  const pct =
    stage.stage >= 5
      ? 100
      : Math.min(100, ((state.treeXP - prevThreshold) / (stage.next - prevThreshold)) * 100);
  const timeOfDay = getTimeOfDay();
  const skyCfg = SKY_CONFIGS[timeOfDay];

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
          This tree is sacred. Every clean day is permanently etched into it.
        </p>
      </header>

      {/* Tree visual — with timezone sky background + Y-axis rotation */}
      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-glow)" }}>
          {/* Sky viewport */}
          <div className="relative" style={{ height: "280px" }}>
            <TreeSkyBackground timeOfDay={timeOfDay} />

            {/* Floating stage badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full backdrop-blur-sm">
                Stage {stage.stage} · {stage.name}
              </span>
            </div>

            {/* Time of day badge */}
            <div className="absolute top-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.38)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {skyCfg.emoji} {skyCfg.label}
              </span>
            </div>

            {/* Rank badge */}
            <div className="absolute bottom-3 left-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: "oklch(0.92 0.14 90)",
                  background: "linear-gradient(135deg, oklch(0.35 0.08 75 / 0.5), oklch(0.5 0.14 85 / 0.30))",
                  border: "1px solid oklch(0.78 0.16 85 / 0.65)",
                  boxShadow: "0 0 16px -2px oklch(0.78 0.16 85 / 0.5)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Crown className="h-3 w-3" /> {RANK_BY_STAGE[stage.stage]}
              </span>
            </div>

            {/* Day badge */}
            <div className="absolute bottom-3 right-3 z-20">
              <span
                className="inline-flex items-center gap-1 text-[10px] text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded-full"
                style={{ backdropFilter: "blur(8px)" }}
              >
                <Sparkles className="h-3 w-3" /> Day {day} of you
              </span>
            </div>

            {/* Rotating tree */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="companion-3d anim-tree-float" style={{ width: "100%", height: "100%" }}>
                <Tree3D day={day} />
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="px-5 py-4 border-t border-border/60" style={{ background: "var(--card)" }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">{stage.name}</span>
              <span className="text-muted-foreground tabular-nums">{state.treeXP} / {stage.next} XP</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <Globe className="inline h-3.5 w-3.5 text-success mr-1" />
              Your tree ranks in the{" "}
              <span className="text-success font-semibold">top {TOP_PCT_BY_STAGE[stage.stage]}%</span> of all users
            </p>
          </div>
        </div>
      </section>

      {/* Social share */}
      <section className="px-6 mt-4">
        <ShareTreeCard stage={stage} day={day} xp={state.treeXP} />
      </section>

      {/* Why this matters */}
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
                  {owned && (
                    <span className="text-[10px] uppercase text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                      Owned
                    </span>
                  )}
                </div>
                {!owned && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => buyWithPoints(u.id, u.costPoints, u.pro)}
                      disabled={!canAfford && !(u.pro && !state.isPremium)}
                      className={`h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 ${
                        canAfford
                          ? "bg-primary/15 text-primary border border-primary/40"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      <Coins className="h-3.5 w-3.5" /> {u.costPoints} pts
                    </button>
                    <button
                      onClick={() => triggerPaywall()}
                      className="h-10 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 text-primary-foreground"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> ${u.costMoney}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Hall of Legends */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4" style={{ color: "oklch(0.85 0.16 85)" }} />
          <h2 className="text-sm font-bold tracking-wide">Hall of Legends</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">The few who reached Ancient tree. This is what's possible.</p>
        <div className="space-y-2">
          {HALL_OF_LEGENDS.map((u, i) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{
                background: "linear-gradient(135deg, oklch(0.24 0.04 80 / 0.5), oklch(0.20 0.025 260 / 0.6))",
                border: "1px solid oklch(0.78 0.16 85 / 0.45)",
                boxShadow: "0 0 20px -8px oklch(0.78 0.16 85 / 0.4)",
              }}
            >
              <div
                className="h-11 w-11 rounded-full grid place-items-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.5 0.14 85), oklch(0.35 0.1 75))",
                  boxShadow: "inset 0 0 6px oklch(0.95 0.1 90 / 0.4)",
                }}
              >
                <Crown className="h-5 w-5" style={{ color: "oklch(0.97 0.12 95)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{u.name}</p>
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      color: "oklch(0.95 0.12 90)",
                      border: "1px solid oklch(0.78 0.16 85 / 0.6)",
                      background: "oklch(0.5 0.14 85 / 0.15)",
                    }}
                  >
                    Legendary
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Ancient tree · Day {u.day}</p>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: "oklch(0.85 0.14 85)" }}>
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-3 italic">
          One day, your name belongs here.
        </p>
      </section>

      <section className="px-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">You came back today.</span>{" "}
            That alone is the work. Keep going.
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ── Shared community feed data ────────────────────────────────────────────────
const COMMUNITY_FEED = [
  { name: "Marcus", stage: "Strong tree", day: 61, xp: 2340 },
  { name: "Jaylen", stage: "Young tree",  day: 34, xp: 980  },
  { name: "Timo",   stage: "Sapling",     day: 19, xp: 420  },
  { name: "Arjun",  stage: "Ancient tree",day: 112,xp: 4100 },
  { name: "Noah",   stage: "Sprout",      day: 8,  xp: 180  },
];

// ── Wolf share card ───────────────────────────────────────────────────────────
function ShareWolfCard({
  wolfStage,
  day,
  xp,
}: {
  wolfStage: { name: string; stage: number };
  day: number;
  xp: number;
}) {
  const [shared, setShared] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const shareText = `Day ${day} of my recovery. My Wolf is ${wolfStage.name} (${xp} XP). The hunt never stops. 🐺 #Stopamine`;

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
        background: "linear-gradient(135deg, oklch(0.18 0.06 265 / 0.5), oklch(0.22 0.06 260 / 0.6))",
        border: "1px solid oklch(0.78 0.16 85 / 0.35)",
        boxShadow: "0 0 32px -8px oklch(0.78 0.16 85 / 0.30)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/20 grid place-items-center text-primary shrink-0">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">Show the pack your wolf</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Your wolf is proof of real work. Most people never make it this far.
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
        {shared ? "Copied to clipboard" : "Share your wolf"}
      </button>
      <button
        onClick={() => setShowCommunity(!showCommunity)}
        className="w-full h-10 rounded-xl text-xs font-semibold bg-secondary/60 text-foreground border border-border inline-flex items-center justify-center gap-1.5"
      >
        <Users className="h-3.5 w-3.5" /> {showCommunity ? "Hide community" : "See the pack"}
      </button>
      {showCommunity && (
        <div className="space-y-2 pt-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Others holding the line</p>
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
        </div>
      )}
    </div>
  );
}

// ── Tree share card ───────────────────────────────────────────────────────────

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
        background: "linear-gradient(135deg, oklch(0.28 0.10 155 / 0.5), oklch(0.22 0.06 260 / 0.6))",
        border: "1px solid oklch(0.70 0.16 150 / 0.5)",
        boxShadow: "0 0 32px -8px oklch(0.70 0.16 150 / 0.45)",
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
        {shared ? "Copied to clipboard" : "Share your tree"}
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

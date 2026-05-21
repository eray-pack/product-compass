import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { SectionTitle } from "@/components/BottomNav";
import { PageShell } from "@/components/BottomNav";

export const Route = createFileRoute("/games")({
  component: GamesPage,
});

// ── Constants ─────────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const BG   = "#090705";

const FILTERS = ["All", "Steady Hand", "Clarity Climb", "Cold Switch", "Mind Pulse"] as const;
type Filter = typeof FILTERS[number];

const DUMMY: ScoreRow[] = [
  { rank: 1, username: "Marcus", score: 2840, game: "Steady Hand"   },
  { rank: 2, username: "Jaylen", score: 2210, game: "Clarity Climb" },
  { rank: 3, username: "Sven",   score: 1990, game: "Cold Switch"   },
  { rank: 4, username: "Alex",   score: 1750, game: "Mind Pulse"    },
  { rank: 5, username: "Ryan",   score: 1420, game: "Steady Hand"   },
];

interface ScoreRow {
  rank: number;
  username: string;
  score: number;
  game: string;
}

const RANK_MEDALS: Record<number, { icon: string; color: string }> = {
  1: { icon: "👑", color: GOLD      },
  2: { icon: "🥈", color: "#a0a0b0" },
  3: { icon: "🥉", color: "#cd7f32" },
};

// ── Component ─────────────────────────────────────────────────────────────────
function GamesPage() {
  const [selected, setSelected] = useState<Filter>("All");
  const [rows, setRows]         = useState<ScoreRow[]>(DUMMY);
  const [loading, setLoading]   = useState(false);
  const fetchId = useRef(0);

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = ++fetchId.current;
    setLoading(true);

    (async () => {
      try {
        let query = supabase
          .from("game_scores")
          .select("*")
          .order("score", { ascending: false })
          .limit(10);

        if (selected !== "All") {
          query = query.eq("game_name", selected);
        }

        const { data, error } = await query;

        if (id !== fetchId.current) return; // stale
        if (error || !data || data.length === 0) {
          // Filter dummy data when not "All"
          const filtered = selected === "All"
            ? DUMMY
            : DUMMY.filter(r => r.game === selected).map((r, i) => ({ ...r, rank: i + 1 }));
          setRows(filtered.length ? filtered : DUMMY);
        } else {
          setRows(data.map((row: Record<string, unknown>, i: number) => ({
            rank:     i + 1,
            username: String(row.username ?? row.user_id ?? "Player"),
            score:    Number(row.score ?? 0),
            game:     String(row.game_name ?? ""),
          })));
        }
      } catch {
        if (id !== fetchId.current) return;
        const filtered = selected === "All"
          ? DUMMY
          : DUMMY.filter(r => r.game === selected).map((r, i) => ({ ...r, rank: i + 1 }));
        setRows(filtered.length ? filtered : DUMMY);
      } finally {
        if (id === fetchId.current) setLoading(false);
      }
    })();
  }, [selected]);

  return (
    <PageShell>
      <div style={{ minHeight: "100dvh", background: BG, paddingTop: 60 }}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 0" }}>
          <SectionTitle>Games</SectionTitle>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 20px", fontFamily: "DM Sans, sans-serif" }}>
            Compete with the community
          </p>
        </div>

        {/* ── Filter pills ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex", gap: 8, overflowX: "auto", padding: "0 20px 20px",
            scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}
        >
          {FILTERS.map((filter, i) => (
            <motion.button
              key={filter}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 380, damping: 26 }}
              onClick={() => setSelected(filter)}
              style={{
                flexShrink: 0,
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: selected === filter ? 700 : 500,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                border: selected === filter ? "none" : "1px solid #1e1a10",
                background: selected === filter ? GOLD : "#0f0c06",
                color: selected === filter ? "#090705" : "#5a5040",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        {/* ── Leaderboard ──────────────────────────────────────────────── */}
        <div style={{ padding: "0 0 120px" }}>

          {/* Column labels */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 20px 8px",
            borderBottom: "1px solid #1e1a10",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>
              Player
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>
              Score
            </span>
          </div>

          {loading ? (
            // Skeleton rows
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 56, borderBottom: "1px solid #1e1a10", padding: "0 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ width: 120, height: 12, borderRadius: 6, background: "#1a1710", animation: "pulse 1.5s ease-in-out infinite" }}/>
                <div style={{ width: 50, height: 12, borderRadius: 6, background: "#1a1710", animation: "pulse 1.5s ease-in-out infinite" }}/>
              </div>
            ))
          ) : rows.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
                No scores yet. Be the first!
              </p>
            </div>
          ) : (
            rows.map((row, index) => {
              const medal     = RANK_MEDALS[row.rank];
              const isTop3    = row.rank <= 3;

              return (
                <motion.div
                  key={`${row.username}-${row.rank}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 380, damping: 26 }}
                  style={{
                    height: 56,
                    borderBottom: "1px solid #1e1a10",
                    borderLeft: "2px solid transparent",
                    padding: "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {/* Left: rank + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Rank badge */}
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isTop3 ? `${medal.color}18` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isTop3 ? `${medal.color}40` : "rgba(255,255,255,0.08)"}`,
                      flexShrink: 0,
                    }}>
                      {isTop3 ? (
                        <span style={{ fontSize: 13, lineHeight: 1 }}>{medal.icon}</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
                          {row.rank}
                        </span>
                      )}
                    </div>

                    {/* Name + game tag */}
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isTop3 ? "#f0e8d0" : "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>
                        {row.username}
                      </p>
                      {selected === "All" && row.game && (
                        <p style={{ margin: 0, fontSize: 10, color: "rgba(201,168,76,0.50)", letterSpacing: "0.06em", lineHeight: 1.2 }}>
                          {row.game}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: score */}
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: isTop3 ? GOLD : "rgba(201,168,76,0.65)",
                      letterSpacing: "0.02em",
                    }}>
                      {row.score.toLocaleString()}
                    </span>
                    <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      pts
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PageShell>
  );
}

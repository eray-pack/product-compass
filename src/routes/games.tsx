import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PageShell } from "@/components/BottomNav";

export const Route = createFileRoute("/games")({
  component: GamesPage,
});

// ── Palette ───────────────────────────────────────────────────────────────────
const CYAN    = "#00e5ff";
const GREEN   = "#39ff14";
const BASE_BG = "#02080f";

const TOP3_CONFIG: Record<number, { neon: string; glyph: string }> = {
  1: { neon: "#ffc940", glyph: "01" },
  2: { neon: "#94a3c0", glyph: "02" },
  3: { neon: "#c07a40", glyph: "03" },
};

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

// TODO: wire to auth session
const CURRENT_USER = "You";

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Framer Motion variants ────────────────────────────────────────────────────
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const listItem = {
  hidden: { opacity: 0, x: -24, filter: "blur(6px)" },
  show:   { opacity: 1, x: 0,   filter: "blur(0px)" },
};

// ── Injected CSS ──────────────────────────────────────────────────────────────
const CYBER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');

  @keyframes cyber-grid {
    0%   { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }
  @keyframes scanlines {
    0%   { background-position: 0 0; }
    100% { background-position: 0 4px; }
  }
  @keyframes glitch-ghost {
    0%, 100%    { opacity: 0; clip-path: inset(0 0 100% 0); }
    4%          { opacity: 1; clip-path: inset(0% 0 82% 0);  transform: translate(-5px, 0); color: #ff0060; }
    5%          { opacity: 1; clip-path: inset(35% 0 45% 0); transform: translate(6px,  0); color: #00e5ff; }
    6%          { opacity: 0; clip-path: inset(0 0 100% 0);  transform: none; }
    18%         { opacity: 1; clip-path: inset(65% 0 18% 0); transform: translate(4px, 0); color: #39ff14; }
    19%         { opacity: 0; clip-path: inset(0 0 100% 0); }
  }
  @keyframes flicker {
    0%, 94%, 100% { opacity: 1; }
    95%  { opacity: 0.78; }
    97%  { opacity: 1; }
    98%  { opacity: 0.88; }
  }
  @keyframes pulse-green {
    0%, 100% { box-shadow: 0 0 8px rgba(57,255,20,0.28), inset 0 0 8px rgba(57,255,20,0.08); }
    50%      { box-shadow: 0 0 22px rgba(57,255,20,0.65), inset 0 0 14px rgba(57,255,20,0.18); }
  }

  .glitch-title {
    position: relative;
    animation: flicker 8s infinite;
  }
  .glitch-title::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    animation: glitch-ghost 6s infinite;
    pointer-events: none;
  }
  .user-row {
    animation: pulse-green 2.2s ease-in-out infinite;
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────
function GamesPage() {
  const [selected, setSelected] = useState<Filter>("All");
  const [rows, setRows]         = useState<ScoreRow[]>(DUMMY);
  const [loading, setLoading]   = useState(false);
  const fetchId = useRef(0);

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

        if (selected !== "All") query = query.eq("game_name", selected);

        const { data, error } = await query;
        if (id !== fetchId.current) return;

        if (error || !data || data.length === 0) {
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
      {/* Injected keyframes + Google Font */}
      <style dangerouslySetInnerHTML={{ __html: CYBER_CSS }} />

      <div style={{ minHeight: "100dvh", background: BASE_BG, paddingTop: 60, position: "relative", overflow: "hidden" }}>

        {/* ── Animated grid ────────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: `
              linear-gradient(rgba(0,229,255,0.034) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,255,0.034) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "cyber-grid 12s linear infinite",
            willChange: "background-position",
          }}
        />

        {/* ── Scanlines overlay ─────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
            backgroundSize: "100% 4px",
            animation: "scanlines 0.12s steps(1) infinite",
          }}
        />

        {/* ── Ambient glows ─────────────────────────────────────────────── */}
        <div aria-hidden style={{
          position: "fixed", top: -120, left: -120, width: 400, height: 400,
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(circle, ${CYAN}14 0%, transparent 70%)`,
        }} />
        <div aria-hidden style={{
          position: "fixed", bottom: -100, right: -100, width: 340, height: 340,
          borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(circle, ${GREEN}0f 0%, transparent 70%)`,
        }} />

        {/* ── Page content ─────────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 10, padding: "16px 16px 0" }}>

          {/* Header */}
          <div style={{ marginBottom: 4 }}>
            {/* Status line */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: GREEN,
                boxShadow: `0 0 8px ${GREEN}, 0 0 16px ${GREEN}80`,
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: "0.22em",
                color: `${GREEN}cc`, textTransform: "uppercase",
              }}>
                SYS_ONLINE · CUT_THE_SIGNAL
              </span>
            </div>

            {/* Glitch title */}
            <h1
              className="glitch-title"
              data-text="// LEADERBOARD"
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22, fontWeight: 800,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: CYAN,
                textShadow: `0 0 14px ${CYAN}90, 0 0 40px ${CYAN}30`,
              }}
            >
              // LEADERBOARD
            </h1>

            <p style={{
              margin: "5px 0 0",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: "0.09em",
              color: `${CYAN}45`,
            }}>
              TOP_PLAYERS › LIVE_FEED
            </p>
          </div>

          {/* Divider */}
          <div style={{
            height: 1, margin: "14px 0",
            background: `linear-gradient(90deg, ${CYAN}50, ${CYAN}10, transparent)`,
          }} />

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 18, scrollbarWidth: "none" }}>
            {FILTERS.map((filter, i) => {
              const active = selected === filter;
              return (
                <motion.button
                  key={filter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 24 }}
                  onClick={() => setSelected(filter)}
                  style={{
                    flexShrink: 0,
                    padding: "5px 14px",
                    borderRadius: 4,
                    fontSize: 9, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    border: `1px solid ${active ? CYAN : "rgba(0,229,255,0.14)"}`,
                    background: active ? `rgba(0,229,255,0.12)` : "rgba(0,229,255,0.03)",
                    color: active ? CYAN : "rgba(0,229,255,0.35)",
                    textTransform: "uppercase",
                    boxShadow: active ? `0 0 14px ${CYAN}35, inset 0 0 8px ${CYAN}10` : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {filter}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Glass leaderboard panel ───────────────────────────────────── */}
        <div style={{
          position: "relative", zIndex: 10,
          margin: "0 12px 120px",
          borderRadius: 12,
          border: `1px solid rgba(0,229,255,0.11)`,
          background: "rgba(2,14,28,0.75)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          overflow: "hidden",
          boxShadow: `0 0 40px rgba(0,229,255,0.05), inset 0 0 40px rgba(0,229,255,0.02)`,
        }}>

          {/* Panel column header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(0,229,255,0.07)",
            background: "rgba(0,229,255,0.025)",
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, letterSpacing: "0.22em",
              color: `${CYAN}45`, textTransform: "uppercase",
            }}>
              RANK / AGENT
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, letterSpacing: "0.22em",
              color: `${CYAN}45`, textTransform: "uppercase",
            }}>
              SCORE
            </span>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 62, padding: "0 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,229,255,0.04)",
              }}>
                <div style={{ width: 140, height: 8, borderRadius: 3, background: "rgba(0,229,255,0.07)" }} />
                <div style={{ width: 64, height: 8, borderRadius: 3, background: "rgba(0,229,255,0.07)" }} />
              </div>
            ))
          ) : rows.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, letterSpacing: "0.12em",
                color: `${CYAN}35`,
              }}>
                NO_DATA_FOUND
              </p>
            </div>
          ) : (
            <motion.div variants={listContainer} initial="hidden" animate="show" key={selected}>
              {rows.map((row) => {
                const t3      = TOP3_CONFIG[row.rank];
                const isTop3  = row.rank <= 3;
                const isMe    = row.username === CURRENT_USER;
                const neon    = isMe ? GREEN : isTop3 ? t3.neon : CYAN;
                const neonRgb = hexToRgb(neon);

                return (
                  <motion.div
                    key={`${row.username}-${row.rank}`}
                    variants={listItem}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    whileHover={{
                      scale: 1.018,
                      x: 4,
                      transition: { type: "spring", stiffness: 400, damping: 22 },
                    }}
                    className={isMe ? "user-row" : undefined}
                    style={{
                      height: 62,
                      padding: "0 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      borderBottom: "1px solid rgba(0,229,255,0.05)",
                      borderLeft: `2px solid ${isMe ? GREEN : isTop3 ? `${t3.neon}cc` : "transparent"}`,
                      borderTop: "1px solid transparent",
                      borderRight: "1px solid transparent",
                      position: "relative", cursor: "default",
                      background: isTop3 || isMe ? `rgba(${neonRgb},0.04)` : undefined,
                      boxShadow: isTop3 ? `inset 0 0 28px rgba(${neonRgb},0.06)` : undefined,
                    }}
                  >
                    {/* Rank badge + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 6, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `rgba(${neonRgb},${isTop3 || isMe ? "0.12" : "0.05"})`,
                        border: `1px solid rgba(${neonRgb},${isTop3 || isMe ? "0.45" : "0.15"})`,
                        boxShadow: isTop3 || isMe ? `0 0 12px rgba(${neonRgb},0.4)` : undefined,
                      }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11, fontWeight: 800,
                          color: isTop3 ? t3.neon : isMe ? GREEN : `${CYAN}55`,
                          letterSpacing: "0.04em",
                        }}>
                          {String(row.rank).padStart(2, "0")}
                        </span>
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{
                            fontSize: 14, fontWeight: 600,
                            fontFamily: "DM Sans, sans-serif",
                            color: isMe ? GREEN : isTop3 ? "#e8f0ff" : "rgba(200,220,255,0.68)",
                            textShadow: isTop3 || isMe ? `0 0 10px rgba(${neonRgb},0.55)` : undefined,
                          }}>
                            {row.username}
                          </span>
                          {isMe && (
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 7, fontWeight: 700,
                              letterSpacing: "0.14em",
                              color: GREEN,
                              border: `1px solid ${GREEN}55`,
                              padding: "1px 5px", borderRadius: 3,
                              textTransform: "uppercase",
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                        {selected === "All" && row.game && (
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 8, color: `${CYAN}38`,
                            letterSpacing: "0.09em",
                          }}>
                            {row.game.toUpperCase().replace(/ /g, "_")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 18, fontWeight: 800,
                        letterSpacing: "0.04em",
                        color: isTop3 ? t3.neon : isMe ? GREEN : `${CYAN}75`,
                        textShadow: isTop3 || isMe ? `0 0 14px rgba(${neonRgb},0.8)` : undefined,
                      }}>
                        {row.score.toLocaleString()}
                      </div>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 7, letterSpacing: "0.2em",
                        color: `${CYAN}28`, textTransform: "uppercase",
                      }}>
                        PTS
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Bottom glow rule */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${CYAN}28, transparent)` }} />
        </div>
      </div>
    </PageShell>
  );
}

/* global React, IconHome, IconTree, IconWrench, IconUsers, IconBars, IconSettings, IconZap, IconSparkles, IconTarget, IconAlert, IconCoin, IconPlus, IconArrow, IconBack, IconCheck, IconX, IconLock, Eyebrow, PrimaryButton, StatCard, PillBadge, ProgressBar */
const { useState } = React;

// ── Bottom nav ─────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const items = [
    { id: "home",      label: "Home",      Icon: IconHome },
    { id: "tree",      label: "Tree",      Icon: IconTree },
    { id: "tools",     label: "Tools",     Icon: IconWrench },
    { id: "community", label: "Community", Icon: IconUsers },
    { id: "progress",  label: "Progress",  Icon: IconBars },
  ];
  return (
    <nav style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 40,
      borderTop: "1px solid var(--border-soft)",
      background: "var(--card)", backdropFilter: "blur(16px)",
    }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {items.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button key={id} onClick={() => onChange(id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, paddingTop: 12, paddingBottom: 8,
              fontSize: 10, fontWeight: 600, letterSpacing: ".04em",
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "inherit", position: "relative",
            }}>
              {isActive && <span style={{ position: "absolute", top: 0, left: 16, right: 16, height: 2, borderRadius: 9999, background: "var(--primary)" }} />}
              <Icon size={20} sw={isActive ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ height: 8 }} />
    </nav>
  );
}

// ── Brain timeline ─────────────────────────────────────────────────────────
function BrainTimeline({ day }) {
  const milestones = [
    { day: 7, label: "Energy" },
    { day: 14, label: "Focus" },
    { day: 30, label: "Confidence" },
    { day: 60, label: "Regulation" },
    { day: 90, label: "Reset" },
  ];
  const pct = Math.min(100, (day / 90) * 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ position: "relative", height: 6, borderRadius: 9999, background: "oklch(0.22 0.03 265)" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${pct}%`, borderRadius: 9999, background: "var(--gradient-primary)" }} />
        {milestones.map(({ day: m }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div key={m} style={{ position: "absolute", left: `${pos}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
              <div style={{
                height: 14, width: 14, borderRadius: 9999, border: "2px solid",
                background: reached ? "var(--primary)" : "var(--card)",
                borderColor: reached ? "var(--primary)" : "oklch(0.22 0.03 265)",
                boxShadow: reached ? "0 0 10px 2px oklch(0.62 0.22 255 / 0.6)" : "none",
              }} />
            </div>
          );
        })}
        {pct < 100 && (
          <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 20 }}>
            <div style={{ height: 16, width: 16, borderRadius: 9999, background: "var(--primary)", boxShadow: "0 0 16px 4px oklch(0.62 0.22 255 / 0.7)", animation: "glow-pulse 2.4s ease-in-out infinite" }} />
          </div>
        )}
      </div>
      <div style={{ position: "relative", height: 32, marginTop: 4 }}>
        {milestones.map(({ day: m, label }) => {
          const pos = (m / 90) * 100;
          const reached = day >= m;
          return (
            <div key={m} style={{ position: "absolute", left: `${pos}%`, transform: "translateX(-50%)", textAlign: "center" }}>
              <p style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, color: reached ? "var(--primary)" : "oklch(0.42 0.018 265)" }}>{label}</p>
              <p style={{ fontSize: 8, marginTop: 2, lineHeight: 1, color: reached ? "oklch(0.50 0.18 255)" : "oklch(0.34 0.015 265)" }}>d{m}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Dashboard screen ───────────────────────────────────────────────────────
function Dashboard({ onSos, onRelapse, onSettings }) {
  const day = 47;
  const recoveryPct = Math.round((day / 90) * 100);

  return (
    <div style={{ minHeight: "100%", paddingBottom: 100 }}>
      {/* Top right gear */}
      <button onClick={onSettings} aria-label="Settings" style={{
        position: "absolute", top: 56, right: 16, zIndex: 30, height: 36, width: 36,
        borderRadius: 12, border: "1px solid var(--border-soft)", background: "var(--card)",
        backdropFilter: "blur(12px)", color: "var(--muted-foreground)", cursor: "pointer",
        display: "grid", placeItems: "center",
      }}>
        <IconSettings size={16} />
      </button>

      {/* Header */}
      <div style={{ padding: "48px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".25em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Stopamine</span>
        <PillBadge color="warning"><IconCoin size={12} sw={2} /> 240</PillBadge>
      </div>

      {/* Hero */}
      <section style={{ padding: "24px 24px 0", textAlign: "center" }}>
        <Eyebrow track=".30em">Day</Eyebrow>
        <p style={{ fontWeight: 700, fontSize: "8rem", lineHeight: 0.95, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", marginTop: 8 }}>
          {String(day).padStart(3, "0")}
        </p>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--muted-foreground)" }}>
          porn journey · <span style={{ color: "var(--primary)", fontWeight: 600 }}>{recoveryPct}%</span> to brain reset
        </p>
        <p style={{ marginTop: 4, fontSize: 11, color: "oklch(0.42 0.018 265)", fontStyle: "italic" }}>
          Every day you don't give in, your brain rewires itself.
        </p>
      </section>

      {/* Stats */}
      <div style={{ padding: "20px 24px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <StatCard value={`${recoveryPct}%`} label="Recovery" />
        <StatCard value="47d" label="Best Streak" />
        <StatCard value="0" label="Relapses" />
      </div>

      {/* Recovery bar */}
      <div style={{ padding: "16px 24px 0" }}>
        <ProgressBar value={recoveryPct} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "oklch(0.42 0.018 265)" }}>
          <span>Day 0</span>
          <span>90-day reset</span>
        </div>
      </div>

      {/* Brain timeline */}
      <section style={{ padding: "28px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <Eyebrow track=".20em">Brain Recovery Timeline</Eyebrow>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", fontVariantNumeric: "tabular-nums" }}>d{day}</span>
        </div>
        <BrainTimeline day={day} />
      </section>

      {/* Cards */}
      <section style={{ padding: "12px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <CheckInCard />
        <div style={{ borderRadius: 16, border: "1px solid oklch(0.62 0.22 255 / 0.20)", background: "oklch(0.62 0.22 255 / 0.05)", padding: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <IconSparkles size={16} sw={1.8} style={{ color: "var(--primary)" }} />
          <p style={{ fontSize: 13, lineHeight: 1.4 }}>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>You're doing real work.</span>{" "}
            Remember — you started for <span style={{ fontWeight: 500 }}>self-confidence</span>. Today counts.
          </p>
        </div>

        {/* Next milestone */}
        <div style={{ borderRadius: 16, border: "1px solid oklch(0.22 0.03 265)", background: "var(--gradient-surface)", padding: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ height: 44, width: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "oklch(0.62 0.22 255 / 0.12)", color: "var(--primary)", flexShrink: 0 }}>
            <IconTarget size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>Next milestone</Eyebrow>
            <p style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Day 60 — Emotional regulation</p>
          </div>
          <PillBadge>13d</PillBadge>
        </div>

        {/* SOS */}
        <button onClick={onSos} style={{
          display: "block", borderRadius: 16, padding: 14, textAlign: "center", fontWeight: 600, fontSize: 14,
          background: "linear-gradient(135deg, oklch(0.62 0.22 255 / 0.15), oklch(0.52 0.24 265 / 0.15))",
          border: "1px solid oklch(0.62 0.22 255 / 0.35)", color: "var(--primary)",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <IconZap size={16} sw={2} style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 6 }} />
          Feeling an urge? Open SOS →
        </button>

        {/* Relapse */}
        <button onClick={onRelapse} style={{
          width: "100%", borderRadius: 16, padding: 14, textAlign: "center",
          border: "1px solid oklch(0.22 0.03 265 / 0.4)", background: "oklch(0.13 0.022 265 / 0.5)",
          fontSize: 13, color: "var(--muted-foreground)", cursor: "pointer", fontFamily: "inherit",
        }}>
          <IconAlert size={14} style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 6 }} />
          I relapsed — log it honestly
        </button>
      </section>
    </div>
  );
}

function CheckInCard() {
  const [picked, setPicked] = useState(null);
  const moods = [
    { v: 1, e: "😞", l: "Rough" },
    { v: 2, e: "😕", l: "Low" },
    { v: 3, e: "😐", l: "OK" },
    { v: 4, e: "🙂", l: "Good" },
    { v: 5, e: "😤", l: "Strong" },
  ];
  return (
    <div style={{ borderRadius: 16, padding: 18, border: "1px solid var(--border-soft)", background: "var(--gradient-surface)" }}>
      <Eyebrow track=".20em">Daily Check-in</Eyebrow>
      <p style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>How are you feeling today?</p>
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        {moods.map(({ v, e, l }) => {
          const isPicked = picked === v;
          const dim = picked && !isPicked;
          return (
            <button key={v} onClick={() => setPicked(v)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 0", borderRadius: 12,
              border: `1px solid ${isPicked ? "var(--primary)" : "var(--border-soft)"}`,
              background: isPicked ? "oklch(0.62 0.22 255 / 0.10)" : "transparent",
              color: dim ? "oklch(0.42 0.018 265)" : isPicked ? "var(--primary)" : "var(--muted-foreground)",
              fontSize: 10, fontWeight: 500, fontFamily: "inherit",
              cursor: picked ? "default" : "pointer", transition: "all 200ms",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{e}</span>
              {l}
            </button>
          );
        })}
      </div>
      {picked && <p style={{ marginTop: 12, textAlign: "center", fontSize: 12, fontWeight: 500, color: "var(--primary)" }}>Check-in recorded ✓</p>}
    </div>
  );
}

Object.assign(window, { Dashboard, BottomNav, BrainTimeline, CheckInCard });

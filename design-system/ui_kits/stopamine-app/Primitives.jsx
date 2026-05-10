/* global React */
const { useState } = React;

// Lucide-style inline SVG helpers (currentColor, stroke 1.8)
function Icon({ d, size = 18, sw = 1.8, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {d ? <path d={d} /> : children}
    </svg>
  );
}
const IconHome = (p) => <Icon {...p}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Icon>;
const IconTree = (p) => <Icon {...p}><path d="M12 2a8 8 0 0 0-8 8c0 5 4 7 4 7h8s4-2 4-7a8 8 0 0 0-8-8"/><path d="M12 22V11"/><path d="m9 14 3-3 3 3"/></Icon>;
const IconWrench = (p) => <Icon {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Icon>;
const IconUsers = (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const IconBars = (p) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1"/></Icon>;
const IconZap = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
const IconSparkles = (p) => <Icon {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></Icon>;
const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const IconAlert = (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></Icon>;
const IconCoin = (p) => <Icon {...p}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>;
const IconArrow = (p) => <Icon {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Icon>;
const IconBack = (p) => <Icon {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const IconX = (p) => <Icon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;

// ── Reusable elements ──────────────────────────────────────────────────────

function Eyebrow({ children, color = "muted", track = "0.25em" }) {
  const c = color === "primary" ? "var(--primary)" : "var(--muted-foreground)";
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: track, textTransform: "uppercase", color: c, lineHeight: 1 }}>{children}</p>;
}

function PrimaryButton({ children, onClick, disabled = false, glow = true }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: 56, width: "100%", borderRadius: 16, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "var(--muted)" : "var(--gradient-primary)",
      boxShadow: glow && !disabled ? "var(--shadow-glow)" : "none",
      color: "white", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      opacity: disabled ? 0.25 : 1, transition: "opacity 200ms",
    }}>{children}</button>
  );
}

function StatCard({ value, label }) {
  return (
    <div style={{
      flex: 1, borderRadius: 16, padding: 12, textAlign: "center",
      border: "1px solid var(--border-soft)", background: "var(--gradient-surface)",
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function PillBadge({ children, color = "primary" }) {
  const c = color === "destructive" ? "oklch(0.62 0.24 25)"
        : color === "warning" ? "oklch(0.78 0.16 70)"
        : "var(--primary)";
  const bg = color === "destructive" ? "oklch(0.62 0.24 25 / 0.12)"
        : color === "warning" ? "oklch(0.78 0.16 70 / 0.08)"
        : "oklch(0.62 0.22 255 / 0.08)";
  const bd = color === "destructive" ? "oklch(0.62 0.24 25 / 0.5)"
        : color === "warning" ? "oklch(0.78 0.16 70 / 0.3)"
        : "oklch(0.62 0.22 255 / 0.3)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      borderRadius: 9999, border: `1px solid ${bd}`, background: bg, color: c,
      fontSize: 11, fontWeight: 700,
    }}>{children}</span>
  );
}

function ProgressBar({ value, height = 6 }) {
  return (
    <div style={{ height, borderRadius: 9999, background: "oklch(0.22 0.03 265)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, borderRadius: 9999, background: "var(--gradient-primary)", transition: "width 700ms" }} />
    </div>
  );
}

// Make available globally for other JSX modules
Object.assign(window, {
  IconHome, IconTree, IconWrench, IconUsers, IconBars, IconSettings,
  IconZap, IconSparkles, IconTarget, IconAlert, IconCoin, IconPlus,
  IconArrow, IconBack, IconCheck, IconX, IconLock,
  Eyebrow, PrimaryButton, StatCard, PillBadge, ProgressBar,
});

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Crown,
  CreditCard,
  Moon,
  Sun,
  Bell,
  BarChart2,
  Download,
  Trash2,
  Globe,
  Info,
  ChevronRight,
  Camera,
  FileText,
  ShieldCheck,
  Plus,
  Calendar,
} from "lucide-react";
import { useAppState, activeAddiction, dayCount } from "@/lib/store";
import { BADGES, currentBadge, badgeSplit } from "@/lib/badges";
import { triggerPaywall } from "@/lib/paywall";
import { useTheme } from "@/lib/theme";
import { AddAddictionModal } from "@/components/AddAddictionModal";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

// ── Primitive layout pieces ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 mb-2 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card divide-y divide-border/50 overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  onClick,
  destructive,
  chevron = true,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  chevron?: boolean;
  children?: React.ReactNode;
}) {
  const Tag = (onClick ? "button" : "div") as React.ElementType;
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        onClick ? "hover:bg-foreground/[0.03] active:bg-foreground/[0.06]" : ""
      } ${destructive ? "text-destructive" : ""}`}
    >
      {Icon && (
        <span
          className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 ${
            destructive ? "bg-destructive/10" : "bg-foreground/[0.06]"
          }`}
        >
          <Icon className={`h-4 w-4 ${destructive ? "text-destructive" : "text-foreground"}`} />
        </span>
      )}
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {children}
      {onClick && chevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      )}
    </Tag>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="h-6 w-11 rounded-full p-0.5 transition-colors shrink-0"
      style={{ background: value ? "var(--primary)" : "var(--border)" }}
      aria-checked={value}
      role="switch"
    >
      <span
        className="block h-5 w-5 rounded-full bg-white transition-transform shadow-sm"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

// ── Circular crop helper ──────────────────────────────────────────────────────

function cropToCircle(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Account section ───────────────────────────────────────────────────────────

function AccountSection({
  state,
  update,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const initials = state.onboarding?.name
    ? state.onboarding.name.slice(0, 2).toUpperCase()
    : "—";

  const memberSince = state.onboarding
    ? new Date(state.onboarding.completedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setPickerOpen(false);
    try {
      const dataUrl = await cropToCircle(file);
      update({ profilePhoto: dataUrl });
    } catch {
      // silently ignore crop errors
    }
  };

  return (
    <section>
      <SectionLabel>Account</SectionLabel>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Profile card */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 mb-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {state.profilePhoto ? (
              <img
                src={state.profilePhoto}
                alt="Profile"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div
                className="h-16 w-16 rounded-2xl grid place-items-center text-2xl font-bold"
                style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => setPickerOpen(true)}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background grid place-items-center bg-card hover:bg-muted transition-colors shadow-sm"
              title="Change photo"
              aria-label="Change profile photo"
            >
              <Camera className="h-3 w-3 text-foreground" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight truncate">
              {state.onboarding?.name || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince}</p>
            {state.isPremium && (
              <span
                className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
              >
                <Crown className="h-2.5 w-2.5" /> PRO
              </span>
            )}
          </div>
        </div>
      </div>

      <Card>
        <Row icon={User} label="Name" value={state.onboarding?.name || "Not set"} onClick={() => {}} />
        <Row icon={Mail} label="Email" value="Not connected" onClick={() => {}} />
        <Row icon={Lock} label="Change Password" onClick={() => {}} />
      </Card>

      {/* Photo picker sheet */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "oklch(0 0 0 / 0.55)" }}
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full mx-auto max-w-md rounded-t-3xl p-4 pb-8 space-y-2"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-3 pt-1">
              Profile Photo
            </p>
            <button
              onClick={() => { setPickerOpen(false); setTimeout(() => cameraInputRef.current?.click(), 50); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-medium transition-colors hover:bg-foreground/[0.05] active:bg-foreground/[0.08]"
              style={{ border: "1px solid var(--border)" }}
            >
              <Camera className="h-5 w-5 text-muted-foreground shrink-0" />
              Take Photo
            </button>
            <button
              onClick={() => { setPickerOpen(false); setTimeout(() => libraryInputRef.current?.click(), 50); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-sm font-medium transition-colors hover:bg-foreground/[0.05] active:bg-foreground/[0.08]"
              style={{ border: "1px solid var(--border)" }}
            >
              <span className="h-5 w-5 flex items-center justify-center shrink-0 text-muted-foreground text-base leading-none">⊞</span>
              Choose from Library
            </button>
            <button
              onClick={() => setPickerOpen(false)}
              className="w-full py-3 text-sm font-semibold text-muted-foreground mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function BillingSection({ state }: { state: ReturnType<typeof useAppState>[0] }) {
  return (
    <section>
      <SectionLabel>Billing & Plan</SectionLabel>
      <Card>
        <Row icon={Crown} label="Current Plan" value={state.isPremium ? "PRO" : "Free"} chevron={false}>
          {state.isPremium ? (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
            >
              ACTIVE
            </span>
          ) : (
            <button
              onClick={() => triggerPaywall()}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 transition-opacity hover:opacity-80"
              style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}
            >
              Upgrade
            </button>
          )}
        </Row>
        <Row icon={CreditCard} label="Payment Method" value="No card on file" onClick={() => {}} />
      </Card>
      {!state.isPremium && (
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          PRO unlocks full analytics · $39.99/year (~$3.33/mo) · 7-day free trial.
        </p>
      )}
    </section>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useTheme();

  return (
    <section>
      <SectionLabel>Appearance</SectionLabel>
      <Card>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="h-8 w-8 rounded-xl grid place-items-center shrink-0 bg-foreground/[0.06]">
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-foreground" />
            ) : (
              <Sun className="h-4 w-4 text-foreground" />
            )}
          </span>
          <span className="flex-1 text-sm font-medium">Theme</span>
          {/* Segmented pill */}
          <div
            className="flex rounded-xl overflow-hidden border border-border/70 shrink-0 p-0.5 gap-0.5"
            style={{ background: "var(--muted)" }}
          >
            {(["dark", "light"] as const).map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all"
                  style={
                    active
                      ? {
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.2)",
                        }
                      : { color: "var(--muted-foreground)" }
                  }
                >
                  {t === "dark" ? "Dark" : "Light"}
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    </section>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    push: true,
    email: false,
    weeklyReport: true,
  });

  const rows = [
    {
      key: "push" as const,
      icon: Bell,
      label: "Push notifications",
      sub: "Urge warnings, milestones & streaks",
    },
    {
      key: "email" as const,
      icon: Mail,
      label: "Email notifications",
      sub: "Recovery tips and updates",
    },
    {
      key: "weeklyReport" as const,
      icon: BarChart2,
      label: "Weekly progress report",
      sub: "Sent every Sunday morning",
    },
  ];

  return (
    <section>
      <SectionLabel>Notifications</SectionLabel>
      <Card>
        {rows.map(({ key, icon: Icon, label, sub }) => (
          <label key={key} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <span className="h-8 w-8 rounded-xl grid place-items-center shrink-0 bg-foreground/[0.06]">
              <Icon className="h-4 w-4 text-foreground" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
            <Toggle
              value={notifs[key]}
              onChange={(v) => setNotifs((s) => ({ ...s, [key]: v }))}
            />
          </label>
        ))}
      </Card>
    </section>
  );
}

function PrivacySection({ state }: { state: ReturnType<typeof useAppState>[0] }) {
  const navigate = useNavigate();
  const [deleteArmed, setDeleteArmed] = useState(false);

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: state.onboarding,
      addictions: state.addictions,
      relapses: state.relapses,
      points: state.points,
      completedChallenges: state.completedChallenges,
      isPremium: state.isPremium,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stopamine-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      setTimeout(() => setDeleteArmed(false), 5000);
      return;
    }
    ["stopamine.v1", "stopamine.v2", "stopamine.theme"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate({ to: "/onboarding" });
  };

  return (
    <section>
      <SectionLabel>Privacy & Data</SectionLabel>
      <Card>
        <Row icon={Download} label="Export my data" onClick={handleExport} />
        <Row
          icon={Trash2}
          label={deleteArmed ? "Tap again to confirm deletion" : "Delete account"}
          destructive
          onClick={handleDelete}
        />
      </Card>
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        Exporting downloads a JSON file with all your progress. Deletion is permanent and
        cannot be undone.
      </p>
    </section>
  );
}

function LanguageSection() {
  const [language, setLanguage] = useState("en");

  return (
    <section>
      <SectionLabel>Language</SectionLabel>
      <Card>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="h-8 w-8 rounded-xl grid place-items-center shrink-0 bg-foreground/[0.06]">
            <Globe className="h-4 w-4 text-foreground" />
          </span>
          <span className="flex-1 text-sm font-medium">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-transparent text-muted-foreground focus:outline-none cursor-pointer pr-1"
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </Card>
    </section>
  );
}

function AboutSection() {
  const navigate = useNavigate();
  return (
    <section>
      <SectionLabel>About</SectionLabel>
      <Card>
        <Row icon={Info} label="App Version" value="1.0.0" chevron={false} />
        <Row icon={FileText} label="Terms of Service" onClick={() => navigate({ to: "/terms" })} />
        <Row icon={ShieldCheck} label="Privacy Policy" onClick={() => navigate({ to: "/privacy" })} />
      </Card>
    </section>
  );
}

function TrackedHabitsSection({
  state,
  update,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <SectionLabel>Tracked Habits</SectionLabel>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors mb-2"
          style={{
            color: "var(--primary)",
            borderColor: "var(--primary)",
            background: "transparent",
          }}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      <Card>
        {state.addictions.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No habits tracked yet.</p>
        ) : (
          state.addictions.map((a) => {
            const day = dayCount(a.startDate);
            const isActive =
              a.id === state.activeAddictionId ||
              (!state.activeAddictionId && a === state.addictions[0]);
            return (
              <button
                key={a.id}
                onClick={() => update({ activeAddictionId: a.id })}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-foreground/[0.03]"
              >
                <span className="text-2xl leading-none shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">Day {day}</p>
                </div>
                {isActive && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      opacity: 0.9,
                    }}
                  >
                    Active
                  </span>
                )}
              </button>
            );
          })
        )}
      </Card>
      {showAdd && <AddAddictionModal onClose={() => setShowAdd(false)} />}
    </section>
  );
}

// ── Start Date Section ────────────────────────────────────────────────────────

function StartDateSection({
  state,
  update,
}: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
}) {
  const active = activeAddiction(state);
  const [showPicker, setShowPicker] = useState(false);
  const [dateValue, setDateValue]   = useState("");

  if (!active) return null;

  const locked = active.startDateLocked ?? false;
  const currentDateStr = new Date(active.startDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const minDate  = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);

  const handleConfirm = () => {
    if (!dateValue) return;
    const chosen = new Date(dateValue + "T00:00:00").getTime();
    if (chosen > Date.now()) return; // no future dates
    // Update active addiction's startDate and lock it
    const updated = state.addictions.map((a) =>
      a.id === active.id
        ? { ...a, startDate: chosen, startDateLocked: true }
        : a
    );
    update({ addictions: updated });
    setShowPicker(false);
  };

  return (
    <section>
      <SectionLabel>Recovery Start Date</SectionLabel>
      <Card>
        <Row
          icon={Calendar}
          label="Start Date"
          value={currentDateStr}
          onClick={locked ? undefined : () => { setDateValue(""); setShowPicker(true); }}
          chevron={!locked}
        >
          {locked && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-muted-foreground"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
              Locked
            </span>
          )}
        </Row>
      </Card>
      {!locked && (
        <p className="mt-1.5 px-1 text-xs text-muted-foreground">
          Set a past date if you were already clean before downloading. Can only be changed once.
        </p>
      )}

      {/* Date picker sheet */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "oklch(0 0 0 / 0.6)" }}
          onClick={() => setShowPicker(false)}
        >
          <div
            className="w-full mx-auto max-w-md rounded-t-3xl p-5 pb-8 space-y-4"
            style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-xs font-semibold text-muted-foreground tracking-widest uppercase pt-1">
              When did you last reset?
            </p>
            <p className="text-[13px] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
              Pick the date you started this streak. This can only be set once.
            </p>
            <input
              type="date"
              value={dateValue}
              max={todayStr}
              min={minDate}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full h-12 rounded-2xl px-4 text-sm font-medium focus:outline-none"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                colorScheme: "dark",
              }}
            />
            <button
              onClick={handleConfirm}
              disabled={!dateValue}
              className="w-full h-12 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-40 transition-opacity"
              style={{ background: "var(--gradient-primary)" }}
            >
              Confirm Start Date
            </button>
            <button
              onClick={() => setShowPicker(false)}
              className="w-full py-2 text-sm font-semibold text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Badge Section ─────────────────────────────────────────────────────────────

function BadgesSection({ state }: { state: ReturnType<typeof useAppState>[0] }) {
  const active = activeAddiction(state);
  const day    = active ? dayCount(active.startDate) : 0;
  const badge  = currentBadge(day);
  const { earned, upcoming } = badgeSplit(day);

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <SectionLabel>Badges</SectionLabel>
        {badge && (
          <span
            className="text-[10px] font-bold mb-2 px-2 py-0.5 rounded-full"
            style={{
              color: badge.color,
              background: `${badge.glow}`,
              border: `1px solid ${badge.color}40`,
            }}
          >
            {badge.symbol} {badge.name}
          </span>
        )}
      </div>

      <div
        className="rounded-2xl border border-border/70 overflow-hidden p-4"
        style={{ background: "var(--card)" }}
      >
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const isEarned = day >= b.day;
            return (
              <div
                key={b.name}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl"
                style={{
                  background: isEarned ? `${b.glow}` : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isEarned ? b.color + "40" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {/* Icon */}
                <div
                  className="text-[22px] font-bold leading-none"
                  style={{
                    color: isEarned ? b.color : "rgba(255,255,255,0.1)",
                    filter: isEarned ? "none" : "blur(3px)",
                    textShadow: isEarned ? `0 0 12px ${b.glow}` : "none",
                  }}
                >
                  {b.symbol}
                </div>
                {/* Name */}
                <p
                  className="text-[11px] font-bold text-center leading-tight"
                  style={{ color: isEarned ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)" }}
                >
                  {b.name}
                </p>
                {/* Day threshold */}
                <p
                  className="text-[9px] font-semibold tracking-wider"
                  style={{ color: isEarned ? `${b.color}90` : "rgba(255,255,255,0.12)" }}
                >
                  Day {b.day}
                </p>
                {/* Earned checkmark */}
                {isEarned && (
                  <div
                    className="h-3.5 w-3.5 rounded-full grid place-items-center"
                    style={{ background: b.color + "30", border: `1px solid ${b.color}60` }}
                  >
                    <div className="text-[8px] font-bold" style={{ color: b.color }}>✓</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#C4873A" }} />
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {earned.length}/{BADGES.length} unlocked
          </p>
          {upcoming.length > 0 && (
            <>
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Next: {upcoming[0].name} in {upcoming[0].day - day}d
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function Settings() {
  const navigate = useNavigate();
  const [state, update] = useAppState();

  return (
    <div className="min-h-screen bg-background pb-16 mx-auto max-w-md">
      {/* Sticky header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b border-border/50 backdrop-blur-xl"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={() => navigate({ to: "/" })}
          className="h-9 w-9 rounded-xl grid place-items-center transition-colors hover:bg-foreground/[0.06]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold flex-1">Settings</h1>
      </header>

      {/* Content */}
      <div className="px-5 pt-6 space-y-7 pb-12">
        <AccountSection state={state} update={update} />
        <BadgesSection state={state} />
        <BillingSection state={state} />
        <AppearanceSection />
        <NotificationsSection />
        <TrackedHabitsSection state={state} update={update} />
        <StartDateSection state={state} update={update} />
        <PrivacySection state={state} />
        <LanguageSection />
        <AboutSection />
      </div>
    </div>
  );
}

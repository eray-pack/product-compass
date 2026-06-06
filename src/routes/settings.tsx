import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { pageContainer, popUp, usePageAnimation } from "@/lib/pageAnimation";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Crown,
  CreditCard,
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
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useAppState, activeAddiction, dayCount } from "@/lib/store";
import { BADGES, currentBadge, badgeSplit, type Badge } from "@/lib/badges";
import { triggerPaywall } from "@/lib/paywall";
import { supabase } from "@/lib/supabase";
import { AddAddictionModal } from "@/components/AddAddictionModal";
import { PremiumBackground } from "@/components/PremiumBackground";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/lib/i18n";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

// ── Primitive layout pieces ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 mb-3">
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: "#C9A84C",
        opacity: 0.82,
      }}>
        {children}
      </p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="divide-y divide-white/[0.06] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "1px solid rgba(201,168,76,0.15)",
        borderRadius: 24,
      }}
    >
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
      className="h-6 w-11 rounded-full p-0.5 shrink-0"
      style={{
        background: value ? "#debc7a" : "rgba(255,255,255,0.12)",
        boxShadow: value
          ? "0 0 12px rgba(222,188,122,0.55), 0 0 26px rgba(222,188,122,0.22)"
          : "none",
        transition: "background 0.25s ease, box-shadow 0.25s ease",
      }}
      aria-checked={value}
      role="switch"
    >
      <span
        className="block h-5 w-5 rounded-full bg-white shadow-sm"
        style={{
          transform: value ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.22s ease",
        }}
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
      <div className="p-4 mb-3" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "1px solid rgba(201,168,76,0.15)", borderRadius: 24 }}>
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
                style={{
                  background: "rgba(201,168,76,0.14)",
                  border: "1px solid rgba(201,168,76,0.45)",
                  color: "#C9A84C",
                  boxShadow: "0 0 10px rgba(201,168,76,0.32)",
                }}
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

function BillingSection({ state, update }: {
  state: ReturnType<typeof useAppState>[0];
  update: ReturnType<typeof useAppState>[1];
}) {
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setRestoring(true);
    try {
      const { restorePurchases } = await import("@/lib/purchases");
      const restored = await restorePurchases();
      if (restored) {
        // RevenueCat confirms purchase — re-fetch premium status from Supabase
        const { checkPremium } = await import("@/lib/purchases");
        const isPremium = await checkPremium();
        update({ isPremium });
      }
    } catch (e) {
      console.warn("[Restore] RevenueCat restore failed", e);
    }
    setRestoring(false);
  }

  return (
    <section>
      <SectionLabel>Billing & Plan</SectionLabel>
      <Card>
        <Row icon={Crown} label="Current Plan" value={state.isPremium ? "PRO" : "Free"} chevron={false}>
          {state.isPremium ? (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.45)",
                color: "#C9A84C",
                boxShadow: "0 0 10px rgba(201,168,76,0.35), 0 0 24px rgba(201,168,76,0.12)",
                letterSpacing: "0.08em",
              }}
            >
              PRO ACTIVE
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
        <>
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            PRO unlocks full analytics · $39.99/year (~$3.33/mo) · 7-day free trial.
          </p>
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="mt-3 w-full py-2 text-center text-[11px] font-medium tracking-wide transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {restoring ? "Restoring…" : "Restore purchase"}
          </button>
        </>
      )}
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
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      setTimeout(() => setDeleteArmed(false), 5000);
      return;
    }
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("user_state").delete().eq("user_id", session.user.id);
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("[DeleteAccount] Supabase cleanup failed", e);
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
          label={deleting ? "Deleting…" : deleteArmed ? "Tap again to confirm deletion" : "Delete account"}
          destructive
          onClick={deleting ? undefined : handleDelete}
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
  const { t } = useTranslation();
  const [language, setLang] = useState(i18n.language ?? "en");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLang(lang);
    setLanguage(lang);
  };

  return (
    <section>
      <SectionLabel>{t("settings.sections.language")}</SectionLabel>
      <Card>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="h-8 w-8 rounded-xl grid place-items-center shrink-0 bg-foreground/[0.06]">
            <Globe className="h-4 w-4 text-foreground" />
          </span>
          <span className="flex-1 text-sm font-medium">{t("settings.sections.language")}</span>
          <select
            value={language}
            onChange={handleChange}
            className="text-sm bg-transparent focus:outline-none cursor-pointer pr-1"
            style={{ background: "#0D0A08", color: "rgba(255,255,255,0.55)" }}
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
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

// ── Delete habit confirmation modal ──────────────────────────────────────────
function DeleteHabitModal({
  habit,
  costs,
  identity,
  dayCount: days,
  onConfirm,
  onCancel,
}: {
  habit: { name: string; emoji: string };
  costs: string[];
  identity: string;
  dayCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border/60 overflow-hidden"
        style={{ background: "var(--card)" }}
      >
        {/* Warning header */}
        <div className="px-6 pt-7 pb-5 text-center"
             style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-4"
               style={{ background: "oklch(0.22 0.10 25 / 0.5)", border: "1px solid oklch(0.45 0.18 25 / 0.4)" }}>
            <AlertTriangle className="h-6 w-6" style={{ color: "oklch(0.72 0.18 25)" }} />
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
             style={{ color: "oklch(0.72 0.18 25)" }}>
            Wait — are you sure?
          </p>
          <h2 className="text-xl font-bold leading-snug">
            You're about to stop<br />tracking{" "}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>
              {habit.emoji} {habit.name}
            </span>
          </h2>
        </div>

        {/* Why you started */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-2xl p-4 space-y-3"
               style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase"
               style={{ color: "rgba(255,255,255,0.3)" }}>
              You started this because
            </p>

            {costs.length > 0 && (
              <div className="space-y-1.5">
                {costs.map((c) => (
                  <div key={c} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                         style={{ background: "oklch(0.72 0.18 25)" }} />
                    <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {c}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {identity && (
              <p className="text-[13px] italic pt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                "I am becoming someone who{" "}
                <span className="not-italic font-semibold" style={{ color: "#C4873A" }}>
                  {identity}
                </span>."
              </p>
            )}

            <p className="text-[12px] pt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              You've been clean for{" "}
              <span className="font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {days} {days === 1 ? "day" : "days"}
              </span>
              . That's real progress — don't lose the record.
            </p>
          </div>

          {/* Actions */}
          <button
            onClick={onCancel}
            className="w-full h-12 rounded-2xl font-bold text-sm"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            Keep fighting — stay in
          </button>
          <button
            onClick={onConfirm}
            className="w-full h-10 rounded-2xl text-sm font-medium"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Remove habit anyway
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgeMedallion({ day, size = 20 }: { day: number; size?: number }) {
  const badge = [...BADGES].reverse().find(b => day >= b.day) ?? BADGES[0];
  const glow  = badge.glow.replace(/[\d.]+\)$/, "");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 40% 35%, rgba(255,240,180,0.10) 0%, rgba(8,5,1,0.98) 65%)`,
      border: `1.5px solid ${badge.color}99`,
      boxShadow: `0 0 ${size / 2}px ${glow}0.55)`,
    }}>
      <span style={{
        fontSize: size * 0.48,
        lineHeight: 1,
        color: badge.color,
        filter: `drop-shadow(0 0 ${size / 5}px ${glow}0.9))`,
      }}>
        {badge.symbol}
      </span>
    </span>
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
  const [deleteTarget, setDeleteTarget] = useState<typeof state.addictions[0] | null>(null);
  const [dateTarget, setDateTarget] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    update((s) => {
      const remaining = s.addictions.filter((a) => a.id !== deleteTarget.id);
      const newActiveId =
        s.activeAddictionId === deleteTarget.id
          ? (remaining[0]?.id ?? "")
          : s.activeAddictionId;
      return { addictions: remaining, activeAddictionId: newActiveId };
    });
    setDeleteTarget(null);
  };

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <SectionLabel>Tracked Habits</SectionLabel>
        <motion.button
          onClick={() => setShowAdd(true)}
          whileTap={{ scale: 0.91 }}
          className="inline-flex items-center gap-1 mb-2"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#C9A84C",
            border: "1px solid rgba(201,168,76,0.40)",
            background: "rgba(201,168,76,0.07)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "5px 14px",
            textShadow: "0 0 10px rgba(201,168,76,0.45)",
            cursor: "pointer",
          }}
        >
          <Plus style={{ height: 12, width: 12 }} /> Add
        </motion.button>
      </div>

      {/* Habits — etched glass container */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(201,168,76,0.13)",
          borderRadius: 24,
          overflow: "hidden",
          padding: state.addictions.length === 0 ? "18px 20px" : "10px",
        }}
      >
        {state.addictions.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>No habits tracked yet.</p>
        ) : (
          <AnimatePresence mode="popLayout">
            {state.addictions.map((a) => {
              const day = dayCount(a.startDate);
              const isActive =
                a.id === state.activeAddictionId ||
                (!state.activeAddictionId && a === state.addictions[0]);
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.20 } }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 12px",
                    borderRadius: 16,
                    marginBottom: 6,
                    background: isActive
                      ? "radial-gradient(ellipse at 8% 50%, rgba(201,168,76,0.13) 0%, transparent 68%), rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isActive ? "rgba(201,168,76,0.26)" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: isActive ? "inset 0 0 24px rgba(201,168,76,0.04)" : "none",
                  }}
                >
                  {/* Main row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Tap to activate */}
                    <button
                      onClick={() => update({ activeAddictionId: a.id })}
                      style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {/* Emoji with ambient glow */}
                      <div style={{ position: "relative", flexShrink: 0, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isActive && (
                          <div style={{
                            position: "absolute", inset: -8, borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(201,168,76,0.38) 0%, transparent 72%)",
                            filter: "blur(7px)",
                            pointerEvents: "none",
                          }} />
                        )}
                        <span style={{
                          fontSize: 26,
                          lineHeight: 1,
                          position: "relative",
                          filter: isActive ? "drop-shadow(0 0 8px rgba(201,168,76,0.65))" : "none",
                          transition: "filter 0.3s ease",
                        }}>
                          {a.emoji}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isActive ? "#f5ede0" : "rgba(255,255,255,0.65)",
                          marginBottom: 1,
                          transition: "color 0.3s ease",
                        }}>
                          {a.name}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6 }}>
                          <BadgeMedallion day={day} size={18} />
                          Day {day}
                        </p>
                      </div>

                      {isActive && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase" as const,
                          padding: "3px 10px",
                          borderRadius: 999,
                          flexShrink: 0,
                          background: "rgba(201,168,76,0.12)",
                          border: "1px solid rgba(201,168,76,0.40)",
                          color: "#C9A84C",
                          boxShadow: "0 0 10px rgba(201,168,76,0.32), 0 0 22px rgba(201,168,76,0.10)",
                        }}>
                          Active
                        </span>
                      )}
                    </button>

                    {/* Date picker button */}
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      onClick={() => setDateTarget(dateTarget === a.id ? null : a.id)}
                      style={{
                        height: 28, width: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        background: dateTarget === a.id ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${dateTarget === a.id ? "rgba(201,168,76,0.40)" : "rgba(255,255,255,0.08)"}`,
                        color: dateTarget === a.id ? "#C9A84C" : "rgba(255,255,255,0.22)", cursor: "pointer",
                      }}
                      aria-label={`Set start date for ${a.name}`}
                    >
                      <Calendar style={{ height: 12, width: 12 }} />
                    </motion.button>

                    {/* Remove button */}
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      onClick={() => setDeleteTarget(a)}
                      style={{
                        height: 28, width: 28, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.22)", cursor: "pointer",
                      }}
                      aria-label={`Remove ${a.name}`}
                    >
                      <X style={{ height: 12, width: 12 }} />
                    </motion.button>
                  </div>

                  {/* Inline date picker — expands below the row */}
                  <AnimatePresence>
                    {dateTarget === a.id && (
                      <motion.div
                        key="datepicker"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{
                          marginTop: 10,
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "rgba(201,168,76,0.06)",
                          border: "1px solid rgba(201,168,76,0.18)",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>Start date</span>
                          <input
                            type="date"
                            defaultValue={new Date(a.startDate).toISOString().slice(0, 10)}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const ts = new Date(e.target.value).getTime();
                              update((s) => ({
                                addictions: s.addictions.map((ad) =>
                                  ad.id === a.id ? { ...ad, startDate: ts } : ad
                                ),
                              }));
                            }}
                            style={{
                              flex: 1,
                              background: "transparent",
                              border: "none",
                              color: "#C9A84C",
                              fontSize: 13,
                              fontWeight: 600,
                              outline: "none",
                              cursor: "pointer",
                              colorScheme: "dark",
                            }}
                          />
                          <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => setDateTarget(null)}
                            style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                              color: "#C9A84C", background: "none", border: "none",
                              cursor: "pointer", opacity: 0.7, padding: 0,
                            }}
                          >
                            Done
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {deleteTarget && (
        <DeleteHabitModal
          habit={deleteTarget}
          costs={state.onboarding?.costs ?? []}
          identity={state.onboarding?.identity ?? ""}
          dayCount={dayCount(deleteTarget.startDate)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showAdd && (
        <AddAddictionModal
          trackedIds={new Set(state.addictions.map((a) => a.id))}
          onClose={() => setShowAdd(false)}
          onAdd={(addiction) => {
            update((s) => ({ addictions: [...s.addictions, addiction] }));
            setShowAdd(false);
          }}
        />
      )}
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

// ── Coin Card ─────────────────────────────────────────────────────────────────

function CoinCard({
  badge,
  earned,
  index,
}: {
  badge: Badge;
  earned: boolean;
  index: number;
}) {
  const controls = useAnimation();
  const dimGlow = badge.glow.replace(/,[\d.]+\)$/, ",0.10)");

  const handleFlip = async () => {
    if (!earned) return;
    await controls.start({
      rotateY: [0, 180, 360],
      transition: { duration: 0.58, ease: [0.4, 0, 0.2, 1] },
    });
    controls.set({ rotateY: 0 });
  };

  return (
    <motion.div
      className="flex flex-col items-center select-none"
      style={{ gap: 10, cursor: earned ? "pointer" : "default" }}
      initial={{ opacity: 0, scale: 0.60, y: 32 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.068,
        duration: 0.54,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={earned ? { scale: 0.93 } : {}}
      onClick={handleFlip}
    >
      {/* Perspective wrapper gives rotateY real depth */}
      <div style={{ perspective: 700, width: 82, height: 82, position: "relative" }}>
        {/* Spinning element — rotateY is applied here */}
        <motion.div
          animate={controls}
          style={{ width: 82, height: 82, transformStyle: "preserve-3d" }}
        >
          {/* Coin face — overflow:hidden lives here (separate from preserve-3d) */}
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              background: earned
                ? `radial-gradient(circle at 36% 30%, ${badge.color}f2 0%, ${badge.color}88 38%, ${badge.color}24 66%, #060402 100%)`
                : "radial-gradient(circle at 36% 30%, #1d1710 0%, #0c0906 100%)",
              border: earned
                ? `2px solid ${badge.color}75`
                : "2px solid rgba(255,255,255,0.07)",
              boxShadow: earned
                ? `0 0 16px 4px ${badge.glow}, 0 4px 16px rgba(0,0,0,0.50)`
                : "0 2px 8px rgba(0,0,0,0.30)",
            }}
          >
            {/* Inner engraved ring — earned only */}
            {earned && (
              <div
                style={{
                  position: "absolute",
                  inset: 7,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.20)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}

            {/* Shimmer sweep — earned only, staggered per coin */}
            {earned && (
              <div
                className="coin-shimmer-bar"
                style={{ animationDelay: `${(index * 0.41) % 4}s` }}
              />
            )}

            {/* Symbol — centered */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  color: earned ? "#ffffff" : "rgba(255,255,255,0.07)",
                  opacity: earned ? 1 : 0.08,
                  filter: earned ? `drop-shadow(0 0 8px ${badge.color})` : "none",
                  userSelect: "none",
                }}
              >
                {badge.symbol}
              </span>
            </div>

          </div>
        </motion.div>

        {/* Earned check pip — outside overflow:hidden, corner of perspective wrapper */}
        {earned && (
          <div
            style={{
              position: "absolute",
              bottom: -3,
              right: -3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: badge.color,
              border: "2px solid #080604",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 900,
              color: "#080604",
              zIndex: 10,
              boxShadow: `0 0 8px ${badge.glow}`,
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Badge name */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.2,
          color: earned ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.17)",
        }}
      >
        {badge.name}
      </p>

      {/* Day threshold pill */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase" as const,
          color: earned ? badge.color : "rgba(255,255,255,0.12)",
          background: earned ? `${badge.color}1a` : "transparent",
          border: `1px solid ${earned ? badge.color + "30" : "transparent"}`,
          borderRadius: 20,
          padding: "1px 8px",
          lineHeight: 1.7,
        }}
      >
        D{badge.day}
      </div>
    </motion.div>
  );
}

// ── Badge Section ─────────────────────────────────────────────────────────────

function BadgesSection({ state }: { state: ReturnType<typeof useAppState>[0] }) {
  const active  = activeAddiction(state);
  const day     = active ? dayCount(active.startDate) : 0;
  const badge   = currentBadge(day);
  const { earned, upcoming } = badgeSplit(day);

  return (
    <section>
      {/* ── Shimmer keyframes ───────────────────────────────────────────── */}
      <style>{`
        @keyframes coin-shimmer {
          0%   { transform: translateX(-220%) rotate(22deg); opacity: 0; }
          4%   { opacity: 1; }
          30%  { transform: translateX(290%) rotate(22deg); opacity: 1; }
          31%  { opacity: 0; }
          100% { transform: translateX(290%) rotate(22deg); opacity: 0; }
        }
        .coin-shimmer-bar {
          position: absolute;
          top: -80%;
          left: -5%;
          width: 32%;
          height: 260%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.28) 40%,
            rgba(255,255,255,0.18) 60%,
            transparent 100%
          );
          animation: coin-shimmer 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 4;
        }
      `}</style>

      {/* ── Section header ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#C9A84C",
          opacity: 0.82,
        }}>Badges</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.04em",
            }}
          >
            {earned.length}/{BADGES.length}
          </span>
          {badge && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: badge.color,
                background: badge.glow,
                border: `1px solid ${badge.color}40`,
                borderRadius: 999,
                padding: "2px 10px",
                letterSpacing: "0.03em",
              }}
            >
              {badge.symbol} {badge.name}
            </span>
          )}
        </div>
      </div>

      {/* ── Coin grid card ──────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(158deg, #100d08 0%, #080604 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: "28px 14px 22px",
        }}
      >
        <div
          className="grid grid-cols-3"
          style={{ gap: "30px 6px", willChange: "transform" }}
        >
          {BADGES.map((b, i) => (
            <CoinCard
              key={b.name}
              badge={b}
              earned={day >= b.day}
              index={i}
            />
          ))}
        </div>

        {/* ── Next badge footer ────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 26,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {upcoming.length > 0 ? (
            <>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)" }}>
                Next
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: upcoming[0].color,
                }}
              >
                {upcoming[0].symbol} {upcoming[0].name}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)" }}>
                in {upcoming[0].day - day} day{upcoming[0].day - day !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#D4AF37",
                letterSpacing: "0.06em",
              }}
            >
              ♛ All badges unlocked. Legend.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function Settings() {
  const animKey = usePageAnimation("/settings");
  const navigate = useNavigate();
  const [state, update] = useAppState();

  return (
    <div className="min-h-screen pb-16 mx-auto max-w-md">
      <PremiumBackground />
      {/* Sticky header */}
      <header
        className="sticky z-20 flex items-center gap-3 px-4 h-14 border-b border-border/50 backdrop-blur-xl"
        style={{
          background: "rgba(10,8,6,0.82)",
          top: "env(safe-area-inset-top)",
        }}
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
        <BillingSection state={state} update={update} />
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

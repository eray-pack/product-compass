// Local-storage backed store for Stopamine — syncs key fields to Supabase
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type OnboardingData = {
  duration: string;
  costs: string[];
  triggers: string[];
  identity: string;
  name: string;
  otherHabits: string[];
  completedAt: number;
};

export type Addiction = {
  id: string;
  name: string;
  emoji: string;
  startDate: number;
  totalCleanDays: number;
  urgesSurvived: number;
  premium?: boolean;      // if true, requires PRO to view past blur
  startDateLocked?: boolean; // set to true after first manual date override
};

export type ChallengeProgress = {
  id: string;
  doneAt: number; // ms
};

const KEY = "stopamine.v2";

export type Relapse = {
  ts: number;
  note?: string;
  reframeShown: boolean;
};

export type NotificationStyle = "conversational" | "curiosity" | "question" | "quiet";
export type NotificationApp = "messaging" | "instagram" | "email" | "rarely";

export type AppState = {
  onboarding: OnboardingData | null;
  paywallSeen: boolean;
  isPremium: boolean;
  // Multi-addiction
  addictions: Addiction[];
  activeAddictionId: string;
  // Gamification
  points: number;
  completedChallenges: ChallengeProgress[];
  // Life tree
  treeXP: number;
  treeUnlocks: string[];
  // Relapse tracking — momentum never resets
  relapses: Relapse[];
  // Notification preferences
  notificationStyles: NotificationStyle[];
  notificationApps: NotificationApp[];
  // Identity lock-in
  lastIdentityShown: number;
  // Upsell
  momentumShieldDays: number;
  // Profile photo (base64 data URL)
  profilePhoto: string | null;
  // Companion avatar
  companion: "tree" | "wolf";
  // Dev-only: unlock companion switcher independently of isPremium
  companionSwitcherUnlocked: boolean;
  // Login & activity tracking
  lastLoginAt: number;
  loginHistory: number[];
  totalReturns: number;
  // Tree watering — date string "YYYY-MM-DD", prevents double-award per day
  lastTreeWaterDate: string;
  // Daily credit claim — date string "YYYY-MM-DD"
  lastDailyClaimDate: string;
  // Legacy mirrors
  startDate: number;
  totalCleanDays: number;
  badges: string[];
  urgesSurvived: number;
  // Milestone celebrations — prevents re-triggering on every load
  hasCelebrated90: boolean;
};

const defaultState = (): AppState => ({
  onboarding: null,
  paywallSeen: false,
  isPremium: false,
  addictions: [],
  activeAddictionId: "",
  points: 0,
  completedChallenges: [],
  treeXP: 0,
  treeUnlocks: [],
  relapses: [],
  profilePhoto: null,
  companion: "tree",
  companionSwitcherUnlocked: false,
  notificationStyles: [],
  notificationApps: [],
  lastIdentityShown: 0,
  momentumShieldDays: 0,
  lastLoginAt: 0,
  loginHistory: [],
  totalReturns: 0,
  lastTreeWaterDate: "",
  lastDailyClaimDate: "",
  startDate: Date.now(),
  totalCleanDays: 0,
  badges: [],
  urgesSurvived: 0,
  hasCelebrated90: false,
});

const VALID_COMPANIONS = new Set<string>(["tree", "wolf"]);

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged: AppState = { ...defaultState(), ...parsed };
    if (!VALID_COMPANIONS.has(merged.companion)) merged.companion = "tree";
    return merged;
  } catch {
    return defaultState();
  }
}

const STATE_CHANGE_EVENT = "stopamine-state-changed";

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(STATE_CHANGE_EVENT, { detail: s }));
}

async function syncToSupabase(s: AppState) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from("user_state").upsert({
    user_id: session.user.id,
    points: s.points,
    tree_xp: s.treeXP,
    badges: s.badges,
    total_returns: s.totalReturns,
    last_login_at: s.lastLoginAt,
    onboarding: s.onboarding,
    updated_at: new Date().toISOString(),
  });
}

async function loadFromSupabase(setState: (fn: (prev: AppState) => AppState) => void) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const { data } = await supabase
    .from("user_state")
    .select("points, tree_xp, badges, total_returns, last_login_at, onboarding, is_premium")
    .eq("user_id", session.user.id)
    .single();
  if (!data) return;
  setState((prev) => {
    const merged: AppState = {
      ...prev,
      points: data.points ?? prev.points,
      treeXP: data.tree_xp ?? prev.treeXP,
      badges: data.badges ?? prev.badges,
      totalReturns: data.total_returns ?? prev.totalReturns,
      lastLoginAt: data.last_login_at ?? prev.lastLoginAt,
      onboarding: data.onboarding ?? prev.onboarding,
      isPremium: data.is_premium ?? prev.isPremium,
    };
    saveState(merged);
    return merged;
  });
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    setState(loadState());
    loadFromSupabase(setState);

    // Re-sync whenever ANY component writes state (cross-component reactivity)
    const onStateChange = (e: Event) => {
      setState((e as CustomEvent<AppState>).detail);
    };
    window.addEventListener(STATE_CHANGE_EVENT, onStateChange);
    return () => window.removeEventListener(STATE_CHANGE_EVENT, onStateChange);
  }, []);

  const update = (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      const next = { ...prev, ...p };
      saveState(next);   // dispatches STATE_CHANGE_EVENT → all subscribers update
      syncToSupabase(next);
      return next;
    });
  };
  return [state, update] as const;
}

export function dayCount(startDate: number) {
  if (!startDate || isNaN(startDate)) return 1;
  return Math.max(1, Math.floor((Date.now() - startDate) / 86400000) + 1);
}

export function activeAddiction(s: AppState): Addiction | undefined {
  return s.addictions.find((a) => a.id === s.activeAddictionId) ?? s.addictions[0];
}

/** The addiction with the most clean days — used for community badge, profile rank, etc. */
export function flagshipAddiction(s: AppState): Addiction | undefined {
  if (!s.addictions.length) return undefined;
  return s.addictions.reduce((best, a) =>
    dayCount(a.startDate) > dayCount(best.startDate) ? a : best
  );
}

export function longestCleanPeriod(s: AppState): number {
  const active = activeAddiction(s);
  if (!active) return 0;
  if (s.relapses.length === 0) return dayCount(active.startDate);
  const sorted = [...s.relapses].sort((a, b) => a.ts - b.ts);
  const points = [active.startDate, ...sorted.map(r => r.ts), Date.now()];
  const gaps = points.slice(1).map((t, i) => Math.floor((t - points[i]) / 86400000));
  return Math.max(...gaps);
}

export function inactivityDays(lastLoginAt: number): number {
  if (!lastLoginAt) return 0;
  return Math.floor((Date.now() - lastLoginAt) / 86400000);
}

// Tree level mapping
export function treeStage(xp: number) {
  if (xp < 100) return { stage: 0, name: "Seed", next: 100 };
  if (xp < 300) return { stage: 1, name: "Sprout", next: 300 };
  if (xp < 700) return { stage: 2, name: "Sapling", next: 700 };
  if (xp < 1500) return { stage: 3, name: "Young tree", next: 1500 };
  if (xp < 3000) return { stage: 4, name: "Strong tree", next: 3000 };
  return { stage: 5, name: "Ancient tree", next: xp };
}

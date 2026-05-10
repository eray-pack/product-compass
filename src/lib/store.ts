// Local-storage backed mock store for Stopamine
import { useEffect, useState } from "react";

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
  premium?: boolean; // if true, requires PRO to view past blur
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
  // Companion avatar
  companion: "tree" | "man" | "woman";
  // Login & activity tracking
  lastLoginAt: number;
  loginHistory: number[];
  totalReturns: number;
  // Legacy mirrors
  startDate: number;
  totalCleanDays: number;
  badges: string[];
  urgesSurvived: number;
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
  companion: "tree",
  notificationStyles: [],
  notificationApps: [],
  lastIdentityShown: 0,
  momentumShieldDays: 0,
  lastLoginAt: 0,
  loginHistory: [],
  totalReturns: 0,
  startDate: Date.now(),
  totalCleanDays: 0,
  badges: [],
  urgesSurvived: 0,
});

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);
  useEffect(() => { setState(loadState()); }, []);
  const update = (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      const next = { ...prev, ...p };
      saveState(next);
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

export function longestCleanPeriod(s: AppState): number {
  const active = activeAddiction(s);
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

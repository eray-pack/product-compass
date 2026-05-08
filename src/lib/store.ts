// Local-storage backed mock store for Stopamine
import { useEffect, useState } from "react";

export type OnboardingData = {
  duration: string;
  costs: string[];
  triggers: string[];
  identity: string;
  name: string;
  completedAt: number;
};

const KEY = "stopamine.v1";

export type AppState = {
  onboarding: OnboardingData | null;
  paywallSeen: boolean;
  isPremium: boolean;
  startDate: number; // ms
  totalCleanDays: number;
  badges: string[];
  urgesSurvived: number;
};

const defaultState = (): AppState => ({
  onboarding: null,
  paywallSeen: false,
  isPremium: false,
  startDate: Date.now() - 13 * 86400000, // mock: day 14
  totalCleanDays: 47,
  badges: ["First Week"],
  urgesSurvived: 4,
});

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
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
  const update = (patch: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  };
  return [state, update] as const;
}

export function dayCount(startDate: number) {
  return Math.max(1, Math.floor((Date.now() - startDate) / 86400000) + 1);
}

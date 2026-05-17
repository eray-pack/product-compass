// Theme is permanently dark — no user-facing toggle exists.
// This file is kept as a stub so any legacy import doesn't break compilation.

export type Theme = "dark";

export function applyTheme(_theme: Theme) {
  document.documentElement.className = "dark";
  document.documentElement.style.background = "#0D0A08";
  document.documentElement.style.colorScheme = "dark";
  localStorage.removeItem("stopamine.theme");
}

export function getStoredTheme(): Theme {
  return "dark";
}

export function useTheme(): [Theme, (t: Theme) => void] {
  return ["dark", applyTheme];
}

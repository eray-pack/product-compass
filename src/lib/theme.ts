import { useEffect, useState } from "react";

const THEME_KEY = "stopamine.theme";
export type Theme = "dark" | "light";

export function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem(THEME_KEY, theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(THEME_KEY) as Theme) ?? "dark";
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  const changeTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  return [theme, changeTheme];
}

import { useState, useEffect, useCallback } from "react";
import type { Theme } from "@/types";
import { STORAGE_KEYS, DEFAULTS } from "@/constants";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (savedTheme as Theme) || DEFAULTS.THEME;
  });

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme
  };
}

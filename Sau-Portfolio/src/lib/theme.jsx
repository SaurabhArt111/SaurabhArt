import { createContext, useContext, useEffect, useState } from "react";

/* THEME — replaces the old EN|FR switch.
   Two themes: "light" (the site's original look) and "dark" (a GitHub-dark
   inspired palette). Persisted to localStorage; falls back to the OS
   preference on first visit. A blocking snippet in index.html sets the
   attribute before paint so there is no flash of the wrong theme. */

const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme;
  }
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* private mode — fall through to OS preference */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — the choice simply won't persist */
    }
  }, [theme]);

  const setTheme = (t) => setThemeState(t === "dark" ? "dark" : "light");
  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

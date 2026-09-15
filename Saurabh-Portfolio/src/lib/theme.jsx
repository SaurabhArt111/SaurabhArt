import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* THEME — replaces the old EN|FR switch.
   Two themes: "light" (the site's original look) and "dark" (a GitHub-dark
   inspired palette). Persisted to localStorage; falls back to the OS
   preference on first visit. A blocking snippet in index.html sets the
   attribute before paint so there is no flash of the wrong theme.

   Switching themes plays a fast diagonal "wipe" — a solid curtain in the
   OLD theme's background color covers the screen, the theme flips
   instantly underneath it (invisible, since the curtain is already that
   color), then the curtain retracts along a top-right → bottom-left
   diagonal, revealing the new theme exactly like a reveal-wipe. No DOM
   snapshotting involved, so it's cheap and works in every browser. */

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

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* both polygons share the same point count/order so the browser can
   animate cleanly between them — only the two left-edge x's move, and the
   constant +34 offset between top/bottom keeps the diagonal's tilt fixed
   as it sweeps, top-right leaning ahead of bottom-left. */
const COVERED = "polygon(-60% -25%, 176% -25%, 142% 125%, -94% 125%)";
const REVEALED = "polygon(-140% -25%, 96% -25%, 62% 125%, -174% 125%)";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [wipe, setWipe] = useState(null); // { color, phase: "in" | "out" }
  const wipeTimers = useRef([]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode — the choice simply won't persist */
    }
  }, [theme]);

  useEffect(
    () => () => wipeTimers.current.forEach((id) => clearTimeout(id)),
    []
  );

  const applyTheme = (next) => {
    const target = next === "dark" ? "dark" : "light";

    setThemeState((current) => {
      if (current === target) return current;

      if (prefersReducedMotion() || typeof document === "undefined") {
        return target;
      }

      /* snapshot the OLD background so the curtain is invisible at t=0 */
      const oldBg = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim() || (current === "dark" ? "#0d1117" : "#ffffff");

      wipeTimers.current.forEach((id) => clearTimeout(id));
      wipeTimers.current = [];
      setWipe({ color: oldBg, phase: "in" });

      /* flip the theme one frame later, still hidden under the curtain,
         then retract the curtain on the following frame */
      requestAnimationFrame(() => {
        setThemeState(target);
        requestAnimationFrame(() => {
          setWipe((w) => (w ? { ...w, phase: "out" } : w));
          wipeTimers.current.push(setTimeout(() => setWipe(null), 650));
        });
      });

      return current; // theme itself flips inside the rAF above
    });
  };

  const setTheme = (t) => applyTheme(t);
  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
      {wipe &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999999,
              pointerEvents: "none",
              background: wipe.color,
              clipPath: wipe.phase === "out" ? REVEALED : COVERED,
              transition:
                wipe.phase === "out"
                  ? "clip-path 620ms cubic-bezier(0.65, 0, 0.35, 1)"
                  : "none",
            }}
          />,
          document.body
        )}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

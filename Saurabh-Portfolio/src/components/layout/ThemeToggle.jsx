import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../lib/theme";
import "./ThemeToggle.css";

const styles = {
  "toggle": "themetoggle-toggle",
  "thumb": "themetoggle-thumb",
  "opt": "themetoggle-opt",
  "on": "themetoggle-on",
};

/* Sun | Moon — lives where EN | FR used to sit, far right of the header.
   A sliding indicator moves between the two; switching is pure React state
   plus a data-theme attribute on <html>, so scroll position and the active
   section are preserved exactly like the old language switch. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.toggle} role="group" aria-label="Theme">
      <span
        className={styles.thumb}
        style={{ transform: `translateX(${theme === "dark" ? "100%" : "0%"})` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`${styles.opt} ${theme === "light" ? styles.on : ""}`}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Light theme"
        title="Light theme"
      >
        <FiSun size={14} />
      </button>
      <button
        type="button"
        className={`${styles.opt} ${theme === "dark" ? styles.on : ""}`}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <FiMoon size={14} />
      </button>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { FiMaximize2, FiMenu, FiMinimize2, FiX } from "react-icons/fi";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import heroProgress from "../../lib/heroProgress";
import ThemeToggle from "./ThemeToggle";
import { useLang } from "../../lib/i18n";
import "./Nav.css";

const styles = {
  "wrap": "nav-wrap",
  "wrapVisible": "nav-wrap-visible",
  "cap": "nav-cap",
  "scrolled": "nav-scrolled",
  "logo": "nav-logo",
  "links": "nav-links",
  "on": "nav-on",
  "roll": "nav-roll",
  "right": "nav-right",
  "fullscreen": "nav-fullscreen",
  "prompt": "fullscreen-prompt",
  "promptOpen": "fullscreen-prompt-open",
  "promptCopy": "fullscreen-prompt-copy",
  "promptKicker": "fullscreen-prompt-kicker",
  "promptActions": "fullscreen-prompt-actions",
  "promptPrimary": "fullscreen-prompt-primary",
  "promptDismiss": "fullscreen-prompt-dismiss",
  "burger": "nav-burger",
  "burgerOpen": "nav-burger-open",
  "sheet": "nav-sheet",
  "sheetOpen": "nav-sheet-open",
  "sheetOn": "nav-sheet-on",
  "scrim": "nav-scrim",
  "scrimOn": "nav-scrim-on",
};

/* `#home` resolves to the very top of the document (see lib/lenis.js), so
   Home always returns to the true beginning of the portfolio. */
const LINKS = [
  { key: "nav.home", href: "#home", watch: null },
  { key: "nav.about", href: "#about", watch: "about" },
  { key: "nav.work", href: "#work", watch: "work" },
  { key: "nav.skills", href: "#stack", watch: "stack" },
  { key: "nav.gallery", href: "#gallery", watch: "gallery" },
  { key: "nav.contact", href: "#contact", watch: "contact" },
];

export default function Nav() {
  const ref = useRef(null);
  const { t } = useLang();
  const [active, setActive] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  /* the header stays hidden through the opening character-sequence cover and
     only reveals once you're more than halfway through it — driven directly
     by the same scroll-progress value the character canvas itself uses
     (see lib/heroProgress.js), rather than a second ScrollTrigger watching
     a nested sticky element, which measured unreliably */
  const [visible, setVisible] = useState(false);
  /* mobile drawer — the desktop pill can't hold four links plus the toggle
     at phone widths, so below 900px navigation lives behind a menu button
     rather than being hidden entirely (which is what it was doing) */
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* Fullscreen can be rejected by the browser or embedding context. */
    }
  };

  useEffect(() => {
    const syncFullscreen = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) setPromptOpen(false);
    };
    const onKey = (e) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable;

      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    window.addEventListener("keydown", onKey);
    syncFullscreen();
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (
      !document.documentElement.requestFullscreen ||
      document.fullscreenElement ||
      sessionStorage.getItem("fullscreen-prompt-dismissed")
    ) {
      return undefined;
    }

    const id = window.setTimeout(() => setPromptOpen(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  const dismissPrompt = () => {
    sessionStorage.setItem("fullscreen-prompt-dismissed", "true");
    setPromptOpen(false);
  };

  const acceptPrompt = () => {
    setPromptOpen(false);
    toggleFullscreen();
  };

  /* close on Escape, and lock the page behind the open drawer */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  /* never leave the drawer open behind a resize to desktop */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  /* reveal: hidden through the opening cover, appears once you're past the
     halfway point of the character section's own scroll range, hides again
     scrolling back above it — a plain per-frame check against the shared
     progress value, symmetric in both directions by construction */
  useEffect(() => {
    const REVEAL_AT = 0.5;
    let last = null;
    const check = () => {
      const shouldShow = heroProgress.current >= REVEAL_AT;
      if (shouldShow !== last) {
        last = shouldShow;
        setVisible(shouldShow);
      }
    };
    check();
    gsap.ticker.add(check);
    return () => gsap.ticker.remove(check);
  }, []);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      /* Once revealed, the header condenses slightly on scroll, which keeps
         it feeling part of the page rather than a floating panel. */
      ScrollTrigger.create({
        start: "top top-=40",
        onUpdate: (self) => {
          nav.classList.toggle(styles.scrolled, self.scroll() > 40);
        },
        onLeaveBack: () => nav.classList.remove(styles.scrolled),
      });

      /* scroll-spy: the nav reflects where you actually are, and falls back
         to Home whenever you are near the top of the document */
      const spies = LINKS.filter((l) => l.watch).map((l) =>
        ScrollTrigger.create({
          trigger: `#${l.watch}`,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setActive(l.watch);
          },
        })
      );
      const top = ScrollTrigger.create({
        start: 0,
        end: () => window.innerHeight * 1.2,
        onToggle: (self) => {
          if (self.isActive) setActive(null);
        },
      });

      return () => {
        spies.forEach((s) => s.kill());
        top.kill();
      };
    }, nav);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <header
        className={`${styles.wrap} ${visible ? styles.wrapVisible : ""}`}
        ref={ref}
      >
        <div className={styles.cap}>
        <a href="#home" className={styles.logo} aria-label={t("nav.home")}>
          SAURABH<i>.</i>
        </a>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => {
            const isOn = l.watch === active;
            return (
              <a
                key={l.key}
                href={l.href}
                className={isOn ? styles.on : ""}
                aria-current={isOn ? "page" : undefined}
              >
                <span className={styles.roll}>
                  <span>{t(l.key)}</span>
                  <span aria-hidden="true">{t(l.key)}</span>
                </span>
              </a>
            );
          })}
        </nav>

        <div className={styles.right}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.fullscreen}
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("nav.exitFullscreen") : t("nav.fullscreen")}
            title={isFullscreen ? t("nav.exitFullscreen") : t("nav.fullscreen")}
          >
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
          <button
            type="button"
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
        </div>

      {/* ---------- mobile drawer ---------- */}
        <div
          className={`${styles.sheet} ${menuOpen ? styles.sheetOpen : ""}`}
          id="mobile-nav"
          hidden={!menuOpen}
        >
          <nav aria-label="Primary mobile">
            {LINKS.map((l) => (
              <a
                key={l.key}
                href={l.href}
                className={l.watch === active ? styles.sheetOn : ""}
                aria-current={l.watch === active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {t(l.key)}
              </a>
            ))}
            <button
              type="button"
              className={styles.fullscreen}
              onClick={() => {
                setMenuOpen(false);
                toggleFullscreen();
              }}
            >
              {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              {isFullscreen ? t("nav.exitFullscreen") : t("nav.fullscreen")}
            </button>
          </nav>
        </div>
        <button
          type="button"
          className={`${styles.scrim} ${menuOpen ? styles.scrimOn : ""}`}
          aria-label={t("nav.close")}
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
      </header>

      <aside className={`${styles.prompt} ${promptOpen ? styles.promptOpen : ""}`}>
        <div className={styles.promptCopy}>
          <span className={styles.promptKicker}>VIEW MODE</span>
          <strong>{t("nav.fullscreenPrompt")}</strong>
        </div>
        <div className={styles.promptActions}>
          <button type="button" className={styles.promptPrimary} onClick={acceptPrompt}>
            <FiMaximize2 size={14} /> {t("nav.fullscreen")}
          </button>
          <button type="button" className={styles.promptDismiss} onClick={dismissPrompt}>
            {t("nav.noThanks")}
          </button>
        </div>
      </aside>
    </>
  );
}

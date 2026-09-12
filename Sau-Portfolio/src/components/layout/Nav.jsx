import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { gsap, ScrollTrigger } from "../../lib/gsap";
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
  "burger": "nav-burger",
  "burgerOpen": "nav-burger-open",
  "sheet": "nav-sheet",
  "sheetOpen": "nav-sheet-open",
  "sheetOn": "nav-sheet-on",
  "scrim": "nav-scrim",
  "scrimOn": "nav-scrim-on",
};

const LINKS = [
  { key: "nav.home", href: "#home", watch: null },
  { key: "nav.about", href: "#about", watch: "about" },
  { key: "nav.skills", href: "#stack", watch: "stack" },
  { key: "nav.work", href: "#work", watch: "work" },
  { key: "nav.contact", href: "#contact", watch: "contact" },
];

export default function Nav() {
  const ref = useRef(null);
  const { t } = useLang();
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const close = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top top-=40",
        onUpdate: (self) => {
          nav.classList.toggle(styles.scrolled, self.scroll() > 40);
        },
        onLeaveBack: () => nav.classList.remove(styles.scrolled),
      });

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

      const reveal = ScrollTrigger.create({
        trigger: "#home",
        start: "top 88%",
        onEnter: () => setVisible(true),
        onLeaveBack: () => setVisible(false),
      });

      return () => {
        spies.forEach((s) => s.kill());
        top.kill();
        reveal.kill();
      };
    }, nav);

    return () => ctx.revert();
  }, []);

  return (
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
  );
}

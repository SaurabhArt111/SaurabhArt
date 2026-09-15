
import { useEffect, useRef } from "react";
import { FiLinkedin, FiGithub, FiInstagram, FiArrowUpRight, FiArrowUp } from "react-icons/fi";
import { gsap, EASE, prefersReducedMotion } from "../../../lib/gsap";
import Button from "../../ui/Button";
import "./Connect.css";
import { useLang } from "../../../lib/i18n";

const styles = {
  "connect": "conn-connect",
  "head": "conn-head",
  "eyebrow": "conn-eyebrow",
  "h2": "conn-h2",
  "serif": "conn-serif",
  "lede": "conn-lede",
  "cta": "conn-cta",
  "socials": "conn-socials",
  "social": "conn-social",
  "glyph": "conn-glyph",
  "roll": "conn-roll",
  "arrow": "conn-arrow",
  "footer": "conn-footer",
  "top": "conn-top",
};

/* react-icons/fi (Feather) — swapped in for the hand-rolled brand svgs */
const MARKS = {
  linkedin: <FiLinkedin aria-hidden="true" />,
  github: <FiGithub aria-hidden="true" />,
  instagram: <FiInstagram aria-hidden="true" />,
};

/* URLs exactly as supplied by Saurabh — never guessed */
const SOCIALS = [
  { name: "LinkedIn", mark: "linkedin", href: "https://www.linkedin.com/in/saurabh-maurya-55a66433b" },
  { name: "GitHub", mark: "github", href: "https://github.com/SaurabhArt111" },
  { name: "Instagram", mark: "instagram", href: "https://www.instagram.com/saurabh_art__111" },
];

export default function Connect() {
  const root = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      /* reveal */
      gsap.from(`.${styles.head} > *`, {
        y: 36,
        autoAlpha: 0,
        duration: 0.9,
        ease: EASE.outExpo,
        stagger: 0.09,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 70%" },
      });
      gsap.from(`.${styles.socials} > *`, {
        y: 26,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE.outExpo,
        stagger: 0.07,
        immediateRender: false,
        scrollTrigger: { trigger: `.${styles.socials}`, start: "top 88%" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.connect} id="contact" ref={root}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>
          <span>09</span> {t("connect.eyebrow")}
        </p>
        <h2 className={styles.h2}>
          {t("connect.h2a")}{" "}
          <em className={styles.serif}>{t("connect.h2Em")}</em>
        </h2>
        <p className={styles.lede}>
          {t("connect.lede")}
        </p>
        <div className={styles.cta}>
          <Button
            href="https://www.linkedin.com/in/saurabh-maurya-55a66433b"
            target="_blank"
            rel="noreferrer"
            variant="primary"
            arrow
          >
            {t("connect.cta")}
          </Button>
        </div>
      </div>

      {/* social cards */}
      <div className={styles.socials}>
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            className={styles.social}
            target={s.href.startsWith("http") ? "_blank" : undefined}
            rel={s.href.startsWith("http") ? "noreferrer" : undefined}
          >
            <span className={styles.glyph}>
              {"mark" in s ? MARKS[s.mark] : s.glyph}
            </span>
            <span className={styles.roll}>
              <span>{s.name}</span>
              <span aria-hidden="true">{s.name}</span>
            </span>
            <span className={styles.arrow}><FiArrowUpRight aria-hidden="true" /></span>
          </a>
        ))}
      </div>

      <footer className={styles.footer}>
        <span>
          {t("connect.credit")} <b>Saurabh</b>
        </span>
        <a href="#home" className={styles.top}>
          <FiArrowUp size={13} aria-hidden="true" /> {t("connect.top")}
        </a>
        <span>© 2026 Saurabh Maurya</span>
      </footer>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { FiSearch, FiEdit3, FiTerminal, FiSend } from "react-icons/fi";
import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from "../../../lib/gsap";
import { useLang } from "../../../lib/i18n";
import "./Process.css";

const styles = {
  "process": "proc-process",
  "header": "proc-header",
  "eyebrow": "proc-eyebrow",
  "h2": "proc-h2",
  "serif": "proc-serif",
  "lede": "proc-lede",
  "rail": "proc-rail",
  "line": "proc-line",
  "lineDraw": "proc-line-draw",
  "steps": "proc-steps",
  "step": "proc-step",
  "num": "proc-num",
  "icon": "proc-icon",
  "title": "proc-title",
  "desc": "proc-desc",
};

const STEPS = [
  { icon: FiSearch, key: "discover" },
  { icon: FiEdit3, key: "design" },
  { icon: FiTerminal, key: "build" },
  { icon: FiSend, key: "ship" },
];

export default function Process() {
  const root = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(`.${styles.header} > *`, {
        y: 34,
        autoAlpha: 0,
        duration: 0.85,
        ease: EASE.outExpo,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
      gsap.from(`.${styles.step}`, {
        y: 30,
        autoAlpha: 0,
        duration: 0.7,
        ease: EASE.outExpo,
        stagger: 0.12,
        scrollTrigger: { trigger: `.${styles.rail}`, start: "top 80%" },
      });

      const path = el.querySelector(`.${styles.lineDraw}`);
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: `.${styles.rail}`,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.process} id="process" ref={root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span>07</span> {t("process.eyebrow")}
        </p>
        <h2 className={styles.h2}>
          {t("process.h2a")} <em className={styles.serif}>{t("process.h2Em")}</em>
        </h2>
        <p className={styles.lede}>{t("process.lede")}</p>
      </div>

      <div className={styles.rail}>
        <svg className={styles.line} viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 20 L1000 20" stroke="var(--line)" strokeWidth="2" />
          <path className={styles.lineDraw} d="M0 20 L1000 20" stroke="var(--accent)" strokeWidth="2" />
        </svg>

        <div className={styles.steps}>
          {STEPS.map(({ icon: Icon, key }, i) => (
            <div className={`${styles.step} glass-panel`} key={key}>
              <span className={styles.num}>0{i + 1}</span>
              <span className={`${styles.icon} glass-panel`}>
                <Icon size={19} />
              </span>
              <h3 className={styles.title}>{t(`process.${key}.title`)}</h3>
              <p className={styles.desc}>{t(`process.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

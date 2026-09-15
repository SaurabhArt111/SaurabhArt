import { useState, useRef, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { gsap, EASE, prefersReducedMotion } from "../../../lib/gsap";
import { useLang } from "../../../lib/i18n";
import "./FAQ.css";

const styles = {
  "faq": "faq-faq",
  "header": "faq-header",
  "eyebrow": "faq-eyebrow",
  "h2": "faq-h2",
  "serif": "faq-serif",
  "lede": "faq-lede",
  "list": "faq-list",
  "item": "faq-item",
  "q": "faq-q",
  "qOpen": "faq-q-open",
  "plus": "faq-plus",
  "aWrap": "faq-a-wrap",
  "a": "faq-a",
  "aOpen": "faq-a-open",
};

const KEYS = ["scope", "stack", "availability", "collab", "timeline", "code"];

export default function FAQ() {
  const root = useRef(null);
  const { t } = useLang();
  const [open, setOpen] = useState(0);

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
      gsap.from(`.${styles.item}`, {
        y: 22,
        autoAlpha: 0,
        duration: 0.6,
        ease: EASE.outExpo,
        stagger: 0.06,
        scrollTrigger: { trigger: `.${styles.list}`, start: "top 85%" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.faq} id="faq" ref={root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span>08</span> {t("faq.eyebrow")}
        </p>
        <h2 className={styles.h2}>
          {t("faq.h2a")} <em className={styles.serif}>{t("faq.h2Em")}</em>
        </h2>
        <p className={styles.lede}>{t("faq.lede")}</p>
      </div>

      <div className={styles.list}>
        {KEYS.map((key, i) => {
          const isOpen = open === i;
          return (
            <div className={styles.item} key={key}>
              <button
                type="button"
                className={`${styles.q} ${isOpen ? styles.qOpen : ""}`}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{t(`faq.${key}.q`)}</span>
                <span className={styles.plus} aria-hidden="true">
                  <FiPlus size={16} />
                </span>
              </button>
              <div
                className={styles.aWrap}
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <p className={`${styles.a} ${isOpen ? styles.aOpen : ""}`}>
                  {t(`faq.${key}.a`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

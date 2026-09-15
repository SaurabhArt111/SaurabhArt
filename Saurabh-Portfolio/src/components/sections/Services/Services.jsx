import { useEffect, useRef } from "react";
import { FiPenTool, FiCode, FiServer, FiLayers } from "react-icons/fi";
import { gsap, EASE, prefersReducedMotion } from "../../../lib/gsap";
import { useLang } from "../../../lib/i18n";
import "./Services.css";

const styles = {
  "services": "svc-services",
  "header": "svc-header",
  "eyebrow": "svc-eyebrow",
  "h2": "svc-h2",
  "serif": "svc-serif",
  "lede": "svc-lede",
  "grid": "svc-grid",
  "card": "svc-card",
  "icon": "svc-icon",
  "title": "svc-title",
  "desc": "svc-desc",
  "tags": "svc-tags",
};

const SERVICES = [
  {
    icon: FiPenTool,
    key: "design",
    tags: ["UI/UX", "Wireframes", "Prototyping"],
  },
  {
    icon: FiCode,
    key: "frontend",
    tags: ["React", "Animation", "Responsive"],
  },
  {
    icon: FiServer,
    key: "fullstack",
    tags: ["Node.js", "MongoDB", "APIs"],
  },
  {
    icon: FiLayers,
    key: "brand",
    tags: ["Identity", "Illustration", "Layout"],
  },
];

export default function Services() {
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
      gsap.from(`.${styles.card}`, {
        y: 34,
        autoAlpha: 0,
        duration: 0.75,
        ease: EASE.outExpo,
        stagger: 0.09,
        clearProps: "transform",
        scrollTrigger: { trigger: `.${styles.grid}`, start: "top 85%" },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.services} id="services" ref={root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span>06</span> {t("services.eyebrow")}
        </p>
        <h2 className={styles.h2}>
          {t("services.h2a")} <em className={styles.serif}>{t("services.h2Em")}</em>
        </h2>
        <p className={styles.lede}>{t("services.lede")}</p>
      </div>

      <div className={styles.grid}>
        {SERVICES.map(({ icon: Icon, key, tags }) => (
          <div className={`${styles.card} glass-panel`} key={key}>
            <span className={styles.icon}>
              <Icon size={20} />
            </span>
            <h3 className={styles.title}>{t(`services.${key}.title`)}</h3>
            <p className={styles.desc}>{t(`services.${key}.desc`)}</p>
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

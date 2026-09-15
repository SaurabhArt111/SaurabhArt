
import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiGithub, FiMaximize2 } from "react-icons/fi";
import { gsap, ScrollTrigger, EASE } from "../../../lib/gsap";
import { sceneScrub } from "../../../lib/scene";
import PROJECTS from "../../../data/projects.json";
import ProjectModal from "./ProjectModal";
import WorkPreview from "./WorkPreview";
import "./Work.css";
import { useLang } from "../../../lib/i18n";

const styles = {
  "work": "work-work",
  "header": "work-header",
  "eyebrow": "work-eyebrow",
  "headRow": "work-head-row",
  "h2": "work-h2",
  "serif": "work-serif",
  "lede": "work-lede",
  "stage": "work-stage",
  "track": "work-track",
  "card": "work-card",
  "inner": "work-inner",
  "cover": "work-cover",
  "award": "work-award",
  "coverPhoto": "work-cover-photo",
  "coverBrand": "work-cover-brand",
  "coverMark": "work-cover-mark",
  "coverOverlay": "work-cover-overlay",
  "coverOverlayIcon": "work-cover-overlay-icon",
  "coverOverlayText": "work-cover-overlay-text",
  "siteChip": "work-site-chip",
  "meta": "work-meta",
  "contribution": "work-contribution",
  "tags": "work-tags",
  "metaFoot": "work-meta-foot",
  "year": "work-year",
  "open": "work-open",
  "foot": "work-foot",
  "count": "work-count",
  "dots": "work-dots",
  "dot": "work-dot",
  "dotOn": "work-dot-on",
  "hint": "work-hint",
};

const SPREAD = 330; /* px between card centers on the arc */
const PIN_PER_CARD = 210;

const pad = (n) => String(n).padStart(2, "0");

export default function Work() {
  const root = useRef(null);
  const { t } = useLang();
  const [openProject, setOpenProject] = useState(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1101px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray(`.${styles.card}`);
      const counter = el.querySelector(`.${styles.count}`);
      const dots = gsap.utils.toArray(`.${styles.dot}`);
      const n = cards.length;

      const render = (p) => {
        cards.forEach((card, i) => {
          const d = i - p;
          const ad = Math.abs(d);
          gsap.set(card, {
            x: d * SPREAD,
            y: Math.min(ad * ad * 9, 110),
            rotationY: gsap.utils.clamp(-34, 34, -d * 10),
            scale: 1 - Math.min(ad * 0.065, 0.38),
            autoAlpha: ad <= 2 ? 1 : Math.max(0.55, 1 - (ad - 2) * 0.22),
            zIndex: Math.round(100 - ad * 10),
          });
        });
        const active = Math.round(gsap.utils.clamp(0, n - 1, p));
        if (counter) {
          counter.textContent = `${pad(active + 1)} / ${pad(n)}`;
        }
        dots.forEach((dot, i) => dot.classList.toggle(styles.dotOn, i === active));
      };

      render(0);

      const st = ScrollTrigger.create({
        ...sceneScrub(el),
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress * (n - 1)),
      });

      /* header reveal, once, on pin start */
      gsap.from(`.${styles.header} > *`, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: EASE.outExpo,
        stagger: 0.09,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 70%" },
      });

      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section className={styles.work} id="work" ref={root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span>04</span> {t("work.eyebrow")}
        </p>
        <div className={styles.headRow}>
          <h2 className={styles.h2}>
            {t("work.h2a")}
            <br />
            {t("work.h2b")} <em className={styles.serif}>{t("work.h2Em")}</em>
          </h2>
          <p className={styles.lede}>
            {t("work.lede")}
          </p>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.track}>
          {PROJECTS.map((p, i) => {
            const primaryLabel = p.site ? p.site.label : p.repo ? "GitHub" : null;
            /* the repo chip only earns its place when the project ALSO has a
               live site — otherwise repo is already the cover's own action */
            const secondaryHref = p.site && p.repo ? p.repo : null;

            return (
              <article className={styles.card} key={p.slug} style={{ zIndex: 100 - i }}>
                <div className={styles.inner}>
                  <button
                    type="button"
                    className={styles.cover}
                    onClick={() => setOpenProject(p)}
                    style={
                      p.cover
                        ? { background: p.cover.bg, color: p.cover.ink === "light" ? "#fff" : "var(--ink)" }
                        : undefined
                    }
                    aria-label={`${t("work.open")} — ${p.title}`}
                  >
                    {p.cover?.src && p.cover.variant === "photo" ? (
                      /* his own capture of the built site — full-bleed */
                      <img
                        className={styles.coverPhoto}
                        src={p.cover.src}
                        alt={p.coverLabel}
                        style={p.cover.focus ? { objectPosition: p.cover.focus } : undefined}
                        loading="lazy"
                      />
                    ) : p.cover?.src ? (
                      /* verified brand mark, sized by its true aspect ratio */
                      <img
                        className={styles.coverBrand}
                        src={p.cover.src}
                        alt={p.coverLabel}
                        style={{ aspectRatio: p.cover.aspect ?? 1 }}
                        loading="lazy"
                      />
                    ) : p.preview ? (
                      /* no screenshot yet — a live-rendered HTML+CSS mock of
                         the product, so the card never feels like a stub */
                      <WorkPreview variant={p.preview} accent={p.accent} />
                    ) : p.cover?.mark ? (
                      <span className={styles.coverMark} aria-label={p.coverLabel}>
                        {p.cover.mark}
                      </span>
                    ) : (
                      <span>▢&nbsp;&nbsp;{p.coverLabel}</span>
                    )}
                    {p.award && <span className={styles.award}>{p.award}</span>}

                    {/* glass-morphism reveal — expands in on hover / focus,
                        tap opens the case-study modal below */}
                    <span className={styles.coverOverlay} aria-hidden="true">
                      <span className={`${styles.coverOverlayIcon} glass-panel`}>
                        <FiMaximize2 size={17} />
                      </span>
                      <span className={styles.coverOverlayText}>
                        {p.site ? t("work.live") : t("work.details")}
                      </span>
                    </span>
                  </button>

                  <div className={styles.meta}>
                    <h3>{p.title}</h3>
                    <p className={styles.contribution}>{p.contribution}</p>
                    <p className={styles.tags}>{p.tags.join(" · ").toUpperCase()}</p>
                    <div className={styles.metaFoot}>
                      {p.year && <span className={styles.year}>{p.year}</span>}
                      {primaryLabel && (
                        <button
                          type="button"
                          className={styles.open}
                          onClick={() => setOpenProject(p)}
                        >
                          {primaryLabel} <FiArrowUpRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* sits over the cover's top-right, independent of the
                    cover's own click target */}
                {secondaryHref && (
                  <a
                    className={styles.siteChip}
                    href={secondaryHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FiGithub size={12} /> GitHub
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.foot}>
        <span className={styles.count}>01 / {pad(PROJECTS.length)}</span>
        <div className={styles.dots}>
          {PROJECTS.map((p, i) => (
            <span key={p.slug} className={`${styles.dot} ${i === 0 ? styles.dotOn : ""}`} />
          ))}
        </div>
        <span className={styles.hint}>{t("work.hint")}</span>
      </div>

      {openProject && (
        <ProjectModal project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </section>
  );
}

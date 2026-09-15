import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { gsap, EASE, prefersReducedMotion } from "../../../lib/gsap";
import GALLERY from "../../../data/gallery.json";
import { useLang } from "../../../lib/i18n";
import "./Gallery.css";

const styles = {
  "gallery": "gal-gallery",
  "header": "gal-header",
  "eyebrow": "gal-eyebrow",
  "h2": "gal-h2",
  "serif": "gal-serif",
  "lede": "gal-lede",
  "tabs": "gal-tabs",
  "tab": "gal-tab",
  "tabOn": "gal-tab-on",
  "grid": "gal-grid",
  "tile": "gal-tile",
  "tileWide": "gal-tile-wide",
  "tileTall": "gal-tile-tall",
  "art": "gal-art",
  "artImg": "gal-art-img",
  "doodle": "gal-doodle",
  "meta": "gal-meta",
  "metaTitle": "gal-meta-title",
  "metaSub": "gal-meta-sub",
};

/* three small line-art doodles, cycled by index, redrawn (stroke
   animation) whenever their tile scrolls into view */
const DOODLES = [
  <path d="M6 34 C 16 6, 34 6, 44 34" key="a" />,
  <circle cx="25" cy="22" r="15" key="b" />,
  <path d="M6 10 L 44 10 M6 22 L 34 22 M6 34 L 40 34" key="c" />,
];

function Doodle({ index, accent }) {
  return (
    <svg
      className={styles.doodle}
      viewBox="0 0 50 44"
      fill="none"
      stroke={accent}
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {DOODLES[index % DOODLES.length]}
    </svg>
  );
}

function Tile({ item, index, onOpen }) {
  const spanClass =
    item.span === "wide" ? styles.tileWide : item.span === "tall" ? styles.tileTall : "";

  return (
    <button
      type="button"
      className={`${styles.tile} ${spanClass}`}
      onClick={() => onOpen(index)}
      aria-label={`${item.title} — ${item.category}`}
    >
      <span
        className={styles.art}
        style={!item.image ? { background: `${item.accent}22` } : undefined}
      >
        {item.image ? (
          <img className={styles.artImg} src={item.image} alt={item.title} loading="lazy" />
        ) : (
          <Doodle index={index} accent={item.accent} />
        )}
      </span>
      <span className={styles.meta}>
        <span className={styles.metaTitle}>{item.title}</span>
        <span className={styles.metaSub}>
          {item.category}
          {item.medium ? ` · ${item.medium}` : ""}
        </span>
      </span>
    </button>
  );
}

function Lightbox({ items, index, onClose, onStep }) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onStep]);

  if (!item) return null;

  return createPortal(
    <div
      className="gal-lb-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gal-lb-panel glass-panel glass-panel-strong" role="dialog" aria-modal="true">
        <button type="button" className="gal-lb-close" onClick={onClose} aria-label="Close">
          <FiX size={18} />
        </button>
        <button
          type="button"
          className="gal-lb-nav gal-lb-prev"
          onClick={() => onStep(-1)}
          aria-label="Previous piece"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          type="button"
          className="gal-lb-nav gal-lb-next"
          onClick={() => onStep(1)}
          aria-label="Next piece"
        >
          <FiChevronRight size={20} />
        </button>

        <span
          className="gal-lb-art"
          style={!item.image ? { background: `${item.accent}22` } : undefined}
        >
          {item.image ? (
            <img src={item.image} alt={item.title} />
          ) : (
            <Doodle index={index} accent={item.accent} />
          )}
        </span>
        <div className="gal-lb-caption">
          <h3>{item.title}</h3>
          <p>
            {item.category}
            {item.medium ? ` · ${item.medium}` : ""}
            {item.year ? ` · ${item.year}` : ""}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Gallery() {
  const root = useRef(null);
  const { t } = useLang();
  const [active, setActive] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(GALLERY.map((g) => g.category)))],
    []
  );
  const items = useMemo(
    () => (active === "All" ? GALLERY : GALLERY.filter((g) => g.category === active)),
    [active]
  );

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
      gsap.from(`.${styles.tile}`, {
        y: 30,
        autoAlpha: 0,
        duration: 0.7,
        ease: EASE.outExpo,
        stagger: 0.05,
        scrollTrigger: { trigger: `.${styles.grid}`, start: "top 85%" },
      });
    }, el);

    return () => ctx.revert();
  }, [active]);

  return (
    <section className={styles.gallery} id="gallery" ref={root}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span>05</span> {t("gallery.eyebrow")}
        </p>
        <h2 className={styles.h2}>
          {t("gallery.h2a")} <em className={styles.serif}>{t("gallery.h2Em")}</em>
        </h2>
        <p className={styles.lede}>{t("gallery.lede")}</p>

        <div className={styles.tabs} role="tablist" aria-label="Filter gallery">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active === cat}
              className={`${styles.tab} ${active === cat ? styles.tabOn : ""}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {items.map((item, i) => (
          <Tile key={item.id} item={item} index={i} onOpen={setOpenIndex} />
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onStep={(dir) =>
            setOpenIndex((i) => (i + dir + items.length) % items.length)
          }
        />
      )}
    </section>
  );
}

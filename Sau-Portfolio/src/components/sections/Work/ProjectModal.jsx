import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiExternalLink, FiGithub, FiLoader } from "react-icons/fi";
import { getLenis } from "../../../lib/lenis";
import { useLang } from "../../../lib/i18n";
import "./ProjectModal.css";

const styles = {
  "backdrop": "pmodal-backdrop",
  "backdropIn": "pmodal-backdrop-in",
  "panel": "pmodal-panel",
  "panelIn": "pmodal-panel-in",
  "head": "pmodal-head",
  "headInfo": "pmodal-head-info",
  "kicker": "pmodal-kicker",
  "title": "pmodal-title",
  "tags": "pmodal-tags",
  "actions": "pmodal-actions",
  "linkBtn": "pmodal-link-btn",
  "close": "pmodal-close",
  "body": "pmodal-body",
  "frameWrap": "pmodal-frame-wrap",
  "frame": "pmodal-frame",
  "loading": "pmodal-loading",
  "spin": "pmodal-spin",
  "note": "pmodal-note",
  "fallback": "pmodal-fallback",
  "fallbackMark": "pmodal-fallback-mark",
  "fallbackText": "pmodal-fallback-text",
};

export default function ProjectModal({ project, onClose }) {
  const { t } = useLang();
  const [entered, setEntered] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const closeRef = useRef(null);
  const previouslyFocused = useRef(null);

  const siteUrl = project?.site?.url ?? null;

  useEffect(() => {
    /* enter transition */
    const id = requestAnimationFrame(() => setEntered(true));

    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    previouslyFocused.current = document.activeElement;
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!project) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${entered ? styles.backdropIn : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.panel} glass-panel glass-panel-strong ${entered ? styles.panelIn : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <div className={styles.head}>
          <div className={styles.headInfo}>
            <p className={styles.kicker}>{project.coverLabel}</p>
            <h3 className={styles.title}>{project.title}</h3>
            <p className={styles.tags}>{project.tags.join(" · ").toUpperCase()}</p>
          </div>

          <div className={styles.actions}>
            {siteUrl && (
              <a
                className={styles.linkBtn}
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FiExternalLink size={14} /> {t("work.visit")}
              </a>
            )}
            {project.repo && (
              <a
                className={styles.linkBtn}
                href={project.repo}
                target="_blank"
                rel="noreferrer"
              >
                <FiGithub size={14} /> {t("work.repo")}
              </a>
            )}
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={t("work.close")}
              ref={closeRef}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {siteUrl ? (
            <div className={styles.frameWrap}>
              {!frameLoaded && (
                <div className={styles.loading}>
                  <FiLoader className={styles.spin} size={22} />
                </div>
              )}
              <iframe
                className={styles.frame}
                src={siteUrl}
                title={project.title}
                loading="lazy"
                onLoad={() => setFrameLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div
              className={styles.fallback}
              style={project.cover ? { background: project.cover.bg } : undefined}
            >
              <span className={styles.fallbackMark}>
                {project.cover?.mark ?? project.coverLabel}
              </span>
              <p className={styles.fallbackText}>{t("work.noPreview")}</p>
              {project.repo && (
                <a
                  className={styles.linkBtn}
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiGithub size={14} /> {t("work.repo")}
                </a>
              )}
            </div>
          )}
        </div>

        {siteUrl && <p className={styles.note}>{t("work.previewNote")}</p>}
      </div>
    </div>,
    document.body
  );
}

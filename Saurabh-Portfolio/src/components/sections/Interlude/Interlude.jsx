import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, EASE, prefersReducedMotion } from "../../../lib/gsap";
import { sceneScrub } from "../../../lib/scene";
import { useLang } from "../../../lib/i18n";
import ParticleMorph from "../../fx/ParticleMorph";
import SvgFlourish from "../../fx/SvgFlourish";
import "./Interlude.css";

/*
 * INTERLUDE — the ∞ band, halfway down the page.
 *
 * Sits between the work and the offer as a breath: no cards, no list, one
 * moving object. The ∞ is the argument the section makes — the three
 * disciplines feed each other in a loop with no start and no end — and as
 * you scroll through it, the stream of particles gathers itself into the
 * words and then lets them go again.
 *
 * Progress comes from the scene's runway (the same mechanism every other
 * scroll-driven frame on the site uses), so the morph is scrubbable: stop
 * halfway and the sentence stays half-formed.
 */

const styles = {
  interlude: "intl-interlude",
  inner: "intl-inner",
  head: "intl-head",
  kicker: "intl-kicker",
  h2: "intl-h2",
  serif: "intl-serif",
  lede: "intl-lede",
  field: "intl-field",
  dial: "intl-dial",
  legend: "intl-legend",
};

export default function Interlude() {
  const root = useRef(null);
  const progress = useRef(0);
  const { t } = useLang();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      progress.current = 1;
      return;
    }

    const ctx = gsap.context(() => {
      /* runway-driven on desktop, where the frame is sticky; plain
         element-driven on mobile, where scenes fall back to static flow and
         the runway is display:none (and so would never measure) */
      const mobile = window.matchMedia("(max-width: 1000px)").matches;
      const cfg = mobile
        ? { trigger: el, start: "top 85%", end: "bottom 20%" }
        : sceneScrub(el);

      const st = ScrollTrigger.create({
        ...cfg,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
        onRefresh: (self) => {
          progress.current = self.progress;
        },
      });

      gsap.from(`.${styles.head} > *`, {
        y: 30,
        autoAlpha: 0,
        duration: 0.9,
        ease: EASE.outExpo,
        stagger: 0.09,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 72%" },
      });

      return () => st.kill();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.interlude} id="loop" ref={root}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.kicker}>{t("interlude.kicker")}</p>
          <h2 className={styles.h2}>
            {t("interlude.h2a")} <em className={styles.serif}>{t("interlude.h2Em")}</em>
          </h2>
          <p className={styles.lede}>{t("interlude.lede")}</p>
        </div>

        <div className={styles.field}>
          <ParticleMorph
            morph="scrub"
            progressRef={progress}
            hoverEffect="scatter"
            label="Artist, designer, developer — drawn in particles"
          />
        </div>

        <SvgFlourish variant="orbit" className={styles.dial} label="Continuous loop" />

        <p className={styles.legend}>{t("interlude.legend")}</p>
      </div>
    </section>
  );
}

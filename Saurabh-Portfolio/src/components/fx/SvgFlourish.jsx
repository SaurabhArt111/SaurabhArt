import { useEffect, useId, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../lib/gsap";
import "./SvgFlourish.css";

/*
 * SVG FLOURISH — two pieces of vector motion, both of which report
 * something rather than just decorating.
 *
 *   ORBIT   a dial: rings turning at different rates with a marker riding
 *           each one. Used beside the ∞ band, where the subject IS
 *           continuous motion with no start or end. Driven entirely by CSS
 *           rotation of grouped geometry — exact, cheap, and no SMIL
 *           dependency.
 *
 *   THREAD  a divider that draws itself as you scroll past, with a marker
 *           travelling the curve it has drawn. The stroke's progress is the
 *           section boundary being crossed, so the motion answers "where am
 *           I on the page" instead of filling the gap. Draw-on is
 *           stroke-dashoffset scrubbed by ScrollTrigger, the same mechanism
 *           the Process rail already uses; the marker follows the exact
 *           curve via <animateMotion><mpath>.
 */

/* one hand-set sine period — a generated arc sits flat and reads as a
   border rather than a thread */
const THREAD_D =
  "M0 30 C 150 30, 190 4, 320 4 S 520 56, 680 56 S 880 8, 1000 8 S 1180 34, 1280 30";

export default function SvgFlourish({ variant = "thread", className = "", label }) {
  const root = useRef(null);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const el = root.current;
    if (!el || variant !== "thread" || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const path = el.querySelector("[data-draw]");
      if (!path) return;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          end: "bottom 45%",
          scrub: 0.5,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [variant]);

  if (variant === "orbit") {
    return (
      <div className={`fx-flourish fx-flourish-orbit ${className}`.trim()} ref={root}>
        <svg viewBox="0 0 220 220" role={label ? "img" : "presentation"} aria-label={label}>
          {label ? <title>{label}</title> : null}

          {/* tick ring — 72 marks, one every 5° */}
          <circle
            className="fx-orbit-ticks"
            cx="110"
            cy="110"
            r="104"
            fill="none"
            strokeWidth="9"
            strokeDasharray="1 8.07"
          />

          <circle className="fx-orbit-ring fx-orbit-r1" cx="110" cy="110" r="86" fill="none" />
          <circle className="fx-orbit-ring fx-orbit-r2" cx="110" cy="110" r="62" fill="none" />
          <circle className="fx-orbit-ring fx-orbit-r3" cx="110" cy="110" r="36" fill="none" />

          {/* markers: a dot parked on each radius, its whole group spun by
              CSS. Geometrically identical to path-following, but it still
              works anywhere transforms do. */}
          <g className="fx-orbit-arm fx-orbit-arm-1">
            <circle className="fx-orbit-dot" cx="110" cy="24" r="3.4" />
          </g>
          <g className="fx-orbit-arm fx-orbit-arm-2">
            <circle className="fx-orbit-dot fx-orbit-dot-accent" cx="110" cy="48" r="2.6" />
          </g>
          <g className="fx-orbit-arm fx-orbit-arm-3">
            <circle className="fx-orbit-dot" cx="110" cy="74" r="2" />
          </g>

          <circle className="fx-orbit-core" cx="110" cy="110" r="4" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`fx-flourish fx-flourish-thread ${className}`.trim()} ref={root}>
      <svg viewBox="0 0 1280 60" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="0.25" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="0.75" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path id={`thread-${uid}`} className="fx-thread-base" d={THREAD_D} fill="none" />
        <path
          data-draw
          className="fx-thread-draw"
          d={THREAD_D}
          fill="none"
          stroke={`url(#grad-${uid})`}
        />

        <g className="fx-thread-rider">
          <circle className="fx-thread-dot" cx="0" cy="0" r="3" />
          <animateMotion dur="11s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#thread-${uid}`} xlinkHref={`#thread-${uid}`} />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}

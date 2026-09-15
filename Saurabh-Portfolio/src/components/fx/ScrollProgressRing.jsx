import { useEffect, useRef, useState } from "react";
import heroProgress from "../../lib/heroProgress";
import "./ScrollProgressRing.css";

/*
 * SCROLL PROGRESS RING — how far through the page you are, and the way back.
 *
 * An SVG circle whose stroke-dashoffset tracks document progress, so the arc
 * IS the reading position rather than an ornament that happens to spin. The
 * percentage sits in the middle. Clicking it returns to the top through the
 * site's existing anchor handling (Lenis-eased, see lib/lenis.js).
 *
 * Hidden through the opening character sequence — the same rule the nav
 * uses, so the two appear together and the hero stays uncluttered.
 */

const R = 21;
const C = 2 * Math.PI * R;

export default function ScrollProgressRing() {
  const arcRef = useRef(null);
  const numRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    let shown = false;
    let lastShownPct = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = String(C * (1 - p));
      }

      const pct = Math.round(p * 100);
      if (pct !== lastShownPct && numRef.current) {
        numRef.current.textContent = String(pct);
        lastShownPct = pct;
      }

      /* same reveal threshold as the nav */
      const next = heroProgress.current > 0.5;
      if (next !== shown) {
        shown = next;
        setVisible(next);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <a
      href="#home"
      className={`fx-ring ${visible ? "fx-ring-on" : ""}`}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="fx-ring-track" cx="26" cy="26" r={R} fill="none" />
        <circle
          ref={arcRef}
          className="fx-ring-arc"
          cx="26"
          cy="26"
          r={R}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <span className="fx-ring-num">
        <b ref={numRef}>0</b>
      </span>
      <i className="fx-ring-arrow" aria-hidden="true">
        ↑
      </i>
    </a>
  );
}

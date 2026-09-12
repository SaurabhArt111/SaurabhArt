
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../../../lib/gsap";
import { TOOLS } from "../../../content/stack";
import "./DesignStack.css";
import { useLang } from "../../../lib/i18n";

const styles = {
  "section": "stack-section",
  "glowA": "stack-glow-a",
  "glowB": "stack-glow-b",
  "stage": "stack-stage",
  "center": "stack-center",
  "eyebrow": "stack-eyebrow",
  "h2": "stack-h2",
  "serif": "stack-serif",
  "lede": "stack-lede",
  "count": "stack-count",
  "orbit": "stack-orbit",
  "card": "stack-card",
  "face": "stack-face",
  "mark": "stack-mark",
  "mono": "stack-mono",
  "name": "stack-name",
};

const TWO_PI = Math.PI * 2;

/* path shape */
const TURNS = 1.9;
const PHASE = -Math.PI * 0.5;
const INNER_WIDE = 0.4;
const INNER_COMPACT = 0.62;

/* motion */
const SPEED = 0.021; /* path fractions per second (~48s per full traverse) */
const HOVER_SLOW = 0.16;

/* appearance along the path */
const FADE_IN = 0.09;
const FADE_OUT = 0.3;
const SCALE_POW = 0.5;
const LEAN_MAX = 11; /* degrees */

const M = 1000;
const K = 1024;

function buildArcTable(ratio, inner) {
  const point = (n) => {
    const a = n * TURNS * TWO_PI + PHASE;
    const r = 1 - n * (1 - inner);
    return { x: r * Math.cos(a), y: -r * Math.sin(a) * ratio };
  };

  const cum = new Float32Array(M + 1);
  let prev = point(0);
  for (let k = 1; k <= M; k++) {
    const p = point(k / M);
    cum[k] = cum[k - 1] + Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const total = cum[M] || 1;

  const nForArc = new Float32Array(K + 1);
  let j = 0;
  for (let a = 0; a <= K; a++) {
    const target = (a / K) * total;
    while (j < M && cum[j + 1] < target) j++;
    const seg = cum[j + 1] - cum[j];
    nForArc[a] = (j + (seg > 0 ? (target - cum[j]) / seg : 0)) / M;
  }
  return { nForArc, ratio, inner };
}

export default function DesignStack() {
  const root = useRef(null);
  const stage = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const stageEl = stage.current;
    const rootEl = root.current;
    if (!stageEl || !rootEl) return;

    const cards = Array.from(stageEl.querySelectorAll(`.${styles.card}`));
    const N = cards.length;
    if (!N) return;

    const compactMQ = window.matchMedia("(max-width: 700px)");

    let Rx = 0;
    let Ry = 0;
    let inner = INNER_WIDE;
    let table = buildArcTable(1, INNER_WIDE);

    const measure = () => {
      const w = stageEl.clientWidth;
      const h = stageEl.clientHeight;
      const compact = compactMQ.matches;

      inner = compact ? INNER_COMPACT : INNER_WIDE;
      /* the outer ring reaches every edge; on very narrow screens it is
         allowed to overflow horizontally so the orbit still clears the text */
      Rx = compact ? Math.max(0.5 * w, 236) : 0.5 * w;
      Ry = 0.5 * h;

      const ratio = Ry / Rx;
      if (
        Math.abs(ratio - table.ratio) / table.ratio > 0.02 ||
        inner !== table.inner
      ) {
        table = buildArcTable(ratio, inner);
      }

      const cardW = compact
        ? 52
        : gsap.utils.clamp(112, 168, Math.min(Rx, Ry) * 0.3);
      stageEl.style.setProperty("--card-w", `${cardW}px`);
    };

    /** arc fraction s ∈ [0,1) → spiral parameter n (interpolated; rounding
     *  would quantize the motion into visible steps) */
    const arcToN = (s) => {
      const x = Math.min(K, Math.max(0, s * K));
      const i = Math.floor(x);
      const a = table.nForArc[i];
      const b = table.nForArc[Math.min(i + 1, K)];
      return a + (b - a) * (x - i);
    };

    const at = (n) => {
      const ang = n * TURNS * TWO_PI + PHASE;
      const rFrac = 1 - n * (1 - inner);
      return { x: Rx * rFrac * Math.cos(ang), y: -Ry * rFrac * Math.sin(ang), rFrac };
    };

    const zSet = cards.map(() => -1);

    const place = (base) => {
      for (let i = 0; i < N; i++) {
        const s = (base + i / N) % 1;
        const n = arcToN(s);
        const p = at(n);

        /* fade at both ends of the path */
        let o = 1;
        if (s < FADE_IN) o = s / FADE_IN;
        else if (s > 1 - FADE_OUT) o = (1 - s) / FADE_OUT;
        o = Math.max(0, Math.min(1, o));

        /* smaller toward the center */
        const scale = Math.pow(p.rFrac, SCALE_POW);

        /* bank taken from the true tangent vector — continuous, always upright */
        const q = at(Math.min(n + 0.002, 1));
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const lean = LEAN_MAX * (dy / len);

        const el = cards[i];
        el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(
          2
        )}px, 0) rotate(${lean.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = o.toFixed(3);

        const z = Math.round((1 - n) * 100);
        if (z !== zSet[i]) {
          el.style.zIndex = String(z);
          zSet[i] = z;
        }
      }
    };

    measure();

    if (prefersReducedMotion()) {
      place(0);
      return;
    }

    let base = 0;
    let speedMul = 1;
    let target = 1;

    const tick = (_t, dt) => {
      const f = Math.min(dt / 1000, 0.05);
      speedMul += (target - speedMul) * Math.min(f * 6, 1);
      base = (base + SPEED * speedMul * f) % 1;
      place(base);
    };

    /* the orbit eases down only while a CARD is hovered, so you can read the
       one you reached for; crossing empty stage does nothing */
    let hovered = 0;
    const onOver = (e) => {
      if (e.target?.closest?.(`.${styles.card}`)) {
        hovered++;
        target = HOVER_SLOW;
      }
    };
    const onOut = (e) => {
      if (e.target?.closest?.(`.${styles.card}`)) {
        hovered = Math.max(0, hovered - 1);
        if (!hovered) target = 1;
      }
    };
    stageEl.addEventListener("pointerover", onOver);
    stageEl.addEventListener("pointerout", onOut);

    const ro = new ResizeObserver(() => {
      measure();
      place(base);
    });
    ro.observe(stageEl);

    let running = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          gsap.ticker.add(tick);
          running = true;
        } else if (!entry.isIntersecting && running) {
          gsap.ticker.remove(tick);
          running = false;
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(rootEl);

    place(0);

    return () => {
      if (running) gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      stageEl.removeEventListener("pointerover", onOver);
      stageEl.removeEventListener("pointerout", onOut);
    };
  }, []);

  return (
    <section className={styles.section} id="stack" ref={root}>
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />

      <div className={styles.stage} ref={stage}>
        {/* stationary focal point */}
        <div className={styles.center}>
          <p className={styles.eyebrow}>
            <span>03</span> {t("stack.eyebrow")}
          </p>
          <h2 className={styles.h2}>
            {t("stack.h2")} <em className={styles.serif}>{t("stack.h2Em")}</em>
          </h2>
          <p className={styles.lede}>
            {t("stack.lede")}
          </p>
          <p className={styles.count}>
            {TOOLS.length} {t("stack.count")} · <span>3</span> {t("stack.disciplines")}
          </p>
        </div>

        {/* orbiting cards — a real list, so screen readers get the full set */}
        <ul className={styles.orbit}>
          {TOOLS.map((tool) => (
            <li className={styles.card} key={tool.name}>
              <span className={styles.face}>
                <span className={styles.mark}>
                  {tool.src ? (
                    <img src={tool.src} alt="" aria-hidden="true" />
                  ) : (
                    <span
                      className={styles.mono}
                      style={{ color: tool.color, background: `${tool.color}14` }}
                      aria-hidden="true"
                    >
                      {tool.mono}
                    </span>
                  )}
                </span>
                <span className={styles.name}>{tool.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

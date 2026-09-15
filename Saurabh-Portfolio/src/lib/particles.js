/*
 * PARTICLES — shared plumbing for every canvas field on the site.
 *
 * Three jobs, all of them boring on purpose so the components on top can
 * stay about motion rather than bookkeeping:
 *
 *   1. PALETTE      read `r,g,b` triplets out of CSS custom properties so a
 *                   canvas re-tints itself when the light/dark theme flips,
 *                   instead of hard-coding colors a designer can't reach.
 *   2. TEXT TARGETS rasterise a few lines of type into an offscreen canvas
 *                   and hand back the opaque pixels as particle homes —
 *                   tagged with which LINE they came from, plus normalised
 *                   u/v coordinates inside that line's box. The u value is
 *                   what makes per-word width warping possible later.
 *   3. LIFECYCLE    a requestAnimationFrame loop that only runs while its
 *                   canvas is actually on screen, and a DPR-capped resizer.
 */

export const TAU = Math.PI * 2;

export const rand = (a, b) => a + Math.random() * (b - a);

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const lerp = (a, b, t) => a + (b - a) * t;

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

/* frame-rate independent easing — `rate` is the fraction closed per 60fps
   frame, so the same constant behaves the same on a 144Hz display */
export const approach = (current, target, rate, dt = 1) =>
  current + (target - current) * (1 - Math.pow(1 - rate, dt));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* rough "is this a phone" test — used to shed particle count, not to
   change behaviour, so a wrong answer only costs a few dots */
export const isSmallScreen = () =>
  typeof window !== "undefined" && window.matchMedia?.("(max-width: 780px)").matches;

/* ------------------------------------------------------------------ */
/* PALETTE                                                             */
/* ------------------------------------------------------------------ */

const FALLBACK = { dot: [235, 232, 226], accent: [117, 82, 199], glow: [255, 255, 255] };

const parseTriplet = (value, fallback) => {
  if (!value) return fallback;
  const nums = value
    .trim()
    .split(/[\s,/]+/)
    .map((n) => Number.parseFloat(n))
    .filter((n) => Number.isFinite(n));
  return nums.length >= 3 ? [nums[0], nums[1], nums[2]] : fallback;
};

/* Reads --fx-dot / --fx-accent / --fx-glow off an element as "r,g,b".
   Components declare those vars per theme in their own CSS, which keeps
   every color decision in the stylesheet where it belongs. */
export function readPalette(el) {
  if (!el || typeof window === "undefined") return { ...FALLBACK };
  const cs = getComputedStyle(el);
  return {
    dot: parseTriplet(cs.getPropertyValue("--fx-dot"), FALLBACK.dot),
    accent: parseTriplet(cs.getPropertyValue("--fx-accent"), FALLBACK.accent),
    glow: parseTriplet(cs.getPropertyValue("--fx-glow"), FALLBACK.glow),
  };
}

export const rgba = ([r, g, b], a) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;

/* Calls back whenever the document theme attribute changes, so a canvas can
   re-read its palette. Returns an unsubscribe function. */
export function onThemeChange(fn) {
  if (typeof MutationObserver === "undefined") return () => {};
  const mo = new MutationObserver(() => fn());
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

/* ------------------------------------------------------------------ */
/* CANVAS SIZING                                                       */
/* ------------------------------------------------------------------ */

/* Sizes the backing store to the element's CSS box at a capped DPR and
   returns the logical (CSS-pixel) size to draw against. */
export function fitCanvas(canvas, maxDpr = 2) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
  const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr, ctx };
}

/* ------------------------------------------------------------------ */
/* LOOP — runs only while visible                                      */
/* ------------------------------------------------------------------ */

/*
 * step(dt, elapsed) is called once per frame with dt normalised to 60fps
 * (so dt ≈ 1 on a 60Hz screen, ≈ 0.5 on 120Hz) and clamped so a backgrounded
 * tab can't resume with a single enormous jump.
 *
 * The loop parks itself when the target scrolls off screen or the tab is
 * hidden — a dozen idle canvases would otherwise quietly eat a laptop
 * battery on a page this long.
 */
export function createVisibleLoop(target, step, { margin = "120px" } = {}) {
  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let onScreen = true;
  let running = false;

  const frame = (now) => {
    if (!running) return;
    const dt = last ? clamp((now - last) / 16.667, 0, 3) : 1;
    last = now;
    elapsed += dt;
    step(dt, elapsed);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const sync = () => {
    if (onScreen && !document.hidden) start();
    else stop();
  };

  const onVisibility = () => sync();
  document.addEventListener("visibilitychange", onVisibility);

  let io = null;
  if (target && typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin: margin }
    );
    io.observe(target);
  }

  sync();

  return {
    stop() {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/* ------------------------------------------------------------------ */
/* TEXT → PARTICLE TARGETS                                             */
/* ------------------------------------------------------------------ */

const setLetterSpacing = (ctx, px) => {
  try {
    ctx.letterSpacing = `${px}px`;
  } catch {
    /* Safari < 17.4 — spacing is cosmetic here, so carry on without it */
  }
};

/*
 * lines: [{ id, text, size, weight, family, align, x, y, tracking }]
 *   x / y   — baseline position in CSS px
 *   align   — "center" | "left" | "right"
 *   tracking— letter spacing in px (may be negative)
 *
 * Returns { points, boxes }
 *   points: { x, y, line, u, v }   u/v ∈ [-1,1] within that line's box
 *   boxes:  { [id]: { x0, y0, x1, y1, cx, cy, w, h } }
 *
 * Sampling one canvas for every line at once keeps a single getImageData
 * call — the expensive part — and lines never overlap vertically in any of
 * our layouts, so a point's y is enough to know which line owns it.
 */
export function sampleTextTargets({ width, height, lines, stride = 3, maxPoints = 2600 }) {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(width));
  off.height = Math.max(1, Math.floor(height));
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.fillStyle = "#fff";
  octx.textBaseline = "alphabetic";

  const boxes = {};

  for (const line of lines) {
    const {
      id,
      text,
      size,
      weight = 800,
      family = "Manrope, Arial, sans-serif",
      align = "center",
      x,
      y,
      tracking = 0,
    } = line;

    octx.font = `${weight} ${size}px ${family}`;
    octx.textAlign = align;
    setLetterSpacing(octx, tracking);

    const m = octx.measureText(text);
    const w = (m.width || size * text.length * 0.6) + Math.abs(tracking);
    const ascent = m.actualBoundingBoxAscent || size * 0.75;
    const descent = m.actualBoundingBoxDescent || size * 0.2;

    const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;

    boxes[id] = {
      x0,
      x1: x0 + w,
      y0: y - ascent,
      y1: y + descent,
      cx: x0 + w / 2,
      cy: y - ascent + (ascent + descent) / 2,
      w,
      h: ascent + descent,
      baseline: y,
      size,
    };

    octx.fillText(text, x, y);
  }

  const ordered = Object.entries(boxes).sort((a, b) => a[1].y0 - b[1].y0);
  const lineFor = (py) => {
    for (const [id, b] of ordered) {
      if (py >= b.y0 - 2 && py <= b.y1 + 2) return id;
    }
    return ordered[0]?.[0] ?? null;
  };

  const { data } = octx.getImageData(0, 0, off.width, off.height);

  /*
   * Budgeting by stride, NOT by thinning an index.
   *
   * The obvious way to hit a particle budget is to sample densely and then
   * keep every nth point. That quietly ruins the flow conveyor: after
   * thinning, neighbouring slots in a row are no longer a stride apart, so
   * the "is this a gap between strokes?" test can no longer tell a step
   * from a gap, and every dot teleports on every frame (measured: 14 hops
   * per particle per second, and the letterforms visibly skewed).
   *
   * Widening the stride instead keeps the sample grid regular, so
   * neighbours stay neighbours and coverage stays even. Re-scanning is
   * cheap — the rasterised pixels are already in hand.
   */
  const scan = (st) => {
    const out = [];
    for (let y = 0; y < off.height; y += st) {
      for (let x = 0; x < off.width; x += st) {
        if (data[(y * off.width + x) * 4 + 3] > 120) out.push({ x, y });
      }
    }
    return out;
  };

  let step = Math.max(1, Math.round(stride));
  let pts = scan(step);

  for (let pass = 0; pass < 4 && pts.length > maxPoints; pass++) {
    const grow = Math.sqrt(pts.length / maxPoints);
    const next = Math.max(step + 1, Math.ceil(step * grow));
    if (next === step) break;
    step = next;
    pts = scan(step);
  }

  /* last resort, and only ever a small trim at this point */
  if (pts.length > maxPoints) {
    const kept = [];
    const pick = pts.length / maxPoints;
    for (let i = 0; i < maxPoints; i++) kept.push(pts[Math.floor(i * pick)]);
    pts = kept;
  }

  const points = pts.map((p) => {
    const id = lineFor(p.y);
    const b = boxes[id];
    return {
      x: p.x,
      y: p.y,
      line: id,
      u: b ? clamp((p.x - b.cx) / (b.w / 2 || 1), -1.4, 1.4) : 0,
      v: b ? clamp((p.y - b.cy) / (b.h / 2 || 1), -1.4, 1.4) : 0,
    };
  });

  return { points, boxes, stride: step };
}

/* ------------------------------------------------------------------ */
/* FLOW ROWS — dust that moves but still spells something              */
/* ------------------------------------------------------------------ */

/*
 * A wordmark whose particles are parked on fixed pixels is a stencil:
 * legible, but dead. We want every dot travelling while the word stays
 * perfectly readable — which is a coverage problem, not an animation one.
 *
 * The first attempt let each particle re-home to a nearby pixel with a
 * downstream bias. Simulated over ten minutes it fell apart: glyph stems
 * are narrower than the lookup grid, so "downstream" is usually empty, the
 * fallback fires constantly, and the dust drains into a pile (measured:
 * 58% left/right skew, and the shape of the word visibly rotting).
 *
 * So instead, a CONVEYOR. The sampled pixels of a line are grouped into
 * rows — sampling is on a fixed stride, so every pixel's y is already a
 * clean row key — and each row is sorted by x into a ring. A particle holds
 * a floating index into its row and advances along it, wrapping from the
 * right end back to the left.
 *
 * Why this is stable: the particles are beads on a loop, one per slot, and
 * translating a uniform set around a ring leaves it uniform no matter how
 * the individual speeds differ. Occupancy is preserved *by construction* —
 * so the letters can never thin out or clump, however long the page sits
 * open, while the dust reads as a current running through the strokes.
 *
 * Returns { rows, step } where `step` is the MEASURED median distance
 * between neighbouring slots. Callers derive their gap threshold from it
 * rather than from the requested stride — the two diverge whenever the
 * sampler has had to widen its grid to meet a particle budget, and guessing
 * wrong turns every step into a teleport.
 */
export function buildFlowRows(points) {
  const rows = new Map();
  for (const p of points) {
    let row = rows.get(p.y);
    if (!row) {
      row = [];
      rows.set(p.y, row);
    }
    row.push(p);
  }
  const deltas = [];
  for (const row of rows.values()) {
    row.sort((a, b) => a.x - b.x);
    for (let i = 0; i < row.length; i++) {
      row[i].row = row;
      row[i].idx = i;
      if (i > 0) deltas.push(row[i].x - row[i - 1].x);
    }
  }

  deltas.sort((a, b) => a - b);
  const step = deltas.length ? deltas[deltas.length >> 1] : 3;

  return { rows, step: Math.max(1, step) };
}

/*
 * Advance one particle along its row and report where it lands.
 *
 * Two details matter more than they look, both found by simulating ten
 * minutes of playback rather than by eye:
 *
 *   GAPS   consecutive slots in a row are only neighbours *within* a
 *          stroke. Between one letter's stem and the next there's 50-odd px
 *          of empty space, and interpolating across that would paint dust
 *          in the air between letters and smear the wordmark. So a segment
 *          wider than `maxStep` is not travelled — it's skipped in a single
 *          frame, and the particle re-enters at the head of the next
 *          stroke. Dots therefore only ever sit ON the letterforms.
 *
 *   LAPS   the return from the last slot to the first is likewise a skip,
 *          not a journey, so nothing is ever seen flying backwards across
 *          the word. Taking it instantly also avoids the particle parking
 *          on the final slot for the dozen-odd frames that "hold until the
 *          index rolls over" would cost — which showed up as dots bunching
 *          at the right edge of every letter.
 *
 * `jump` tells the caller this frame was a teleport: snap the screen
 * position instead of easing to it, and draw no motion trail.
 */
export function advanceFlow(row, index, step, maxStep = 8) {
  const len = row?.length ?? 0;
  if (!len) return null;

  const first = row[0];
  if (len < 2) {
    return { index: 0, x: first.x, y: first.y, u: first.u, v: first.v, jump: false };
  }

  /* the ring has len-1 travellable segments; the last→first return is a skip */
  const span = len - 1;
  let i = index + step;
  let jump = false;

  if (i >= span || i < 0) {
    i -= Math.floor(i / span) * span;
    jump = true;
  }

  let i0 = Math.min(Math.floor(i), span - 1);
  let f = i - i0;

  /* skip over any gap segment we've landed in (bounded: a row can't have
     more gap segments than it has slots) */
  for (let guard = 0; guard < len; guard++) {
    const a = row[i0];
    const b = row[i0 + 1];
    if (!b) break;
    if (Math.abs(b.x - a.x) <= maxStep) break;
    i0 += 1;
    jump = true;
    if (i0 >= span) {
      i0 = 0;
      break;
    }
    f = 0;
    i = i0;
  }

  const a = row[i0];
  const b = row[i0 + 1] ?? a;
  const gapped = Math.abs(b.x - a.x) > maxStep;
  const t = gapped ? 0 : f;

  return {
    index: i,
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    u: a.u + (b.u - a.u) * t,
    v: a.v + (b.v - a.v) * t,
    jump,
  };
}

/* ------------------------------------------------------------------ */
/* LEMNISCATE (the ∞ path)                                             */
/* ------------------------------------------------------------------ */

/*
 * Lemniscate of Gerono, the well-behaved ∞: no infinite arms, constant
 * parametrisation, crosses itself once in the middle.
 *
 *   x = a·cos θ
 *   y = b·sin θ·cos θ
 *
 * Returned points are centred on (0,0); callers translate and scale. The
 * tangent comes back too, so particles can be smeared ALONG the direction
 * of travel — that streaking is most of what sells it as a flow rather
 * than a static outline.
 */
export function lemniscate(theta, a = 1, b = 1) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return {
    x: a * c,
    y: b * s * c,
    /* d/dθ of the above, normalised by the caller when needed */
    tx: -a * s,
    ty: b * (c * c - s * s),
  };
}

/* Arc-length-ish speed correction: the raw parametrisation sprints through
   the crossover and crawls at the loop ends, which reads as a stutter. This
   damps the fast part so the stream flows evenly. */
export function lemniscateSpeed(theta) {
  const s = Math.abs(Math.cos(2 * theta));
  return 0.55 + 0.45 * (1 - s);
}

/* Box–Muller, for clouds that are dense at the path and thin at the edges
   rather than uniformly muddy. */
export function gaussian(spread = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v) * spread;
}

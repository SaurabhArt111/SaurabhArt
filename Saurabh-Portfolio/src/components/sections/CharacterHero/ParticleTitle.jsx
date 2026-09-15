import { useEffect, useRef, useState } from "react";
import {
  TAU,
  approach,
  buildFlowRows,
  clamp,
  createVisibleLoop,
  fitCanvas,
  isSmallScreen,
  advanceFlow,
  onThemeChange,
  prefersReducedMotion,
  rand,
  readPalette,
  rgba,
  sampleTextTargets,
  smoothstep,
} from "../../../lib/particles";

/*
 * PARTICLE TITLE — the opening wordmark, made of dust that never sits still.
 *
 * ── Three states, one field ────────────────────────────────────────────
 *
 * ASSEMBLING  every particle starts out in a scattered shell and flies to
 *             the letterforms across the first slice of the hero scroll.
 *
 * RESTING     the interesting problem. A wordmark whose particles are
 *             parked on fixed pixels is just a stencil — legible, but dead.
 *             So at rest every dot TRAVELS: each one rides a conveyor along
 *             its own row of the letterforms, left to right, wrapping back
 *             around at the end (see buildFlowRows in lib/particles.js —
 *             beads on a loop, which keeps coverage exactly even so the
 *             word can never thin out or clump). On top of that current: a
 *             shimmer wave sweeping across the width, per-particle orbital
 *             wobble, a few embers that wander out of the strokes and get
 *             drawn back, and a slow 3D drift so the whole field breathes.
 *
 * HOVERED     the word breathes along its WIDTH — letterforms stretch past
 *             the screen edges, squash vertically as they widen, ripple from
 *             the centre out, split into two colour-offset copies, and bank
 *             in 3D, then collapse and do it again. Driven by each
 *             particle's normalised position inside its own word (u = -1 at
 *             the left edge, +1 at the right), so outer letters travel
 *             furthest and the middle barely moves — that ratio is what
 *             makes it read as one elastic object rather than a few thousand
 *             unrelated dots.
 *
 * Pointer also repels locally, dragging orbits the field, clicking fires a
 * shockwave ring.
 */

const FORM_END = 0.22; // hero-p at which the text is fully formed
const REPEL_RADIUS = 78;
const REPEL_FORCE = 3.4;
const HOVER_PAD = 46; // px of slop around a word's box
const PERSP = 820;

export default function ParticleTitle({ progressRef }) {
  const canvasRef = useRef(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];
    let boxes = {};
    let palette = readPalette(canvas);

    const small = isSmallScreen();
    const MAX_POINTS = small ? 1800 : 3200;

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
      downX: 0,
      downY: 0,
      dragging: false,
    };
    const rotation = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const hover = { title: 0, sub: 0, roles: 0 };
    const hoverTarget = { title: 0, sub: 0, roles: 0 };
    let shock = null; // { x, y, r, life }

    /* ---------------- layout ---------------- */

    const layout = () => {
      const titleSize = Math.min(width * 0.15, height * 0.24, 300);
      const subSize = titleSize * 0.2;
      const roleSize = titleSize * 0.22;
      const titleY = height * 0.46;
      const subY = titleY + subSize * 1.65;

      return [
        {
          id: "title",
          text: "SAURABH",
          size: titleSize,
          align: "center",
          x: width / 2,
          y: titleY,
          tracking: -titleSize * 0.045,
        },
        {
          id: "sub",
          text: "MAURYA",
          size: subSize,
          align: "right",
          x: Math.min(width / 2 + titleSize * 1.15, width - 6),
          y: subY,
          tracking: -subSize * 0.02,
        },
        {
          id: "roles",
          text: "ARTIST · DESIGNER · DEVELOPER",
          size: roleSize,
          align: "center",
          x: width / 2,
          y: subY + roleSize * 3.1,
          tracking: roleSize * 0.16,
        },
      ];
    };

    /* ---------------- the resting conveyor ----------------
       Particles are beads on their row's loop: one per sampled pixel,
       advancing along it and wrapping at the end. See buildFlowRows in
       lib/particles.js for why this is the stable way to keep a wordmark
       flowing without letting the letters drain or clump. */

    const build = () => {
      const fit = fitCanvas(canvas);
      ctx = fit.ctx;
      width = fit.width;
      height = fit.height;
      palette = readPalette(canvas);

      const sampled = sampleTextTargets({
        width,
        height,
        lines: layout(),
        stride: Math.max(2, Math.round(width / (small ? 330 : 520))),
        maxPoints: MAX_POINTS,
      });
      boxes = sampled.boxes;
      /* tags each point with its row + slot, and measures the real spacing
         between neighbouring slots (which is not necessarily the stride we
         asked for — the sampler widens its grid to meet the budget) */
      const flow = buildFlowRows(sampled.points);
      const maxStep = flow.step * 2.5;

      particles = sampled.points.map((p, i) => {
        const angle = Math.random() * TAU;
        const radius = 40 + Math.random() * Math.max(width, height) * 0.62;
        const sx = width / 2 + Math.cos(angle) * radius;
        const sy = height / 2 + Math.sin(angle) * radius * 0.55;
        return {
          /* conveyor: this dot's row, and where along it the dot sits */
          row: p.row,
          i: p.idx,
          /* its original pixel, used only if a row is somehow degenerate */
          hx: p.x,
          hy: p.y,
          u: p.u,
          v: p.v,
          line: p.line,
          /* slots per frame — varied so the current has texture. Kept slow
             on purpose: measured against the real slot spacing this is
             roughly 7–25 px/s, which reads as drifting dust. Much above
             that and the wordmark looks like a marquee. */
          flow: rand(0.02, 0.07),
          /* anything wider than this is a gap between strokes, not a step */
          maxStep,
          /* scatter origin for the assembling state */
          sx,
          sy,
          sz: rand(-560, 560),
          cur: { x: sx, y: sy },
          prev: { x: sx, y: sy },
          disp: { x: 0, y: 0 },
          r: rand(0.7, 2.2),
          tw: rand(0, TAU),
          twSpeed: rand(0.5, 1.3),
          phase: rand(0, TAU),
          orbitR: rand(0.5, 2.4), // idle wobble radius
          orbitS: rand(0.02, 0.06),
          side: i % 2 ? 1 : -1, // chromatic split direction
          star: Math.random() > 0.88,
          bright: Math.random() > 0.94, // gets a bloom
          ember: Math.random() > 0.97, // wanders out of the stroke
          emberPhase: rand(0, TAU),
          drag: rand(0.1, 0.2),
        };
      });
    };

    build();

    /* The offscreen pass rasterises Manrope. If the webfont hasn't landed
       yet the first sample is Arial-shaped, so re-sample once the font is
       ready — cheap, and it happens while the wordmark is still scattered
       at the top of the page, where a re-seed is invisible. */
    let alive = true;
    document.fonts?.ready
      .then(() => {
        if (alive) build();
      })
      .catch(() => {});

    /* ---------------- helpers ---------------- */

    const project = (tx, ty, tz, cx, cy, cosY, sinY, cosX, sinX) => {
      const rx = tx - cx;
      const ry = ty - cy;
      const x1 = rx * cosY + tz * sinY;
      const z1 = -rx * sinY + tz * cosY;
      const y1 = ry * cosX - z1 * sinX;
      const z2 = ry * sinX + z1 * cosX;
      const scale = PERSP / (PERSP + z2);
      return { sx: cx + x1 * scale, sy: cy + y1 * scale, scale };
    };

    const hitLine = (px, py) => {
      for (const [id, b] of Object.entries(boxes)) {
        if (
          px >= b.x0 - HOVER_PAD &&
          px <= b.x1 + HOVER_PAD &&
          py >= b.y0 - HOVER_PAD * 0.7 &&
          py <= b.y1 + HOVER_PAD * 0.7
        ) {
          return id;
        }
      }
      return null;
    };

    /* ---------------- frame ---------------- */

    const step = (dt, elapsed) => {
      const p = progressRef?.current ?? 0;
      const formT = smoothstep(0, FORM_END, p);

      /* hover only matters once the word is legible — warping a cloud that
         hasn't assembled yet just looks like noise */
      const hoverGate = smoothstep(0.55, 0.95, formT);

      for (const id of Object.keys(hover)) {
        hover[id] = approach(hover[id], hoverTarget[id] * hoverGate, 0.075, dt);
      }

      /* idle drift of the whole field — a wordmark that parallaxes very
         slightly never looks like flat type, and it costs two sines */
      if (!pointer.dragging) {
        rotation.targetY = Math.sin(elapsed * 0.0045) * 0.05;
        rotation.targetX = Math.sin(elapsed * 0.0031 + 1.2) * 0.028;
      }
      rotation.x = approach(rotation.x, rotation.targetX, 0.08, dt);
      rotation.y = approach(rotation.y, rotation.targetY, 0.08, dt);

      if (shock) {
        shock.r += 13 * dt;
        shock.life -= 0.014 * dt;
        if (shock.life <= 0) shock = null;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);

      /* one shared breath, so a multi-word hover expands in sympathy */
      const breath = Math.sin(elapsed * 0.042);
      const breath2 = Math.sin(elapsed * 0.019 + 1.1);
      /* resting pulse: the whole wordmark inhales about 2% of its width */
      const idleBreath = Math.sin(elapsed * 0.011);
      /* the current itself surges and eases, so the flow never looks like a
         marquee running at a fixed rate */
      const flowRate = 0.72 + 0.38 * Math.sin(elapsed * 0.008);

      const rotAmount = formT > 0.985 ? 0 : 1 - formT * 0.85;
      const trails = [];

      for (const t of particles) {
        const h = hover[t.line] ?? 0;
        const box = boxes[t.line];

        /* ---- CONVEYOR: ride the row, skipping the empty space ---- */
        let snap = false;
        let mx = t.hx;
        let my = t.hy;
        const at = advanceFlow(
          t.row,
          t.i,
          t.flow * dt * flowRate * (1 + h * 2.4), // hover speeds the current
          t.maxStep
        );
        if (at) {
          t.i = at.index;
          mx = at.x;
          my = at.y;
          t.u = at.u;
          t.v = at.v;
          /* teleports (letter-to-letter hops and end-of-lap returns) are
             taken instantly, with no easing and no trail */
          snap = at.jump;
        }

        /* ---- idle life: orbital wobble + embers ---- */
        mx += Math.cos(elapsed * t.orbitS + t.phase) * t.orbitR;
        my += Math.sin(elapsed * t.orbitS * 1.3 + t.phase) * t.orbitR * 0.8;

        if (t.ember) {
          /* a handful leave the strokes entirely and get reeled back in —
             the word looks like it's only just holding itself together */
          const swing = Math.sin(elapsed * 0.009 + t.emberPhase);
          mx += swing * 26;
          my += Math.cos(elapsed * 0.007 + t.emberPhase) * 14;
        }

        /* ---- resting breath around the word's centre ---- */
        if (box) {
          const s = 1 + idleBreath * 0.02;
          mx = box.cx + (mx - box.cx) * s;
          my = box.cy + (my - box.cy) * (1 - idleBreath * 0.012);
        }

        let tx = t.sx + (mx - t.sx) * formT;
        let ty = t.sy + (my - t.sy) * formT;
        let tz = (t.sz + (0 - t.sz) * formT) * rotAmount;

        if (h > 0.001 && box) {
          /* --- BREATHE ALONG THE WIDTH --------------------------------
             widthScale swings either side of 1, so the word physically
             expands past its own box and then contracts back inside it.
             Note this warps the MIGRATED position, so the flow continues
             underneath the stretch rather than freezing during it. */
          const widthScale = 1 + h * (0.42 + 0.62 * breath);
          const squash = 1 - h * (0.17 + 0.1 * breath); // wide ⇒ thin
          const dx = mx - box.cx;
          const dy = my - box.cy;

          let wx = box.cx + dx * widthScale;
          let wy = box.cy + dy * squash;

          /* --- ripple outward from the centre of the word -------------- */
          const ripple = Math.sin(t.u * 3.4 - elapsed * 0.075 + t.phase * 0.2);
          wx += ripple * (14 + 26 * Math.abs(t.u));
          wy += Math.cos(t.u * 2.6 - elapsed * 0.055) * 9 * t.v;

          /* --- chromatic split: two offset copies, tinted apart -------- */
          wx += t.side * (4 + 9 * Math.abs(breath2));

          /* --- fine grain, scaled by distance from the centre ---------- */
          wx += Math.sin(elapsed * 0.13 + t.phase) * 2.6 * (0.4 + Math.abs(t.u));
          wy += Math.cos(elapsed * 0.11 + t.phase) * 2.2;

          /* blend the warp in by hover weight, so there's no seam between
             resting flow and full stretch */
          tx += (wx - mx) * h * formT;
          ty += (wy - my) * h * formT;

          /* --- bank in 3D so the stretch has some depth to it ---------- */
          tz += Math.sin(t.u * 2.2 + elapsed * 0.04) * h * 190;
        }

        const proj = project(tx, ty, tz, cx, cy, cosY, sinY, cosX, sinX);

        /* pointer repel + shockwave, both in screen space */
        if (pointer.active) {
          const px = t.cur.x - pointer.x;
          const py = t.cur.y - pointer.y;
          const dist = Math.hypot(px, py) || 0.001;
          if (dist < REPEL_RADIUS) {
            const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            t.disp.x += (px / dist) * f;
            t.disp.y += (py / dist) * f;
          }
        }
        if (shock) {
          const px = t.cur.x - shock.x;
          const py = t.cur.y - shock.y;
          const dist = Math.hypot(px, py) || 0.001;
          const band = Math.abs(dist - shock.r);
          if (band < 90) {
            const f = (1 - band / 90) * shock.life * 7;
            t.disp.x += (px / dist) * f;
            t.disp.y += (py / dist) * f;
          }
        }

        t.disp.x *= Math.pow(0.9, dt);
        t.disp.y *= Math.pow(0.9, dt);

        t.prev.x = t.cur.x;
        t.prev.y = t.cur.y;
        if (snap) {
          /* end of the lap: reappear at the row's head with no easing, and
             with prev reset so no streak is drawn across the word */
          t.cur.x = proj.sx;
          t.cur.y = proj.sy;
          t.prev.x = proj.sx;
          t.prev.y = proj.sy;
        } else {
          /* stiffer catch-up while hovering — the warp should feel snappy,
             not like the letters are wading through syrup */
          const rate = t.drag + h * 0.22;
          t.cur.x = approach(t.cur.x, proj.sx + t.disp.x, rate, dt);
          t.cur.y = approach(t.cur.y, proj.sy + t.disp.y, rate, dt);
        }

        /* ---- paint ----
           Twinkle has a raised floor now: the old range bottomed out near
           zero, which left a lot of the wordmark invisible at any instant
           and read as thin. A shimmer wave travelling across the width
           carries the sparkle instead. */
        t.tw += 0.025 * t.twSpeed * dt;
        /* Twinkle used to bottom out near zero, which left a good share of
           the wordmark invisible at any instant — over a busy background
           that reads as thin and washed out. The floor is raised and the
           sparkle is carried by a shimmer wave travelling across the width
           instead, which is both brighter overall and more legible. */
        const twinkle = 0.72 + Math.sin(t.tw) * 0.28;
        const shimmer = 0.86 + 0.3 * Math.sin(t.u * 2.8 - elapsed * 0.03);
        const alpha = clamp(
          Math.min(1, proj.scale * 1.15) *
            (0.5 + 0.6 * formT + 0.25 * (1 - formT)) *
            twinkle *
            shimmer,
          0,
          1
        );

        const speed = Math.hypot(t.cur.x - t.prev.x, t.cur.y - t.prev.y);
        if (!snap && speed > 1.4) trails.push(t.prev.x, t.prev.y, t.cur.x, t.cur.y);

        /* colour: accent-tinted for "stars", and the chromatic pair pulls
           apart in hue as well as position while hovering */
        const tint = t.star || (h > 0.35 && t.side > 0);
        const col = tint ? palette.accent : palette.dot;
        const radius = Math.max(0.4, t.r * proj.scale * (1 + h * 0.5) * (0.9 + shimmer * 0.2));

        ctx.fillStyle = rgba(col, alpha);
        if (radius < 1) {
          /* fillRect beats arc() by a wide margin at sub-pixel sizes and is
             visually identical once it's this small */
          ctx.fillRect(t.cur.x - radius, t.cur.y - radius, radius * 2, radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(t.cur.x, t.cur.y, radius, 0, TAU);
          ctx.fill();
        }

        /* a few bright cores get a soft bloom, like a long exposure */
        if (t.bright && alpha > 0.3) {
          ctx.fillStyle = rgba(palette.glow, alpha * 0.085);
          ctx.beginPath();
          ctx.arc(t.cur.x, t.cur.y, radius * 5, 0, TAU);
          ctx.fill();
        }
      }

      /* trails batch into a single stroked path — 3,200 individual strokes
         would cost more than everything above */
      if (trails.length) {
        ctx.strokeStyle = rgba(palette.glow, 0.13);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < trails.length; i += 4) {
          ctx.moveTo(trails[i], trails[i + 1]);
          ctx.lineTo(trails[i + 2], trails[i + 3]);
        }
        ctx.stroke();
      }
    };

    const loop = createVisibleLoop(canvas, step);

    /* ---------------- events ---------------- */

    const onResize = () => build();

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;

      const id = hitLine(pointer.x, pointer.y);
      for (const key of Object.keys(hoverTarget)) {
        hoverTarget[key] = id === key ? 1 : 0;
      }
      canvas.dataset.hovering = id ?? "";

      if (pointer.dragging) {
        const dx = e.clientX - pointer.downX;
        const dy = e.clientY - pointer.downY;
        rotation.targetY = clamp(dx * 0.0022, -0.5, 0.5);
        rotation.targetX = clamp(-dy * 0.0022, -0.5, 0.5);
      }
    };

    const onLeave = () => {
      pointer.active = false;
      for (const key of Object.keys(hoverTarget)) hoverTarget[key] = 0;
      canvas.dataset.hovering = "";
    };

    const onDown = (e) => {
      pointer.dragging = true;
      pointer.downX = e.clientX;
      pointer.downY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    };

    const onUp = (e) => {
      /* a click that didn't drag anywhere fires the shockwave instead */
      if (pointer.dragging) {
        const travelled = Math.hypot(e.clientX - pointer.downX, e.clientY - pointer.downY);
        if (travelled < 6) {
          const r = canvas.getBoundingClientRect();
          shock = { x: e.clientX - r.left, y: e.clientY - r.top, r: 8, life: 1 };
        }
      }
      pointer.dragging = false;
    };

    const stopTheme = onThemeChange(() => {
      palette = readPalette(canvas);
    });

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      loop.stop();
      stopTheme();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, progressRef]);

  if (reduced) {
    return (
      <div className="sm-particle-title sm-particle-title-static">
        <h1 className="sm-hero-title" aria-label="Saurabh Maurya">
          SAURABH
          <br />
          <span>MAURYA</span>
        </h1>
        <div className="sm-hero-sub-title">
          <span>ARTIST</span>
          <b>·</b>
          <span>DESIGNER</span>
          <b>·</b>
          <span>DEVELOPER</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <canvas ref={canvasRef} className="sm-particle-title" />
      <h1 className="sr-only">Saurabh Maurya — Artist, Designer &amp; Developer</h1>
    </>
  );
}

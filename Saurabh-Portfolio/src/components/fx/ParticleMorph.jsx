import { useEffect, useRef, useState } from "react";
import {
  TAU,
  approach,
  clamp,
  createVisibleLoop,
  fitCanvas,
  gaussian,
  isSmallScreen,
  lemniscate,
  lemniscateSpeed,
  onThemeChange,
  prefersReducedMotion,
  rand,
  readPalette,
  rgba,
  sampleTextTargets,
  smoothstep,
} from "../../lib/particles";
import "./ParticleMorph.css";

/*
 * PARTICLE MORPH — one field of dust with two states it slides between.
 *
 *   FLOW  particles ride an ∞ (a lemniscate of Gerono) as a continuous
 *         stream: dense at the path, thinning outward, streaking along the
 *         direction of travel, the whole ribbon tilted and swinging slowly
 *         in 3D so the two loops pass in front of and behind each other.
 *         No guide path is ever drawn — the shape only exists as particles.
 *
 *   TEXT  the same particles settle onto the pixels of a line of type.
 *
 * `morph` is the blend: 0 is pure flow, 1 is held text, and everything in
 * between reads as the sentence dissolving into the stream (or condensing
 * out of it). The mid-page band scrubs that value with scroll; the closing
 * band sits at 1 and scatters back to flow under the cursor.
 *
 * Props
 *   text          line to form. Defaults to the role line.
 *   morph         "flow" | "text" | "scrub"
 *   progressRef   { current: 0..1 } — required for "scrub"
 *   hoverEffect   "scatter" | "gather" | "none"
 *   count         particle budget override
 */

const BASE_SPEED = 0.0075; // radians per 60fps frame
const PERSP = 900;

export default function ParticleMorph({
  text = "ARTIST · DESIGNER · DEVELOPER",
  morph = "flow",
  progressRef = null,
  hoverEffect = "scatter",
  count,
  className = "",
  label,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let parts = [];
    let palette = readPalette(canvas);
    let a = 1;
    let b = 1;

    const small = isSmallScreen();
    const budget = count ?? (small ? 900 : 1750);

    const pointer = { x: -9999, y: -9999, active: false };
    const state = { morph: morph === "text" ? 1 : 0, hover: 0, swing: 0 };

    const build = () => {
      const fit = fitCanvas(canvas, 1.75);
      ctx = fit.ctx;
      width = fit.width;
      height = fit.height;
      palette = readPalette(canvas);

      a = width * 0.36;
      b = height * 0.74;

      /* text homes — sampled at a stride that lands near the particle
         budget, so the sentence is evenly covered rather than clumped */
      const size = clamp(width / (text.length * 0.66), 14, height * 0.3);
      const { points } = sampleTextTargets({
        width,
        height,
        lines: [
          {
            id: "line",
            text,
            size,
            weight: 800,
            align: "center",
            x: width / 2,
            y: height / 2 + size * 0.34,
            tracking: size * 0.14,
          },
        ],
        stride: small ? 3 : 2,
        maxPoints: budget,
      });

      parts = Array.from({ length: budget }, (_, i) => {
        const theta = rand(0, TAU);
        const home = points.length ? points[i % points.length] : null;
        /* band: distance from the path. Gaussian, so the stream is a solid
           core with a haze around it — the loops in the reference read as
           clouds, not outlines. */
        const band = gaussian(0.5);
        return {
          theta,
          speed: rand(0.55, 1.5),
          band,
          bandPhase: rand(0, TAU),
          z: gaussian(0.5) * 90,
          hx: home ? home.x : width / 2,
          hy: home ? home.y : height / 2,
          jx: rand(-1.1, 1.1),
          jy: rand(-1.1, 1.1),
          cur: { x: width / 2, y: height / 2 },
          prev: { x: width / 2, y: height / 2 },
          disp: { x: 0, y: 0 },
          r: Math.random() > 0.94 ? rand(1.3, 2.3) : rand(0.35, 1.05),
          tw: rand(0, TAU),
          twSpeed: rand(0.3, 1.1),
          bright: Math.random() > 0.93,
          star: Math.random() > 0.9,
          seeded: false,
        };
      });
    };

    build();

    /* re-sample once the webfont is ready — see the note in ParticleTitle */
    let alive = true;
    document.fonts?.ready
      .then(() => {
        if (alive) build();
      })
      .catch(() => {});

    const step = (dt, elapsed) => {
      /* ---- resolve the morph target ---- */
      let target = morph === "text" ? 1 : 0;
      if (morph === "scrub") {
        /* a bell: flows in, gathers into the sentence across the middle of
           the band's travel, then lets go again on the way out */
        const p = clamp(progressRef?.current ?? 0, 0, 1);
        target = smoothstep(0.16, 0.46, p) - smoothstep(0.72, 0.98, p);
      }
      if (hoverEffect === "scatter") target -= state.hover * target;
      else if (hoverEffect === "gather") target += state.hover * (1 - target);

      state.morph = approach(state.morph, clamp(target, 0, 1), 0.045, dt);
      state.hover = approach(state.hover, pointer.active ? 1 : 0, 0.06, dt);

      const m = state.morph;
      const flowing = 1 - m;

      /* slow 3D swing — the ribbon leans one way, then the other */
      state.swing = Math.sin(elapsed * 0.0042) * 0.5;
      const rotY = state.swing;
      const tiltX = 0.34 + Math.sin(elapsed * 0.0031) * 0.06;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);

      const cx = width / 2;
      const cy = height / 2;

      /* the cloud breathes in and out from the path */
      const spread = 1 + Math.sin(elapsed * 0.012) * 0.22;

      ctx.clearRect(0, 0, width, height);

      for (const t of parts) {
        /* --- advance along the ∞ (always, even while held as text, so
           letting go resumes mid-stream instead of snapping) --- */
        t.theta += BASE_SPEED * t.speed * lemniscateSpeed(t.theta) * dt * (0.35 + 0.65 * flowing);
        if (t.theta > TAU) t.theta -= TAU;

        const p = lemniscate(t.theta, a, b);
        const tl = Math.hypot(p.tx, p.ty) || 1;
        const nx = -p.ty / tl; // unit normal
        const ny = p.tx / tl;

        const swell = t.band * spread * (1 + Math.sin(elapsed * 0.02 + t.bandPhase) * 0.18);
        const bandPx = swell * Math.min(width, height) * 0.075;

        const fx = p.x + nx * bandPx;
        const fy = p.y + ny * bandPx;
        const fz = t.z + swell * 60;

        /* 3D rotate the flow position only — text stays flat and readable */
        const x1 = fx * cosY + fz * sinY;
        const z1 = -fx * sinY + fz * cosY;
        const y1 = fy * cosX - z1 * sinX;
        const z2 = fy * sinX + z1 * cosX;
        const depth = PERSP / (PERSP + z2);

        const flowX = cx + x1 * depth;
        const flowY = cy + y1 * depth;

        /* --- blend flow → text --- */
        const homeX = t.hx + t.jx * (0.6 + flowing * 2.2);
        const homeY = t.hy + t.jy * (0.6 + flowing * 2.2);
        const tx = flowX + (homeX - flowX) * m;
        const ty = flowY + (homeY - flowY) * m;

        if (!t.seeded) {
          t.cur.x = tx;
          t.cur.y = ty;
          t.seeded = true;
        }

        /* --- pointer push --- */
        if (pointer.active) {
          const dx = t.cur.x - pointer.x;
          const dy = t.cur.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < 110) {
            const f = (1 - dist / 110) * 2.6;
            t.disp.x += (dx / dist) * f;
            t.disp.y += (dy / dist) * f;
          }
        }
        t.disp.x *= Math.pow(0.88, dt);
        t.disp.y *= Math.pow(0.88, dt);

        t.prev.x = t.cur.x;
        t.prev.y = t.cur.y;
        /* held text settles hard; flowing dust chases loosely, which is
           what lets the stream lag into visible streaks */
        const rate = 0.1 + m * 0.22;
        t.cur.x = approach(t.cur.x, tx + t.disp.x, rate, dt);
        t.cur.y = approach(t.cur.y, ty + t.disp.y, rate, dt);

        /* --- paint --- */
        t.tw += 0.022 * t.twSpeed * dt;
        const twinkle = 0.45 + Math.sin(t.tw) * 0.55;
        const depthFade = clamp(depth * 1.05, 0.25, 1.25);
        const alpha = clamp(
          (0.2 + 0.55 * twinkle) * (flowing * depthFade + m * 1.05) * (t.bright ? 1.5 : 1),
          0,
          1
        );

        const col = t.star ? palette.accent : palette.dot;
        const r = Math.max(0.35, t.r * (m > 0.6 ? 1 : depthFade));

        const vx = t.cur.x - t.prev.x;
        const vy = t.cur.y - t.prev.y;
        const speed = Math.hypot(vx, vy);

        if (flowing > 0.25 && speed > 0.9) {
          /* streak along actual travel direction — cheap motion blur */
          ctx.strokeStyle = rgba(col, alpha * 0.55);
          ctx.lineWidth = r * 1.5;
          ctx.beginPath();
          ctx.moveTo(t.cur.x - vx * 1.6, t.cur.y - vy * 1.6);
          ctx.lineTo(t.cur.x, t.cur.y);
          ctx.stroke();
        }

        ctx.fillStyle = rgba(col, alpha);
        if (r < 1.1) {
          ctx.fillRect(t.cur.x - r, t.cur.y - r, r * 2, r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(t.cur.x, t.cur.y, r, 0, TAU);
          ctx.fill();
        }

        /* a handful of soft bloom dots, like the bright cores in a
           long-exposure star field */
        if (t.bright && alpha > 0.35) {
          ctx.fillStyle = rgba(palette.glow, alpha * 0.1);
          ctx.beginPath();
          ctx.arc(t.cur.x, t.cur.y, r * 4.5, 0, TAU);
          ctx.fill();
        }
      }
    };

    const loop = createVisibleLoop(canvas, step);

    const onResize = () => build();
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      pointer.active = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      pointer.x = x;
      pointer.y = y;
    };
    const onOut = () => {
      pointer.active = false;
    };

    const stopTheme = onThemeChange(() => {
      palette = readPalette(canvas);
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onOut);

    return () => {
      alive = false;
      loop.stop();
      stopTheme();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onOut);
    };
  }, [reduced, morph, progressRef, text, hoverEffect, count]);

  if (reduced) {
    return (
      <div className={`fx-morph fx-morph-static ${className}`.trim()} ref={wrapRef}>
        <p>{text}</p>
      </div>
    );
  }

  return (
    <div className={`fx-morph ${className}`.trim()} ref={wrapRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

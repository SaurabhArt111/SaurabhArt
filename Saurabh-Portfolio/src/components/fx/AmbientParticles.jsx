import { useEffect, useRef, useState } from "react";
import {
  TAU,
  approach,
  clamp,
  createVisibleLoop,
  fitCanvas,
  isSmallScreen,
  onThemeChange,
  prefersReducedMotion,
  rand,
  readPalette,
  rgba,
} from "../../lib/particles";
import "./AmbientParticles.css";

/*
 * AMBIENT PARTICLES — the quiet dust that sits over every page.
 *
 * Deliberately almost invisible. One instance is mounted for the whole site
 * as a fixed overlay above the stacked scenes (they each paint an opaque
 * background, so a layer *behind* them would never be seen) and below the
 * nav. It never takes pointer events.
 *
 * Two things stop it reading as generic "floating dots":
 *   · dots drift on slow individual orbits rather than a shared direction,
 *     and twinkle on their own clocks;
 *   · scroll VELOCITY smears them. Flick down the page and the field
 *     stretches into faint vertical streaks, then settles. It ties the
 *     effect to what the reader is doing instead of looping regardless.
 *
 * `variant="inset"` fills the nearest positioned ancestor instead of the
 * viewport — used inside the hero, where the field wants to be denser.
 */

const DENSITY = 210; // dots per million CSS px, at density={1}

export default function AmbientParticles({
  variant = "fixed",
  density = 1,
  opacity,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dots = [];
    let palette = readPalette(canvas);

    const small = isSmallScreen();
    const pointer = { x: -9999, y: -9999, active: false };
    const scroll = { last: window.scrollY, vel: 0, smooth: 0 };

    const build = () => {
      const fit = fitCanvas(canvas, 1.6); // dust doesn't need retina
      ctx = fit.ctx;
      width = fit.width;
      height = fit.height;
      palette = readPalette(canvas);

      const count = clamp(
        Math.round(((width * height) / 1_000_000) * DENSITY * density * (small ? 0.55 : 1)),
        40,
        small ? 220 : 520
      );

      dots = Array.from({ length: count }, () => {
        const x = rand(0, width);
        const y = rand(0, height);
        return {
          bx: x,
          by: y,
          x,
          y,
          disp: { x: 0, y: 0 },
          phase: rand(0, TAU),
          speed: rand(0.15, 0.5),
          driftR: rand(9, 30),
          r: rand(0.4, 1.7),
          tw: rand(0, TAU),
          twSpeed: rand(0.25, 0.9),
          depth: rand(0.35, 1), // parallax + streak weight
          star: Math.random() > 0.9,
        };
      });
    };

    build();

    const step = (dt, elapsed) => {
      /* scroll velocity, in px per frame, smoothed so it decays instead of
         snapping back to zero the instant the wheel stops */
      const y = window.scrollY;
      scroll.vel = (y - scroll.last) / Math.max(dt, 0.001);
      scroll.last = y;
      scroll.smooth = approach(scroll.smooth, clamp(scroll.vel, -90, 90), 0.12, dt);
      const smear = clamp(Math.abs(scroll.smooth) / 55, 0, 1);

      ctx.clearRect(0, 0, width, height);

      for (const d of dots) {
        const ox = d.bx + Math.cos(elapsed * 0.01 * d.speed + d.phase) * d.driftR;
        const oy =
          d.by +
          Math.sin(elapsed * 0.013 * d.speed + d.phase) * d.driftR * 0.6 -
          scroll.smooth * d.depth * 0.9;

        if (pointer.active) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < 90) {
            const f = (1 - dist / 90) * 2.1;
            d.disp.x += (dx / dist) * f;
            d.disp.y += (dy / dist) * f;
          }
        }
        d.disp.x *= Math.pow(0.9, dt);
        d.disp.y *= Math.pow(0.9, dt);

        d.x = approach(d.x, ox + d.disp.x, 0.12, dt);
        d.y = approach(d.y, oy + d.disp.y, 0.12, dt);

        /* wrap vertically so a long smear never empties the top or bottom */
        if (d.y < -40) d.by += height + 80;
        else if (d.y > height + 40) d.by -= height + 80;

        d.tw += 0.02 * d.twSpeed * dt;
        const twinkle = 0.4 + Math.sin(d.tw) * 0.6;
        const alpha = clamp(0.34 * twinkle * d.depth, 0, 1);
        const col = d.star ? palette.accent : palette.dot;
        const r = Math.max(0.35, d.r * d.depth);

        if (smear > 0.06) {
          const len = smear * 26 * d.depth * Math.sign(scroll.smooth || 1);
          ctx.strokeStyle = rgba(col, alpha * 0.8);
          ctx.lineWidth = r * 1.4;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x, d.y - len);
          ctx.stroke();
        } else {
          ctx.fillStyle = rgba(col, alpha);
          ctx.fillRect(d.x - r, d.y - r, r * 2, r * 2);
        }
      }
    };

    const loop = createVisibleLoop(canvas, step, { margin: "0px" });

    const onResize = () => build();
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
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
      loop.stop();
      stopTheme();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onOut);
    };
  }, [reduced, density]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fx-ambient fx-ambient-${variant} ${className}`.trim()}
      style={opacity == null ? undefined : { opacity }}
    />
  );
}

import { useEffect, useRef, useState } from "react";

/* PARTICLE TITLE */
const FORM_END = 0.22; // hero-p at which the text is fully formed
const REPEL_RADIUS = 70;
const REPEL_FORCE = 3.2;
const MAX_TEXT_PARTICLES = 2600;
const AMBIENT_COUNT_PER_MPX = 220; // ambient particles per million screen px
const AMBIENT_MAX = 620;

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

const clampRot = (v, max = 0.5) => Math.max(-max, Math.min(max, v));
const rand = (a, b) => a + Math.random() * (b - a);

function usePrefersReducedMotion() {
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

export default function ParticleTitle({ progressRef }) {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let textParticles = [];
    let ambientParticles = [];
    let raf = 0;
    let clock = 0;

    const pointer = { x: -9999, y: -9999, active: false, downX: 0, downY: 0, dragging: false };
    const rotation = { x: 0, y: 0, targetX: 0, targetY: 0 };

    /* -------- sample "SAURABH / MAURYA / ARTIST·DESIGNER·DEVELOPER" -------- */
    const sampleTextTargets = () => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(width));
      off.height = Math.max(1, Math.floor(height));
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";

      const titleSize = Math.min(width * 0.15, height * 0.24, 300);
      const subSize = titleSize * 0.2;
      const roleSize = titleSize * 0.22;

      const titleY = height * 0.46;
      octx.textAlign = "center";
      octx.font = `800 ${titleSize}px Arial, sans-serif`;
      try {
        octx.letterSpacing = `${-titleSize * 0.045}px`;
      } catch {
        /* letterSpacing unsupported — negligible visual difference */
      }
      octx.fillText("SAURABH", width / 2, titleY);

      octx.textAlign = "right";
      octx.font = `800 ${subSize}px Arial, sans-serif`;
      try {
        octx.letterSpacing = `${-subSize * 0.02}px`;
      } catch {}
      const mauryaY = titleY + subSize * 1.65;
      octx.fillText("MAURYA", Math.min(width / 2 + titleSize * 1.15, width - 6), mauryaY);

      octx.textAlign = "center";
      octx.font = `800 ${roleSize}px Arial, sans-serif`;
      try {
        octx.letterSpacing = `${roleSize * 0.16}px`;
      } catch {}
      const roleY = mauryaY + roleSize * 3.1;
      octx.fillText("ARTIST · DESIGNER · DEVELOPER", width / 2, roleY);

      const { data } = octx.getImageData(0, 0, off.width, off.height);
      const pts = [];
      const stride = Math.max(2, Math.round(width / 460));
      for (let y = 0; y < off.height; y += stride) {
        for (let x = 0; x < off.width; x += stride) {
          if (data[(y * off.width + x) * 4 + 3] > 120) pts.push({ x, y });
        }
      }

      if (pts.length <= MAX_TEXT_PARTICLES) return pts;
      const sampled = [];
      const step = pts.length / MAX_TEXT_PARTICLES;
      for (let i = 0; i < MAX_TEXT_PARTICLES; i++) sampled.push(pts[Math.floor(i * step)]);
      return sampled;
    };

    const buildTextParticles = () => {
      const targets = sampleTextTargets();
      return targets.map((p) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * Math.max(width, height) * 0.62;
        const scatter = {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius * 0.55,
          z: rand(-560, 560),
        };
        return {
          home: { x: p.x, y: p.y, z: 0 },
          scatter,
          cur: { x: scatter.x, y: scatter.y },
          disp: { x: 0, y: 0 },
          r: rand(0.7, 2.2),
          tw: rand(0, Math.PI * 2),
          twSpeed: rand(0.5, 1.3),
          star: Math.random() > 0.88,
        };
      });
    };

    const buildAmbientParticles = () => {
      const count = Math.min(AMBIENT_MAX, Math.round(((width * height) / 1_000_000) * AMBIENT_COUNT_PER_MPX));
      const arr = [];
      for (let i = 0; i < count; i++) {
        const base = { x: rand(0, width), y: rand(0, height), z: rand(-700, 700) };
        arr.push({
          base,
          cur: { x: base.x, y: base.y },
          disp: { x: 0, y: 0 },
          phase: rand(0, Math.PI * 2),
          speed: rand(0.15, 0.5),
          driftR: rand(8, 26),
          r: rand(0.4, 1.7),
          tw: rand(0, Math.PI * 2),
          twSpeed: rand(0.25, 0.9),
          star: Math.random() > 0.93,
        });
      }
      return arr;
    };

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      textParticles = buildTextParticles();
      ambientParticles = buildAmbientParticles();
    };

    build();

    const project = (tx, ty, tz, cx, cy, cosY, sinY, cosX, sinX, persp) => {
      const rx = tx - cx;
      const ry = ty - cy;
      const x1 = rx * cosY + tz * sinY;
      const z1 = -rx * sinY + tz * cosY;
      const y1 = ry * cosX - z1 * sinX;
      const z2 = ry * sinX + z1 * cosX;
      const scale = persp / (persp + z2);
      return { sx: cx + x1 * scale, sy: cy + y1 * scale, scale };
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      clock += 1;
      const p = progressRef?.current ?? 0;
      const formT = smoothstep(0, FORM_END, p);

      rotation.x += (rotation.targetX - rotation.x) * 0.08;
      rotation.y += (rotation.targetY - rotation.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const persp = 820;

      /* ---- ambient background — drawn first, sits behind the wordmark ---- */
      for (const a of ambientParticles) {
        const driftX = a.base.x + Math.cos(clock * 0.01 * a.speed + a.phase) * a.driftR;
        const driftY = a.base.y + Math.sin(clock * 0.013 * a.speed + a.phase) * a.driftR * 0.6;
        const { sx, sy, scale } = project(driftX, driftY, a.base.z, cx, cy, cosY, sinY, cosX, sinX, persp);

        if (pointer.active) {
          const dx = a.cur.x - pointer.x;
          const dy = a.cur.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < REPEL_RADIUS) {
            const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE * 0.8;
            a.disp.x += (dx / dist) * f;
            a.disp.y += (dy / dist) * f;
          }
        }
        a.disp.x *= 0.9;
        a.disp.y *= 0.9;
        a.cur.x += (sx + a.disp.x - a.cur.x) * 0.14;
        a.cur.y += (sy + a.disp.y - a.cur.y) * 0.14;

        a.tw += 0.02 * a.twSpeed;
        const twinkle = 0.4 + Math.sin(a.tw) * 0.6;
        const alpha = Math.min(1, scale) * 0.32 * twinkle;

        ctx.beginPath();
        ctx.fillStyle = a.star
          ? `rgba(157, 132, 232, ${alpha})`
          : `rgba(235, 232, 226, ${alpha})`;
        ctx.arc(a.cur.x, a.cur.y, Math.max(0.35, a.r * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---- wordmark — scattered -> formed as hero-p advances ---- */
      /* the field only visibly "orbits" while scattered/forming — blend
         rotation out as text finishes forming so the wordmark stays crisp
         rather than swimming in 3D once it's meant to be read */
      const rotAmount = formT > 0.985 ? 0 : 1 - formT * 0.85;

      for (const t of textParticles) {
        const tx = t.scatter.x + (t.home.x - t.scatter.x) * formT;
        const ty = t.scatter.y + (t.home.y - t.scatter.y) * formT;
        const tz = (t.scatter.z + (t.home.z - t.scatter.z) * formT) * rotAmount;

        const { sx, sy, scale } = project(tx, ty, tz, cx, cy, cosY, sinY, cosX, sinX, persp);

        if (pointer.active) {
          const dx = t.cur.x - pointer.x;
          const dy = t.cur.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < REPEL_RADIUS) {
            const f = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            t.disp.x += (dx / dist) * f;
            t.disp.y += (dy / dist) * f;
          }
        }
        t.disp.x *= 0.9;
        t.disp.y *= 0.9;
        t.cur.x += (sx + t.disp.x - t.cur.x) * 0.16;
        t.cur.y += (sy + t.disp.y - t.cur.y) * 0.16;

        t.tw += 0.025 * t.twSpeed;
        const twinkle = 0.55 + Math.sin(t.tw) * 0.45;
        const alpha = Math.min(1, scale * 1.1) * (0.35 + 0.65 * formT + 0.25 * (1 - formT)) * twinkle;

        ctx.beginPath();
        ctx.fillStyle = t.star ? `rgba(157, 132, 232, ${alpha})` : `rgba(240, 238, 233, ${alpha})`;
        ctx.arc(t.cur.x, t.cur.y, Math.max(0.4, t.r * scale), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    loop();

    const onResize = () => build();

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
      if (pointer.dragging) {
        const dx = e.clientX - pointer.downX;
        const dy = e.clientY - pointer.downY;
        rotation.targetY = clampRot(dx * 0.0022);
        rotation.targetX = clampRot(-dy * 0.0022);
      }
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (e) => {
      pointer.dragging = true;
      pointer.downX = e.clientX;
      pointer.downY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onUp = () => {
      pointer.dragging = false;
      rotation.targetX = 0;
      rotation.targetY = 0;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
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


import { useEffect, useRef, useState } from "react";
import ParticleTitle from "./ParticleTitle";
import heroProgress from "../../../lib/heroProgress";
import "./CharacterHero.css";

const FRAME_COUNT = 100;
const framePath = (index) => `/character/male${String(index + 1).padStart(4, "0")}.png`;

export default function CharacterHero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const images = [];
    const targetRef = { v: 0 };
    const currentRef = { v: 0 };
    let raf = 0;
    let tickRaf = 0;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(currentRef.v);
    };

    const draw = (frame) => {
      const img = images[Math.round(frame)];
      if (!img?.complete || !img.naturalWidth) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const tick = () => {
      currentRef.v += (targetRef.v - currentRef.v) * 0.12;
      draw(currentRef.v);
      tickRaf = requestAnimationFrame(tick);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i);
      let loaded = 0;
      img.onload = () => {
        loaded++;
        if (i === 0 || loaded > 8) {
          draw(currentRef.v);
          if (i === 0) setReady(true);
        }
      };
      images.push(img);
    }

    /* single local-progress read, shared by the canvas frame and the
       --hero-p CSS variable that drives the title/copy parallax below */
    const updateProgress = () => {
      const rect = hero.getBoundingClientRect();
      const range = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / range, 0), 1);
      hero.style.setProperty("--hero-p", p.toFixed(6));
      heroProgress.current = p;
      targetRef.v = p * (FRAME_COUNT - 1);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateProgress);
    };

    resizeCanvas();
    updateProgress();
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tickRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="sm-hero" id="opening" ref={heroRef}>
      <div className="sm-character-layer" aria-hidden="true">
        <canvas ref={canvasRef} />
        {!ready && (
          <div className="sm-character-fallback">
            <span>100 FRAME CHARACTER SEQUENCE</span>
            <small>Loading…</small>
          </div>
        )}
      </div>
      <div className="sm-hero-vignette" aria-hidden="true" />

      <div className="sm-hero-meta">
        <span>PORTFOLIO / 2026</span>
        <span className="sm-india">INDIA</span>
      </div>

      <div className="sm-particle-layer" aria-hidden="true">
        <ParticleTitle progressRef={heroProgress} />
      </div>

      <div className="sm-hero-copy">
        <div className="sm-roles" aria-label="Artist, Designer, Developer">
          <span>ARTIST</span>
          <b>·</b>
          <span>DESIGNER</span>
          <b>·</b>
          <span>DEVELOPER</span>
        </div>
        <p>I design visuals, build interfaces, and turn ideas into working digital experiences.</p>
        <a className="sm-scroll-cue" href="#home">
          <span>SCROLL</span>
          <i aria-hidden="true">↓</i>
        </a>
      </div>

      <div className="sm-hero-bottom-note">
        <span>SCROLL-DRIVEN CHARACTER STUDY</span>
        <span>01—04</span>
      </div>
    </section>
  );
}

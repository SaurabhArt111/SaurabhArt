import React, { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 300;
const framePath = (index) => `/character/male${String(index + 1).padStart(4, '0')}.png`;

export default function CharacterSequence() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const images = [];
    imagesRef.current = images;
    let loaded = 0;
    let alive = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(currentRef.current);
    };

    const draw = (frame) => {
      const img = images[Math.round(frame)];
      if (!img?.complete || !img.naturalWidth) return;
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * ratio;
      const dh = img.naturalHeight * ratio;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const tick = () => {
      currentRef.current += (targetRef.current - currentRef.current) * 0.12;
      draw(currentRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = framePath(i);
      img.onload = () => {
        loaded++;
         // draw first frame immediately, then every 8th frame
        if (i === 0 || loaded > 8) {
          draw(currentRef.current);
          if (i === 0) setReady(true);
        }
      };
      images.push(img);
    }

    const onScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / (max * 0.58), 0), 1);
      targetRef.current = progress * (FRAME_COUNT - 1);
    };

    resize(); onScroll(); tick();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <div className="character-layer" aria-hidden="true">
    <canvas ref={canvasRef} />
    {!ready && <div className="character-fallback"><span>300 FRAME CHARACTER SEQUENCE</span><small>Add male0001.png → male0300.png to /public/character</small></div>}
  </div>;
}

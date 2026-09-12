import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../lib/gsap";
import { setLenis, scrollToHash } from "../../lib/lenis";

export default function SmoothScroll({ children }) {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = requestAnimationFrame(() =>
      setTimeout(() => scrollToHash(location.hash), 80)
    );
    return () => {
      cancelAnimationFrame(id);
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    let lenis = null;
    let raf = null;

    if (!prefersReducedMotion()) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    }

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey)
        return;
      const link = e.target?.closest?.("a[href]");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      scrollToHash(href);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../lib/gsap";
import { setLenis, scrollToHash } from "../../lib/lenis";

/* Single rAF loop: Lenis drives ScrollTrigger — 00 §7.3.
   Also owns in-page anchor scrolling for the whole site, so every link
   (nav, hero CTAs, footer, and anything we add later) lands below the header. */
export default function SmoothScroll({ children }) {
  const location = useLocation();

  /* Next's <Link href="/#work"> used to scroll to the target automatically
     after a client-side route change (e.g. from the case-study page back to
     "/#work"). React Router doesn't do this for us, so it's replicated here:
     any time the path or hash changes, and a hash is present, scroll to it
     once the destination page has had a moment to mount. */
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

    /* delegated: catches every same-page anchor on the site */
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

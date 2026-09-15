import React, { useEffect, useRef } from 'react';

export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.style.setProperty('--reveal-delay', `${delay}ms`);
        node.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

import { useState, useEffect, useRef } from "react";

/**
 * Hook untuk animasi reveal saat elemen masuk ke viewport.
 * Mengembalikan { ref, vis } — pasang ref ke elemen, gunakan vis untuk class CSS.
 */
export function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, vis };
}

/**
 * Hook untuk deteksi scroll melewati threshold tertentu.
 * @param {number} th - Threshold scroll dalam pixel (default: 60)
 * @returns {boolean}
 */
export function useScrolled(th = 60) {
  const [s, setS] = useState(false);

  useEffect(() => {
    const fn = () => setS(window.scrollY > th);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [th]);

  return s;
}

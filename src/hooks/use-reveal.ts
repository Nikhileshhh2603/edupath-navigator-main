import { useEffect, useRef } from "react";

export const useReveal = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    el.querySelectorAll<HTMLElement>(".reveal").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
};

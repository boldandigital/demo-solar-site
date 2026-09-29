"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: React.ReactNode;
  /** Optional class for the wrapping element (default <div>) */
  className?: string;
  /** Animation y-offset in px (default 24) */
  y?: number;
  /** Animation duration in seconds (default 0.8) */
  duration?: number;
  /** Delay before the reveal runs (default 0) */
  delay?: number;
};

/**
 * SectionReveal — fades children in (with a slight upward translation)
 * the first time they enter the viewport. Uses GSAP + ScrollTrigger
 * so it stays in sync with Lenis via the global ticker.
 */
export function SectionReveal({
  children,
  className,
  y = 24,
  duration = 0.8,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [y, duration, delay]);

  return (
    <div ref={ref} className={className} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}

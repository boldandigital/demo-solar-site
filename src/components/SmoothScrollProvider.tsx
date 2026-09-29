"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * SmoothScrollProvider — wires Lenis smooth scroll into the GSAP ticker.
 * This is the canonical pattern: ScrollTrigger.update() runs each Lenis frame
 * so all GSAP scroll-bound animations stay in sync with the smoothed scroll.
 *
 * Respects prefers-reduced-motion (disables Lenis entirely).
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      // touch: false by default — keeps mobile native scroll snappy
    });

    // Drive Lenis from the GSAP ticker so ScrollTrigger stays in sync
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Tell ScrollTrigger to recompute on each Lenis scroll event
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

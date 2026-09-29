"use client";

import { useRef, useCallback } from "react";
import { gsap } from "gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Magnetic strength: 0 (no pull) → 1 (follows cursor fully). Default 0.35 */
  strength?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * MagneticButton — CTA whose bounding box subtly follows the cursor when the
 * cursor is near. Pure visual magnet; the click target stays put.
 *
 * Used later on demo-specific CTAs (Hero CTAs, "Get started", etc.).
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power3.out",
      });
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  }, []);

  return (
    <button
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}

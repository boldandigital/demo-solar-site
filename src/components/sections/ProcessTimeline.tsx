"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ProcessTimeline — sticky numbered timeline for /how-it-works.
 *
 * Pattern: a vertical timeline rail stays pinned in the viewport while the
 * user scrolls; each step reveals one at a time as its scrollTrigger
 * crosses the center line.
 *
 * Steps are read from `process.steps[]` in the locale messages:
 *   [{ number, title, body, duration }, ...]
 */
export function ProcessTimeline() {
  const t = useTranslations("howItWorks");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Pin the rail column so the timeline stays visible
      const rail = root.current?.querySelector("[data-rail]");
      if (rail) {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top+=80",
          end: "bottom bottom-=80",
          pin: rail,
          pinSpacing: false,
        });
      }

      // Each step fades + slides in
      const steps = gsap.utils.toArray<HTMLElement>("[data-process-step]");
      steps.forEach((step) => {
        gsap.from(step, {
          opacity: 0,
          x: 40,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 75%",
            once: true,
          },
        });
        // Animate the rail dot color as we pass it
        const dot = step.querySelector("[data-step-dot]") as HTMLElement | null;
        if (dot) {
          gsap.fromTo(
            dot,
            { backgroundColor: "var(--border)", scale: 1 },
            {
              backgroundColor: "var(--brand-green)",
              scale: 1.4,
              duration: 0.4,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: step,
                start: "top 70%",
                once: true,
              },
              delay: 0.2,
            }
          );
        }
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Pull steps as an array from i18n
  const stepKeys = ["01", "02", "03", "04", "05", "06"];
  const steps = stepKeys.map((n) => ({
    number: t(`steps.${n}.number`),
    eyebrow: t(`steps.${n}.eyebrow`),
    title: t(`steps.${n}.title`),
    body: t(`steps.${n}.body`),
    duration: t(`steps.${n}.duration`),
  }));

  return (
    <section
      ref={root}
      className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mb-16 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {t("lede")}
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
        {/* Sticky rail */}
        <div data-rail className="hidden md:block">
          <div className="sticky top-32">
            <div className="relative pl-8">
              <div
                className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-border"
                aria-hidden
              />
              <ul className="space-y-12">
                {steps.map((step, i) => (
                  <li key={i} className="relative flex items-center gap-3">
                    <span
                      data-step-dot
                      className="absolute -left-7 h-4 w-4 rounded-full border-2 border-surface"
                      style={{ backgroundColor: "var(--border)" }}
                      aria-hidden
                    />
                    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {step.number}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-16">
          {steps.map((step, i) => (
            <li
              key={i}
              data-process-step
              className="relative rounded-2xl border border-border bg-surface p-8 shadow-sm"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-brand-green">
                {step.number} · {step.eyebrow}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-green/10 px-3 py-1.5 text-xs font-medium text-brand-green">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {step.duration}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

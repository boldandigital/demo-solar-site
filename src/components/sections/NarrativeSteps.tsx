"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * NarrativeSteps — sticky chapter board that advances through 4 steps as
 * the user scrolls. Each step swaps into view with a soft fade + slide.
 *
 * Steps are read from `home.narrative` in the locale messages:
 *   design | finance | install | save
 *
 * Each entry has: number, title, body, stat, statLabel.
 */
export function NarrativeSteps() {
  const t = useTranslations("home.narrative");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-step-card]");
      cards.forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            once: true,
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const steps = [
    { key: "design", accent: "var(--brand-green)" },
    { key: "finance", accent: "var(--brand-lime)" },
    { key: "install", accent: "var(--brand-sun)" },
    { key: "save", accent: "var(--brand-green-dark)" },
  ] as const;

  return (
    <section ref={root} className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
          {t("sectionEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("sectionHeading")}
        </h2>
      </div>

      <ol className="grid gap-6 md:grid-cols-2">
        {steps.map((step, i) => (
          <li
            key={step.key}
            data-step-card
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm transition-shadow hover:shadow-md"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
              style={{ background: step.accent }}
              aria-hidden
            />
            <div className="relative flex items-start gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
                style={{ background: step.accent }}
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {t(`${step.key}.eyebrow`)}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {t(`${step.key}.body`)}
                </p>
                <div className="mt-6 flex items-baseline gap-2 border-t border-border pt-4">
                  <span
                    className="text-3xl font-semibold tabular-nums"
                    style={{ color: step.accent }}
                  >
                    {t(`${step.key}.stat`)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t(`${step.key}.statLabel`)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

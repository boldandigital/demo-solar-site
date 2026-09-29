"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Locale = "en" | "nl" | "pt-BR";

type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
};

type Props = {
  /** Anchor id forwarded to the wrapper element (default "hero"). */
  sectionId?: string;
  /** Locale used for fallbacks / aria labels. Optional — `useTranslations`
   *  reads the active NextIntl context automatically. */
  locale?: Locale;
};

/* ─── useMediaQuery ──────────────────────────────────────────────────────────
 * Tiny hook so we can render a static poster on mobile (<1024px) and skip
 * loading the MP4 source entirely. Keeping the hero light on mobile is the
 * single biggest LCP win for this page.
 *
 * Built on useSyncExternalStore — the React 18+ canonical pattern for
 * subscribing to external mutable sources. Server snapshot returns `false`
 * so the initial server render and first client render match (no hydration
 * warning); on the client we immediately re-subscribe to the live matchMedia.
 * ────────────────────────────────────────────────────────────────────────────*/
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => undefined;
      const mql = window.matchMedia(query);
      const handler = () => callback();
      if (mql.addEventListener) {
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
      }
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false
  );
}

/**
 * SolarHero — scroll-scrubbed video hero (Option A).
 *
 * Desktop (≥1024px): the user scrolls the page and a pinned `<video>` element's
 * `currentTime` is driven by ScrollTrigger progress, so the footage scrubs in
 * lockstep with scroll position. A 4-chapter overlay crossfades through the
 * chapters: Design (0–25%), Finance (25–50%), Install (50–75%), Save (75–100%).
 *
 * Mobile (<1024px) / reduced-motion: render the static poster image only —
 * the MP4 is never loaded, so LCP stays cheap.
 *
 * The MP4 is encoded with one keyframe per frame (`-g 1 -bf 0` in ffmpeg, see
 * scripts/prepare-hero-video.sh) so the browser can seek instantly without
 * re-buffering. That's what makes scroll-scrub feel frame-accurate instead of
 * stuttery.
 */
export default function SolarHero({ sectionId = "hero" }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const lastChapterRef = useRef<number>(-1);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Read the 4 chapter blocks from messages via t.raw so we don't have to
  // hand-write 12 strings in code. next-intl returns the array verbatim.
  const t = useTranslations("home.hero");
  const chapters = t.raw("chapters") as Chapter[];

  // ── Reduced motion: just show the poster + chapter 0, no scroll binding ──
  if (reducedMotion) {
    return (
      <section
        id={sectionId}
        ref={wrapperRef}
        className="relative h-[100svh] w-full overflow-hidden bg-solar-cells"
        aria-label="Solaria Brasil hero"
      >
        <Image
          src="/hero/solar-install-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-6 sm:p-10">
          <div className="max-w-md rounded-2xl border border-white/20 bg-background/85 p-6 shadow-lg backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
              {chapters[0]?.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {chapters[0]?.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {chapters[0]?.body}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Mobile: poster only, no MP4 fetch, no ScrollTrigger pinning ──────────
  if (!isDesktop) {
    return (
      <section
        id={sectionId}
        ref={wrapperRef}
        className="relative h-[100svh] w-full overflow-hidden bg-solar-cells"
        aria-label="Solaria Brasil hero"
      >
        <Image
          src="/hero/solar-install-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </section>
    );
  }

  // ── Desktop: scroll-scrub + 4 chapter crossfade ──────────────────────────
  return (
    <DesktopScrubHero
      sectionId={sectionId}
      wrapperRef={wrapperRef}
      videoRef={videoRef}
      chaptersRef={chaptersRef}
      lastChapterRef={lastChapterRef}
      chapters={chapters}
    />
  );
}

/* ─── DesktopScrubHero ───────────────────────────────────────────────────────
 * Pulled into its own component so the conditional branches above don't all
 * share refs + effects with their siblings. The pattern is the same as the
 * other scroll-bound components in this codebase (SectionReveal,
 * NarrativeSteps): a gsap.context scoped to a ref, with ScrollTrigger
 * registered on the client only.
 * ────────────────────────────────────────────────────────────────────────────*/
function DesktopScrubHero({
  sectionId,
  wrapperRef,
  videoRef,
  chaptersRef,
  lastChapterRef,
  chapters,
}: {
  sectionId: string;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  chaptersRef: React.RefObject<HTMLDivElement | null>;
  lastChapterRef: React.MutableRefObject<number>;
  chapters: Chapter[];
}) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    const chaptersEl = chaptersRef.current;
    if (!wrapper || !video || !chaptersEl) return;

    const panels = Array.from(
      chaptersEl.querySelectorAll<HTMLDivElement>("[data-chapter-panel]")
    );

    // Force the video into a known frame so the very first paint is correct
    // even before ScrollTrigger ticks.
    if (video.readyState >= 1) {
      video.currentTime = 0;
    }

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          const v = videoRef.current;
          if (!v) return;
          const duration = v.duration;
          if (!Number.isFinite(duration) || duration <= 0) return;
          // Clamp at 95% so the final frames don't trigger the "ended" state
          // and stop playback on some browsers.
          const targetTime = Math.min(duration * 0.95, duration * self.progress);
          // Only assign if it actually changed — assigning the same value
          // every tick still triggers a costly seeking pipeline.
          if (Math.abs(v.currentTime - targetTime) > 0.01) {
            v.currentTime = targetTime;
          }

          // Chapter crossfade — each panel peaks in opacity when its slice
          // of progress is in the middle of its window.
          const progress = self.progress;
          const activeIndex = Math.min(
            chapters.length - 1,
            Math.max(0, Math.floor(progress * chapters.length))
          );
          if (activeIndex !== lastChapterRef.current) {
            lastChapterRef.current = activeIndex;
          }
          // Local progress inside the active chapter (0..1 across the slice)
          const localProgress = progress * chapters.length - activeIndex;
          panels.forEach((panel, i) => {
            const distance = Math.abs(i - (activeIndex + localProgress));
            // Bell curve: panel at the active slice peaks at 1, adjacent
            // panels fade toward 0 within ±1 chapter of distance.
            const opacity = Math.max(0, 1 - distance);
            panel.style.opacity = opacity.toFixed(3);
          });
        },
      });

      return () => {
        trigger.kill();
      };
    }, wrapper);

    return () => ctx.revert();
  }, [wrapperRef, videoRef, chaptersRef, lastChapterRef, chapters.length]);

  return (
    <section
      id={sectionId}
      ref={wrapperRef}
      className="relative h-[100svh] w-full overflow-hidden bg-solar-cells"
      aria-label="Solaria Brasil hero"
    >
      <video
        ref={videoRef}
        src="/hero/solar-install.mp4"
        poster="/hero/solar-install-poster.jpg"
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Chapter crossfade layer (top-right). Each panel is positioned in the
          same spot; opacity is driven by ScrollTrigger progress. */}
      <div
        ref={chaptersRef}
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-6 sm:p-10 lg:p-16"
      >
        {chapters.map((chapter, i) => (
          <div
            key={i}
            data-chapter-panel
            style={{ opacity: i === 0 ? 1 : 0 }}
            className="pointer-events-auto max-w-md rounded-2xl border border-white/20 bg-background/85 p-6 shadow-lg backdrop-blur-md transition-[opacity] duration-200 will-change-[opacity] sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
              {chapter.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {chapter.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {chapter.body}
            </p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              {String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {/* Subtle scroll hint at bottom of viewport */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 sm:text-xs">
          Scroll to scrub
        </p>
      </div>
    </section>
  );
}

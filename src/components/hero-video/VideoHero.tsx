"use client";

import { useRef, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  /** Path to the MP4 (relative to /public). */
  src?: string;
  /** Path to the poster image (shown while loading or for reduced motion). */
  poster?: string;
  /** Section ID to track scroll progress against. */
  sectionId?: string;
};

const reducedMQ =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeReduced(callback: () => void) {
  if (!reducedMQ) return () => {};
  reducedMQ.addEventListener("change", callback);
  return () => reducedMQ.removeEventListener("change", callback);
}
function getReducedSnapshot(): boolean {
  return reducedMQ?.matches ?? false;
}
function getReducedServerSnapshot(): boolean {
  return false;
}

/**
 * VideoHero — direct video scrub driven by scroll progress. No canvas, no
 * frames; the browser just seeks the video element. Requires the video to
 * have frequent keyframes (we run ffmpeg -g 1 on the source on Vercel).
 *
 * Falls back to poster image when:
 *  - prefers-reduced-motion: reduce
 *  - video cannot play (Safari iOS quirks on some mp4s)
 *  - bandwidthSave flag is set (mobile data-saver future)
 */
export function VideoHero({
  src = "/videos/solar-rooftop.mp4",
  poster = "/images/hero-poster.jpg",
  sectionId = "hero",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    getReducedSnapshot,
    getReducedServerSnapshot
  );
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onMeta = () => {
      setCanPlay(true);
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  useEffect(() => {
    if (reduced || !canPlay) return;
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    // Wait for metadata so we know duration
    const onMeta = () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      const trigger = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          // scrub at 70% of the section's scroll range so motion feels tied
          // to scroll without overshooting
          const target = Math.min(duration * 0.7, duration * self.progress);
          try {
            video.currentTime = target;
          } catch {
            /* Safari throws if not seekable yet */
          }
        },
      });
      return () => trigger.kill();
    };

    if (video.duration && isFinite(video.duration)) {
      const cleanup = onMeta();
      return cleanup;
    } else {
      video.addEventListener("loadedmetadata", onMeta, { once: true });
      return () => video.removeEventListener("loadedmetadata", onMeta);
    }
  }, [reduced, canPlay]);

  // Reduced-motion / not-yet-loaded fallback = static poster with sun overlay
  if (reduced) {
    return (
      <div
        ref={wrapRef}
        id={sectionId}
        className="relative h-[100svh] w-full overflow-hidden bg-solar-cells"
      >
        <Image
          src={poster}
          alt="Painéis solares instalados em telhado residencial"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="bg-sun-glow absolute inset-0" aria-hidden />
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      id={sectionId}
      className="relative h-[100svh] w-full overflow-hidden bg-solar-cells"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      {/* Soft sun-glow overlay — anchors panel on light bg */}
      <div className="bg-sun-glow absolute inset-0" aria-hidden />
      {/* Subtle vignette to keep copy legible on top */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"
        aria-hidden
      />
    </div>
  );
}

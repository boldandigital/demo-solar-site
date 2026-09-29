"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { VideoHero } from "@/components/hero-video/VideoHero";

const SolarScene = dynamic(
  () =>
    import("@/components/hero-3d/SolarScene").then((m) => m.SolarScene),
  { ssr: false }
);

// External store: prefers-reduced-motion + width < 1024px + WebGL.
// All three are platform-state lookups, so useSyncExternalStore is the
// React 19-clean way to read them.

type Snapshot = {
  reduced: boolean;
  narrow: boolean;
  webgl: boolean;
};

const DEFAULT_SSR: Snapshot = {
  reduced: false,
  narrow: false,
  webgl: false,
};

let cachedClientSnapshot: Snapshot | null = null;

const reducedMQ =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
const narrowMQ =
  typeof window !== "undefined"
    ? window.matchMedia("(max-width: 1023px)")
    : null;

function computeSnapshot(): Snapshot {
  if (!reducedMQ || !narrowMQ) return DEFAULT_SSR;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return {
    reduced: reducedMQ.matches,
    narrow: narrowMQ.matches,
    webgl,
  };
}

function subscribe(callback: () => void) {
  const invalidate = () => {
    cachedClientSnapshot = null;
    callback();
  };
  reducedMQ?.addEventListener("change", invalidate);
  narrowMQ?.addEventListener("change", invalidate);
  window.addEventListener("resize", invalidate);
  return () => {
    reducedMQ?.removeEventListener("change", invalidate);
    narrowMQ?.removeEventListener("change", invalidate);
    window.removeEventListener("resize", invalidate);
  };
}

function getSnapshot(): Snapshot {
  if (!cachedClientSnapshot) {
    cachedClientSnapshot = computeSnapshot();
  }
  return cachedClientSnapshot;
}

function getServerSnapshot(): Snapshot {
  return DEFAULT_SSR;
}

/**
 * HeroSelector — picks the best hero for the visitor's device.
 *
 * Rules (in order):
 *  1. prefers-reduced-motion: reduce → VideoHero (effectively static poster)
 *  2. width < 1024px (tablet + mobile) → VideoHero (lighter, no WebGL context)
 *  3. WebGL unavailable → VideoHero
 *  4. otherwise → SolarScene (R3F procedural panel grid, scroll-rotates 360°)
 *
 * On the server we always render VideoHero (default) so SSG stays clean.
 * Once mounted, useSyncExternalStore flips the snapshot if eligible.
 */
export function HeroSelector({ sectionId = "hero" }: { sectionId?: string }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const use3D = !snap.reduced && !snap.narrow && snap.webgl;

  if (!use3D) {
    return <VideoHero sectionId={sectionId} />;
  }

  return (
    <div
      id={sectionId}
      className="relative h-[100svh] w-full overflow-hidden bg-brand-gradient-radial"
    >
      <SolarScene />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25"
        aria-hidden
      />
      <div className="bg-sun-glow pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}

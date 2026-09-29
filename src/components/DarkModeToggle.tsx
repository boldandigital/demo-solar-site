"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "scroll-shared-theme";
const HTML = typeof document !== "undefined" ? document.documentElement : null;

/** Read the current dark-mode state from the live DOM. */
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  if (HTML) {
    observer.observe(HTML, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
  }
  // Also re-render when localStorage changes from another tab.
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  if (!HTML) return false;
  return (
    HTML.getAttribute("data-theme") === "dark" ||
    HTML.classList.contains("dark")
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * DarkModeToggle — flips BOTH the [data-theme="dark"] attr (our CSS scheme)
 * and the .dark class (shadcn's scheme), then persists in localStorage.
 *
 * Reads state via useSyncExternalStore so we never cause an SSR mismatch
 * or a cascading render.
 */
export function DarkModeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const html = document.documentElement;
    const next = !isDark;
    if (next) {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
    } else {
      html.removeAttribute("data-theme");
      html.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [isDark]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-foreground"
    >
      <span aria-hidden>{isDark ? "☀" : "☾"}</span>
    </button>
  );
}

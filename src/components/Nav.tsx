"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useState, useTransition } from "react";
import { DarkModeToggle } from "./DarkModeToggle";

/**
 * Nav — minimal top nav for Solaria Brasil.
 * Left: Solaria logo + brand mark. Center: route links.
 * Right: locale switcher (EN / NL / PT-BR) + dark mode toggle.
 *
 * Locale switcher preserves the current pathname so the user stays on the
 * same page after switching language.
 */
export function Nav() {
  const t = useTranslations("nav");
  const tl = useTranslations("locale");
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function switchLocale(locale: (typeof routing.locales)[number]) {
    startTransition(() => {
      router.replace(pathname, { locale });
      setOpen(false);
    });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient"
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Solaria<span className="text-brand-green">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("howItWorks")}
          </Link>
          <Link
            href="/calculator"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("calculator")}
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <div className="relative">
            <button
              type="button"
              aria-label={tl("switcher")}
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden>🌐</span>
              <span className="uppercase">{locale}</span>
              <span aria-hidden>▾</span>
            </button>
            {open && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
              >
                {routing.locales.map((loc) => (
                  <li key={loc}>
                    <button
                      type="button"
                      onClick={() => switchLocale(loc)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground hover:bg-brand-green/10"
                    >
                      <span>{tl(loc)}</span>
                      <span className="text-xs uppercase text-muted-foreground">{loc}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { useTranslations } from "next-intl";
import { Link, getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Footer — Solaria Brasil footer with brand mark, contact info,
 * locale switcher, and credits.
 *
 * Server component; uses next-intl's server-side translation.
 */
export function Footer() {
  const t = useTranslations("footer");
  const tl = useTranslations("locale");
  const nav = useTranslations("nav");

  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2">
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
              <p className="text-base font-semibold tracking-tight text-foreground">
                Solaria<span className="text-brand-green">.</span>
              </p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("navLabel")}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-foreground transition-colors hover:text-brand-green"
                >
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-foreground transition-colors hover:text-brand-green"
                >
                  {nav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-foreground transition-colors hover:text-brand-green"
                >
                  {nav("calculator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground transition-colors hover:text-brand-green"
                >
                  {nav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("contactLabel")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>contato@solaria.com.br</li>
              <li>+55 11 99999-9999</li>
              <li>{t("address")}</li>
            </ul>
          </div>

          {/* Locale */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("langLabel")}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {routing.locales.map((loc) => (
                <li key={loc}>
                  <Link
                    href={getPathname({ locale: loc, href: "/" })}
                    className="rounded-md border border-border px-2 py-1 text-xs uppercase text-muted-foreground transition-colors hover:border-brand-green hover:text-brand-green"
                    aria-label={tl(loc)}
                  >
                    {loc}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">{t("copyright")}</p>
          <p className="text-xs text-muted-foreground">{t("credits")}</p>
        </div>
      </div>
    </footer>
  );
}

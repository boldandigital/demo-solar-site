import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

/**
 * Footer — minimal footer with B&D mark + language switcher.
 * Server component; uses next-intl's server-side translation.
 */
export function Footer() {
  const t = useTranslations("footer");
  const tl = useTranslations("locale");

  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            {t("mark")}
          </p>
          <p className="mt-1 text-xs text-muted">{t("tagline")}</p>
        </div>

        <ul className="flex items-center gap-3">
          {routing.locales.map((loc) => (
            <li key={loc}>
              <Link
                href={getPathname({ locale: loc, href: "/" })}
                className="rounded-md border border-border px-2 py-1 text-xs uppercase text-muted transition-colors hover:text-foreground"
                aria-label={tl(loc)}
              >
                {loc}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

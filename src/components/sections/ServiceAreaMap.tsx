import { useTranslations } from "next-intl";

/**
 * ServiceAreaMap — static SVG map of Brazil with the 12 states where
 * Solaria Brasil currently installs. Pure SVG (no Leaflet, no external
 * runtime deps), lightweight, fully accessible, fully i18n via the
 * `contact.serviceArea` namespace.
 *
 * Layout: a stylized Brasil outline with state pins labelled. Each pin
 * is a small dot + city abbreviation. The SVG is hand-drawn with simple
 * path data — no actual geographic accuracy (this is a demo), but the
 * silhouette is recognizable.
 */
export function ServiceAreaMap() {
  const t = useTranslations("contact.serviceArea");

  const cities = [
    { id: "SP", x: 480, y: 410 },
    { id: "RJ", x: 520, y: 425 },
    { id: "MG", x: 490, y: 380 },
    { id: "BA", x: 530, y: 290 },
    { id: "PR", x: 450, y: 415 },
    { id: "RS", x: 430, y: 470 },
    { id: "SC", x: 450, y: 430 },
    { id: "PE", x: 555, y: 235 },
    { id: "CE", x: 540, y: 210 },
    { id: "GO", x: 450, y: 350 },
    { id: "DF", x: 460, y: 355 },
    { id: "ES", x: 525, y: 395 },
  ] as const;

  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {t("lede")}
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[3fr_2fr]">
          {/* Stylized Brasil outline */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <svg
              viewBox="0 0 640 600"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-full"
              role="img"
              aria-label={t("mapAriaLabel")}
            >
              {/* Brasil silhouette — simplified path */}
              <defs>
                <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-green)" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="var(--brand-green)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M 200 200
                   Q 220 170 270 165
                   Q 330 155 400 150
                   Q 460 145 510 155
                   Q 555 170 565 210
                   Q 575 250 555 290
                   Q 575 330 565 380
                   Q 555 420 525 455
                   Q 495 490 445 500
                   Q 395 510 345 495
                   Q 295 480 250 450
                   Q 215 425 200 380
                   Q 185 340 195 295
                   Q 190 245 200 200 Z"
                fill="url(#bg-grad)"
                stroke="var(--brand-green)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="transition-all"
              />

              {/* State pins */}
              {cities.map((c) => (
                <g key={c.id}>
                  {/* Pulse halo */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="14"
                    fill="var(--brand-green)"
                    opacity="0.15"
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="7"
                    fill="var(--brand-green)"
                    opacity="0.35"
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="3.5"
                    fill="var(--brand-green)"
                  />
                  <text
                    x={c.x + 9}
                    y={c.y + 4}
                    fontSize="11"
                    fontWeight="600"
                    fill="var(--foreground)"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {c.id}
                  </text>
                </g>
              ))}

              {/* North arrow */}
              <g transform="translate(580, 60)">
                <circle r="22" fill="var(--brand-green)" opacity="0.1" />
                <path
                  d="M 0 -12 L 6 8 L 0 4 L -6 8 Z"
                  fill="var(--brand-green)"
                />
                <text
                  x="0"
                  y="34"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="var(--muted-foreground)"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  N
                </text>
              </g>
            </svg>
          </div>

          {/* Coverage list */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-green">
              {t("coverageLabel")}
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cities.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-brand-green"
                    aria-hidden
                  />
                  {c.id}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">{t("footnote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
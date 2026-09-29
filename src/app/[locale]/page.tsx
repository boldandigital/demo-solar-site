import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SolarHero from "@/components/hero-video/solar-hero";
import { NarrativeSteps } from "@/components/sections/NarrativeSteps";
import { SavingsCalculator } from "@/components/sections/SavingsCalculator";
import { QuoteCTA } from "@/components/ui/QuoteCTA";
import { MagneticButton } from "@/components/MagneticButton";
import Image from "next/image";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const ctaT = await getTranslations("cta");

  return (
    <>
      {/* Hero — pinned visual layer + scroll-revealed copy overlay */}
      <div className="relative">
        <SolarHero sectionId="hero" locale={locale as "en" | "nl" | "pt-BR"} />

        {/* Copy overlay anchored bottom-left */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-16 sm:pb-24">
          <div className="pointer-events-auto mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl rounded-3xl border border-border/40 bg-background/85 p-6 backdrop-blur-md sm:p-10">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
                {t("heroEyebrow")}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuoteCTA
                  label={t("heroPrimaryCta")}
                  variant="primary"
                />
                <Link href="/how-it-works">
                  <MagneticButton
                    strength={0.2}
                    className="rounded-full border border-foreground/20 bg-background/0 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green"
                  >
                    {t("heroSecondaryCta")} →
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat strip — tabular numerals + brand accents */}
      <section className="border-y border-border bg-brand-gradient text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-10 text-center sm:py-12">
            <p className="text-4xl font-semibold tabular-nums sm:text-5xl">
              {t("stat1Value")}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] opacity-80">
              {t("stat1Label")}
            </p>
          </div>
          <div className="px-6 py-10 text-center sm:py-12">
            <p className="text-4xl font-semibold tabular-nums sm:text-5xl">
              {t("stat2Value")}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] opacity-80">
              {t("stat2Label")}
            </p>
          </div>
          <div className="px-6 py-10 text-center sm:py-12">
            <p className="text-4xl font-semibold tabular-nums sm:text-5xl">
              {t("stat3Value")}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] opacity-80">
              {t("stat3Label")}
            </p>
          </div>
        </div>
      </section>

      {/* 4-step narrative (Design / Finance / Install / Save) */}
      <NarrativeSteps />

      {/* Case studies — Stripe-style horizontal cards */}
      <section className="relative bg-muted py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
              {t("caseEyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("caseHeading")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(["silva", "oliveira", "souza"] as const).map((id) => (
              <article
                key={id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div
                  className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-gradient opacity-10 blur-2xl transition-opacity group-hover:opacity-30"
                  aria-hidden
                />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {t(`cases.${id}.city`)}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-brand-green">
                      {t(`cases.${id}.kwp`)}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {t(`cases.${id}.savings`)}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`cases.${id}.quote`)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Visual insert — installation photo */}
          <div className="mt-16 grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
                {ctaT("label")}
              </p>
              <p className="mt-3 text-base text-muted-foreground">
                {t("finalCtaBody")}
              </p>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl border border-border bg-solar-cells sm:h-80">
              <Image
                src="/images/process-install.jpg"
                alt="Equipe Solaria Brasil instala painéis solares em telhado residencial"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Inline calculator preview — drives deeper into the funnel */}
      <SavingsCalculator />

      {/* Final CTA band */}
      <section className="border-t border-border bg-foreground py-24 text-background sm:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {t("finalCtaTitle")}
          </h2>
          <p className="max-w-xl text-base opacity-80 sm:text-lg">
            {t("finalCtaBody")}
          </p>
          <QuoteCTA
            label={t("finalCtaButton")}
            variant="primary"
            className="bg-brand-green text-white hover:bg-brand-lime hover:text-foreground"
          />
        </div>
      </section>
    </>
  );
}

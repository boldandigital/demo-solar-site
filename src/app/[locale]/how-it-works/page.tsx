import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { QuoteCTA } from "@/components/ui/QuoteCTA";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howItWorks" });
  return {
    title: t("heading"),
    description: t("lede"),
  };
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("howItWorks");

  return (
    <>
      <section className="border-b border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {t("heading")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("lede")}
          </p>
        </div>
      </section>

      <ProcessTimeline />

      <section className="border-t border-border bg-brand-gradient py-24 text-white sm:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {t("ctaTitle")}
          </h2>
          <p className="max-w-xl text-base opacity-90 sm:text-lg">
            {t("ctaBody")}
          </p>
          <QuoteCTA
            label={t("ctaButton")}
            variant="primary"
            className="bg-white text-brand-green-dark hover:bg-brand-sun hover:text-foreground"
          />
        </div>
      </section>
    </>
  );
}

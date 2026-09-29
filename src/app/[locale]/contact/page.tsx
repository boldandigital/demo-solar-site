import { setRequestLocale, getTranslations } from "next-intl/server";
import { QuoteCTA } from "@/components/ui/QuoteCTA";
import { ContactForm } from "@/components/sections/ContactForm";
import { QuoteEstimator } from "@/components/sections/QuoteEstimator";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
            {t("title")}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("body")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteCTA label={t("whatsapp")} variant="primary" />
          </div>
        </div>
      </section>

      {/* Form + Address */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("formTitle")}
            </h2>
            <ContactForm />
          </div>

          <aside className="space-y-8">
            <div className="rounded-2xl border border-border bg-surface p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-brand-green">
                {t("addressTitle")}
              </p>
              <address className="mt-4 not-italic text-base leading-relaxed text-foreground">
                {t("addressLine1")}
                <br />
                {t("addressLine2")}
                <br />
                {t("addressLine3")}
              </address>
            </div>

            <div className="rounded-2xl bg-brand-gradient p-8 text-white">
              <p className="text-xs uppercase tracking-[0.25em] opacity-90">
                {t("title")}
              </p>
              <p className="mt-4 text-3xl font-semibold tabular-nums">
                15 min
              </p>
              <p className="mt-2 text-sm opacity-90">
                Resposta média no WhatsApp
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Quick quote estimator (mini-calculator) */}
      <QuoteEstimator />
    </>
  );
}

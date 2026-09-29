import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionReveal } from "@/components/SectionReveal";
import { MagneticButton } from "@/components/MagneticButton";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <SectionReveal>
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          scroll-shared · {locale}
        </p>
      </SectionReveal>

      <SectionReveal delay={0.1}>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          {t("hero")}
        </h1>
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
          {t("tagline")}
        </p>
      </SectionReveal>

      <SectionReveal delay={0.3}>
        <div className="mt-10">
          <MagneticButton
            className="rounded-full border border-foreground bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-transparent hover:text-foreground"
          >
            CTA placeholder
          </MagneticButton>
        </div>
      </SectionReveal>
    </section>
  );
}

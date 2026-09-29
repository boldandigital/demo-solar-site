import { setRequestLocale, getTranslations } from "next-intl/server";
import { SectionReveal } from "@/components/SectionReveal";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="mx-auto max-w-3xl px-6 py-32">
      <SectionReveal>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h1>
      </SectionReveal>
      <SectionReveal delay={0.15}>
        <p className="mt-6 text-base text-muted sm:text-lg">{t("body")}</p>
      </SectionReveal>
      <SectionReveal delay={0.3}>
        <p className="mt-10 text-sm text-muted">
          Floating WhatsApp button (bottom-right) is also a placeholder — tap to
          open a chat.
        </p>
      </SectionReveal>
    </section>
  );
}

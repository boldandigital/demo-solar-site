import { setRequestLocale, getTranslations } from "next-intl/server";
import { SavingsCalculator } from "@/components/sections/SavingsCalculator";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  return {
    title: t("heading"),
    description: t("lede"),
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SavingsCalculator />;
}

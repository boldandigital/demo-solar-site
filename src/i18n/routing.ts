import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl", "pt-BR"],
  defaultLocale: "pt-BR",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { QuoteCTA } from "@/components/ui/QuoteCTA";
import { STATES } from "@/lib/solar-math";

/**
 * ContactForm — captures lead intent and routes to WhatsApp with the form
 * payload pre-filled. No backend needed; the WhatsApp CTA is the actual
 * transport.
 *
 * The state <select> renders from the shared `STATES` list in
 * `lib/solar-math.ts` so it stays in sync with the calculator's list
 * (Brazilian state proper nouns are used unchanged across all 3 locales).
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bill: "",
    state: "SP",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = [
      `Olá! Quero orçamento para energia solar.`,
      ``,
      `*Nome:* ${form.name}`,
      `*WhatsApp:* ${form.phone}`,
      `*Conta de luz:* R$ ${form.bill}`,
      `*Estado:* ${form.state}`,
    ].join("\n");
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl border border-brand-green/40 bg-brand-green/5 p-8">
        <p className="text-base font-medium text-brand-green">
          ✓ {t("formSuccess")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="name"
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          {t("formName")}
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
        >
          {t("formPhone")}
        </label>
        <input
          id="phone"
          type="tel"
          required
          placeholder="(11) 99999-9999"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="bill"
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            {t("formBill")}
          </label>
          <input
            id="bill"
            type="number"
            inputMode="numeric"
            min={200}
            max={5000}
            step={50}
            value={form.bill}
            onChange={(e) => setForm({ ...form, bill: e.target.value })}
            className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            {t("formState")}
          </label>
          <select
            id="state"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          >
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <QuoteCTA
          label={t("formSubmit")}
          variant="primary"
          type="submit"
          className="w-full sm:w-auto"
        />
      </div>
    </form>
  );
}
"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuoteCTA } from "@/components/ui/QuoteCTA";
import { estimateQuick, STATES } from "@/lib/solar-math";

/**
 * QuoteEstimator — quick 2-input estimator for the contact page.
 * Lighter than the full calculator; lets prospects see a rough number
 * before filling in the form or opening WhatsApp.
 *
 * Math comes from `lib/solar-math.estimateQuick` — the task-brief formula
 * (`savings ≈ bill × 0.85`, `payback ≈ cost / (savings × 12)`).
 *
 * All user-facing strings live in next-intl under `contact.estimator`.
 * Tariff and currency rendering uses `Intl.NumberFormat(locale, …)`
 * so EN shows "0.92" and pt-BR/NL show "0,92".
 */
export function QuoteEstimator() {
  const t = useTranslations("contact");
  const tEst = useTranslations("contact.estimator");
  const locale = useLocale();
  const [bill, setBill] = useState(800);
  const [state, setState] = useState("SP");

  const estimate = useMemo(
    () => estimateQuick({ bill, stateId: state }),
    [bill, state]
  );

  // Locale-aware decimal formatter for tariff/price rendering.
  const decFmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Locale-aware integer-with-grouping formatter for currency (R$ prefix kept in source).
  const intFmt = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });

  // Slider endpoints rendered via Intl so EN shows "R$ 2,500" and
  // pt-BR/NL show their conventions.
  const sliderMin = decFmt.format(200);
  const sliderMax = decFmt.format(2500);

  const whatsappMessage = tEst("whatsappTemplate", {
    bill: decFmt.format(bill),
    kwp: estimate.kwp.toFixed(1),
    state: estimate.state.name,
  });

  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
          {tEst("eyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {tEst("heading")}
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_3fr]">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="quick-bill"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              >
                {tEst("billLabel")}
              </label>
              <input
                id="quick-bill"
                type="range"
                min={200}
                max={2500}
                step={50}
                value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-brand-green"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>R$ {sliderMin}</span>
                <span className="font-semibold text-foreground tabular-nums">
                  R$ {decFmt.format(bill)}
                </span>
                <span>R$ {sliderMax}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="quick-state"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              >
                {tEst("stateLabel")}
              </label>
              <select
                id="quick-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              >
                {STATES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {decFmt.format(s.tariff)}/kWh
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Output */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {tEst("systemLabel")}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {estimate.kwp.toFixed(1)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  kWp
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {tEst("savingsLabel")}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-green">
                R$ {intFmt.format(Math.round(estimate.monthlySavings))}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {tEst("investmentLabel")}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                R$ {intFmt.format(Math.round(estimate.cost))}
              </p>
            </div>

            <div className="sm:col-span-3">
              <QuoteCTA
                message={whatsappMessage}
                label={t("whatsapp")}
                variant="primary"
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
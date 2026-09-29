"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QuoteCTA } from "@/components/ui/QuoteCTA";
import {
  STATES,
  ROOF_TYPES,
  computeSavings,
  formatBRL,
  type RoofType,
} from "@/lib/solar-math";

/**
 * SavingsCalculator — interactive R$ estimate.
 *
 * Inputs:
 *   - monthly bill (R$)          slider, R$ 200 → R$ 2,500
 *   - state (UF)                  select (impacts tariff, sun-hours)
 *   - roof type                   radio (laje / cerâmico / metálico / fibrocimento)
 *
 * Outputs:
 *   - system size (kWp)
 *   - payback (years)
 *   - monthly savings (R$)
 *   - 25-year savings (R$, present value @ 6% discount)
 *
 * The actual financial model lives in `lib/solar-math.ts` (testable,
 * framework-free). This file is just the UI shell.
 *
 * Locale handling:
 *   - Roof-type labels come from next-intl (`calculator.roofTypes.<id>.label`)
 *     rather than `solar-math.ROOF_TYPES[].label`, keeping the data layer
 *     free of UI strings.
 *   - Tariff and slider-endpoint rendering uses `Intl.NumberFormat(locale, …)`
 *     so EN shows "0.92" and pt-BR/NL show "0,92".
 *   - WhatsApp message comes from `calculator.quoteMessage.template`
 *     with ICU placeholders for `{bill}`, `{state}`, `{kwp}`.
 */
export function SavingsCalculator() {
  const t = useTranslations("calculator");
  const tQuote = useTranslations("calculator.quoteMessage");
  const locale = useLocale();
  const [bill, setBill] = useState(800);
  const [stateId, setStateId] = useState("SP");
  const [roof, setRoof] = useState<RoofType>("ceramico");

  const result = useMemo(
    () => computeSavings({ bill, stateId, roof }),
    [bill, stateId, roof]
  );

  // Locale-aware decimal formatter — used for tariff + slider endpoints.
  const decFmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sliderMin = decFmt.format(200);
  const sliderMax = decFmt.format(2500);

  const whatsappMessage = tQuote("template", {
    bill: decFmt.format(bill),
    state: result.state.name,
    kwp: result.kwp.toFixed(1),
  });

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("heading")}
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {t("lede")}
        </p>
      </div>

      <div className="grid gap-8 rounded-3xl border border-border bg-surface p-8 shadow-sm md:grid-cols-[3fr_2fr] md:p-12">
        {/* Inputs */}
        <div className="space-y-8">
          {/* Monthly bill slider */}
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="bill"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              >
                {t("billLabel")}
              </label>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {formatBRL(bill)}
              </span>
            </div>
            <input
              id="bill"
              type="range"
              min={200}
              max={2500}
              step={50}
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--brand-green)]"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>R$ {sliderMin}</span>
              <span>R$ {sliderMax}</span>
            </div>
          </div>

          {/* State select */}
          <div>
            <label
              htmlFor="state"
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
            >
              {t("stateLabel")}
            </label>
            <select
              id="state"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              className="mt-3 h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground focus:border-[var(--brand-green)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]/30"
            >
              {STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {decFmt.format(s.tariff)}/kWh
                </option>
              ))}
            </select>
          </div>

          {/* Roof type radios */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("roofLabel")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ROOF_TYPES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoof(r.id)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                    roof === r.id
                      ? "border-[var(--brand-green)] bg-[var(--brand-green)]/10 text-[var(--brand-green)]"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {t(`roofTypes.${r.id}.label`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl bg-brand-gradient p-8 text-white">
          <p className="text-xs uppercase tracking-[0.25em] opacity-80">
            {t("outputEyebrow")}
          </p>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-3xl font-semibold tabular-nums">
                {result.kwp.toFixed(1)} <span className="text-base font-normal opacity-80">kWp</span>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                {t("outputSize")} · {result.panels} {t("panels")}
              </p>
            </div>
            <div className="border-t border-white/20 pt-5">
              <p className="text-3xl font-semibold tabular-nums">
                {formatBRL(result.monthlySavings)}
                <span className="text-base font-normal opacity-80">/{t("perMonth")}</span>
              </p>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                {t("outputSavings")}
              </p>
            </div>
            <div className="border-t border-white/20 pt-5">
              <p className="text-3xl font-semibold tabular-nums">
                {result.paybackYears} {t("years")}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                {t("outputPayback")}
              </p>
            </div>
            <div className="border-t border-white/20 pt-5">
              <p className="text-3xl font-semibold tabular-nums">
                {formatBRL(result.npv, 0)}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                {t("outputNPV")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="max-w-md text-xs text-muted-foreground">
          {t("disclaimer")}
        </p>
        <QuoteCTA
          message={whatsappMessage}
          label={t("quoteCta")}
        />
      </div>
    </section>
  );
}
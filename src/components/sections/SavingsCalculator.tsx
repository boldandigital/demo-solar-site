"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { QuoteCTA } from "@/components/ui/QuoteCTA";

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
 * Tariff averages are illustrative defaults — not real quotes. The CTA
 * routes to WhatsApp with a pre-filled payload so the venue can quote
 * accurately.
 *
 * Tariff factors per UF (R$/kWh, average residential 2025) are a rough
 * approximation — fine for a demo calculator, NOT a regulatory source.
 */
type State = {
  id: string;
  name: string;
  tariff: number; // R$/kWh
  sunHours: number; // h/day equivalent
};

const STATES: State[] = [
  { id: "SP", name: "São Paulo", tariff: 0.92, sunHours: 4.6 },
  { id: "RJ", name: "Rio de Janeiro", tariff: 1.05, sunHours: 4.5 },
  { id: "MG", name: "Minas Gerais", tariff: 0.88, sunHours: 5.0 },
  { id: "BA", name: "Bahia", tariff: 0.85, sunHours: 5.4 },
  { id: "PR", name: "Paraná", tariff: 0.89, sunHours: 4.7 },
  { id: "RS", name: "Rio Grande do Sul", tariff: 0.91, sunHours: 4.5 },
  { id: "SC", name: "Santa Catarina", tariff: 0.93, sunHours: 4.4 },
  { id: "PE", name: "Pernambuco", tariff: 0.87, sunHours: 5.3 },
  { id: "CE", name: "Ceará", tariff: 0.84, sunHours: 5.5 },
  { id: "GO", name: "Goiás", tariff: 0.86, sunHours: 5.2 },
  { id: "DF", name: "Distrito Federal", tariff: 0.83, sunHours: 5.3 },
  { id: "ES", name: "Espírito Santo", tariff: 0.9, sunHours: 4.8 },
];

const ROOF_TYPES = [
  { id: "laje", label: "Laje / Solo" },
  { id: "ceramico", label: "Telhado cerâmico" },
  { id: "metalico", label: "Telhado metálico" },
  { id: "fibrocimento", label: "Fibrocimento" },
] as const;

type RoofType = (typeof ROOF_TYPES)[number]["id"];

const ROOF_EFFICIENCY: Record<RoofType, number> = {
  laje: 1.0,
  ceramico: 0.95,
  metalico: 0.97,
  fibrocimento: 0.93,
};

const DISCOUNT_RATE = 0.06;
const PANEL_WATT = 550; // Wp per panel
const PANEL_PRICE_PER_Wp = 4.5; // R$/Wp installed

function formatBRL(value: number, max = 0): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

export function SavingsCalculator() {
  const t = useTranslations("calculator");
  const [bill, setBill] = useState(800);
  const [stateId, setStateId] = useState("SP");
  const [roof, setRoof] = useState<RoofType>("ceramico");

  const result = useMemo(() => {
    const st = STATES.find((s) => s.id === stateId) ?? STATES[0];
    const efficiency = ROOF_EFFICIENCY[roof];

    // kWh consumed per month from bill
    const kwhPerMonth = bill / st.tariff;
    // Required PV generation to offset (with 80% self-consumption typical)
    const selfConsumptionRate = 0.8;
    const requiredKwh = kwhPerMonth * selfConsumptionRate;
    // kWp needed (1 kWp ≈ STC sun-hours per day × 30 days × efficiency)
    const kwpNeeded =
      requiredKwh / (st.sunHours * 30 * efficiency);

    // System cost
    const cost = kwpNeeded * 1000 * PANEL_PRICE_PER_Wp;

    // Payback years (assuming 1% tariff inflation, 0.5% panel degradation)
    const annualGeneration = kwpNeeded * st.sunHours * 365 * 0.8;
    const yearOneRevenue = annualGeneration * st.tariff;
    const escalation = 1.01;
    const degradation = 0.995;
    let paybackYears = 0;
    let cumulative = 0;
    for (let y = 1; y <= 30; y++) {
      cumulative += yearOneRevenue * Math.pow(escalation, y - 1) * Math.pow(degradation, y - 1);
      if (cumulative >= cost) {
        paybackYears = y;
        break;
      }
    }
    if (paybackYears === 0) paybackYears = 30;

    // Monthly savings in year 1
    const monthlySavings = (yearOneRevenue / 12);

    // 25-year NPV
    let npv = -cost;
    for (let y = 1; y <= 25; y++) {
      npv +=
        (yearOneRevenue * Math.pow(escalation, y - 1) * Math.pow(degradation, y - 1)) /
        Math.pow(1 + DISCOUNT_RATE, y);
    }

    return {
      kwp: kwpNeeded,
      cost,
      paybackYears,
      monthlySavings,
      npv,
      panels: Math.ceil((kwpNeeded * 1000) / PANEL_WATT),
      state: st,
    };
  }, [bill, stateId, roof]);

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
              <span>R$ 200</span>
              <span>R$ 2.500</span>
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
                  {s.name} · {s.tariff.toFixed(2).replace(".", ",")}/kWh
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
                  {r.label}
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
          message={`Olá! Minha conta de luz é R$ ${bill} e moro em ${result.state.name}. Sistema estimado: ${result.kwp.toFixed(1)} kWp. Quero um orçamento preciso!`}
          label={t("quoteCta")}
        />
      </div>
    </section>
  );
}

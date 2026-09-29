"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { QuoteCTA } from "@/components/ui/QuoteCTA";

/**
 * QuoteEstimator — quick 2-input estimator for the contact page.
 * Lighter than the full calculator; lets prospects see a rough number
 * before filling in the form or opening WhatsApp.
 */
const STATES: Record<string, { name: string; tariff: number }> = {
  SP: { name: "São Paulo", tariff: 0.92 },
  RJ: { name: "Rio de Janeiro", tariff: 1.05 },
  MG: { name: "Minas Gerais", tariff: 0.88 },
  BA: { name: "Bahia", tariff: 0.85 },
  PR: { name: "Paraná", tariff: 0.89 },
};

export function QuoteEstimator() {
  const t = useTranslations("contact");
  const [bill, setBill] = useState(800);
  const [state, setState] = useState("SP");

  const estimate = useMemo(() => {
    const st = STATES[state] ?? STATES.SP;
    const kwh = bill / st.tariff;
    const kwp = (kwh * 0.8) / (4.8 * 30);
    const cost = kwp * 1000 * 4.5;
    const savings = bill * 0.85;
    return { kwp, cost, savings, state: st };
  }, [bill, state]);

  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-green">
          Estimativa rápida
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Quanto você vai economizar?
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_3fr]">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="quick-bill"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              >
                Conta de luz mensal
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
                <span>R$ 200</span>
                <span className="font-semibold text-foreground tabular-nums">
                  R$ {bill}
                </span>
                <span>R$ 2.500</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="quick-state"
                className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
              >
                Estado
              </label>
              <select
                id="quick-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              >
                {Object.entries(STATES).map(([id, s]) => (
                  <option key={id} value={id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Output */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Sistema
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
                Economia/mês
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-green">
                R${" "}
                {Math.round(estimate.savings).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Investimento
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                R${" "}
                {Math.round(estimate.cost).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="sm:col-span-3">
              <QuoteCTA
                message={`Olá! Estimativa rápida: conta R$ ${bill}, sistema ${estimate.kwp.toFixed(1)} kWp em ${estimate.state.name}. Quero orçamento detalhado!`}
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

/**
 * solar-math — pure, deterministic, no-React financial model for the
 * Solaria Brasil demo calculator.
 *
 * The formula in the task brief is intentionally simple:
 *   - monthlySavings ≈ bill * 0.85
 *   - paybackYears   ≈ systemCost / (monthlySavings * 12)
 *
 * We extend that with a few constants (panel watt, R$/Wp install cost,
 * a discount rate for NPV) so the same `computeSavings` entry point can
 * drive both the headline numbers and the 25-year NPV shown in the UI.
 *
 * Everything is pure: no DOM, no React, no I/O. Easy to unit-test.
 */

/** Tariff + sun-hours by state (UF). Illustrative averages for the demo. */
export type StateInfo = {
  id: string;
  name: string;
  tariff: number; // R$/kWh
  sunHours: number; // h/day equivalent
};

export const STATES: StateInfo[] = [
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

export type RoofType = "laje" | "ceramico" | "metalico" | "fibrocimento";

export const ROOF_TYPES: { id: RoofType }[] = [
  { id: "laje" },
  { id: "ceramico" },
  { id: "metalico" },
  { id: "fibrocimento" },
];

/** Mounting-efficiency multipliers per roof type. */
export const ROOF_EFFICIENCY: Record<RoofType, number> = {
  laje: 1.0,
  ceramico: 0.95,
  metalico: 0.97,
  fibrocimento: 0.93,
};

/** Demo constants — illustrative, NOT a regulatory source. */
export const SOLAR_CONSTANTS = {
  DISCOUNT_RATE: 0.06, // NPV discount rate
  PANEL_WATT: 550, // Wp per panel
  PANEL_PRICE_PER_Wp: 4.5, // R$/Wp installed
  SELF_CONSUMPTION: 0.8, // fraction of generation consumed on-site
  TARIFF_ESCALATION: 1.01, // 1% / year
  PANEL_DEGRADATION: 0.995, // 0.5% / year
  SIMPLE_SAVINGS_FACTOR: 0.85, // bill * 0.85 ≈ monthly savings (task brief)
} as const;

export type SavingsInput = {
  /** Monthly electricity bill, in BRL. */
  bill: number;
  /** UF — must match one of STATES[].id. */
  stateId: string;
  /** Roof type — defaults to "ceramico". */
  roof: RoofType;
};

export type SavingsResult = {
  /** System size in kWp. */
  kwp: number;
  /** Total installed system cost, in BRL. */
  cost: number;
  /** Estimated payback, in whole years (1–30). */
  paybackYears: number;
  /** Estimated monthly savings in year 1, in BRL. */
  monthlySavings: number;
  /** Estimated 25-year NPV, in BRL (discounted). */
  npv: number;
  /** Number of 550 Wp panels required. */
  panels: number;
  /** The resolved StateInfo for the input stateId. */
  state: StateInfo;
};

/**
 * Find a state by id; falls back to the first entry so the calculator
 * never returns NaN even if the locale list is out of sync.
 */
export function findState(stateId: string): StateInfo {
  return STATES.find((s) => s.id === stateId) ?? STATES[0];
}

/**
 * Compute solar savings for a given bill + state + roof.
 *
 * Strategy:
 *   1. Convert BRL bill → kWh consumed using the state tariff.
 *   2. Apply an 80% self-consumption factor — the typical fraction of
 *      generated energy that offsets consumption directly (the rest
 *      is credited at a lower rate by the utility).
 *   3. Translate kWh need → kWp required, given sun-hours and roof
 *      efficiency.
 *   4. Cost = kWp × 1000 × R$/Wp.
 *   5. Walk 30 years of generation (with 1% tariff escalation and 0.5%
 *      panel degradation) to find the payback year.
 *   6. Monthly savings in year 1 = (year-1 generation × tariff) / 12.
 *   7. 25-year NPV discounts each year's savings at DISCOUNT_RATE.
 */
export function computeSavings(input: SavingsInput): SavingsResult {
  const state = findState(input.stateId);
  const efficiency = ROOF_EFFICIENCY[input.roof];
  const {
    DISCOUNT_RATE,
    PANEL_WATT,
    PANEL_PRICE_PER_Wp,
    SELF_CONSUMPTION,
    TARIFF_ESCALATION,
    PANEL_DEGRADATION,
  } = SOLAR_CONSTANTS;

  const kwhPerMonth = input.bill / state.tariff;
  const requiredKwh = kwhPerMonth * SELF_CONSUMPTION;
  const kwpNeeded = requiredKwh / (state.sunHours * 30 * efficiency);
  const cost = kwpNeeded * 1000 * PANEL_PRICE_PER_Wp;

  const annualGeneration = kwpNeeded * state.sunHours * 365 * 0.8;
  const yearOneRevenue = annualGeneration * state.tariff;

  let paybackYears = 0;
  let cumulative = 0;
  for (let y = 1; y <= 30; y++) {
    cumulative +=
      yearOneRevenue *
      Math.pow(TARIFF_ESCALATION, y - 1) *
      Math.pow(PANEL_DEGRADATION, y - 1);
    if (cumulative >= cost) {
      paybackYears = y;
      break;
    }
  }
  if (paybackYears === 0) paybackYears = 30;

  const monthlySavings = yearOneRevenue / 12;

  let npv = -cost;
  for (let y = 1; y <= 25; y++) {
    npv +=
      (yearOneRevenue *
        Math.pow(TARIFF_ESCALATION, y - 1) *
        Math.pow(PANEL_DEGRADATION, y - 1)) /
      Math.pow(1 + DISCOUNT_RATE, y);
  }

  return {
    kwp: kwpNeeded,
    cost,
    paybackYears,
    monthlySavings,
    npv,
    panels: Math.ceil((kwpNeeded * 1000) / PANEL_WATT),
    state,
  };
}

/**
 * Lightweight 2-input estimator used by the contact-page QuoteEstimator.
 *
 * The task brief formula is intentionally simple:
 *   - savings ≈ bill * SIMPLE_SAVINGS_FACTOR
 *   - payback ≈ cost / (savings × 12)
 *
 * Returns the same shape as computeSavings minus NPV — enough for the
 * "quick estimate" widget on /contact.
 */
export function estimateQuick(input: {
  bill: number;
  stateId: string;
}): Omit<SavingsResult, "npv"> {
  const state = findState(input.stateId);
  const kwh = input.bill / state.tariff;
  const kwp = (kwh * 0.8) / (4.8 * 30);
  const cost = kwp * 1000 * SOLAR_CONSTANTS.PANEL_PRICE_PER_Wp;
  const savings = input.bill * SOLAR_CONSTANTS.SIMPLE_SAVINGS_FACTOR;
  return {
    kwp,
    cost,
    monthlySavings: savings,
    paybackYears: Math.max(
      1,
      Math.round(cost / (savings * 12) || SOLAR_CONSTANTS.SIMPLE_SAVINGS_FACTOR)
    ),
    panels: Math.ceil((kwp * 1000) / SOLAR_CONSTANTS.PANEL_WATT),
    state,
  };
}

/** Format a BRL value using the pt-BR locale. */
export function formatBRL(value: number, max = 0): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}
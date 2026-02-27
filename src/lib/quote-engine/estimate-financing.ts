// Estimates financing options (cash, loan, lease/PPA)
import type { FinancingOption, Range, IncentivesEstimate } from "@/types/quote";
import { FINANCING_DEFAULTS, getUtilityZone } from "./data/ontario-data";

export interface FinancingResult {
  options: FinancingOption[];
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

export function estimateFinancing(
  incentives: IncentivesEstimate,
  annualProductionKwh: Range,
  city: string,
): FinancingResult {
  const assumptions: FinancingResult["assumptions"] = [];
  const options: FinancingOption[] = [];

  const netCost = incentives.netCostAfterIncentives;
  const utilityZone = getUtilityZone(city);
  const ratePerKwh = utilityZone.blendedRateCentsPerKwh / 100;

  // 1. Cash Purchase
  options.push({
    type: "cash",
    label: "Cash Purchase",
    downPayment: netCost.base,
    monthlyPayment: { low: 0, base: 0, high: 0 },
    termYears: 0,
    totalCostOverTerm: netCost,
  });

  // 2. Solar Loan
  const loan = FINANCING_DEFAULTS.loan;
  const monthlyRate = loan.interestRate / 100 / 12;
  const numPayments = loan.termYears * 12;

  function calcMonthlyPayment(principal: number): number {
    if (monthlyRate === 0) return principal / numPayments;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const loanMonthly: Range = {
    low: Math.round(calcMonthlyPayment(netCost.low)),
    base: Math.round(calcMonthlyPayment(netCost.base)),
    high: Math.round(calcMonthlyPayment(netCost.high)),
  };

  options.push({
    type: "loan",
    label: "Solar Loan",
    downPayment: 0,
    monthlyPayment: loanMonthly,
    termYears: loan.termYears,
    interestRate: loan.interestRate,
    totalCostOverTerm: {
      low: loanMonthly.low * numPayments,
      base: loanMonthly.base * numPayments,
      high: loanMonthly.high * numPayments,
    },
  });

  // 3. Lease / PPA
  const ppa = FINANCING_DEFAULTS.leasePpa;
  // PPA rate = current utility rate minus discount
  const ppaRatePerKwh = ratePerKwh * (1 - ppa.discountFromRetail / 100);
  const monthlyPpaBase = Math.round(
    (annualProductionKwh.base / 12) * ppaRatePerKwh,
  );

  const ppaMonthly: Range = {
    low: Math.round(monthlyPpaBase * 0.9),
    base: monthlyPpaBase,
    high: Math.round(monthlyPpaBase * 1.1),
  };

  // Calculate total PPA cost with annual escalation
  function ppaTotalCost(startingMonthly: number): number {
    let total = 0;
    const annualEscalation = (ppa.escalationRate || 0) / 100;
    for (let year = 0; year < ppa.termYears; year++) {
      total += startingMonthly * 12 * Math.pow(1 + annualEscalation, year);
    }
    return Math.round(total);
  }

  options.push({
    type: "lease_ppa",
    label: "Lease / PPA",
    downPayment: 0,
    monthlyPayment: ppaMonthly,
    termYears: ppa.termYears,
    escalationRate: ppa.escalationRate,
    totalCostOverTerm: {
      low: ppaTotalCost(ppaMonthly.low),
      base: ppaTotalCost(ppaMonthly.base),
      high: ppaTotalCost(ppaMonthly.high),
    },
  });

  assumptions.push({
    key: "loan_terms",
    value: `${loan.termYears}yr @ ${loan.interestRate}%`,
    source: "Market average solar loan terms",
  });

  assumptions.push({
    key: "ppa_rate",
    value: `${(ppaRatePerKwh * 100).toFixed(1)}¢/kWh`,
    source: "Estimated PPA rate",
    note: `${ppa.discountFromRetail}% below current utility rate of ${utilityZone.blendedRateCentsPerKwh}¢/kWh`,
  });

  return { options, assumptions };
}

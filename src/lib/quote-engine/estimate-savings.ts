// Projects savings over time based on production, costs, and rate escalation
import type { SavingsEstimate, Range, ProductionEstimate } from "@/types/quote";
import { RATE_ESCALATION, getUtilityZone, getAllInVariableRate } from "./data/ontario-data";

export interface SavingsResult {
  savings: SavingsEstimate;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

export function estimateSavings(
  production: ProductionEstimate,
  netCost: Range,
  monthlyBill: number,
  city: string,
): SavingsResult {
  const assumptions: SavingsResult["assumptions"] = [];
  const utilityZone = getUtilityZone(city);
  // Use all-in variable rate (energy + delivery + regulatory) for savings
  // Solar self-consumption avoids the full pre-OER electricity cost
  const allInRate = getAllInVariableRate(utilityZone);
  // Add fixed charge offset: portion of monthly fixed charge effectively avoided per kWh
  const fixedChargeOffsetPerKwh = (utilityZone.monthlyFixedCharge * 0.3) / 800;
  // OER (Ontario Electricity Rebate) is NOT subtracted from savings — solar avoids the
  // full retail cost of electricity. OER is a temporary government subsidy that could change.
  // Only HST (13%) is applied. This matches industry-standard calculations (Texpowers/OpenSolar).
  const ratePerKwh = (allInRate + fixedChargeOffsetPerKwh) * 1.13;
  const escalation = RATE_ESCALATION.annualPercentIncrease / 100;

  // Annual savings = production × current rate
  function annualSavingsForYear(year: number, productionKwh: number): number {
    const degradedProduction =
      productionKwh * Math.pow(1 - 0.005, year - 1); // 0.5% degradation
    const escalatedRate = ratePerKwh * Math.pow(1 + escalation, year - 1);
    return degradedProduction * escalatedRate;
  }

  // Year 1
  const year1Base = annualSavingsForYear(1, production.annualProductionKwh.base);
  const year1Savings: Range = {
    low: Math.round(annualSavingsForYear(1, production.annualProductionKwh.low) * 0.9),
    base: Math.round(year1Base),
    high: Math.round(annualSavingsForYear(1, production.annualProductionKwh.high) * 1.05),
  };

  // Year 10
  const year10Savings: Range = {
    low: Math.round(annualSavingsForYear(10, production.annualProductionKwh.low) * 0.9),
    base: Math.round(annualSavingsForYear(10, production.annualProductionKwh.base)),
    high: Math.round(annualSavingsForYear(10, production.annualProductionKwh.high) * 1.05),
  };

  // Year 25
  const year25Savings: Range = {
    low: Math.round(annualSavingsForYear(25, production.annualProductionKwh.low) * 0.9),
    base: Math.round(annualSavingsForYear(25, production.annualProductionKwh.base)),
    high: Math.round(annualSavingsForYear(25, production.annualProductionKwh.high) * 1.05),
  };

  // Lifetime (25-year cumulative)
  let lifetimeLow = 0, lifetimeBase = 0, lifetimeHigh = 0;
  for (let y = 1; y <= 25; y++) {
    lifetimeLow += annualSavingsForYear(y, production.annualProductionKwh.low) * 0.9;
    lifetimeBase += annualSavingsForYear(y, production.annualProductionKwh.base);
    lifetimeHigh += annualSavingsForYear(y, production.annualProductionKwh.high) * 1.05;
  }

  const lifetimeSavings: Range = {
    low: Math.round(lifetimeLow),
    base: Math.round(lifetimeBase),
    high: Math.round(lifetimeHigh),
  };

  // Payback period (years to recoup net cost from cumulative savings)
  function calcPayback(annualProduction: number, cost: number): number {
    let cumulative = 0;
    for (let y = 1; y <= 30; y++) {
      cumulative += annualSavingsForYear(y, annualProduction);
      if (cumulative >= cost) return y;
    }
    return 30; // cap at 30 years
  }

  const paybackYears: Range = {
    low: calcPayback(production.annualProductionKwh.high, netCost.low),
    base: calcPayback(production.annualProductionKwh.base, netCost.base),
    high: calcPayback(production.annualProductionKwh.low, netCost.high),
  };

  // Monthly savings
  const monthlySavings: Range = {
    low: Math.round(year1Savings.low / 12),
    base: Math.round(year1Savings.base / 12),
    high: Math.round(year1Savings.high / 12),
  };

  // Projected monthly bill after solar
  const projectedMonthlyBill: Range = {
    low: Math.max(0, Math.round(monthlyBill - monthlySavings.high)),
    base: Math.max(0, Math.round(monthlyBill - monthlySavings.base)),
    high: Math.max(0, Math.round(monthlyBill - monthlySavings.low)),
  };

  assumptions.push({
    key: "electricity_rate",
    value: `${(ratePerKwh * 100).toFixed(1)}¢/kWh`,
    source: utilityZone.name,
    note: `All-in rate (energy ${utilityZone.blendedRateCentsPerKwh}¢ + delivery ${utilityZone.variableDeliveryRateCentsPerKwh}¢ + regulatory ${utilityZone.regulatoryChargesCentsPerKwh}¢ + fixed offset) × OER ${utilityZone.oerRebatePercent}% × HST 13%`,
  });

  assumptions.push({
    key: "rate_escalation",
    value: `${RATE_ESCALATION.annualPercentIncrease}%/year`,
    source: RATE_ESCALATION.source,
    note: "Historical Ontario average electricity rate increase",
  });

  return {
    savings: {
      monthlySavings,
      annualSavings: year1Savings,
      year1Savings,
      year10Savings,
      year25Savings,
      lifetimeSavings,
      paybackYears,
      currentMonthlyBill: monthlyBill,
      projectedMonthlyBill,
      electricityRateEscalation: RATE_ESCALATION.annualPercentIncrease,
    },
    assumptions,
  };
}

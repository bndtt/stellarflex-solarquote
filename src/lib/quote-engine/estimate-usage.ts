// Estimates monthly kWh usage from bill amount or validates direct kWh input
import type { QuoteInput, PropertyType } from "@/types/quote";
import { getUtilityZone, getAllInVariableRate } from "./data/ontario-data";

export interface UsageResult {
  monthlyKwh: number;
  annualKwh: number;
  inputMethod: string;
  confidence: number;            // 0-100 for input quality
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

// Seasonal factors for Ontario — summer has higher usage (AC), winter moderate (heat pump/gas)
const SEASONAL_FACTORS = [
  0.90, 0.88, 0.92, 0.95, 1.00, 1.08, // Jan-Jun
  1.15, 1.12, 1.02, 0.95, 0.92, 0.90, // Jul-Dec
];

export function estimateUsage(input: QuoteInput): UsageResult {
  const assumptions: UsageResult["assumptions"] = [];
  const utilityZone = getUtilityZone(input.city);

  // All-in variable rate: energy + delivery + regulatory ($/kWh)
  const allInVariableRate = getAllInVariableRate(utilityZone);
  const fixedCharge = utilityZone.monthlyFixedCharge;
  const oerFactor = 1 - utilityZone.oerRebatePercent / 100;

  let monthlyKwh: number;
  let confidence: number;
  let inputMethod: string;

  if (input.monthlyKwhExact && input.monthlyKwhExact > 0) {
    // Best case: user provided exact kWh
    monthlyKwh = input.monthlyKwhExact;
    confidence = 90;
    inputMethod = "exact_kwh";
    assumptions.push({
      key: "usage_source",
      value: "user_provided_kwh",
      source: "User input",
      note: `User provided ${monthlyKwh} kWh/month`,
    });
  } else if (input.monthlyBillExact && input.monthlyBillExact > 0) {
    // Good case: exact bill amount -> estimate kWh
    // Ontario bill structure: (fixedCharge + kWh * allInRate) * (1 - OER) * 1.13 HST
    // Reverse: kWh = (bill / 1.13 / (1 - OER) - fixedCharge) / allInRate
    const billPreOerPreHst = input.monthlyBillExact / 1.13 / oerFactor;
    const variablePortion = Math.max(0, billPreOerPreHst - fixedCharge);
    monthlyKwh = variablePortion / allInVariableRate;
    confidence = 70;
    inputMethod = "bill_exact";
    assumptions.push({
      key: "usage_source",
      value: "bill_to_kwh_conversion",
      source: "Bill amount conversion",
      note: `$${input.monthlyBillExact}/mo -> ~${Math.round(monthlyKwh)} kWh/mo (all-in rate: ${(allInVariableRate * 100).toFixed(1)}c/kWh, fixed: $${fixedCharge}, OER: ${utilityZone.oerRebatePercent}%)`,
    });
  } else {
    // Bill range — least precise
    const billEstimate = input.monthlyBillExact || 200;
    const billPreOerPreHst = billEstimate / 1.13 / oerFactor;
    const variablePortion = Math.max(0, billPreOerPreHst - fixedCharge);
    monthlyKwh = variablePortion / allInVariableRate;
    confidence = 45;
    inputMethod = "bill_range";
    assumptions.push({
      key: "usage_source",
      value: "bill_range_midpoint",
      source: "Bill range dropdown",
      note: `Range "${input.monthlyBillRange}" -> ~$${billEstimate}/mo -> ~${Math.round(monthlyKwh)} kWh/mo`,
    });
  }

  // Apply Ontario average sizing for property type if result seems unreasonable
  monthlyKwh = clampUsage(monthlyKwh, input.propertyType);

  // Calculate annual with seasonal variation
  const annualKwh = SEASONAL_FACTORS.reduce(
    (total, factor) => total + monthlyKwh * factor,
    0,
  );

  assumptions.push({
    key: "annual_kwh",
    value: Math.round(annualKwh),
    source: "Calculated from monthly with seasonal factors",
    note: `Monthly ${Math.round(monthlyKwh)} kWh x seasonal adjustment`,
  });

  return {
    monthlyKwh: Math.round(monthlyKwh),
    annualKwh: Math.round(annualKwh),
    inputMethod,
    confidence,
    assumptions,
  };
}

// Helper: reconstruct a monthly bill from kWh using utility zone data
export function kwhToMonthlyBill(monthlyKwh: number, city: string): number {
  const zone = getUtilityZone(city);
  const allInRate = getAllInVariableRate(zone);
  const oerFactor = 1 - zone.oerRebatePercent / 100;
  return Math.round((zone.monthlyFixedCharge + monthlyKwh * allInRate) * oerFactor * 1.13);
}

function clampUsage(monthlyKwh: number, propertyType: PropertyType): number {
  if (propertyType === "residential") {
    // Ontario residential average is ~750 kWh/month; clamp to reasonable range
    return Math.max(200, Math.min(monthlyKwh, 5000));
  } else {
    // Commercial can be much higher
    return Math.max(500, Math.min(monthlyKwh, 100000));
  }
}

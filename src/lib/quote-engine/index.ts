// ============================================
// StellarFlex Quote Engine — Main Orchestrator
// Generates a complete solar quote from user input
// ============================================

import type { QuoteInput, QuoteOutput, QuoteUiPayload, AssumptionEntry } from "@/types/quote";
import { normalizeQuoteInput } from "./normalize-input";
import { resolveLocation } from "./resolve-location";
import { resolveRooftop } from "./resolve-rooftop";
import { estimateUsage } from "./estimate-usage";
import { estimateSystem } from "./estimate-system";
import { estimateProduction } from "./estimate-production";
import { estimateCost } from "./estimate-cost";
import { estimateIncentives } from "./estimate-incentives";
import { estimateFinancing } from "./estimate-financing";
import { estimateSavings } from "./estimate-savings";
import { buildConfidence } from "./build-confidence";
import { estimateEnvironmentalImpact } from "./estimate-environmental";
import { mapQuoteOutputToUiPayload } from "./map-to-ui";
import { getRegionalSolarData, getUtilityZone, getAllInVariableRate } from "./data/ontario-data";

export const ENGINE_VERSION = "1.0.0";

export async function generateQuote(
  rawInput: Partial<QuoteInput>,
): Promise<QuoteOutput> {
  const allAssumptions: AssumptionEntry[] = [];
  const allDataSources: string[] = [];
  const allFallbacks: string[] = [];
  const allWarnings: string[] = [];

  // --- Step 1: Normalize Input ---
  const { input, warnings: inputWarnings } = normalizeQuoteInput(rawInput);
  allWarnings.push(...inputWarnings);

  // --- Step 2: Resolve Location ---
  const locationResult = resolveLocation(input.city, input.province || "ON");
  // Override with user-provided lat/lng from address autocomplete if available
  if (input.latitude && input.longitude) {
    locationResult.location.latitude = input.latitude;
    locationResult.location.longitude = input.longitude;
    allDataSources.push("User-provided coordinates (address autocomplete)");
  }
  allAssumptions.push(...locationResult.assumptions);
  allDataSources.push(...locationResult.dataSources);

  // --- Step 3: Resolve Rooftop (with fallback) ---
  const rooftopResult = await resolveRooftop(
    locationResult.location.latitude,
    locationResult.location.longitude,
    input.propertyType,
    input.roofArea,
    locationResult.location.annualIrradiance,
  );
  allAssumptions.push(...rooftopResult.assumptions);
  allDataSources.push(...rooftopResult.dataSources);
  if (rooftopResult.fallbackUsed) {
    allFallbacks.push("rooftop_regional_fallback");
    if (rooftopResult.fallbackReason) {
      allWarnings.push(rooftopResult.fallbackReason);
    }
    allWarnings.push(
      "Roof data is estimated from regional averages. A site survey will improve accuracy.",
    );
  }

  // --- Step 4: Estimate Usage ---
  const usageResult = estimateUsage(input);
  allAssumptions.push(...usageResult.assumptions);

  // --- Step 5: Estimate System Sizing ---
  const regionData = getRegionalSolarData(input.city);
  const systemResult = estimateSystem(
    usageResult.annualKwh,
    regionData.peakSunHoursDaily,
    rooftopResult.rooftop,
    input.propertyType,
  );
  allAssumptions.push(...systemResult.assumptions);

  // --- Step 6: Estimate Production ---
  const productionResult = estimateProduction(
    systemResult.system,
    rooftopResult.rooftop,
    regionData,
  );
  allAssumptions.push(...productionResult.assumptions);

  // --- Step 7: Estimate Cost ---
  const costResult = estimateCost(systemResult.system, input.propertyType);
  allAssumptions.push(...costResult.assumptions);

  // --- Step 8: Estimate Incentives ---
  const incentivesResult = estimateIncentives(
    input.propertyType,
    costResult.cost,
    productionResult.production,
    systemResult.system,
    input.city,
  );
  allAssumptions.push(...incentivesResult.assumptions);

  // --- Step 9: Estimate Financing ---
  const financingResult = estimateFinancing(
    incentivesResult.incentives,
    productionResult.production.annualProductionKwh,
    input.city,
  );
  allAssumptions.push(...financingResult.assumptions);

  // --- Step 10: Estimate Savings ---
  // Determine monthly bill for savings calculation
  const utilityZone = getUtilityZone(input.city);
  const allInRate = getAllInVariableRate(utilityZone);
  let monthlyBill: number;
  if (input.monthlyBillExact && input.monthlyBillExact > 0) {
    monthlyBill = input.monthlyBillExact;
  } else if (input.monthlyKwhExact && input.monthlyKwhExact > 0) {
    // Reconstruct bill: (fixedCharge + kWh * allInRate) * (1 - OER) * 1.13 HST
    const oerFactor = 1 - utilityZone.oerRebatePercent / 100;
    monthlyBill = Math.round(
      (utilityZone.monthlyFixedCharge + input.monthlyKwhExact * allInRate) * oerFactor * 1.13,
    );
  } else {
    monthlyBill = 200; // Ontario average fallback
  }
  const savingsResult = estimateSavings(
    productionResult.production,
    incentivesResult.incentives.netCostAfterIncentives,
    monthlyBill,
    input.city,
  );
  allAssumptions.push(...savingsResult.assumptions);

  // --- Step 11: Build Confidence ---
  const confidence = buildConfidence({
    rooftopSource: rooftopResult.rooftop.source,
    rooftopConfidence: rooftopResult.rooftop.confidence,
    inputMethod: input.electricityInputMethod,
    hasExactAddress: !!(input.address && input.city),
    propertyType: input.propertyType,
    fallbackUsed: rooftopResult.fallbackUsed,
  });

  // --- Step 12: Determine Quote Label ---
  let quoteLabel: QuoteOutput["quoteLabel"] = "full_estimate";
  if (rooftopResult.fallbackUsed && usageResult.inputMethod === "bill_range") {
    quoteLabel = "remote_estimate_only";
    allWarnings.push(
      "This is a remote estimate based on limited data. For a more accurate quote, provide your exact monthly kWh usage or schedule a site consultation.",
    );
  } else if (rooftopResult.fallbackUsed || usageResult.inputMethod !== "kwh_exact") {
    quoteLabel = "preliminary_estimate";
  }

  // --- Step 12b: Environmental Impact ---
  const environmentalImpact = estimateEnvironmentalImpact(productionResult.production);

  // --- Step 13: Assemble Output ---
  const quoteId = generateQuoteId();

  const output: QuoteOutput = {
    quoteId,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    propertyType: input.propertyType,
    quoteLabel,

    location: locationResult.location,
    rooftop: rooftopResult.rooftop,
    system: systemResult.system,
    production: productionResult.production,
    cost: costResult.cost,
    incentives: incentivesResult.incentives,
    financing: financingResult.options,
    savings: savingsResult.savings,
    environmentalImpact,

    confidence,
    assumptionsUsed: allAssumptions,
    dataSourcesUsed: [...new Set(allDataSources)],
    fallbackModesUsed: allFallbacks,
    warnings: allWarnings,

    input,
  };

  return output;
}

// Re-export the UI mapper for convenience
export { mapQuoteOutputToUiPayload };
export type { QuoteUiPayload };

function generateQuoteId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SFQ-${timestamp}-${random}`;
}

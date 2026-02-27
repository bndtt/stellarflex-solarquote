// Maps full QuoteOutput to simplified UI payload for backward compatibility
import type { QuoteOutput, QuoteUiPayload } from "@/types/quote";

export function mapQuoteOutputToUiPayload(output: QuoteOutput): QuoteUiPayload {
  return {
    propertyType: output.propertyType,
    quoteLabel: formatQuoteLabel(output.quoteLabel),

    // Primary scalar values (base) for simple display
    systemSizeKw: output.system.systemSizeKw.base,
    annualProductionKwh: output.production.annualProductionKwh.base,
    totalInstalledCost: output.cost.totalInstalledCost.base,
    totalIncentives: output.incentives.totalIncentives.base,
    netCost: output.incentives.netCostAfterIncentives.base,
    monthlySavings: output.savings.monthlySavings.base,
    annualSavings: output.savings.annualSavings.base,
    paybackYears: output.savings.paybackYears.base,

    // Ranges for enhanced display
    ranges: {
      systemSizeKw: output.system.systemSizeKw,
      annualProductionKwh: output.production.annualProductionKwh,
      totalInstalledCost: output.cost.totalInstalledCost,
      totalIncentives: output.incentives.totalIncentives,
      netCost: output.incentives.netCostAfterIncentives,
      monthlySavings: output.savings.monthlySavings,
      annualSavings: output.savings.annualSavings,
      paybackYears: output.savings.paybackYears,
    },

    // Confidence
    overallConfidence: output.confidence.overallQuoteConfidence,
    confidenceBreakdown: output.confidence,

    // Financing
    financing: output.financing,

    // Environmental impact
    environmentalImpact: output.environmentalImpact,

    // Warnings
    warnings: output.warnings,
    isRemoteEstimate: output.quoteLabel === "remote_estimate_only",
  };
}

function formatQuoteLabel(label: string): string {
  switch (label) {
    case "full_estimate":
      return "Full Estimate";
    case "preliminary_estimate":
      return "Preliminary Estimate";
    case "remote_estimate_only":
      return "Remote Estimate";
    default:
      return "Estimate";
  }
}

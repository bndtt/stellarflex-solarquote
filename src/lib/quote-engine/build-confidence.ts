// Builds confidence breakdown based on data quality signals
import type { ConfidenceBreakdown, RooftopData, ElectricityInputMethod } from "@/types/quote";

export interface ConfidenceInputs {
  rooftopSource: RooftopData["source"];
  rooftopConfidence: number;
  inputMethod: ElectricityInputMethod;
  hasExactAddress: boolean;
  propertyType: "residential" | "commercial";
  fallbackUsed: boolean;
}

export function buildConfidence(inputs: ConfidenceInputs): ConfidenceBreakdown {
  // --- Roof Geometry Confidence ---
  let roofGeometryConfidence: number;
  switch (inputs.rooftopSource) {
    case "google_solar":
      roofGeometryConfidence = 85;
      break;
    case "manual_input":
      roofGeometryConfidence = 60;
      break;
    case "regional_fallback":
    default:
      roofGeometryConfidence = inputs.propertyType === "commercial" ? 25 : 30;
      break;
  }
  // Blend with actual rooftop confidence score (varies by data quality)
  roofGeometryConfidence = Math.round((roofGeometryConfidence + inputs.rooftopConfidence) / 2);

  // --- Shading Confidence ---
  let shadingConfidence: number;
  switch (inputs.rooftopSource) {
    case "google_solar":
      shadingConfidence = 80;
      break;
    case "manual_input":
      shadingConfidence = 40;
      break;
    case "regional_fallback":
    default:
      shadingConfidence = 20;
      break;
  }

  // --- Tariff Confidence ---
  // Ontario TOU rates are publicly regulated, so fairly reliable
  let tariffConfidence = 80;
  if (!inputs.hasExactAddress) {
    tariffConfidence = 65; // might be wrong utility zone
  }
  if (inputs.propertyType === "commercial") {
    tariffConfidence -= 15; // commercial rates more variable (demand charges, etc.)
  }

  // --- Incentives Confidence ---
  let incentivesConfidence = 70;
  if (inputs.propertyType === "commercial") {
    incentivesConfidence = 60; // CCA deduction depends on business specifics
  }

  // --- Input Quality Confidence ---
  let inputQualityConfidence: number;
  switch (inputs.inputMethod) {
    case "kwh_exact":
      inputQualityConfidence = 90;
      break;
    case "bill_exact":
      inputQualityConfidence = 70;
      break;
    case "bill_range":
    default:
      inputQualityConfidence = 40;
      break;
  }
  if (!inputs.hasExactAddress) {
    inputQualityConfidence -= 15;
  }

  // --- Overall Confidence ---
  // Weighted average — roof and input quality matter most
  const weights = {
    roof: 0.25,
    shading: 0.15,
    tariff: 0.15,
    incentives: 0.15,
    input: 0.30,
  };

  const overallQuoteConfidence = Math.round(
    roofGeometryConfidence * weights.roof +
    shadingConfidence * weights.shading +
    tariffConfidence * weights.tariff +
    incentivesConfidence * weights.incentives +
    inputQualityConfidence * weights.input,
  );

  return {
    roofGeometryConfidence,
    shadingConfidence,
    tariffConfidence,
    incentivesConfidence,
    inputQualityConfidence,
    overallQuoteConfidence,
  };
}

// Returns human-readable label for confidence level
export function getConfidenceLabel(score: number): string {
  if (score >= 80) return "High confidence";
  if (score >= 60) return "Moderate confidence";
  if (score >= 40) return "Low confidence";
  return "Very low confidence — site survey recommended";
}

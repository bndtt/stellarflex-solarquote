// Estimates annual and monthly solar production
import type { ProductionEstimate, Range, RooftopData, SystemSizing } from "@/types/quote";
import { EQUIPMENT } from "./data/ontario-data";
import type { RegionalSolarData } from "./data/ontario-data";

export interface ProductionResult {
  production: ProductionEstimate;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

export function estimateProduction(
  system: SystemSizing,
  rooftop: RooftopData,
  regionData: RegionalSolarData,
): ProductionResult {
  const assumptions: ProductionResult["assumptions"] = [];

  // Orientation factor: penalizes non-south-facing or non-optimal pitch roofs
  const orientationFactor = calcOrientationFactor(rooftop.roofPitch, rooftop.roofAzimuth);

  const effectiveSunHours = regionData.peakSunHoursDaily * rooftop.shadingFactor * orientationFactor;
  // systemLossFactor (11%) covers wiring, soiling, snow, clipping — inverter applied separately
  const systemEfficiency = (1 - EQUIPMENT.systemLossFactor) * EQUIPMENT.inverterEfficiency;

  // Annual production = systemSize * effectiveSunHours * 365 * systemEfficiency
  // NRCan peak sun hours already include seasonal/winter variation — no separate winter derating
  function calcAnnual(sizeKw: number): number {
    return sizeKw * effectiveSunHours * 365 * systemEfficiency;
  }

  const annualProductionKwh: Range = {
    low: Math.round(calcAnnual(system.systemSizeKw.low) * 0.92),   // pessimistic
    base: Math.round(calcAnnual(system.systemSizeKw.base)),
    high: Math.round(calcAnnual(system.systemSizeKw.high) * 1.05), // optimistic
  };

  const monthlyProductionKwh: Range = {
    low: Math.round(annualProductionKwh.low / 12),
    base: Math.round(annualProductionKwh.base / 12),
    high: Math.round(annualProductionKwh.high / 12),
  };

  // Capacity factor = actual production / theoretical max
  const theoreticalMax = system.systemSizeKw.base * 8760; // kW × hours/year
  const capacityFactor = annualProductionKwh.base / theoreticalMax;

  // Year 1 and Year 25 with degradation
  const year1: Range = { ...annualProductionKwh };
  const degradationMultiplier25 = Math.pow(1 - EQUIPMENT.degradationRatePercent / 100, 24);
  const year25: Range = {
    low: Math.round(annualProductionKwh.low * degradationMultiplier25),
    base: Math.round(annualProductionKwh.base * degradationMultiplier25),
    high: Math.round(annualProductionKwh.high * degradationMultiplier25),
  };

  assumptions.push({
    key: "effective_sun_hours",
    value: effectiveSunHours.toFixed(2),
    source: "Regional data × shading factor",
    note: `${regionData.peakSunHoursDaily} hrs × ${rooftop.shadingFactor} shading = ${effectiveSunHours.toFixed(2)} hrs`,
  });

  assumptions.push({
    key: "system_losses",
    value: `${(EQUIPMENT.systemLossFactor * 100).toFixed(0)}% + ${((1 - EQUIPMENT.inverterEfficiency) * 100).toFixed(0)}% inverter`,
    source: "Industry standard",
    note: `${(EQUIPMENT.systemLossFactor * 100).toFixed(0)}% non-inverter losses (wiring, soiling, snow, clipping) + ${((1 - EQUIPMENT.inverterEfficiency) * 100).toFixed(0)}% inverter losses`,
  });

  if (orientationFactor < 1.0) {
    assumptions.push({
      key: "orientation_factor",
      value: orientationFactor.toFixed(2),
      source: "Roof pitch/azimuth adjustment",
      note: `Pitch: ${rooftop.roofPitch}°, Azimuth: ${rooftop.roofAzimuth}° (180° = south, optimal)`,
    });
  }

  assumptions.push({
    key: "degradation_rate",
    value: `${EQUIPMENT.degradationRatePercent}%/year`,
    source: "Manufacturer specification",
    note: `Year 25 production at ${(degradationMultiplier25 * 100).toFixed(1)}% of Year 1`,
  });

  return {
    production: {
      annualProductionKwh,
      monthlyProductionKwh,
      capacityFactor: Math.round(capacityFactor * 1000) / 1000,
      degradationRatePercent: EQUIPMENT.degradationRatePercent,
      year1ProductionKwh: year1,
      year25ProductionKwh: year25,
    },
    assumptions,
  };
}

// Calculates production penalty for non-optimal roof orientation
// South-facing (azimuth 180°) at ~30° pitch is optimal for Ontario latitude (~43-46°N)
function calcOrientationFactor(pitchDegrees: number, azimuthDegrees: number): number {
  // Azimuth penalty: 180° (south) = 1.0, 90°/270° (east/west) = ~0.82, 0° (north) = ~0.58
  const azimuthRad = ((azimuthDegrees - 180) * Math.PI) / 180;
  const azimuthFactor = 0.5 + 0.5 * Math.cos(azimuthRad);
  const normalizedAzimuth = Math.max(0.55, azimuthFactor);

  // Pitch penalty: optimal ~30° for Ontario. Flat (0°) or very steep (60°+) are suboptimal
  const pitchDeviation = Math.abs(pitchDegrees - 30);
  const pitchFactor = Math.max(0.85, 1 - 0.004 * pitchDeviation);

  return Math.max(0.55, Math.min(1.0, normalizedAzimuth * pitchFactor));
}

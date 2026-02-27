// Estimates system sizing based on usage, roof, and production capacity
import type { SystemSizing, Range, RooftopData, PropertyType } from "@/types/quote";
import { EQUIPMENT } from "./data/ontario-data";

export interface SystemResult {
  system: SystemSizing;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

export function estimateSystem(
  annualKwh: number,
  peakSunHoursDaily: number,
  rooftop: RooftopData,
  propertyType: PropertyType,
): SystemResult {
  const assumptions: SystemResult["assumptions"] = [];

  // Target: system should offset ~100% of annual usage
  // Formula: systemSize (kW) = annualKwh / (365 * peakSunHours * (1 - losses))
  const effectiveSunHours = peakSunHoursDaily * rooftop.shadingFactor;
  const systemEfficiency = 1 - EQUIPMENT.systemLossFactor;
  const annualProductionPerKw = 365 * effectiveSunHours * systemEfficiency;

  const idealSystemKw = annualKwh / annualProductionPerKw;

  // Constrain by available roof area
  const maxKwFromRoof =
    (rooftop.usableRoofArea / EQUIPMENT.panelAreaM2) * (EQUIPMENT.panelWattage / 1000);

  // Base system size — smaller of ideal and roof-constrained
  const baseKw = Math.min(idealSystemKw, maxKwFromRoof);

  // Clamp to reasonable ranges
  const minKw = propertyType === "residential" ? 3 : 10;
  const maxKw = propertyType === "residential" ? 20 : 500;
  const clampedBase = Math.max(minKw, Math.min(baseKw, maxKw));

  // Round to nearest 0.5 kW
  const roundedBase = Math.round(clampedBase * 2) / 2;

  // Build range
  const systemSizeKw: Range = {
    low: Math.max(minKw, roundedBase * 0.85),
    base: roundedBase,
    high: Math.min(maxKw, roundedBase * 1.15),
  };

  // Panel count
  const basePanels = Math.ceil((roundedBase * 1000) / EQUIPMENT.panelWattage);
  const panelCount: Range = {
    low: Math.ceil((systemSizeKw.low * 1000) / EQUIPMENT.panelWattage),
    base: basePanels,
    high: Math.ceil((systemSizeKw.high * 1000) / EQUIPMENT.panelWattage),
  };

  // Inverter sizing (DC:AC ratio)
  const inverterSizeKw: Range = {
    low: Math.round((systemSizeKw.low / EQUIPMENT.dcToAcRatio) * 10) / 10,
    base: Math.round((systemSizeKw.base / EQUIPMENT.dcToAcRatio) * 10) / 10,
    high: Math.round((systemSizeKw.high / EQUIPMENT.dcToAcRatio) * 10) / 10,
  };

  assumptions.push({
    key: "target_offset",
    value: "100%",
    source: "System sizing logic",
    note: "System sized to offset ~100% of annual consumption",
  });

  assumptions.push({
    key: "panel_wattage",
    value: EQUIPMENT.panelWattage,
    source: "Tier 1 panel specification",
    note: `${EQUIPMENT.panelWattage}W per panel (Canadian Solar / Longi / QCells)`,
  });

  if (baseKw > maxKwFromRoof) {
    assumptions.push({
      key: "roof_constrained",
      value: "yes",
      source: "Roof area limitation",
      note: `Ideal ${idealSystemKw.toFixed(1)} kW limited to ${maxKwFromRoof.toFixed(1)} kW by available roof area`,
    });
  }

  return {
    system: {
      systemSizeKw: roundRange(systemSizeKw),
      panelCount,
      panelWattage: EQUIPMENT.panelWattage,
      inverterSizeKw: roundRange(inverterSizeKw),
    },
    assumptions,
  };
}

function roundRange(r: Range): Range {
  return {
    low: Math.round(r.low * 10) / 10,
    base: Math.round(r.base * 10) / 10,
    high: Math.round(r.high * 10) / 10,
  };
}

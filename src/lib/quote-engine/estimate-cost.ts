// Estimates installed cost based on system size and property type
import type { CostEstimate, Range, SystemSizing, PropertyType } from "@/types/quote";
import { COST_DATA } from "./data/ontario-data";

export interface CostResult {
  cost: CostEstimate;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

// Smaller systems cost more per watt, larger systems cost less
// Calibrated against Texpowers: 7kW residential ≈ $2.03/W, 100kW commercial ≈ $1.80/W
function getSizeFactor(sizeKw: number, propertyType: PropertyType): number {
  if (propertyType === "residential") {
    // Flatter curve — 5 kW -> ~1.05x, 7 kW -> ~1.00x, 10 kW -> ~0.95x, 15 kW -> ~0.88x
    return Math.max(0.85, Math.min(1.10, 1.14 - sizeKw / 50));
  }
  // Commercial: 20 kW -> ~1.10x, 50 kW -> ~1.05x, 100 kW -> ~0.95x, 200 kW -> ~0.85x
  return Math.max(0.80, Math.min(1.15, 1.15 - sizeKw / 500));
}

export function estimateCost(
  system: SystemSizing,
  propertyType: PropertyType,
): CostResult {
  const assumptions: CostResult["assumptions"] = [];
  const costs = COST_DATA[propertyType];

  // Apply size-based scaling to $/W rates
  const baseSizeFactor = getSizeFactor(system.systemSizeKw.base, propertyType);
  const lowSizeFactor = getSizeFactor(system.systemSizeKw.low, propertyType);
  const highSizeFactor = getSizeFactor(system.systemSizeKw.high, propertyType);

  const scaledLow = Math.round(costs.costPerWattLow * lowSizeFactor * 100) / 100;
  const scaledBase = Math.round(costs.costPerWattBase * baseSizeFactor * 100) / 100;
  const scaledHigh = Math.round(costs.costPerWattHigh * highSizeFactor * 100) / 100;

  // $/W ranges (after size scaling)
  const installedCostPerWatt: Range = {
    low: scaledLow,
    base: scaledBase,
    high: scaledHigh,
  };

  // Total installed cost = system size (W) x $/W
  const totalInstalledCost: Range = {
    low: Math.round(system.systemSizeKw.low * 1000 * scaledLow),
    base: Math.round(system.systemSizeKw.base * 1000 * scaledBase),
    high: Math.round(system.systemSizeKw.high * 1000 * scaledHigh),
  };

  // Cost breakdown using base
  const baseTotal = totalInstalledCost.base;
  const equipmentCost: Range = {
    low: Math.round(totalInstalledCost.low * costs.equipmentPercent),
    base: Math.round(baseTotal * costs.equipmentPercent),
    high: Math.round(totalInstalledCost.high * costs.equipmentPercent),
  };

  const laborCost: Range = {
    low: Math.round(totalInstalledCost.low * costs.laborPercent),
    base: Math.round(baseTotal * costs.laborPercent),
    high: Math.round(totalInstalledCost.high * costs.laborPercent),
  };

  const permitAndInterconnection: Range = {
    low: Math.round(totalInstalledCost.low * costs.permitPercent),
    base: Math.round(baseTotal * costs.permitPercent),
    high: Math.round(totalInstalledCost.high * costs.permitPercent),
  };

  assumptions.push({
    key: "cost_per_watt",
    value: `$${scaledLow.toFixed(2)}-$${scaledHigh.toFixed(2)}/W`,
    source: "2026 Ontario solar market benchmarks",
    note: `${propertyType} pricing adjusted for ${system.systemSizeKw.base} kW system (base: $${scaledBase.toFixed(2)}/W, size factor: ${baseSizeFactor.toFixed(2)}x)`,
  });

  assumptions.push({
    key: "cost_includes",
    value: "equipment, labor, permits, overhead",
    source: "Turnkey installation estimate",
  });

  return {
    cost: {
      installedCostPerWatt,
      totalInstalledCost,
      equipmentCost,
      laborCost,
      permitAndInterconnection,
    },
    assumptions,
  };
}

// Calculates environmental impact of solar installation
import type { EnvironmentalImpact, ProductionEstimate } from "@/types/quote";
import { EQUIPMENT } from "./data/ontario-data";

// Ontario grid emission factor — kg CO2 per kWh
// Ontario's grid is ~94% non-emitting (nuclear + hydro), so emission factor is low
// but solar still displaces marginal gas generation during peak hours
// Source: Environment and Climate Change Canada, National Inventory Report
const ONTARIO_GRID_CO2_KG_PER_KWH = 0.03; // 30g CO2/kWh average

// Marginal emission factor — what solar actually displaces (peak gas plants)
// Solar produces during daytime when gas peakers run, so actual offset is higher
const MARGINAL_CO2_KG_PER_KWH = 0.40; // 400g CO2/kWh marginal (gas peakers)

// Use a blended factor: weighted toward marginal since solar displaces peak generation
const EFFECTIVE_CO2_KG_PER_KWH = 0.25; // blended: ~250g CO2/kWh displaced

// Equivalence factors (EPA and NRCan standard factors)
const KG_CO2_PER_TREE_PER_YEAR = 22;           // mature tree absorbs ~22 kg CO2/year
const KG_CO2_PER_CAR_PER_YEAR = 4_600;         // average Canadian car emits ~4,600 kg CO2/year
const KWH_PER_HOME_PER_YEAR = 9_500;           // average Ontario household uses ~9,500 kWh/year

export function estimateEnvironmentalImpact(
  production: ProductionEstimate,
): EnvironmentalImpact {
  const annualKwh = production.annualProductionKwh.base;
  const degradationRate = EQUIPMENT.degradationRatePercent / 100;

  // Annual CO2 offset (year 1)
  const annualCo2OffsetKg = Math.round(annualKwh * EFFECTIVE_CO2_KG_PER_KWH);

  // Lifetime (25 years) with degradation
  let lifetimeKwh = 0;
  for (let y = 1; y <= 25; y++) {
    lifetimeKwh += annualKwh * Math.pow(1 - degradationRate, y - 1);
  }
  const lifetimeCo2Kg = lifetimeKwh * EFFECTIVE_CO2_KG_PER_KWH;
  const lifetimeCo2OffsetTonnes = Math.round(lifetimeCo2Kg / 1000 * 10) / 10;

  // Equivalent trees planted (lifetime CO2 / annual absorption per tree)
  const equivalentTreesPlanted = Math.round(lifetimeCo2Kg / (KG_CO2_PER_TREE_PER_YEAR * 25));

  // Equivalent cars off road (lifetime CO2 / annual car emissions / 25 years)
  const equivalentCarsOffRoad = Math.round(lifetimeCo2Kg / KG_CO2_PER_CAR_PER_YEAR / 25 * 10) / 10;

  // Homes electrified per year
  const equivalentHomesElectrified = Math.round(annualKwh / KWH_PER_HOME_PER_YEAR * 10) / 10;

  // Total clean energy (MWh)
  const lifetimeCleanEnergyMwh = Math.round(lifetimeKwh / 1000);

  return {
    annualCo2OffsetKg,
    lifetimeCo2OffsetTonnes,
    equivalentTreesPlanted,
    equivalentCarsOffRoad,
    equivalentHomesElectrified,
    lifetimeCleanEnergyMwh,
  };
}

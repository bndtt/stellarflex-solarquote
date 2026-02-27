// Estimates available Ontario/Canada incentives with proper stacking order
// Commercial: IESO → CT ITC (on reduced cost) → CCA (on further reduced cost)
// Residential: HRSP vs Net Metering (mutually exclusive — picks better path)
import type { IncentivesEstimate, IncentiveItem, Range, PropertyType, CostEstimate, ProductionEstimate, SystemSizing } from "@/types/quote";
import { INCENTIVE_PROGRAMS, EQUIPMENT, getUtilityZone } from "./data/ontario-data";

export interface IncentivesResult {
  incentives: IncentivesEstimate;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
}

export function estimateIncentives(
  propertyType: PropertyType,
  cost: CostEstimate,
  production: ProductionEstimate,
  system: SystemSizing,
  city: string,
): IncentivesResult {
  const assumptions: IncentivesResult["assumptions"] = [];
  const items: IncentiveItem[] = [];

  const utilityZone = getUtilityZone(city);
  // Commodity rate only (energy charge, no delivery/regulatory) — used for net metering credits
  const commodityRatePerKwh = utilityZone.blendedRateCentsPerKwh / 100;

  if (propertyType === "commercial") {
    // --- COMMERCIAL STACKING: IESO → CT ITC → CCA ---
    const totalCostBase = cost.totalInstalledCost.base;
    const totalCostLow = cost.totalInstalledCost.low;
    const totalCostHigh = cost.totalInstalledCost.high;

    // 1. IESO Save on Energy Retrofit Program
    const ieso = INCENTIVE_PROGRAMS.iesoRetrofit;
    const systemSizeKwDc = system.systemSizeKw.base;
    const systemSizeKwAc = systemSizeKwDc / EQUIPMENT.dcToAcRatio;

    let iesoBase: number;
    if (systemSizeKwDc <= 10) {
      iesoBase = systemSizeKwDc * ieso.microGenPerKwDc;
    } else {
      iesoBase = systemSizeKwAc * ieso.smallMedPerKwAc;
    }
    // Cap at 50% of eligible project costs
    iesoBase = Math.min(iesoBase, totalCostBase * ieso.maxCoveragePercent);
    iesoBase = Math.round(iesoBase);

    // Low/high variants
    const systemAcLow = system.systemSizeKw.low / EQUIPMENT.dcToAcRatio;
    const systemAcHigh = system.systemSizeKw.high / EQUIPMENT.dcToAcRatio;
    let iesoLow = system.systemSizeKw.low <= 10
      ? system.systemSizeKw.low * ieso.microGenPerKwDc
      : systemAcLow * ieso.smallMedPerKwAc;
    iesoLow = Math.round(Math.min(iesoLow, totalCostLow * ieso.maxCoveragePercent));
    let iesoHigh = system.systemSizeKw.high <= 10
      ? system.systemSizeKw.high * ieso.microGenPerKwDc
      : systemAcHigh * ieso.smallMedPerKwAc;
    iesoHigh = Math.round(Math.min(iesoHigh, totalCostHigh * ieso.maxCoveragePercent));

    items.push({
      name: ieso.name,
      description: ieso.description,
      estimatedValue: { low: iesoLow, base: iesoBase, high: iesoHigh },
      type: ieso.type,
      confidence: ieso.confidence,
      source: ieso.source,
    });

    assumptions.push({
      key: "ieso_rebate",
      value: `$${iesoBase.toLocaleString()}`,
      source: ieso.source,
      note: systemSizeKwDc <= 10
        ? `$${ieso.microGenPerKwDc}/kW-DC × ${systemSizeKwDc.toFixed(1)} kW (micro gen), capped at 50% of project cost`
        : `$${ieso.smallMedPerKwAc}/kW-AC × ${systemSizeKwAc.toFixed(1)} kW-AC, capped at 50% of project cost`,
    });

    // 2. Clean Technology ITC — applied to (totalCost - IESO)
    const ctItc = INCENTIVE_PROGRAMS.cleanTechITC;
    const ctItcBaseAmount = Math.round((totalCostBase - iesoBase) * ctItc.creditRate);
    const ctItcLow = Math.round(Math.max(0, totalCostLow - iesoHigh) * ctItc.creditRate);
    const ctItcHigh = Math.round(Math.max(0, totalCostHigh - iesoLow) * ctItc.creditRate);

    items.push({
      name: ctItc.name,
      description: ctItc.description,
      estimatedValue: {
        low: Math.max(0, ctItcLow),
        base: Math.max(0, ctItcBaseAmount),
        high: Math.max(0, ctItcHigh),
      },
      type: ctItc.type,
      confidence: ctItc.confidence,
      source: ctItc.source,
    });

    assumptions.push({
      key: "ct_itc",
      value: `$${ctItcBaseAmount.toLocaleString()}`,
      source: ctItc.source,
      note: `30% of ($${totalCostBase.toLocaleString()} - $${iesoBase.toLocaleString()} IESO) = $${ctItcBaseAmount.toLocaleString()}`,
    });

    // 3. CCA Deduction — applied to (totalCost - IESO - CT ITC)
    const cca = INCENTIVE_PROGRAMS.ccaDeduction;
    const ccaBaseEligible = Math.max(0, totalCostBase - iesoBase - ctItcBaseAmount);
    const ccaTaxSavingsBase = Math.round(ccaBaseEligible * cca.deductionRate * cca.effectiveTaxRate);
    const ccaLowEligible = Math.max(0, totalCostLow - iesoHigh - ctItcHigh);
    const ccaHighEligible = Math.max(0, totalCostHigh - iesoLow - ctItcLow);
    const ccaTaxSavingsLow = Math.round(ccaLowEligible * cca.deductionRate * cca.effectiveTaxRate);
    const ccaTaxSavingsHigh = Math.round(ccaHighEligible * cca.deductionRate * cca.effectiveTaxRate);

    items.push({
      name: cca.name,
      description: cca.description,
      estimatedValue: {
        low: ccaTaxSavingsLow,
        base: ccaTaxSavingsBase,
        high: ccaTaxSavingsHigh,
      },
      type: cca.type,
      confidence: cca.confidence,
      source: cca.source,
    });

    assumptions.push({
      key: "cca_deduction",
      value: `~$${ccaTaxSavingsBase.toLocaleString()}`,
      source: cca.source,
      note: `100% first-year CCA on $${ccaBaseEligible.toLocaleString()} (cost − IESO − CT ITC) at ${(cca.effectiveTaxRate * 100).toFixed(1)}% tax rate`,
    });

  } else {
    // --- RESIDENTIAL: HRSP vs Net Metering (mutually exclusive) ---
    const hrsp = INCENTIVE_PROGRAMS.homeRenovationSavings;
    const nm = INCENTIVE_PROGRAMS.netMetering;

    // Path A: HRSP (upfront rebate, no net metering)
    const hrspRebateBase = Math.min(
      Math.round(system.systemSizeKw.base * hrsp.perKwRebate),
      hrsp.maxSolarRebate,
    );
    const hrspRebateLow = Math.min(
      Math.round(system.systemSizeKw.low * hrsp.perKwRebate),
      hrsp.maxSolarRebate,
    );
    const hrspRebateHigh = Math.min(
      Math.round(system.systemSizeKw.high * hrsp.perKwRebate),
      hrsp.maxSolarRebate,
    );

    // Path B: Net Metering (ongoing credits, no HRSP)
    const exportRatio = 1 - nm.selfConsumptionResidential; // ~30% exported
    const annualExportKwh = production.annualProductionKwh.base * exportRatio;
    const nmAnnualCreditBase = annualExportKwh * commodityRatePerKwh;
    const nmLifetimeBase = Math.round(nmAnnualCreditBase * 25);

    const nmAnnualCreditLow = production.annualProductionKwh.low * exportRatio * commodityRatePerKwh;
    const nmLifetimeLow = Math.round(nmAnnualCreditLow * 25 * 0.85);
    const nmAnnualCreditHigh = production.annualProductionKwh.high * exportRatio * commodityRatePerKwh;
    const nmLifetimeHigh = Math.round(nmAnnualCreditHigh * 25 * 1.1);

    // Compare: HRSP gives upfront savings, Net Metering gives lifetime value
    // HRSP is better if upfront rebate covers >1/3 of NM lifetime (present-value adjusted)
    const hrspBetter = hrspRebateBase > nmLifetimeBase / 3;

    if (hrspBetter) {
      items.push({
        name: hrsp.name,
        description: `${hrsp.description} Note: Requires battery storage installation.`,
        estimatedValue: { low: hrspRebateLow, base: hrspRebateBase, high: hrspRebateHigh },
        type: hrsp.type,
        confidence: hrsp.confidence,
        source: hrsp.source,
      });

      assumptions.push({
        key: "hrsp_rebate",
        value: `$${hrspRebateBase.toLocaleString()}`,
        source: hrsp.source,
        note: `$${hrsp.perKwRebate}/kW × ${system.systemSizeKw.base} kW (max $${hrsp.maxSolarRebate}). Requires battery. Excludes Net Metering.`,
      });
    } else {
      items.push({
        name: nm.name,
        description: nm.description,
        estimatedValue: { low: nmLifetimeLow, base: nmLifetimeBase, high: nmLifetimeHigh },
        type: "net_metering",
        confidence: nm.confidence,
        source: nm.source,
      });

      assumptions.push({
        key: "net_metering",
        value: `~$${Math.round(nmAnnualCreditBase).toLocaleString()}/yr`,
        source: nm.source,
        note: `${(exportRatio * 100).toFixed(0)}% exported × ${production.annualProductionKwh.base.toLocaleString()} kWh × ${(commodityRatePerKwh * 100).toFixed(1)}¢/kWh. 25-year lifetime: ~$${nmLifetimeBase.toLocaleString()}`,
      });
    }
  }

  // Calculate totals
  const totalIncentives: Range = {
    low: items.reduce((sum, i) => sum + i.estimatedValue.low, 0),
    base: items.reduce((sum, i) => sum + i.estimatedValue.base, 0),
    high: items.reduce((sum, i) => sum + i.estimatedValue.high, 0),
  };

  // For net cost, subtract direct/upfront incentives (not lifetime net metering)
  const directIncentiveLow = items
    .filter((i) => i.type !== "net_metering")
    .reduce((sum, i) => sum + i.estimatedValue.low, 0);
  const directIncentiveBase = items
    .filter((i) => i.type !== "net_metering")
    .reduce((sum, i) => sum + i.estimatedValue.base, 0);
  const directIncentiveHigh = items
    .filter((i) => i.type !== "net_metering")
    .reduce((sum, i) => sum + i.estimatedValue.high, 0);

  const netCostAfterIncentives: Range = {
    low: Math.max(0, cost.totalInstalledCost.low - directIncentiveHigh),
    base: Math.max(0, cost.totalInstalledCost.base - directIncentiveBase),
    high: Math.max(0, cost.totalInstalledCost.high - directIncentiveLow),
  };

  return {
    incentives: {
      items,
      totalIncentives,
      netCostAfterIncentives,
    },
    assumptions,
  };
}

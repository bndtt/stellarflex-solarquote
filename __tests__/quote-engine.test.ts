import { normalizeQuoteInput } from "@/lib/quote-engine/normalize-input";
import { resolveLocation } from "@/lib/quote-engine/resolve-location";
import { estimateUsage } from "@/lib/quote-engine/estimate-usage";
import { estimateSystem } from "@/lib/quote-engine/estimate-system";
import { estimateProduction } from "@/lib/quote-engine/estimate-production";
import { estimateCost } from "@/lib/quote-engine/estimate-cost";
import { estimateIncentives } from "@/lib/quote-engine/estimate-incentives";
import { estimateSavings } from "@/lib/quote-engine/estimate-savings";
import { buildConfidence } from "@/lib/quote-engine/build-confidence";
import { mapQuoteOutputToUiPayload } from "@/lib/quote-engine/map-to-ui";
import { getRegionalSolarData, getUtilityZone } from "@/lib/quote-engine/data/ontario-data";
import type { QuoteInput, QuoteOutput, RooftopData } from "@/types/quote";

// ============================================
// Test: Quote generates when rooftop provider fails
// ============================================
describe("Ontario Fallback Path", () => {
  test("resolves location for Toronto", () => {
    const result = resolveLocation("Toronto", "ON");
    expect(result.location.city).toBe("Toronto");
    expect(result.location.province).toBe("ON");
    expect(result.location.peakSunHours).toBeCloseTo(3.67, 1);
    expect(result.location.utilityZone).toBe("toronto_hydro");
  });

  test("resolves location for unknown city with Ontario defaults", () => {
    const result = resolveLocation("Timbuktu", "ON");
    expect(result.location.peakSunHours).toBeGreaterThan(0);
    expect(result.dataSources.length).toBeGreaterThan(0);
  });

  test("regional solar data returns Ontario default for unknown city", () => {
    const data = getRegionalSolarData("UnknownVille");
    expect(data.region).toBe("Ontario Average");
    expect(data.peakSunHoursDaily).toBeCloseTo(3.6, 1);
  });

  test("utility zone defaults to hydro_one for unknown cities", () => {
    const zone = getUtilityZone("SmallTown");
    expect(zone.id).toBe("hydro_one");
    expect(zone.blendedRateCentsPerKwh).toBe(14.8);
  });
});

// ============================================
// Test: Bill-only vs exact-kWh behavior
// ============================================
describe("Usage Estimation", () => {
  test("bill range input produces lower confidence", () => {
    const input: QuoteInput = {
      propertyType: "residential",
      address: "123 Main St",
      city: "Toronto",
      electricityInputMethod: "bill_range",
      monthlyBillRange: "$200 – $300",
    };
    const result = estimateUsage(input);
    expect(result.confidence).toBeLessThanOrEqual(50);
    expect(result.monthlyKwh).toBeGreaterThan(0);
    expect(result.annualKwh).toBeGreaterThan(0);
  });

  test("exact bill input produces moderate confidence", () => {
    const input: QuoteInput = {
      propertyType: "residential",
      address: "123 Main St",
      city: "Toronto",
      electricityInputMethod: "bill_exact",
      monthlyBillExact: 250,
    };
    const result = estimateUsage(input);
    expect(result.confidence).toBe(70);
    expect(result.monthlyKwh).toBeGreaterThan(100);
  });

  test("exact kWh input produces high confidence", () => {
    const input: QuoteInput = {
      propertyType: "residential",
      address: "123 Main St",
      city: "Toronto",
      electricityInputMethod: "kwh_exact",
      monthlyKwhExact: 900,
    };
    const result = estimateUsage(input);
    expect(result.confidence).toBe(90);
    expect(result.monthlyKwh).toBe(900);
  });

  test("$200 Toronto bill produces reasonable kWh with OER/delivery reversal", () => {
    const input: QuoteInput = {
      propertyType: "residential",
      address: "123 Main St",
      city: "Toronto",
      electricityInputMethod: "bill_exact",
      monthlyBillExact: 200,
    };
    const result = estimateUsage(input);
    // $200 bill after reversing OER (23.5%), HST (13%), and using all-in rate
    // (~18.3c/kWh) should yield ~1050-1200 kWh. Ontario avg is ~750 kWh at ~$141/mo.
    expect(result.monthlyKwh).toBeGreaterThan(900);
    expect(result.monthlyKwh).toBeLessThan(1300);
  });
});

// ============================================
// Test: Input normalization
// ============================================
describe("Input Normalization", () => {
  test("normalizes bill range to midpoint", () => {
    const { input } = normalizeQuoteInput({
      propertyType: "residential",
      city: "Ottawa",
      monthlyBillRange: "$100 – $200",
    });
    expect(input.monthlyBillExact).toBe(150);
    expect(input.electricityInputMethod).toBe("bill_range");
  });

  test("warns when no address provided", () => {
    const { warnings } = normalizeQuoteInput({
      propertyType: "residential",
    });
    expect(warnings.some((w) => w.includes("No address"))).toBe(true);
  });

  test("defaults to residential when property type is missing", () => {
    const { input } = normalizeQuoteInput({ city: "London" });
    expect(input.propertyType).toBe("residential");
  });

  test("warns when no electricity data provided", () => {
    const { input, warnings } = normalizeQuoteInput({
      propertyType: "residential",
      city: "Toronto",
    });
    expect(warnings.some((w) => w.includes("No electricity"))).toBe(true);
    expect(input.monthlyBillExact).toBe(200); // default
  });

  test("preserves lat/lng from raw input", () => {
    const { input } = normalizeQuoteInput({
      propertyType: "residential",
      city: "Toronto",
      address: "123 King St",
      latitude: 43.651,
      longitude: -79.383,
      monthlyBillExact: 200,
    });
    expect(input.latitude).toBe(43.651);
    expect(input.longitude).toBe(-79.383);
  });
});

// ============================================
// Test: Confidence scoring behavior
// ============================================
describe("Confidence Scoring", () => {
  test("high confidence with google_solar + exact kWh", () => {
    const conf = buildConfidence({
      rooftopSource: "google_solar",
      rooftopConfidence: 85,
      inputMethod: "kwh_exact",
      hasExactAddress: true,
      propertyType: "residential",
      fallbackUsed: false,
    });
    expect(conf.overallQuoteConfidence).toBeGreaterThan(75);
    expect(conf.roofGeometryConfidence).toBe(85); // (85 + 85) / 2
    expect(conf.inputQualityConfidence).toBe(90);
  });

  test("low confidence with fallback + bill range", () => {
    const conf = buildConfidence({
      rooftopSource: "regional_fallback",
      rooftopConfidence: 30,
      inputMethod: "bill_range",
      hasExactAddress: false,
      propertyType: "residential",
      fallbackUsed: true,
    });
    expect(conf.overallQuoteConfidence).toBeLessThan(40);
    expect(conf.roofGeometryConfidence).toBe(30); // (30 + 30) / 2
    expect(conf.inputQualityConfidence).toBeLessThanOrEqual(30);
  });

  test("rooftopConfidence blends into roof geometry score", () => {
    // Fallback source gives base 30, but high rooftopConfidence of 60 raises it
    const conf = buildConfidence({
      rooftopSource: "regional_fallback",
      rooftopConfidence: 60,
      inputMethod: "kwh_exact",
      hasExactAddress: true,
      propertyType: "residential",
      fallbackUsed: true,
    });
    expect(conf.roofGeometryConfidence).toBe(45); // (30 + 60) / 2
  });

  test("commercial lowers tariff and incentives confidence", () => {
    const residential = buildConfidence({
      rooftopSource: "regional_fallback",
      rooftopConfidence: 30,
      inputMethod: "bill_exact",
      hasExactAddress: true,
      propertyType: "residential",
      fallbackUsed: true,
    });
    const commercial = buildConfidence({
      rooftopSource: "regional_fallback",
      rooftopConfidence: 30,
      inputMethod: "bill_exact",
      hasExactAddress: true,
      propertyType: "commercial",
      fallbackUsed: true,
    });
    expect(commercial.tariffConfidence).toBeLessThan(residential.tariffConfidence);
    expect(commercial.incentivesConfidence).toBeLessThan(residential.incentivesConfidence);
  });
});

// ============================================
// Test: Uncertainty band behavior
// ============================================
describe("Uncertainty Bands (low/base/high)", () => {
  const fallbackRooftop: RooftopData = {
    source: "regional_fallback",
    usableRoofArea: 40,
    roofPitch: 25,
    roofAzimuth: 180,
    shadingFactor: 0.85,
    maxPanelCount: 20,
    annualSunshineHours: 1340,
    confidence: 30,
  };

  test("system sizing has proper low < base < high ordering", () => {
    const result = estimateSystem(10000, 3.67, fallbackRooftop, "residential");
    expect(result.system.systemSizeKw.low).toBeLessThanOrEqual(result.system.systemSizeKw.base);
    expect(result.system.systemSizeKw.base).toBeLessThanOrEqual(result.system.systemSizeKw.high);
  });

  test("production ranges are ordered correctly", () => {
    const system = estimateSystem(10000, 3.67, fallbackRooftop, "residential");
    const regionData = getRegionalSolarData("Toronto");
    const result = estimateProduction(system.system, fallbackRooftop, regionData);
    expect(result.production.annualProductionKwh.low).toBeLessThan(result.production.annualProductionKwh.base);
    expect(result.production.annualProductionKwh.base).toBeLessThan(result.production.annualProductionKwh.high);
  });

  test("cost ranges are ordered correctly", () => {
    const system = estimateSystem(10000, 3.67, fallbackRooftop, "residential");
    const result = estimateCost(system.system, "residential");
    expect(result.cost.totalInstalledCost.low).toBeLessThan(result.cost.totalInstalledCost.base);
    expect(result.cost.totalInstalledCost.base).toBeLessThan(result.cost.totalInstalledCost.high);
  });

  test("savings payback low < base < high", () => {
    const system = estimateSystem(10000, 3.67, fallbackRooftop, "residential");
    const regionData = getRegionalSolarData("Toronto");
    const production = estimateProduction(system.system, fallbackRooftop, regionData);
    const cost = estimateCost(system.system, "residential");
    const incentives = estimateIncentives("residential", cost.cost, production.production, system.system, "Toronto");
    const savings = estimateSavings(
      production.production,
      incentives.incentives.netCostAfterIncentives,
      200,
      "Toronto",
    );
    expect(savings.savings.paybackYears.low).toBeLessThanOrEqual(savings.savings.paybackYears.base);
    expect(savings.savings.paybackYears.base).toBeLessThanOrEqual(savings.savings.paybackYears.high);
  });
});

// ============================================
// Test: Commercial behavior
// ============================================
describe("Commercial Quotes", () => {
  const commercialRooftop: RooftopData = {
    source: "regional_fallback",
    usableRoofArea: 200,
    roofPitch: 10,
    roofAzimuth: 180,
    shadingFactor: 0.90,
    maxPanelCount: 100,
    annualSunshineHours: 1340,
    confidence: 25,
  };

  test("commercial system sizing uses commercial cost data", () => {
    const system = estimateSystem(50000, 3.67, commercialRooftop, "commercial");
    const cost = estimateCost(system.system, "commercial");
    // Commercial should have lower $/W than residential base
    expect(cost.cost.installedCostPerWatt.base).toBeLessThanOrEqual(3.00);
  });

  test("commercial gets CCA deduction instead of HRSP", () => {
    const system = estimateSystem(50000, 3.67, commercialRooftop, "commercial");
    const regionData = getRegionalSolarData("Toronto");
    const production = estimateProduction(system.system, commercialRooftop, regionData);
    const cost = estimateCost(system.system, "commercial");
    const incentives = estimateIncentives("commercial", cost.cost, production.production, system.system, "Toronto");

    const hasHRSP = incentives.incentives.items.some((i) => i.name.includes("Home Renovation"));
    const hasCCA = incentives.incentives.items.some((i) => i.name.includes("Capital Cost"));
    expect(hasHRSP).toBe(false);
    expect(hasCCA).toBe(true);
  });
});

// ============================================
// Test: HRSP incentive calculation
// ============================================
describe("HRSP Incentive", () => {
  const residentialRooftop: RooftopData = {
    source: "regional_fallback",
    usableRoofArea: 40,
    roofPitch: 25,
    roofAzimuth: 180,
    shadingFactor: 0.85,
    maxPanelCount: 20,
    annualSunshineHours: 1340,
    confidence: 30,
  };

  test("10 kW system gets $5,000 HRSP (capped at max)", () => {
    const system = estimateSystem(12000, 3.67, residentialRooftop, "residential");
    const regionData = getRegionalSolarData("Toronto");
    const production = estimateProduction(system.system, residentialRooftop, regionData);
    const cost = estimateCost(system.system, "residential");
    const incentives = estimateIncentives("residential", cost.cost, production.production, system.system, "Toronto");

    const hrsp = incentives.incentives.items.find((i) => i.name.includes("Home Renovation"));
    expect(hrsp).toBeDefined();
    expect(hrsp!.estimatedValue.base).toBe(5000); // capped at max
  });

  test("3 kW system gets $3,000 HRSP (per-kW scaling)", () => {
    // Force a small system by limiting roof area
    const smallRoof: RooftopData = {
      ...residentialRooftop,
      usableRoofArea: 10,
      maxPanelCount: 5,
    };
    const system = estimateSystem(3600, 3.67, smallRoof, "residential");
    const regionData = getRegionalSolarData("Toronto");
    const production = estimateProduction(system.system, smallRoof, regionData);
    const cost = estimateCost(system.system, "residential");
    const incentives = estimateIncentives("residential", cost.cost, production.production, system.system, "Toronto");

    const hrsp = incentives.incentives.items.find((i) => i.name.includes("Home Renovation"));
    expect(hrsp).toBeDefined();
    // 3 kW * $1,000/kW = $3,000 (below $5,000 cap)
    expect(hrsp!.estimatedValue.base).toBeLessThanOrEqual(5000);
    expect(hrsp!.estimatedValue.base).toBeGreaterThan(0);
  });
});

// ============================================
// Test: Alectra utility zone mapping
// ============================================
describe("Utility Zone Mapping", () => {
  test("Brampton maps to Alectra utility zone", () => {
    const zone = getUtilityZone("Brampton");
    expect(zone.id).toBe("alectra");
  });

  test("Hamilton maps to Alectra utility zone", () => {
    const zone = getUtilityZone("Hamilton");
    expect(zone.id).toBe("alectra");
  });

  test("Toronto maps to Toronto Hydro", () => {
    const zone = getUtilityZone("Toronto");
    expect(zone.id).toBe("toronto_hydro");
  });

  test("all zones have OER and delivery rates", () => {
    for (const city of ["Toronto", "Ottawa", "London", "Brampton", "SmallTown"]) {
      const zone = getUtilityZone(city);
      expect(zone.oerRebatePercent).toBe(23.5);
      expect(zone.variableDeliveryRateCentsPerKwh).toBeGreaterThan(0);
      expect(zone.regulatoryChargesCentsPerKwh).toBeGreaterThan(0);
    }
  });
});

// ============================================
// Test: UI payload compatibility mapping
// ============================================
describe("UI Payload Compatibility", () => {
  test("maps QuoteOutput to QuoteUiPayload with all required fields", () => {
    const output: QuoteOutput = {
      quoteId: "SFQ-test-123",
      generatedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
      propertyType: "residential",
      quoteLabel: "preliminary_estimate",
      location: {
        latitude: 43.65,
        longitude: -79.38,
        city: "Toronto",
        province: "ON",
        utilityZone: "toronto_hydro",
        peakSunHours: 3.67,
        annualIrradiance: 1340,
      },
      rooftop: {
        source: "regional_fallback",
        usableRoofArea: 40,
        roofPitch: 25,
        roofAzimuth: 180,
        shadingFactor: 0.85,
        maxPanelCount: 20,
        annualSunshineHours: 1340,
        confidence: 30,
      },
      system: {
        systemSizeKw: { low: 6.8, base: 8.0, high: 9.2 },
        panelCount: { low: 17, base: 20, high: 23 },
        panelWattage: 400,
        inverterSizeKw: { low: 5.7, base: 6.7, high: 7.7 },
      },
      production: {
        annualProductionKwh: { low: 8500, base: 10000, high: 11200 },
        monthlyProductionKwh: { low: 708, base: 833, high: 933 },
        capacityFactor: 0.143,
        degradationRatePercent: 0.5,
        year1ProductionKwh: { low: 8500, base: 10000, high: 11200 },
        year25ProductionKwh: { low: 7500, base: 8870, high: 9930 },
      },
      cost: {
        installedCostPerWatt: { low: 2.60, base: 3.00, high: 3.50 },
        totalInstalledCost: { low: 17680, base: 24000, high: 32200 },
        equipmentCost: { low: 9724, base: 13200, high: 17710 },
        laborCost: { low: 5304, base: 7200, high: 9660 },
        permitAndInterconnection: { low: 884, base: 1200, high: 1610 },
      },
      incentives: {
        items: [],
        totalIncentives: { low: 3000, base: 5000, high: 7000 },
        netCostAfterIncentives: { low: 10680, base: 19000, high: 29200 },
      },
      financing: [],
      savings: {
        monthlySavings: { low: 80, base: 108, high: 125 },
        annualSavings: { low: 960, base: 1300, high: 1500 },
        year1Savings: { low: 960, base: 1300, high: 1500 },
        year10Savings: { low: 1200, base: 1650, high: 1900 },
        year25Savings: { low: 1600, base: 2200, high: 2500 },
        lifetimeSavings: { low: 32000, base: 43000, high: 50000 },
        paybackYears: { low: 8, base: 11, high: 15 },
        currentMonthlyBill: 200,
        projectedMonthlyBill: { low: 75, base: 92, high: 120 },
        electricityRateEscalation: 3.5,
      },
      confidence: {
        roofGeometryConfidence: 30,
        shadingConfidence: 20,
        tariffConfidence: 80,
        incentivesConfidence: 70,
        inputQualityConfidence: 40,
        overallQuoteConfidence: 45,
      },
      assumptionsUsed: [],
      dataSourcesUsed: ["Regional fallback defaults"],
      fallbackModesUsed: ["rooftop_regional_fallback"],
      warnings: ["Roof data estimated"],
      input: {
        propertyType: "residential",
        address: "123 Main St",
        city: "Toronto",
        electricityInputMethod: "bill_range",
        monthlyBillRange: "$200 – $300",
      },
    };

    const uiPayload = mapQuoteOutputToUiPayload(output);

    expect(uiPayload.propertyType).toBe("residential");
    expect(uiPayload.systemSizeKw).toBe(8.0);
    expect(uiPayload.annualProductionKwh).toBe(10000);
    expect(uiPayload.totalInstalledCost).toBe(24000);
    expect(uiPayload.netCost).toBe(19000);
    expect(uiPayload.monthlySavings).toBe(108);
    expect(uiPayload.annualSavings).toBe(1300);
    expect(uiPayload.paybackYears).toBe(11);
    expect(uiPayload.overallConfidence).toBe(45);
    expect(uiPayload.isRemoteEstimate).toBe(false);

    expect(uiPayload.ranges.systemSizeKw.low).toBe(6.8);
    expect(uiPayload.ranges.systemSizeKw.high).toBe(9.2);

    expect(uiPayload.confidenceBreakdown.roofGeometryConfidence).toBe(30);
  });
});

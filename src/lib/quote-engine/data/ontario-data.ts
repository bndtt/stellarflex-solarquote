// ============================================
// Ontario / Canada Solar Data
// Regional baselines, utility rates, incentives
// Sources documented in docs/ASSUMPTIONS.md
// Last updated: 2026-02-24
// ============================================

// --- Utility Zone Definitions ---
// Maps Ontario regions to their local utility and rate structures

export interface UtilityZone {
  id: string;
  name: string;
  provider: string;
  // Time-of-Use rates (cents/kWh) — OEB Winter 2025/2026 (Nov 1 2025 – Apr 30 2026)
  touRates: {
    offPeak: number;   // cents/kWh
    midPeak: number;
    onPeak: number;
  };
  // Blended average rate used for savings calculations
  // Weighted: ~65% off-peak, ~18% mid-peak, ~17% on-peak
  blendedRateCentsPerKwh: number;
  // Monthly delivery/fixed charges (dollars)
  monthlyFixedCharge: number;
  // Variable delivery charge (cents/kWh) — distribution volumetric rate
  variableDeliveryRateCentsPerKwh: number;
  // Regulatory charges (cents/kWh) — transmission, IESO charges
  regulatoryChargesCentsPerKwh: number;
  // Ontario Electricity Rebate — % discount on pre-HST bill subtotal
  oerRebatePercent: number;
}

export const UTILITY_ZONES: Record<string, UtilityZone> = {
  hydro_one: {
    id: "hydro_one",
    name: "Hydro One (Rural/Suburban Ontario)",
    provider: "Hydro One Networks",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 32.85,
    variableDeliveryRateCentsPerKwh: 2.6,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
  toronto_hydro: {
    id: "toronto_hydro",
    name: "Toronto Hydro",
    provider: "Toronto Hydro-Electric System",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 26.16,
    variableDeliveryRateCentsPerKwh: 2.2,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
  ottawa_hydro: {
    id: "ottawa_hydro",
    name: "Hydro Ottawa",
    provider: "Hydro Ottawa Limited",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 28.93,
    variableDeliveryRateCentsPerKwh: 2.0,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
  london_hydro: {
    id: "london_hydro",
    name: "London Hydro",
    provider: "London Hydro Inc.",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 27.55,
    variableDeliveryRateCentsPerKwh: 2.1,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
  alectra: {
    id: "alectra",
    name: "Alectra Utilities",
    provider: "Alectra Utilities Corporation",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 29.64,
    variableDeliveryRateCentsPerKwh: 2.3,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
  default_ontario: {
    id: "default_ontario",
    name: "Ontario Default",
    provider: "Ontario Energy Board Regulated",
    touRates: { offPeak: 9.8, midPeak: 15.7, onPeak: 20.3 },
    blendedRateCentsPerKwh: 14.8,
    monthlyFixedCharge: 30.00,
    variableDeliveryRateCentsPerKwh: 2.3,
    regulatoryChargesCentsPerKwh: 1.3,
    oerRebatePercent: 23.5,
  },
};

// --- City -> Utility Zone Mapping ---

export const CITY_UTILITY_MAP: Record<string, string> = {
  // Toronto Hydro
  toronto: "toronto_hydro",
  scarborough: "toronto_hydro",
  etobicoke: "toronto_hydro",
  "north york": "toronto_hydro",
  // Hydro Ottawa
  ottawa: "ottawa_hydro",
  kanata: "ottawa_hydro",
  orleans: "ottawa_hydro",
  // London Hydro
  london: "london_hydro",
  // Alectra Utilities (~1M customers)
  brampton: "alectra",
  mississauga: "alectra",
  hamilton: "alectra",
  vaughan: "alectra",
  "st catharines": "alectra",
  "st. catharines": "alectra",
  guelph: "alectra",
  "richmond hill": "alectra",
  markham: "alectra",
  // Everything else defaults to hydro_one
};

// Helper to compute all-in variable rate (energy + delivery + regulatory)
export function getAllInVariableRate(zone: UtilityZone): number {
  return (zone.blendedRateCentsPerKwh + zone.variableDeliveryRateCentsPerKwh + zone.regulatoryChargesCentsPerKwh) / 100;
}

export function getUtilityZone(city: string): UtilityZone {
  const normalized = city.toLowerCase().trim();
  const zoneId = CITY_UTILITY_MAP[normalized] || "hydro_one";
  return UTILITY_ZONES[zoneId];
}

// --- Regional Solar Production Baselines ---
// Annual peak sun hours and irradiance by Ontario region
// Source: NRCan PV Potential Maps, RETScreen data

export interface RegionalSolarData {
  region: string;
  cities: string[];
  peakSunHoursDaily: number;       // average daily peak sun hours
  annualIrradianceKwhPerM2: number; // annual global horizontal irradiance
  annualPeakSunHours: number;       // peakSunHoursDaily * 365
  latitude: number;                 // representative latitude
  longitude: number;                // representative longitude
}

export const ONTARIO_REGIONS: RegionalSolarData[] = [
  {
    region: "Greater Toronto Area",
    cities: ["toronto", "mississauga", "brampton", "markham", "vaughan", "richmond hill", "oakville", "burlington", "pickering", "ajax", "whitby", "oshawa", "scarborough", "etobicoke", "north york", "caledon", "milton", "newmarket", "aurora", "stouffville", "georgina"],
    peakSunHoursDaily: 3.67,
    annualIrradianceKwhPerM2: 1340,
    annualPeakSunHours: 1340,
    latitude: 43.65,
    longitude: -79.38,
  },
  {
    region: "Ottawa / Eastern Ontario",
    cities: ["ottawa", "kanata", "orleans", "kingston", "belleville", "cornwall", "brockville", "smiths falls", "pembroke", "hawkesbury", "perth", "renfrew"],
    peakSunHoursDaily: 3.72,
    annualIrradianceKwhPerM2: 1358,
    annualPeakSunHours: 1358,
    latitude: 45.42,
    longitude: -75.69,
  },
  {
    region: "Southwestern Ontario",
    cities: ["london", "kitchener", "waterloo", "cambridge", "guelph", "hamilton", "st catharines", "st. catharines", "niagara falls", "windsor", "chatham", "sarnia", "brantford", "woodstock", "stratford", "owen sound", "orangeville", "leamington", "tillsonburg", "simcoe", "norfolk"],
    peakSunHoursDaily: 3.78,
    annualIrradianceKwhPerM2: 1380,
    annualPeakSunHours: 1380,
    latitude: 42.98,
    longitude: -81.24,
  },
  {
    region: "Central Ontario",
    cities: ["barrie", "orillia", "collingwood", "midland", "peterborough", "kawartha lakes", "cobourg", "huntsville", "lindsay", "parry sound", "haliburton", "muskoka"],
    peakSunHoursDaily: 3.56,
    annualIrradianceKwhPerM2: 1300,
    annualPeakSunHours: 1300,
    latitude: 44.39,
    longitude: -79.69,
  },
  {
    region: "Northern Ontario",
    cities: ["sudbury", "thunder bay", "sault ste marie", "north bay", "timmins", "kenora"],
    peakSunHoursDaily: 3.42,
    annualIrradianceKwhPerM2: 1249,
    annualPeakSunHours: 1249,
    latitude: 46.49,
    longitude: -80.99,
  },
];

// Default fallback for unknown Ontario locations
export const ONTARIO_DEFAULT: RegionalSolarData = {
  region: "Ontario Average",
  cities: [],
  peakSunHoursDaily: 3.60,
  annualIrradianceKwhPerM2: 1314,
  annualPeakSunHours: 1314,
  latitude: 44.0,
  longitude: -79.5,
};

export function getRegionalSolarData(city: string): RegionalSolarData {
  const normalized = city.toLowerCase().trim();
  const region = ONTARIO_REGIONS.find((r) =>
    r.cities.includes(normalized)
  );
  return region || ONTARIO_DEFAULT;
}

// --- Solar Equipment Constants ---

export const EQUIPMENT = {
  // Panel specs (Tier 1 — Canadian Solar / Longi / QCells)
  panelWattage: 400,               // watts per panel
  panelAreaM2: 1.92,               // ~2m x 0.96m per panel
  panelEfficiency: 0.208,          // 20.8% module efficiency
  degradationRatePercent: 0.5,     // annual degradation

  // System losses (wiring, soiling, snow, clipping — excludes inverter, applied separately)
  systemLossFactor: 0.083,         // 8.3% non-inverter losses (aligned with Texpowers/OpenSolar)
  inverterEfficiency: 0.965,       // 96.5% inverter efficiency (3.5% loss, aligned with Texpowers)

  // DC-to-AC ratio
  dcToAcRatio: 1.2,
};

// --- Cost Data ---
// Canadian $/watt benchmarks for Ontario (2026)

export const COST_DATA = {
  residential: {
    costPerWattLow: 1.90,          // $/W, large system / competitive (Texpowers 7kW = $2.03/W)
    costPerWattBase: 2.20,         // $/W, typical Ontario market 2026
    costPerWattHigh: 3.00,         // $/W, small system / complex roof
    equipmentPercent: 0.55,        // % of total cost
    laborPercent: 0.30,
    permitPercent: 0.05,
    overheadPercent: 0.10,
  },
  commercial: {
    costPerWattLow: 1.60,          // $/W, larger scale (Texpowers 100kW = $1.80/W)
    costPerWattBase: 1.90,         // $/W, typical Ontario market 2026
    costPerWattHigh: 2.50,         // $/W, complex install
    equipmentPercent: 0.60,
    laborPercent: 0.25,
    permitPercent: 0.05,
    overheadPercent: 0.10,
  },
};

// --- Ontario Incentives Data ---

export const INCENTIVE_PROGRAMS = {
  netMetering: {
    name: "Ontario Net Metering",
    description: "Earn credits for excess solar energy sent to the grid. Credits offset future energy charges on your bill. Mutually exclusive with IESO and HRSP programs.",
    type: "net_metering" as const,
    // Self-consumption ratios (% of production consumed on-site)
    selfConsumptionResidential: 0.70,  // ~70% consumed, ~30% exported
    selfConsumptionCommercial: 0.85,   // ~85% consumed, ~15% exported
    // Net metering credits at commodity rate only (no delivery/regulatory)
    confidence: 85,
    source: "Ontario Energy Board — Net Metering Regulation",
  },
  homeRenovationSavings: {
    name: "Ontario Home Renovation Savings Program (HRSP)",
    description: "Provincial rebate of $1,000 per kW of installed rooftop solar capacity, up to $5,000. Requires battery storage installation. Mutually exclusive with Net Metering.",
    type: "rebate" as const,
    perKwRebate: 1000,
    maxSolarRebate: 5000,
    batteryRebateMax: 5000,        // Up to $5,000 for battery (50% of cost)
    batteryRebatePercent: 0.50,
    requiresBattery: true,
    rooftopOnly: true,
    gridConnectedOnly: true,
    residentialOnly: true,
    prohibitsNetMetering: true,
    confidence: 75,
    source: "Ontario Save on Energy — Home Renovation Savings Program (2026)",
  },
  iesoRetrofit: {
    name: "IESO Save on Energy Retrofit Program",
    description: "Provincial incentive for commercial solar installations. Up to $1,000/kW-DC for micro generation (≤10 kW) or $860/kW-AC for small/medium systems (>10 kW to 1 MW). Capped at 50% of eligible project costs.",
    type: "ieso_rebate" as const,
    microGenPerKwDc: 1000,         // ≤10 kW: $1,000/kW-DC
    smallMedPerKwAc: 860,          // >10 kW to 1 MW: $860/kW-AC
    maxCoveragePercent: 0.50,      // 50% cap of eligible project costs
    commercialOnly: true,
    prohibitsNetMetering: true,
    confidence: 85,
    source: "IESO Save on Energy — Retrofit Program (2025–2028)",
  },
  cleanTechITC: {
    name: "Clean Technology Investment Tax Credit (CT ITC)",
    description: "30% refundable federal tax credit for eligible clean energy equipment purchased by Canadian corporations. Applied to cost after IESO rebate is deducted.",
    type: "tax_credit" as const,
    creditRate: 0.30,              // 30% with labour requirements met
    creditRateReduced: 0.20,       // 20% without labour requirements
    commercialOnly: true,
    appliedAfterIESO: true,        // Stacking: applied to (totalCost - IESO rebate)
    confidence: 80,
    source: "Canada Revenue Agency — Clean Technology Investment Tax Credit (Bill C-59)",
  },
  ccaDeduction: {
    name: "Capital Cost Allowance (CCA Class 43.1/43.2)",
    description: "100% immediate expensing for clean energy equipment (2024–2029). Businesses can fully deduct the cost of solar equipment from taxable income in year one. Applied to cost after IESO rebate and CT ITC are deducted.",
    type: "tax_credit" as const,
    deductionRate: 1.0,            // 100% first-year deduction (immediate expensing 2024–2029)
    effectiveTaxRate: 0.265,       // 26.5% combined federal (15%) + Ontario (11.5%) corporate rate
    commercialOnly: true,
    appliedAfterIESOAndITC: true,  // Stacking: applied to (totalCost - IESO - CT ITC)
    confidence: 80,
    source: "Canada Revenue Agency — CCA Class 43.1/43.2 with Immediate Expensing",
  },
};

// --- Electricity Rate Escalation ---

export const RATE_ESCALATION = {
  annualPercentIncrease: 3.5,      // Ontario avg ~3-4% per year
  lowEstimate: 2.0,
  highEstimate: 5.0,
  source: "Ontario Energy Board historical rate trends",
};

// --- Financing Defaults ---

export const FINANCING_DEFAULTS = {
  loan: {
    termYears: 15,
    interestRate: 6.5,             // % annual
    downPaymentPercent: 0,
  },
  leasePpa: {
    termYears: 20,
    escalationRate: 2.5,           // annual % price increase
    discountFromRetail: 15,        // % below current utility rate
  },
};

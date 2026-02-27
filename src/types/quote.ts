// ============================================
// StellarFlex SolarQuote — Quote Engine Types
// ============================================

// --- Input Types ---

export type PropertyType = "residential" | "commercial";

export type ElectricityInputMethod = "bill_range" | "bill_exact" | "kwh_exact";

export interface QuoteInput {
  propertyType: PropertyType;
  address: string;
  city: string;
  province?: string; // defaults to "ON"

  // Electricity usage — one of these should be provided
  electricityInputMethod: ElectricityInputMethod;
  monthlyBillRange?: string;     // e.g. "$100–$200" (least precise)
  monthlyBillExact?: number;     // e.g. 185 (dollars, more precise)
  monthlyKwhExact?: number;      // e.g. 1200 (kWh, most precise)

  // Geolocation (from address autocomplete)
  latitude?: number;
  longitude?: number;

  // Optional enrichment fields
  roofArea?: number;             // sq ft, if known
  roofType?: "flat" | "sloped" | "unknown";
  stories?: number;
  yearBuilt?: number;

  // Contact (for lead capture, not used in calculation)
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// --- Range Type (low / base / high) ---

export interface Range {
  low: number;
  base: number;
  high: number;
}

// --- Confidence Types ---

export interface ConfidenceBreakdown {
  roofGeometryConfidence: number;   // 0–100
  shadingConfidence: number;        // 0–100
  tariffConfidence: number;         // 0–100
  incentivesConfidence: number;     // 0–100
  inputQualityConfidence: number;   // 0–100
  overallQuoteConfidence: number;   // 0–100 (weighted average)
}

// --- Location Data ---

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  utilityZone: string;           // e.g. "hydro_one", "toronto_hydro"
  peakSunHours: number;          // annual average daily peak sun hours
  annualIrradiance: number;      // kWh/m²/year
}

// --- Rooftop Data (from provider or fallback) ---

export interface RooftopData {
  source: "google_solar" | "manual_input" | "regional_fallback";
  usableRoofArea: number;          // sq meters
  roofPitch: number;               // degrees
  roofAzimuth: number;             // degrees from north (180 = south-facing)
  shadingFactor: number;           // 0–1, 1 = no shading
  maxPanelCount: number;
  annualSunshineHours: number;
  confidence: number;              // 0–100
}

// --- System Sizing ---

export interface SystemSizing {
  systemSizeKw: Range;           // kW DC
  panelCount: Range;
  panelWattage: number;          // watts per panel (e.g. 400)
  inverterSizeKw: Range;
}

// --- Production Estimate ---

export interface ProductionEstimate {
  annualProductionKwh: Range;
  monthlyProductionKwh: Range;
  capacityFactor: number;        // 0–1
  degradationRatePercent: number; // annual, e.g. 0.5
  year1ProductionKwh: Range;
  year25ProductionKwh: Range;
}

// --- Cost Estimate ---

export interface CostEstimate {
  installedCostPerWatt: Range;   // $/W
  totalInstalledCost: Range;     // $
  equipmentCost: Range;
  laborCost: Range;
  permitAndInterconnection: Range;
}

// --- Incentives ---

export interface IncentiveItem {
  name: string;
  description: string;
  estimatedValue: Range;
  type: "grant" | "tax_credit" | "rebate" | "net_metering" | "ieso_rebate";
  confidence: number;             // 0–100
  source: string;
}

export interface IncentivesEstimate {
  items: IncentiveItem[];
  totalIncentives: Range;
  netCostAfterIncentives: Range;
}

// --- Financing ---

export interface FinancingOption {
  type: "cash" | "loan" | "lease_ppa";
  label: string;
  downPayment: number;
  monthlyPayment: Range;
  termYears: number;
  interestRate?: number;          // for loan
  escalationRate?: number;        // for lease/ppa
  totalCostOverTerm: Range;
}

// --- Savings ---

export interface SavingsEstimate {
  monthlySavings: Range;          // $ first year
  annualSavings: Range;           // $ first year
  year1Savings: Range;
  year10Savings: Range;
  year25Savings: Range;
  lifetimeSavings: Range;         // 25-year total
  paybackYears: Range;
  currentMonthlyBill: number;
  projectedMonthlyBill: Range;    // after solar
  electricityRateEscalation: number; // annual % increase
}

// --- Assumptions ---

export interface AssumptionEntry {
  key: string;
  value: string | number;
  source: string;
  note?: string;
}

// --- Environmental Impact ---

export interface EnvironmentalImpact {
  annualCo2OffsetKg: number;          // kg of CO2 avoided per year
  lifetimeCo2OffsetTonnes: number;    // tonnes over 25 years
  equivalentTreesPlanted: number;     // lifetime trees equivalent
  equivalentCarsOffRoad: number;      // lifetime cars-off-road equivalent
  equivalentHomesElectrified: number; // homes powered per year
  lifetimeCleanEnergyMwh: number;     // total MWh over 25 years
}

// --- Full Quote Output ---

export interface QuoteOutput {
  // Metadata
  quoteId: string;
  generatedAt: string;            // ISO timestamp
  engineVersion: string;
  propertyType: PropertyType;
  quoteLabel: "full_estimate" | "preliminary_estimate" | "remote_estimate_only";

  // Core results
  location: LocationData;
  rooftop: RooftopData;
  system: SystemSizing;
  production: ProductionEstimate;
  cost: CostEstimate;
  incentives: IncentivesEstimate;
  financing: FinancingOption[];
  savings: SavingsEstimate;
  environmentalImpact: EnvironmentalImpact;

  // Quality indicators
  confidence: ConfidenceBreakdown;
  assumptionsUsed: AssumptionEntry[];
  dataSourcesUsed: string[];
  fallbackModesUsed: string[];
  warnings: string[];

  // Input echo
  input: QuoteInput;
}

// --- UI Compatibility Payload ---
// Simplified shape for the existing results display

export interface QuoteUiPayload {
  propertyType: PropertyType;
  quoteLabel: string;

  // Primary results (base values for simple display)
  systemSizeKw: number;
  annualProductionKwh: number;
  totalInstalledCost: number;
  totalIncentives: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;

  // Ranges for enhanced display
  ranges: {
    systemSizeKw: Range;
    annualProductionKwh: Range;
    totalInstalledCost: Range;
    totalIncentives: Range;
    netCost: Range;
    monthlySavings: Range;
    annualSavings: Range;
    paybackYears: Range;
  };

  // Confidence
  overallConfidence: number;
  confidenceBreakdown: ConfidenceBreakdown;

  // Financing options
  financing: FinancingOption[];

  // Environmental impact
  environmentalImpact: EnvironmentalImpact;

  // Warnings / labels
  warnings: string[];
  isRemoteEstimate: boolean;
}

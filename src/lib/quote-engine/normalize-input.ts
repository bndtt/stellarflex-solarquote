// Validates and normalizes raw user input into a clean QuoteInput
import type { QuoteInput, ElectricityInputMethod } from "@/types/quote";

// Maps bill range dropdown values to midpoint dollar amounts
const BILL_RANGE_MIDPOINTS: Record<string, number> = {
  "Under $100": 75,
  "$100 – $200": 150,
  "$100–$200": 150,
  "$200 – $300": 250,
  "$200–$300": 250,
  "$300 – $500": 400,
  "$300–$500": 400,
  "$500+": 650,
};

export interface NormalizeResult {
  input: QuoteInput;
  warnings: string[];
}

export function normalizeQuoteInput(raw: Partial<QuoteInput>): NormalizeResult {
  const warnings: string[] = [];

  // Property type defaults to residential
  const propertyType = raw.propertyType === "commercial" ? "commercial" : "residential";

  // Address validation
  const address = (raw.address || "").trim();
  const city = (raw.city || "").trim();
  if (!address && !city) {
    warnings.push("No address provided. Using Ontario average regional data.");
  }

  // Province defaults to Ontario
  const province = (raw.province || "ON").toUpperCase();

  // Determine electricity input method and normalize values
  let electricityInputMethod: ElectricityInputMethod = "bill_range";
  let monthlyBillExact: number | undefined;
  let monthlyKwhExact: number | undefined;

  if (raw.monthlyKwhExact && raw.monthlyKwhExact > 0) {
    electricityInputMethod = "kwh_exact";
    monthlyKwhExact = raw.monthlyKwhExact;
  } else if (raw.monthlyBillExact && raw.monthlyBillExact > 0) {
    electricityInputMethod = "bill_exact";
    monthlyBillExact = raw.monthlyBillExact;
  } else if (raw.monthlyBillRange) {
    electricityInputMethod = "bill_range";
    // Convert range to approximate dollar amount for calculation
    monthlyBillExact = BILL_RANGE_MIDPOINTS[raw.monthlyBillRange];
    if (!monthlyBillExact) {
      // Try to parse as a number if it's not a known range
      const parsed = parseFloat(raw.monthlyBillRange.replace(/[^0-9.]/g, ""));
      monthlyBillExact = parsed > 0 ? parsed : 200;
      warnings.push(`Unrecognized bill range "${raw.monthlyBillRange}". Using $${monthlyBillExact}/month estimate.`);
    }
  } else {
    // No electricity data at all — use Ontario average
    electricityInputMethod = "bill_range";
    monthlyBillExact = 200;
    warnings.push("No electricity usage data provided. Using Ontario average of $200/month.");
  }

  const input: QuoteInput = {
    propertyType,
    address,
    city,
    province,
    electricityInputMethod,
    monthlyBillRange: raw.monthlyBillRange,
    monthlyBillExact,
    monthlyKwhExact,
    roofArea: raw.roofArea,
    roofType: raw.roofType || "unknown",
    stories: raw.stories,
    yearBuilt: raw.yearBuilt,
    latitude: raw.latitude,
    longitude: raw.longitude,
    contactName: raw.contactName,
    contactEmail: raw.contactEmail,
    contactPhone: raw.contactPhone,
  };

  return { input, warnings };
}

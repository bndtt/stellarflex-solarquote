// Resolves rooftop intelligence — provider API or fallback
import type { RooftopData, PropertyType } from "@/types/quote";

export interface RooftopResult {
  rooftop: RooftopData;
  fallbackUsed: boolean;
  fallbackReason?: string;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
  dataSources: string[];
}

// Rooftop defaults when no provider data is available
const RESIDENTIAL_DEFAULTS = {
  usableRoofArea: 40,        // sq meters (~430 sq ft), typical Ontario home
  roofPitch: 25,             // degrees, typical residential roof
  roofAzimuth: 180,          // south-facing (best case assumption)
  shadingFactor: 0.85,       // 15% shading penalty (conservative)
  maxPanelCount: 20,         // ~20 panels on typical home roof
  annualSunshineHours: 1314, // Ontario average
};

const COMMERCIAL_DEFAULTS = {
  usableRoofArea: 200,       // sq meters (~2150 sq ft), typical commercial flat roof
  roofPitch: 10,             // degrees, flat/low-slope commercial
  roofAzimuth: 180,
  shadingFactor: 0.90,       // less shading on commercial (taller buildings)
  maxPanelCount: 100,
  annualSunshineHours: 1314,
};

export async function resolveRooftop(
  latitude: number,
  longitude: number,
  propertyType: PropertyType,
  userRoofArea?: number,
  annualSunshineHours?: number,
): Promise<RooftopResult> {
  const assumptions: RooftopResult["assumptions"] = [];
  const dataSources: string[] = [];

  // Attempt Google Solar API if key is configured
  const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
  if (apiKey) {
    try {
      const result = await fetchGoogleSolarData(latitude, longitude, apiKey);
      if (result) {
        dataSources.push("Google Solar API (rooftop intelligence)");
        return {
          rooftop: {
            source: "google_solar",
            usableRoofArea: result.usableRoofArea,
            roofPitch: result.roofPitch,
            roofAzimuth: result.roofAzimuth,
            shadingFactor: result.shadingFactor,
            maxPanelCount: result.maxPanelCount,
            annualSunshineHours: result.annualSunshineHours,
            confidence: 85,
          },
          fallbackUsed: false,
          assumptions,
          dataSources,
        };
      }
    } catch {
      // API failed — fall through to fallback
    }
  }

  // --- Fallback: Regional defaults ---
  const defaults = propertyType === "commercial" ? COMMERCIAL_DEFAULTS : RESIDENTIAL_DEFAULTS;

  // Override with user-provided roof area if available
  let usableRoofArea = defaults.usableRoofArea;
  if (userRoofArea && userRoofArea > 0) {
    // Convert sq ft to sq meters if > 100 (assume sq ft input)
    usableRoofArea = userRoofArea > 100 ? userRoofArea * 0.0929 : userRoofArea;
    assumptions.push({
      key: "roof_area_source",
      value: "user_input",
      source: "User-provided roof area",
      note: `${usableRoofArea.toFixed(1)} sq meters`,
    });
  }

  const fallbackReason = apiKey
    ? "Google Solar API returned no data for this location (common for Ontario/Canada addresses)"
    : "No rooftop API key configured — using regional defaults";

  assumptions.push({
    key: "rooftop_source",
    value: "regional_fallback",
    source: "StellarFlex regional defaults",
    note: fallbackReason,
  });

  assumptions.push({
    key: "shading_factor",
    value: defaults.shadingFactor,
    source: "Regional average estimate",
    note: "Actual shading may differ; site survey recommended",
  });

  dataSources.push("Regional fallback defaults (no rooftop API data)");

  return {
    rooftop: {
      source: "regional_fallback",
      usableRoofArea,
      roofPitch: defaults.roofPitch,
      roofAzimuth: defaults.roofAzimuth,
      shadingFactor: defaults.shadingFactor,
      maxPanelCount: Math.floor(usableRoofArea / 1.92), // panel area ~1.92 m²
      annualSunshineHours: annualSunshineHours || defaults.annualSunshineHours,
      confidence: userRoofArea ? 45 : 30,
    },
    fallbackUsed: true,
    fallbackReason,
    assumptions,
    dataSources,
  };
}

// --- Google Solar API adapter ---
// Returns null if data is unavailable for the location

interface GoogleSolarResult {
  usableRoofArea: number;
  roofPitch: number;
  roofAzimuth: number;
  shadingFactor: number;
  maxPanelCount: number;
  annualSunshineHours: number;
}

async function fetchGoogleSolarData(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<GoogleSolarResult | null> {
  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!data.solarPotential) {
    return null;
  }

  const sp = data.solarPotential;

  return {
    usableRoofArea: sp.wholeRoofStats?.areaMeters2 || 40,
    roofPitch: sp.roofSegmentStats?.[0]?.pitchDegrees || 25,
    roofAzimuth: sp.roofSegmentStats?.[0]?.azimuthDegrees || 180,
    shadingFactor: Math.min(1, (sp.maxSunshineHoursPerYear || 1314) / 1600),
    maxPanelCount: sp.solarPanelConfigs?.[sp.solarPanelConfigs.length - 1]?.panelsCount || 20,
    annualSunshineHours: sp.maxSunshineHoursPerYear || 1314,
  };
}

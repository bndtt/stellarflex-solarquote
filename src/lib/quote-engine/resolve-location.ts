// Resolves user address/city to location data with solar baselines
import type { LocationData } from "@/types/quote";
import { getRegionalSolarData, getUtilityZone } from "./data/ontario-data";

export interface LocationResult {
  location: LocationData;
  assumptions: Array<{ key: string; value: string | number; source: string; note?: string }>;
  dataSources: string[];
}

export function resolveLocation(city: string, province: string): LocationResult {
  const assumptions: LocationResult["assumptions"] = [];
  const dataSources: string[] = [];

  // Get regional solar data based on city
  const regionData = getRegionalSolarData(city);
  const utilityZone = getUtilityZone(city);

  dataSources.push("NRCan PV Potential Data (regional baseline)");
  dataSources.push(`Utility zone: ${utilityZone.name}`);

  assumptions.push({
    key: "solar_region",
    value: regionData.region,
    source: "NRCan Regional Solar Data",
    note: `Matched city "${city}" to region "${regionData.region}"`,
  });

  assumptions.push({
    key: "peak_sun_hours",
    value: regionData.peakSunHoursDaily,
    source: "NRCan PV Potential Maps",
    note: "Average daily peak sun hours for this region",
  });

  assumptions.push({
    key: "utility_zone",
    value: utilityZone.id,
    source: "Ontario Energy Board",
    note: `Provider: ${utilityZone.provider}`,
  });

  const location: LocationData = {
    latitude: regionData.latitude,
    longitude: regionData.longitude,
    city: city || "Ontario",
    province: province || "ON",
    utilityZone: utilityZone.id,
    peakSunHours: regionData.peakSunHoursDaily,
    annualIrradiance: regionData.annualIrradianceKwhPerM2,
  };

  return { location, assumptions, dataSources };
}

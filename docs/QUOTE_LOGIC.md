# Quote Engine Architecture

> **Engine Version:** 1.0.0
> **Location:** `src/lib/quote-engine/`
> **Last Updated:** 2026-02-23

---

## Overview

The SolarQuote engine is a modular pipeline that takes minimal user input (property type, location, and electricity usage) and produces a comprehensive solar installation quote. Each stage of the pipeline is implemented as an independent module in `src/lib/quote-engine/`, making the system easy to test, extend, and debug.

The pipeline transforms a `QuoteInput` object through a series of enrichment and estimation stages, producing a `QuoteOutput` with full technical and financial breakdowns. This output is then mapped to a `QuoteUiPayload` optimized for frontend rendering.

---

## Pipeline Stages

The engine executes the following stages in order:

```
QuoteInput
  |
  v
normalizeInput        Clean and validate raw user input
  |
  v
resolveLocation       Geocode address, determine region and utility zone
  |
  v
resolveRooftop        Fetch rooftop geometry (Google Solar API or fallback)
  |
  v
estimateUsage         Convert bill information to annual kWh consumption
  |
  v
estimateSystem        Size the solar system to meet the usage target
  |
  v
estimateProduction    Calculate expected annual and lifetime energy production
  |
  v
estimateCost          Calculate total system cost and cost per watt
  |
  v
estimateIncentives    Apply available grants, tax credits, and rebates
  |
  v
estimateFinancing     Model loan, lease, and PPA payment scenarios
  |
  v
estimateSavings       Project electricity savings over the system lifetime
  |
  v
buildConfidence       Score the reliability of the estimate across dimensions
  |
  v
mapToUi               Transform QuoteOutput into QuoteUiPayload for the frontend
```

---

## Input: QuoteInput

The engine accepts the following input fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `propertyType` | `"residential"` or `"commercial"` | Yes | Determines cost brackets, incentives, and rate structures |
| `address` | `string` | No | Full street address for geocoding and rooftop resolution |
| `city` | `string` | Yes | City name, used for regional solar data when no address is provided |
| `electricityInput` | `BillRange` or `ExactBill` or `ExactKwh` | Yes | One of three methods to specify electricity usage |

### Electricity Input Methods

1. **Bill Range** (`bill_range`): User selects a monthly bill bracket (e.g., "$100-$150"). Least precise, widest uncertainty range.
2. **Exact Bill** (`bill_exact`): User enters their exact monthly or average monthly bill amount in dollars. The engine reverse-engineers kWh from the dollar amount.
3. **Exact kWh** (`kwh_exact`): User enters their monthly or annual kWh consumption directly. Most precise input method.

---

## Output: QuoteOutput

The `QuoteOutput` contains the full results of all pipeline stages:

| Section | Contents |
|---------|----------|
| `location` | Resolved coordinates, region, utility zone, peak sun hours |
| `rooftop` | Usable area, azimuth, pitch, shading factor, data source |
| `usage` | Annual kWh consumption (derived), monthly breakdown |
| `system` | System size (kW), panel count, panel wattage, array area |
| `production` | Annual kWh produced, monthly profile, lifetime production with degradation |
| `cost` | Gross cost, cost per watt, equipment and labor breakdown |
| `incentives` | Applicable grants, tax benefits, net cost after incentives |
| `financing` | Loan, lease, and PPA scenarios with monthly payments |
| `savings` | Annual savings, cumulative savings, payback period, 25-year ROI |
| `confidence` | Dimension scores, overall score, quote label, uncertainty ranges |
| `metadata` | Engine version, timestamp, input hash, data sources used |

---

## Output: QuoteUiPayload

The `mapToUi` stage transforms `QuoteOutput` into a flattened, frontend-friendly structure. This payload contains:

- Headline numbers (system size, annual production, estimated savings, payback period)
- Formatted currency and energy values
- Confidence label and badge color
- Low/base/high ranges for key figures
- Simplified financing comparison table
- Pre-built chart data for production profiles and savings projections

The UI payload is designed so the frontend does not need to perform any calculations or formatting.

---

## Key Formulas

### Usage Estimation (Bill to kWh)

When the user provides a dollar amount instead of kWh, the engine reverse-engineers consumption:

```
preTaxBill    = monthlyBill / 1.13              # Remove 13% HST
energyCharge  = preTaxBill - monthlyFixedCharge  # Subtract utility fixed charge
monthlyKwh    = energyCharge / blendedRate        # Divide by blended rate (13.0c/kWh)
annualKwh     = monthlyKwh * 12
```

**Variables:**
- `monthlyFixedCharge`: Utility-specific, ranges from $26 to $33/month depending on the utility zone
- `blendedRate`: $0.130/kWh (weighted average of Ontario TOU rates)
- HST rate: 13%

For bill range inputs, the midpoint of the selected range is used as the bill amount, and the low/high bounds of the range feed into the uncertainty calculations.

### System Sizing

The system is sized to offset the estimated annual consumption:

```
systemSizeKw = annualKwh / (365 * peakSunHours * shadingFactor * (1 - systemLosses))
```

**Variables:**
- `peakSunHours`: Region-dependent, ranges from 3.42 (Northern Ontario) to 3.78 (SW Ontario)
- `shadingFactor`: 0.0 to 1.0, derived from rooftop analysis or fallback (typically 0.85-0.95)
- `systemLosses`: 14% (accounts for wiring, inverter conversion, soiling, mismatch, and temperature losses)

The result is rounded up to the nearest panel count based on 400W panels.

### Production Estimation

Annual energy production for year 1:

```
annualProductionKwh = systemSizeKw * effectiveSunHours * 365 * systemEfficiency * winterDerating
```

**Variables:**
- `effectiveSunHours`: Peak sun hours adjusted for panel orientation (azimuth and tilt corrections)
- `systemEfficiency`: Composite of inverter efficiency (97%) and other system factors
- `winterDerating`: Regional factor (87-93%) accounting for snow cover, shorter days, and lower sun angles in Ontario winters

Lifetime production applies a 0.5%/year degradation rate:

```
yearN_production = year1_production * (1 - 0.005)^(N-1)
lifetimeProduction = sum of yearN_production for N = 1 to 25
```

### Cost Estimation

Gross system cost before incentives:

```
grossCost = systemSizeKw * 1000 * costPerWatt
```

**Cost per watt ranges:**
- Residential: $2.60 - $3.50/W (varies by system size; larger systems trend lower)
- Commercial: $2.00 - $3.00/W (economies of scale)

The engine uses interpolation within the range based on system size. Smaller residential systems (< 5 kW) use the upper end; larger systems (> 12 kW) use the lower end.

### Savings Projection

Year 1 savings:

```
year1Savings = annualProductionKwh * electricityRate
```

Subsequent years apply rate escalation and panel degradation:

```
yearN_savings = (year1_production * (1 - 0.005)^(N-1)) * (electricityRate * (1 + 0.035)^(N-1))
```

**Variables:**
- `electricityRate`: Current blended rate ($0.130/kWh)
- Rate escalation: 3.5%/year (historical Ontario average; range 2-5% used for low/high projections)
- Degradation: 0.5%/year

Cumulative savings are summed year over year for the 25-year analysis period.

### Payback Period

```
paybackYears = first year N where cumulativeSavings[N] >= netCostAfterIncentives
```

The engine interpolates between years for a fractional payback period (e.g., 8.3 years rather than rounding to 8 or 9).

---

## Module Details

Each pipeline stage is implemented as a standalone module in `src/lib/quote-engine/`:

| Module File | Stage | Key Dependencies |
|-------------|-------|-----------------|
| `normalizeInput.ts` | normalizeInput | Input validation schemas |
| `resolveLocation.ts` | resolveLocation | Geocoding API, regional solar data tables |
| `resolveRooftop.ts` | resolveRooftop | Google Solar API, fallback estimation tables |
| `estimateUsage.ts` | estimateUsage | Ontario rate tables, utility fixed charges |
| `estimateSystem.ts` | estimateSystem | Panel specifications, sizing constraints |
| `estimateProduction.ts` | estimateProduction | Solar irradiance data, efficiency parameters |
| `estimateCost.ts` | estimateCost | Cost per watt tables, system size interpolation |
| `estimateIncentives.ts` | estimateIncentives | Greener Homes program rules, CCA Class 43.2 |
| `estimateFinancing.ts` | estimateFinancing | Loan amortization, lease/PPA models |
| `estimateSavings.ts` | estimateSavings | Rate escalation, degradation curves |
| `buildConfidence.ts` | buildConfidence | Scoring rules, uncertainty range calculations |
| `mapToUi.ts` | mapToUi | Formatting utilities, chart data builders |

Each module exports a pure function that takes the accumulated pipeline state and returns an enriched version. This design allows individual modules to be unit-tested in isolation and swapped out without affecting the rest of the pipeline.

---

## Error Handling

The pipeline uses a fail-forward approach with graceful degradation:

- If the Google Solar API is unavailable or returns no data, `resolveRooftop` falls back to regional averages and adjusts the confidence score accordingly.
- If geocoding fails, the engine uses city-level regional data instead of address-level precision.
- If any estimation stage encounters invalid data, it uses conservative fallback values and flags the affected confidence dimensions.
- All errors and fallbacks are recorded in the output metadata for transparency.

---

## Versioning

The engine version (`1.0.0`) is embedded in every `QuoteOutput`. This allows the frontend to detect when a saved quote was generated by an older engine version and prompt the user to regenerate if assumptions or formulas have changed.

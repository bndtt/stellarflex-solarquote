# Quote Confidence Scoring System

> **Location:** `src/lib/quote-engine/buildConfidence.ts`
> **Last Updated:** 2026-02-23

---

## Overview

Every quote produced by the StellarFlex engine includes a confidence score that communicates how reliable the estimate is. This score is based on five weighted dimensions, each reflecting a different source of uncertainty in the calculation. The confidence system serves two purposes:

1. **User transparency:** Clearly communicates what the quote is based on and where uncertainty exists.
2. **Internal quality signal:** Drives the quote label (full estimate vs. preliminary vs. remote-only) and determines the width of uncertainty ranges applied to all output figures.

---

## Scoring Dimensions

Each dimension is scored independently on a 0-100 scale.

### 1. Roof Geometry (Weight: 25%)

How accurately the engine knows the roof's usable area, tilt, azimuth, and structural suitability.

| Data Source | Base Score | Notes |
|-------------|-----------|-------|
| Google Solar API | 85 | High-resolution imagery with detected roof segments, pitch, and azimuth |
| Manual user input | 60 | User provides roof dimensions and orientation; no independent verification |
| Regional fallback | 25-30 | No roof data available; engine uses average roof characteristics for the region and property type |

**Score modifiers:**
- Flat roof detected: -5 (less optimal for Ontario latitude)
- Complex roof shape (multiple segments): -5 (more shading potential, harder to estimate)
- Large usable area relative to system size: +5 (more placement flexibility)

### 2. Shading (Weight: 15%)

How accurately the engine accounts for obstructions (trees, neighboring buildings, chimneys) that reduce solar access.

| Data Source | Base Score | Notes |
|-------------|-----------|-------|
| Google Solar API shade analysis | 80 | Uses 3D model and sun path analysis for hourly shade mapping |
| Manual user input | 40 | User reports "no shading" / "some shading" / "significant shading" |
| Fallback assumption | 20 | No shading data; engine assumes a conservative default shading factor |

**Score modifiers:**
- Urban location: -5 (higher probability of neighboring building shade)
- Rural/suburban with large lot: +5 (lower shading likelihood)

### 3. Tariff (Weight: 15%)

How accurately the engine knows the user's actual electricity rate structure.

| Condition | Base Score | Notes |
|-----------|-----------|-------|
| Known utility zone + residential TOU | 80 | Ontario residential rates are OEB-regulated and publicly available |
| No exact address (city-level only) | 65 | Cannot determine exact utility zone; some utilities have slight variations in fixed charges |
| Commercial property | 50-65 | Commercial rates vary significantly (Class A vs. Class B, demand charges, global adjustment) |

**Score adjustments:**
- Base score: 80
- No exact address provided: -15
- Commercial property type: -15
- Both conditions: -30 (scores stack)

### 4. Incentives (Weight: 15%)

How reliably the engine can predict available grants, rebates, and tax benefits.

| Condition | Base Score | Notes |
|-----------|-----------|-------|
| Residential, standard incentives | 70 | Greener Homes grant program is well-documented but availability fluctuates |
| Commercial property | 60 | CCA Class 43.2 is stable tax policy, but actual benefit depends on company's tax situation |

**Score adjustments:**
- Base score: 70
- Commercial property type: -10
- Greener Homes program confirmed active: +10
- Greener Homes program status uncertain: -5

### 5. Input Quality (Weight: 30%)

How precise the user's electricity consumption data is. This dimension has the highest weight because usage drives system sizing, which cascades through every downstream calculation.

| Input Method | Base Score | Notes |
|-------------|-----------|-------|
| `kwh_exact` (user provides kWh) | 90 | Direct measurement; minimal conversion error |
| `bill_exact` (user provides dollar amount) | 70 | Requires reverse-engineering kWh from bill; subject to rate assumption errors |
| `bill_range` (user selects a bracket) | 40 | Wide uncertainty; midpoint assumption may be far from actual usage |

**Score modifiers:**
- No address provided (city only): -15 (compounds uncertainty in rate-to-kWh conversion)
- Annual data provided instead of monthly: +5 (avoids seasonal averaging errors)

---

## Overall Score Calculation

The overall confidence score is a weighted average of the five dimensions:

```
overallScore = (roofGeometry * 0.25) +
               (shading      * 0.15) +
               (tariff       * 0.15) +
               (incentives   * 0.15) +
               (inputQuality * 0.30)
```

The result is rounded to the nearest integer (0-100).

### Example Calculations

**Best case:** Google Solar API data + exact kWh + known address
```
roofGeometry:  85 * 0.25 = 21.25
shading:       80 * 0.15 = 12.00
tariff:        80 * 0.15 = 12.00
incentives:    70 * 0.15 = 10.50
inputQuality:  90 * 0.30 = 27.00
                          ------
Overall:                   82.75 -> 83
```

**Worst case:** No address + fallback rooftop + bill range
```
roofGeometry:  27 * 0.25 =  6.75
shading:       20 * 0.15 =  3.00
tariff:        65 * 0.15 =  9.75
incentives:    70 * 0.15 = 10.50
inputQuality:  25 * 0.30 =  7.50
                          ------
Overall:                   37.50 -> 38
```

---

## Quote Labels

Based on the combination of data sources used, the engine assigns one of three labels:

| Label | Criteria | Typical Overall Score | UI Treatment |
|-------|----------|----------------------|-------------|
| `full_estimate` | Rooftop API data (Google Solar) **AND** exact kWh input | 75-90+ | Green badge, narrow uncertainty ranges |
| `preliminary_estimate` | Partial data: either rooftop API without exact kWh, or exact kWh without rooftop API | 50-75 | Yellow/amber badge, moderate uncertainty ranges |
| `remote_estimate_only` | Regional fallback rooftop data **AND** bill range input | 30-50 | Orange/red badge, wide uncertainty ranges, disclaimer shown |

The label is determined by data source availability, not by the numeric score directly. The score provides granularity within each label tier.

---

## Uncertainty Ranges

Every numeric output in the quote (system size, production, cost, savings, payback) includes three values:

| Value | Description |
|-------|-------------|
| `low` | Conservative estimate (lower production, higher cost, longer payback) |
| `base` | Most likely estimate |
| `high` | Optimistic estimate (higher production, lower cost, shorter payback) |

The width of the uncertainty band is driven by the confidence score:

```
uncertaintyFactor = 1 - (overallScore / 100)
```

This factor is applied asymmetrically to different output types:

| Output | Low Calculation | High Calculation |
|--------|----------------|-----------------|
| Production (kWh) | `base * (1 - uncertaintyFactor * 0.3)` | `base * (1 + uncertaintyFactor * 0.2)` |
| Cost ($) | `base * (1 - uncertaintyFactor * 0.15)` | `base * (1 + uncertaintyFactor * 0.25)` |
| Savings ($) | `base * (1 - uncertaintyFactor * 0.35)` | `base * (1 + uncertaintyFactor * 0.25)` |
| Payback (years) | `base * (1 - uncertaintyFactor * 0.2)` | `base * (1 + uncertaintyFactor * 0.35)` |

The asymmetry reflects real-world risk: costs are more likely to surprise upward, and savings are more likely to surprise downward.

### Example

For a quote with overall confidence of 60 (preliminary estimate):

```
uncertaintyFactor = 1 - (60 / 100) = 0.40

Production base: 10,000 kWh
  low:  10,000 * (1 - 0.40 * 0.3) = 10,000 * 0.88 = 8,800 kWh
  high: 10,000 * (1 + 0.40 * 0.2) = 10,000 * 1.08 = 10,800 kWh

Cost base: $25,000
  low:  $25,000 * (1 - 0.40 * 0.15) = $25,000 * 0.94 = $23,500
  high: $25,000 * (1 + 0.40 * 0.25) = $25,000 * 1.10 = $27,500
```

---

## Dimension Breakdown in UI

The `QuoteUiPayload` includes the full dimension breakdown so the frontend can render a confidence radar chart or breakdown card:

```typescript
confidence: {
  overall: 63,
  label: "preliminary_estimate",
  dimensions: {
    roofGeometry: { score: 85, source: "google_solar", weight: 0.25 },
    shading:      { score: 80, source: "google_solar", weight: 0.15 },
    tariff:       { score: 65, source: "city_level",   weight: 0.15 },
    incentives:   { score: 70, source: "standard",     weight: 0.15 },
    inputQuality: { score: 40, source: "bill_range",   weight: 0.30 },
  },
  improvementHints: [
    "Provide your exact monthly kWh usage for a more accurate estimate.",
    "Enter your full street address to determine your exact utility zone."
  ]
}
```

The `improvementHints` array contains actionable suggestions the user can follow to improve their quote's confidence score. These are generated based on which dimensions scored below their potential maximum.

---

## Design Rationale

**Why these weights?**

- **Input quality (30%)** has the highest weight because inaccurate usage data cascades through every calculation: wrong usage leads to wrong system size, wrong production, wrong cost, wrong savings, and wrong payback. Getting the usage right matters more than any other single factor.
- **Roof geometry (25%)** is the second-highest because it directly determines how many panels can be installed and their orientation, which is fundamental to production estimates.
- **Shading, tariff, and incentives (15% each)** are important but affect narrower aspects of the quote. Shading modifies production; tariff affects the dollar value of savings; incentives affect net cost. Each is significant but not as foundational as usage or roof data.

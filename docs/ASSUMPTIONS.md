# Assumptions — StellarFlex Quote Engine v1.0.0

All assumptions used by the quote engine, with sources. Update this file when calibrating or adding data.

---

## Electricity Rates (Ontario)

| Parameter | Value | Source |
|-----------|-------|--------|
| Off-peak TOU rate | 8.7 ¢/kWh | Ontario Energy Board, Jan 2026 |
| Mid-peak TOU rate | 12.2 ¢/kWh | Ontario Energy Board, Jan 2026 |
| On-peak TOU rate | 18.2 ¢/kWh | Ontario Energy Board, Jan 2026 |
| Blended average rate | 13.0 ¢/kWh | Weighted TOU average |
| HST | 13% | Canada Revenue Agency |
| Rate escalation | 3.5%/year (range: 2–5%) | OEB historical rate trends |

### Monthly Fixed Charges by Utility

| Utility | Fixed Charge |
|---------|-------------|
| Hydro One | $32.85/mo |
| Toronto Hydro | $26.16/mo |
| Hydro Ottawa | $28.93/mo |
| London Hydro | $27.55/mo |
| Default (Ontario) | $30.00/mo |

---

## Solar Production (Ontario Regions)

| Region | Peak Sun Hours (daily) | Irradiance (kWh/m²/yr) | Winter Derating |
|--------|----------------------|----------------------|----------------|
| Greater Toronto Area | 3.67 | 1,340 | 0.92 |
| Ottawa / Eastern ON | 3.72 | 1,358 | 0.90 |
| Southwestern Ontario | 3.78 | 1,380 | 0.93 |
| Central Ontario | 3.56 | 1,300 | 0.90 |
| Northern Ontario | 3.42 | 1,249 | 0.87 |
| Ontario Average | 3.60 | 1,314 | 0.91 |

**Source:** NRCan Photovoltaic Potential Maps, RETScreen Clean Energy Database

---

## Equipment

| Parameter | Value | Source |
|-----------|-------|--------|
| Panel wattage | 400W | Tier 1 spec (Canadian Solar / Longi / QCells) |
| Panel area | 1.92 m² | Standard residential panel |
| Panel efficiency | 20.8% | Manufacturer datasheet |
| Annual degradation | 0.5%/year | Manufacturer warranty spec |
| System losses | 14% | Industry standard (wiring, soiling, snow, clipping) |
| Inverter efficiency | 97% | Tier 1 string inverter |
| DC:AC ratio | 1.2 | Standard design practice |

---

## Cost Benchmarks (2026, Canadian $)

| Property Type | Low ($/W) | Base ($/W) | High ($/W) |
|--------------|-----------|-----------|-----------|
| Residential | $2.60 | $3.00 | $3.50 |
| Commercial | $2.00 | $2.50 | $3.00 |

### Cost Breakdown

| Component | Residential | Commercial |
|-----------|------------|------------|
| Equipment | 55% | 60% |
| Labor | 30% | 25% |
| Permits & interconnection | 5% | 5% |
| Overhead & margin | 10% | 10% |

---

## Incentives

| Program | Value | Eligibility | Confidence |
|---------|-------|-------------|-----------|
| Ontario Net Metering | ~30% of production offset | All | 85% |
| Canada Greener Homes Grant | Up to $5,000 | Residential | 70% |
| Canada Greener Homes Loan | Up to $40,000 @ 0% | Residential | 65% |
| CCA Class 43.1/43.2 | 50% first-year deduction | Commercial | 80% |

**CCA tax calculation:** `installedCost × 50% × 26.5%` (combined federal + Ontario corporate rate)

---

## Financing Defaults

| Type | Term | Rate | Down Payment |
|------|------|------|-------------|
| Cash | — | — | 100% |
| Solar Loan | 15 years | 6.5% APR | $0 |
| Lease/PPA | 20 years | 2.5%/yr escalation | $0 |

PPA rate: current utility rate minus 15% discount.

---

## Bill-to-kWh Conversion

**Formula:** `monthlyKwh = (bill / 1.13 - fixedCharge) / blendedRate`

| Bill Range | Midpoint Used | Estimated kWh/mo |
|-----------|--------------|------------------|
| Under $100 | $75 | ~200 |
| $100–$200 | $150 | ~750 |
| $200–$300 | $250 | ~1,350 |
| $300–$500 | $400 | ~2,300 |
| $500+ | $650 | ~3,850 |

---

## Notes

- All dollar values are Canadian dollars (CAD)
- Incentive availability may fluctuate; confidence scores reflect this uncertainty
- Commercial tariffs are simplified (demand charges, Class A/B not modeled in v1.0)
- Seasonal production factors applied: summer ~115%, winter ~88% of average
- Payback calculations are not NPV-discounted (simplified for consumer comprehension)

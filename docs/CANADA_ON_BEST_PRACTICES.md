# Canada / Ontario Solar Quoting — Best Practices

Guidelines for maintaining and improving quote accuracy for Ontario/Canada addresses.

---

## Google Solar API Coverage

Google Solar API has **limited and inconsistent coverage** for Canadian addresses. Many Ontario locations return no data or low-quality results.

### Required behavior:
- **Never hard-fail** if the API returns no data
- Fall back to regional production baselines from NRCan
- Lower roof/shading confidence to 20–30%
- Widen low/base/high uncertainty ranges
- Label the quote as `remote_estimate_only` or `preliminary_estimate`
- Suggest the user provide exact kWh data or schedule a site survey

---

## Regional Solar Variation

Ontario solar production varies significantly by region:

- **Southwestern Ontario** (Windsor, London) gets the most sun: ~1,380 kWh/m²/year
- **Northern Ontario** (Sudbury, Thunder Bay) gets the least: ~1,249 kWh/m²/year
- **Difference:** ~10% between best and worst regions

Always resolve the city to the correct regional baseline. Never use a single Ontario-wide average if the city is known.

---

## Winter Considerations

- Snow coverage reduces production in Dec–Feb but panels at 25°+ tilt self-clear
- Cold temperatures **improve** panel efficiency (lower temperature coefficient losses)
- Winter derating factors range from 0.87 (Northern) to 0.93 (Southwestern)
- Seasonal factors are applied monthly, not as a flat annual adjustment

---

## Utility Zones

Ontario has 60+ local distribution companies. The engine currently models 4 major ones:

| Utility | Coverage Area | Key Difference |
|---------|--------------|----------------|
| Hydro One | Rural/suburban Ontario | Highest fixed charges ($32.85) |
| Toronto Hydro | City of Toronto | Lower fixed charges ($26.16) |
| Hydro Ottawa | Ottawa region | Mid-range fixed charges |
| London Hydro | London, ON | Mid-range fixed charges |

**All use the same OEB-regulated TOU rates.** The difference is in fixed charges and delivery rates.

For unknown cities, default to Hydro One (most common for residential outside major cities).

---

## Incentive Programs

### Currently Modeled:
1. **Net Metering** — province-wide, regulated by OEB. Reliable.
2. **Canada Greener Homes Grant** — federal, up to $5,000. Funding fluctuates.
3. **Canada Greener Homes Loan** — federal, interest-free up to $40,000.
4. **CCA Class 43.1/43.2** — federal tax deduction for commercial solar. Stable.

### Not Yet Modeled (Future):
- Municipal property tax exemptions (varies by municipality)
- IESO programs (if reintroduced)
- Provincial EV + solar bundle programs
- Indigenous community programs

### Confidence Notes:
- Net Metering: high confidence (85%) — it's law
- Greener Homes: moderate (65–70%) — program funding is not guaranteed
- CCA: moderate-high (80%) — tax law is stable but business eligibility varies

---

## Commercial Quoting Challenges

Commercial solar in Ontario has more variables than residential:

1. **Demand charges** — Class A and B customers pay differently; not modeled in v1.0
2. **Load profiles** — businesses use electricity differently than homes
3. **Roof complexity** — commercial roofs vary (flat, membrane, structural load)
4. **System size** — much larger range (10 kW to 500+ kW)
5. **Tax treatment** — CCA deductions depend on business structure

**Best practice:** Commercial quotes should have lower confidence than residential, and the engine reflects this with -15% tariff confidence and -10% incentives confidence for commercial.

---

## Privacy & Compliance

- **PIPEDA** applies to all personal data collection (name, email, phone, address)
- Store only what's needed for the quote
- Provide clear privacy policy disclosure
- Allow users to request data deletion
- Do not sell or share contact data without consent

---

## Data Refresh Schedule

| Data Type | Refresh Frequency | Source |
|-----------|-------------------|--------|
| TOU rates | Semi-annually (May & Nov) | Ontario Energy Board |
| Fixed charges | Annually | Individual utility rate schedules |
| Cost per watt | Quarterly | Industry benchmarks, installer surveys |
| Incentive programs | Quarterly | NRCan, CRA, OEB announcements |
| Solar irradiance | Stable (rarely changes) | NRCan PV Potential data |

---

## Future Calibration Path

1. Collect actual installation data (real system sizes, costs, production) from completed projects
2. Compare engine estimates vs actual outcomes
3. Adjust regional baselines, cost benchmarks, and confidence weights
4. Add more utility zones as coverage expands
5. Integrate real-time rate data via OEB API (when available)
6. Add demand charge modeling for commercial quotes

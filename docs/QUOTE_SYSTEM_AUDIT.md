# Quote System Audit — SolarQuote

**Date:** 2026-02-23
**Status:** Pre-implementation audit

---

## Current Architecture

The quote system is a **UI-only shell** with no backend logic:

| Component | Status | Notes |
|-----------|--------|-------|
| Quote entry page (`/get-quote`) | Exists | Residential/commercial toggle + fallback form |
| Quote calculation engine | **Missing** | No math, no algorithms, no estimation |
| Quote API endpoints | **Missing** | No `/api/quote/*` routes |
| Quote results display | **Missing** | No results page or component |
| Database/persistence | **Missing** | No Supabase, no storage |
| Provider integration | **Placeholder** | Env vars point to `provider.com` (fake) |
| Form submission | **Missing** | Fallback form captures state but doesn't submit |
| Types/interfaces | **Missing** | No TypeScript types for quotes |

### Current Flow

```
User visits /get-quote
  → Selects residential or commercial
  → Sees either:
    a) iframe embed (placeholder URLs, won't load)
    b) 4-step fallback form (captures address, bill range, contact info)
  → Step 4 "Submit" sets React state to "submitted" (no backend call)
  → Shows "thank you" message (no data saved anywhere)
```

### Existing Quote-Related Files

- `src/app/get-quote/page.tsx` — Entry page with type toggle + fallback form
- `src/components/quote/` — Empty directory
- `src/components/forms/` — Empty directory
- `.env.local` — Placeholder embed URLs

---

## Pain Points & Accuracy Bottlenecks

1. **No calculation logic exists** — The site cannot generate any quote
2. **Bill input is a dropdown range** (e.g., "$100–$200") — not precise enough for accurate sizing
3. **No address geocoding** — Cannot determine lat/lng, sun exposure, or roof characteristics
4. **No Ontario-specific data** — No utility rates, incentive programs, or regional solar production baselines
5. **No rooftop intelligence** — No Google Solar API or equivalent integration
6. **No fallback path** — If a provider fails, nothing happens (because no provider is connected)
7. **No confidence scoring** — User has no idea how reliable the estimate is
8. **No persistence** — Quotes aren't saved, can't be retrieved, can't be debugged

---

## Refactor Plan

### Approach: Build a Modular Deterministic Quote Engine

Instead of depending on a single external provider iframe, build an in-house quote calculation engine that:

1. Takes user inputs (address, bill/kWh, property type)
2. Optionally enriches with rooftop API data (Google Solar, etc.)
3. Falls back to Ontario regional baselines when provider data is missing
4. Calculates system sizing, production, costs, incentives, savings
5. Returns `low/base/high` ranges with confidence scores
6. Maps output to existing UI schema for backward compatibility

### Module Structure

```
src/lib/quote-engine/
  ├── index.ts              — Main orchestrator (generateQuote)
  ├── normalize-input.ts    — Input validation + normalization
  ├── estimate-usage.ts     — Bill → kWh estimation
  ├── resolve-location.ts   — Address → lat/lng + region
  ├── resolve-rooftop.ts    — Rooftop API adapter (with fallback)
  ├── estimate-production.ts — Solar production estimation
  ├── estimate-system.ts    — System sizing
  ├── estimate-cost.ts      — Installed cost estimation
  ├── estimate-incentives.ts — Ontario/Canada incentives
  ├── estimate-financing.ts  — Financing options (lease/loan/cash)
  ├── estimate-savings.ts    — Projected savings
  ├── build-confidence.ts    — Confidence scoring
  ├── build-ranges.ts        — Uncertainty bands (low/base/high)
  ├── build-output.ts        — Final output assembly
  ├── map-to-ui.ts           — Backward compatibility mapper
  └── data/
      └── ontario-data.ts    — Ontario rates, incentives, solar baselines
```

### Compatibility Strategy

The existing `get-quote/page.tsx` will be updated to:
1. Use the fallback form to collect inputs
2. Call `/api/quote` with the form data
3. Display results in a new `QuoteResults` component
4. Keep the iframe embed option for when real provider URLs are configured

---

## Migration Strategy

- **No database migration needed** — No DB exists; quote persistence is new functionality
- **No breaking changes** — Current fallback form UX is preserved; results display is additive
- **Env vars** — Add optional `GOOGLE_SOLAR_API_KEY` for rooftop enrichment
- **API route** — New `/api/quote/route.ts` endpoint

---

## Compatibility Risks

| Risk | Mitigation |
|------|-----------|
| UI expects old payload shape | Build `mapQuoteOutputToUiSchema` mapper |
| Google Solar API unavailable for Ontario | Ontario fallback logic with regional baselines |
| No database for persistence | Quotes returned directly; persistence is optional Phase 4 enhancement |
| Form inputs too imprecise | Allow optional exact kWh input; confidence reflects input quality |

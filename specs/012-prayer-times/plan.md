# Implementation Plan: Prayer Times & Ramadan Calendar

**Branch**: `012-prayer-times` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

## Summary

Build the `prayer` module under `src/modules/prayer/`:
1. Static dataset `data/prayer/district-offsets.json` documenting all 64 districts with their official Islamic Foundation Bangladesh minute offsets relative to Dhaka.
2. Astronomical solar calculation engine (`src/modules/prayer/astronomy.ts`) implementing Islamic Foundation Bangladesh calculation parameters (18° Fajr & Isha twilight angle, Hanafi shadow factor 2 / Shafi factor 1, elevation adjustments) with timezone UTC+6.
3. Service layer (`src/modules/prayer/service.ts`) generating:
   - Daily prayer times for any date & district
   - Ramadan 30-day schedule mapped to Gregorian, Hijri, and Bangla dates
   - Formatting in 24h, 12h, and Bangla numerals with periods of day (ভোর, সকাল, দুপুর, বিকাল, সন্ধ্যা, রাত).
4. Routes (`src/modules/prayer/routes.ts`) registered under `/v1/prayer/`:
   - `GET /v1/prayer/times`
   - `GET /v1/prayer/ramadan`
   - `GET /v1/prayer/offsets`
   - `GET /v1/prayer/offsets/{district}`
5. Register `prayerRoutes` in `src/app.ts` and add module descriptor to `MODULES`.
6. Unit tests (`tests/unit/prayer/`) and contract tests (`tests/contract/prayer.test.ts`).
7. Update docs, landing page, and `DATA_SOURCES.md`.

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Uses Islamic Foundation Bangladesh parameters & published district offsets | ✅ |
| II. Privacy | No user data collected or stored | ✅ |
| III. Bilingual | All prayer names bilingual (`_en`, `_bn`), accepts Bangla digits for dates/days | ✅ |
| IV. Contract | Standard envelope `{ success, data, meta }` with Zod OpenAPI schemas | ✅ |
| V. Test-first | Full unit test suite for calculation engine + contract tests for all endpoints | ✅ |
| VI. Simplicity | Self-contained, pure TypeScript, zero external dependencies | ✅ |

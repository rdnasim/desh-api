# Implementation Plan: Dhaka Metro Rail (MRT Line-6)

**Branch**: `013-dhaka-metro` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

## Summary

Build the `metro` module under `src/modules/metro/`:
1. Static dataset `data/metro/stations.json` containing the 16 operational + 1 planned station with official codes, coordinates, and cumulative distance.
2. Register `metro.stations` in `scripts/datasets.ts` and `data/meta.json`, compiling to `src/generated/metro.stations.ts`.
3. Schemas in `src/modules/metro/schemas.ts`:
   - `MetroStationSchema`
   - `MetroFareCalculationSchema`
   - `MetroTimetableSchema`
   - `MetroLineSchema`
4. Core business logic in `src/modules/metro/service.ts`:
   - Station lookup by slug or station code
   - Official DMTCL distance-based fare matrix calculation with 10% MRT Pass discount
   - Station ordering, estimated travel time computation (average ~2 mins per station hop)
   - Timetable definitions reflecting DMTCL's latest published schedule.
5. Routes in `src/modules/metro/routes.ts`:
   - `GET /v1/metro/stations`
   - `GET /v1/metro/stations/{slug}`
   - `GET /v1/metro/fare`
   - `GET /v1/metro/timetable`
   - `GET /v1/metro/lines`
6. Register in `src/app.ts`, `src/docs.ts`, `src/landing.ts`, and `README.md`.
7. Unit tests in `tests/unit/metro/service.test.ts` and contract tests in `tests/contract/metro.test.ts`.

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Cites Dhaka Mass Transit Company Limited (DMTCL) official fare matrix & schedules | ✅ |
| II. Privacy | No commuter tracking or ride records stored | ✅ |
| III. Bilingual | All station names in English and Bangla; Bangla fares and numerals included | ✅ |
| IV. Contract | Standard envelope `{ success, data, meta }` with full OpenAPI schemas | ✅ |
| V. Test-first | Full unit test coverage for fare calculations and contract tests for endpoints | ✅ |

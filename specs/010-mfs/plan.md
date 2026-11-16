# Implementation Plan: Mobile Financial Services (MFS)

**Branch**: `010-mfs` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

## Summary

Build the `mfs` module under `src/modules/mfs/`:
1. Static dataset `data/mfs/providers.json` documenting the major 5 providers with tariff schedules, limits, USSD codes, helplines, and parent banks.
2. Core calculation engine `src/modules/mfs/calculator.ts` supporting standard, priyo, app, USSD, and ATM channels, digit normalisation (`normalizeBanglaDigits`), and comparisons.
3. Hono routes `src/modules/mfs/routes.ts` mounted at `/v1/mfs/`:
   - `GET /v1/mfs/providers`
   - `GET /v1/mfs/providers/{slug}`
   - `GET /v1/mfs/charges`
   - `GET /v1/mfs/compare`
   - `GET /v1/mfs/ussd`
4. Register `mfsRoutes` in `src/app.ts` and add module descriptor to `MODULES`.
5. Unit and contract test suite covering all calculation branches and edge cases.

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Each provider cites official fee schedule URL and verification date | ✅ |
| II. Privacy | No account numbers or personal data accepted or stored | ✅ |
| III. Bilingual | All provider names and parents have `_en` and `_bn`; accepts Bangla digits | ✅ |
| IV. Contract | Standard envelope `{ success, data, meta }` and Zod OpenAPI schemas | ✅ |
| V. Test-first | Unit tests for calculation edge cases; contract tests for all routes | ✅ |
| VI. Data as files | Tariff data stored as pretty JSON in `data/mfs/providers.json` | ✅ |
| VII. Simplicity | Zero external dependencies; fast in-memory calculation | ✅ |

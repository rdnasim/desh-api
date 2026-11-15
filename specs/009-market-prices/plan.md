# Implementation Plan: Market Prices

**Branch**: `009-market-prices` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

`market` module: `fetchTcb()` (listing → newest .xlsx → `readXlsx` → `parseTcb`), served by
`/v1/market/prices` with the shared `lastGood` KV helper (`src/lib/last-good.ts`, now also used by
gold); `/v1/fuel/prices` from `data/market/fuel.json`. See [research.md](./research.md).

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | TCB list date and reference returned; fuel notice cited; 503 rather than old data beyond 7 days | ✅ |
| II. Privacy | No personal input | ✅ |
| III. Bilingual | TCB Bangla names kept verbatim, English names added via catalog | ✅ |
| IV. Contract | Envelope, OpenAPI examples, 503/404 documented | ✅ |
| V. Test-first | Reader, parser, listing and contract tests on the real files | ✅ |
| VI. Data as files | Catalog and fuel in `data/market/`; TCB live (daily) | ⚠️ as for gold |
| VII. Simplicity | No new dependencies; reuses the approved KV namespace | ✅ |

## Complexity Tracking

| Item | Why | Simpler alternative rejected because |
|---|---|---|
| Hand-written .xlsx reader | TCB publishes spreadsheets | An xlsx library adds a large dependency to the Worker |
| Runtime dependency on tcb.gov.bd | Prices change daily | A committed file would be stale within a day |

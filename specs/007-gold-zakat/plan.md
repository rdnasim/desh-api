# Implementation Plan: Gold Price & Zakat

**Branch**: `007-gold-zakat` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

A `gold` module: `fetchBajus()` reads and parses BAJUS's price page (Cloudflare-cached 30 min);
`/v1/gold/prices` returns it, `/v1/zakat` computes zakat from it. New error code
`upstream_unavailable` (503). See [research.md](./research.md).

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | BAJUS cited with the list's effective date; 503 instead of stale/guessed prices | ✅ |
| II. Privacy | Wealth is a number only; nothing stored | ✅ |
| III. Bilingual | Errors have `message_bn` | ✅ |
| IV. Contract | Envelope, OpenAPI examples, 503 documented | ✅ |
| V. Test-first | Parser and zakat unit tests on a saved page; contract tests stub the upstream | ✅ |
| VI. Data as files | Live data, not a file: prices change daily | ⚠️ justified below |
| VII. Simplicity | No database or cron; only a cached outbound fetch | ✅ |
| VIII. Neutral | Both nisab bases shown; disclaimer defers to scholars | ✅ |

## Project Structure

```text
src/modules/gold/{schemas,bajus,zakat,routes}.ts
tests/golden/gold/bajus-gold-price-2026-11-14.txt
tests/{unit/gold/service,contract/gold}.test.ts
```

## Complexity Tracking

| Item | Why | Simpler alternative rejected because |
|---|---|---|
| Runtime dependency on bajus.org | Prices change daily | A committed file would be stale within a day; a cron + database is more infrastructure |

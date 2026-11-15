# Implementation Plan: Bangla Mock Data Generator

**Branch**: `004-mock-data` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

A `mock` module that combines a new name list (`data/mock/names.json`) with the existing geo and
phone-prefix data to produce synthetic people and addresses. Generation uses the existing seeded
PRNG (`src/lib/random.ts`), so a seed gives repeatable, cacheable output. See
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), same Worker · **Dependencies**: none new ·
**Storage**: static JSON (`data/mock/names.json`) · **Testing**: unit (determinism, filters,
validator round-trip over 1,000 records, geo consistency), data integrity, contract tests ·
**Performance**: O(count) per request, count ≤ 100

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Names list and census weights cited in data/meta.json; addresses use the cited geo data | ✅ |
| II. Privacy | Synthetic only; religion never returned; disclaimer that numbers may coincide with real ones; `example.com` emails | ✅ |
| III. Bilingual | Every name and address line in English and Bangla (NFC) | ✅ |
| IV. Contract | `/v1/mock/people`, `/v1/mock/addresses`, envelope, OpenAPI examples | ✅ |
| V. Test-first | Generator tests before code | ✅ |
| VI. Data as files | Names in `data/mock/names.json`, validated in CI | ✅ |
| VII. Simplicity | No new dependencies or infrastructure | ✅ |
| VIII. Neutral | Names from all four main traditions; no religious labels in output | ✅ |

## Project Structure

```text
data/mock/names.json
src/modules/mock/{schemas,service,routes}.ts
tests/unit/mock/service.test.ts
tests/data/mock.test.ts
tests/contract/mock.test.ts
```

## Complexity Tracking

No violations.

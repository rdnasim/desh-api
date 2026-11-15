# Implementation Plan: Education Data — Universities

**Branch**: `006-education` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

An `education` module serving UGC's university list (`data/education/universities.json`,
`university-categories.json`), rebuilt by `scripts/import/ugc.ts`. See [research.md](./research.md).

## Technical Context

TypeScript 5.9, same Worker, no new dependencies · static JSON (181 records) · unit, data and
contract tests · O(n) filtering over 181 records.

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | UGC cited with its update date; district only when unambiguous | ✅ |
| II. Privacy | No names of people; institutional contacts only | ✅ |
| III. Bilingual | Category names bilingual; university `name_bn` only where UGC has it (1 of 181) | ⚠️ follow-up |
| IV. Contract | `/v1/universities…`, envelope, OpenAPI examples | ✅ |
| V. Test-first | Tests written before service and routes | ✅ |
| VI. Data as files | `data/education/*.json`, validated in CI | ✅ |
| VII. Simplicity | No new dependencies | ✅ |
| VIII. Neutral / licence | Public government information, credited | ✅ |

## Project Structure

```text
data/education/{universities,university-categories}.json
scripts/import/ugc.ts
src/modules/education/{schemas,service,routes}.ts
tests/{unit/education/service,data/education,contract/education}.test.ts
```

## Complexity Tracking

| Item | Why | Simpler alternative rejected because |
|---|---|---|
| Most universities lack `name_bn` | UGC publishes Bangla names for 1 of 181 | Transliterating official names would be unsourced |

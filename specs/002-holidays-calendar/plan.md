# Implementation Plan: Holidays & Calendar

**Branch**: `002-holidays-calendar` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-holidays-calendar/spec.md`

## Summary

Add a `holidays` module to the existing Worker: official public-holiday lists per year (general,
executive-order and optional holidays), a separate bank calendar from Bangladesh Bank's circular,
a date check, and working-day counts. Data is transcribed from the official documents into
`data/holidays/`, one record per holiday with its source and any later amendment, and served
through the same build pipeline, envelope and tests as Phase 1. Bangla dates come from the
existing calendar module. See [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), same Worker as Phase 1

**Primary Dependencies**: existing stack only (Hono, `@hono/zod-openapi`, Zod); no new packages

**Storage**: static JSON in `data/holidays/`, compiled by `scripts/build-data.ts` (no database)

**Testing**: Vitest in workerd: unit (working-day maths), data integrity (every holiday sourced,
dates valid and inside their year), contract tests, and an entry-by-entry check against the
transcribed official tables

**Target Platform**: Cloudflare Workers (existing)

**Project Type**: Web service, new module in the existing single project

**Performance Goals**: same as Phase 1 (p95 < 200 ms from Dhaka); working-day counts over ≤ 366
days are O(days)

**Constraints**: no extrapolation for unpublished years; tentative dates flagged; two reviewers for
holiday data changes

**Scale/Scope**: ~30 general + ~28 bank entries per year; 2 years initially

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Every holiday cites its document; amendments recorded with their own reference; unpublished years return 404 | ✅ |
| II. Privacy | No personal data | ✅ |
| III. Bilingual | `name_en` + `name_bn` required; Bangla date per holiday date | ✅ |
| IV. Contract | `/v1/holidays…` with envelope, slugs/ids, OpenAPI examples | ✅ |
| V. Test-first | Working-day maths and date checks test-first; data tests compare against transcribed tables | ✅ |
| VI. Data as files | `data/holidays/*.json`, validated in CI | ✅ |
| VII. Simplicity | No new infrastructure or dependencies | ✅ |
| VIII. Neutral content | Names exactly as in the official list; no commentary; national days only from an official list | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/002-holidays-calendar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/holidays.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
data/holidays/
├── years.json          # HolidayYear: per year and calendar, the source document(s)
└── holidays.json       # Holiday records for all years and both calendars

src/modules/holidays/
├── schemas.ts
├── service.ts          # list, isHoliday, workingDays
└── routes.ts

tests/
├── unit/holidays/service.test.ts
├── data/holidays.test.ts
└── contract/holidays.test.ts
```

**Structure Decision**: One new vertical module following the Phase 1 pattern. Records for both
calendars live in one file with a `calendar` field, so a holiday that both lists share is visibly
the same date in both, while each keeps its own source.

## Complexity Tracking

No violations.

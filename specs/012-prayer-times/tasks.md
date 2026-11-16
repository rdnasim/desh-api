# Tasks: Prayer Times & Ramadan Calendar

**Branch**: `012-prayer-times`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task List

- [x] **Task 1: Dataset & Schemas**
  - [x] Create `src/modules/prayer/schemas.ts` defining Zod OpenAPI schemas.
  - [x] Create `data/prayer/district-offsets.json` with 64 district offsets.
  - [x] Register `prayer.district-offsets` in `scripts/datasets.ts` and `data/meta.json`.
  - [x] Run `pnpm data:build` to compile to `src/generated/prayer.district-offsets.ts`.

- [x] **Task 2: Calculation Engine & Service**
  - [x] Implement `src/modules/prayer/astronomy.ts` for solar position, equation of time, solar declination, and prayer time calculations.
  - [x] Implement `src/modules/prayer/service.ts` for daily prayer times, district adjustments, Ramadan schedule generator, and bilingual time formatting.
  - [x] Unit tests for astronomy calculations and prayer schedules in `tests/unit/prayer/service.test.ts`.

- [x] **Task 3: Routes & Application Registration**
  - [x] Implement `src/modules/prayer/routes.ts` with `/v1/prayer/times`, `/v1/prayer/ramadan`, `/v1/prayer/offsets`, `/v1/prayer/offsets/{district}`.
  - [x] Mount `prayerRoutes` in `src/app.ts` and add module to `MODULES` list.
  - [x] Contract tests in `tests/contract/prayer.test.ts`.

- [x] **Task 4: Documentation & Verification**
  - [x] Update `DATA_SOURCES.md`, `README.md`, `src/landing.ts`, and docs page.
  - [x] Run `vitest run` (all unit and contract tests passing).
  - [x] Commit and merge to `main`.

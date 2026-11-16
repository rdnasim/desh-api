# Tasks: Dhaka Metro Rail (MRT Line-6)

**Branch**: `013-dhaka-metro`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task List

- [x] **Task 1: Dataset & Schemas**
  - [x] Create `src/modules/metro/schemas.ts` defining OpenAPI schemas.
  - [x] Create `data/metro/stations.json` with 17 stations (16 operational + 1 under construction).
  - [x] Register `metro.stations` in `scripts/datasets.ts` and `data/meta.json`.
  - [x] Compile with `pnpm data:build`.

- [x] **Task 2: Service & Business Logic**
  - [x] Implement `src/modules/metro/service.ts` for station lookups, fare matrix computation with MRT Pass 10% discount, and timetables.
  - [x] Unit tests in `tests/unit/metro/service.test.ts`.

- [x] **Task 3: Routes & App Registration**
  - [x] Implement `src/modules/metro/routes.ts` with `/v1/metro/stations`, `/v1/metro/stations/{slug}`, `/v1/metro/fare`, `/v1/metro/timetable`, `/v1/metro/lines`.
  - [x] Mount in `src/app.ts`, register in `src/docs.ts`.
  - [x] Contract tests in `tests/contract/metro.test.ts`.

- [x] **Task 4: Landing Page, Docs & Verification**
  - [x] Update `README.md`, `src/landing.ts`, `DATA_SOURCES.md`.
  - [x] Run test suite (`vitest run`).
  - [x] Merge to `main`.

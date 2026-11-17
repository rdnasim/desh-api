# Architecture & Implementation Plan: 021-rivers

## 1. Data Design
- `data/rivers/rivers.json`: 30 principal rivers sorted by `slug`.
- Registered in `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/rivers/schemas.ts`:
  - `RiverSchema`: `slug`, `name_en`, `name_bn`, `origin`, `outflow`, `length_km`, `divisions`, `districts`, `tributaries`, `distributaries`, `is_transboundary`, `description_en`, `description_bn`, `special_features`.

## 3. Service Layer
- `src/modules/rivers/service.ts`:
  - `listRivers(filters)`
  - `getRiver(slug)`
  - `listTransboundaryRivers()`

## 4. Routes
- `src/modules/rivers/routes.ts`: mounted at `/v1/rivers` in `src/app.ts`.

## 5. Verification
- Contract tests: `tests/contract/rivers.test.ts`
- Unit tests: `tests/unit/rivers/service.test.ts`
- Smoke test in `scripts/smoke.ts`

# Architecture & Implementation Plan: 022-ports

## 1. Data Design
- `data/ports/land-ports.json`: 24 statutory BLPA land ports sorted by `slug`.
- Registered in `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/ports/schemas.ts`:
  - `LandPortStatusSchema`: `'operational' | 'under_development' | 'inactive'`
  - `LandPortOperatorTypeSchema`: `'blpa_operated' | 'private_bot' | 'railway_joint'`
  - `LandPortSchema`: `slug`, `code`, `name_en`, `name_bn`, `status`, `operator_type`, `established_year`, `division`, `district`, `upazila`, `counterpart_indian_lcs`, `counterpart_state`, `key_commodities`, `facilities`, `has_rail_link`, `has_passenger_immigration`, `description_en`, `description_bn`.

## 3. Service Layer
- `src/modules/ports/service.ts`:
  - `listPorts(filters)`
  - `getPort(identifier)`
  - `listPortTypes()`

## 4. Routes
- `src/modules/ports/routes.ts`: mounted at `/v1/ports` in `src/app.ts`.

## 5. Verification
- Contract tests: `tests/contract/ports.test.ts`
- Unit tests: `tests/unit/ports/service.test.ts`
- Smoke test in `scripts/smoke.ts`

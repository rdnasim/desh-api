# Architecture & Implementation Plan: 020-heritage

## 1. Data Design
- `data/heritage/sites.json`: 35 archaeological, historical, and tourism sites sorted by `slug`.
- Registered in `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/heritage/schemas.ts`:
  - `HeritageCategorySchema`: `'archaeological' | 'historical' | 'natural' | 'cultural' | 'monument'`
  - `HeritageTypeSchema`: `'unesco_world_heritage' | 'national_heritage' | 'eco_tourism' | 'landmark'`
  - `HeritageEntryFeeSchema`: `citizen_bdt`, `saarc_bdt`, `foreign_bdt`, `is_free`
  - `HeritageSiteSchema`: `slug`, `name_en`, `name_bn`, `category`, `type`, `unesco_id`, `period_era`, `division`, `district`, `upazila`, `coordinates`, `description_en`, `description_bn`, `highlights`, `best_time_to_visit`, `entry_fee`.

## 3. Service Layer
- `src/modules/heritage/service.ts`:
  - `listHeritageSites(filters)`
  - `getHeritageSite(slug)`
  - `listUnescoSites()`

## 4. Routes
- `src/modules/heritage/routes.ts`: mounted at `/v1/heritage` in `src/app.ts`.

## 5. Verification
- Contract tests: `tests/contract/heritage.test.ts`
- Unit tests: `tests/unit/heritage/service.test.ts`
- Smoke test in `scripts/smoke.ts`

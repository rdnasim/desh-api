# Architecture & Implementation Plan: 019-airports

## 1. Data Design
- `data/airports/airports.json`: 15 CAAB airports and aviation facilities sorted by `slug`.
- Registered in `scripts/datasets.ts` and documented in `data/meta.json`.

## 2. Types & Schemas
- `src/modules/airports/schemas.ts`:
  - `AirportTypeSchema`: `'international' | 'domestic' | 'short_takeoff' | 'military_airstrip'`
  - `AirportStatusSchema`: `'operational' | 'under_development' | 'inactive'`
  - `AirportRunwaySchema`: `length_ft`, `surface`
  - `AirportCoordinatesSchema`: `latitude`, `longitude`
  - `AirportSchema`: `slug`, `iata_code`, `icao_code`, `name_en`, `name_bn`, `type`, `status`, `division`, `district`, `city`, `coordinates`, `elevation_ft`, `runways`, `website`.

## 3. Service Layer
- `src/modules/airports/service.ts`:
  - `listAirports(filters)`
  - `getAirportByCode(codeOrSlug)`
  - `listAirportTypes()`

## 4. Routes
- `src/modules/airports/routes.ts`: mounted at `/v1/airports` in `src/app.ts`.

## 5. Verification
- Contract tests: `tests/contract/airports.test.ts`
- Unit tests: `tests/unit/airports/service.test.ts`
- Live smoke tests: `scripts/smoke.ts`

# Architecture & Implementation Plan: Bangladesh Railway Intercity Directory

## 1. Data Design
- `data/railway/trains.json`: Intercity express train routes in Bangladesh. Sorted by `slug`.
- `data/railway/classes.json`: Official BR coach classes. Sorted by `slug`.
- `data/railway/stations.json`: Key junction and terminus stations. Sorted by `slug`.
- Register in `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/railway/schemas.ts`:
  - `RailwayClassCodeSchema`: `'SHOVON' | 'S_CHAIR' | 'FIRST_SEAT' | 'FIRST_BERTH' | 'SNIGDHA' | 'AC_S' | 'AC_B'`
  - `RailwayClassSchema`: `code`, `slug`, `name_en`, `name_bn`, `is_ac`, `description_en`, `description_bn`.
  - `RailwayStationSchema`: `code`, `slug`, `name_en`, `name_bn`, `division`, `district`, `coordinates`.
  - `RailwayTrainSchema`: `number` (string/number), `slug`, `name_en`, `name_bn`, `origin_station`, `destination_station`, `origin_city`, `destination_city`, `departure_time`, `arrival_time`, `off_day_en`, `off_day_bn`, `classes`, `major_halts`.

## 3. Services
- `src/modules/railway/service.ts`:
  - `listTrains({ origin, destination, classCode, offDay, q })`
  - `getTrain(numberOrSlug)`
  - `listRailwayClasses()`
  - `listRailwayStations({ division, q })`
  - `getRailwayStation(codeOrSlug)`

## 4. Routes
- `src/modules/railway/routes.ts`:
  - `GET /railway/trains`
  - `GET /railway/trains/:number`
  - `GET /railway/classes`
  - `GET /railway/stations`
  - `GET /railway/stations/:code`
- Mount `railwayRoutes` under `/v1` in `src/app.ts`.
- Tag: `'Bangladesh Railway'`.

## 5. Testing
- Unit tests: `tests/unit/railway/service.test.ts`.
- Contract tests: `tests/contract/railway.test.ts`.

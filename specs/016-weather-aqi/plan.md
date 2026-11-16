# Architecture & Implementation Plan: Weather Signals, Warnings & AQI Reference

## 1. Data Design
- `data/weather/maritime-signals.json`: 11 BMD maritime warning signals. Sorted by `number`.
- `data/weather/riverport-signals.json`: 4 BMD riverport signals. Sorted by `number`.
- `data/weather/aqi-categories.json`: 6 DoE AQI categories. Sorted by `slug`.
- `data/weather/seasons.json`: 6 Bangla seasons. Sorted by `order`.
- Add to `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/weather/schemas.ts`:
  - `MaritimeSignalSchema`: `number` (1-11), `slug`, `name_en`, `name_bn`, `severity`, `wind_speed_kmh`, `meaning_en`, `meaning_bn`, `action_required`.
  - `RiverportSignalSchema`: `number` (1-4), `slug`, `name_en`, `name_bn`, `severity`, `wind_speed_kmh`, `meaning_en`, `meaning_bn`, `vessel_guideline`.
  - `AqiCategorySchema`: `slug`, `name_en`, `name_bn`, `min_aqi`, `max_aqi`, `color_hex`, `health_implication_en`, `health_implication_bn`, `cautionary_statement_en`, `cautionary_statement_bn`.
  - `AqiLookupResponseSchema`: input `aqi`, matched `category`, `color_hex`, `health_implication`, `cautionary_statement`.
  - `BanglaSeasonSchema`: `order` (1-6), `slug`, `name_en`, `name_bn`, `bangla_months`, `approx_gregorian_span`, `description_en`, `description_bn`.

## 3. Services
- `src/modules/weather/service.ts`:
  - `listMaritimeSignals()`
  - `getMaritimeSignal(number)`
  - `listRiverportSignals()`
  - `getRiverportSignal(number)`
  - `listAqiCategories()`
  - `lookupAqi(value)`
  - `listBanglaSeasons()`

## 4. Routes & App Integration
- `src/modules/weather/routes.ts`:
  - `GET /weather/signals/maritime`
  - `GET /weather/signals/maritime/:number`
  - `GET /weather/signals/riverport`
  - `GET /weather/signals/riverport/:number`
  - `GET /weather/aqi/categories`
  - `GET /weather/aqi/lookup`
  - `GET /weather/seasons`
- Mount `weatherRoutes` under `/v1` in `src/app.ts`.
- Add `Weather & Disaster Signals` tag to `src/docs.ts` and `src/app.ts`.

## 5. Testing
- Unit tests: `tests/unit/weather/service.test.ts`.
- Contract tests: `tests/contract/weather.test.ts`.

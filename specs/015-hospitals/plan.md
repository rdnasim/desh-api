# Architecture & Implementation Plan: National Healthcare & Hospital Directory

## 1. Data Design
- `data/health/hospitals.json`: Major government tertiary hospitals and medical colleges covering all 8 divisions. Sorted by `slug`.
- Add to `scripts/datasets.ts` and `data/meta.json`.

## 2. Types & Schemas
- `src/modules/health/schemas.ts`:
  - `HospitalTypeSchema`: `'medical_college' | 'specialized_institute' | 'general_hospital'`
  - `HospitalSchema`: `slug`, `name_en`, `name_bn`, `type`, `division`, `district`, `bed_capacity`, `has_emergency_24h`, `phone`, `emergency_phone`, `email`, `website`, `address`, `coordinates`, `services`.
  - `EmergencyHealthSummarySchema`: national hotlines (16263, 999), ambulance contacts, list of primary trauma & burn centers.

## 3. Services
- `src/modules/health/service.ts`:
  - `listHospitals({ division, district, type, q, has_emergency })`
  - `getHospital(slug)`
  - `getEmergencyHealthDirectory()`

## 4. Routes
- `src/modules/health/routes.ts`:
  - `GET /health/hospitals`
  - `GET /health/hospitals/:slug`
  - `GET /health/emergency`

## 5. Mounting & Integration
- Mount `healthRoutes` under `/v1` in `src/app.ts`.
- Document tag `Health` in `src/docs.ts` and `src/app.ts`.
- Unit tests: `tests/unit/health/service.test.ts`.
- Contract tests: `tests/contract/health.test.ts`.

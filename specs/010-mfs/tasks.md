# Tasks: Mobile Financial Services (MFS)

## Phase 1: Setup & Data
- [x] **T001**: Create data directory `data/mfs/` and author `data/mfs/providers.json` with verified rates for bKash, Nagad, Rocket, Upay, Tap.
- [x] **T002**: Create TypeScript schemas and types in `src/modules/mfs/schemas.ts`.

## Phase 2: Logic & Calculation Engine
- [x] **T003**: Implement calculator in `src/modules/mfs/calculator.ts` (fee calculation, VAT breakdown, digit normalization, multi-provider ranking/comparison).
- [x] **T004**: Unit tests for calculation engine in `tests/unit/mfs/calculator.test.ts`.

## Phase 3: Routes & Integration
- [x] **T005**: Define OpenAPI routes and handlers in `src/modules/mfs/routes.ts`:
  - `GET /v1/mfs/providers`
  - `GET /v1/mfs/providers/{provider}`
  - `GET /v1/mfs/charges`
  - `GET /v1/mfs/compare`
  - `GET /v1/mfs/ussd`
- [x] **T006**: Register MFS module in `src/app.ts` and update landing page module listing.
- [x] **T007**: Add contract tests in `tests/contract/mfs.test.ts`.

## Phase 4: Documentation & Final Verification
- [x] **T008**: Update `README.md`, `DATA_SOURCES.md`, and `docs/roadmap.md`.
- [x] **T009**: Run full test suite and verify all tests pass.

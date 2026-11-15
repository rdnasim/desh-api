---

description: "Task list for Bangla Mock Data Generator"
---

# Tasks: Bangla Mock Data Generator

**Tests**: REQUIRED (constitution V). Tests first within each story.

## Phase 1: Foundational

- [X] T001 MockName schema in src/modules/mock/schemas.ts; register `mock.names` in scripts/datasets.ts (unique, NFC, family-name gender only for gendered names); add to data/meta.json
- [X] T002 [P] Compile data/mock/names.json (research M1)
- [X] T003 [P] Data tests in tests/data/mock.test.ts (every tradition has male and female given names and family names usable by both genders)

## Phase 2: User Story 1 - People (P1) 🎯 MVP

- [X] T004 [P] [US1] Unit tests in tests/unit/mock/service.test.ts: determinism, gender filter (incl. gendered family names), district filter, phones and NIDs pass the validators over 1,000 records, email domain, DOB range, no religion field
- [X] T005 [US1] Implement `mockPeople` in src/modules/mock/service.ts
- [X] T006 [US1] Contract tests and `GET /v1/mock/people` (cache by seed); mount in src/app.ts; `Mock data` tag in src/docs.ts; index entry

## Phase 3: User Story 2 - Addresses (P2)

- [X] T007 [P] [US2] Unit tests: geo consistency over 1,000 addresses, district filter, postcode belongs to district
- [X] T008 [US2] Implement `mockAddresses` and `GET /v1/mock/addresses` with contract tests

## Phase 4: Polish

- [X] T009 Smoke scenario, README, landing page, CONTRIBUTING (names folder), roadmap, DATA_SOURCES.md
- [X] T010 Type-check, lint, data check, tests, bundle size

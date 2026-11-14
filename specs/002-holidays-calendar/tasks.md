---

description: "Task list for Holidays & Calendar"
---

# Tasks: Holidays & Calendar

**Input**: Design documents from `/specs/002-holidays-calendar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/holidays.md, quickstart.md

**Tests**: REQUIRED (constitution V). Tests first within each story.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T001 *(blocked: 2026 MoPA original and all 2026 amendments not retrievable automatically; BB 2026 original circular read and recorded — see research H1/H2)* Obtain the primary 2026 documents (MoPA notification of 9 Nov 2025 and every 2026 amendment; Bangladesh Bank DOS Circular Letter 20 of 16 Nov 2025 and later closure circulars) and record each document's ref, date and URL in specs/002-holidays-calendar/research.md (H1, H2)
- [X] T002 (MoPA 2027 notification read and recorded; BB 2027 circular not yet issued/found) [P] Obtain the 2027 MoPA notification (published 5 Nov 2026) and the 2027 Bangladesh Bank circular if issued; record in specs/002-holidays-calendar/research.md

## Phase 2: Foundational

- [X] T003 Define Zod schemas for SourceDoc, HolidayYear and Holiday per data-model.md (`id` `<year>-<calendar>-<slug>`; `type` ∈ `general|executive-order|optional|bank`; `community` required iff `type = optional`; `dates` ≥ 1, sorted, unique, inside `year`) in src/modules/holidays/schemas.ts
- [X] T004 Register `holidays.years` and `holidays.holidays` in scripts/datasets.ts with cross-checks: every Holiday has a HolidayYear for (`year`, `calendar`); `source` and `amended_by` name a document of that year
- [X] T005 [P] Data-integrity tests (every record sourced, dates real and inside the year, optional ⇔ community, no duplicate (calendar, date, name)) in tests/data/holidays.test.ts

**Checkpoint**: schemas and checks ready; data can be added

---

## Phase 3: User Story 1 - Public holidays for a year (P1) 🎯 MVP

- [X] T006 (done for **2027** instead of 2026, see research H1) [US1] Transcribe the 2026 general calendar (original list + amendments, `tentative` per research H3) into data/holidays/holidays.json and data/holidays/years.json; add `holidays.*` entries to data/meta.json
- [X] T007 (tests/golden/holidays/2027-general.json; also checks every printed weekday and Bangla date) [P] [US1] Reference fixture: the official 2026 table, row by row, in tests/golden/holidays/2026-general.json; test that data matches it exactly in tests/data/holidays.test.ts
- [X] T008 [P] [US1] Contract tests for `/v1/holidays` and `/v1/holidays/years` (filters, 404 with available years, Bangla dates) in tests/contract/holidays.test.ts
- [X] T009 [US1] Implement list/years in src/modules/holidays/service.ts and routes in src/modules/holidays/routes.ts; mount in src/app.ts; add a `Holidays` tag in src/docs.ts

## Phase 4: User Story 2 - Is this date a holiday? (P1)

- [X] T010 [P] [US2] Unit tests for day status (holiday, weekend, working day, tentative, optional holidays not affecting working day, unavailable year → error) in tests/unit/holidays/service.test.ts
- [X] T011 [US2] Implement `dayStatus` in src/modules/holidays/service.ts and `GET /v1/is-holiday` in src/modules/holidays/routes.ts

## Phase 5: User Story 3 - Working days (P2)

- [X] T012 [P] [US3] Unit tests: 12 reference months counted by hand, custom weekend, holiday on weekend counted once, range > 366 days and from > to rejected, cross-year range with an unavailable year in tests/unit/holidays/service.test.ts
- [X] T013 [US3] Implement `workingDays` and `GET /v1/working-days` (weekend parsing per research H4) in src/modules/holidays/service.ts and routes.ts

## Phase 6: User Story 4 - Bank holidays (P2)

- [ ] T014 *(blocked on Bangladesh Bank documents, research H2)* [US4] Transcribe the 2026 bank calendar (DOS Circular Letter 20 + later circulars) into data/holidays/holidays.json and years.json
- [ ] T015 [P] [US4] Reference fixture tests/golden/holidays/2026-bank.json and contract tests for `calendar=bank` (bank-only day is a holiday on bank, working day on general)

## Phase 7: User Story 5 - National days (P3)

- [ ] T016 *(deferred, research H6)* [US5] Find an official, current list of observed national days; if none, keep US5 deferred and record why in research.md (H6)

## Phase 8: Polish

- [ ] T017 *(2027 general done; 2027 bank waits for the circular)* [P] Add 2027 data once T002 is done (both calendars), with reference fixtures
- [X] T018 [P] Document the tentative-date update process (two reviewers, within 2 days) in CONTRIBUTING.md
- [X] T019 Add holiday scenarios to scripts/smoke.ts and quickstart; update README examples and docs/roadmap.md

## Phase 9: Follow-up (requested 2026-11-14)

- [X] T020 [US1] Unit and contract tests for multi-value `type`, `closed=true` (district-aware) and `/v1/holidays/dates` in tests/unit/holidays/service.test.ts and tests/contract/holidays.test.ts
- [X] T021 [US1] Implement `filterHolidays` and `holidayDates` in src/modules/holidays/service.ts; shared list query and `GET /v1/holidays/dates` in src/modules/holidays/routes.ts

## Dependencies

- T001 blocks T006–T009; T014 needs T001's bank documents. T003–T005 block all data tasks.
- US2 and US3 depend on US1 data; US4 is independent of US2/US3 apart from shared service code.
- US5 is independent and may stay deferred.

## Implementation Strategy

MVP = US1 + US2 for 2026 general calendar. Then US3, then US4, then 2027 data.

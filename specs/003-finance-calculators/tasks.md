---

description: "Task list for Finance Calculators"
---

# Tasks: Finance Calculators

**Input**: Design documents from `/specs/003-finance-calculators/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/finance.md, quickstart.md

**Tests**: REQUIRED (constitution V). Tests first within each story.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational

- [X] T001 Define Zod schemas for TaxCategory, TaxYear (with SourceDoc) and the response shapes per data-model.md in src/modules/finance/schemas.ts
- [X] T002 Register `finance.tax-categories` and `finance.tax-years` in scripts/datasets.ts with cross-checks (a threshold for every category, every threshold category known, aliases unique, income year matches tax year); add both to data/meta.json
- [X] T003 (both tax years generated from one rule set so they cannot drift) [P] Transcribe tax years 2026-27 and 2027-28 and the seven categories into data/finance/ from research F1–F4, with sources and `unverified`
- [X] T004 [P] Data-integrity tests in tests/data/finance.test.ts

## Phase 2: User Story 1 - Income tax (P1) 🎯 MVP

- [X] T005 [P] [US1] Golden file of hand-computed cases in tests/golden/finance/income-tax.json (threshold edge, slab boundaries, minimum tax, new taxpayer, each category, disabled dependants, employment cap and fraction, rebate limited by each rule, rebate above gross tax, crore incomes)
- [X] T006 [P] [US1] Unit tests in tests/unit/finance/tax.test.ts: golden cases, both tax years, unknown year, employment > income
- [X] T007 [US1] Implement `resolveCategory`, `taxYear`, `incomeTax` in src/modules/finance/tax.ts
- [X] T008 [US1] Contract tests for `/v1/finance/income-tax` in tests/contract/finance.test.ts (default year, Bangla digits and category, 404 listing years, 400s, disclaimer and source)
- [X] T009 [US1] Route in src/modules/finance/routes.ts; mount in src/app.ts; `Finance` tag in src/docs.ts; module entry in the `/` index

## Phase 3: User Story 2 - Tax rules (P1)

- [X] T010 [US2] Contract test and route for `/v1/finance/tax-years` (bilingual category names on thresholds)

## Phase 4: User Story 3 - EMI (P2)

- [X] T011 [P] [US3] Unit tests in tests/unit/finance/emi.test.ts (reference EMI, 0% rate, schedule closes at 0 and sums to total, 1 month)
- [X] T012 [US3] Implement src/modules/finance/emi.ts and `/v1/finance/emi` with contract tests

## Phase 5: User Story 4 - VAT (P2)

- [X] T013 [P] [US4] Unit tests in tests/unit/finance/vat.test.ts (exclusive, inclusive, custom rate, 0 amount)
- [X] T014 [US4] Implement src/modules/finance/vat.ts and `/v1/finance/vat` with contract tests

## Phase 6: User Story 5 - DPS (P3)

- [X] T015 [P] [US5] Unit tests in tests/unit/finance/dps.test.ts (monthly matches closed form, quarterly < monthly, 0% rate)
- [X] T016 [US5] Implement src/modules/finance/dps.ts and `/v1/finance/dps` with contract tests

## Phase 7: User Story 6 - Gratuity (P3)

- [X] T017 [P] [US6] Unit tests in tests/unit/finance/gratuity.test.ts (part-year > 6 months, exactly 10 years vs more, under 6 months)
- [X] T018 [US6] Implement src/modules/finance/gratuity.ts and `/v1/finance/gratuity` with contract tests

## Phase 8: Polish

- [X] T019 [P] Smoke scenarios in scripts/smoke.ts; README module table and examples; docs/roadmap.md; regenerate DATA_SOURCES.md
- [X] T020 (all figures match Act No. 96 of 2026 and Act No. 89 of 2026; research F11) Verify the `unverified` figures (category thresholds, employment cap, rebate cap) against the gazetted Finance Act 2026 text; then clear `unverified` and record the check in research.md (needs the gazette PDF — maintainer)
- [X] T021 Run type-check, lint, data check, tests and the bundle-size check

## Dependencies

- T001–T003 block everything that reads tax data; T004 needs T003.
- US1 and US2 share data; US3–US6 are independent of the data and of each other.

## Implementation Strategy

MVP = US1 + US2. Then EMI and VAT, then DPS and gratuity. T020 can land later as a data-only PR.

---

description: "Task list for Banks, Branches & Routing Numbers"
---

# Tasks: Banks, Branches & Routing Numbers

- [X] T001 Parse Bangladesh Bank's branch list and match routing numbers (research B1–B4); importer scripts/import/banks.py
- [X] T002 Bank/Branch schemas; register `banks.banks`, `banks.branches` with build checks (bank exists, ID prefix, district, upazila-in-district, check digit, unique routing number, bank code prefix); data/meta.json
- [X] T003 [P] Routing check digit + `routing` validate type (unit tests first)
- [X] T004 [P] Data tests (row counts, check digits, bank codes, district codes)
- [X] T005 [US1] Unit + contract tests, then `listBanks`, `getBank`, `listBranches` and routes
- [X] T006 [US2] `/v1/routing/{number}` and `/v1/validate/routing/{number}` with tests
- [X] T007 [US3] `/v1/branches/{id}` with tests
- [X] T008 README, landing page, CONTRIBUTING, roadmap, DATA_SOURCES.md, smoke scenario
- [ ] T009 *(maintainer)* Ask bddata.org for permission to reuse routing numbers, or replace them with Bangladesh Bank's routing list (research B2)
- [ ] T010 *(maintainer)* Bangla names for the 61 banks from an official source

# Feature Specification: Education Data — Universities

**Feature Branch**: `006-education`

**Created**: 2026-11-15

**Status**: Implemented

**Input**: User description: "Phase 2, module 14 of docs/vision.md — education data, starting with
the universities listed by the University Grants Commission (ugc.gov.bd)."

## Clarifications

### Session 2026-11-15

Decisions taken on the maintainer's behalf (each can be overridden):

- Q: Scope of the first version? → A: All UGC-listed universities (public, private,
  international, cross-border) with institution-level facts. Faculties, departments and approved
  programmes are a follow-up; education boards and schools are separate features.
- Q: People's names? → A: Left out (vice-chancellors, treasurers, registrars, contact persons).
  They change often and would go stale, and constitution II asks for no personal data beyond
  need. Institutional email, phone and fax are kept.
- Q: Missing Bangla names and districts at source? → A: `name_bn` is shown only when UGC gives
  it (as for English-only holidays and banks). `district` is filled only when the campus address
  names exactly one district; otherwise it is left out, never guessed.
- Q: UGC's notes on programmes? → A: Included as published (Bangla text, with UGC's note type),
  since they say which programmes were renamed or re-approved.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List universities (Priority: P1) 🎯 MVP

An admission or job-application form needs a university dropdown, optionally filtered by type or
district.

**Acceptance Scenarios**:

1. `GET /v1/universities` returns every UGC-listed university with category, website and year of
   establishment where known.
2. `category=public|private|international|cbhe`, `district=…` and `q=` (name search) filter.
3. Unknown category or district → 400.

### User Story 2 - One university (Priority: P1)

`GET /v1/universities/{slug}` returns the campus address, institutional contacts and UGC notes;
unknown slug → 404.

### User Story 3 - Categories (Priority: P3)

`GET /v1/universities/categories` returns UGC's four categories with English and Bangla names,
descriptions and counts.

### Edge Cases

- Missing website, address or year at source (field omitted).
- Addresses naming two districts, or none (no `district`).
- Notes in Bangla only.

## Requirements *(mandatory)*

- **FR-001**: Serve every university on UGC's four category pages, with UGC's slug and ID.
- **FR-002**: Institution facts from UGC detail pages; no names of people.
- **FR-003**: Filters and 400/404 behaviour as above; responses cite UGC with its last-update date.
- **FR-004**: An importer refreshes the data from the UGC website, politely (1 request/second).

## Success Criteria *(mandatory)*

- **SC-001**: University count per category equals UGC's published counts (61 / 116 / 3 / 1 at
  launch).
- **SC-002**: Every `district` is consistent with the campus address (build/data test).

## Assumptions

- UGC's website content is public government information, credited to UGC.

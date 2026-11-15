# Feature Specification: Banks, Branches & Routing Numbers

**Feature Branch**: `005-banks`

**Created**: 2026-11-15

**Status**: Implemented

**Input**: User description: "Phase 2, module 11 of docs/vision.md — banks and routing numbers.
Take branch details from Bangladesh Bank's branch list (geo_bank.pdf) and only the routing numbers
from bddata.org."

## Clarifications

### Session 2026-11-15

- Q: Which source is authoritative? → A: Bangladesh Bank's branch list "as on 31 August 2026"
  (Banking Statistics Division) for banks and branches. Routing numbers from the bddata.org table,
  chosen by the maintainer; Bangladesh Bank's own routing list is behind a captcha.
- Q: When is a routing number shown? → A: Only when its check digit is valid, its bank and
  district match the branch, and the branch name matches (exactly, or as the one close spelling
  with an agreeing routing district code). Otherwise the branch has no routing number rather than
  a guessed one. A branch that would get two numbers gets none.
- Q: Names in Bangla? → A: The source is English-only; `name_bn` is omitted for banks and
  branches (as for English-only holidays), and districts/upazilas carry their Bangla names.
- Q: MFS providers (bKash, Nagad)? → A: Out of scope for this feature (no official list in hand).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bank and branch picker (Priority: P1) 🎯 MVP

A payroll or fintech form shows "bank → district → branch" dropdowns.

**Acceptance Scenarios**:

1. `GET /v1/banks` lists all 61 banks with their Bangladesh Bank ID and branch counts.
2. `GET /v1/banks/{bank}/branches?district=…` lists that bank's branches in the district,
   paginated, sorted by name; `upazila` and `q` (name search) also filter.
3. Unknown bank → 404; unknown district or upazila → 400.

### User Story 2 - Routing number lookup (Priority: P1)

A payment app checks a routing number before a BEFTN transfer.

**Acceptance Scenarios**:

1. `GET /v1/routing/{number}` returns the branch (bank, district, division, upazila).
2. Wrong length, non-digits or a bad check digit → 400 explaining why.
3. A valid number not in the list → 404, naming the bank when its 3-digit code is known.
4. `GET /v1/validate/routing/{number}` checks format and check digit only, never cached.

### User Story 3 - Branch by ID (Priority: P2)

`GET /v1/branches/{id}` returns a branch by its Bangladesh Bank branch ID.

### Edge Cases

- Branch names wrapped over two lines in the PDF; bank IDs that look like row numbers.
- Renamed banks in the routing table (Farmers → Padma, NRB Global → Global Islami, Standard →
  Standard Islami, NRB Commercial → NRBC).
- City thanas (KOTWALI_CUMILLA) that are not upazilas: `thana` kept, `upazila` omitted.

## Requirements *(mandatory)*

- **FR-001**: Serve all banks and branches in the Bangladesh Bank list, unaltered except for
  district/upazila linking.
- **FR-002**: Attach routing numbers only under the rules above; every number passes the check
  digit, starts with its bank's code, and is unique (checked at build).
- **FR-003**: Routing lookup and format validation as in Story 2.
- **FR-004**: Every branch response carries a disclaimer: routing numbers come from a secondary
  source; confirm with the bank before sending money.
- **FR-005**: An importer rebuilds the data from new source files.

## Success Criteria *(mandatory)*

- **SC-001**: 11,533 branches / 61 banks served, matching the source row count.
- **SC-002**: 0 routing numbers failing the check digit or bank code (build check).
- **SC-003**: ≥ 70% of branches carry a confirmed routing number (8,080 at launch).

## Assumptions

- The routing-number check digit (weights 5, 7, 1; sum divisible by 10) is inferred from the
  data, not from a published specification (research B3).
- The bddata.org table is "all rights reserved"; the maintainer chose to use its routing numbers
  with attribution (research B2).

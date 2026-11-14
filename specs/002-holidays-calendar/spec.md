# Feature Specification: Holidays & Calendar

**Feature Branch**: `002-holidays-calendar`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Phase 2, module 9 of docs/vision.md — public holidays per year from the
government holiday list, bank holidays, is-a-date-a-holiday checks, working-day counts, and
national days. Moon-dependent holidays are marked tentative until officially confirmed."

## Clarifications

### Session 2026-11-14

- Q: Which source is authoritative for holidays? → A: The government's yearly holiday list
  published by the Cabinet Division (gazette / circular). Bank holidays come from Bangladesh Bank's
  own yearly circular. Nothing is inferred from earlier years.
- Q: What weekend applies? → A: Friday and Saturday by default (government offices). Callers can
  choose another weekend (e.g. Friday only) for working-day calculations.
- Q: Which "national days" are included? → A: Only days listed in an official government list for
  that year, reported exactly as listed, with no commentary (constitution VIII). Days dropped from
  the official list in a later year are simply absent for that year.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public holidays for a year (Priority: P1) 🎯 MVP

A payroll developer fetches all public holidays for 2026 to block leave and calculate pay. Each
holiday has English and Bangla names, its date(s), its type (general holiday, executive-order
holiday, optional/religious holiday for a specific community), the Bangla calendar date, and whether
the date is still tentative (moon-dependent).

**Why this priority**: Every HR, payroll and attendance system in Bangladesh needs this list, and
today people copy it from a PDF every year.

**Independent Test**: Fetch the 2026 list and compare it entry by entry with the official 2026
holiday list.

**Acceptance Scenarios**:

1. **Given** a year whose official list is published, **When** a client requests that year,
   **Then** every holiday on the official list is returned with bilingual names, date(s), type,
   source reference and `tentative` flag.
2. **Given** a moon-dependent holiday (e.g. Eid) that has not been officially confirmed, **Then**
   it is returned with `tentative: true`; once confirmed, `tentative: false` and the confirmed date.
3. **Given** a holiday that spans several days, **Then** each date is listed and the holiday is
   still one entry.
4. **Given** a year with no published list, **When** requested, **Then** a 404 explains which
   years are available — never a guessed list.
5. **Given** a `type` filter (general, executive-order, optional), **Then** only that type is
   returned.

---

### User Story 2 - Is this date a holiday? (Priority: P1)

An attendance app asks whether a specific date is a holiday or a weekend, to decide whether to mark
an absence.

**Why this priority**: The single most common check; it builds directly on Story 1.

**Independent Test**: Check a known holiday, a weekend day, and an ordinary working day.

**Acceptance Scenarios**:

1. **Given** a date that is a public holiday, **Then** the response says `holiday: true` and names
   the holiday (bilingual).
2. **Given** a Friday or Saturday with no holiday, **Then** `holiday: false`, `weekend: true`,
   `working_day: false`.
3. **Given** an ordinary weekday, **Then** `working_day: true`.
4. **Given** a date whose holiday is tentative, **Then** the response says so.
5. **Given** a date in a year with no published list, **Then** a 404 explains the year is not
   available (weekend status alone is not presented as a full answer).

---

### User Story 3 - Working days between two dates (Priority: P2)

A payroll or project-planning tool counts working days between two dates, excluding weekends and
public holidays.

**Why this priority**: Needed for salary proration, leave balances and delivery estimates.

**Independent Test**: Count working days in a month and compare with a manual count.

**Acceptance Scenarios**:

1. **Given** a from/to date range within available years, **Then** the count of working days,
   weekend days and holidays is returned, plus the list of holidays inside the range.
2. **Given** a custom weekend (e.g. Friday only), **Then** the count uses it.
3. **Given** a range longer than 366 days, or from after to, **Then** a 400 explains the limit.
4. **Given** a range touching a year with no published list, **Then** a 404 names that year.
5. **Given** tentative holidays inside the range, **Then** the response flags that the count may
   change.

---

### User Story 4 - Bank holidays (Priority: P2)

A fintech app needs days when banks are closed, which include extra bank-only holidays (for example
the bank holiday on 1 July for half-yearly closing) on top of public holidays.

**Why this priority**: Payment and settlement apps need it; it reuses Stories 1–3.

**Independent Test**: Fetch bank holidays for a year and compare with Bangladesh Bank's circular.

**Acceptance Scenarios**:

1. **Given** `type=bank`, **Then** public holidays that banks observe plus bank-only holidays are
   returned, each citing its source.
2. **Given** a bank-only holiday date, **When** checking it with the bank calendar, **Then**
   `holiday: true`; with the general calendar, `holiday: false`.

---

### User Story 5 - National days (Priority: P3)

A content or education app lists official national and international days observed in Bangladesh
that may not be public holidays.

**Why this priority**: Nice to have; politically sensitive, so it ships only with an official list.

**Independent Test**: Compare a year's list with the official list it cites.

**Acceptance Scenarios**:

1. **Given** a year with an official list, **Then** each day is returned with date, bilingual
   name, whether it is also a public holiday, and the source — no commentary.
2. **Given** a year without an official list, **Then** a 404 says so.

### Edge Cases

- Holiday falling on a weekend (still listed; working-day count is not double-counted).
- Two holidays on the same date (both named; counted once).
- Moon-dependent dates confirmed late, or moved by a later government order (the latest official
  information wins; `last_updated` changes).
- Date ranges crossing a year boundary where only one year is published.
- Dates in Bangla digits; invalid dates (31 Feb); far past/future years.
- Optional (community-specific) holidays must not make a day a non-working day for everyone.
- Ad-hoc holidays announced mid-year (added with their own source reference).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide the official public holiday list per year with: bilingual name, date(s),
  type (`general`, `executive-order`, `optional`), community for optional holidays, `tentative`,
  Bangla calendar date for each date, and the official source reference.
- **FR-002**: Provide a date check returning holiday, weekend and working-day status, with the
  matching holidays.
- **FR-003**: Provide working-day counts for a date range of at most 366 days, with configurable
  weekend days (default Friday + Saturday).
- **FR-004**: Provide a bank calendar: public holidays observed by banks plus bank-only holidays.
- **FR-005**: Provide official national days per year when an official list is available.
- **FR-006**: Return 404 for years without a published official list; never extrapolate.
- **FR-007**: Mark moon-dependent holidays tentative until officially confirmed; responses that
  depend on tentative dates say so.
- **FR-008**: Optional holidays never affect working-day status for the general calendar.
- **FR-009**: Accept Bangla digits in all dates; follow existing envelope, caching and error rules.

### Key Entities

- **HolidayYear**: year, source (gazette/circular reference and URL), published date,
  last_updated.
- **Holiday**: id, year, name_en, name_bn, type, community (optional only), dates[], tentative,
  calendar (`general` | `bank`), source.
- **NationalDay**: year, date, name_en, name_bn, is_public_holiday, source.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of entries match the official list for every published year (verified entry by
  entry before release).
- **SC-002**: A developer can answer "is date X a working day?" with a single request.
- **SC-003**: Working-day counts match a manual count for 12 reference months.
- **SC-004**: Moon-dependent holidays are updated within 2 days of an official confirmation
  (process documented).
- **SC-005**: Zero unsourced holiday entries.

## Assumptions

- Initial year: 2027 (general calendar), from the official notification of 5 November 2026. 2026 and
  the bank calendar are added when their official documents, including amendments, are obtained
  (research H1, H2).
- Weekend default (Friday + Saturday) reflects government offices; private employers vary.
- Regional or district-level holidays (e.g. local festivals) are out of scope.
- Updating tentative dates is a manual, reviewed data change (two reviewers, like hotlines).

# Research: Holidays & Calendar

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-14

## H1. Source for public holidays

- **Decision**: The yearly holiday notification (প্রজ্ঞাপন) from the Ministry of Public
  Administration (জনপ্রশাসন মন্ত্রণালয়), plus any later Cabinet Division / MoPA notices that change
  it. The original list and each amendment are recorded with their own reference.
- **Found so far**: the 2026 list was issued on 9 November 2025 (MoPA, বিধি-৬ শাখা): 14 general
  holidays + 14 executive-order holidays (28 days, 11 of them on weekends), plus optional holidays
  per community (Muslim 5, Hindu 9, Christian 8, Buddhist 7, ethnic minorities 2; each employee
  may take up to 3). The 2027 list was published on 5 November 2026. Known 2026 amendments: Durga
  Puja holidays moved to 20–22 October (17 October became a working day) by Cabinet Division notice;
  election and referendum closures on 11–12 February.
- **2027 — done (2026-11-14)**: MoPA notification **No. 05.00.0000.175.08.0008.25-105, 5 November
  2026 (২০ কার্তিক ১৪৩৩)**, https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740 (4-page
  scan, no text layer; read from the page images). 15 general + 14 executive-order days, optional
  Muslim 6, Hindu 9, Christian 8, Buddhist 7, ethnic minorities 2; up to 3 optional days per
  employee. Transcribed row by row into `tests/golden/holidays/2027-general.json`; section totals
  match the printed totals, and **all 63 printed weekdays and Bangla dates agree with our calendar
  module** (an official cross-check of the revised-calendar implementation from Phase 1).
- **2026 — blocked**: the original notification (No. 05.00.0000.000.175.08.0008.25-17, 9 Nov 2025)
  is only available as a newspaper-hosted scan, and the 2026 amendments (election closures,
  confirmed Eid dates, Durga Puja moved to 20–22 Oct) could not be retrieved from mopa.gov.bd or
  cabinet.gov.bd automatically. Since all of 2026 is in the past, publishing the original list without
  the amendments would give wrong answers, so 2026 is not served. A maintainer can download the
  documents in a browser and add them.

## H2. Source for bank holidays

- **Decision**: Bangladesh Bank's yearly circular for scheduled banks, plus later circulars that
  add or change closures.
- **Found so far**: DOS Circular Letter No. 20, 16 November 2025
  (https://www.bb.org.bd/mediaroom/circulars/dos/nov162025dosl20e.pdf): 28 bank closure days for
  2026, including bank-only holidays on 1 July and 31 December. Later circulars: closure on 11–12
  February (election), SDAD Circular 04 of 10 March 2026 (18 March, Eid-ul-Fitr), SDAD Circular 07
  of 18 May 2026 (25–31 May, Eid-ul-Azha).
- **Read 2026-11-14**: the circular PDF (English text; extracted with pypdf) lists 18 occasions,
  28 days: Shab-e-Barat 4 Feb*; Shahid Day 21 Feb; Shab-e-Qadr 17 Mar*; Eid-ul-Fitr and
  Jumat-ul-Wida 19–23 Mar*; Independence and National Day 26 Mar; Chaitra Sankranti 13 Apr (only
  Rangamati, Khagrachhari and Bandarban hill districts); Bengali New Year 14 Apr; May Day and Buddha
  Purnima* 1 May; Eid-ul-Azha 26–31 May*; Ashura 26 Jun*; Bank Holiday 1 Jul; July Mass Uprising
  Day 5 Aug; Eid-e-Milad-un-Nabi 26 Aug*; Janmashtami 4 Sep; Durga Puja 20–21 Oct; Victory Day 16
  Dec; Christmas 25 Dec; Bank Holiday 31 Dec (* subject to the moon). It cites the MoPA notification
  **No. 05.00.0000.000.175.08.0008.25-17 of 9 November 2025** as the basis.
- **Data-model consequence**: some holidays apply only to listed districts (Chaitra Sankranti), so
  Holiday gets an optional `districts` field; such holidays never make a day a nationwide holiday.
- **Blocked**: bb.org.bd rejects automated requests for the circular listings, so the 2026 amending
  circulars could not be read, and the 2027 bank circular (normally issued mid-November) was not yet
  found. The bank calendar is therefore not served yet; 2026's original circular is recorded above for
  when the amendments are added.

## H3. Moon-dependent holidays

- **Decision**: Entries marked "চাঁদ দেখা সাপেক্ষে" are stored with `tentative: true`. When the
  government confirms or moves a date, the record is updated with `tentative: false`, the new dates
  and an `amended_by` reference. For past dates in 2026, the confirmed dates are used from the start.
- **Process (SC-004)**: a data PR within 2 days of the official announcement, two reviewers,
  citing the announcement.

## H4. Weekend and working days

- **Decision**: Default weekend Friday + Saturday (government offices). `weekend` parameter accepts
  a comma list of `sun,mon,tue,wed,thu,fri,sat` (at least 0, at most 6 days). Optional holidays never
  change working-day status. A holiday on a weekend counts once, as a weekend day, and is listed.
- **Range limit**: 366 days (one leap year), to keep CPU bounded.

## H5. Years and 404s

- **Decision**: `data/holidays/years.json` lists, per year and calendar, the source documents. A
  year (or calendar) not in that file returns 404 with the available years. Date checks and
  working-day counts that touch an unavailable year also 404, naming the year.

## H6. National days

- **Decision**: Deferred (US5, P3) until an official, current list of observed days is found. Lists
  of observed days changed in 2024–2025; using an unofficial list would breach constitution VIII.

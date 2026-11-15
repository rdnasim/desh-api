# Research: Education Data — Universities

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-15

## E1. Source

- **University Grants Commission of Bangladesh**, https://www.ugc.gov.bd/universities and the four
  category pages (public, private, international, CBHE), plus one page per university at
  `/university/{slug}`. Site content last updated 2026-11-12T09:52+06:00 (`last_content_update`).
- No captcha (the "recaptcha" text in the pages is an unused, empty setting). robots.txt allows
  everything except `/api/`, which is not used: each page embeds its data as JSON in a
  `data-page` attribute, and only that is read.
- Collected on 2026-11-15: 5 list pages + 181 university pages, one request per second, user agent
  "desh-api data import (+https://github.com/rdnasim/desh-api)".

## E2. What is kept

| Field | From | Coverage |
|---|---|---|
| name_en, slug, UGC id, category | list + detail | 181 |
| established (year) | `year_of_establishment` | 175 |
| website | `website` | 164 |
| campus | `permanent_campus`, else `present_campus`, else `address` | 159 |
| district | derived from campus (E3) | 153 |
| emails, phone, fax | institutional contacts | 160 / 162 / 88 |
| ugc_notes | UGC notes on programmes (Bangla) | 20 |
| name_bn | `name_bn` | 1 |

**Not kept**: vice-chancellor, pro-vice-chancellors, treasurer, registrar, contact person
(names of people; constitution II and staleness). Faculties, departments and programmes are a
follow-up feature.

## E3. District from the campus address

`district` is set only when exactly one district name (or alias) appears in the campus address,
after (a) spelling "-gonj" as "-ganj", (b) removing "X Road" phrases ("Natore Road", "Rangpur
Road") and (c) removing the university's own name ("Dhaka University of Engineering …,
Gazipur"). Left empty for six campuses: two districts named ("Singair, Manikganj, Dhaka"),
misspellings ("Chitagonj", "Naryanganj", "Shariaitpur"), abroad (South Asian University, New
Delhi), and one Bangla-only address.

## E4. Importer

`tsx scripts/import/ugc.ts <cache-dir>` reuses saved pages and downloads missing ones (one per
second), then writes `data/education/*.json`.

# Contract: Holidays

Follows `specs/001-phase1-mvp/contracts/common.md` (envelope, errors, caching). `meta.source`
names the official document(s) for the year and calendar used.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/holidays` | `year` (required), `calendar?` (`general`\|`bank`, default `general`), `type?`, `community?` | `Holiday[]` sorted by first date | 400 bad params, 404 year not available (lists available years) |
| GET | `/v1/holidays/years` | — | `{ year, calendar, documents[] }[]` | — |
| GET | `/v1/is-holiday` | `date` (required), `calendar?`, `district?` (applies district-only holidays) | `DayStatus` | 400, 404 |
| GET | `/v1/working-days` | `from`, `to` (required, ≤ 366 days), `calendar?`, `weekend?` (default `fri,sat`), `district?` | `WorkingDays` | 400, 404 |

Every `Holiday` in a response also carries `bangla_dates[]` (formatted Bangla calendar date for
each date). Responses that include a tentative holiday set `tentative: true` at the top level of
`data` (DayStatus, WorkingDays) or on the record (Holiday).

Example — `GET /v1/is-holiday?date=2026-12-16`:

```json
{ "success": true,
  "data": { "date": "2026-12-16", "bangla_date": "১ পৌষ ১৪৩৩ বঙ্গাব্দ", "weekend": false,
            "holiday": true, "working_day": false, "tentative": false,
            "holidays": [ { "id": "2026-general-victory-day", "name_en": "Victory Day", "name_bn": "বিজয় দিবস", "type": "general" } ],
            "optional_holidays": [] },
  "meta": { "source": "MoPA notification, 9 Nov 2025", "last_updated": "…", "version": "v1" } }
```

National days (`/v1/national-days`) are deferred (research H6).

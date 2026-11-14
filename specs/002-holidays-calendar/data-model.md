# Data Model: Holidays & Calendar

## HolidayYear (`data/holidays/years.json`)

| Field | Type | Rules |
|---|---|---|
| `year` | integer | 2000–2100 |
| `calendar` | enum | `general` \| `bank`; unique with `year` |
| `documents` | `SourceDoc[]` | ≥ 1; the original list first, then amendments |

`SourceDoc`: `ref` (e.g. "MoPA notification, 9 Nov 2025" / "BB DOS Circular Letter 20"),
`date` (ISO), `url` (official URL), `title_bn?`.

## Holiday (`data/holidays/holidays.json`)

| Field | Type | Rules |
|---|---|---|
| `id` | string | `<year>-<calendar>-<slug>`, unique |
| `year` | integer | must have a HolidayYear for (`year`, `calendar`) |
| `calendar` | enum | `general` \| `bank` |
| `name_en`, `name_bn` | string | Bangla exactly as in the official list |
| `type` | enum | `general` (সাধারণ ছুটি), `executive-order` (নির্বাহী আদেশে ছুটি), `optional` (ঐচ্ছিক), `bank` (bank-only) |
| `community` | enum? | required iff `type = optional`: `muslim` `hindu` `christian` `buddhist` `ethnic-minority` |
| `districts` | slug[]? | when present, the holiday applies only in these districts (e.g. Chaitra Sankranti in the hill districts) and never makes a day a nationwide holiday |
| `dates` | ISO date[] | ≥ 1, sorted, unique, all inside `year` |
| `tentative` | boolean | true only for unconfirmed moon-dependent dates |
| `source` | string | `ref` of a document in that year's HolidayYear |
| `amended_by` | string? | `ref` of the amending document, when dates changed |

Records sorted by `id`.

## Responses (not stored)

- **DayStatus**: `date`, `bangla_date` (from the calendar module), `weekend`, `holiday`,
  `working_day`, `holidays[]` (matching non-optional records), `optional_holidays[]`, `tentative`.
- **WorkingDays**: `from`, `to`, `weekend` (days used), `days`, `working_days`, `weekend_days`,
  `holidays` (non-weekend holiday days), `holiday_list[]`, `tentative`.

# Data Model: Universities

## University (`data/education/universities.json`, sorted by `slug`)
`slug` (UGC's), `ugc_id`, `name_en`, `name_bn?`, `category` (`public` | `private` |
`international` | `cbhe`), `established?` (year), `website?`, `campus?`, `district?` (geo slug,
named in `campus`), `emails?[]`, `phone?`, `fax?`, `ugc_notes?[]` ({`title`, `description`, `type`}).

## UniversityCategory (`data/education/university-categories.json`)
`slug`, `name_en`, `name_bn`, `description`. Responses add `count`.

# Data Model: Phase 1 MVP

All entities are read-only reference data stored in `data/**/*.json` and validated by the Zod
schemas in `src/modules/*/schemas.ts` at build time. Common rules:

- `slug`: `^[a-z0-9]+(-[a-z0-9]+)*$`, unique within its entity type (unions: unique within upazila,
  exposed globally as `<upazila-slug>--<union-slug>` id).
- `name_en`: non-empty, ≤ 100 chars. `name_bn`: non-empty, ≤ 100 chars, Bangla Unicode, NFC.
- `lat`/`lon`: optional; when present lat ∈ [20.5, 26.7], lon ∈ [88.0, 92.7].
- Arrays in files are sorted by `slug` (or primary key); keys in fixed order.

---

## DatasetMeta (`data/meta.json`)

| Field | Type | Rules |
|---|---|---|
| `dataset` | string | key, e.g. `geo.districts` |
| `source` | string | human-readable source(s) |
| `source_url` | string? | URL |
| `licence` | string | SPDX id or text, must be CC BY 4.0-compatible |
| `retrieved` | date | ISO `YYYY-MM-DD` |
| `last_updated` | date | ISO; drives `meta.last_updated` |
| `credits` | string[] | upstream authors |

Every response's `meta` is built from the DatasetMeta of the dataset(s) it reads. Computation-only
endpoints use a module-level meta (e.g. `source: "Bangla Academy revised calendar (2019)"`).

## Geo

### Division
| Field | Type | Rules |
|---|---|---|
| `slug` | string | unique; exactly 8 records |
| `name_en`, `name_bn` | string | required |
| `aliases` | string[] | historical/alternate spellings (e.g. `Chittagong`) |
| `lat`, `lon` | number? | bounds as above |

### District
Division fields + `division` (FK → Division.slug, required). Exactly 64 records.

All area records also carry optional `bbs_code` (official BBS geocode, `^BD\d+$`) and `url`
(official website).

### Upazila
Division fields + `district` (FK → District.slug, required). Exactly 495 records. When an upazila
name repeats across districts, the slug is `<name>-<district>` (e.g. `kaliganj-gazipur`).

### CityCorporation
Division fields + `district`. Exactly 12 records; slug drops the "City Corporation" suffix
(`dhaka-north`). Referenced by post offices in metropolitan areas.

### Union
| Field | Type | Rules |
|---|---|---|
| `slug` | string | unique within `upazila` (same-name pairs get `-2`) |
| `upazila` | string | FK → Upazila.slug |
| `name_en`, `name_bn`, `aliases`, `lat?`, `lon?` | | as above |

Totals for upazilas and unions are recorded in research R4 and asserted by `tests/data/geo.test.ts`.

### PostOffice (`postcodes.json`)
| Field | Type | Rules |
|---|---|---|
| `postcode` | string | `^\d{4}$` |
| `name_en` | string | post office name |
| `name_bn` | string \| null | `null` until contributed (no open source; see plan Complexity Tracking) |
| `thana_en` | string | postal thana as printed in the Post Office list |
| `district` | string | FK → District.slug |
| `upazila` | string? | FK → Upazila.slug when linked to an upazila |
| `city_corporation` | string? | FK → CityCorporation.slug when in a metropolitan area |
| `lat`, `lon` | number? | |

Multiple records may share a `postcode` (none do in the current source).

### SearchIndex (generated)
`[text, level, index][]`: `text` is the normalised name, Bangla name, and aliases joined by `|`;
`level` ∈ `division|district|upazila|union|post_office`; `index` points into that level's dataset.
Built by `scripts/build-data.ts`. Not hand-edited.

## Phone

### OperatorPrefix (`data/phone/prefixes.json`)
| Field | Type | Rules |
|---|---|---|
| `prefix` | string | `^01[3-9]$`, unique |
| `operator_slug` | string | e.g. `grameenphone` |
| `operator_en`, `operator_bn` | string | required |

### PhoneResult (response only)
`input`, `valid: boolean`, `reason?: "invalid_chars"|"invalid_length"|"invalid_prefix"`,
`normalized?: "01XXXXXXXXX"`, `international?: "+8801XXXXXXXXX"`, `operator?: {slug,name_en,name_bn}`,
`portability_notice: string`.

## Convert

### BijoyMap (`data/convert/bijoy-map.json`)
| Field | Type | Rules |
|---|---|---|
| `bijoy` | string | 1–3 chars, unique |
| `unicode` | string | NFC Bangla |
| `kind` | enum | `consonant` `conjunct` `vowel` `half` (pre-form ending in ্) `phala` (post-form starting with ্) `hasanta` `reph` `vowel_sign` `pre_base_sign` `sign` (ং ঃ ঁ) `digit` `punct` |

Entries are matched longest-first. The reverse map is built at load time; where several Bijoy glyphs
map to the same Unicode, exactly one has `preferred_reverse: true` (the others `false`).

## Land

### LandUnit (`data/land/units.json`)
| Field | Type | Rules |
|---|---|---|
| `slug` | string | `acre` `bigha` `chotak` `decimal` `hectare` `katha` `ojutangsho` `sqft` `sqm` `sqyd` |
| `name_en`, `name_bn` | string | required (e.g. `Decimal (Shotangsho)`, `শতাংশ`) |
| `aliases` | string[] | e.g. `shotangsho`, `shatak`, `dec` |
| `sqft` | number > 0 | standard value |
| `variants` | `{ region: string, sqft: number, source: string }[]` | optional; only sourced values |

Conversion: `value × from.sqft(region) ÷ to.sqft(region)`; region falls back to `standard`.

## Validators (no stored personal data)

### Plate areas
Every district (`geo.districts`, Bangla and English names) is a valid plate area. Plate-only
abbreviations live in `data/validate/vehicle-area-aliases.json`: `alias_bn` (e.g. চট্ট),
`alias_en`, `district` (FK → District.slug).

Class letters are checked to be Bangla consonants; no class table is stored until BRTA's list is
sourced (research R13).

### ValidationResult (response only)
`type`, `valid`, `reason?`, `normalized?`, `details?` (type-specific, e.g. NID `format: "10"|"13"|"17"`,
`birth_year?`; TIN `format: "e-tin-12"`; BIN `format: "bin-9"|"legacy_or_branch"`; vehicle `area`
(Ref), `metro`, `class` (Bangla letter), `series`, `number`; postcode `exists`, `post_offices?`).

## Hotlines

### Hotline (`data/hotlines/hotlines.json`)
| Field | Type | Rules |
|---|---|---|
| `number` | string | `^\d{3,6}$`, unique |
| `name_en`, `name_bn` | string | required |
| `category` | enum | `emergency` `health` `women-children` `information` `legal-aid` `disaster` `utility` `other` |
| `description_en?`, `description_bn?` | string | |
| `toll_free` | boolean | |
| `hours` | string | e.g. `24/7` |
| `source` | string | official URL — required |
| `last_verified` | date | required; CI warns when > 180 days old |

## Fun

| Entity | Fields |
|---|---|
| Proverb | `id`, `text_bn`, `meaning_bn`, `meaning_en`, `transliteration?`, `source` |
| Riddle | `id`, `question_bn`, `answer_bn`, `answer_en?`, `source` |
| QuizQuestion | `id`, `topic` (enum: `liberation-war`, `geography`, `culture`, `history`), `question_bn`, `question_en`, `options` (2–5 × `{bn,en}`), `answer_index`, `source` |
| Dish | `slug`, `name_en`, `name_bn`, `region` (district/division slug), `description_en`, `description_bn` |
| HistoryEvent | `id`, `month` (1–12), `day` (1–31), `year`, `title_en`, `title_bn`, `source` |

`id` is a stable short string (`proverb-0001`). Content must be traditional/public domain or factual.

## Envelope (response only)

```text
Success: { success: true,  data: T,                         meta: Meta }
Error:   { success: false, error: { code, message, message_bn?, details? }, meta: Meta }
Meta:    { source: string, last_updated: date, version: "v1", disclaimer?: string,
           pagination?: { page, per_page, total } }
```

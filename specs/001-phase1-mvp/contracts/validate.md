# Contract: Format Validators (US6)

Format checks only — no lookup of real people/vehicles. `Cache-Control: no-store`. Inputs never
logged. POST variants are recommended in docs (inputs stay out of URLs).

| Method | Path | Input | `details` on valid |
|---|---|---|---|
| GET | `/v1/validate/nid/{number}` | path | `{ format: "10"\|"13"\|"17", birth_year? }` |
| GET | `/v1/validate/vehicle` | `plate` query (Bangla or English) | `{ area: {slug,name_en,name_bn}, metro, class, series, number }` (`class` is the Bangla letter) |
| GET | `/v1/validate/tin/{number}` | path | `{ format: "e-tin-12" }` |
| GET | `/v1/validate/bin/{number}` | path | `{ format: "bin-9"\|"legacy_or_branch" }` |
| GET | `/v1/validate/postcode/{code}` | path | `{ exists, post_offices? }` |
| POST | `/v1/validate/{type}` | `{ "value": string }`, `type` ∈ `nid|vehicle|tin|bin|postcode` | same |

200 `data` = `ValidationResult { type, valid, reason?, normalized?, details? }`. Invalid input is a
200 with `valid:false` and `reason` (e.g. `invalid_length`, `invalid_chars`, `invalid_birth_year`,
`unknown_area`, `unknown_class`, `invalid_format`). 400 only for missing input / unknown `type`.
`normalized` for plates uses Bangla digits and standard spacing (`ঢাকা মেট্রো-গ ১১-২২৩৩`).

```json
// GET /v1/validate/vehicle?plate=ঢাকা মেট্রো-গ ১১-২২৩৩
{ "type": "vehicle", "valid": true, "normalized": "ঢাকা মেট্রো-গ ১১-২২৩৩",
  "details": { "area": { "slug": "dhaka", "name_en": "Dhaka", "name_bn": "ঢাকা" }, "metro": true,
               "class": "গ", "series": 11, "number": 2233 } }
```

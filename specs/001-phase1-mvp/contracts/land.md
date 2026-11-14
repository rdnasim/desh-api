# Contract: Land Units (US5)

`meta.disclaimer`: "Land unit sizes vary by region; verify with the local land office for legal use. Regional units (kani, gonda, kora) are not yet included."

Units: `acre` `bigha` `chotak` `decimal` `hectare` `katha` `ojutangsho` `sqft` `sqm` `sqyd`. `from`/`to` accept the slug,
an alias (shotangsho, shotok, gaj, m2, …) or the Bangla name (কাঠা, শতাংশ, শতক). Only `region=standard` exists until regional values are sourced.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/land/units` | `region?` | `LandUnit[]` | — |
| GET | `/v1/land/convert` | `value` (> 0, ≤ 10¹², Latin/Bangla digits), `from`, `to?`, `region?` (default `standard`) | `LandConversion` | 400 unknown unit/region (message lists valid ones), non-positive value |

`LandConversion = { input: { value, unit, name_bn }, region, result?: { value, unit },
all: { [unitSlug]: number } }` — values rounded to 2 decimals; `result` present only when `to` given.

```json
// GET /v1/land/convert?value=5&from=katha&to=sqft
{ "input": { "value": 5, "unit": "katha", "name_bn": "কাঠা" }, "region": "standard",
  "result": { "value": 3600, "unit": "sqft" },
  "all": { "sqft": 3600, "sqm": 334.45, "decimal": 8.26, "katha": 5, "bigha": 0.25, "acre": 0.08, "hectare": 0.03, "chotak": 80, "ojutangsho": 826.45, "sqyd": 400 } }
```

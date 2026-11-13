# Contract: Land Units (US5)

`meta.disclaimer`: "Land unit sizes vary by region; verify with local land office for legal use."

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/land/units` | `region?` | `LandUnit[]` | — |
| GET | `/v1/land/convert` | `value` (> 0), `from` (slug/alias), `to?` (slug/alias), `region?` (default `standard`) | `LandConversion` | 400 unknown unit/region, non-positive value |

`LandConversion = { input: { value, unit, name_bn }, region, result?: { value, unit },
all: { [unitSlug]: number } }` — values rounded to 2 decimals; `result` present only when `to` given.

```json
// GET /v1/land/convert?value=5&from=katha&to=sqft
{ "input": { "value": 5, "unit": "katha", "name_bn": "কাঠা" }, "region": "standard",
  "result": { "value": 3600, "unit": "sqft" },
  "all": { "sqft": 3600, "sqm": 334.45, "decimal": 8.26, "katha": 5, "bigha": 0.25, "acre": 0.08, "hectare": 0.03, "chotak": 80, "ojutangsho": 826.45 } }
```

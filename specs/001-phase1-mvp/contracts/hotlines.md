# Contract: Hotlines (US7)

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/hotlines` | `category?` | `Hotline[]` sorted by `number` | 400 unknown category (lists valid ones) |
| GET | `/v1/hotlines/categories` | — | `{ slug, name_en, name_bn }[]` | — |
| GET | `/v1/hotlines/{number}` | — | `Hotline` | 404 |

```json
{ "number": "999", "name_en": "National Emergency Service", "name_bn": "জাতীয় জরুরি সেবা",
  "category": "emergency", "toll_free": true, "hours": "24/7",
  "source": "https://999.gov.bd", "last_verified": "2026-11-10" }
```

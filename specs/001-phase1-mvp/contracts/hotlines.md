# Contract: Hotlines (US7)

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/hotlines` | `category?` | `Hotline[]` sorted by `number` | 400 unknown category (lists valid ones) |
| GET | `/v1/hotlines/categories` | — | `{ slug, name_en, name_bn }[]` | — |
| GET | `/v1/hotlines/{number}` | — (Latin or Bangla digits) | `Hotline` | 404 |

```json
{ "number": "999", "name_en": "National Emergency Service (police, fire, ambulance)", "name_bn": "জাতীয় জরুরি সেবা",
  "category": "emergency", "toll_free": true, "hours": "24/7",
  "source": "https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89", "last_verified": "2026-11-14" }
```

`toll_free` and `hours` are omitted when the official source does not state them. Categories:
`emergency` `health` `women-children` `disaster` `information` `legal-aid` `government-service` `transport` `utility`.

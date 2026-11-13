# Contract: Geo (US1)

Entity shapes: see `data-model.md` → Geo. `meta.source` from DatasetMeta `geo.*`.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/divisions` | — | `Division[]` (8) | — |
| GET | `/v1/divisions/{division}` | — | `Division` | 404 |
| GET | `/v1/divisions/{division}/districts` | — | `District[]` | 404 |
| GET | `/v1/districts` | `division?` | `District[]` | 400 unknown division |
| GET | `/v1/districts/{district}` | — | `District` | 404 |
| GET | `/v1/upazilas` | `district` (required), `page`, `per_page` | `Upazila[]` | 400, 404 |
| GET | `/v1/upazilas/{upazila}` | — | `Upazila` + `district` object | 404 |
| GET | `/v1/unions` | `upazila` (required), `page`, `per_page` | `Union[]` | 400, 404 |
| GET | `/v1/postcodes/{code}` | — | `{ postcode, post_offices: PostOffice[] }` | 400 bad format, 404 |
| GET | `/v1/search` | `q` (2–50 chars), `level?`, `limit?` (1–20, default 10) | `SearchHit[]` | 400 |
| GET | `/v1/nearest` | `lat`, `lon`, `level?` (`district`\|`upazila`, default `district`) | `{ area, distance_km }` | 400 outside BD |

`SearchHit = { level, slug, name_en, name_bn, parents: { division?, district?, upazila? } }`

Example — `GET /v1/districts?division=chattogram` →
```json
{ "success": true,
  "data": [ { "slug": "cumilla", "name_en": "Cumilla", "name_bn": "কুমিল্লা", "division": "chattogram",
              "aliases": ["Comilla"], "lat": 23.4607, "lon": 91.1809 } ],
  "meta": { "source": "BBS Geocode", "last_updated": "2026-11-01", "version": "v1" } }
```

Example — `GET /v1/postcodes/1205` →
```json
{ "success": true,
  "data": { "postcode": "1205", "post_offices": [ { "name_en": "New Market", "name_bn": "নিউ মার্কেট",
            "thana_en": "Dhaka Sadar", "district": "dhaka" } ] },
  "meta": { "source": "Bangladesh Post Office", "last_updated": "2026-11-01", "version": "v1" } }
```

# Contract: Geo (US1)

Entity shapes: see `data-model.md` → Geo. `meta.source` from DatasetMeta `geo.*`.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/divisions` | — | `Division[]` (8) | — |
| GET | `/v1/divisions/{division}` | — | `Division` | 404 |
| GET | `/v1/divisions/{division}/districts` | — | `District[]` | 404 |
| GET | `/v1/districts` | `division?` | `District[]` | 404 unknown division |
| GET | `/v1/districts/{district}` | — | `District` | 404 |
| GET | `/v1/upazilas` | `district` (required), `page`, `per_page` | `Upazila[]` | 400 missing/bad paging, 404 unknown district |
| GET | `/v1/upazilas/{upazila}` | — | `Upazila` + `parents { district, division }` | 404 |
| GET | `/v1/unions` | `upazila` (required), `page`, `per_page` | `Union[]` | 400 missing/bad paging, 404 unknown upazila |
| GET | `/v1/postcodes/{code}` | — | `{ postcode, post_offices: PostOffice[] }` | 400 bad format, 404 |
| GET | `/v1/search` | `q` (2–50 chars), `level?` (`division\|district\|upazila\|union\|post_office`), `limit?` (1–20, default 10) | `SearchHit[]` | 400 |
| GET | `/v1/nearest` | `lat`, `lon`, `level?` (`district`\|`upazila`, default `district`) | `{ area, distance_km }` | 400 outside BD |

`SearchHit = { level, slug, name_en, name_bn (null for post offices), postcode?, parents }` where
`parents = { division?, district?, upazila?, city_corporation? }`, each `{ slug, name_en, name_bn }`.

Unknown parent slugs in list filters return 404 (the resource you are listing under does not exist);
a missing required filter returns 400.

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
  "data": { "postcode": "1205", "post_offices": [ { "postcode": "1205", "name_en": "New Market TSO", "name_bn": null,
            "thana_en": "New market", "district": "dhaka", "city_corporation": "dhaka-south",
            "lat": 23.7433, "lon": 90.3841 } ] },
  "meta": { "source": "Bangladesh Post Office", "last_updated": "2026-11-01", "version": "v1" } }
```

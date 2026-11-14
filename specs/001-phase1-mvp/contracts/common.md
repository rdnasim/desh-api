# Contract: Common Conventions

Applies to every endpoint in `contracts/*.md`. The authoritative machine-readable contract is the
generated `/openapi.json`; these files are the human-reviewed design it must match.

## Base

- Base path: `/v1`. Content type: `application/json; charset=utf-8`.
- CORS: `Access-Control-Allow-Origin: *` for `GET`, `POST`, `OPTIONS`.
- Numeric params accept Latin or Bangla digits (`1250` or `১২৫০`).

## Envelopes

```json
{ "success": true, "data": {}, "meta": { "source": "BBS Geocode", "last_updated": "2026-11-01", "version": "v1" } }
```

```json
{ "success": false,
  "error": { "code": "not_found", "message": "District 'xyz' not found", "message_bn": "জেলা 'xyz' পাওয়া যায়নি" },
  "meta": { "source": "desh-api", "last_updated": "2026-11-13", "version": "v1" } }
```

## Error codes

| HTTP | code | When |
|---|---|---|
| 400 | `invalid_parameter` | Param missing/wrong type/out of range; `details` lists issues |
| 404 | `not_found` | Unknown slug, postcode, or route |
| 405 | `method_not_allowed` | Wrong method |
| 413 | `payload_too_large` | Body over limit (Bijoy: 100 KB, bulk: 100 items) |
| 429 | `rate_limited` | > 120 req / 60 s per IP; `Retry-After` header |
| 500 | `internal_error` | Unexpected; no internals leaked |

## Pagination (lists that can exceed 100 items)

Query `page` (≥ 1, default 1), `per_page` (1–500, default 100). `meta.pagination = { page, per_page, total }`.

## Caching

| Kind | Header |
|---|---|
| Reference data & deterministic conversions | `Cache-Control: public, max-age=86400, s-maxage=604800` + `ETag` |
| Validators, phone | `Cache-Control: no-store` |
| Random content without `seed` | `Cache-Control: no-store` |

## Non-API routes

- `GET /` → JSON index of modules and links. `GET /openapi.json` → OpenAPI 3.1. `GET /docs` → Scalar UI.
- `GET /health` → `{ "status": "ok", "version": "<git sha>" }`.

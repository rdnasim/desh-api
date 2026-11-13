# Quickstart & Validation Guide: Phase 1 MVP

Proves the feature works end-to-end. Endpoint shapes: [contracts/](./contracts/). Entities:
[data-model.md](./data-model.md).

## Prerequisites

- Node.js ≥ 22, pnpm ≥ 9
- Cloudflare account (only for deploy) and `wrangler login`

## Setup

```bash
pnpm install
pnpm data:build        # validate data/ and generate src/generated/
pnpm dev               # wrangler dev → http://localhost:8787
```

## Automated validation

```bash
pnpm typecheck && pnpm lint
pnpm data:check        # schema + integrity of every dataset
pnpm test              # unit + contract + data + golden suites (inside workerd)
pnpm size:check        # compressed Worker bundle < 2.5 MB
```

All must pass with zero failures (SC-002, SC-003).

## Manual smoke scenarios (local)

| # | Story | Request | Expect |
|---|---|---|---|
| 1 | US1 | `curl localhost:8787/v1/divisions` | 8 items, each has `name_en` + `name_bn`; `meta.source` set |
| 2 | US1 | `curl 'localhost:8787/v1/districts?division=chattogram'` | includes `cumilla` |
| 3 | US1 | `curl 'localhost:8787/v1/search?q=comilla'` | first hit is district `cumilla` (alias match) |
| 4 | US1 | `curl localhost:8787/v1/postcodes/1205` | ≥ 1 post office in district `dhaka` |
| 5 | US1 | `curl 'localhost:8787/v1/nearest?lat=23.81&lon=90.41'` | district `dhaka` |
| 6 | US2 | `curl 'localhost:8787/v1/bangla/num-to-words?n=১২৫০'` | `এক হাজার দুইশত পঞ্চাশ` |
| 7 | US2 | `curl 'localhost:8787/v1/bangla/date?date=2026-12-16'` | ১ পৌষ ১৪৩৩ |
| 8 | US3 | `curl localhost:8787/v1/phone/%2B8801712345678` | `valid:true`, Grameenphone, `Cache-Control: no-store` |
| 9 | US4 | `curl -X POST localhost:8787/v1/convert/bijoy-to-unicode -H 'content-type: application/json' -d '{"text":"Avgvi †mvbvi evsjv"}'` | `আমার সোনার বাংলা` |
| 10 | US5 | `curl 'localhost:8787/v1/land/convert?value=5&from=katha&to=sqft'` | `result.value = 3600` |
| 11 | US6 | `curl localhost:8787/v1/validate/nid/1234567890` | `valid:true`, `format:"10"` |
| 12 | US7 | `curl 'localhost:8787/v1/hotlines?category=emergency'` | includes `999` with `last_verified` |
| 13 | US8 | `curl 'localhost:8787/v1/fun/proverb/random?seed=abc'` twice | identical results |
| 14 | US9 | open `localhost:8787/docs` | all Phase 1 endpoints listed; "Try it" works |
| 15 | — | `curl -i localhost:8787/v1/nope` | 404 error envelope |

## Privacy check (SC-007)

Run `wrangler tail` while calling scenarios 8 and 11; confirm log lines contain the route template
(`/v1/validate/nid/:number`) and never the number itself.

## Deploy & production smoke

```bash
pnpm deploy            # wrangler deploy
BASE=https://<worker-domain> pnpm smoke   # runs scenarios 1–15 against production
```

Measure p95 latency from a Dhaka vantage point (SC-004) with `pnpm smoke --bench`.

# Desh API

Free, open-source API for Bangladesh reference data and Bangla language tools: address
hierarchies, postcodes, Bangla numbers and dates, phone validation, Bijoy ↔ Unicode conversion and
land units. Every response says where its data came from.

> Status: Phase 1 in development, not deployed yet. "Desh API" is a working name.

## Try it

```bash
pnpm install
pnpm dev                     # http://localhost:8787
open http://localhost:8787/docs
```

`/docs` has every endpoint with examples and a "Try it" button. The machine-readable description is
at `/openapi.json`.

## Examples

```bash
# Address hierarchy (English and Bangla names)
curl localhost:8787/v1/divisions
curl 'localhost:8787/v1/districts?division=chattogram'
curl 'localhost:8787/v1/upazilas?district=cumilla'
curl localhost:8787/v1/postcodes/1205
curl 'localhost:8787/v1/search?q=comilla'          # old spellings work

# Bangla toolkit
curl 'localhost:8787/v1/bangla/taka-in-words?amount=1250.50'
# → "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা"
curl 'localhost:8787/v1/bangla/format-number?n=1250000'   # → "১২,৫০,০০০"
curl 'localhost:8787/v1/bangla/date?date=2026-12-16'      # → "১ পৌষ ১৪৩৩ বঙ্গাব্দ"

# Phone numbers (format check only, never stored or logged)
curl -X POST localhost:8787/v1/phone/validate -H 'content-type: application/json' \
  -d '{"number":"+8801712345678"}'

# Bijoy (SutonnyMJ) → Unicode
curl -X POST localhost:8787/v1/convert/bijoy-to-unicode -H 'content-type: text/plain' \
  --data-binary 'Avgvi †mvbvi evsjv'                     # → "আমার সোনার বাংলা"

# Land units
curl 'localhost:8787/v1/land/convert?value=5&from=katha&to=sqft'   # → 3600
```

Every response looks like this:

```json
{ "success": true, "data": { "...": "..." },
  "meta": { "source": "Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)", "last_updated": "2026-11-12", "version": "v1" } }
```

Numbers can be sent with Bangla digits (`১২৫০`). No API key is needed; the limit is 120 requests
per minute per IP.

## Development

| Command | What it does |
|---|---|
| `pnpm dev` | Build data and run the Worker locally |
| `pnpm test` | Unit, contract, data-integrity and golden-file tests (run inside workerd) |
| `pnpm data:check` | Validate every file in `data/` |
| `pnpm typecheck` / `pnpm lint` | Types and Biome |
| `pnpm size:check` | Keep the Worker bundle under budget |
| `pnpm data:docs` | Regenerate [DATA_SOURCES.md](DATA_SOURCES.md) from `data/meta.json` |
| `BASE=<url> pnpm smoke --bench` | Run the end-to-end scenarios against a running API, with latency |

Reference data lives as JSON in [`data/`](data/), with sources and licences in
[`data/meta.json`](data/meta.json) (readable summary: [DATA_SOURCES.md](DATA_SOURCES.md)). Fixing data is a
pull request against those files; see [CONTRIBUTING.md](CONTRIBUTING.md). How we handle what you
send: [PRIVACY.md](PRIVACY.md).

The project is built spec-first with [Spec Kit](https://github.com/github/spec-kit): principles in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md), the product vision in
[`docs/vision.md`](docs/vision.md), the roadmap in [`docs/roadmap.md`](docs/roadmap.md), and the
current feature's spec, plan and tasks in [`specs/001-phase1-mvp/`](specs/001-phase1-mvp/).

## Data sources and credits

- Administrative areas and postcodes: [nuhil/bangladesh-geocode](https://github.com/nuhil/bangladesh-geocode)
  (MIT), built from Bangladesh Bureau of Statistics geocodes via UN OCHA (CC BY-IGO) and GeoNames
  (CC BY 4.0).
- Bijoy mapping: derived from [bn-ansi-to-unicode](https://github.com/BinduLogic/bn-ansi-to-unicode)
  (MIT, BinduLogic).
- Phonetic transliteration: [@subhesadek/avro-phonetic](https://github.com/SubheSadek/avro-phonetic)
  (MPL-2.0).

## Licence

Code: [MIT](LICENSE). Data: [CC BY 4.0](LICENSE-DATA), with upstream attribution as listed in
`data/meta.json`.

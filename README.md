<div align="center">

# 🇧🇩 Desh API

**Free, open API for Bangladesh reference data and Bangla language tools.**
বাংলাদেশের তথ্য ও বাংলা ভাষার টুলসের জন্য একটি ফ্রি, ওপেন সোর্স API।

[![CI](https://github.com/rdnasim/desh-api/actions/workflows/ci.yml/badge.svg)](https://github.com/rdnasim/desh-api/actions/workflows/ci.yml)
[![Deploy](https://github.com/rdnasim/desh-api/actions/workflows/deploy.yml/badge.svg)](https://github.com/rdnasim/desh-api/actions/workflows/deploy.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-green.svg)](LICENSE-DATA)

[**Live API**](https://desh-api.riadul.workers.dev) ·
[**Interactive docs**](https://desh-api.riadul.workers.dev/docs) ·
[OpenAPI](https://desh-api.riadul.workers.dev/openapi.json) ·
[Data sources](DATA_SOURCES.md) ·
[Contributing](CONTRIBUTING.md)

</div>

---

Every Bangladeshi developer has rebuilt the same things: a division → district → upazila dropdown
from an old spreadsheet, "taka in words" for invoices, a Bijoy-to-Unicode converter, a phone-number
regex. Desh API puts them behind one clean, documented API, free to use, with **English and Bangla
names everywhere** and **the source of every fact in every response**.

- No sign-up, no API key
- Send numbers in Latin or Bangla digits (`1250` or `১২৫০`)
- Validators check formats only and never store what you send
- Runs on Cloudflare's edge network, so responses are fast

## Try it now

No install needed. Paste any of these into a terminal or browser:

```bash
curl https://desh-api.riadul.workers.dev/v1/districts/cumilla
```

```json
{
  "success": true,
  "data": {
    "slug": "cumilla", "name_en": "Cumilla", "name_bn": "কুমিল্লা", "aliases": ["Comilla"],
    "bbs_code": "BD2019", "lat": 23.468275, "lon": 91.178814, "division": "chattogram"
  },
  "meta": { "source": "Bangladesh GeoCode (BBS geocodes via UN OCHA COD-AB)", "last_updated": "2026-11-12", "version": "v1" }
}
```

More examples:

```bash
# Taka in words, for invoices and cheques
curl 'https://desh-api.riadul.workers.dev/v1/bangla/taka-in-words?amount=1250.50'
# → "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা"

# Today's Bangla date (revised Bangla Academy calendar)
curl 'https://desh-api.riadul.workers.dev/v1/bangla/date?date=2026-12-16'
# → "১ পৌষ ১৪৩৩ বঙ্গাব্দ", Wednesday, season: শীত

# Search with old spellings
curl 'https://desh-api.riadul.workers.dev/v1/search?q=comilla'
# → district "cumilla" (কুমিল্লা), division "chattogram"

# Bijoy (SutonnyMJ) → Unicode
curl -X POST https://desh-api.riadul.workers.dev/v1/convert/bijoy-to-unicode \
  -H 'content-type: text/plain' --data-binary 'Avgvi †mvbvi evsjv'
# → "আমার সোনার বাংলা"

# Validate a phone number (send it in the body, not the URL)
curl -X POST https://desh-api.riadul.workers.dev/v1/phone/validate \
  -H 'content-type: application/json' -d '{"number":"+8801712345678"}'
# → valid, "01712345678", original operator Grameenphone

# Land units
curl 'https://desh-api.riadul.workers.dev/v1/land/convert?value=5&from=katha&to=decimal'
# → 8.26 decimal (3,600 sq ft)
```

The [interactive docs](https://desh-api.riadul.workers.dev/docs) list every endpoint with a
"Try it" button.

## What's inside

| Module | What it does | Example |
|---|---|---|
| **Geo** | 8 divisions, 64 districts, 495 upazilas, 4,540 unions, 1,349 post offices; bilingual search; nearest area to a GPS point | [`/v1/upazilas?district=cumilla`](https://desh-api.riadul.workers.dev/v1/upazilas?district=cumilla) |
| **Bangla toolkit** | Number and taka in words, Latin ⇄ Bangla digits, lakh/crore formatting (১২,৫০,০০০), Bangla calendar date, ordinals, URL slugs, Avro Phonetic transliteration | [`/v1/bangla/num-to-words?n=1250`](https://desh-api.riadul.workers.dev/v1/bangla/num-to-words?n=1250) |
| **Phone** | Validate and normalise mobile numbers in any common format, original operator, bulk (up to 100) | `POST /v1/phone/validate` |
| **Convert** | Bijoy (SutonnyMJ) ⇄ Unicode, up to 100 KB per request | `POST /v1/convert/bijoy-to-unicode` |
| **Land** | Convert katha, bigha, decimal (shotangsho), chotak, acre, sq ft, sq m, gaj… | [`/v1/land/units`](https://desh-api.riadul.workers.dev/v1/land/units) |
| **Validate** | Format checks for NID, vehicle plates, e-TIN, VAT BIN and postcodes | `POST /v1/validate/{type}` |
| **Hotlines** | National hotline numbers, each checked against an official gov.bd page | [`/v1/hotlines?category=emergency`](https://desh-api.riadul.workers.dev/v1/hotlines?category=emergency) |
| **Fun** | Traditional proverbs and riddles, quiz questions, GI-registered foods by district, on-this-day history | [`/v1/fun/proverb/random`](https://desh-api.riadul.workers.dev/v1/fun/proverb/random) |

Coming next: official public holidays and working-day counts
([in review](https://github.com/rdnasim/desh-api/pull/2)), then finance calculators (income tax,
VAT, EMI). See the [roadmap](docs/roadmap.md).

## How responses look

Every success has the same shape, and `meta.source` always says where the data came from:

```json
{ "success": true, "data": { … }, "meta": { "source": "…", "last_updated": "2026-11-14", "version": "v1" } }
```

Errors use a stable `code`, a readable message (often in Bangla too), and the right HTTP status:

```json
{ "success": false, "error": { "code": "not_found", "message": "Route /v1/nope not found", "message_bn": "এই পাথটি পাওয়া যায়নি" }, "meta": { … } }
```

| Status | `code` | When |
|---|---|---|
| 400 | `invalid_parameter` | A parameter is missing, malformed or out of range |
| 404 | `not_found` | Unknown slug, postcode or route |
| 413 | `payload_too_large` | Body over the limit (Bijoy: 100 KB; bulk phone: 100 numbers) |
| 429 | `rate_limited` | More than 120 requests per minute from one IP (see `Retry-After`) |

**Limits and caching.** No key is needed; the limit is 120 requests per minute per IP. Reference
data is cacheable for a day; validator responses are never cached. CORS is open, so you can call the
API straight from a browser.

## Privacy

Validators (NID, phone, TIN, BIN, plates, postcodes) only check that a value is **well-formed**.
Nothing is looked up, stored or logged; our logs record only the route pattern, never the value.
For identifiers, use the `POST` endpoints so values stay out of URLs. Details: [PRIVACY.md](PRIVACY.md).

## Where the data comes from

Every dataset lists its source, licence and retrieval date in [`data/meta.json`](data/meta.json)
(readable version: [DATA_SOURCES.md](DATA_SOURCES.md)). Highlights:

| Data | Source |
|---|---|
| Administrative areas, postcodes | Bangladesh Bureau of Statistics geocodes (via UN OCHA) and GeoNames, compiled by [nuhil/bangladesh-geocode](https://github.com/nuhil/bangladesh-geocode) |
| Hotlines | [Bangladesh National Portal](https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89), [DGHS](https://dghs.gov.bd/) |
| GI foods | [Department of Patents, Designs and Trademarks](https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf) |
| Bijoy mapping | Derived from [bn-ansi-to-unicode](https://github.com/BinduLogic/bn-ansi-to-unicode) (MIT) |
| Transliteration | [@subhesadek/avro-phonetic](https://github.com/SubheSadek/avro-phonetic) (MPL-2.0) |

If something is wrong, please [report it](https://github.com/rdnasim/desh-api/issues/new/choose)
with a source. Facts that reliable sources disagree on are left out rather than guessed.

## Run it yourself

You need Node.js 22+ and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/rdnasim/desh-api.git
cd desh-api
pnpm install
pnpm dev            # http://localhost:8787 — docs at /docs
```

| Command | What it does |
|---|---|
| `pnpm dev` | Build the data and run the API locally |
| `pnpm test` | Unit, contract, data-integrity and golden-file tests (run inside the Workers runtime) |
| `pnpm data:check` | Validate every file in `data/` |
| `pnpm typecheck` · `pnpm lint` | TypeScript and Biome |
| `BASE=<url> pnpm smoke --bench` | End-to-end checks against a running API, with latency |

**Stack:** TypeScript, [Hono](https://hono.dev) with OpenAPI-generated docs
([Scalar](https://scalar.com)), Cloudflare Workers, Vitest. Reference data is plain JSON in
[`data/`](data/), validated and bundled at build time; there is no database.

```text
data/            reference data (edit these to fix data)
src/modules/     one folder per module: schemas, service, routes
scripts/         data build, importers, smoke test
tests/           unit, contract, data and golden-file tests
specs/           Spec Kit specs, plans and tasks for each feature
```

The project is planned spec-first with [GitHub Spec Kit](https://github.com/github/spec-kit). The
rules it follows are in the [constitution](.specify/memory/constitution.md); each feature's spec,
plan and tasks are in [`specs/`](specs/).

## Contributing

The most useful contributions are **data fixes**, and you don't need to code: edit a JSON file in
[`data/`](data/) or open an issue, and say where the fact comes from. New proverbs, riddles, quiz
questions and history events are welcome too. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code: [MIT](LICENSE). Data: [CC BY 4.0](LICENSE-DATA). When you reuse the data, please credit
"Desh API contributors" and the upstream sources in [DATA_SOURCES.md](DATA_SOURCES.md).

"Desh API" is a working name.

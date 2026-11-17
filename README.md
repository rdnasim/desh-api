<div align="center">

# 🇧🇩 Desh API

**Free, open API for Bangladesh reference data, Bangla language tools and calculators.**
বাংলাদেশের তথ্য, বাংলা ভাষার টুলস ও ক্যালকুলেটরের জন্য একটি ফ্রি, ওপেন সোর্স API।

[![CI](https://github.com/rdnasim/desh-api/actions/workflows/ci.yml/badge.svg)](https://github.com/rdnasim/desh-api/actions/workflows/ci.yml)
[![Deploy](https://github.com/rdnasim/desh-api/actions/workflows/deploy.yml/badge.svg)](https://github.com/rdnasim/desh-api/actions/workflows/deploy.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-green.svg)](LICENSE-DATA)

[**Web Portal**](https://portal.deshapi.riadul.com) ·
[**Live API**](https://deshapi.riadul.com) ·
[**Interactive docs**](https://deshapi.riadul.com/docs) ·
[OpenAPI](https://deshapi.riadul.com/openapi.json) ·
[Data sources](DATA_SOURCES.md) ·
[Contributing](CONTRIBUTING.md)

</div>

---

Every Bangladeshi developer has rebuilt the same things: a division → district → upazila dropdown
from an old spreadsheet, "taka in words" for invoices, a Bijoy-to-Unicode converter, a phone-number
regex, a bank-branch picker, an income-tax calculator. Desh API puts them behind one clean,
documented API, free to use, with **English and Bangla names** and **the source of every fact in
every response**.

- Web Portal: **[`https://portal.deshapi.riadul.com`](https://portal.deshapi.riadul.com)** (Interactive citizen widgets + Developer API Explorer)
- API Base URL: **`https://deshapi.riadul.com`** (the older `desh-api.riadul.workers.dev` address also works)
- No sign-up, no API key required for public use (120 req/min, 10,000 req/day)
- Send numbers in Latin or Bangla digits (`1250` or `১২৫০`)
- Validators check formats only and never store what you send
- 23 modules: geo, Bangla toolkit, phone, Bijoy, land, validators, hotlines, fun, holidays, finance, mock data, banks, universities & education boards, gold & zakat, market prices, MFS, prayer & Ramadan, Dhaka Metro Rail, healthcare & hospitals, weather & disaster signals, Bangladesh Railway, constituencies, and developer quota telemetries.
- Runs on Cloudflare's edge network, so responses are fast

## Try it now

No install needed. Paste any of these into a terminal or browser:

```bash
curl https://deshapi.riadul.com/v1/districts/cumilla
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
curl 'https://deshapi.riadul.com/v1/bangla/taka-in-words?amount=1250.50'
# → "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা"

# Today's Bangla date (revised Bangla Academy calendar)
curl 'https://deshapi.riadul.com/v1/bangla/date?date=2026-12-16'
# → "১ পৌষ ১৪৩৩ বঙ্গাব্দ", Wednesday, season: শীত

# Search with old spellings
curl 'https://deshapi.riadul.com/v1/search?q=comilla'
# → district "cumilla" (কুমিল্লা), division "chattogram"

# Bijoy (SutonnyMJ) → Unicode
curl -X POST https://deshapi.riadul.com/v1/convert/bijoy-to-unicode \
  -H 'content-type: text/plain' --data-binary 'Avgvi †mvbvi evsjv'
# → "আমার সোনার বাংলা"

# Validate a phone number (send it in the body, not the URL)
curl -X POST https://deshapi.riadul.com/v1/phone/validate \
  -H 'content-type: application/json' -d '{"number":"+8801712345678"}'
# → valid, "01712345678", original operator Grameenphone

# Land units
curl 'https://deshapi.riadul.com/v1/land/convert?value=5&from=katha&to=decimal'
# → 8.26 decimal (3,600 sq ft)

# Official holidays and working days (from the government's 2027 holiday notification)
curl 'https://deshapi.riadul.com/v1/holidays?year=2027&closed=true'      # days offices close
curl 'https://deshapi.riadul.com/v1/holidays/dates?year=2027&closed=true' # → ["2027-01-24", …] (27 dates)
curl 'https://deshapi.riadul.com/v1/working-days?from=2027-12-01&to=2027-12-31'
# → 21 working days (Fri/Sat weekend, Victory Day on 16 Dec)

# Income tax under the Finance Act 2026 (tax year 2027-28 = income earned Jul 2026 – Jun 2027)
curl 'https://deshapi.riadul.com/v1/finance/income-tax?income=1800000&employment_income=1800000'
# → ৳5,00,000 salary exemption, ৳1,30,000 tax, with a slab-by-slab breakdown

# Loan EMI, VAT, DPS, gratuity
curl 'https://deshapi.riadul.com/v1/finance/emi?principal=1000000&rate=9&months=60'   # → 20,758.36 a month
curl 'https://deshapi.riadul.com/v1/finance/vat?amount=1150&inclusive=true'            # → net 1,000 + VAT 150

# Synthetic test data (same seed, same people)
curl 'https://deshapi.riadul.com/v1/mock/people?count=3&seed=demo'
# → bilingual names, valid-format phones and NIDs, example.com emails, real upazilas and postcodes

# Today's gold price, and zakat on 10 lakh (nisab from the silver price)
curl 'https://deshapi.riadul.com/v1/gold/prices'
curl 'https://deshapi.riadul.com/v1/zakat?wealth=1000000'

# Today's Dhaka retail prices (TCB) and fuel prices
curl 'https://deshapi.riadul.com/v1/market/prices?category=edible-oil'
curl 'https://deshapi.riadul.com/v1/fuel/prices'   # → diesel 135, octane 165, petrol 160, kerosene 155 Tk/litre

# Which branch is this routing number? (check digit verified)
curl 'https://deshapi.riadul.com/v1/routing/010130065'
# → Agrani Bank, Kachua Bazar branch, Kachua, Chandpur
curl 'https://deshapi.riadul.com/v1/banks/sonali-bank/branches?district=cumilla'

# MFS cash-out comparison & USSD codes (bKash, Nagad, Rocket, Upay, TAP)
curl 'https://deshapi.riadul.com/v1/mfs/compare?amount=5000&action=cash-out&channel=app'
curl 'https://deshapi.riadul.com/v1/mfs/ussd'

# Prayer times & Ramadan calendar (Islamic Foundation Bangladesh, 64 districts supported)
curl 'https://deshapi.riadul.com/v1/prayer/times?district=chattogram'
curl 'https://deshapi.riadul.com/v1/prayer/ramadan?district=sylhet'

# Dhaka Metro Rail (MRT Line-6) fare calculator with 10% MRT Pass discount
curl 'https://deshapi.riadul.com/v1/metro/fare?from=uttara-north&to=motijheel'
# → ৳100 single ticket, ৳90 MRT Pass, 32 mins, 16 stations
curl 'https://deshapi.riadul.com/v1/metro/stations'

# Healthcare directory, emergency hotlines and hospital bed capacities
curl 'https://deshapi.riadul.com/v1/health/emergency'
curl 'https://deshapi.riadul.com/v1/health/hospitals?division=dhaka&type=specialized_institute'

# Weather warning signals (BMD 1-11), inland riverport signals (1-4) & Air Quality Index
curl 'https://deshapi.riadul.com/v1/weather/signals/maritime/10'
curl 'https://deshapi.riadul.com/v1/weather/aqi/lookup?value=165'
curl 'https://deshapi.riadul.com/v1/weather/seasons'

# Bangladesh Railway intercity express trains and schedules
curl 'https://deshapi.riadul.com/v1/railway/trains?origin=dhaka&destination=chattogram'
# → Suborno Express (702), Sonar Bangla Express (788)
curl 'https://deshapi.riadul.com/v1/railway/trains/701'
curl 'https://deshapi.riadul.com/v1/railway/classes'

# Parliamentary constituencies (Jatiya Sangsad আসন ১–৩০০)
curl 'https://deshapi.riadul.com/v1/constituencies/174'             # → Dhaka-1
curl 'https://deshapi.riadul.com/v1/constituencies?district=dhaka'  # → Dhaka-1 through Dhaka-20
curl 'https://deshapi.riadul.com/v1/constituencies/districts'       # → 64 districts breakdown
```

The [interactive docs](https://deshapi.riadul.com/docs) list every endpoint with a
"Try it" button.

## What's inside

| Module | What it does | Example |
|---|---|---|
| **Geo** | 8 divisions, 64 districts, 495 upazilas, 4,540 unions, 1,349 post offices; bilingual search; nearest area to a GPS point | [`/v1/upazilas?district=cumilla`](https://deshapi.riadul.com/v1/upazilas?district=cumilla) |
| **Bangla toolkit** | Number and taka in words, Latin ⇄ Bangla digits, lakh/crore formatting (১২,৫০,০০০), Bangla calendar date, ordinals, URL slugs, Avro Phonetic transliteration | [`/v1/bangla/num-to-words?n=1250`](https://deshapi.riadul.com/v1/bangla/num-to-words?n=1250) |
| **Phone** | Validate and normalise mobile numbers in any common format, original operator, bulk (up to 100) | `POST /v1/phone/validate` |
| **Convert** | Bijoy (SutonnyMJ) ⇄ Unicode, up to 100 KB per request | `POST /v1/convert/bijoy-to-unicode` |
| **Land** | Convert katha, bigha, decimal (shotangsho), chotak, acre, sq ft, sq m, gaj… | [`/v1/land/units`](https://deshapi.riadul.com/v1/land/units) |
| **Validate** | Format checks for NID, vehicle plates, e-TIN, VAT BIN, postcodes and bank routing numbers (check digit) | `POST /v1/validate/{type}` |
| **Hotlines** | National hotline numbers, each checked against an official gov.bd page | [`/v1/hotlines?category=emergency`](https://deshapi.riadul.com/v1/hotlines?category=emergency) |
| **Fun** | Traditional proverbs and riddles, quiz questions, GI-registered foods by district, on-this-day history | [`/v1/fun/proverb/random`](https://deshapi.riadul.com/v1/fun/proverb/random) |
| **Holidays** | Official 2027 public holidays (general, executive-order, optional by community), "is this a holiday?", working-day counts | [`/v1/is-holiday?date=2027-12-16`](https://deshapi.riadul.com/v1/is-holiday?date=2027-12-16) |
| **Finance** | Income tax from the Finance Act 2026 for tax years 2026-27 to 2030-31 (all taxpayer categories, salary exemption, investment rebate, minimum tax), VAT, loan EMI with schedule, DPS maturity, statutory gratuity | [`/v1/finance/income-tax?income=1000000`](https://deshapi.riadul.com/v1/finance/income-tax?income=1000000) |
| **Mock data** | Synthetic Bangladeshi people and addresses for testing: bilingual names, phones and NIDs that pass the validators, real upazilas and postcodes; repeatable with `seed` | [`/v1/mock/people?count=3&seed=demo`](https://deshapi.riadul.com/v1/mock/people?count=3&seed=demo) |
| **Banks** | All 61 banks and 11,533 branches from Bangladesh Bank by district and upazila; routing-number lookup and check-digit validation | [`/v1/routing/010130065`](https://deshapi.riadul.com/v1/routing/010130065) |
| **Education** | All 181 UGC universities, 11 statutory education boards (BISE, Madrasah, Technical) with district jurisdictions, and official GPA 5.0 grading scale calculator | [`/v1/education/boards`](https://deshapi.riadul.com/v1/education/boards) |
| **Gold & zakat** | Today's BAJUS gold and silver prices per gram and per vori; zakat with the nisab from those prices | [`/v1/gold/prices`](https://deshapi.riadul.com/v1/gold/prices) |
| **Market prices** | Today's TCB retail prices of essential goods in Dhaka (rice, oil, pulses, spices, fish, meat…) with week, month and year comparisons; government fuel prices | [`/v1/market/prices?category=edible-oil`](https://deshapi.riadul.com/v1/market/prices?category=edible-oil) |
| **MFS** | Mobile Financial Services (bKash, Nagad, Rocket, Upay, TAP) tariffs, USSD codes, cash-out calculator and comparison | [`/v1/mfs/providers`](https://deshapi.riadul.com/v1/mfs/providers) |
| **Prayer & Ramadan** | 5 daily prayer times, Sehri cutoff, and 30-day Ramadan timetable for all 64 districts based on Islamic Foundation Bangladesh standards | [`/v1/prayer/times?district=dhaka`](https://deshapi.riadul.com/v1/prayer/times?district=dhaka) |
| **Metro Rail** | Dhaka Metro Rail (MRT Line-6) 16 active stations, GPS coordinates, timetables, and station-to-station fare calculator with 10% MRT Pass discount | [`/v1/metro/stations`](https://deshapi.riadul.com/v1/metro/stations) |
| **Health** | National government hospitals, specialized institutes (BSMMU, NICVD, DMCH), bed counts, 24/7 casualty hotlines and GPS coordinates | [`/v1/health/hospitals?type=medical_college`](https://deshapi.riadul.com/v1/health/hospitals?type=medical_college) |
| **Weather & Signals** | BMD maritime storm signals (1–11), riverport signals (1–4), DoE Air Quality Index (AQI) categories and 6 traditional Bangla seasons | [`/v1/weather/signals/maritime`](https://deshapi.riadul.com/v1/weather/signals/maritime) |
| **Railway** | Bangladesh Railway (BR) intercity trains (Suborno, Sonar Bangla, Parabat, Silk City), schedules, off-days, coach classes, and major stations | [`/v1/railway/trains?origin=dhaka&destination=chattogram`](https://deshapi.riadul.com/v1/railway/trains?origin=dhaka&destination=chattogram) |
| **Constituencies** | 300 general parliamentary constituencies (Jatiya Sangsad আসন ১–৩০০) with official boundaries, upazila/thana coverage, and district seat distributions | [`/v1/constituencies?district=dhaka`](https://deshapi.riadul.com/v1/constituencies?district=dhaka) |
| **Developer** | API key authentication, tiered rate limits (600 req/min), daily quota tracking and inspection | [`/v1/developer/quota`](https://deshapi.riadul.com/v1/developer/quota) |

Coming next: exchange rates (Bangladesh Bank's site blocks automated reads) and the bank holiday calendar. See the
[roadmap](docs/roadmap.md).

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
| 401 | `unauthorized` | Missing, invalid or inactive API key |
| 404 | `not_found` | Unknown slug, postcode or route; a holiday year or tax year with no official source yet |
| 413 | `payload_too_large` | Body over the limit (Bijoy: 100 KB; bulk phone: 100 numbers) |
| 429 | `rate_limited` | Exceeded per-minute rate limit (see `Retry-After`) |
| 429 | `quota_exceeded` | Exceeded daily request quota (resets at 00:00 UTC; see `Retry-After`) |
| 503 | `upstream_unavailable` | A live source (gold prices from BAJUS, market prices from TCB) could not be read and no list from the last 7 days is saved |

**Limits and developer tiers.** No key is required for public access; anonymous requests receive
120 requests per minute per IP and 10,000 requests per day. Passing an optional API key via `X-API-Key`
or `Authorization: Bearer <key>` unlocks higher tiers:

- **Anonymous**: 120 req/min, 10,000 req/day
- **Developer**: 600 req/min, 50,000 req/day
- **Enterprise / Partner**: 1,800 req/min, 500,000 req/day

Every response carries standard rate limit headers:
- `X-RateLimit-Tier`: `anonymous` | `developer` | `enterprise`
- `X-RateLimit-Limit-Minute`: Per-minute request limit
- `X-RateLimit-Limit-Daily`: Daily request quota
- `X-RateLimit-Remaining-Daily`: Remaining requests today
- `X-RateLimit-Reset`: Seconds remaining until daily reset (00:00 UTC)

Inspect your current quota and tier anytime at [`/v1/developer/quota`](https://deshapi.riadul.com/v1/developer/quota).

**Caching.** Reference data and calculator results are cacheable for a day; gold prices for 10 minutes, market prices
for 30; an income-tax answer that used the default (current) tax year for an hour. Validator responses and unseeded mock
data are never cached. CORS is open, so you can call the API straight from a browser.

**Live data.** Gold prices (BAJUS) and market prices (TCB) are read when you ask, cached by
Cloudflare for 30 minutes. If a source refuses the region a request is served from, the API serves
the last list it read (within 7 days), marked `freshness: "last_known"` with its `fetched_at` time,
and answers 503 only if it has none.

## Privacy

Validators (NID, phone, TIN, BIN, plates, postcodes) only check that a value is **well-formed**.
Nothing is looked up, stored or logged; our logs record only the route pattern, never the value.
For identifiers, use the `POST` endpoints so values stay out of URLs. The finance and zakat
calculators take only numbers, never an identifier. Mock data is made up and never describes a real
person. Details: [PRIVACY.md](PRIVACY.md).

## Where the data comes from

Every dataset lists its source, licence and retrieval date in [`data/meta.json`](data/meta.json)
(readable version: [DATA_SOURCES.md](DATA_SOURCES.md)). Highlights:

| Data | Source |
|---|---|
| Administrative areas, postcodes | Bangladesh Bureau of Statistics geocodes (via UN OCHA) and GeoNames, compiled by [nuhil/bangladesh-geocode](https://github.com/nuhil/bangladesh-geocode) |
| Hotlines | [Bangladesh National Portal](https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89), [DGHS](https://dghs.gov.bd/) |
| Holidays | [Ministry of Public Administration holiday notification for 2027](https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740) |
| Income tax | [Finance Act 2026 (Act No. 96 of 2026)](http://bdlaws.minlaw.gov.bd/act-details-1725.html) and the Income Tax Act 2023 as amended |
| Banks and branches | [Bangladesh Bank branch list](https://www.bb.org.bd/econdata/bs/geo_bank.pdf) (as on 31 August 2026); routing numbers matched from [bddata.org](https://www.bddata.org/all-banks/) |
| Universities | [University Grants Commission](https://www.ugc.gov.bd/universities) |
| Gold and silver prices | [Bangladesh Jewellers Association (BAJUS)](https://www.bajus.org/gold-price), read live |
| Market prices | [Trading Corporation of Bangladesh](https://tcb.gov.bd/pages/daily-rmps) daily retail prices, read live |
| Fuel prices | Energy and Mineral Resources Division monthly notices (via [BPC](https://bpc.gov.bd/)) |
| VAT, gratuity | VAT and Supplementary Duty Act 2012 (s. 15); Bangladesh Labour Act 2006 (s. 2(10)) |
| GI foods | [Department of Patents, Designs and Trademarks](https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf) |
| Bijoy mapping | Derived from [bn-ansi-to-unicode](https://github.com/BinduLogic/bn-ansi-to-unicode) (MIT) |
| Transliteration | [@subhesadek/avro-phonetic](https://github.com/SubheSadek/avro-phonetic) (MPL-2.0) |

If something is wrong, please [report it](https://github.com/rdnasim/desh-api/issues/new/choose)
with a source. Facts that reliable sources disagree on are left out rather than guessed.

## Web Portal & Live Explorer

A companion public web application is deployed at **[`portal.deshapi.riadul.com`](https://portal.deshapi.riadul.com)**:

- **Citizen & Consumer Services Portal:**
  - **Islamic Prayer Times & Ramadan Calendar:** 64-district prayer calculator with 12h/24h/Bangla format toggles.
  - **Live Essential Market & Fuel Prices:** Real-time TCB daily retail commodity rates & official BPC fuel tariffs.
  - **Gold, Silver & Zakat Calculator:** Real-time BAJUS rates and automated Nisab threshold calculation.
  - **Dhaka Metro Rail (MRT Line-6):** Station navigation, single-journey vs MRT Pass (10% discount) fares, travel duration.
  - **Bangla Linguistic Toolkit:** Number/Taka in formal Bengali words, Avro phonetic transliteration, and traditional Bengali calendar (বঙ্গাব্দ).
  - **Finance & Tax 2026:** Multi-tier individual income tax slab breakdown (Finance Act 2026) and bank loan EMI amortizer.
  - **Emergency Healthcare Directory:** Direct-dial DGHS national emergency hotlines (999, 16263, 10655), 24/7 trauma hospitals, and ambulances.
  - **Geographic & Institutional Registry:** Postcode locator, Bangladesh Bank 9-digit BEFTN routing validator, and 300 parliamentary constituencies.
  - **Weather, AQI & Seasons:** Real-time Air Quality Index gauge with health advisories and the 6 traditional Bengali seasons (ষড়ঋতু).
- **Developer API Explorer:**
  - Interactive API console to execute endpoints across all 23 modules.
  - Real-time rate-limit and daily quota monitor directly from response headers (`120 req/min`, `10,000 req/day`).
  - Response headers inspector, formatted JSON preview, and copy-ready cURL command generator.
  - One-click **"Inspect API"** on every portal widget to inspect latency (`ms`), status, and payload.

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
| `tsx scripts/import/ugc.ts <dir>` | Refresh universities from ugc.gov.bd (one request per second) |
| `python3 -I scripts/import/banks.py <pdf> <csv>` | Rebuild banks and branches from Bangladesh Bank's branch list |

**Stack:** TypeScript, [Hono](https://hono.dev) with OpenAPI-generated docs
([Scalar](https://scalar.com)), Cloudflare Workers, Vitest. Reference data is plain JSON in
[`data/`](data/), validated and bundled at build time; there is no database. The live sources
(BAJUS gold prices, TCB market prices) are read at request time and cached at the edge; their last
good copies are kept in Workers KV for regions where they cannot be reached.

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

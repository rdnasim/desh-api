# Desh API — Spec-Driven Roadmap

Source vision: [`docs/vision.md`](./vision.md). Governance: [`.specify/memory/constitution.md`](../.specify/memory/constitution.md).

Each roadmap phase is delivered as one Spec Kit feature (`specs/NNN-*`). A feature is specified,
planned, and broken into tasks only when the previous one is close to shipping, so that later
specs benefit from what was learned.

| Feature | Phase | Modules (vision §4) | Status |
|---|---|---|---|
| [`001-phase1-mvp`](../specs/001-phase1-mvp/) | 1 — MVP (weeks 1–4) | 1 Geo, 2 Bangla Toolkit, 3 Phone, 4 Bijoy ↔ Unicode, 5 Land Units, 6 Format Validators, 7 Hotlines, 8 Proverbs & Fun, docs site | **Live** at https://deshapi.riadul.com (112/114 tasks); awaiting native-speaker review and two unsourced data items |
| [`002-holidays-calendar`](../specs/002-holidays-calendar/) | 2 — Live data | 9 Holidays & Calendar | **Built for 2027 (general calendar)**; 2026 and bank calendar blocked on official documents |
| [`003-finance-calculators`](../specs/003-finance-calculators/) | 2 — Live data | 13 Finance Calculators | **Built** for tax years 2026-27 to 2030-31 (24/24 tasks); every tax rule checked against Act No. 96 of 2026 |
| [`004-mock-data`](../specs/004-mock-data/) | 2 — Live data | 15 Bangla Mock Data Generator | **Built** (people and addresses); Bangla name spellings await native-speaker review |
| [`005-banks`](../specs/005-banks/) | 2 — Live data | 11 Banks & Routing Numbers | **Built**: 61 banks, 11,533 branches (Bangladesh Bank, 31 Aug 2026), 8,080 routing numbers; permission from bddata.org and Bangla bank names pending |
| [`006-education`](../specs/006-education/) | 2 — Live data | 14 Education Data (universities) | **Built**: 181 UGC universities; programmes, education boards and Bangla names are follow-ups |
| [`007-gold-zakat`](../specs/007-gold-zakat/) | 2 — Live data | 12 Gold Price & Zakat | **Built**: live BAJUS prices (no storage); BAJUS refuses some regions, which get the last good list from Workers KV (≤ 7 days old); price history would need a database |
| [`009-market-prices`](../specs/009-market-prices/) | 2 — Live data | 10 Market Prices | **Built**: TCB daily Dhaka retail prices (live, KV fallback), monthly fuel prices; exchange rates blocked (Bangladesh Bank captcha) |
| [`010-mfs`](../specs/010-mfs/) | 2 — Live data | 11 MFS Providers & Calculator | **Built**: bKash, Nagad, Rocket, Upay, TAP tariffs, USSD codes, fee calculation and ranking comparison |
| [`011-api-keys`](../specs/011-api-keys/) | 2 — Live data | API keys & daily quotas | **Built**: Developer key generation, SHA-256 verification, tiered daily limits |
| [`012-prayer-times`](../specs/012-prayer-times/) | 3 — Expansion | 16 Prayer Times & Ramadan Calendar | **Built**: IFB 5 daily prayers for all 64 districts, Sehri & Iftar timetable, Hijri + Bangla dates |
| [`013-dhaka-metro`](../specs/013-dhaka-metro/) | 3 — Expansion | 17 Transport (Dhaka Metro Rail MRT-6) | **Built**: 16 stations, GPS coordinates, timetables, and single-journey vs MRT Pass fare calculator |
| [`014-education-boards`](../specs/014-education-boards/) | 2 / 3 — Expansion | 14 Education Boards & Grading System | **Built**: 11 statutory education boards with district jurisdictions, GPA 5.0 scale & exam calculator |
| [`015-hospitals`](../specs/015-hospitals/) | 3 — Expansion | 18 Health (National Healthcare Directory) | **Built**: 23 tertiary hospitals & specialized institutes across all 8 divisions, bed counts, emergency lines |
| [`016-weather-aqi`](../specs/016-weather-aqi/) | 3 — Expansion | 19 Weather & Disaster Signals | **Built**: BMD maritime (1–11) & riverport (1–4) storm signals, DoE AQI categories & lookup, 6 Bangla seasons |
| [`017-railway`](../specs/017-railway/) | 3 — Expansion | 20 Transport (Bangladesh Railway) | **Built**: Intercity express trains, coach classes, route timetables & major junction stations |
| [`018-constituencies`](../specs/018-constituencies/) | 3 — Expansion | 21 Constituencies (Jatiya Sangsad) | **Built**: 300 general parliamentary seats (১–৩০০), bilingual names, upazila boundaries, and district distributions |
| [`019-airports`](../specs/019-airports/) | 3 — Expansion | 22 Transport (Airports & Aviation) | **Built**: 15 CAAB international, domestic, and STOL facilities, IATA/ICAO codes, runway specs, and coordinates |
| [`020-heritage`](../specs/020-heritage/) | 3 — Expansion | 23 Tourism & Heritage (UNESCO & Archaeology) | **Built**: 35 national archaeological and tourism landmarks, UNESCO World Heritage sites, bilingual briefs, and visitor fees |
| [`021-rivers`](../specs/021-rivers/) | 3 — Expansion | 24 Geography (Major Rivers & Waterways) | **Built**: 30 principal rivers with BWDB hydrological markers, transboundary status, origin/outflow, and river basins |
| [`022-ports`](../specs/022-ports/) | 3 — Expansion | 25 Logistics (Statutory Land Ports & Customs) | **Built**: 24 statutory BLPA land ports, operating status, border checkpoints, counterpart LCS, and commodity profiles |
| [`023-bangla-nlp`](../specs/023-bangla-nlp/) | 3 — Expansion | 26 Bangla NLP Toolkit | **Planned**: 400+ Bangla stopwords, rule-based stemmer, word/sentence tokenizer, Unicode normalizer, and POS dictionary |
| [`024-client-sdks`](../specs/024-client-sdks/) | 3 — Expansion | Official Client SDKs | **Planned**: Zero-dependency typed TypeScript (`@deshapi/client` on npm), Python (`desh-api` on PyPI), PHP/Laravel (`deshapi/sdk`), and Go |
| [`025-web-portal`](../specs/025-web-portal/) | 4 — Ecosystem | Consumer Portal & Playground | **Built & Live** at https://portal.deshapi.riadul.com: interactive test consoles, live API inspector, query generator |
| [`026-developer-portal`](../specs/026-developer-portal/) | 4 — Ecosystem | Developer Dashboard & Analytics | **Planned**: Self-service API key portal, usage telemetry, rate limit tracking, webhook alerts, and audit logs |
| [`027-desh-cli`](../specs/027-desh-cli/) | 4 — Ecosystem | Terminal CLI (`desh`) | **Planned**: Fast cross-platform CLI for quick administrative queries, offline land/tax calculators, and NID validation |
| [`028-form-widgets`](../specs/028-form-widgets/) | 4 — Ecosystem | Embeddable Web Components | **Planned**: Zero-dependency custom elements (`<desh-address-selector>`, `<desh-phone-input>`, `<desh-nid-input>`) |
| [`029-browser-extension`](../specs/029-browser-extension/) | 4 — Ecosystem | Browser Extension (Chrome/Firefox) | **Planned**: Toolbar popup for real-time gold rates, TCB prices, prayer timetable countdown, and postal lookup |
| [`030-cms-plugins`](../specs/030-cms-plugins/) | 4 — Ecosystem | CMS & E-Commerce Plugins | **Planned**: WordPress / WooCommerce Bangladesh shipping & address validator plugin, Laravel package |
| [`031-sheets-integration`](../specs/031-sheets-integration/) | 4 — Ecosystem | Google Sheets & Excel Add-ons | **Planned**: Custom spreadsheet formulas (`=DESH_TAKA_WORDS()`, `=DESH_EXCHANGE()`, `=DESH_GOLD()`, `=DESH_UPAZILA()`) |
| [`032-bots-integrations`](../specs/032-bots-integrations/) | 4 — Ecosystem | Community Bots & Webhooks | **Planned**: Telegram & Discord bots for daily prayer, Metro service status, TCB commodities, and BMD storm alerts |

---

## Phase 3 — Expansion (Detailed Breakdown)

Phase 3 extends Desh API from core reference data and live daily feeds into comprehensive transport networks, national geographic features, cultural heritage, and natural language processing.

### 019 — Airports & Aviation Directory (`specs/019-airports`)
- **Authority**: Civil Aviation Authority of Bangladesh (CAAB — `caab.gov.bd`) AIP and international ICAO/IATA registries.
- **Scope**: Canonical directory of all 15 operational, developmental, and STOL aviation facilities.
- **Endpoints**:
  - `GET /v1/airports`: Query with filters (`type`, `status`, `division`, `district`, `q`).
  - `GET /v1/airports/types`: Facility classifications (`international`, `domestic`, `short_takeoff`, `military_airstrip`).
  - `GET /v1/airports/:code`: Direct lookup by 3-letter IATA code (`DAC`, `CGP`), 4-letter ICAO code (`VGHS`, `VGEG`), or slug.
- **Status**: **Built and verified** (all contract & unit tests passing).

### 020 — UNESCO World Heritage & Archaeological Tourism (`specs/020-heritage`)
- **Authority**: Department of Archaeology (Ministry of Cultural Affairs — `archaeology.gov.bd`), Bangladesh Parjatan Corporation, and UNESCO World Heritage Centre.
- **Scope**: 35 curated archaeological monuments, UNESCO World Heritage sites, and eco-tourism landmarks across all 8 divisions.
- **Endpoints**:
  - `GET /v1/heritage`: Filter by category (`archaeological`, `historical`, `natural`, `cultural`, `monument`), type (`unesco_world_heritage`, `national_heritage`), division, or district.
  - `GET /v1/heritage/unesco`: Dedicated query for UNESCO World Heritage sites (Paharpur, Bagerhat Mosque City, Sundarbans).
  - `GET /v1/heritage/:slug`: Site details including bilingual historical briefs, highlights, visiting hours, and citizen vs. foreign entry fees.
- **Status**: **Built and verified** (all contract & unit tests passing).

### 021 — Major Rivers & Waterways (`specs/021-rivers`)
- **Authority**: Bangladesh Water Development Board (BWDB — `bwdb.gov.bd`) and Banglapedia.
- **Scope**: Hydrological dataset of 30 principal rivers forming the Bengal Delta river system.
- **Endpoints**:
  - `GET /v1/rivers`: Filter by traversed division, district, transboundary status, or keyword search.
  - `GET /v1/rivers/transboundary`: Cross-border international rivers originating outside Bangladesh.
  - `GET /v1/rivers/:slug`: River details with origins, outflow confluence, lengths in km, and tributaries/distributaries.
- **Status**: **Built and verified** (all contract & unit tests passing).

### 022 — Statutory Land Ports & Customs Logistics (`specs/022-ports`)
- **Authority**: Bangladesh Land Port Authority (BLPA — `bsbk.gov.bd`), Ministry of Shipping, and National Board of Revenue.
- **Scope**: All 24 statutory BLPA land ports and customs stations along terrestrial borders with India and Myanmar.
- **Endpoints**:
  - `GET /v1/ports`: Filter by status (`operational`, `under_development`, `inactive`), operating model (`blpa_operated`, `private_bot`, `railway_joint`), division, or district.
  - `GET /v1/ports/types`: Supported operator models and statuses.
  - `GET /v1/ports/:identifier`: Lookup by 3-letter port code (`BEN`, `BUR`, `AKH`) or slug.
- **Status**: **Built and verified** (all contract & unit tests passing).

### 023 — Bangla NLP Toolkit (`specs/023-bangla-nlp`)
- **Objective**: Deterministic, low-latency Bengali linguistic processing at the edge without heavy GPU or Python runtime overhead.
- **Capabilities**:
  - **Stopwords**: 400+ curated high-frequency Bengali functional words (`GET /v1/nlp/stopwords`, `POST /v1/nlp/stopwords/remove`).
  - **Unicode Normalizer**: NFC normalization, zero-width joiner (ZWJ `\u200D`) and non-joiner (ZWNJ `\u200C`) cleanup, hasant/nukta standardization (`POST /v1/nlp/normalize`).
  - **Tokenization**: Sentence splitter respecting Bengali sentence terminators (`।`, `?`, `!`) and punctuation; word tokenizer respecting conjunctive ligatures (`POST /v1/nlp/tokenize`).
  - **Stemming**: Rule-based affix-stripping stemmer for common nominal cases, plurals (`-গুলো`, `-দেরকে`), and verb conjugations (`POST /v1/nlp/stem`).
- **Status**: **Planned (ready for spec & implementation)**.

### 024 — Official Client SDKs (`specs/024-client-sdks`)
- **Objective**: Strongly-typed, ergonomic client libraries across major software ecosystems:
  - **TypeScript / Node.js** (`@deshapi/client` on npm): Zero runtime dependencies, dual ESM/CJS, automatic rate-limit tracking and retries.
  - **Python** (`desh-api` on PyPI): Sync (`requests`) and async (`httpx`) clients with Pydantic response models.
  - **PHP / Laravel** (`deshapi/sdk` on Packagist): PSR-18 compatible client with first-party Laravel facade and validation rules.
  - **Go** (`github.com/desh-api/desh-go`): Idiomatic standard-library HTTP client.
- **Status**: **Planned**.

---

## Phase 4 — Ecosystem (Detailed Breakdown)

Phase 4 delivers consumer-facing tools, developer dashboards, drop-in UI widgets, browser extensions, and platform plugins that bring Desh API into production workflows and daily developer usage.

### 025 — Consumer Web Portal & Playground (`specs/025-web-portal`)
- **Live URL**: https://portal.deshapi.riadul.com (source: `web/`).
- **Capabilities**:
  - Full interactive visual suite covering all API modules (Administrative explorer, live prayer countdown, BAJUS gold converter, TCB daily prices, Metro fare calculator, Railway search, Land units, Tax calculators).
  - Developer Playground & Inspector: Dynamic query parameter builder, live URL generator, syntax-highlighted response viewer, and copyable curl / JS / Python snippets.
- **Status**: **Built and live in production**.

### 026 — Developer Dashboard & API Keys (`specs/026-developer-portal`)
- **Objective**: Self-service portal for developers and enterprise consumers to manage authentication and usage.
- **Capabilities**:
  - GitHub and email OAuth authentication.
  - Developer API key issuance, key rotation, and secret revocation.
  - Real-time telemetry: daily request graphs, error rate (4xx/5xx) breakdowns, and latency percentiles.
  - Quota notifications via email or webhook when reaching 80% and 95% thresholds.
- **Status**: **Planned**.

### 027 — Terminal CLI (`desh`) (`specs/027-desh-cli`)
- **Distribution**: `npm i -g @deshapi/cli`, Homebrew tap (`brew install desh-api/tap/desh`), and standalone curl binaries.
- **Capabilities**:
  - Offline utilities: Instant calculations (tax, land converter, number-to-words) and validations (NID, phone, vehicle plate) without network calls.
  - Live data lookups: Prayer countdown, daily gold rates, fuel prices, and metro/train timetables.
  - Scripting: JSON output flag (`--json`) for piping into `jq`, bash, or PowerShell automation scripts.
- **Status**: **Planned**.

### 028 — Embeddable Form Web Components (`specs/028-form-widgets`)
- **Distribution**: CDN script tag (`<script src="https://cdn.jsdelivr.net/npm/@deshapi/widgets"></script>`) and npm package `@deshapi/widgets`.
- **Components**:
  - `<desh-address-selector>`: Cascading Division → District → Upazila → Union dropdowns with bilingual labels and postcode autofill.
  - `<desh-phone-input>`: Bangladeshi phone field with operator badge detection (Grameenphone, Banglalink, Robi, Airtel, Teletalk) and live validation.
  - `<desh-nid-input>`: National ID input enforcing 10-, 13-, and 17-digit validation rules.
- **Status**: **Planned**.

### 029 — Cross-Browser Extension (`specs/029-browser-extension`)
- **Target Browsers**: Google Chrome, Mozilla Firefox, Microsoft Edge (Manifest V3).
- **Features**:
  - Instant toolbar badge with current prayer waqt and time remaining.
  - One-click popup for live BAJUS gold rates, TCB daily essentials, and foreign exchange rates.
  - Quick postal code search and number-to-words / Bijoy converter.
- **Status**: **Planned**.

### 030 — CMS & Framework Plugins (`specs/030-cms-plugins`)
- **WordPress & WooCommerce**: Official plugin replacing the default flat state/city text input with cascading Bangladesh administrative dropdowns, reducing courier delivery failures.
- **Laravel Package (`deshapi/laravel`)**: First-party ServiceProvider, `Desh` facade, and custom validation rules (`Rule::banglaPhone()`, `Rule::banglaNid()`, `Rule::vehiclePlate()`).
- **Status**: **Planned**.

### 031 — Google Sheets & Excel Add-ons (`specs/031-sheets-integration`)
- **Objective**: Enable accountants, auditors, and data analysts to use Desh API directly inside spreadsheets.
- **Custom Formulas**:
  - `=DESH_TAKA_WORDS(amount)`: Convert numbers to formal Bangla words with paisa for checks and vouchers.
  - `=DESH_INCOME_TAX(income, year, category)`: Calculate individual income tax under Finance Acts.
  - `=DESH_LAND_CONVERT(val, from, to)`: Instant conversion between shotangsho, katha, bigha, and sqft.
  - `=DESH_GOLD_PRICE(karat)`: Fetch today's live BAJUS gold price.
- **Status**: **Planned**.

### 032 — Community Chatbots & Real-Time Alerts (`specs/032-bots-integrations`)
- **Platforms**: Telegram Bot and Discord Integration.
- **Features**:
  - Daily morning broadcasts for prayer times and Ramadan Sehri/Iftar schedules.
  - Slash commands for train schedules (`/train 701`), metro fares (`/metro motijheel uttara`), and gold rates.
  - Critical automated alert webhooks when BMD issues Maritime Warning Signal 4+ or Special Cyclone Bulletins.
- **Status**: **Planned**.

## Open follow-ups

Items waiting on a maintainer decision or on a document only a person can obtain:

| Feature | Follow-up | Needs |
|---|---|---|
| 002 | 2026 holidays and the bank-holiday calendar | MoPA amendments and Bangladesh Bank circulars (download in a browser) |
| 005 | Permission to reuse bddata.org's routing numbers, or Bangladesh Bank's own routing list | Email to bddata.org, or a browser download (captcha) |
| 005 | Bangla names for the 61 banks | An official source |
| 006 | Bangla university names, approved programmes, education boards | UGC data for names; follow-up features |
| 004 | Native-speaker review of mock name spellings | A reviewer |
| 009 | Exchange rates from Bangladesh Bank | A browser download or another official source (bb.org.bd blocks automated reads) |
| 009 | Fuel prices each month | Add the month's Energy Division notice to `data/market/fuel.json` |

Phase 2 and 3 are large; when their turn comes, split them into several features (e.g.
`002-holidays-calendar`, `003-finance-calculators`) if any single spec exceeds ~8 user stories.

## How to start the next feature

```text
/speckit-specify  Phase 2 of docs/vision.md: holidays & calendar, market prices, ...
/speckit-clarify  (optional, recommended for tax/zakat/prices)
/speckit-plan
/speckit-tasks
/speckit-analyze  (optional consistency check)
/speckit-implement
```

## Pre-work outside Spec Kit (vision §15)

- [ ] Finalize project name; check GitHub org, domain, and npm/PyPI names
- [ ] Survey existing BD open-data repos (geo, postcodes, Bijoy converters) and record findings in
      `specs/001-phase1-mvp/research.md`
- [ ] Create a Cloudflare account and reserve the Workers subdomain

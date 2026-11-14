# 🇧🇩 Desh API — Open Public API for Bangladesh

> A free, open-source, community-driven API that gives developers clean, reliable Bangladesh-specific data and Bangla language tools.

*(Project name is a placeholder; check GitHub, domain, and npm availability before finalizing.)*

This is the product vision that the Spec Kit artifacts are derived from. Governance lives in
`.specify/memory/constitution.md`; phase-by-phase delivery lives in `docs/roadmap.md`.

---

## 1. Problem

Bangladeshi developers keep rebuilding the same things from scratch:

- Address dropdowns (division → district → upazila → union) copied from outdated spreadsheets
- Converting numbers to Bangla words for invoices and cheques
- Converting old Bijoy-encoded text to Unicode
- Validating BD phone, NID, and vehicle number formats with fragile regex
- Checking government holidays from PDF gazettes
- Copying commodity, gold, and exchange-rate prices by hand
- Converting land units (katha, bigha, shotangsho) manually

Most of this data is public but **not machine-readable**, and global platforms rarely handle Bangla or local formats properly.

## 2. Vision

One trusted, well-documented API where any Bangladeshi developer, student, startup, or researcher can get accurate local reference data, Bangla language utilities, calculators, and historical public data. Free, open source, and maintained by the community.

## 3. Target Users

| User | Use case |
|---|---|
| E-commerce & delivery startups | Address forms, postcodes, phone validation |
| HR / payroll / ERP software | Holidays, Bangla dates, taka-in-words, salary & tax calculators |
| Fintech & accounting apps | Number-to-words, bank routing numbers, exchange rates |
| Real estate & land apps | Land unit conversion, area data |
| Publishers & news sites | Bijoy → Unicode, Bangla text tools |
| Students & beginners | Learning APIs with familiar data |
| Journalists & researchers | Price trends, air quality, flood data |
| Health & emergency apps | Hospital directory, hotlines, blood groups |
| Islamic / lifestyle apps | Prayer times, Ramadan schedules, zakat |

## 4. Module Overview

| # | Module | Category | Difficulty | Phase |
|---|---|---|---|---|
| 1 | Geo Data | Reference data | Easy | 1 |
| 2 | Bangla Toolkit | Language | Easy | 1 |
| 3 | Phone Validator | Validation | Easy | 1 |
| 4 | Bijoy ↔ Unicode Converter | Language | Easy | 1 |
| 5 | Land Unit Converter | Calculator | Easy | 1 |
| 6 | Format Validators (NID, vehicle, TIN, BIN) | Validation | Easy | 1 |
| 7 | Emergency & Government Hotlines | Reference data | Easy | 1 |
| 8 | Proverbs, Riddles & Fun | Fun / learning | Easy | 1 |
| 9 | Holidays & Calendar | Reference data | Medium | 2 |
| 10 | Market Prices | Live data | Medium | 2 |
| 11 | Banks & Routing Numbers | Reference data | Medium | 2 |
| 12 | Gold Price & Zakat | Live data + calculator | Medium | 2 |
| 13 | Finance Calculators | Calculator | Medium | 2 |
| 14 | Education Data | Reference data | Medium | 2 |
| 15 | Bangla Mock Data Generator | Developer tool | Easy | 2 |
| 16 | Prayer Times | Calculated data | Medium | 3 |
| 17 | Transport | Community data | Hard | 3 |
| 18 | Health Directory | Community data | Hard | 3 |
| 19 | Weather, Air Quality & Flood | Live data | Hard | 3 |
| 20 | Parliament Constituencies | Reference data | Medium | 3 |
| 21 | Tourism Places | Community data | Medium | 3 |
| 22 | Bangla NLP Resources | Language | Medium | 3 |

## 5. Module Details

### Phase 1

**1 — Geo Data**
```
GET /v1/divisions
GET /v1/divisions/{id}/districts
GET /v1/districts?division=dhaka
GET /v1/upazilas?district=cumilla
GET /v1/unions?upazila={id}
GET /v1/postcodes/{code}
GET /v1/search?q=mirpur
GET /v1/nearest?lat=23.81&lon=90.41
```
```json
{ "id": "dhaka", "name_en": "Dhaka", "name_bn": "ঢাকা", "division": "dhaka", "lat": 23.8103, "lon": 90.4125 }
```

**2 — Bangla Toolkit**
```
GET /v1/bangla/num-to-words?n=1250
GET /v1/bangla/taka-in-words?amount=1250.50
GET /v1/bangla/digits?text=2026&to=bn
GET /v1/bangla/format-number?n=1250000
GET /v1/bangla/transliterate?text=ami bhalo achi
GET /v1/bangla/date?date=2026-11-13
GET /v1/bangla/ordinal?n=3
GET /v1/bangla/slug?text=আমার সোনার বাংলা
```
`{ "input": 1250, "words": "এক হাজার দুইশত পঞ্চাশ" }` · `{ "input": 1250000, "formatted": "১২,৫০,০০০" }`
*(Verify Bangla calendar conversion against the revised official calendar before release.)*

**3 — Phone Validator**: `GET /v1/phone/{number}`, `POST /v1/phone/bulk`.
Prefixes: 017/013 → Grameenphone, 018 → Robi, 016 → Airtel, 019/014 → Banglalink, 015 → Teletalk.
With number portability, the prefix only shows the *original* operator — document this clearly.

**4 — Bijoy ↔ Unicode**: `POST /v1/convert/bijoy-to-unicode`, `POST /v1/convert/unicode-to-bijoy`.
`{ "input": "Avgvi †mvbvi evsjv", "output": "আমার সোনার বাংলা" }`

**5 — Land Unit Converter**: `GET /v1/land/convert?value=5&from=katha&to=sqft`, `GET /v1/land/units`.
`{ "input": "5 katha", "sqft": 3600, "decimal": 8.26, "sqm": 334.45 }`
1 decimal (shotangsho) = 435.6 sq ft, 1 katha = 720 sq ft, 1 bigha = 20 katha, 1 acre = 100 decimal.
Some units vary by region — support a `region` parameter and document the differences.

**6 — Format Validators** (format checks only; never look up, store, or expose personal data):
`/v1/validate/nid/{number}` (10/13/17 digits), `/v1/validate/vehicle?plate=…`, `/v1/validate/tin/{number}`,
`/v1/validate/bin/{number}`, `/v1/validate/postcode/{code}`.

**7 — Emergency & Government Hotlines**: `GET /v1/hotlines`, `GET /v1/hotlines?category=emergency`
(999 National Emergency Service, 333 National Information Service, 109 Violence Against Women &
Children Helpline). Verify every number against official sources and review regularly.

**8 — Proverbs, Riddles & Fun**: `/v1/fun/proverb/random`, `/v1/fun/riddle/random`,
`/v1/fun/quiz?topic=liberation-war`, `/v1/fun/food/random`, `/v1/fun/today-in-history`.
Traditional / public-domain content only.

### Phase 2
9 Holidays & Calendar (tentative flag for moon-dependent holidays) · 10 Market Prices (TCB, exchange
rates, fuel) · 11 Banks, Routing Numbers & MFS · 12 Gold Price (22K/21K/18K/traditional, per vori &
gram; 1 vori = 11.664 g) & Zakat · 13 Finance Calculators (income tax per fiscal year, VAT, salary,
EMI, DPS, gratuity — cite source + disclaimer) · 14 Education Data · 15 Bangla Mock Data Generator.

### Phase 3
16 Prayer Times & Ramadan · 17 Transport (metro, bus, train, launch) · 18 Health Directory (last
verified date on every entry) · 19 Weather, Air Quality, Flood, Cyclone signals, Seasons ·
20 Parliament Constituencies (neutral) · 21 Tourism Places · 22 Bangla NLP (stopwords, stemming,
tokenizer, sentence split, dictionary).

## 6. Data Sources

| Data | Source |
|---|---|
| Administrative areas | Bangladesh Bureau of Statistics (BBS), existing open datasets (credit authors) |
| Postcodes | Bangladesh Post Office |
| Holidays | Government holiday gazette |
| Commodity prices | Trading Corporation of Bangladesh (TCB) |
| Exchange rates & routing numbers | Bangladesh Bank |
| Gold prices | BAJUS |
| Tax slabs | NBR / Finance Act |
| Education | Education boards, UGC |
| Weather / flood / air | BMD, FFWC, Department of Environment |
| Prayer times | Standard calculation methods, cross-checked with Islamic Foundation |
| Constituencies | Bangladesh Election Commission |
| Transport, health, tourism | Community contributions + official sources |

Every response includes `source` and `last_updated` fields.

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Hono (TypeScript) |
| Hosting | Cloudflare Workers |
| Static data | JSON files in GitHub repo |
| Dynamic data | Cloudflare D1 (Phase 2+) |
| Scrapers | GitHub Actions (cron) |
| Docs | OpenAPI + Scalar |
| Caching | Cloudflare cache headers |
| SDKs | npm, PyPI, Composer |

## 8. API Design Principles

Versioned URLs · bilingual (`name_en`/`name_bn`) · consistent envelope
`{ "success": true, "data": {}, "meta": { "source": "...", "last_updated": "..." } }` · clear errors ·
slugs over IDs · CORS · rate limits · privacy first · bulk `POST` endpoints.

## 9–15. Extra products, roadmap, community, sustainability, risks, metrics, next steps

See `docs/roadmap.md` for delivery. Community: MIT code + CC BY 4.0 data, contribution guide, good
first issues, data-correction form, data sprints, Hacktoberfest, university CSE clubs, showcase.
Sustainability: free tiers, sponsors/bKash donations, optional paid high-volume tier, local sponsors.
Key risks: outdated data, scraper breakage, abuse, privacy, wrong financial/emergency info,
political sensitivity, maintainer burnout, duplicating existing projects.
Success metrics: stars/contributors, monthly requests & users, showcase apps, data issues fixed,
SDK downloads.

---

description: "Task list for Phase 1 MVP — Bangladesh Reference Data & Bangla Tools"
---

# Tasks: Phase 1 MVP — Bangladesh Reference Data & Bangla Tools

**Input**: Design documents from `/specs/001-phase1-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED. Constitution principle V mandates test-first for every converter, calculator,
and validator, contract tests for every endpoint, and integrity tests for every dataset. Within
each story, write tests first and confirm they fail before implementing.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and
shipped independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US9, see spec.md)
- Paths are relative to the repository root (single project, see plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and the data-source survey that unblocks all data work

- [X] T001 Create `package.json` (pnpm, `"type": "module"`, Node ≥ 22) with deps `hono`, `@hono/zod-openapi`, `zod`, `@scalar/hono-api-reference` and dev deps `wrangler`, `typescript`, `vitest`, `@cloudflare/vitest-pool-workers`, `@cloudflare/workers-types`, `@biomejs/biome`, `tsx`; scripts `dev`, `deploy`, `typecheck`, `lint`, `format`, `test`, `data:build`, `data:check`, `size:check`, `smoke` in package.json
- [X] T002 [P] Create strict TypeScript config (ES2022, `moduleResolution: bundler`, Workers types, path alias `@/*` → `src/*`) in tsconfig.json (no `@/*` alias: relative imports avoid extra resolver config in Wrangler and Vitest)
- [X] T003 [P] Create Worker config in wrangler.jsonc: `name: "desh-api"`, `main: "src/index.ts"`, pinned `compatibility_date`, `observability.enabled: true` with invocation logs disabled (research R19), and Rate Limiting binding `RATE_LIMITER` with `limit: 120`, `period: 60` (R17)
- [X] T004 [P] Configure Biome lint + format (2-space, single quotes, sorted imports; JSON formatting for `data/**`) in biome.json
- [X] T005 [P] Configure Vitest with `@cloudflare/vitest-pool-workers` pointing at wrangler.jsonc in vitest.config.ts (uses `@cloudflare/vitest-plugin`, the renamed successor of the pool-workers package)
- [X] T006 [P] Create .gitignore (`node_modules`, `.wrangler`, `src/generated`, `.dev.vars`, `coverage`)
- [X] T007 [P] Add LICENSE (MIT, code) and LICENSE-DATA (CC BY 4.0, data) at repo root
- [X] T008 [P] Create CI workflow running `pnpm install --frozen-lockfile`, `data:build`, `typecheck`, `lint`, `data:check`, `test`, `size:check` on push and PR in .github/workflows/ci.yml
- [ ] T009 *(geo, postcodes, Avro Phonetic, Bijoy map done, see R4/R5/R10/R11; BRTA class list / metro areas (R13) and R14 regional land variants still open)* Survey existing open BD datasets and libraries (geo, postcodes, Bijoy map, Avro Phonetic) and record chosen source, licence, and credit for each VERIFY item (R4, R5, R10, R11, R13, R14) in specs/001-phase1-mvp/research.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared libraries, envelope/error contract, data build pipeline, app shell

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (write first, must fail)

- [X] T010 [P] Unit tests for Bangla⇄Latin digit conversion and `parseNumber` (Bangla digits, mixed digits, surrounding whitespace, comma separators, decimals, rejects non-numeric) in tests/unit/lib/digits.test.ts
- [X] T011 [P] Unit tests for text normalisation (NFC, `য়`/`ড়`/`ঢ়` composition, Latin lowercase + diacritic strip) in tests/unit/lib/normalize.test.ts
- [X] T012 [P] Unit tests for seeded PRNG determinism (same seed → same sequence; string seeds hashed) in tests/unit/lib/random.test.ts
- [X] T013 [P] Create contract test helpers (`call(path, init)`, `expectOk(res, schema)`, `expectError(res, status, code)`, OpenAPI response validator) in tests/contract/helpers.ts
- [X] T014 Contract tests for app shell: `GET /health`, `GET /` index, unknown route → 404 `not_found` envelope, wrong method → 405, CORS headers on GET/OPTIONS, 429 `rate_limited` with `Retry-After` when binding denies, `/openapi.json` is valid OpenAPI 3.1 in tests/contract/app.test.ts

### Implementation

- [X] T015 [P] Implement digit conversion and `parseNumber` in src/lib/digits.ts
- [X] T016 [P] Implement normalisation helpers in src/lib/normalize.ts
- [X] T017 [P] Implement mulberry32 PRNG with string-seed hashing and `pick`/`sample` helpers in src/lib/random.ts
- [X] T018 [P] Define `DatasetMeta` Zod schema (`dataset`, `source`, `source_url?`, `licence`, `retrieved`, `last_updated` ISO date, `credits[]`) in src/lib/dataset-meta.ts and create data/meta.json (empty array)
- [X] T019 Implement response envelope `ok(c, data, meta)` and `metaFor(datasetKeys, extra?)` (`source`, `last_updated`, `version: "v1"`, optional `disclaimer`, `pagination`) in src/lib/envelope.ts
- [X] T020 Implement `ApiError`, error code table (`invalid_parameter` 400, `not_found` 404, `method_not_allowed` 405, `payload_too_large` 413, `rate_limited` 429, `internal_error` 500), Zod validation hook → 400 with `details`, `onError`/`notFound` handlers in src/lib/errors.ts
- [X] T021 [P] Implement cache helpers (`cachePublic(c, etag)` → `public, max-age=86400, s-maxage=604800` + ETag/304, `noStore(c)`) in src/lib/cache.ts (ETag/304 handled by Hono `etag()` middleware; default `no-store` via `defaultNoStore`)
- [X] T022 [P] Implement privacy-safe logger middleware logging only method, route template (`c.req.routePath`), status, duration — never URL, query, or body in src/lib/logger.ts
- [X] T023 [P] Implement rate-limit middleware using `env.RATE_LIMITER` keyed by `CF-Connecting-IP` in src/lib/rate-limit.ts
- [X] T024 Implement data build pipeline: dataset registry `{ key, file, schema, transform? }`, validates each `data/**/*.json` with its Zod schema, enforces sorted records + pretty formatting, validates data/meta.json covers every dataset, emits `src/generated/<key>.ts` and `src/generated/etags.ts` (content hashes); `--check` mode for CI in scripts/build-data.ts (ETags come from the `etag()` middleware, so no `etags.ts` is emitted)
- [X] T025 Implement app shell: `OpenAPIHono` with CORS, logger, rate limit, error handlers, `/v1` sub-router, `GET /` module index, `GET /health` (git SHA via `env.VERSION`), `GET /openapi.json`, `GET /docs` (Scalar) in src/app.ts and Worker entry in src/index.ts
- [X] T026 [P] Implement compressed bundle size guard (`wrangler deploy --dry-run --outdir`, gzip, fail > 2.5 MB) in scripts/check-bundle-size.ts

**Checkpoint**: `pnpm test` passes for Phase 2; `pnpm dev` serves `/health`, `/docs`, and a 404 envelope

---

## Phase 3: User Story 1 - Address hierarchy for forms (Priority: P1) 🎯 MVP

**Goal**: Divisions → districts → upazilas → unions, postcodes, bilingual search, nearest lookup

**Independent Test**: Build a 4-level cascading dropdown from the API; `GET /v1/postcodes/1205` resolves to Dhaka (quickstart scenarios 1–5)

### Data for User Story 1 (depends on T009)

- [X] T027 [US1] Import 8 divisions and 64 districts with `slug`, `name_en`, `name_bn`, `aliases` (Comilla, Chittagong, Barisal, Jessore, Bogra…), `lat`, `lon` into data/geo/divisions.json and data/geo/districts.json; add `geo.divisions`/`geo.districts` entries to data/meta.json
- [X] T028 [US1] Import all upazilas (with `district` FK and `type: "upazila" | "thana"`) into data/geo/upazilas.json; record exact total in research.md R4; add meta entry
- [X] T029 [US1] Import all unions (with `upazila` FK; slug unique within upazila) into data/geo/unions.json; record exact total in research.md R4; add meta entry
- [X] T030 [P] [US1] Import Post Office list (one record per post office: `postcode` `^\d{4}$`, `name_en`, `name_bn`, `thana_en`, `thana_bn`, `upazila?`, `district`) into data/geo/postcodes.json; add meta entry

### Tests for User Story 1 (write first, must fail)

- [X] T031 [P] [US1] Dataset integrity tests: exactly 8 divisions and 64 districts, upazila/union totals equal R4 values, unique slugs, every FK resolves, no orphans, both names present and NFC, coordinates within lat [20.5, 26.7] / lon [88.0, 92.7] in tests/data/geo.test.ts
- [X] T032 [P] [US1] Unit tests for search ranking (exact > prefix > substring, level tie-break), alias match `comilla` → `cumilla`, Bangla query `মিরপুর`, `limit` cap 20 in tests/unit/geo/search.test.ts
- [X] T033 [P] [US1] Unit tests for haversine nearest (23.81, 90.41 → `dhaka`), upazila fallback to district, outside-bounds rejection in tests/unit/geo/nearest.test.ts
- [X] T034 [P] [US1] Contract tests for every endpoint in specs/001-phase1-mvp/contracts/geo.md including 404 unknown slug/postcode, 400 bad postcode format, pagination `meta.pagination`, cache headers + ETag in tests/contract/geo.test.ts

### Implementation for User Story 1

- [X] T035 [US1] Define Zod schemas for Division, District, Upazila, Union, PostOffice, SearchHit (slug `^[a-z0-9]+(-[a-z0-9]+)*$`, names ≤ 100 chars, lat ∈ [20.5, 26.7], lon ∈ [88.0, 92.7]) with OpenAPI examples in src/modules/geo/schemas.ts
- [X] T036 [US1] Register geo datasets in scripts/build-data.ts and generate parent→children maps, postcode→post-offices map, and normalised search index (research R6)
- [X] T037 [US1] Implement geo service (list/get by parent, postcode lookup, search, nearest per R7) in src/modules/geo/service.ts
- [X] T038 [US1] Implement geo routes per contracts/geo.md with OpenAPI summaries/examples and mount under `/v1` in src/modules/geo/routes.ts and src/app.ts

**Checkpoint**: US1 independently deployable — this is the MVP cut

---

## Phase 4: User Story 2 - Bangla numbers, words, and dates (Priority: P1)

**Goal**: Number/taka in words, digits, lakh-crore formatting, Bangla calendar date, ordinals, slugs, transliteration

**Independent Test**: Golden lists for words, formatting, and calendar dates all pass (quickstart scenarios 6–7)

### Tests for User Story 2 (write first, must fail)

- [X] T039 [P] [US2] Create golden fixture for number words: every value 0–100, plus 101, 110, 999, 1000, 1250 (`এক হাজার দুইশত পঞ্চাশ`), 100000, 1250000, 10000000, 1000000000, 999999999999999, and decimals in tests/golden/bangla/num-to-words.json (118 cases)
- [X] T040 [P] [US2] Unit tests for num-to-words and taka-in-words (0 → `শূন্য`, `1250.50` → `… টাকা পঞ্চাশ পয়সা`, paisa omitted when 0, negative/over-max/3-decimal rejection) in tests/unit/bangla/num-to-words.test.ts
- [X] T041 [P] [US2] Unit tests for format-number (`1250000` → `১২,৫০,০০০`, Latin output, decimals) and digit conversion endpoint logic in tests/unit/bangla/format-number.test.ts
- [X] T042 [P] [US2] Create calendar golden fixture (14 Apr → ১ বৈশাখ; 21 Feb → ৮ ফাল্গুন; 16 Dec 2026 → ১ পৌষ ১৪৩৩; 26 Mar → ১২ চৈত্র; 13/14 Apr year boundary; Falgun 30 in leap years e.g. 2028; 1971-01-01 and 2100-12-31 bounds) in tests/golden/bangla/calendar.json and tests in tests/unit/bangla/calendar.test.ts (16 hand-checked cases)
- [X] T043 [P] [US2] Unit tests for ordinals 1–100 (`3` → `তৃতীয়`) and Bangla slugs (`আমার সোনার বাংলা` → URL-safe romanised slug) in tests/unit/bangla/ordinal-slug.test.ts
- [X] T044 [P] [US2] Create transliteration golden fixture (`ami bhalo achi` → `আমি ভালো আছি`, ≥ 50 reviewed phrases) in tests/golden/bangla/transliterate.json and tests in tests/unit/bangla/transliterate.test.ts (64 reviewed phrases)
- [X] T045 [P] [US2] Contract tests for every endpoint in specs/001-phase1-mvp/contracts/bangla.md (incl. Bangla-digit inputs and 400 cases) in tests/contract/bangla.test.ts

### Implementation for User Story 2

- [X] T046 [P] [US2] Implement num-to-words (0–99 lookup table, শত/হাজার/লক্ষ/কোটি, recursion above কোটি, max 999,999,999,999,999, ≤ 2 decimals) in src/modules/bangla/num-to-words.ts
- [X] T047 [US2] Implement taka-in-words on top of num-to-words in src/modules/bangla/taka.ts
- [X] T048 [P] [US2] Implement South Asian number grouping with Bangla/Latin digits in src/modules/bangla/format-number.ts
- [X] T049 [P] [US2] Implement revised Bangla calendar conversion (R9: months 1–6 = 31 days, 7–10 = 30, Falgun 29/30, Chaitra 30; year offset 593/594; seasons; weekday names) in src/modules/bangla/calendar.ts
- [X] T050 [P] [US2] Implement Bangla ordinals 1–100 in src/modules/bangla/ordinal.ts
- [X] T051 [P] [US2] Implement Bangla → romanised URL slug in src/modules/bangla/slug.ts
- [X] T052 [P] [US2] Vendor Avro Phonetic rules with original licence header (per R10 finding) into src/vendor/avro-phonetic/ and wrap in src/modules/bangla/transliterate.ts (used `@subhesadek/avro-phonetic` as an unmodified MPL-2.0 dependency instead of vendoring; see R10)
- [X] T053 [US2] Define request/response Zod schemas with examples (text ≤ 1000 chars, date range 1971-01-01…2100-12-31, `to` ∈ `bn|en`) in src/modules/bangla/schemas.ts
- [X] T054 [US2] Implement Bangla toolkit routes per contracts/bangla.md (cacheable, default date = today in Asia/Dhaka) and mount in src/modules/bangla/routes.ts and src/app.ts

**Checkpoint**: US1 + US2 both work independently

---

## Phase 5: User Story 3 - Phone number validation (Priority: P2)

**Goal**: Validate, normalise, and identify original operator for BD mobile numbers, single and bulk

**Independent Test**: Golden valid/invalid list returns expected results (quickstart scenario 8)

### Tests for User Story 3 (write first, must fail)

- [X] T055 [P] [US3] Create golden cases (all 7 prefixes; `+880`, `880`, `0088`, no prefix; Bangla digits; spaces/dashes; wrong length; `012` prefix; landline; letters) in tests/golden/phone/cases.json and tests in tests/unit/phone/service.test.ts
- [X] T056 [P] [US3] Contract tests per contracts/phone.md: GET, POST validate, bulk preserves order, bulk > 100 → 413, `Cache-Control: no-store`, `portability_notice` always present in tests/contract/phone.test.ts

### Implementation for User Story 3

- [X] T057 [P] [US3] Create prefix data (013/017 Grameenphone, 014/019 Banglalink, 015 Teletalk, 016 Airtel, 018 Robi; bilingual names) in data/phone/prefixes.json with meta entry
- [X] T058 [US3] Define OperatorPrefix (`prefix` `^01[3-9]$`, unique) and PhoneResult schemas in src/modules/phone/schemas.ts and register dataset in scripts/build-data.ts
- [X] T059 [US3] Implement normalise/validate service with reason codes `invalid_chars`, `invalid_length`, `invalid_prefix` (R12) in src/modules/phone/service.ts
- [X] T060 [US3] Implement phone routes (no-store) and mount in src/modules/phone/routes.ts and src/app.ts

**Checkpoint**: US3 independently functional

---

## Phase 6: User Story 4 - Bijoy ↔ Unicode conversion (Priority: P2)

**Goal**: Accurate SutonnyMJ Bijoy ↔ Unicode conversion up to 100 KB

**Independent Test**: Golden corpus converts exactly in both directions (quickstart scenario 9)

### Tests for User Story 4 (write first, must fail)

- [X] T061 [P] [US4] Create ≥ 200 reviewed golden line pairs covering conjuncts, reph, pre-base vowel signs, ya-/ra-phala, hasanta, ৎ, ঁ, Bangla digits, punctuation in tests/golden/bijoy/bijoy.txt and tests/golden/bijoy/unicode.txt (one file, tests/golden/bijoy/pairs.json: 255 cross-checked + 6 hand-checked ৌ pairs + 2 external samples)
- [X] T062 [P] [US4] Unit tests: golden both directions, `Avgvi †mvbvi evsjv` ⇄ `আমার সোনার বাংলা`, Unicode→Bijoy→Unicode round trip, 100 KB input converts within CPU budget in tests/unit/convert/bijoy.test.ts
- [X] T063 [P] [US4] Contract tests per contracts/convert.md: JSON and `text/plain` bodies, empty → 400, > 100 KB → 413, input not echoed in tests/contract/convert.test.ts

### Implementation for User Story 4

- [X] T064 [US4] Create mapping table (fields `bijoy` 1–3 chars unique, `unicode` NFC, `kind` enum, `preferred_reverse?`) from the R11 source in data/convert/bijoy-map.json with meta entry (188 entries from BinduLogic bn-ansi-to-unicode, MIT; see R11)
- [X] T065 [US4] Define BijoyMap schema and register dataset (emit longest-first forward map and derived reverse map) in src/modules/convert/schemas.ts and scripts/build-data.ts
- [X] T066 [US4] Implement Bijoy → Unicode (longest match, pre-base sign + reph reordering, ো/ৌ composition, NFC) in src/modules/convert/bijoy-to-unicode.ts
- [X] T067 [US4] Implement Unicode → Bijoy (inverse map + reverse reordering) in src/modules/convert/unicode-to-bijoy.ts
- [X] T068 [US4] Implement convert routes with 100 KB body limit and mount in src/modules/convert/routes.ts and src/app.ts

**Checkpoint**: US4 independently functional

---

## Phase 7: User Story 5 - Land unit conversion (Priority: P2)

**Goal**: Convert between local and standard land units with region awareness

**Independent Test**: `5 katha` → 3600 sqft / 8.26 decimal / 334.45 sqm (quickstart scenario 10)

### Tests for User Story 5 (write first, must fail)

- [X] T069 [P] [US5] Unit tests: 5 katha case, 1 bigha = 20 katha, 1 acre = 100 decimal, alias resolution (`shotangsho` → `decimal`), region fallback to `standard`, unknown unit / value ≤ 0 errors, 2-decimal rounding in tests/unit/land/service.test.ts
- [X] T070 [P] [US5] Contract tests per contracts/land.md incl. `meta.disclaimer` and `region` echoed in tests/contract/land.test.ts

### Implementation for User Story 5

- [X] T071 [US5] Create unit data with standard values from R14 (acre 43560, decimal 435.6, ojutangsho 4.356, katha 720, bigha 14400, chotak 45, sqm 10.7639104, hectare 107639.104 sq ft) and only sourced regional variants in data/land/units.json with meta entry (10 standard units incl. sq yd/gaj; no regional variants until sourced, see R14)
- [X] T072 [US5] Define LandUnit schema (`sqft` > 0, `variants[]` each with `region`, `sqft`, `source`) and register dataset in src/modules/land/schemas.ts and scripts/build-data.ts
- [X] T073 [US5] Implement conversion service in src/modules/land/service.ts
- [X] T074 [US5] Implement land routes with disclaimer meta and mount in src/modules/land/routes.ts and src/app.ts

**Checkpoint**: US5 independently functional

---

## Phase 8: User Story 9 - Discoverable docs & try-it playground (Priority: P2)

**Goal**: Complete, accurate, try-it docs for every Phase 1 endpoint

**Independent Test**: Every registered route appears in `/openapi.json` with a valid example; `/docs` renders (quickstart scenario 14)

- [X] T075 [P] [US9] Contract test: every registered `/v1` route appears in `/openapi.json`, has summary, tag, and ≥ 1 example, and every example validates against its response schema in tests/contract/openapi.test.ts (examples are also validated against their schemas with @cfworker/json-schema)
- [X] T076 [US9] Configure OpenAPI document (title, description, licence, servers, one tag per module with bilingual description) and Scalar UI options in src/docs.ts and wire into src/app.ts
- [X] T077 [US9] Write README.md (what it is, base URL, 5-line examples per module, links to /docs, contributing, licences)

**Checkpoint**: Public launch candidate (US1–US5 + docs)

---

## Phase 9: User Story 6 - Format validators (Priority: P3)

**Goal**: Format-only validation for NID, vehicle plate, TIN, BIN, postcode with zero data retention

**Independent Test**: Reviewed valid/invalid examples per type return expected results (quickstart scenario 11)

### Tests for User Story 6 (write first, must fail)

- [X] T078 [P] [US6] Unit tests for NID (10/13/17 digits, Bangla digits, 17-digit birth year 1900…current year, `invalid_length`/`invalid_chars`/`invalid_birth_year`) in tests/unit/validate/nid.test.ts
- [X] T079 [P] [US6] Unit tests for vehicle plates (`ঢাকা মেট্রো-গ ১১-২২৩৩` parsed; Latin transliteration; unknown area/class; malformed series/number) in tests/unit/validate/vehicle.test.ts
- [X] T080 [P] [US6] Unit tests for TIN (12 digits), BIN (9 digits; 13-digit branch form flagged `legacy_or_branch`), postcode format + existence in tests/unit/validate/tin-bin-postcode.test.ts
- [X] T081 [P] [US6] Contract tests per contracts/validate.md (GET and POST variants, `no-store`, unknown type → 400) plus a log-capture test asserting the input value never appears in logger output in tests/contract/validate.test.ts

### Implementation for User Story 6

- [X] T082 [P] [US6] Create vehicle area list (`slug`, `name_en`, `name_bn`, `metro_allowed`) and BRTA class letters (`letter_bn`, `letter_en`, descriptions) per R13 in data/validate/vehicle-areas.json and data/validate/vehicle-classes.json with meta entries (only `vehicle-area-aliases.json`: districts come from geo data; no class table until BRTA's list is sourced, see R13)
- [X] T083 [US6] Define ValidationResult and data schemas and register datasets in src/modules/validate/schemas.ts and scripts/build-data.ts
- [X] T084 [P] [US6] Implement NID validator in src/modules/validate/nid.ts
- [X] T085 [P] [US6] Implement vehicle plate parser/validator in src/modules/validate/vehicle.ts
- [X] T086 [P] [US6] Implement TIN and BIN validators in src/modules/validate/tin-bin.ts
- [X] T087 [US6] Implement postcode validator using the generated postcode map from US1 (T036) in src/modules/validate/postcode.ts
- [X] T088 [US6] Implement validate routes (GET + `POST /v1/validate/{type}`, no-store) and mount in src/modules/validate/routes.ts and src/app.ts

**Checkpoint**: US6 independently functional (postcode check requires US1 data)

---

## Phase 10: User Story 7 - Emergency & government hotlines (Priority: P3)

**Goal**: Verified, bilingual national hotline list filterable by category

**Independent Test**: Every entry has number, bilingual name, category, source, last_verified (quickstart scenario 12)

### Tests for User Story 7 (write first, must fail)

- [X] T089 [P] [US7] Data tests: required fields, unique `number` `^\d{3,6}$`, category in enum, `999` present, warn (not fail) when `last_verified` > 180 days old in tests/data/hotlines.test.ts
- [X] T090 [P] [US7] Contract tests per contracts/hotlines.md (list, filter, unknown category 400 listing valid ones, get by number, 404) in tests/contract/hotlines.test.ts

### Implementation for User Story 7

- [X] T091 [US7] Curate national hotlines, each verified against its official source with `source` URL and `last_verified` date; second maintainer review required in data/hotlines/hotlines.json with meta entry — **20 numbers checked against bangladesh.gov.bd and dghs.gov.bd on 2026-11-14 (R15); second maintainer review still pending before launch**
- [X] T092 [US7] Define Hotline schema (category enum `emergency|health|women-children|information|legal-aid|disaster|utility|other`) and register dataset in src/modules/hotlines/schemas.ts and scripts/build-data.ts
- [X] T093 [US7] Implement hotline routes and mount in src/modules/hotlines/routes.ts and src/app.ts

**Checkpoint**: US7 independently functional

---

## Phase 11: User Story 8 - Proverbs, riddles & fun content (Priority: P4)

**Goal**: Random bilingual cultural content with reproducible seeds

**Independent Test**: Each endpoint returns valid content; same `seed` → same item (quickstart scenario 13)

### Tests for User Story 8 (write first, must fail)

- [ ] T094 [P] [US8] Data tests: minimum counts (≥ 100 proverbs, ≥ 50 riddles, ≥ 50 quiz questions over ≥ 3 topics, ≥ 64 dishes, history for ≥ 100 days), unique ids, `source` on every record, valid `answer_index`, valid month/day in tests/data/fun.test.ts
- [ ] T095 [P] [US8] Unit tests: seeded picks deterministic, quiz `count` without duplicates, today-in-history returns `[]` for empty days in tests/unit/fun/service.test.ts
- [ ] T096 [P] [US8] Contract tests per contracts/fun.md (no-store without seed, cacheable with seed, 400 unknown topic/region) in tests/contract/fun.test.ts

### Implementation for User Story 8

- [ ] T097 [P] [US8] Curate traditional proverbs with meanings in data/fun/proverbs.json
- [ ] T098 [P] [US8] Curate traditional riddles with answers in data/fun/riddles.json
- [ ] T099 [P] [US8] Write factual quiz questions (topics `liberation-war`, `geography`, `culture`, `history`; 2–5 options) in data/fun/quiz.json
- [ ] T100 [P] [US8] Curate traditional dishes by region in data/fun/dishes.json
- [ ] T101 [P] [US8] Curate Bangladesh history events by month/day with sources in data/fun/history.json
- [ ] T102 [US8] Define fun schemas and register datasets (add meta entries) in src/modules/fun/schemas.ts and scripts/build-data.ts
- [ ] T103 [US8] Implement fun service using src/lib/random.ts in src/modules/fun/service.ts
- [ ] T104 [US8] Implement fun routes and mount in src/modules/fun/routes.ts and src/app.ts

**Checkpoint**: All Phase 1 user stories functional

---

## Phase 12: Polish & Cross-Cutting Concerns

- [ ] T105 [P] Write contribution guide (data-correction flow, source requirement, golden-file review, good-first-issue labels, Spec Kit workflow) in CONTRIBUTING.md
- [ ] T106 [P] Write privacy policy (format-only validation, no storage, logging policy, POST recommendation) in PRIVACY.md
- [ ] T107 [P] Generate data attribution page from data/meta.json in DATA_SOURCES.md (extend scripts/build-data.ts with `--docs`)
- [ ] T108 [P] Add issue templates (data correction, bug, endpoint request) and PR template with "source of this change" field in .github/ISSUE_TEMPLATE/ and .github/pull_request_template.md
- [ ] T109 [P] Require a second reviewer for safety-critical data in .github/CODEOWNERS (`data/hotlines/`)
- [ ] T110 Implement smoke script running quickstart scenarios 1–15 against `BASE` with `--bench` p95 reporting in scripts/smoke.ts
- [ ] T111 Add deploy workflow (on push to `main`, after CI: `wrangler deploy` with `CLOUDFLARE_API_TOKEN` secret, then `pnpm smoke`) in .github/workflows/deploy.yml
- [ ] T112 Native-speaker review sign-off for all golden fixtures, recorded in tests/golden/REVIEW.md
- [ ] T113 Run privacy log audit via `wrangler tail` (quickstart "Privacy check") and record result for SC-007 in specs/001-phase1-mvp/quickstart.md
- [ ] T114 Run full quickstart.md validation against production, record p95 from Dhaka (SC-004), and update status in docs/roadmap.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T009 (survey) blocks every data-import task (T027–T030, T052, T064, T071, T082).
- **Foundational (Phase 2)**: depends on Setup; **blocks all user stories**.
- **User stories (Phases 3–11)**: each depends only on Foundational, except:
  - US6 postcode check (T087) depends on US1 postcode data (T030, T036).
  - US9 docs (Phase 8) is most valuable after ≥ 1 story's routes exist; T075 grows automatically as stories land.
- **Polish (Phase 12)**: after the stories chosen for launch.

### User Story Dependencies

```text
Setup ─► Foundational ─┬─► US1 Geo (P1) ──────────────┐
                       ├─► US2 Bangla (P1)             │
                       ├─► US3 Phone (P2)              ├─► US6 Validators (P3, postcode needs US1)
                       ├─► US4 Bijoy (P2)              │
                       ├─► US5 Land (P2)               │
                       ├─► US9 Docs (P2) ◄─ routes ────┘
                       ├─► US7 Hotlines (P3)
                       └─► US8 Fun (P4)
```

### Within Each User Story

- Data tasks (where the story has data) and tests first; tests MUST fail before implementation.
- Schemas → build-data registration → service → routes.
- Story complete and its checkpoint passes before moving to the next priority (when working solo).

### Parallel Opportunities

- Setup: T002–T008 in parallel.
- Foundational: T010–T013 in parallel; T015–T018 and T021–T023, T026 in parallel.
- After Foundational, US1–US5 and US7–US8 can be built by different contributors simultaneously
  (each story touches only its own `src/modules/<module>/`, `data/<module>/`, and `tests/**/<module>`).
  Shared touch points are `scripts/build-data.ts` registration and the mount line in `src/app.ts` —
  keep those edits to one line each to avoid merge conflicts.
- Content curation (T097–T101) is ideal for non-developer contributors and "good first issue".

---

## Parallel Example: User Story 1

```bash
# After T027–T029 land, run all US1 tests-first tasks together:
Task: "Dataset integrity tests in tests/data/geo.test.ts"            # T031
Task: "Search ranking unit tests in tests/unit/geo/search.test.ts"   # T032
Task: "Nearest lookup unit tests in tests/unit/geo/nearest.test.ts"  # T033
Task: "Geo contract tests in tests/contract/geo.test.ts"             # T034
```

## Parallel Example: User Story 2

```bash
# Independent converters, different files:
Task: "num-to-words in src/modules/bangla/num-to-words.ts"   # T046
Task: "format-number in src/modules/bangla/format-number.ts" # T048
Task: "calendar in src/modules/bangla/calendar.ts"           # T049
Task: "ordinal in src/modules/bangla/ordinal.ts"             # T050
Task: "slug in src/modules/bangla/slug.ts"                   # T051
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1 Geo
3. **STOP and VALIDATE**: quickstart scenarios 1–5 + `/docs`
4. Deploy a preview and share with 2–3 friendly developers

### Incremental Delivery (matches vision "Weeks 1–4")

| Week | Deliver |
|---|---|
| 1 | Setup, Foundational, US1 Geo → deploy |
| 2 | US2 Bangla toolkit, US3 Phone → deploy |
| 3 | US4 Bijoy, US5 Land, US9 Docs polish → **public launch** |
| 4 | US6 Validators, US7 Hotlines, US8 Fun, Polish → announce & invite contributors |

### Parallel Team Strategy

With several contributors after Foundational: A → US1 (+ later US6), B → US2, C → US3 + US5,
D → US4, non-developers → US7 hotline verification and US8 content curation.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks.
- [Story] label maps each task to its user story for traceability.
- Commit after each task or logical group; every data PR states its source.
- Any VERIFY item in research.md that cannot be resolved blocks only its own story, not the release.
- Total: 114 tasks — Setup 9, Foundational 17, US1 12, US2 16, US3 6, US4 8, US5 6, US9 3, US6 11, US7 5, US8 11, Polish 10.

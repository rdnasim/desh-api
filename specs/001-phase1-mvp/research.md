# Research: Phase 1 MVP

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-13

Each entry: Decision → Rationale → Alternatives considered. Items marked **VERIFY** must be
confirmed (and the finding recorded here) during the Setup/data tasks before the related story ships.

---

## R1. Language & framework

- **Decision**: TypeScript (strict) on Hono 4, using `@hono/zod-openapi` for routes.
- **Rationale**: Hono is first-class on Cloudflare Workers, tiny, and fast. `zod-openapi` makes the
  same Zod schema validate requests, type handlers, and generate OpenAPI (constitution IV: docs
  cannot drift). TypeScript lets the same schemas validate data files in CI (constitution VI).
- **Alternatives**: FastAPI (Python) — great docs story but Python Workers are less mature and the
  JS ecosystem (npm SDK, widgets) is the Phase 4 target anyway. Express — not edge-native.

## R2. Hosting & runtime

- **Decision**: Cloudflare Workers (free plan), configured with `wrangler.jsonc`, `compatibility_date`
  pinned, `nodejs_compat` off unless a dependency requires it.
- **Rationale**: Free tier (100k req/day) meets SC-006; global edge with a Dhaka-adjacent PoP for
  SC-004; static JSON bundles straight into the Worker.
- **Alternatives**: Vercel Functions / Deno Deploy — viable, but the vision already standardises on
  Cloudflare and Phase 2 plans D1 + Cron.

## R3. Serving static data

- **Decision**: Raw data lives in `data/**/*.json` (pretty-printed, sorted). A build script
  (`scripts/build-data.ts`) validates it and emits compact, pre-indexed modules into
  `src/generated/` that are bundled into the Worker. No database in Phase 1.
- **Rationale**: Zero infra cost, zero cold-start I/O, PR-friendly source files. Estimated bundle
  for geo + postcodes + content ≈ 1–1.5 MB uncompressed, well under the free-plan 3 MB compressed
  Worker limit. Pre-building the search index avoids startup CPU cost.
- **Alternatives**: D1 — needed for time series in Phase 2, overkill for read-only reference data.
  KV — adds latency and eventual consistency for no benefit at this size.
- **Guardrail**: CI fails if the compressed bundle exceeds 2.5 MB; if hit, move unions to KV.

## R4. Geo data source — ✅ resolved 2026-11-13

- **Decision**: Seed from an existing open dataset (candidates: `nuhil/bangladesh-geocode`,
  BBS Geocode 2011/2021 publications) and reconcile names/spellings with BBS. Use current official
  English spellings for slugs (Cumilla, Chattogram, Barishal, Jashore, Bogura) and keep historical
  spellings in `aliases`.
- **Rationale**: Constitution (Data standards) requires surveying and crediting before duplicating.
- **Finding**: Using `nuhil/bangladesh-geocode` @ `c4b950b` (MIT compilation, updated 2026-11-12),
  which reconciles BBS geocodes (UN OCHA COD-AB, CC BY-IGO 3.0) with its original Bangla-name
  collection. Licences are attribution-only and compatible with CC BY 4.0; credits are in
  `data/meta.json`. **Totals (SC-003 assertions)**: 8 divisions, 64 districts, 495 upazilas,
  4,540 unions, 12 city corporations. All divisions/districts/upazilas have coordinates; 150 unions
  do not. Imported with `scripts/import/geocode.ts`.
- **Slug rules**: Latin slug of the official English name. 10 upazila names repeat across districts
  (e.g. Kaliganj), so those get the district appended (`kaliganj-gazipur`). Union slugs are unique
  within their upazila; 4 upstream same-name pairs get a `-2` suffix.

## R5. Postcodes — ✅ resolved 2026-11-13

- **Decision**: Import the Bangladesh Post Office postcode list (via an open dataset if licence
  permits, else transcribe from the official list) into `data/geo/postcodes.json`, one record per
  post office, linked to district and upazila/thana slugs.
- **Rationale**: Postcodes may be shared by several post offices, so the lookup returns an array.
- **Finding**: Same upstream repo (GeoNames postal codes, CC BY 4.0, compiled from the Post Office
  list): 1,349 post offices, one per postcode, each linked to a district and to an upazila or a
  city corporation. **Gap**: no Bangla post-office or thana names exist in any open source found,
  so `name_bn` is `null` for post offices until contributed (see plan Complexity Tracking).

## R6. Search

- **Decision**: Pre-built index (one row per record) of normalised text (lowercase Latin with
  diacritics stripped; Bangla NFC, which makes precomposed and decomposed `য়/ড়/ঢ়` equal) across
  names + aliases, covering divisions, districts, upazilas, unions, and post offices. Ranking: exact >
  prefix > substring; tie-break by level (division > district > upazila > union). Max 20 results.
- **Alternatives**: Fuzzy (Levenshtein) search — deferred; aliases cover the common misspellings.

## R7. Nearest lookup

- **Decision**: Haversine distance over district centroids (64 points) and upazila centroids where
  present. Reject coordinates outside the Bangladesh bounding box (lat 20.5–26.7, lon 88.0–92.7)
  with 400.
- **Alternatives**: Point-in-polygon with boundaries — more accurate but needs GeoJSON boundaries
  (licence + size); revisit in Phase 3.

## R8. Bangla number words

- **Decision**: Hand-written converter with a lookup table for 0–99 (Bangla has irregular words for
  every number up to 99) and the units শত (100), হাজার (10³), লক্ষ (10⁵), কোটি (10⁷). Above 99
  crore, recurse ("এক হাজার কোটি"). Use "দুইশত" style (as in the vision example); expose
  `style=short` later if requested. Max 999,999,999,999,999 (FR-020) to stay within safe integer.
- **Taka**: `… টাকা … পয়সা`; omit paisa when zero; "শূন্য টাকা" for 0.
- **Rationale**: Small, well-understood logic; libraries on npm are inconsistent on 0–99 spellings.
- **To verify**: golden list of 0–99 reviewed by a native speaker against Bangla Academy spelling.

## R9. Bangla calendar

- **Decision**: Implement the 2019 Bangla Academy revised calendar used officially in Bangladesh:
  year starts 14 April; Boishakh–Ashwin 31 days; Kartik–Magh 30 days; Falgun 29 days (30 when the
  Gregorian year containing that Falgun is a leap year); Chaitra 30 days. Bangla year =
  Gregorian year − 593 on/after 14 April, else − 594. Seasons = consecutive 2-month pairs
  (গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত).
- **To verify**: cross-check 10 known dates (e.g. 21 Feb = ৮ ফাল্গুন, 16 Dec = ১ পৌষ,
  26 Mar = ১২ চৈত্র) against the official calendar before release (vision note).
  16 cases (incl. month boundaries and a leap-year Falgun) are in
  `tests/golden/bangla/calendar.json`, each worked out by hand from the rules above; a check
  against a printed government calendar is still part of T112.
- **Alternatives**: Indian (West Bengal) calendar — different rules; out of scope, may be added as
  `system=indian` later.

## R10. Phonetic transliteration — ✅ resolved 2026-11-14

- **Decision**: Use the Avro Phonetic rule set (the de-facto standard BD users type). Prefer an
  existing maintained JS implementation if its licence is MIT/MPL-compatible; vendor it under
  `src/vendor/` with its licence header kept intact (MPL-2.0 file-level copyleft is compatible with
  an MIT project as long as the file stays MPL).
- **Alternatives**: Write our own rules — large effort; defer unless licensing blocks reuse.
- **Finding**: Using `@subhesadek/avro-phonetic@2.1.4` (MPL-2.0, TypeScript, zero dependencies,
  no install scripts, no network/eval/DOM use; reviewed before adding) as an unmodified npm
  dependency instead of vendoring. MPL-2.0 obligations apply only to its own files. It follows
  Avro's case-sensitive rules (`dh` → ধ, `Dh` → ঢ) and ships a ~670-word dictionary.
  **Known upstream issue**: য-ফলা is emitted as `্য়` instead of `্য` (`sondhya` → সন্ধ্য়া);
  such cases are left out of the golden file and should be reported upstream.

## R11. Bijoy ↔ Unicode — ✅ resolved 2026-11-14

- **Decision**: Table-driven converter: (1) longest-match character map (SutonnyMJ code points →
  Unicode), (2) reordering pass for pre-base vowel signs (ি, ে, ৈ) and reph (র্), (3) `ো/ৌ` composition,
  (4) NFC normalise. Reverse direction applies the inverse map plus reverse reordering. Mapping table
  stored as data (`data/convert/bijoy-map.json`) so the community can fix it.
- **Source**: Evaluate existing open converters for a reusable map (credit + licence check). If none
  is compatible, build the map from the SutonnyMJ glyph chart.
- **Golden corpus**: ≥ 200 reviewed lines covering conjuncts, reph, ya/ra-phala, hasanta, ৎ, ঁ,
  Bangla digits, and punctuation (`tests/golden/bijoy/*.txt`).
- **Finding**: The mapping (188 entries, `data/convert/bijoy-map.json`) is derived from
  `bn-ansi-to-unicode` (BinduLogic, MIT, explicit copyright file), with a `kind` per entry and a
  `preferred_reverse` flag where several Bijoy glyphs map to the same Unicode. The converter code is
  our own. `bijoy-unicode-converter` (npm, labelled MIT) was rejected: its code matches S. M.
  Mahbub Murshed's Bijoy converter, which I believe is GPL, so the MIT label may not hold. A package
  published the day before the survey was skipped as a supply-chain risk.
- **Golden method**: 261 Bangla lines were encoded by our encoder and decoded by BinduLogic's
  independent decoder; 255 agree exactly with the source text and contain no Bangla Unicode on the
  Bijoy side. The other 6 all contain ৌ (typed `‡` + consonant + `Š`), which that decoder cannot
  produce; they are kept separately as hand-checked. Two Bijoy samples from outside sources (vision
  doc, upstream README) decode correctly. The "no Bangla in Bijoy output" guard was added after it
  caught a real bug (ো left un-split) that both decoders had passed through silently.
- **Limit**: 100 KB per request (FR-041); conversion is O(n) and well within the 10 ms CPU budget
  for that size — benchmark in tests.

## R12. Phone numbering

- **Decision**: Strip spaces, dashes, parentheses; convert Bangla digits; accept prefixes `+880`,
  `880`, `0088`, or none. Valid local form = `01[3-9]` + 8 digits (11 digits). Prefix map in
  `data/phone/prefixes.json`: 013/017 Grameenphone, 014/019 Banglalink, 015 Teletalk,
  016 Airtel (Robi), 018 Robi. Reason codes: `invalid_length`, `invalid_prefix`, `invalid_chars`.
- **Note**: Always include the portability notice (constitution, Data standards).

## R13. Format validators — **VERIFY formats**

| Identifier | Decision | To verify |
|---|---|---|
| NID | 10 (smart card), 13 (legacy), or 17 digits (legacy with birth-year prefix). 17-digit: first 4 digits a year in 1900..current year. | Whether 13-digit legacy numbers carry structure worth checking. |
| Vehicle plate | `<area>[ মেট্রো]-<class letter> <2-digit series>-<4-digit number>`, Bangla or Latin digits; area from district/city list; class letter from a configurable list in `data/validate/vehicle-classes.json`. | Full BRTA class-letter list and city list. |
| TIN | 12 digits (e-TIN). | — |
| BIN | 9 digits (VAT Online, since 2019); accept 13-digit `9-4` branch form flagged `legacy_or_branch`. | Confirm current NBR format. |
| Postcode | 4 digits + existence check against postcode dataset. | — |

Validators never echo the input back in logs; responses echo only the normalised value to the caller.

## R14. Land units — ✅ standard units shipped 2026-11-14; regional values still open

- **Decision**: Canonical base unit = square foot. Unambiguous values: 1 acre = 43,560 sq ft;
  1 decimal (শতাংশ) = 435.6 sq ft; 1 ojutangsho = 4.356 sq ft; 1 katha = 720 sq ft (standard);
  1 bigha = 20 katha = 14,400 sq ft; 1 chotak = 45 sq ft; 1 sqm = 10.7639104 sq ft;
  1 hectare = 107,639.104 sq ft. Region-variable units (kani, gonda, kora, kranti, and non-standard
  katha/bigha) are stored per region with a cited source; the response always states the region used.
  Rounding: 2 decimal places in responses, full precision internally.
- **To verify**: collect regional values (Sylhet, Chattogram, Barishal, Khulna) with sources from
  the Land Ministry / DLRS and field references before publishing those variants. Unverified
  variants are omitted rather than guessed (constitution I).
- **Shipped**: 10 standard units (sq ft, sq m, sq yd/gaj, decimal, ojutangsho, chotak, katha,
  bigha, acre, hectare) with Bangla names and aliases; `variants` is empty and only `standard` is a
  valid region until sourced values are contributed. Kani, gonda, kora and kranti are not included.

## R15. Hotlines

- **Decision**: Curate national numbers only (999, 333, 109, 1098, 16263, 106, 16430, etc.), each with
  official source URL and `last_verified`. Two-reviewer rule for edits (constitution, Workflow).
- **To verify**: every number dialled/confirmed against the official government source at data entry.

## R16. Fun content

- **Decision**: Curate small seed sets (≥ 100 proverbs, ≥ 50 riddles, ≥ 50 quiz questions across
  ≥ 3 topics, ≥ 64 dishes ≈ one per district, history events for ≥ 100 calendar days), all
  traditional/public domain or factual; `source` field per record. Randomness via a seeded PRNG
  (mulberry32) so `seed` gives reproducible output.

## R17. Rate limiting

- **Decision**: Cloudflare Workers Rate Limiting binding, keyed by `CF-Connecting-IP`, 120 requests
  per 60 s; 429 with `Retry-After: 60`. Daily quotas and API keys are deferred to Phase 2.
- **Rationale**: The binding only supports short periods (10 s / 60 s); a daily counter would need
  KV/Durable Objects, which is unjustified for an anonymous MVP (constitution VII).

## R18. Caching

- **Decision**: Reference data and deterministic conversions: `Cache-Control: public,
  max-age=86400, s-maxage=604800` + `ETag` (Hono `etag()` middleware hashes the response body and
  answers `If-None-Match` with 304). Responses default to `no-store` unless a route opts in. Validators:
  `Cache-Control: no-store` (privacy). Random content: `no-store` unless `seed` is given.

## R19. Privacy & logging

- **Decision**: Disable Workers invocation logs that capture full URLs; emit one structured log per
  request with route *template* (e.g. `/v1/validate/nid/:number`), status, and duration only. Offer
  `POST` variants of validators (body is never logged) and recommend them in docs; keep `GET`
  variants from the vision for convenience. Document in `PRIVACY.md`.

## R20. Docs

- **Decision**: Serve `/openapi.json` generated by `@hono/zod-openapi` and a Scalar API reference at
  `/docs` (via `@scalar/hono-api-reference`). Every route declares at least one example.
- **Alternatives**: Swagger UI — heavier and less pleasant; Redoc — no try-it.

## R21. Testing & tooling

- **Decision**: Vitest 4.1 with `@cloudflare/vitest-plugin` (the renamed, maintained successor of
  `@cloudflare/vitest-pool-workers`; runs tests inside workerd for realistic behaviour). Layers: `tests/unit` (pure logic), `tests/contract` (HTTP + schema +
  envelope via the generated OpenAPI), `tests/data` (dataset integrity), `tests/golden` (fixtures).
  Biome for lint + format. pnpm. Node ≥ 22 for tooling. GitHub Actions CI.

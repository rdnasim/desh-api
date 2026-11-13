# Implementation Plan: Phase 1 MVP — Bangladesh Reference Data & Bangla Tools

**Branch**: `001-phase1-mvp` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-phase1-mvp/spec.md`

## Summary

Ship a free, anonymous, bilingual `/v1` REST API on Cloudflare Workers covering eight Phase 1
modules (geo, Bangla toolkit, phone, Bijoy ↔ Unicode, land units, format validators, hotlines, fun)
plus generated OpenAPI docs with a try-it UI. All reference data is versioned JSON in the repo,
validated and pre-indexed at build time, and bundled into the Worker — no database. Every
converter/validator is test-first with golden fixtures; every endpoint is contract-tested against
the same Zod schemas that generate the docs. See [research.md](./research.md) for decisions.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), ES2022 target; Node.js ≥ 22 for tooling

**Primary Dependencies**: Hono 4, `@hono/zod-openapi`, Zod, `@scalar/hono-api-reference`;
vendored Avro Phonetic rules (R10); dev: Wrangler, Vitest 4.1 + `@cloudflare/vitest-plugin`,
Biome, tsx

**Storage**: None at runtime. Source data in `data/**/*.json`, compiled to `src/generated/*.ts`
at build time and bundled into the Worker (R3)

**Testing**: Vitest in workerd — unit, contract, data-integrity, and golden-file suites (R21)

**Target Platform**: Cloudflare Workers (free plan), Workers Rate Limiting binding

**Project Type**: Web service (public REST API) — single project

**Performance Goals**: p95 < 200 ms from Dhaka (SC-004); < 10 ms CPU per request for all endpoints
including 100 KB Bijoy conversion

**Constraints**: $0/month up to 100k req/day (SC-006); compressed Worker bundle < 2.5 MB (CI guard);
no personal identifiers logged (SC-007); 120 req/min/IP burst limit

**Scale/Scope**: 8 modules, ~40 endpoints, ~6k geo records, ~1.5k post offices, small curated
content sets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | `DatasetMeta` per dataset drives `meta.source`/`meta.last_updated`; hotlines carry `last_verified`; land variants omitted unless sourced (R14); VERIFY items gate their stories | ✅ |
| II. Privacy by Design | Validators format-only; invocation logs off, route-template logging only, `no-store`, POST variants (R19); `PRIVACY.md` | ✅ |
| III. Bilingual | `name_en`/`name_bn` required by Zod schemas; Bangla digit parsing in shared `parseNumber` | ⚠️ post-office `name_bn` is null (justified below) |
| IV. Versioned contract | `/v1` router; shared envelope/error helpers; OpenAPI generated from route schemas; CORS middleware; bulk POST for phone (≤ 100) | ✅ |
| V. Test-first & golden files | Tests precede implementation in every story in tasks.md; golden fixtures for converters; data-integrity suite | ✅ |
| VI. Data as files | `data/**/*.json` sorted/pretty; `pnpm data:check` in CI | ✅ |
| VII. Edge-first simplicity | No DB/KV; only the free Rate Limiting binding | ✅ |
| VIII. Neutral content | Fun content traditional/public domain with `source` per record | ✅ |

**Post-design re-check (after US1 data import, 2026-11-13)**: ⚠️ one justified deviation: post offices
have no Bangla names in any open source (Principle III). See Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 decisions (R1–R21)
├── data-model.md        # Entities, fields, validation rules
├── quickstart.md        # Run & validate end-to-end
├── contracts/           # HTTP contracts per module
│   ├── common.md
│   ├── geo.md
│   ├── bangla.md
│   ├── phone.md
│   ├── convert.md
│   ├── land.md
│   ├── validate.md
│   ├── hotlines.md
│   └── fun.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks output
```

### Source Code (repository root)

```text
data/                         # Community-editable source data (pretty JSON, sorted)
├── geo/{divisions,districts,upazilas,unions,postcodes}.json
├── phone/prefixes.json
├── convert/bijoy-map.json
├── land/units.json
├── validate/{vehicle-areas,vehicle-classes}.json
├── hotlines/hotlines.json
├── fun/{proverbs,riddles,quiz,dishes,history}.json
└── meta.json                 # DatasetMeta for every dataset

scripts/
├── build-data.ts             # validate data/ → emit src/generated/*.ts (+ search index, ETags)
└── check-bundle-size.ts

src/
├── index.ts                  # Worker entry: export default app
├── app.ts                    # OpenAPIHono app, middleware, /v1 mounting, /docs, /openapi.json
├── lib/
│   ├── envelope.ts           # ok(), fail(), meta builder
│   ├── errors.ts             # ApiError, error codes, onError/notFound handlers
│   ├── digits.ts             # Bangla⇄Latin digits, parseNumber
│   ├── normalize.ts          # NFC, search normalisation
│   ├── cache.ts              # cache-control/ETag helpers
│   ├── logger.ts             # privacy-safe structured log
│   ├── rate-limit.ts         # Rate Limiting binding middleware
│   └── random.ts             # seeded PRNG
├── generated/                # build output (git-ignored)
├── vendor/avro-phonetic/     # vendored rules with original licence
└── modules/
    ├── geo/{schemas,service,routes}.ts
    ├── bangla/{schemas,routes,num-to-words,taka,format-number,calendar,ordinal,slug,transliterate}.ts
    ├── phone/{schemas,service,routes}.ts
    ├── convert/{schemas,bijoy-to-unicode,unicode-to-bijoy,routes}.ts
    ├── land/{schemas,service,routes}.ts
    ├── validate/{schemas,nid,vehicle,tin-bin,postcode,routes}.ts
    ├── hotlines/{schemas,routes}.ts
    └── fun/{schemas,service,routes}.ts

tests/
├── unit/<module>/*.test.ts
├── contract/<module>.test.ts
├── data/<dataset>.test.ts
└── golden/<module>/*           # reviewed fixtures

.github/workflows/ci.yml
wrangler.jsonc  vitest.config.ts  biome.json  tsconfig.json  package.json
README.md  CONTRIBUTING.md  PRIVACY.md  DATA_SOURCES.md  LICENSE  LICENSE-DATA
```

**Structure Decision**: Single web-service project. Modules are vertical slices
(`schemas` → `service` → `routes`) so each user story touches only its own folder, its own data
files, and its own tests — enabling parallel work per story. Zod schemas in `modules/*/schemas.ts`
are reused by `scripts/build-data.ts` to validate data files, keeping one source of truth.

## Phase 0 / Phase 1 outputs

- Phase 0: [research.md](./research.md) — all unknowns resolved to decisions; VERIFY items become
  explicit data tasks.
- Phase 1: [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III (bilingual): post offices have `name_bn: null` | No open source has Bangla post-office names; shipping postcodes without them still unblocks address forms (US1) | Inventing transliterations would break Principle I (accuracy). Tracked as a community data task; the field is already in the schema |

# Implementation Plan: Finance Calculators

**Branch**: `003-finance-calculators` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-finance-calculators/spec.md`

## Summary

Add a `finance` module to the existing Worker: an individual income-tax calculator driven by
per-tax-year rules transcribed from the Finance Act 2026 into `data/finance/`, a rules endpoint,
and four pure calculators (loan EMI, VAT, DPS maturity, statutory gratuity). Every response cites
its legal source and carries a disclaimer; tax figures that rest on secondary sources are listed
in an `unverified` field. See [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), same Worker

**Primary Dependencies**: existing stack only (Hono, `@hono/zod-openapi`, Zod); no new packages

**Storage**: static JSON in `data/finance/`, compiled by `scripts/build-data.ts`

**Testing**: Vitest in workerd: unit tests per calculator written first, a golden file of hand-
computed tax cases, data integrity (every category has a threshold every year, slabs well-formed),
contract tests

**Target Platform**: Cloudflare Workers (existing)

**Project Type**: Web service, new module in the existing single project

**Performance Goals**: O(1) per calculation; EMI schedule O(months ≤ 600)

**Constraints**: no extrapolation to tax years without an Act; money rounded to 2 decimals

**Scale/Scope**: 2 tax years × 7 categories; 6 endpoints

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Rules cite the Act and summaries used; `unverified` lists secondary-only figures; unknown years 404 | ✅ |
| II. Privacy | No identifiers; nothing stored; logger keeps route templates only (privacy note in spec) | ✅ |
| III. Bilingual | Categories have `name_en`/`name_bn`; Bangla digits and lakh grouping accepted; `message_bn` on errors | ✅ |
| IV. Contract | `/v1/finance/...`, envelope, OpenAPI from Zod schemas | ✅ |
| V. Test-first | Unit tests and golden tax cases before implementation | ✅ |
| VI. Data as files | `data/finance/*.json`, validated in CI | ✅ |
| VII. Simplicity | No new infrastructure or dependencies | ✅ |
| VIII. Neutral | No commentary on tax policy | ✅ |
| Data standards: disclaimer + keyed by period | `meta.disclaimer` everywhere; rules keyed by tax year | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/003-finance-calculators/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/finance.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
data/finance/
├── tax-categories.json   # TaxCategory: slug, bilingual names, aliases
└── tax-years.json        # TaxYear rules per tax year with sources

src/modules/finance/
├── schemas.ts
├── tax.ts                # rules lookup + incomeTax()
├── emi.ts
├── dps.ts
├── vat.ts
├── gratuity.ts
└── routes.ts

tests/
├── unit/finance/{tax,emi,dps,vat,gratuity}.test.ts
├── golden/finance/income-tax.json
├── data/finance.test.ts
└── contract/finance.test.ts
```

**Structure Decision**: One vertical module, split per calculator like the Bangla toolkit. Tax rules
are data (they change every budget, and non-developers should be able to correct them); EMI, DPS,
VAT and gratuity are formulas whose legal constants live beside the code with their citation.

## Complexity Tracking

No violations.

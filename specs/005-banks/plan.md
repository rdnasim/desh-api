# Implementation Plan: Banks, Branches & Routing Numbers

**Branch**: `005-banks` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

## Summary

A `banks` module over two new datasets (`data/banks/banks.json`, `branches.json`) built by
`scripts/import/banks.py` from Bangladesh Bank's branch list plus matched routing numbers, a
`routing` type in the validate module (format + check digit), and lookups by bank, branch ID and
routing number. See [research.md](./research.md).

## Technical Context

TypeScript 5.9, same Worker, no new runtime dependencies · static JSON (2.1 MB raw; bundle
0.76 MB gzipped, budget 2.5 MB) · unit, data-integrity and contract tests · O(1) lookups by
maps, O(branches of one bank) for filtered lists.

## Constitution Check

| Principle | How this plan complies | Status |
|---|---|---|
| I. Accuracy & Provenance | Branches from Bangladesh Bank with date; routing numbers only when cross-checked; build fails on any bad check digit or code | ✅ |
| II. Privacy | No personal data; routing validation is format-only and `no-store` | ✅ |
| III. Bilingual | Source is English-only: `name_bn` omitted for banks/branches (holiday precedent); geo refs bilingual | ⚠️ justified below |
| IV. Contract | `/v1/banks…`, `/v1/branches/{id}`, `/v1/routing/{n}`, `/v1/validate/routing/{n}` | ✅ |
| V. Test-first | Tests written before service and routes | ✅ |
| VI. Data as files | JSON in `data/banks/`, validated in CI; importer for refreshes | ✅ |
| VII. Simplicity | No new runtime dependencies; Python importer is a maintainer tool | ✅ |
| VIII. Licence-compatible | Bangladesh Bank data is public; routing numbers from an "all rights reserved" site by maintainer decision, attributed, with a follow-up to get permission | ⚠️ justified below |

## Project Structure

```text
data/banks/{banks,branches}.json
scripts/import/banks.py
src/modules/banks/{schemas,service,routes}.ts
src/modules/validate/routing.ts
tests/{unit/banks/service,data/banks,contract/banks}.test.ts
```

## Complexity Tracking

| Item | Why | Simpler alternative rejected because |
|---|---|---|
| No Bangla bank/branch names | Source has none; inventing 11,533 spellings would be unsourced | Machine transliteration would be wrong for many names |
| Routing numbers from bddata.org | Maintainer's decision; Bangladesh Bank's routing list is behind a captcha | Shipping without routing numbers loses the main use case; follow-up to obtain permission or the official list |
| Python importer | Reading the PDF from Node needs a new dependency | Hand transcription of 11,533 rows is error-prone |

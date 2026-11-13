<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: all placeholders replaced (initial ratification)
- Added sections: Core Principles I–VIII, Data & Content Standards, Development Workflow & Quality Gates,
  Governance
- Removed sections: none
- Templates requiring updates: none (plan/spec/tasks templates read this file at runtime)
- Follow-up TODOs:
  - TODO(PROJECT_NAME): "Desh API" is a placeholder; confirm after GitHub/domain/npm availability check.
-->

# Desh API Constitution

## Core Principles

### I. Accuracy & Provenance (NON-NEGOTIABLE)

Every dataset and every computed result MUST be traceable to a cited source.

- Every response MUST carry `meta.source` and `meta.last_updated` (ISO 8601 date).
- Every static data file MUST declare its source, licence, retrieval date, and (where relevant)
  a `last_verified` date in an adjacent metadata file.
- Data that is uncertain MUST say so explicitly (e.g. `"tentative": true`, `"regional": true`) rather
  than being presented as fact.
- Safety-critical data (emergency hotlines, health contacts) MUST NOT be published without a
  `last_verified` date and a cited official source.

Rationale: the API's only real value is trust. Wrong data in an address form, invoice, or
emergency number causes real harm.

### II. Privacy by Design (NON-NEGOTIABLE)

- Validators (NID, phone, TIN, BIN, vehicle plate) MUST perform format checks only. They MUST NOT
  look up, enrich, or confirm the existence of a real person, account, or vehicle.
- Request inputs MUST NOT be persisted or logged in a way that retains personal identifiers.
  Logs MAY contain route, status, latency, and coarse client info only.
- Mock/generated data MUST be synthetic and MUST NOT be derived from real individuals.
- Any new module that touches personal data requires an explicit privacy note in its spec.

Rationale: national ID and phone numbers are sensitive; a public API that leaks or correlates
them would be dangerous and would destroy community trust.

### III. Bilingual by Default

- Every named entity MUST expose both `name_en` and `name_bn`.
- Bangla text MUST be Unicode (NFC-normalised). Bangla digits (০–৯) and Latin digits MUST both be
  accepted as input wherever a number is accepted.
- Error messages MUST be in English and SHOULD include a Bangla message (`message_bn`) where practical.

### IV. Consistent, Versioned API Contract

- All endpoints MUST live under a major version prefix (`/v1/...`). Breaking changes require a new
  major version; the previous version MUST remain available for at least 6 months after deprecation
  is announced.
- Every success response MUST use the envelope `{ "success": true, "data": ..., "meta": {...} }`.
  Every error MUST use `{ "success": false, "error": { "code", "message" }, "meta": {...} }` with
  a correct HTTP status code.
- Resources MUST be addressable by human-readable slugs (`/districts/cumilla`), not opaque numeric IDs.
- The OpenAPI document MUST be generated from the same schemas that validate requests and responses;
  hand-written, drifting docs are not allowed.
- CORS MUST be enabled for all public `GET` endpoints.
- Bulk operations MUST be offered via `POST` with a documented maximum batch size.

### V. Test-First for Logic, Golden Files for Data

- Every converter, calculator, and validator MUST have unit tests written before the
  implementation, including Bangla-specific edge cases (Bangla digits, zero, very large numbers,
  mixed scripts).
- Every endpoint MUST have a contract test asserting status, envelope shape, and schema.
- Every static dataset MUST have integrity tests (unique slugs, valid parent references, both
  names present, coordinates within Bangladesh bounds where applicable).
- Text converters (Bijoy ↔ Unicode, number-to-words, transliteration) MUST be covered by
  golden-file tests with reviewed expected output.

### VI. Data as Contributable Files

- Static reference data MUST live as plain JSON files in the repository so non-developers can
  correct it via pull request.
- Every data change MUST pass schema and integrity validation in CI before merge.
- Data files MUST be human-diffable (pretty-printed, stable key order, sorted records).

### VII. Edge-First Simplicity & Free-Tier Discipline

- The service MUST run on a free/low-cost edge runtime; new infrastructure (databases, queues,
  paid services) requires a written justification in the plan's Complexity Tracking table.
- Static data MUST be served with long-lived cache headers and an `ETag`.
- YAGNI: no feature, abstraction, or dependency is added without a concrete Phase requirement.

### VIII. Neutral & Rights-Respecting Content

- Political reference data (e.g. constituencies) MUST be neutral factual data only — no party,
  candidate commentary, or rankings.
- Cultural/fun content MUST be traditional, public-domain, or explicitly licensed; copyrighted
  lyrics, poems, or modern authors' quotes MUST NOT be included.
- Third-party datasets MUST be license-compatible with the project's data licence (CC BY 4.0) and
  credited.

## Data & Content Standards

- Code licence: MIT. Data licence: CC BY 4.0, with upstream attribution preserved.
- Financial, tax, and land-unit results MUST include a disclaimer field and, where rules change over
  time, MUST be keyed by the applicable period (e.g. fiscal year) or region.
- Phone operator detection MUST document that mobile number portability means the prefix reflects
  only the original operator.
- Before adding a dataset, contributors MUST survey existing open BD datasets and prefer
  collaboration and credit over duplication.

## Development Workflow & Quality Gates

- Work follows Spec Kit: `/speckit-specify` → (`/speckit-clarify`) → `/speckit-plan` →
  `/speckit-tasks` → (`/speckit-analyze`) → `/speckit-implement`. One feature directory per spec under
  `specs/`.
- Every PR MUST pass: type-check, lint, unit + contract + data-integrity tests, and OpenAPI
  generation.
- PRs that change data MUST state the source of the change.
- PRs that add or change a public endpoint MUST update the contract docs and examples.
- At least one maintainer review is required to merge; data-only PRs to safety-critical data
  (hotlines, health) require a second reviewer.

## Governance

- This constitution supersedes other practices. Plans MUST include a Constitution Check; any
  violation MUST be justified in the plan's Complexity Tracking table or the design changed.
- Amendments: propose via PR editing this file, include rationale and a Sync Impact Report, and
  obtain approval from at least two maintainers (or the sole maintainer while the project has one).
- Versioning: MAJOR for removed/redefined principles, MINOR for new principles or materially
  expanded guidance, PATCH for clarifications.
- Compliance is reviewed at every PR and at each roadmap phase boundary.

**Version**: 1.0.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13

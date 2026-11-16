# Implementation Plan: 018-constituencies

## Architecture
- Canonical dataset stored in `data/geo/constituencies.json` (300 items).
- Service module in `src/modules/constituencies/`:
  - `schemas.ts`: OpenAPI Zod schemas for responses and queries.
  - `service.ts`: Query filtering, lookup by number/code, and district summary aggregation.
  - `routes.ts`: OpenAPI Hono routes mounted at `/v1/constituencies`.
- Mounting in `src/app.ts` under `/v1/constituencies`.
- Unit and contract tests in `tests/unit/constituencies/` and `tests/contract/constituencies.test.ts`.
- Documentation updates in `DATA_SOURCES.md`, `README.md`, `src/docs.ts`, `src/landing.ts`, and `docs/roadmap.md`.

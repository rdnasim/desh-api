# Architecture & Implementation Plan: 024-client-sdks

## 1. Code Generation & SDK Architecture
- Generate baseline client definitions from the live OpenAPI 3.1 specification (`/openapi.json`).
- Maintain hand-crafted ergonomic wrappers for high-frequency operations (e.g. `client.geo.districts()`, `client.bangla.numToWords()`, `client.finance.incomeTax()`).
- Monorepo or dedicated SDK repositories under the `desh-api` GitHub organization.

## 2. CI/CD & Automated Publishing
- Automated GitHub Actions workflow on new API version release:
  - Generate OpenAPI schema.
  - Run typecheck and integration tests against staging environment.
  - Publish to npm, PyPI, and Packagist with semantic versioning.

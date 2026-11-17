# Feature Specification: 024-client-sdks (Official Client SDKs)

**Feature Branch**: `024-client-sdks`  
**Status**: Planned  
**Input**: Official multi-language client libraries for Desh API: TypeScript/JavaScript (`@deshapi/client`), Python (`desh-api`), PHP (`deshapi/sdk`), and Go (`github.com/desh-api/desh-go`).

---

## 1. Overview

To drive widespread adoption across diverse software ecosystems (Node.js, Next.js, Django, FastAPI, Laravel, WordPress, and Go backend microservices), developers need ergonomic, strongly-typed, auto-completing client libraries that handle authentication, retries, rate-limit headers, and response parsing automatically.

---

## 2. Supported SDK Targets

1. **TypeScript / JavaScript (`@deshapi/client` on npm)**:
   - Zero external runtime dependencies (native `fetch`).
   - Dual ESM + CommonJS builds.
   - 100% typed with types generated directly from OpenAPI schema.
   - Built-in rate-limit tracking and retries with exponential backoff.
2. **Python (`desh-api` on PyPI)**:
   - Python 3.9+ support.
   - Synchronous (`requests` / `httpx`) and asynchronous (`httpx.AsyncClient`) interfaces.
   - Pydantic models for responses.
3. **PHP / Laravel (`deshapi/sdk` on Packagist)**:
   - PHP 8.1+ support.
   - PSR-18 HTTP client compatible.
   - First-party Laravel ServiceProvider and Facade.
4. **Go (`github.com/desh-api/desh-go`)**:
   - Zero third-party dependencies using standard library `net/http`.
   - Context-aware cancellation and idiomatic error handling.

---

## 3. User Stories

- **US1**: As a TypeScript engineer, I can install `@deshapi/client` and query `/v1/districts` with full TypeScript autocompletion and typed response payloads.
- **US2**: As a Python backend developer, I can install `desh-api` via pip and perform NID or land calculations directly in my backend models.
- **US3**: As a Laravel developer, I can require `deshapi/sdk` and access `Desh::prayer()->today('dhaka')` in my Blade views or controllers.

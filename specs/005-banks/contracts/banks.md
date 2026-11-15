# Contract: Banks

Follows `specs/001-phase1-mvp/contracts/common.md`. Branch responses carry `meta.disclaimer`.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/banks` | — | `BankWithCounts[]` | — |
| GET | `/v1/banks/{bank}` | — (slug or Bangladesh Bank ID) | `BankWithCounts` | 404 |
| GET | `/v1/banks/{bank}/branches` | `district?`, `upazila?`, `q?`, `page?`, `per_page?` | `BranchDetail[]` (paginated) | 400, 404 |
| GET | `/v1/branches/{id}` | — | `BranchDetail` | 404 |
| GET | `/v1/routing/{number}` | — | `BranchDetail` | 400 (format/check digit), 404 (valid, not listed; names the bank if known) |
| GET | `/v1/validate/routing/{number}` | — | `ValidationResult` (`no-store`) | — |

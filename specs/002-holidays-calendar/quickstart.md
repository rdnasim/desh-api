# Quickstart & Validation: Holidays & Calendar

```bash
pnpm dev
pnpm test
```

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/holidays/years` | 2026 for `general` and `bank`, each with its documents |
| 2 | `/v1/holidays?year=2026` | every row of the official 2026 list, bilingual, with sources |
| 3 | `/v1/holidays?year=2026&calendar=bank` | 28 bank closure days incl. 1 July and 31 December |
| 4 | `/v1/is-holiday?date=2026-12-16` | holiday: Victory Day |
| 5 | `/v1/is-holiday?date=2026-11-13` | Friday → weekend, not a working day |
| 6 | `/v1/is-holiday?date=2026-07-01&calendar=bank` | bank holiday; same date on `general` is a working day |
| 7 | `/v1/working-days?from=2026-12-01&to=2026-12-31` | count matches a manual count |
| 8 | `/v1/holidays?year=2030` | 404 listing available years |

Before release: compare every 2026 record with the official tables (SC-001) and record the check
in `research.md`.

---

description: "Task list for Market Prices"
---

# Tasks: Market Prices

- [X] T001 Survey TCB listing, spreadsheet, BPC fuel notice, Bangladesh Bank (research M1–M3); save real fixtures
- [X] T002 Minimal xlsx reader (src/lib/xlsx.ts) with tests against the real TCB file
- [X] T003 Commodity catalog and fuel dataset in data/market/; register datasets; data/meta.json
- [X] T004 `latestFile`, `parseTcb`, `fetchTcb` with unit tests (60 items, nulls, catalog coverage)
- [X] T005 Shared `lastGood` KV helper (src/lib/last-good.ts); gold switched to it (old stored shape still read)
- [X] T006 `/v1/market/prices`, `/v1/fuel/prices` with contract tests (filters, KV fallback, 503, 404)
- [X] T007 Smoke scenarios, README, landing page, /docs, PRIVACY, CONTRIBUTING, roadmap, DATA_SOURCES.md
- [ ] T008 *(blocked)* Exchange rates (Bangladesh Bank captcha; research M3)
- [ ] T009 *(monthly)* Add each month's fuel notice

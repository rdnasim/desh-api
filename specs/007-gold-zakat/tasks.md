---

description: "Task list for Gold Price & Zakat"
---

# Tasks: Gold Price & Zakat

- [X] T001 Survey BAJUS page, robots.txt, nisab sources (research G1–G2); save trimmed page as test fixture
- [X] T002 [P] Parser + zakat unit tests (prices, vori, date, page-changed error, nisab, both bases, boundary)
- [X] T003 Implement `parseBajus`, `fetchBajus` (Cloudflare-cached), `zakat`; `upstream_unavailable` error code
- [X] T004 Contract tests with stubbed upstream (prices, 503 on outage/redesign, zakat filters); routes, app, docs tag
- [X] T005 Smoke scenario (tolerates a BAJUS outage), README, landing page, roadmap
- [X] T006 Last good price list in Workers KV for regions BAJUS refuses (remember/recall, 6-hour rewrite, 7-day limit; unit + contract tests)
- [ ] T007 *(follow-up)* Daily price history (needs storage: D1 + scheduled job; maintainer approval)

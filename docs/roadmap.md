# Desh API — Spec-Driven Roadmap

Source vision: [`docs/vision.md`](./vision.md). Governance: [`.specify/memory/constitution.md`](../.specify/memory/constitution.md).

Each roadmap phase is delivered as one Spec Kit feature (`specs/NNN-*`). A feature is specified,
planned, and broken into tasks only when the previous one is close to shipping, so that later
specs benefit from what was learned.

| Feature | Phase | Modules (vision §4) | Status |
|---|---|---|---|
| [`001-phase1-mvp`](../specs/001-phase1-mvp/) | 1 — MVP (weeks 1–4) | 1 Geo, 2 Bangla Toolkit, 3 Phone, 4 Bijoy ↔ Unicode, 5 Land Units, 6 Format Validators, 7 Hotlines, 8 Proverbs & Fun, docs site | **Live** at https://deshapi.riadul.com (112/114 tasks); awaiting native-speaker review and two unsourced data items |
| [`002-holidays-calendar`](../specs/002-holidays-calendar/) | 2 — Live data | 9 Holidays & Calendar | **Built for 2027 (general calendar)**; 2026 and bank calendar blocked on official documents |
| [`003-finance-calculators`](../specs/003-finance-calculators/) | 2 — Live data | 13 Finance Calculators | **Built** for tax years 2026-27 to 2030-31 (24/24 tasks); every tax rule checked against Act No. 96 of 2026 |
| [`004-mock-data`](../specs/004-mock-data/) | 2 — Live data | 15 Bangla Mock Data Generator | **Built** (people and addresses); Bangla name spellings await native-speaker review |
| [`005-banks`](../specs/005-banks/) | 2 — Live data | 11 Banks & Routing Numbers | **Built**: 61 banks, 11,533 branches (Bangladesh Bank, 31 Aug 2026), 8,080 routing numbers; permission from bddata.org and Bangla bank names pending |
| `00x-…` (to split) | 2 — Live data (months 2–3) | 10 Market Prices, 12 Gold & Zakat, 14 Education, API keys & daily quotas | Not started |
| `00x-expansion` | 3 — Expansion (months 4–6) | 16 Prayer Times, 17 Transport, 18 Health, 19 Weather/AQI/Flood, 20 Constituencies, 21 Tourism, 22 NLP, SDKs (npm, PyPI, Composer) | Not started |
| `00x-ecosystem` | 4 — Ecosystem (6+ months) | Playground, bots, browser extension, form widgets, WordPress/Laravel plugins, Sheets add-on, dashboard, CLI | Not started |

Phase 2 and 3 are large; when their turn comes, split them into several features (e.g.
`002-holidays-calendar`, `003-finance-calculators`) if any single spec exceeds ~8 user stories.

## How to start the next feature

```text
/speckit-specify  Phase 2 of docs/vision.md: holidays & calendar, market prices, ...
/speckit-clarify  (optional, recommended for tax/zakat/prices)
/speckit-plan
/speckit-tasks
/speckit-analyze  (optional consistency check)
/speckit-implement
```

## Pre-work outside Spec Kit (vision §15)

- [ ] Finalize project name; check GitHub org, domain, and npm/PyPI names
- [ ] Survey existing BD open-data repos (geo, postcodes, Bijoy converters) and record findings in
      `specs/001-phase1-mvp/research.md`
- [ ] Create a Cloudflare account and reserve the Workers subdomain

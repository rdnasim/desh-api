# Feature Specification: 018-constituencies (Parliamentary Constituencies — জাতীয় সংসদীয় আসন)

## 1. Overview
The Jatiya Sangsad (National Parliament of Bangladesh) consists of 300 general seats directly elected from single-member territorial constituencies across all 64 districts and 8 divisions. Each constituency has an official seat number (1 to 300), an English name (e.g. `Dhaka-1`, `Panchagarh-1`), a Bengali name (e.g. `ঢাকা-১`, `পঞ্চগড়-১`), administrative linkages (division, district), and geographic boundaries (upazilas, thanas, municipal wards).

This feature exposes canonical constituency data, lookups by seat number or slug, and aggregation by district.

## 2. User Stories
- **US1**: As an API consumer, I can list all 300 parliamentary constituencies, filter by division or district, or search by name.
- **US2**: As an API consumer, I can fetch a single constituency by seat number (e.g. `/v1/constituencies/174`) or code slug (e.g. `/v1/constituencies/dhaka-1`).
- **US3**: As an API consumer, I can retrieve constituency counts and seat breakdowns for all 64 districts (e.g. `/v1/constituencies/districts`).

## 3. Data Sources & Authority
- Primary: Bangladesh Election Commission (EC) Parliamentary Constituency Delimitation Gazette (জাতীয় সংসদীয় আসন সীমানা পুনর্নির্ধারণ গেজেট) and Bangladesh Parliament Secretariat (Jatiya Sangsad).
- All 300 seats are mapped to canonical division and district identifiers defined in `data/geo/divisions.json` and `data/geo/districts.json`.

## 4. Endpoints
- `GET /v1/constituencies` (optional query: `division`, `district`, `search`, `limit`, `offset`)
- `GET /v1/constituencies/:identifier` (lookup by seat number `1..300` or slug `dhaka-1`)
- `GET /v1/constituencies/districts` (summary breakdown by district)

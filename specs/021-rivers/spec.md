# Feature Specification: 021-rivers (Major Rivers & Waterways)

**Feature Branch**: `021-rivers`  
**Status**: Built  
**Authority**: Bangladesh Water Development Board (BWDB — `bwdb.gov.bd`), Hydrology Directorate, and Banglapedia.

---

## 1. Overview

Bangladesh is the world's largest delta formed by the confluence of the Padma (Ganges), Jamuna (Brahmaputra), and Meghna river systems. Rivers form the economic and ecological lifeblood of the country, supplying irrigation, inland riverport transit, fishing livelihoods, and alluvium.

This module provides an authoritative hydrological dataset of 30 principal rivers in Bangladesh, detailing origins, outflow points, lengths in kilometers, transboundary status, traversing districts, and major tributaries/distributaries.

---

## 2. User Stories

- **US1 (List & Filter Rivers)**: As a geography, climate, or shipping developer, I can list Bangladesh rivers, filter by `division`, `district`, transboundary status (`is_transboundary=true|false`), or search by name.
- **US2 (River Details)**: As an environmental analyst or educator, I can look up any river by slug (e.g. `padma`, `jamuna`, `karnafuli`) to examine its origins, outflow points, course length, tributaries, distributaries, and special features.
- **US3 (Transboundary Crossings)**: As a researcher studying shared international river basins, I can fetch all transboundary rivers originating beyond Bangladesh's borders (`GET /v1/rivers/transboundary`).

---

## 3. Endpoints

- `GET /v1/rivers` — List rivers with filters (`division`, `district`, `is_transboundary`, `q`, `limit`, `offset`).
- `GET /v1/rivers/transboundary` — List only transboundary international rivers.
- `GET /v1/rivers/:slug` — Retrieve river details by slug.

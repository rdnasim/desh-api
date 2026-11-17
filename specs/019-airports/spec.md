# Feature Specification: 019-airports (Airports & Aviation Directory)

**Feature Branch**: `019-airports`  
**Status**: Built  
**Authority**: Civil Aviation Authority of Bangladesh (CAAB — `caab.gov.bd`), Aeronautical Information Publication (AIP), and international ICAO/IATA registries.

---

## 1. Overview

Bangladesh operates a national civil aviation network regulated by the Civil Aviation Authority of Bangladesh (CAAB) under the Ministry of Civil Aviation and Tourism. The network comprises international gateway airports (Dhaka Hazrat Shahjalal, Chattogram Shah Amanat, Sylhet Osmani, and Cox's Bazar under international expansion), domestic operational airports, short takeoff and landing (STOL) airstrips, and designated military airfields.

This module provides a canonical, bilingual reference directory for all 15 statutory airports and aviation facilities in Bangladesh.

---

## 2. User Stories

- **US1 (List & Filter Airports)**: As a travel or logistics developer, I can list all airports in Bangladesh, filter by facility `type` (e.g. `international`, `domestic`, `short_takeoff`), `status` (e.g. `operational`, `under_development`), `division`, `district`, or search by city or airport name.
- **US2 (Airport Lookup by Code or Slug)**: As an airline or booking app consumer, I can look up any airport directly using its 3-letter IATA code (e.g. `DAC`, `CGP`), 4-letter ICAO code (e.g. `VGHS`, `VGEG`), or slug identifier (e.g. `hazrat-shahjalal-international-airport`).
- **US3 (Facility Types Reference)**: As a frontend developer building filters or dropdowns, I can fetch all supported airport classifications and their metadata (`GET /v1/airports/types`).

---

## 3. Endpoints

- `GET /v1/airports` — List airports with optional filters (`type`, `status`, `division`, `district`, `q`, `limit`, `offset`).
- `GET /v1/airports/types` — List supported airport type classifications.
- `GET /v1/airports/:code` — Retrieve an airport by IATA code, ICAO code, or slug identifier.

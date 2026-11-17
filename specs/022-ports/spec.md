# Feature Specification: 022-ports (Statutory Land Ports & Customs Stations)

**Feature Branch**: `022-ports`  
**Status**: Built  
**Authority**: Bangladesh Land Port Authority (BLPA — `bsbk.gov.bd`), Ministry of Shipping, and National Board of Revenue (Customs).

---

## 1. Overview

The Bangladesh Land Port Authority (BLPA) regulates and manages statutory land customs stations and ports across Bangladesh's international terrestrial borders with India and Myanmar. Ports like Benapole, Burimari, Bhomra, Akhaura, and Tamabil handle bilateral cross-border trade of vital food grains, textiles, vehicles, and industrial raw materials, alongside international passenger immigration.

This module provides a comprehensive directory of all 24 statutory BLPA land ports, operating models (BLPA direct, private BOT, railway joint), counterpart Indian Land Customs Stations (LCS), infrastructure facilities, and key import/export commodities.

---

## 2. User Stories

- **US1 (List & Filter Ports)**: As an import/export logistics developer, I can list statutory land ports, filter by `status` (`operational`, `under_development`, `inactive`), `operator_type` (`blpa_operated`, `private_bot`, `railway_joint`), `division`, `district`, or search by name.
- **US2 (Port Infrastructure Details)**: As a supply-chain analyst or traveler, I can look up port details by 3-letter code (e.g. `BEN`, `BUR`, `AKH`) or slug (e.g. `benapole`), retrieving rail connections, passenger terminal availability, digital gatepass capabilities, and counterpart border checkpoints.
- **US3 (Operator Classifications)**: As a system consumer, I can inspect supported port operating models (`GET /v1/ports/types`).

---

## 3. Endpoints

- `GET /v1/ports` — List statutory land ports with filters (`status`, `operator_type`, `division`, `district`, `q`, `limit`, `offset`).
- `GET /v1/ports/types` — List supported operator models and statuses.
- `GET /v1/ports/:identifier` — Retrieve port details by 3-letter code or slug.

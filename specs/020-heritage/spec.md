# Feature Specification: 020-heritage (UNESCO World Heritage & Archaeological Tourism)

**Feature Branch**: `020-heritage`  
**Status**: Built  
**Authority**: Department of Archaeology (Ministry of Cultural Affairs — `archaeology.gov.bd`), Bangladesh Parjatan Corporation (`parjatan.gov.bd`), and UNESCO World Heritage Centre.

---

## 1. Overview

Bangladesh possesses a deep archaeological and natural heritage spanning ancient Buddhist viharas, medieval sultanate mosques, Hindu terracotta temples, Mughal fortifications, colonial palaces, and mangrove ecosystems.

This module provides a curated, bilingual database of 35 principal archaeological and tourism monuments across all 8 divisions of Bangladesh, including all UNESCO World Heritage sites (Historic Mosque City of Bagerhat, Ruins of the Buddhist Vihara at Paharpur, The Sundarbans).

---

## 2. User Stories

- **US1 (List Heritage Sites with Categorization)**: As a tourism or educational app developer, I can list heritage landmarks, filter by `category` (`archaeological`, `historical`, `natural`, `cultural`, `monument`), `type` (`unesco_world_heritage`, `national_heritage`, `eco_tourism`, `landmark`), `division`, `district`, or search keywords.
- **US2 (Site Details & Practical Travel Info)**: As an explorer or travel guide consumer, I can fetch comprehensive site details by slug, including historical era, highlights, coordinates, best visiting season, and multi-tier entry fees (local citizens, SAARC nationals, foreign visitors).
- **US3 (UNESCO World Heritage Focus)**: As a researcher or tourist, I can query all designated UNESCO World Heritage sites with their official UNESCO inscription IDs (`GET /v1/heritage/unesco`).

---

## 3. Endpoints

- `GET /v1/heritage` — List heritage landmarks with filters (`category`, `type`, `division`, `district`, `q`, `limit`, `offset`).
- `GET /v1/heritage/unesco` — List only designated UNESCO World Heritage sites.
- `GET /v1/heritage/:slug` — Retrieve single heritage site details by slug.

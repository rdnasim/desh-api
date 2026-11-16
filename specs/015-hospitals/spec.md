# Feature Specification: National Healthcare & Hospital Directory

**Feature Branch**: `015-hospitals`  
**Created**: 2026-11-16  
**Status**: In Progress  
**Input**: National Hospital & Healthcare Directory: Major government medical colleges, specialized institutes (BSMMU, NICVD, NIDCH, etc.), district referral hospitals, bed counts, emergency hotlines, and coordinates across all 8 divisions.

---

## Overview

Access to reliable healthcare information is critical in emergencies and medical referrals across Bangladesh. The **Directorate General of Health Services (DGHS)** under the Ministry of Health and Family Welfare (MOHFW) oversees government medical colleges, tertiary specialized institutes, and district hospitals.

Desh API provides a structured, bilingual reference directory:
1. **Tertiary & Specialized Institutes**: BSMMU, DMCH, NICVD, NIDCH, NITOR (Pangu), NINS, NICRH, National Eye Institute, BITID, and divisional medical colleges (CMCH, RMCH, KMCH, SOMCH, SBMCH, RpMCH, MMCH).
2. **Key Capabilities & Capacities**: Official bed count capacity, emergency department status, specialized services (ICU, CCU, Burn Unit, Dialysis, Trauma), and GPS coordinates.
3. **Emergency Hotlines**: Direct casualty/emergency landlines, national health helpline (16263 Shastho Batayan), and ambulance services.

---

## User Scenarios & Testing

### User Story 1 - List Hospitals with Filters (Priority: P1) 🎯 MVP
Patients, emergency dispatchers, and health apps need to find major hospitals by location and specialty.

1. `GET /v1/health/hospitals` returns national healthcare directory sorted by name.
2. Supports filtering by division (`?division=dhaka`), district (`?district=chattogram`), type (`?type=specialized_institute`, `?type=medical_college`), and search query (`?q=cardiac`).
3. Supports filtering by emergency availability (`?emergency=true`).

### User Story 2 - Hospital Details (Priority: P1) 🎯 MVP
Users need full details of a specific hospital.

1. `GET /v1/health/hospitals/{slug}` returns hospital metadata: bilingual name, bed capacity, emergency hotlines, address, GPS coordinates, and specialized units.
2. 404s on unknown hospital slug.

### User Story 3 - Healthcare Emergency Quick Reference (Priority: P1) 🎯 MVP
In urgent medical emergencies, callers need immediate casualty hotlines and primary trauma centers.

1. `GET /v1/health/emergency` returns toll-free national health numbers (16263 Shastho Batayan, 999 National Emergency), top divisional emergency casualty contacts, and dedicated specialized trauma/burn institutes.

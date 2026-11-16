# Feature Specification: Education Boards & SSC/HSC Exam System

**Feature Branch**: `014-education-boards`  
**Created**: 2026-11-16  
**Status**: In Progress  
**Input**: Education Boards & SSC/HSC Exam Results Reference: 9 General Education Boards + Madrasah + Technical Board, codes, district jurisdictions, and official GPA 5.0 grading scale calculator.

---

## Overview

In Bangladesh, secondary and higher secondary education examinations (JSC, SSC, HSC, Dakhil, Alim, and Vocational) are administered by **11 statutory Education Boards** under the Ministry of Education:
1. **9 General Intermediate and Secondary Education Boards (BISE)**: Dhaka, Chattogram, Rajshahi, Cumilla, Jashore, Barishal, Sylhet, Dinajpur, and Mymensingh. Each has exclusive territorial jurisdiction over a specific set of districts.
2. **Bangladesh Madrasah Education Board (BMEB)**: Nationwide jurisdiction for traditional Islamic education institutions (Dakhil & Alim).
3. **Bangladesh Technical Education Board (BTEB)**: Nationwide jurisdiction for vocational, technical, and polytechnic institutes.

All boards share a standardized **GPA 5.0 grading system** introduced by the Ministry of Education.

Desh API provides:
1. **Education Boards Directory**: Listing, code lookup (e.g., `DHA`, `RAJ`), jurisdiction lookup (finding which board governs a district), website, establishment year, and headquarters.
2. **Official Grading Scale Reference**: Full marks ranges (80–100 = A+, 70–79 = A, etc.), grade points (5.0, 4.0, 3.5, 3.0, 2.0, 1.0, 0.0), and performance labels in English and Bengali.
3. **GPA Calculator**: Calculation of total GPA, letter grade, Golden A+ detection, and optional 4th-subject bonus handling conforming to Bangladesh education board rules.

---

## User Scenarios & Testing

### User Story 1 - List Education Boards & Filter (Priority: P1) 🎯 MVP
Students, admission portals, and educational apps need the full directory of education boards with their codes and jurisdictions.

1. `GET /v1/education/boards` returns all 11 education boards sorted alphabetically by name.
2. Supports filtering by board type (`?type=general`, `?type=madrasah`, `?type=technical`).
3. Supports filtering by district slug (`?district=cumilla`, `?district=dhaka`). When filtering by district, both the governing general board and the nationwide boards (madrasah, technical) are returned.

### User Story 2 - Get Single Board by Code or Slug (Priority: P1) 🎯 MVP
Systems often receive board codes like `DHA` or `MAD` from result forms or SMS result queries.

1. `GET /v1/education/boards/{code_or_slug}` resolves board by either standard 3-letter code (`DHA`, `dha`, `CHI`, `RAJ`, `MAD`, `TEC`) or by slug (`dhaka`, `chattogram`, `madrasah`, `technical`).
2. Returns full board metadata, official website, contact info, and list of covered district slugs.
3. 404s for invalid board code or slug.

### User Story 3 - Official Grading Scale Reference (Priority: P1) 🎯 MVP
EdTech platforms and students need the authoritative reference for Bangladesh's GPA 5.0 scale.

1. `GET /v1/education/grading-scale` returns the 7 grade tiers (`A+`, `A`, `A-`, `B`, `C`, `D`, `F`), mark ranges (e.g. 80-100, 70-79), grade points (5.0 - 0.0), and remarks in English and Bengali (`Outstanding` / `অসাধারণ`, etc.).
2. `GET /v1/education/grade-lookup?marks=78` returns the corresponding grade tier, GPA, and assessment.

### User Story 4 - GPA Calculator (Priority: P1) 🎯 MVP
Calculate overall GPA and letter grade from subject marks or grade points.

1. `POST /v1/education/calculate-gpa` takes subject scores with optional 4th subject.
2. Rule: If any mandatory subject has grade `F` (marks < 33 or GPA 0.0), overall result is `F` (GPA 0.00).
3. Rule: 4th subject rule applies: points above 2.00 contribute to total grade points before dividing by main subjects count, capped at 5.00.
4. Returns computed GPA, overall letter grade, pass/fail status, and whether Golden A+ was achieved.

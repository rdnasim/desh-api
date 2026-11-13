# Feature Specification: Phase 1 MVP — Bangladesh Reference Data & Bangla Tools

**Feature Branch**: `001-phase1-mvp`

**Created**: 2026-11-13

**Status**: Draft

**Input**: User description: "Phase 1 of docs/vision.md — Geo data, Bangla toolkit, phone validator,
Bijoy ↔ Unicode converter, land unit converter, format validators (NID, vehicle, TIN, BIN, postcode),
emergency & government hotlines, proverbs/riddles/fun content, and a public docs site. Free, open,
bilingual, privacy-first."

## Clarifications

### Session 2026-11-13

- Q: How should Bijoy conversion treat embedded English/Latin text? → A: Phase 1 has no ignore
  marker; the whole input is treated as Bijoy. Docs warn that mixed English text will be mapped.
  An opt-in marker may be added later if users ask for it.
- Q: What birth-year range makes a 17-digit NID plausible? → A: 1900 through the current year
  (Asia/Dhaka), inclusive.
- Q: Which BIN formats count as valid? → A: 9 digits is valid (`bin-9`). The 13-digit branch form
  (9 + 4 digits, optional dash) is also `valid: true`, with `format: "legacy_or_branch"`.

## User Scenarios & Testing *(mandatory)*

Each story below is an independently shippable slice. Stories are ordered by the value they unlock
for the largest target user groups (e-commerce, delivery, ERP/payroll, fintech).

### User Story 1 - Address hierarchy for forms (Priority: P1) 🎯 MVP

An e-commerce developer builds a checkout address form. They fetch all divisions, then the districts
of the chosen division, then upazilas, then unions, each with English and Bangla names. They can look
up a postcode, search areas by partial name in either language, and find the nearest district to a
GPS coordinate.

**Why this priority**: Address dropdowns are the single most rebuilt component in BD apps and the
foundation for postcodes, delivery, and later modules (hotlines by district, prayer times, etc.).

**Independent Test**: Build a 4-level cascading dropdown using only this capability; every level
loads, every option shows both names, and a known postcode resolves to its post office and district.

**Acceptance Scenarios**:

1. **Given** the service is running, **When** a client requests all divisions, **Then** it receives
   exactly 8 divisions, each with a slug, `name_en`, `name_bn`, and coordinates.
2. **Given** a valid division slug (e.g. `dhaka`), **When** a client requests its districts, **Then**
   only districts belonging to that division are returned.
3. **Given** a district slug (e.g. `cumilla`), **When** a client requests upazilas, **Then** all
   upazilas of that district are returned; the same pattern holds for unions of an upazila.
4. **Given** a known 4-digit postcode (e.g. `1205`), **When** looked up, **Then** the post office
   name(s), thana/upazila, and district are returned.
5. **Given** the query `mirpur` or `মিরপুর`, **When** a client searches, **Then** matching areas at
   any level are returned with their level and parent chain.
6. **Given** coordinates inside Bangladesh, **When** a client asks for the nearest area, **Then** the
   closest district (and upazila where coordinates exist) is returned with distance in km.
7. **Given** an unknown slug or postcode, **When** requested, **Then** a 404 error with a clear
   message is returned in the standard error envelope.

---

### User Story 2 - Bangla numbers, words, and dates (Priority: P1)

An ERP/invoicing developer needs to print "taka in words" on invoices and cheques, show numbers in
Bangla digits with lakh/crore grouping, and show today's Bangla calendar date.

**Why this priority**: Required on virtually every Bangla invoice, cheque, and payslip; logic is
error-prone and frequently re-implemented incorrectly.

**Independent Test**: Convert a fixed set of reference numbers and dates and compare against a
reviewed golden list.

**Acceptance Scenarios**:

1. **Given** `1250`, **When** converted to words, **Then** the result is `এক হাজার দুইশত পঞ্চাশ`.
2. **Given** the amount `1250.50`, **When** converted to taka-in-words, **Then** the result names
   taka and paisa (e.g. `এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা`).
3. **Given** `1250000`, **When** formatted, **Then** the result is `১২,৫০,০০০` (South Asian grouping).
4. **Given** text `2026` and target `bn`, **When** digits are converted, **Then** `২০২৬` is
   returned; conversion in the reverse direction also works.
5. **Given** a Gregorian date, **When** converted, **Then** the Bangla calendar day, month, year,
   weekday, and season are returned per the revised official Bangla calendar.
6. **Given** a number `3`, **When** an ordinal is requested, **Then** `তৃতীয়` is returned.
7. **Given** Bangla text, **When** a slug is requested, **Then** a URL-safe slug is returned.
8. **Given** romanised phonetic text (`ami bhalo achi`), **When** transliterated, **Then** Bangla
   Unicode text (`আমি ভালো আছি`) is returned.
9. **Given** input that is not a number, is negative where not allowed, or exceeds the supported
   range, **When** submitted, **Then** a 400 error explains the valid range.

---

### User Story 3 - Phone number validation (Priority: P2)

A delivery startup validates and normalises customer mobile numbers entered in many formats
(`+8801712345678`, `8801712345678`, `01712345678`, `০১৭১২৩৪৫৬৭৮`, with spaces or dashes) and shows
the original operator.

**Why this priority**: Every BD app collecting phone numbers needs this; bad numbers cause failed
deliveries and failed OTPs.

**Independent Test**: Submit a reviewed list of valid and invalid numbers; each returns the expected
validity, normalised local form, international form, and original operator.

**Acceptance Scenarios**:

1. **Given** `+8801712345678`, **When** validated, **Then** `valid: true`, normalised `01712345678`,
   international `+8801712345678`, operator `Grameenphone`.
2. **Given** a number with a prefix not allocated to any operator or a wrong length, **When**
   validated, **Then** `valid: false` with a machine-readable reason.
3. **Given** up to 100 numbers, **When** submitted in bulk, **Then** each gets an individual result
   in the same order.
4. **Given** any response with an operator, **Then** it includes a notice that portability means
   the operator is the original allocation only.

---

### User Story 4 - Bijoy ↔ Unicode conversion (Priority: P2)

A newspaper or government office pastes legacy Bijoy (SutonnyMJ) encoded text and receives correct
Unicode Bangla, or converts Unicode back to Bijoy for legacy print workflows.

**Why this priority**: Very high real-world demand from publishers and offices; existing tools are
desktop-only or ad-hoc.

**Independent Test**: Convert a reviewed golden corpus (including conjuncts, reph, pre-base vowel
signs, ya-phala, ra-phala, and punctuation) and match expected output exactly.

**Acceptance Scenarios**:

1. **Given** `Avgvi †mvbvi evsjv`, **When** converted to Unicode, **Then** `আমার সোনার বাংলা`.
2. **Given** `আমার সোনার বাংলা`, **When** converted to Bijoy, **Then** `Avgvi †mvbvi evsjv`.
3. **Given** text up to the documented size limit, **When** converted, **Then** output is returned
   in a single response; text above the limit returns 413 with the limit stated.
4. **Given** mixed Bijoy and plain English, **When** converted, **Then** the whole input is
   treated as Bijoy (no ignore marker in Phase 1) and the docs state this clearly.

---

### User Story 5 - Land unit conversion (Priority: P2)

A real-estate app converts between local land units (katha, bigha, decimal/shotangsho, ojutangsho,
chotak, kani, gonda, acre) and metric/imperial units, with region-aware values where units differ.

**Why this priority**: Land deals are a major part of BD life; inconsistent conversions cause real
financial disputes.

**Independent Test**: Convert reference values (e.g. 5 katha) and match published equivalents.

**Acceptance Scenarios**:

1. **Given** 5 katha, **When** converted, **Then** `sqft: 3600`, `decimal: 8.26`, `sqm: 334.45`
   (2-decimal rounding), plus all other supported units.
2. **Given** a unit whose value varies by region (e.g. kani), **When** no region is given, **Then**
   the standard value is used and the response states the region assumed and that values vary.
3. **Given** a request for the unit list, **Then** every unit is returned with Bangla and English
   names, its square-foot equivalent, and region variants.
4. **Given** an unknown unit or non-positive value, **Then** a 400 error lists valid units.

---

### User Story 6 - Format validators (Priority: P3)

A KYC-adjacent or HR app checks that an NID, vehicle registration plate, TIN, BIN, or postcode is
*well-formed* before submission — without the service ever learning or storing whose it is.

**Why this priority**: Useful and cheap, but less universally needed than Stories 1–5.

**Independent Test**: Submit reviewed valid/invalid examples for each identifier type.

**Acceptance Scenarios**:

1. **Given** a 10-, 13-, or 17-digit NID (Latin or Bangla digits), **When** validated, **Then**
   `valid: true` with the detected format; any other length or non-digit input is `valid: false`.
2. **Given** a 17-digit NID whose first 4 digits are not a plausible birth year, **Then**
   `valid: false` with reason.
3. **Given** a plate like `ঢাকা মেট্রো-গ ১১-২২৩৩`, **When** validated, **Then** `valid: true` with
   parsed area, metro flag, class letter, series, and number.
4. **Given** a TIN, BIN, or postcode, **When** validated, **Then** length/format validity is returned;
   a postcode additionally reports whether it exists in the postcode dataset.
5. **Given** any validator call, **Then** the input is not persisted or logged.

---

### User Story 7 - Emergency & government hotlines (Priority: P3)

A health or civic app shows verified national hotline numbers, filterable by category, in both
languages.

**Why this priority**: Small dataset, high social value, but must be verified before launch.

**Independent Test**: Fetch all hotlines and confirm each has a number, bilingual name, category,
official source, and a last-verified date.

**Acceptance Scenarios**:

1. **Given** a request for all hotlines, **Then** each entry includes `number`, `name_en`, `name_bn`,
   `category`, `source`, and `last_verified`.
2. **Given** `category=emergency`, **Then** only emergency hotlines are returned (including 999).
3. **Given** an unknown category, **Then** a 400 error lists valid categories.

---

### User Story 8 - Proverbs, riddles & fun content (Priority: P4)

A student or bot developer fetches a random Bangla proverb with meaning, a riddle with answer, a quiz
question by topic, a traditional dish by region, or an "on this day" Bangladesh history event.

**Why this priority**: Drives beginner adoption and community excitement; no business dependency.

**Independent Test**: Each endpoint returns valid, bilingual-where-applicable content; repeated
calls return varied items.

**Acceptance Scenarios**:

1. **Given** a random proverb request, **Then** a proverb with `text_bn`, `meaning_bn`, and
   `meaning_en` is returned.
2. **Given** a riddle request, **Then** question and answer are returned.
3. **Given** `topic=liberation-war`, **Then** a quiz question with options and the correct answer
   is returned; an unknown topic returns 400 listing valid topics.
4. **Given** today's date, **When** today-in-history is requested, **Then** events for that day/month
   are returned, or an empty list (not an error) when none exist.
5. **Given** an optional `seed`, **Then** the same item is returned for the same seed (reproducible).

---

### User Story 9 - Discoverable docs & try-it playground (Priority: P2)

A developer lands on the docs site, reads every endpoint with examples in English, and tries any
endpoint in the browser without writing code.

**Why this priority**: Without docs the API will not be adopted; it ships alongside Story 1.

**Independent Test**: A new developer can find and successfully call any Phase 1 endpoint from the
docs page in under 2 minutes.

**Acceptance Scenarios**:

1. **Given** the docs page, **Then** every Phase 1 endpoint is listed with parameters, example
   request, and example response.
2. **Given** the machine-readable API description, **Then** it validates and matches actual
   responses (verified by automated tests).

---

### Edge Cases

- Bangla digits, mixed Bangla/Latin digits, and surrounding whitespace in any numeric input.
- Unicode normalisation differences (e.g. `য়` as one code point vs. `য + ়`) in search and slugs.
- Alternate spellings of place names (Cumilla/Comilla, Chattogram/Chittagong, Barishal/Barisal,
  Jashore/Jessore, Bogura/Bogra) must resolve in search; slugs use current official spellings.
- Postcodes shared by multiple post offices; post offices whose district differs from naming.
- Coordinates outside Bangladesh for nearest lookup → 400 (not a misleading nearest result).
- Number-to-words for 0, negative numbers, decimals, and values ≥ 1 crore crore (define max).
- Bangla calendar on leap years (Falgun length) and dates before 1971 / far future.
- Bijoy text containing characters with no Unicode equivalent; empty input; very long input.
- Phone numbers with country code but missing leading zero (`8801712…`, `+880 1712…`), landlines.
- Requests exceeding rate limits → 429 with `Retry-After`.
- Unknown routes → 404 envelope; wrong method → 405 envelope.

## Requirements *(mandatory)*

### Functional Requirements

**Cross-cutting**

- **FR-001**: Every success response MUST use the envelope `success`, `data`, `meta`, where `meta`
  includes `source` and `last_updated`.
- **FR-002**: Every error MUST use the error envelope with a stable machine-readable `code`, a
  human-readable `message`, and the correct HTTP status.
- **FR-003**: Every named entity MUST include `name_en` and `name_bn`.
- **FR-004**: Every numeric input MUST accept both Latin and Bangla digits.
- **FR-005**: All endpoints MUST be under `/v1` and callable cross-origin from browsers.
- **FR-006**: The service MUST apply a per-client burst rate limit and return 429 with retry
  guidance when exceeded.
- **FR-007**: The service MUST publish a machine-readable API description and a human-readable,
  try-it-in-browser docs page covering every Phase 1 endpoint.
- **FR-008**: Validator and converter inputs MUST NOT be stored or logged.
- **FR-009**: List endpoints MUST support pagination where a list can exceed 100 items.

**Geo (US1)**

- **FR-010**: Provide all 8 divisions, 64 districts, every upazila, and every union with bilingual
  names, slugs, parent references, and coordinates where available.
- **FR-011**: Provide child listings at each level filtered by parent slug.
- **FR-012**: Provide postcode lookup returning post office(s), upazila/thana, and district.
- **FR-013**: Provide search across all levels in English and Bangla, tolerant of alternate
  historical spellings, returning level and parent chain.
- **FR-014**: Provide nearest-district (and upazila where data exists) lookup for coordinates
  within Bangladesh.

**Bangla toolkit (US2)**

- **FR-020**: Convert integers 0 to 999,999,999,999,999 (inclusive) and up to 2 decimal places to
  Bangla words using the lakh/crore system.
- **FR-021**: Convert monetary amounts to "taka … paisa" words.
- **FR-022**: Convert digits between Latin and Bangla in arbitrary text.
- **FR-023**: Format numbers with South Asian grouping in Bangla or Latin digits.
- **FR-024**: Convert Gregorian dates to the revised official Bangla calendar (day, month, year,
  weekday, season) for dates from 1971-01-01 to 2100-12-31.
- **FR-025**: Return Bangla ordinals for 1–100 at minimum.
- **FR-026**: Produce URL-safe slugs from Bangla text (romanised form).
- **FR-027**: Transliterate romanised phonetic input to Bangla using a widely-recognised phonetic
  scheme.

**Phone (US3)**

- **FR-030**: Validate BD mobile numbers in all common input formats and return validity, reason,
  normalised local form, international (E.164) form, and original operator.
- **FR-031**: Support bulk validation of up to 100 numbers per request.

**Bijoy (US4)**

- **FR-040**: Convert Bijoy (SutonnyMJ-compatible) text to Unicode and Unicode to Bijoy.
- **FR-041**: Accept input up to 100 KB per request; reject larger input with 413.

**Land (US5)**

- **FR-050**: Convert between all supported land units and sqft, sqm, decimal, acre, and hectare.
- **FR-051**: Support an optional region for units whose size varies by region and state the region
  used in every response.
- **FR-052**: List all supported units with bilingual names and region variants.

**Format validators (US6)**

- **FR-060**: Validate NID format (10, 13, or 17 digits; 17-digit begins with a plausible birth year).
- **FR-061**: Validate and parse vehicle registration plates in Bangla (and Latin transliteration).
- **FR-062**: Validate TIN (12 digits) and BIN formats.
- **FR-063**: Validate postcode format (4 digits) and report dataset existence.

**Hotlines (US7)**

- **FR-070**: List verified national hotlines with bilingual names, category, source, and
  last-verified date; filter by category.

**Fun (US8)**

- **FR-080**: Serve random proverbs (with meaning), riddles (with answer), quiz questions by topic,
  traditional dishes by region, and today-in-history events; support an optional seed.
- **FR-081**: All fun content MUST be traditional or public-domain and record its source.

### Key Entities *(include if feature involves data)*

- **Division / District / Upazila / Union**: administrative areas; slug, bilingual names, parent
  slug, optional coordinates, alternate spellings.
- **PostOffice**: postcode, bilingual post-office name, upazila/thana, district.
- **OperatorPrefix**: 3-digit mobile prefix → operator name (bilingual).
- **LandUnit**: slug, bilingual names, sqft equivalent, region variants.
- **Hotline**: number, bilingual name, category, source, last_verified.
- **Proverb / Riddle / QuizQuestion / Dish / HistoryEvent**: bilingual content records with source.
- **DatasetMeta**: per-dataset source, licence, retrieved date, last_updated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can build a working 4-level BD address picker using only the API and docs in
  under 30 minutes.
- **SC-002**: 100% of reviewed golden cases pass for number-to-words, taka-in-words, Bangla date,
  Bijoy ↔ Unicode, land conversion, and phone validation.
- **SC-003**: Geo dataset counts match the official totals (8 divisions, 64 districts, and the
  upazila/union totals recorded in research) with zero orphaned records.
- **SC-004**: 95% of requests complete in under 200 ms as measured from Dhaka.
- **SC-005**: Every Phase 1 endpoint is documented and callable from the docs page; zero
  undocumented endpoints.
- **SC-006**: Monthly running cost stays at $0 (free tier) at up to 100,000 requests/day.
- **SC-007**: Zero personal identifiers appear in logs (verified by log audit before launch).
- **SC-008**: Within 4 weeks of launch, at least 5 external contributors submit data corrections or
  features.

## Assumptions

- Project name "Desh API" and domain are placeholders; renaming does not affect scope.
- Phase 1 is anonymous (no API keys); daily quotas and keys are Phase 2. Phase 1 uses a per-IP burst
  limit only.
- English docs ship first; Bangla docs translation is a follow-up.
- Bijoy support targets the SutonnyMJ family mapping; other legacy encodings are out of scope.
- Transliteration follows the Avro Phonetic convention because it is what most BD users type.
- Standard land unit values follow Dhaka/national convention (1 katha = 720 sq ft); regional
  variants are documented, not exhaustive.
- Upazila coordinates may be incomplete in the initial dataset; nearest lookup falls back to district.
- Hotline data is limited to national numbers in Phase 1; district-level numbers come later.
- Existing open datasets (geo, postcodes, Bijoy mappings) are reused where licences permit, with credit.

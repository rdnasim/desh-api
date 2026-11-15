# Feature Specification: Bangla Mock Data Generator

**Feature Branch**: `004-mock-data`

**Created**: 2026-11-15

**Status**: Implemented

**Input**: User description: "Phase 2, module 15 of docs/vision.md — a Bangla mock data generator:
realistic, synthetic Bangladeshi people and addresses for testing apps."

## Clarifications

### Session 2026-11-15

Decisions taken on the maintainer's behalf (each can be overridden):

- Q: Which records? → A: People (bilingual name, gender, date of birth, mobile number, email, NID,
  address) and addresses on their own. Companies, bank accounts and the like are out of scope.
- Q: How are names made realistic without describing real people? → A: Common given names and
  family names, combined at random within one naming tradition (Muslim, Hindu, Buddhist,
  Christian), so "Das" is not paired with "Abdullah". The tradition is chosen with the 2022 census
  shares and is **never returned**: a fake person's religion is not useful test data and is
  sensitive (constitution II).
- Q: Can numbers collide with real people? → A: Mobile numbers and NIDs are random but
  format-valid, so a generated number may belong to someone. Responses say so, and say never to
  call, text or look them up. Emails use `example.com`, which can never receive mail (RFC 2606).
- Q: Repeatable output? → A: `seed` gives the same records every time (and is cacheable); without
  a seed, every call differs and is not cached, like `/v1/fun/*/random`.
- Q: Limits? → A: 1–100 records per request (default 10).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fake people for testing (Priority: P1) 🎯 MVP

A developer filling a staging database or a demo screen asks for 50 Bangladeshi people and gets
believable bilingual names, phone numbers, NIDs and addresses that pass the API's own validators.

**Independent Test**: Request 100 people; every phone passes `/v1/phone/validate`, every NID passes
`/v1/validate/nid`, every address's district belongs to its division.

**Acceptance Scenarios**:

1. **Given** `count=50`, **Then** 50 people are returned, each with `name_en`, `name_bn`, gender,
   date of birth, phone, email, NID and address.
2. **Given** the same `seed` twice, **Then** the output is identical; **given** no seed, two calls
   differ.
3. **Given** `gender=female`, **Then** every person is female, with a female given name (and no
   male-only family name such as "Uddin").
4. **Given** `district=cumilla`, **Then** every address is in Cumilla.
5. **Given** `count=0`, `count=101` or an unknown district, **Then** 400.

---

### User Story 2 - Fake addresses (Priority: P2)

A developer testing an address form needs addresses that are consistent: the upazila is in the
district, the district in the division, and the postcode is a real postcode of that district.

**Acceptance Scenarios**:

1. **Given** `count=20`, **Then** 20 addresses with bilingual first line, upazila, district,
   division and postcode, all consistent with the geo data.
2. **Given** `district=…`, **Then** addresses are only in that district.

### Edge Cases

- Districts where no post office has a matching upazila (postcode still from the district).
- Names whose Bangla spelling uses nukta letters (য়, ড়): stored NFC-normalised.
- Seeds in Bangla or with spaces.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Generate 1–100 synthetic people per request with bilingual names, gender, date of
  birth (ages 18–70 relative to a fixed reference year), mobile number, `example.com` email, 10-digit
  NID and an address.
- **FR-002**: Generate 1–100 synthetic addresses consistent with the geo data.
- **FR-003**: `seed` makes output deterministic; seeded responses are cacheable, unseeded `no-store`.
- **FR-004**: Filters: `gender` (people), `district` (both).
- **FR-005**: Generated phones and NIDs pass the API's own validators.
- **FR-006**: Every response carries a disclaimer that the data is synthetic and that numbers may
  coincide with real ones.
- **FR-007**: Never return religion or any field inferred from it.

### Privacy note (constitution II)

All records are synthetic: names are combined at random from lists of common names, numbers are
random. Nothing comes from a real person, nothing sent is stored.

### Key Entities

- **MockName**: name_en, name_bn, kind (`given` | `family`), gender (for given names, and for
  gendered family names), tradition.

## Success Criteria *(mandatory)*

- **SC-001**: 100% of generated phones and NIDs pass the API's validators (property test over
  1,000 records).
- **SC-002**: 100% of generated addresses are geo-consistent.
- **SC-003**: Same seed → byte-identical response.

## Assumptions

- Name lists are compiled by contributors from common names; they are facts about naming, not data
  about people, and are released CC BY 4.0. Native-speaker review of Bangla spellings is welcome.
- Tradition weights: BBS Population and Housing Census 2022 (Muslim 91.04%, Hindu 7.95%, Buddhist
  0.61%, Christian 0.30%).

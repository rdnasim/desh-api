# Research: Bangla Mock Data Generator

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-15

## M1. Names

- **Decision**: A contributor-compiled list of common given and family names in four naming
  traditions, each with English and Bangla spelling. Family names that are used by one gender only
  (Akter, Begum, Khatun for women; Uddin, Mia for men) carry a `gender`.
- **Rationale**: Common names are facts about naming practice, not personal data; no list is
  copied from any directory of real people. Pairing within one tradition keeps names believable.
- **Alternatives**: Faker's `bn_BD` locale (MIT) has a small name list but mixes traditions and
  has few Bangla spellings.

## M2. Tradition weights

- **Decision**: Muslim 91.04, Hindu 7.95, Buddhist 0.61, Christian 0.30 (weights, renormalised).
- **Source**: BBS Population and Housing Census 2022, reported by Prothom Alo
  (https://en.prothomalo.com/bangladesh/at87h01ocn) and The Daily Star.
- The chosen tradition is internal only and never returned.

## M3. Numbers

- **Mobile**: `01` + a prefix from `data/phone/prefixes.json` + 8 random digits; passes
  `/v1/phone/validate`. No reserved test range exists in Bangladesh, so a number may be real:
  stated in the disclaimer.
- **NID**: 10 digits, first digit 1–9 (smart-card format); passes `/v1/validate/nid`.
- **Email**: ASCII slug of the name + 2 digits `@example.com` (RFC 2606, cannot receive mail).
- **Date of birth**: uniform over 1956-01-01 … 2008-12-31 (ages 18–70 in 2026), fixed so a seed
  stays repeatable across years.

## M4. Addresses

- **Decision**: Pick a district (uniform, or the requested one), an upazila in it, and a postcode
  from that district's post offices, preferring one whose `upazila` matches. First line: house and
  road numbers ("House 12, Road 5" / "বাড়ি ১২, রোড ৫"). Post offices have no Bangla names in the
  data, so the postcode is returned as a number only.

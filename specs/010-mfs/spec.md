# Feature Specification: Mobile Financial Services (MFS)

**Feature Branch**: `010-mfs`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Phase 2 Module 11 of docs/vision.md: Mobile Financial Services (MFS) in Bangladesh — providers (bKash, Nagad, Rocket, Upay, Tap), USSD codes, cash-out rates, fee calculator, and provider comparison."

## Clarifications

### Session 2026-11-16

- Q: What providers are included? → A: The primary Bangladesh Bank-licensed MFS operators: bKash (BRAC Bank), Nagad (Bangladesh Post Office), Rocket (Dutch-Bangla Bank), Upay (UCB), and TAP (Trust Axiata).
- Q: How are fees structured? → A: Fees vary by transaction type (`cash-out`, `send-money`), channel (`app`, `ussd`, `atm`, `priyo_agent`), and tier. The calculator computes exact fees, VAT inclusion, net cost, and allows comparing charges across all providers for any given amount.
- Q: What about digits? → A: Both Latin digits (`5000`) and Bangla digits (`৫০০০`) are accepted for calculation amounts, consistent with the rest of Desh API.
- Q: Where is data sourced? → A: Official schedule of charges published by each MFS provider and Bangladesh Bank MFS regulations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List MFS Providers and USSD Codes (Priority: P1) 🎯 MVP

A developer building an e-commerce, donation, or fintech app needs reference data on all licensed MFS providers, including their official names (Bangla & English), USSD shortcodes, helplines, and parent banks.

1. `GET /v1/mfs/providers` returns all supported MFS providers with their slugs, bilingual names, parent organization, USSD code, helpline, and website.
2. `GET /v1/mfs/providers/{provider}` returns full details for a single provider, including standard charge rates and limits.
3. `GET /v1/mfs/ussd` provides a quick lookup list of USSD codes for dialing.

### User Story 2 - Transaction Fee Calculator (Priority: P2)

A user or checkout system needs to know the exact fee for cashing out or sending money.

1. `GET /v1/mfs/charges?provider=bkash&amount=5000&action=cash-out&channel=app` returns the exact fee (`Tk 87.50` for standard app, or notes priyo agent rate `Tk 74.50`), the total cost (`Tk 5,087.50`), the percentage rate, and explanatory breakdown.
2. Accepts `amount` in Latin (`5000`) or Bangla (`৫০০০`) digits.
3. Supports `action=cash-out` and `action=send-money`, across channels `app`, `ussd`, `atm`.

### User Story 3 - MFS Provider Comparison (Priority: P3)

A consumer or financial planner wants to know which MFS provider is cheapest for a specific transaction (e.g., cashing out 10,000 Tk).

1. `GET /v1/mfs/compare?amount=10000&action=cash-out&channel=app` evaluates all providers for that transaction and returns them ranked by lowest fee first.
2. Each item shows provider name, calculated fee, total amount, and applicable conditions/notes.

---

## Edge Cases

- Amount ≤ 0 or non-numeric: 400 Bad Request with descriptive error.
- Invalid provider slug: 404 Not Found listing available provider slugs.
- Unknown channel/action combination (e.g. `atm` for `send-money`): 400 Bad Request with permitted combinations.
- Extreme amounts exceeding daily/monthly Bangladesh Bank limits: calculator provides warning flag `exceeds_single_transaction_limit: true` without failing.

---

## Requirements *(mandatory)*

- **FR-001**: Every provider entry must cite the official source URL and verification date in metadata.
- **FR-002**: Every provider must include `name_en`, `name_bn`, `parent_en`, `parent_bn`, and `ussd_code`.
- **FR-003**: Both English and Bangla digits must be parsed cleanly in query parameters.
- **FR-004**: Calculator responses must use the standard envelope `{ success: true, data: {...}, meta: {...} }`.

---

## Success Criteria *(mandatory)*

- **SC-001**: 100% of licensed major providers (bKash, Nagad, Rocket, Upay, Tap) are accurately represented.
- **SC-002**: Unit tests verify exact fee calculations against official published tariff tables (e.g. bKash 1.75% / 1.49% app, Nagad 1.149% app, Rocket 1.67% app / 0.9% ATM).
- **SC-003**: OpenAPI documentation is automatically updated and interactive docs reflect all new endpoints.

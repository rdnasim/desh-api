# Feature Specification: Gold Price & Zakat

**Feature Branch**: `007-gold-zakat`

**Created**: 2026-11-15

**Status**: Implemented

**Input**: User description: "Phase 2, module 12 of docs/vision.md — gold price (22K/21K/18K/
traditional, per vori and gram; 1 vori = 11.664 g) and zakat."

## Clarifications

### Session 2026-11-15

Decisions taken on the maintainer's behalf (each can be overridden):

- Q: New infrastructure (database, scheduled job)? → A: Not needed for current prices: the Worker
  reads BAJUS's price page on request, and Cloudflare caches that fetch for 30 minutes. Price
  history (which would need storage) is out of scope.
- Q: Which nisab? → A: Both are reported. Default `basis=silver` (52.5 vori), the threshold
  Islamic Foundation's fitra guidance refers to; `basis=gold` (7.5 vori) on request. Scholars differ;
  the disclaimer says so.
- Q: Which price values the nisab? → A: 22K by default (`karat` to change).
- Q: BAJUS unreachable or redesigned? → A: 503 `upstream_unavailable`, never stale or guessed
  prices.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Today's gold and silver prices (Priority: P1) 🎯 MVP

A jewellery shop app or news widget shows today's BAJUS prices.

1. `GET /v1/gold/prices` returns gold and silver per gram and per vori for 22K, 21K, 18K and
   traditional, with the effective date of the BAJUS list.
2. If BAJUS cannot be read or its page changed, 503 `upstream_unavailable`.

### User Story 2 - Zakat (Priority: P1)

A finance or Islamic app computes zakat on net wealth.

1. `GET /v1/zakat?wealth=…` returns the nisab (grams and taka), whether zakat is due, and 2.5% of
   wealth if so, plus the result under the other basis.
2. `basis`, `karat` choose the nisab; bad values or negative wealth → 400.

## Requirements *(mandatory)*

- **FR-001**: Prices only from BAJUS's current list; `meta.last_updated` = its effective date.
- **FR-002**: Per vori = per gram × 11.664, rounded to the taka.
- **FR-003**: Nisab 7.5 vori gold / 52.5 vori silver; rate 2.5%; due when wealth ≥ nisab.
- **FR-004**: Every zakat response carries a disclaimer.

## Success Criteria *(mandatory)*

- **SC-001**: Prices match the BAJUS page exactly (parser test on a saved copy).
- **SC-002**: A BAJUS outage yields 503 within one request, never a wrong price.

## Assumptions

- Prices are facts announced publicly by BAJUS and republished daily by the press; credited to
  BAJUS (research G1).

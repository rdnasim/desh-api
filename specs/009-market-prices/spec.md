# Feature Specification: Market Prices

**Feature Branch**: `009-market-prices`

**Created**: 2026-11-15

**Status**: Implemented (exchange rates blocked)

**Input**: User description: "Phase 2, module 10 of docs/vision.md — market prices: commodity
prices from the Trading Corporation of Bangladesh, exchange rates, fuel."

## Clarifications

### Session 2026-11-15

Decisions taken on the maintainer's behalf (each can be overridden):

- Q: How are TCB prices obtained? → A: Live, like gold: the Worker reads TCB's listing page,
  takes the newest daily spreadsheet (.xlsx) and parses it, with Cloudflare caching both and the
  last good list kept in Workers KV (the store approved for gold) for regions TCB refuses.
- Q: English names? → A: TCB's list is Bangla-only. `data/market/commodities.json` maps each TCB
  item (Bangla name + unit, exactly as written) to a slug, English name, English unit and category.
  An item TCB adds later is still returned, without slug or English name, until added.
- Q: Fuel prices? → A: A monthly dataset from the Energy and Mineral Resources Division notices
  (prices change at most monthly), not a live read.
- Q: Exchange rates? → A: Not in this feature: Bangladesh Bank's site answers automated requests
  with a captcha. Tracked as a follow-up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Today's Dhaka retail prices (Priority: P1) 🎯 MVP

A news widget, shopping or budgeting app shows today's prices of essentials.

1. `GET /v1/market/prices` returns TCB's newest list: date, serial, reference, and for each item
   today's min–max price, a week/month/year ago and TCB's % changes, with English and Bangla names.
2. `category=` and `q=` (English or Bangla) filter.
3. Items TCB lists as 0–0 have `price: null`.
4. TCB unreachable: last list read within 7 days, marked `last_known`; else 503.

### User Story 2 - Fuel prices (Priority: P2)

`GET /v1/fuel/prices` returns diesel, octane, petrol and kerosene per litre for the latest month
(or `month=YYYY-MM`), citing the notice; unknown month → 404 listing available months.

## Requirements *(mandatory)*

- **FR-001**: Prices exactly as in TCB's spreadsheet; `meta.last_updated` = list date.
- **FR-002**: Every catalogued item has English and Bangla names and units.
- **FR-003**: Fuel prices only from a cited government notice.

## Success Criteria *(mandatory)*

- **SC-001**: Parser reproduces all 60 items of the 12 Nov 2026 list (test on the real file).
- **SC-002**: 100% of that list's items match the catalog.

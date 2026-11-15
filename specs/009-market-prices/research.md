# Research: Market Prices

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-15

## M1. TCB daily retail prices

- Listing: https://tcb.gov.bd/pages/daily-rmps — a table of daily lists, newest first, each with a
  date (m/d/yyyy) and a spreadsheet on government object storage
  (`objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/…/office-tcb/…/<uuid>.xlsx`). No captcha;
  tcb.gov.bd has no robots.txt.
- Spreadsheet (12 Nov 2026, serial ২৮২, ref নং-২৬.০৫.০০০০.০১৭.৩১.০১.২৬-৯১০): heading with the
  date ("তারিখঃ ১২-১১-২০২৬"), then columns: item, unit, today min/max, 1 week ago min/max,
  1 month ago min/max, monthly % change, 1 year ago min/max, yearly % change. Category headings
  have no unit; rice has none. 60 items, then "markets surveyed", a changed-items summary and a
  distribution list (ignored). 0–0 means not available; year % is `#DIV/0!` when the year-ago
  price is 0. TCB's % change is on mid prices.
- Parsed without new dependencies: `src/lib/xlsx.ts` (zip via `DecompressionStream('deflate-raw')`,
  shared strings, first sheet). Verified against openpyxl on the same file.
- Reached from Cloudflare's edge (`wrangler dev --remote`, 2026-11-15); the KV fallback covers
  regions that may be refused, as for gold.
- Encoding note: "সিরিয়াল" appears with either encoding of য়; matching is loose there and the
  catalog match uses `normalizeForSearch`.

## M2. Fuel prices

- Energy and Mineral Resources Division memo 28.00.0000.000.026.35.0116.24.499, 29 Oct 2026
  (linked from bpc.gov.bd "জ্বালানি তেলের মূল্য নির্ধারণ সংক্রান্ত গেজেট"): November 2026 prices
  unchanged from the 20 Sep 2026 notification (…26.215): diesel 135.00, octane 165.00, petrol
  160.00, kerosene 155.00 Tk/litre, in force from 1 Nov 2026.

## M3. Exchange rates (blocked)

Bangladesh Bank (bb.org.bd) serves a captcha to automated requests (seen for its routing and
branch pages, 2026-11-15). Options: a maintainer download, or another official publisher.

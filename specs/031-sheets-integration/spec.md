# Feature Specification: 031-sheets-integration (Google Sheets & Excel Add-ons)

**Feature Branch**: `031-sheets-integration`  
**Status**: Planned  

---

## 1. Overview

Accountants, finance managers, supply chain operators, and researchers in Bangladesh spend countless hours in Google Sheets and Excel manually converting numbers into Bangla words for checks and vouchers, calculating income taxes across fiscal years, converting land decimals to katha/bigha, and verifying bank routing numbers.

This integration delivers custom spreadsheet functions directly into Google Sheets and Microsoft Excel.

---

## 2. Custom Functions

- `=DESH_TAKA_WORDS(amount)`: Converts numeric taka amounts to formal Bangla words with paisa (e.g. `১,২৫০.৫০` → `এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা`).
- `=DESH_NUM_WORDS(number)`: Converts any integer or decimal to Bangla words.
- `=DESH_INCOME_TAX(income, [year], [category])`: Calculates progressive personal income tax under Finance Acts.
- `=DESH_LAND_CONVERT(value, from_unit, to_unit)`: Converts land units (decimal, katha, bigha, sqft, acre).
- `=DESH_GOLD_PRICE(karat, [unit])`: Fetches today's live BAJUS gold price per vori or gram.
- `=DESH_POSTCODE(upazila_or_area)`: Returns official Bangladesh Post Office postal codes.

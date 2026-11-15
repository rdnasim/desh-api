# Research: Banks, Branches & Routing Numbers

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-15

## B1. Branch list (authoritative)

- **Source**: Bangladesh Bank, Statistics Department, Banking Statistics Division — branch list
  "as on 31st August, 2026", https://www.bb.org.bd/econdata/bs/geo_bank.pdf (Excel export,
  156 pages, created 2026-09-06). The site serves a captcha to scripts, so the maintainer downloaded
  it in a browser on 2026-11-15. It is not committed (cited by URL; `data/**/*.pdf` is ignored).
- **Columns**: bank name, bank ID, branch name, branch ID (bank ID + 4 digits), division,
  district, thana. **No routing numbers, no SWIFT codes.**
- **Parsing**: rows are cut at the running serial number (1–11,533), which must be followed by a
  bank name and a 2–3 digit bank ID, so wrapped lines and bank IDs inside a row cannot split a
  record. Result: 11,533 rows, 61 banks, all branch IDs unique and prefixed by their bank ID.
- **Linking**: districts matched to `data/geo` (8 spelling variants mapped, e.g. JAYPURHAT,
  BOGRA); thanas matched to upazilas where the name agrees (5,913 branches). City thanas
  (KOTWALI_*, police-station areas) keep only `thana`.
- **Open question**: the list still shows First Security, Social Islami, EXIM, Union and Global
  Islami as separate banks. Published as Bangladesh Bank gives it.

## B2. Routing numbers (secondary, maintainer's choice)

- **Source**: https://www.bddata.org/all-banks/ (Bangladesh Barta), whose table loads a published
  Google Sheet CSV (District, Bank, Branch, RoutingNo; 10,032 rows; no date). The page credits
  "Data source: Bangladesh Bank". Only `RoutingNo` is used; every other field comes from B1.
- **Licence**: the site footer says "all rights reserved" and robots.txt sets
  `Content-Signal: search=yes, ai-train=no, use=reference`. The maintainer decided on 2026-11-15
  to use the routing numbers with attribution. Routing numbers are facts issued by Bangladesh
  Bank, but the table is their compilation; **follow-up: ask bddata.org for written permission**
  (contact on their site), or replace with Bangladesh Bank's routing list when it can be
  downloaded (https://www.bb.org.bd/en/index.php/financialactivity/routingno).
- **Quality**: numbers were stored as integers, so 3,126 lost a leading zero (restored, and proved
  correct by the check digit). Bank names are pre-2023 ("Ltd."), and some banks appear under old
  names: The Farmers Bank (now Padma), NRB Global (Global Islami), Standard Bank (Standard
  Islami), NRB Commercial (NRBC). 35 rows are Bangladesh Bank's own offices and 2 Samabaya Bank,
  neither in B1.

## B3. Check digit

- Solving "Σ wᵢ·dᵢ ≡ 0 (mod 10)" over all 10,032 numbers (separately mod 2 and mod 5) gives a
  unique solution: weights **5, 7, 1** repeating over the 9 digits, sum divisible by 10 (the
  shape of the US ABA scheme, which uses 3, 7, 1). All 10,032 numbers pass; the textbook 3-7-1,
  7-3-1, 1-3-7 and Luhn variants each pass only ~20%.
- Structure seen in the data: bank code (3) + district code (2) + branch (3) + check digit (1);
  each bank has exactly one bank code, and each district code maps to one district (except code
  13: Chandpur 96, Feni 1).
- Not from a published Bangladesh Bank specification; stated as inferred in docs and meta.

## B4. Matching

| Step | Rows |
|---|---|
| Exact (bank + district + normalised branch name) | 6,140 |
| Close spelling (one candidate ≥ 0.88 similar, ≥ 0.1 ahead; routing district code agrees) | 1,972 |
| No match (renamed, closed or new branches) | 1,883 |
| Bank not in B1 | 37 |
| Branches dropped for two conflicting numbers | 16 |
| **Branches with a routing number** | **8,080 of 11,533** |

- A sample of 25 close-spelling matches were all the same branch (BADAMTALI/BADAMTOLI,
  SERAJGANJ/SIRAJGANJ, GAZIPUR COURT BUILDING/BLDG.); 0 of 1,972 disagree on district code.
- Four banks newer than the table have no routing numbers: Bengal Commercial, Citizens,
  Community Bank Bangladesh, Probashi Kallyan.

## B5. Importer

`scripts/import/banks.py` (Python + pypdf, maintainer tool, not run in CI) rebuilds
`data/banks/*.json` from the two files; rules above are in its docstring. Python is used only
because reading the PDF would otherwise need a new Node dependency.

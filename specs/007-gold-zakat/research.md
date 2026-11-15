# Research: Gold Price & Zakat

**Feature**: [spec.md](./spec.md) | **Date**: 2026-11-15

## G1. Prices

- **Source**: Bangladesh Jewellers Association, https://www.bajus.org/gold-price — "Gold And
  Silver Rate" table (22K, 21K, 18K "cadmium (hallmarked)" and traditional; gold and silver; BDT
  per gram) and a dated PDF of the list (`/storage/files/shares/Gold Price/14-Nov-2026.pdf`), whose
  date is the effective date. No captcha.
- **robots.txt**: `User-agent: * Allow: /` with Cloudflare's content signals `search=yes,
  ai-train=no, use=reference`. Those signals govern AI use of the content; this API republishes
  the day's price facts with attribution, as Bangladeshi newspapers do daily. Credited in
  `meta.source`.
- **Load on BAJUS**: Cloudflare caches the upstream fetch for 30 minutes (`cf.cacheTtl`), so BAJUS
  sees at most a few requests per hour per data centre.
- **Per vori**: 1 vori (bhori, tola) = 11.664 g (vision §5). Computed, rounded to the taka; BAJUS's
  own per-vori figures may round differently.

## G2. Zakat

- Nisab: 7.5 bhori of gold or 52.5 bhori of silver, held for a lunar year; zakat 2.5% (Jugantor,
  24 Feb 2026, https://www.jugantor.com/islam-life/1069930). Islamic Foundation's fitra guidance
  ties the obligation to the value of 52.5 tola of silver (Jugantor, 25 Feb 2026; BSS
  https://www.bssnews.net/bangla/national/286239).
- In grams: 87.48 g gold, 612.36 g silver.
- Scholars differ on the basis and on valuing assets; the API reports both bases and leaves the
  net-wealth calculation to the caller.

## G3. Failure handling

The parser requires all eight prices and the dated PDF link; any change to the page makes it
throw, which the API reports as 503 rather than guessing. Logged as a structured error (no user
data).

# Contract: Bangla Toolkit (US2)

`meta.source`: `"desh-api Bangla toolkit"`; calendar: `"Bangla Academy revised calendar (2019)"`.

| Method | Path | Query | 200 `data` |
|---|---|---|---|
| GET | `/v1/bangla/num-to-words` | `n` (0 … 999999999999999, ≤ 2 decimals; Latin/Bangla digits) | `{ input, words }` |
| GET | `/v1/bangla/taka-in-words` | `amount` (≥ 0, ≤ 2 decimals) | `{ input, words, taka, paisa }` |
| GET | `/v1/bangla/digits` | `text` (≤ 1000 chars), `to` (`bn`\|`en`) | `{ input, output }` |
| GET | `/v1/bangla/format-number` | `n`, `digits?` (`bn`\|`en`, default `bn`) | `{ input, formatted }` |
| GET | `/v1/bangla/transliterate` | `text` (≤ 1000 chars) | `{ input, output, scheme: "avro-phonetic" }` |
| GET | `/v1/bangla/date` | `date?` (`YYYY-MM-DD`, default today Asia/Dhaka; 1971-01-01…2100-12-31) | `BanglaDate` |
| GET | `/v1/bangla/ordinal` | `n` (1–100) | `{ input, ordinal }` |
| GET | `/v1/bangla/slug` | `text` (≤ 200 chars) | `{ input, slug }` |
| POST | `/v1/bangla/transliterate` | body `{ text }` (≤ 10 KB) | same as GET |

`BanglaDate = { gregorian, day, day_bn, month: {index, name_bn, name_en}, year, year_bn,
weekday: {name_bn, name_en}, season: {name_bn, name_en}, formatted_bn }`

Errors: 400 `invalid_parameter` for non-numeric, negative, too many decimals, out of range, bad date.

Examples:

- `?n=1250` → `{ "input": 1250, "words": "এক হাজার দুইশত পঞ্চাশ" }`
- `taka-in-words?amount=1250.50` → `{ "input": 1250.5, "words": "এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা", "taka": 1250, "paisa": 50 }`
- `format-number?n=1250000` → `{ "input": 1250000, "formatted": "১২,৫০,০০০" }`
- `date?date=2026-12-16` → `{ "day": 1, "day_bn": "১", "month": { "index": 9, "name_bn": "পৌষ", "name_en": "Poush" }, "year": 1433, ... }`
- `ordinal?n=3` → `{ "input": 3, "ordinal": "তৃতীয়" }`

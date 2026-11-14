# Contract: Fun (US8)

Random endpoints accept optional `seed` (string ≤ 64 chars) for reproducible picks;
without `seed` → `Cache-Control: no-store`.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/fun/proverb/random` | `seed?` | `Proverb` | — |
| GET | `/v1/fun/riddle/random` | `seed?` | `Riddle` | — |
| GET | `/v1/fun/quiz` | `topic?`, `count?` (1–10, default 1), `seed?` | `QuizQuestion[]` | 400 unknown topic |
| GET | `/v1/fun/quiz/topics` | — | `{ slug, name_en, name_bn, count }[]` | — |
| GET | `/v1/fun/food/random` | `region?` (district or division slug), `seed?` | `Dish`, or `null` if the region has no GI food listed yet | 400 unknown region |
| GET | `/v1/fun/today-in-history` | `date?` (`MM-DD`, default today Asia/Dhaka and `no-store`) | `HistoryEvent[]` oldest first (may be empty) | 400 bad date |

```json
// GET /v1/fun/proverb/random
{ "id": "proverb-0042", "text_bn": "অতি লোভে তাঁতি নষ্ট", "meaning_bn": "বেশি লোভ করলে ক্ষতি হয়",
  "meaning_en": "Excessive greed leads to ruin.", "source": "Traditional" }
```

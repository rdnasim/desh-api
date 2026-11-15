# Quickstart & Validation: Gold Price & Zakat

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/gold/prices` | today's BAJUS table; `meta.last_updated` = list date |
| 2 | `/v1/zakat?wealth=1000000` | silver nisab ≈ 612.36 g × 22K silver price; zakat 25,000 if due |
| 3 | `/v1/zakat?wealth=1000000&basis=gold` | gold nisab 87.48 g × 22K gold price |
| 4 | `/v1/zakat?wealth=-1` | 400 |

# Contract: Gold & zakat

Responses: `Cache-Control: public, max-age=600` (300 for `last_known`); `meta.last_updated` = BAJUS effective date. `GoldPrices` also has `fetched_at` and `freshness` (`live` | `last_known`).

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/gold/prices` | — | `GoldPrices` | 503 `upstream_unavailable` |
| GET | `/v1/zakat` | `wealth` (≥ 0), `basis?` (silver\|gold), `karat?` (22k\|21k\|18k\|traditional) | `Zakat` | 400, 503 |

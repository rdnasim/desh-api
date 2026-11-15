# Contract: Market prices

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/market/prices` | `category?`, `q?` | `MarketPrices` (cache 1800 s; 300 s if `last_known`) | 400, 503 |
| GET | `/v1/fuel/prices` | `month?` (YYYY-MM) | `FuelPrices` | 400, 404 |

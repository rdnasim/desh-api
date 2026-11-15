# Quickstart & Validation: Market Prices

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/market/prices` | newest TCB list, 60 items, `meta.last_updated` = list date |
| 2 | `/v1/market/prices?category=edible-oil` | 7 oil items |
| 3 | `/v1/market/prices?q=ডিম` | farm eggs |
| 4 | `/v1/fuel/prices` | Nov 2026: diesel 135, octane 165, petrol 160, kerosene 155 |

Monthly: add the new Energy Division notice to `data/market/fuel.json`.

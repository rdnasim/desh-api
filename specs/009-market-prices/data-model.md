# Data Model: Market Prices

- **Commodity** (`data/market/commodities.json`): `slug`, `name_en`, `name_bn` (as TCB writes it),
  `unit_en`, `unit_bn`, `category` (rice, flour, edible-oil, pulses, spices, fish-meat,
  milk-powder, misc).
- **FuelMonth** (`data/market/fuel.json`): `month`, `effective_from`, `prices` {diesel, octane,
  petrol, kerosene} (Tk/litre), `source` {ref, date, url}.
- **MarketPrices** (response): `date`, `market` (dhaka), `serial?`, `reference?`, `file_url`,
  `fetched_at`, `freshness`, `items[]` {`slug?`, `name_en?`, `name_bn`, `unit_en?`, `unit_bn`,
  `category?`, `price`, `week_ago`, `month_ago`, `year_ago` ({min,max} | null),
  `change_month_pct`, `change_year_pct`}.

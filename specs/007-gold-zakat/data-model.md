# Data Model: Gold Price & Zakat (responses only, nothing stored)

- **GoldPrices**: `effective_date`, `currency` (BDT), `gold` and `silver` each with `22k`, `21k`,
  `18k`, `traditional` → {`per_gram`, `per_vori`}, `source_url`.
- **Zakat**: `wealth`, `basis` (silver|gold), `karat`, `price_per_gram`, `nisab_grams`,
  `nisab_value`, `due`, `rate` (2.5), `zakat`, `other_basis` {basis, nisab_value, due},
  `prices_effective_date`.

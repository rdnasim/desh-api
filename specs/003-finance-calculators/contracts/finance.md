# Contract: Finance

Follows `specs/001-phase1-mvp/contracts/common.md` (envelope, errors, caching). Every response has
`meta.disclaimer`. All amounts accept Latin or Bangla digits and Western or lakh/crore grouping.
Results are deterministic, so responses are publicly cacheable.

| Method | Path | Query | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `/v1/finance/tax-years` | — | `TaxYear[]` with bilingual category names | — |
| GET | `/v1/finance/income-tax` | `income` (required, ≥ 0), `tax_year?` (2026-27 … 2030-31; default: the current tax year, whose income year contains today in Bangladesh; such responses are cached 1 hour), `category?` (default `general`; slug, alias or Bangla), `disabled_dependants?` (0–20), `employment_income?` (≤ income), `investment?`, `new_taxpayer?` (`true`/`false`) | `IncomeTax` | 400 bad params, 404 tax year not available (lists available) |
| GET | `/v1/finance/emi` | `principal` (> 0), `rate` (annual %, 0–100), `months` (1–600), `schedule?` | `Emi` | 400 |
| GET | `/v1/finance/vat` | `amount` (≥ 0), `rate?` (default 15, 0–100), `inclusive?` | `Vat` | 400 |
| GET | `/v1/finance/dps` | `monthly` (> 0), `rate` (0–100), `years` (1–50), `compounding?` (`monthly` default, `quarterly`, `half-yearly`, `yearly`) | `Dps` | 400 |
| GET | `/v1/finance/gratuity` | `wage` (monthly, > 0), `years` (0–60), `months?` (0–11) | `Gratuity` | 400 |

`meta.source` names the Finance Act 2026 (tax), VAT & SD Act 2012 s. 15 (VAT), Labour Act 2006
s. 2(10) (gratuity), or the standard formula (EMI, DPS).

Example — `GET /v1/finance/income-tax?income=1000000&tax_year=2027-28`:

```json
{ "success": true,
  "data": { "tax_year": "2027-28", "income_year": { "from": "2026-07-01", "to": "2027-06-30" },
            "category": { "slug": "general", "name_en": "General taxpayer", "name_bn": "সাধারণ করদাতা" },
            "income": 1000000, "employment_exemption": 0, "taxable_income": 1000000,
            "tax_free_threshold": 400000,
            "slabs": [ { "from": 0, "to": 400000, "rate": 0, "taxed": 400000, "tax": 0 },
                       { "from": 400000, "to": 700000, "rate": 10, "taxed": 300000, "tax": 30000 },
                       { "from": 700000, "to": 1100000, "rate": 15, "taxed": 300000, "tax": 45000 }, … ],
            "gross_tax": 75000, "rebate": { "eligible_investment": 0, "amount": 0, "limited_by": "none" },
            "minimum_tax": 5000, "minimum_tax_applied": false, "tax_payable": 75000,
            "effective_rate": 7.5, "unverified": ["…"] },
  "meta": { "source": "Finance Act 2026 …", "last_updated": "2026-11-14", "version": "v1",
            "disclaimer": "…" } }
```

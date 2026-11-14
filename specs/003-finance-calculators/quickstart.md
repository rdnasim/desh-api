# Quickstart & Validation: Finance Calculators

```bash
pnpm dev
pnpm test
```

| # | Request | Expect |
|---|---|---|
| 1 | `/v1/finance/tax-years` | 2026-27 to 2030-31, each with income-year dates, 7 thresholds and sources; 2028-29 on carry a `note` |
| 2 | `/v1/finance/income-tax?income=1000000` | tax year 2027-28, gross tax 75,000, payable 75,000 |
| 3 | `/v1/finance/income-tax?income=420000` | slab tax 2,000 → minimum tax 5,000 applied |
| 4 | `/v1/finance/income-tax?income=1800000&employment_income=1800000` | exemption 5,00,000 (cap), payable 1,30,000 |
| 5 | `/v1/finance/income-tax?income=১০,০০,০০০&category=নারী` | threshold 4,50,000, payable 67,500 |
| 6 | `/v1/finance/income-tax?income=500000&tax_year=2020-21` | 404 listing available tax years |
| 6b | `/v1/finance/income-tax?income=40000000&tax_year=2030-31` | 35% above 3 crore: payable 1,20,80,000, with `note` |
| 7 | `/v1/finance/emi?principal=1000000&rate=9&months=60` | EMI 20,758.36 |
| 8 | `/v1/finance/vat?amount=1150&inclusive=true` | net 1,000, VAT 150 |
| 9 | `/v1/finance/dps?monthly=5000&rate=8&years=5` | total deposit 3,00,000 and maturity > deposit |
| 10 | `/v1/finance/gratuity?wage=30000&years=12&months=8` | 13 years × 45 days = 5,85,000 |

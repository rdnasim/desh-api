# Data Model: Finance Calculators

## TaxCategory (`data/finance/tax-categories.json`)

| Field | Type | Rules |
|---|---|---|
| `slug` | slug | unique: `general`, `woman`, `senior`, `disabled`, `third-gender`, `freedom-fighter`, `july-warrior` |
| `name_en`, `name_bn` | string | |
| `aliases` | string[] | extra accepted inputs (`female`, `65+`, `নারী`, …); unique across categories |

## TaxYear (`data/finance/tax-years.json`)

| Field | Type | Rules |
|---|---|---|
| `tax_year` | string | `YYYY-YY`, second part = first + 1; unique; sort key |
| `income_year` | `{ from, to }` | ISO dates; 1 July of the year before `tax_year` to 30 June |
| `thresholds` | `{ category, amount }[]` | one per TaxCategory (checked at build) |
| `disabled_dependant_extra` | number | added to the threshold per disabled child/dependant |
| `slabs` | `{ width, rate }[]` | after the threshold; `width` > 0 except the last, which is `null`; `rate` in % |
| `minimum_tax` | `{ general, new_taxpayer }` | Taka |
| `employment_exemption` | `{ divisor, cap }` | exempt = min(employment income ÷ `divisor`, `cap`); divisor 3 = one-third |
| `investment_rebate` | `{ income_rate, investment_rate, cap }` | % of taxable income, % of investment, Taka |
| `sources` | `SourceDoc[]` | ≥ 1; `{ ref, date, url?, kind }` with `kind` ∈ `act`, `summary`, `news` |
| `unverified` | string[] | field names resting only on secondary sources; empty once checked against the gazette |
| `note` | string? | caveat for the year, e.g. rates set in advance (2028-29 onward) that a later Act may change |

Records sorted by `tax_year`.

## Responses (not stored)

- **IncomeTax**: `tax_year`, `income_year`, `category` {slug, name_en, name_bn}, `income`,
  `employment_exemption`, `taxable_income`, `tax_free_threshold`, `slabs[]` {`from`, `to` (null
  for the last), `rate`, `taxed`, `tax`}, `gross_tax`, `rebate` {`eligible_investment`, `amount`,
  `limited_by` ∈ `none|income|investment|cap|tax`}, `minimum_tax`, `minimum_tax_applied`,
  `tax_payable`, `effective_rate` (% of income), `unverified[]`, `note?`.
- **Emi**: `principal`, `annual_rate`, `months`, `emi`, `total_payment`, `total_interest`,
  `schedule?[]` {`month`, `payment`, `principal`, `interest`, `balance`}.
- **Vat**: `rate`, `inclusive`, `net`, `vat`, `gross`.
- **Dps**: `monthly_deposit`, `annual_rate`, `years`, `compounding`, `total_deposit`, `interest`,
  `maturity_value`.
- **Gratuity**: `monthly_wage`, `service` {years, months}, `counted_years`, `days_per_year`,
  `daily_wage`, `gratuity`.

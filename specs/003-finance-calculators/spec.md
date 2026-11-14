# Feature Specification: Finance Calculators

**Feature Branch**: `003-finance-calculators`

**Created**: 2026-11-14

**Status**: Implemented

**Input**: User description: "Phase 2, module 13 of docs/vision.md — finance calculators: income tax
for the current fiscal year, VAT, loan EMI, DPS and gratuity. Tax slabs come from the Finance Act,
with a source and a disclaimer on every response."

## Clarifications

### Session 2026-11-14

Decisions taken on the maintainer's behalf (they asked for the recommended path; each can be
overridden):

- Q: Which year label keys the tax rules? → A: The **tax year** (assessment year) as written in the
  Finance Act, e.g. `2027-28`. Every response also states the **income year** it covers (1 July to
  30 June of the previous year), because the two are easily confused (research F2).
- Q: Which tax years ship first? → A: Tax years 2026-27 (income earned Jul 2025 – Jun 2026, returns
  due now) and 2027-28 (income earned in the current fiscal year, Jul 2026 – Jun 2027). Finance Act
  2026 sets both with identical rates. Without a `tax_year`, the latest one is used.
- Q: Which official source is authoritative? → A: The Finance Act as passed and gazetted. Where only
  secondary summaries of the passed Act were available, the data says so (research F1).
- Q: How much of the tax return does the calculator cover? → A: Individual residents only: slabs,
  category thresholds, the extra allowance for parents of a disabled child, the employment-income
  exemption, the investment rebate and minimum tax. Net-wealth surcharge, final-tax incomes,
  non-residents, companies and advance tax are out of scope and named in the disclaimer.
- Q: VAT rates? → A: The standard rate (15%) is the default; callers may pass any rate, because
  reduced rates depend on the product (out of scope to classify).
- Q: Gratuity basis? → A: The statutory minimum in Bangladesh Labour Act 2006 section 2(10). Employer
  schemes may pay more; government service rules differ. Both are stated in the disclaimer.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Income tax for a tax year (Priority: P1) 🎯 MVP

A payroll or personal-finance app sends annual income, the taxpayer category (general, woman,
65+, disabled, third gender, war-wounded freedom fighter, July warrior), and optionally the salary
portion and eligible investment. It receives the tax payable with a slab-by-slab breakdown.

**Why this priority**: The most searched finance question in Bangladesh every budget season; HR
software needs it for monthly withholding.

**Independent Test**: Compute tax for reference incomes by hand from the Finance Act tables and
compare.

**Acceptance Scenarios**:

1. **Given** income at or below the category's tax-free threshold, **Then** tax payable is 0 and
   the minimum tax does not apply.
2. **Given** income above the threshold, **Then** the response lists each slab with the amount taxed
   and the tax, the gross tax, any rebate, the minimum tax, and the final tax payable — never below
   the minimum tax.
3. **Given** a salary portion, **Then** the employment exemption (the lower of one-third of it or
   the cap) is deducted before the slabs, and shown.
4. **Given** eligible investment, **Then** the rebate is the lowest of the three legal limits and is
   shown with which limit applied.
5. **Given** a parent of disabled children, **Then** the threshold rises by the per-child amount.
6. **Given** an unknown tax year, **Then** 404 lists the available tax years; never extrapolated.
7. **Given** Bangla digits or lakh/crore grouping (`১২,০০,০০০`), **Then** they are accepted.
8. Every response carries the Finance Act source, the income-year dates and a disclaimer.

---

### User Story 2 - Tax rules per year (Priority: P1)

A developer building their own calculator fetches the rules (thresholds per category, slabs,
minimum tax, rebate and exemption limits) for a tax year.

**Why this priority**: Lets others build on the data instead of re-transcribing the Finance Act.

**Independent Test**: Compare the returned tables with the Act.

**Acceptance Scenarios**:

1. **Given** a request for the list, **Then** each available tax year is returned with its income
   year, rules and source; categories have English and Bangla names.

---

### User Story 3 - Loan EMI (Priority: P2)

A bank, NBFI or marketplace shows a loan's monthly instalment, total interest and (optionally) the
amortisation schedule.

**Independent Test**: Compare with a standard reducing-balance EMI formula and a bank calculator.

**Acceptance Scenarios**:

1. **Given** principal, annual rate and tenure in months, **Then** EMI, total payment and total
   interest are returned.
2. **Given** a 0% rate, **Then** EMI = principal / months.
3. **Given** `schedule=true`, **Then** each month's principal, interest and balance are returned and
   the final balance is 0.
4. **Given** tenure over 600 months or a non-positive principal, **Then** 400.

---

### User Story 4 - VAT (Priority: P2)

An invoicing app adds VAT to a net price, or extracts VAT from a VAT-inclusive price.

**Acceptance Scenarios**:

1. **Given** an amount and no rate, **Then** the standard 15% applies, with its legal source.
2. **Given** `inclusive=true`, **Then** net, VAT and gross are derived from the gross amount.
3. **Given** a custom rate (e.g. 5, 7.5, 10), **Then** it is used and echoed.

---

### User Story 5 - DPS maturity (Priority: P3)

A user sees what a monthly deposit scheme will be worth at maturity.

**Acceptance Scenarios**:

1. **Given** monthly deposit, annual rate, years and compounding (monthly, quarterly, half-yearly,
   yearly), **Then** total deposited, interest earned and maturity value are returned.
2. The response notes that tax at source on interest and excise duty are not deducted and that each
   bank's scheme rules decide the real amount.

---

### User Story 6 - Gratuity (Priority: P3)

An HR tool estimates the statutory minimum gratuity on termination.

**Acceptance Scenarios**:

1. **Given** last monthly wage and length of service, **Then** the result counts completed years,
   with a final part over six months counted as a year, at 30 days' wages per year — or 45 days per
   year when service exceeds 10 years.
2. **Given** service under six months, **Then** gratuity is 0.

### Edge Cases

- Income exactly at a slab boundary or exactly at the threshold.
- Rebate larger than gross tax (tax cannot go negative; then minimum tax applies).
- Employment income larger than total income (400).
- Very large incomes (crores) and fractional taka; results rounded to 2 decimals.
- Category values in different case or Bangla; unknown category (400 listing valid values).
- EMI with very small rates; schedule rounding so the last payment closes the balance exactly.
- Gratuity at exactly 10 years (30 days) vs 10 years 1 month (45 days).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Compute individual resident income tax for an available tax year from: total income,
  category, number of disabled children/dependants, employment income, eligible investment, and
  whether the taxpayer is filing for the first time (new-taxpayer minimum tax).
- **FR-002**: Return a breakdown: exemption, taxable income, threshold, slabs (range, rate, amount
  taxed, tax), gross tax, rebate (with the limiting rule), minimum tax, tax payable, effective rate.
- **FR-003**: Publish the rules per tax year, keyed by tax year with the income year's dates.
- **FR-004**: 404 for unavailable tax years, listing the available ones.
- **FR-005**: EMI on a reducing balance, with optional schedule (≤ 600 months).
- **FR-006**: VAT add/extract with default standard rate 15%.
- **FR-007**: DPS maturity with configurable compounding.
- **FR-008**: Statutory minimum gratuity per Labour Act 2006 s. 2(10).
- **FR-009**: Every response has `meta.source` and `meta.disclaimer`; tax responses name the
  Finance Act and the tax year.
- **FR-010**: Accept Bangla digits and lakh/crore grouping in every amount.

### Privacy note (constitution II)

Income and wage figures are financial information but not identifiers. Nothing is stored; logs keep
the route template only (existing logger). The calculators are pure functions of their query, so
responses are cacheable like other deterministic conversions.

### Key Entities

- **TaxYear**: tax_year, income_year (from, to), thresholds per category, extra threshold per
  disabled child, slabs (width, rate), minimum tax (general, new taxpayer), employment exemption
  (fraction, cap), investment rebate (income %, investment %, cap), sources.
- **TaxCategory**: slug, name_en, name_bn.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tax results match hand calculations from the Act's tables for ≥ 12 reference cases
  per tax year (golden file).
- **SC-002**: EMI matches the closed-form formula to the paisa; schedules close to 0.
- **SC-003**: Every rule value cites a source; zero unsourced values.
- **SC-004**: A developer can get tax payable for a salary in one request.

## Assumptions

- All tax rules were checked against the law itself: Finance Act 2026 (Act No. 96 of 2026) and
  the Income Tax Act 2023 as amended by Acts No. 89 and 96 of 2026 (research F11).
- One day's wage for gratuity = monthly wage ÷ 30.

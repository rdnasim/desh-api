# Research: Finance Calculators

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-14

## F1. Income tax rates: Finance Act 2026

- **Decision**: Use the Finance Act 2026 as passed (Parliament, Monday 29 June 2026; published in the
  Bangladesh Gazette 30 June 2026; in force 1 July 2026). It fixes individual rates for tax years
  2026-27 through 2030-31.
- **Bill (primary-quality summary)**: Rahman Rahman Huq / KPMG, *Salient features of Finance Bill
  2026* (https://assets.kpmg.com/content/dam/kpmg/bd/pdf/Salient_features_of_Finance_Bill_2026(Tax-and_VAT).pdf),
  read in full on 2026-11-14. Proposed for tax years 2026-27 and 2027-28: first Tk 3,75,000 nil,
  next 3,00,000 10%, next 4,00,000 15%, next 5,00,000 20%, next 20,00,000 25%, balance 30% (35%
  band only from 2028-29). Thresholds: general 3,75,000; women and 65+ 4,25,000; third gender
  and physically challenged 5,00,000; gazetted war-wounded freedom fighters and July warriors
  5,25,000; +50,000 for a parent/guardian of a disabled person. Minimum tax Tk 5,000; new
  taxpayers Tk 1,000. Investment rebate: lowest of 3% of taxable income, 10% of eligible
  investment, Tk 7,50,000.
- **Change on passage**: Parliament raised the general threshold to **Tk 4,00,000** for 2026-27
  and 2027-28 (4,50,000 for 2028-29/2029-30, 5,00,000 for 2030-31). Sources: The Daily Star,
  29 Jun 2026 (https://www.thedailystar.net/business/bangladesh-budget-2025-26/news/finance-bill-passed-tax-free-income-threshold-set-tk-4-lakh-fy2026-27-4211511);
  NTV, 29 Jun 2026 (https://www.ntvbd.com/economy/news-1763041); Dhaka Tribune, 29 Jun 2026
  (https://www.dhakatribune.com/business/413915/finance-bill-2026-passed-with-structural-revisions);
  Bloomberg Tax ("Bangladesh Gazettes 2026 Finance Act", gazette 30 June).
- **Category thresholds as passed** (each the bill figure + Tk 25,000): women and 65+ **4,50,000**;
  disabled and third gender **5,25,000**; war-wounded freedom fighters and July warriors
  **5,50,000**. Found only in post-Act secondary guides (e.g. ajkerbongo.com, updated
  2026-11-12; reports collected by web search), not in a news report of the passage itself.
  **Confirmed against the Act** (F11).
- **Slabs, minimum tax, rebate**: no report of any change on passage; Dhaka Tribune (28 Jun 2026,
  https://www.dhakatribune.com/business/413809/tax-free-income-ceiling-now-tk4-lakh-but-tensions)
  confirms the lowest rate rising from 5% to 10% and the rebate on investment falling from 15% to
  10%.
- **Gazette text**: found on 2026-11-14 as **Act No. 96 of 2026** on bdlaws (see F11); every figure
  above matches it.

## F2. "Tax year" vs "income year"

- **Decision**: Key everything by **tax year** (the Act's label; "assessment year" in older usage),
  and state the income year in every record and response.
- **Rationale**: Ittefaq (2 Jun 2025, https://en.ittefaq.com.bd/12156/tax-free-income-thresholds-untouched-for-fy26)
  quotes the 2025 Ordinance: rates "for the FY 2025-26 assessment year were determined through the
  Finance Act, 2024" and the 3,75,000 threshold was set "for the assessment years 2026-2027 and
  2027-2028". KPMG's table for the 2026 bill uses the same labels. Under the Income Tax Act 2023 the
  income year is the financial year before the tax year. So tax year 2026-27 = income earned 1 Jul
  2025 – 30 Jun 2026 (returns due 30 Nov 2026), and tax year 2027-28 = income earned in the current
  fiscal year, 1 Jul 2026 – 30 Jun 2027. News reports write "FY2026-27" for the same column, which
  is why both labels are shown.
- **Effect**: both years have identical rules, so the result for any 2026 or 2027 salary does not
  depend on how the label is read; only the `income_year` dates make it explicit.

## F3. Employment income exemption

- **Decision**: Exempt the lower of one-third of income from employment or **Tk 5,00,000**
  (Income Tax Act 2023, Sixth Schedule Part 1).
- **Evidence**: Tk 4,50,000 in the Sixth Schedule as amended by Finance Act 2024
  (taxvatpoint.com); several 2026-27 guides report the cap raised to Tk 5,00,000 (arthonitee.com,
  ramco.com). Dhaka Tribune (28 Jun 2026) notes salaried people under Tk 6 lakh gross are
  outside the net, which fits a one-third exemption (6 lakh × 2/3 = 4 lakh). **Confirmed** (F11):
  the official English translation (SRO 404, Oct 2025) still shows 4,50,000 because it is
  consolidated only to Finance Act 2024; the change to 5 lakh came later.

## F4. Investment rebate

- **Decision**: lowest of 3% of taxable income, 10% of eligible investment (Sixth Schedule Part 3)
  and Tk 7,50,000. Applied after slabs; tax cannot fall below zero; the minimum tax applies after
  the rebate. The cap is from the bill (KPMG) and a post-Act guide (roylawnexus.com).
  **Confirmed** (F11). Which investments qualify is the caller's job; the API takes the
  eligible amount.

## F5. Out of scope for the tax calculator

Net-wealth surcharge and environment surcharge (need net worth and car data), final/reduced-rate
incomes, non-residents (flat 30%), companies, return-filing rebates and penalties (5% rebate for
filing 1 Jul – 30 Sep, capped at Tk 25,000 — from the bill; could be added later), advance tax and
withholding. All are named in the disclaimer.

## F6. VAT

- **Decision**: Default to the standard rate **15%** (Value Added Tax and Supplementary Duty Act
  2012, section 15; still the standard rate in the 2026 VAT changes per KPMG). Callers may pass
  any rate in (0, 100], because reduced and truncated rates (e.g. 5%, 7.5%, 10%) depend on the
  goods or service code, which is out of scope. Supplementary duty is not computed.

## F7. Loan EMI

- **Decision**: Standard reducing-balance (annuity) formula,
  `EMI = P·r·(1+r)^n / ((1+r)^n − 1)` with `r` = annual rate / 12 / 100; `P/n` when the rate is 0.
  Schedule lines are rounded to the paisa and the last instalment absorbs rounding so the balance
  ends at exactly 0. Up to 600 months. Bank-specific fees, flat-rate loans and Islamic financing
  profit methods are not modelled.

## F8. DPS (monthly deposit scheme)

- **Decision**: A deposit at the start of each month; interest accrues monthly at annual rate / 12
  on the balance and is credited at each compounding interval (monthly, quarterly, half-yearly,
  yearly; default monthly). Banks' schemes differ (fixed maturity tables, premature encashment
  rules), and tax at source on interest and excise duty are not deducted: all in the disclaimer.
  For monthly compounding the result equals the closed form `D·((1+i)^n − 1)/i·(1+i)`.

## F9. Gratuity

- **Decision**: Bangladesh Labour Act 2006, section 2(10): "the wages of at least 30 (thirty) days,
  at the rate of the wages a worker received last, for every completed year of his service or for
  a period of his service exceeding 06 (six) months or, in the case of his service of more than 10
  (ten) years, the wages of 45 (forty five) days" (English text as amended to 2018,
  https://cdn2.ogrlegal.com/files/labour/act/Bangladesh-Labour-Act-2006_English-Upto-2018.pdf).
- **Reading**: a final part-year over six months counts as a year; when total service is more than
  10 years, 45 days apply to every counted year. One day's wage = monthly wage ÷ 30.
- **Later amendments**: the Labour (Amendment) Ordinance 2025 and Act No. 43 of 2026 (gazetted
  10 April 2026) changed resignation benefits (section 27: 7/15/30 days by length of service, or
  gratuity if higher) and the definition of worker; OGR Legal's guide to the 2025 amendments
  (https://cdn5.ogrlegal.com/files/guide/Guide-2025-Labour-Law-Amend.pdf) reports no change to
  2(10). The 2026 Act's body text uses a legacy font that could not be extracted. Resignation
  benefit is not computed (could be added later).
- Gratuity is "payable ... on the termination of employment" where a scheme or the Act applies;
  public servants are under separate pension rules. Both stated in the disclaimer.

## F10. Prior art

Several calculators exist (bdtaxguide.com, ayakor.com, rebatebhai.com, countrytaxcalc.com); they
disagree on 2026-27 thresholds, which is the gap this API fills: every figure tied to a cited
source and an explicit `unverified` list rather than silently mixing bill and Act figures.

## F11. Check against the law itself (task T020, 2026-11-14)

All rules in `data/finance/tax-years.json` were checked against primary text on bdlaws
(Legislative and Parliamentary Affairs Division). The pages are served as UTF-16, which is why
earlier automated reads returned unreadable text.

| Rule | Primary text | Result |
|---|---|---|
| Slabs, all category thresholds, +50,000 per disabled child/dependant, minimum tax 5,000 / 1,000 | **Finance Act 2026, Act No. 96 of 2026 (30 June 2026)**, s. 160 and Schedule 2, Part 1, para ক ("২০২৬-২০২৭ এবং ২০২৭-২০২৮ করবর্ষের জন্য করহার"), http://bdlaws.minlaw.gov.bd/act-details-1725.html; schedule PDF `upload/act/2026-08-17-10-27-29-তফসিল_Act-No-96.pdf` | Match |
| Investment rebate: 0.03 × income, 0.10 × investment, Tk 7.50 lakh | Income Tax Act 2023 s. 78 as amended by Act No. 96 of 2026 s. 61 ("০.১৫" → "০.১০"; "১০ (দশ)" → "৭.৫০") | Match |
| Employment exemption: one-third or Tk 5 lakh | Income Tax Act 2023 Sixth Schedule Part 1 para (27), amended "৪ (চার) লক্ষ ৫০ (পঞ্চাশ) হাজার" → "৫ (পাঁচ) লক্ষ" by **Finance (FY 2025-26) Act 2026, Act No. 89 of 2026 (10 April 2026)**, which re-enacted and repealed Finance Ordinance 2025 (s. 162). Act No. 96 does not amend para (27) (its s. 32 and s. 157 change other clauses). | Match |

Also confirmed: s. 160(1) applies the Schedule 2 rates "২০২৬-২০২৭ হইতে ২০৩০-২০৩১ করবর্ষের জন্য",
which supports keying by tax year (F2); para ক(ঘ) allows only one parent to claim the disabled-child
allowance when both are taxpayers (now in the parameter description); para ক(ঙ) excludes
non-residents other than non-resident Bangladeshis. The data now cites only these Acts and
`unverified` is empty.

Schedule 2 also fixes the rates for tax years 2028-29/2029-30 (paras খ: thresholds 4,50,000 /
5,00,000 women and 65+ / 5,75,000 disabled and third gender / 6,00,000 freedom fighters and July
warriors; 30% on the next 2,63,50,000, then 35%) and 2030-31 (para গ: 5,00,000 / 5,50,000 /
6,25,000 / 6,50,000; 30% on the next 2,63,00,000, then 35%). In both, 35% starts at exactly Tk 3
crore. These are now in the data (task T022) with a `note` that a later Finance Act may change
them; the employment exemption and investment rebate for those years are the Income Tax Act rules
in force on 1 July 2026.

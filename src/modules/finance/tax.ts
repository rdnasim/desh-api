import categories from '../../generated/finance.tax-categories';
import { normalizeForSearch } from '../../lib/normalize';
import { round2 } from './money';
import type { TaxCategory, TaxYear } from './schemas';

export class UnavailableTaxYearError extends Error {
  constructor(
    readonly taxYear: string,
    readonly available: string[],
  ) {
    super(`No tax rules for tax year ${taxYear}`);
  }
}

const lookup = new Map<string, TaxCategory>();
for (const c of categories) {
  for (const name of [c.slug, c.name_bn, ...c.aliases]) lookup.set(normalizeForSearch(name), c);
}

/** Matches a category slug, alias or Bangla name, ignoring case, spaces and hyphens. */
export function resolveCategory(name: string): TaxCategory | undefined {
  return lookup.get(normalizeForSearch(name));
}

/** The rules for `taxYear`, or for the latest tax year when it is omitted. */
export function findTaxYear(years: readonly TaxYear[], taxYear?: string): TaxYear {
  const sorted = [...years].sort((a, b) => a.tax_year.localeCompare(b.tax_year));
  const found = taxYear === undefined ? sorted.at(-1) : sorted.find((y) => y.tax_year === taxYear);
  if (!found) {
    throw new UnavailableTaxYearError(
      taxYear ?? '',
      sorted.map((y) => y.tax_year),
    );
  }
  return found;
}

export interface TaxInput {
  income: number;
  disabled_dependants?: number;
  employment_income?: number;
  investment?: number;
  new_taxpayer?: boolean;
}

type RebateLimit = 'none' | 'income' | 'investment' | 'cap' | 'tax';

/**
 * Individual resident income tax for one tax year: employment exemption, slabs above the
 * category threshold, investment rebate, then the minimum tax (research F1–F4).
 */
export function incomeTax(year: TaxYear, category: TaxCategory, input: TaxInput) {
  const {
    income,
    disabled_dependants = 0,
    employment_income = 0,
    investment = 0,
    new_taxpayer = false,
  } = input;
  if (employment_income > income) {
    throw new RangeError('employment_income cannot be more than income');
  }
  const base = year.thresholds.find((t) => t.category === category.slug)?.amount;
  if (base === undefined) throw new Error(`No threshold for ${category.slug} in ${year.tax_year}`);

  const exemption = Math.min(
    employment_income / year.employment_exemption.divisor,
    year.employment_exemption.cap,
  );
  const taxable = income - exemption;
  const threshold = base + disabled_dependants * year.disabled_dependant_extra;

  let from = 0;
  let grossTax = 0;
  const slabs = [{ width: threshold, rate: 0 }, ...year.slabs].map(({ width, rate }) => {
    const to = width === null ? null : from + width;
    const taxed = Math.max(0, Math.min(taxable, to ?? Number.POSITIVE_INFINITY) - from);
    const tax = (taxed * rate) / 100;
    grossTax += tax;
    const slab = { from, to, rate, taxed: round2(taxed), tax: round2(tax) };
    if (to !== null) from = to;
    return slab;
  });
  const gross = round2(grossTax);

  let rebate = 0;
  let limitedBy: RebateLimit = 'none';
  if (investment > 0) {
    const { income_rate, investment_rate, cap } = year.investment_rebate;
    const limits: [RebateLimit, number][] = [
      ['income', (taxable * income_rate) / 100],
      ['investment', (investment * investment_rate) / 100],
      ['cap', cap],
    ];
    [limitedBy, rebate] = limits.reduce((min, l) => (l[1] < min[1] ? l : min));
    if (rebate > gross) [limitedBy, rebate] = ['tax', gross];
    rebate = round2(rebate);
  }

  const minimumTax = new_taxpayer ? year.minimum_tax.new_taxpayer : year.minimum_tax.general;
  const afterRebate = round2(gross - rebate);
  const minimumApplied = taxable > threshold && afterRebate < minimumTax;
  const payable = minimumApplied ? minimumTax : afterRebate;

  return {
    tax_year: year.tax_year,
    income_year: year.income_year,
    category: { slug: category.slug, name_en: category.name_en, name_bn: category.name_bn },
    income: round2(income),
    employment_exemption: round2(exemption),
    taxable_income: round2(taxable),
    tax_free_threshold: threshold,
    slabs,
    gross_tax: gross,
    rebate: { eligible_investment: round2(investment), amount: rebate, limited_by: limitedBy },
    minimum_tax: minimumTax,
    minimum_tax_applied: minimumApplied,
    tax_payable: payable,
    effective_rate: income > 0 ? round2((payable / income) * 100) : 0,
    unverified: year.unverified,
  };
}

import { describe, expect, it } from 'vitest';
import categories from '../../../src/generated/finance.tax-categories';
import years from '../../../src/generated/finance.tax-years';
import {
  bangladeshToday,
  findTaxYear,
  incomeTax,
  resolveCategory,
  UnavailableTaxYearError,
} from '../../../src/modules/finance/tax';
import golden from '../../golden/finance/income-tax.json';

function category(name: string) {
  const found = resolveCategory(name);
  if (!found) throw new Error(`unknown category ${name}`);
  return found;
}
const general = category('general');

type GoldenCase = (typeof golden.cases)[number] & { tax_year?: string };

function runGolden(taxYear: string, c: GoldenCase) {
  const { category: name = 'general', ...input } = c.input as { category?: string; income: number };
  const r = incomeTax(findTaxYear(years, taxYear), category(name), input);
  expect({
    taxable_income: r.taxable_income,
    gross_tax: r.gross_tax,
    rebate: r.rebate.amount,
    minimum_tax_applied: r.minimum_tax_applied,
    tax_payable: r.tax_payable,
  }).toEqual({
    taxable_income: c.expect.taxable_income,
    gross_tax: c.expect.gross_tax,
    rebate: c.expect.rebate,
    minimum_tax_applied: c.expect.minimum_tax_applied,
    tax_payable: c.expect.tax_payable,
  });
  if ('limited_by' in c.expect) expect(r.rebate.limited_by).toBe(c.expect.limited_by);
}

describe('incomeTax (golden cases)', () => {
  for (const taxYear of golden.tax_years) {
    for (const c of golden.cases) it(`${taxYear}: ${c.name}`, () => runGolden(taxYear, c));
  }
  for (const c of golden.by_year) it(`${c.tax_year}: ${c.name}`, () => runGolden(c.tax_year, c));
});

describe('incomeTax breakdown', () => {
  const r = incomeTax(findTaxYear(years, '2027-28'), general, { income: 1000000 });

  it('lists every slab with absolute bounds, the amount taxed and the tax', () => {
    expect(r.slabs).toEqual([
      { from: 0, to: 400000, rate: 0, taxed: 400000, tax: 0 },
      { from: 400000, to: 700000, rate: 10, taxed: 300000, tax: 30000 },
      { from: 700000, to: 1100000, rate: 15, taxed: 300000, tax: 45000 },
      { from: 1100000, to: 1600000, rate: 20, taxed: 0, tax: 0 },
      { from: 1600000, to: 3600000, rate: 25, taxed: 0, tax: 0 },
      { from: 3600000, to: null, rate: 30, taxed: 0, tax: 0 },
    ]);
  });

  it('reports the tax year, income year, category, effective rate and unverified rules', () => {
    expect(r).toMatchObject({
      tax_year: '2027-28',
      income_year: { from: '2026-07-01', to: '2027-06-30' },
      category: { slug: 'general', name_bn: 'সাধারণ করদাতা' },
      tax_free_threshold: 400000,
      minimum_tax: 5000,
      effective_rate: 7.5,
      rebate: { eligible_investment: 0, amount: 0, limited_by: 'none' },
    });
    expect(r.unverified).toEqual([]);
  });

  it('gives an effective rate of 0 for zero income', () => {
    expect(incomeTax(findTaxYear(years), general, { income: 0 }).effective_rate).toBe(0);
  });

  it('rejects employment income larger than total income', () => {
    expect(() =>
      incomeTax(findTaxYear(years), general, { income: 100, employment_income: 200 }),
    ).toThrow(RangeError);
  });
});

describe('findTaxYear', () => {
  it('defaults to the tax year whose income year contains the date', () => {
    expect(findTaxYear(years, undefined, '2026-11-14').tax_year).toBe('2027-28');
    expect(findTaxYear(years, undefined, '2026-06-30').tax_year).toBe('2026-27');
    expect(findTaxYear(years, undefined, '2026-07-01').tax_year).toBe('2027-28');
    expect(findTaxYear(years, undefined, '2030-06-30').tax_year).toBe('2030-31');
  });

  it('falls back to the nearest year outside the covered range', () => {
    expect(findTaxYear(years, undefined, '2040-01-01').tax_year).toBe('2030-31');
    expect(findTaxYear(years, undefined, '2020-01-01').tax_year).toBe('2026-27');
  });

  it('uses the date in Bangladesh (UTC+6) by default', () => {
    expect(bangladeshToday(new Date('2027-06-30T18:30:00Z'))).toBe('2027-07-01');
    expect(bangladeshToday(new Date('2027-06-30T17:59:00Z'))).toBe('2027-06-30');
  });

  it('throws with the available years for an unknown one', () => {
    try {
      findTaxYear(years, '2020-21');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(UnavailableTaxYearError);
      expect((e as UnavailableTaxYearError).available).toEqual([
        '2026-27',
        '2027-28',
        '2028-29',
        '2029-30',
        '2030-31',
      ]);
    }
  });

  it('passes the advance-rates note through to the result', () => {
    const later = incomeTax(findTaxYear(years, '2028-29'), general, { income: 1 });
    expect(later.note).toContain('later Finance Act');
    expect(incomeTax(findTaxYear(years, '2027-28'), general, { income: 1 }).note).toBeUndefined();
  });
});

describe('resolveCategory', () => {
  it('accepts slugs, aliases and Bangla names in any case', () => {
    expect(resolveCategory('WOMAN')?.slug).toBe('woman');
    expect(resolveCategory('female')?.slug).toBe('woman');
    expect(resolveCategory('নারী')?.slug).toBe('woman');
    expect(resolveCategory('65+')?.slug).toBe('senior');
    expect(resolveCategory('third gender')?.slug).toBe('third-gender');
    expect(resolveCategory('martian')).toBeUndefined();
  });

  it('knows every category in the data', () => {
    for (const c of categories) expect(resolveCategory(c.slug)).toEqual(c);
  });
});

import { describe, expect, it } from 'vitest';
import {
  DpsSchema,
  EmiSchema,
  GratuitySchema,
  IncomeTaxSchema,
  TaxYearOutSchema,
  VatSchema,
} from '../../src/modules/finance/schemas';
import { call, expectError, expectOk } from './helpers';

const enc = encodeURIComponent;

describe('GET /v1/finance/income-tax', () => {
  it('defaults to the latest tax year and the general category, with source and disclaimer', async () => {
    const res = await call('/v1/finance/income-tax?income=1000000');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, IncomeTaxSchema);
    expect(body.data).toMatchObject({
      tax_year: '2027-28',
      income_year: { from: '2026-07-01', to: '2027-06-30' },
      category: { slug: 'general' },
      gross_tax: 75000,
      tax_payable: 75000,
    });
    expect(body.meta.source).toContain('Finance Act 2026');
    expect(body.meta.disclaimer).toContain('not tax advice');
  });

  it('accepts Bangla digits, lakh grouping and Bangla category names', async () => {
    const body = await expectOk(
      await call(`/v1/finance/income-tax?income=${enc('১০,০০,০০০')}&category=${enc('নারী')}`),
      IncomeTaxSchema,
    );
    expect(body.data).toMatchObject({
      category: { slug: 'woman' },
      tax_free_threshold: 450000,
      tax_payable: 67500,
    });
  });

  it('applies the employment exemption, rebate, dependants and new-taxpayer minimum', async () => {
    const salary = await expectOk(
      await call(
        '/v1/finance/income-tax?income=1800000&employment_income=1800000&tax_year=2026-27',
      ),
    );
    expect(salary.data).toMatchObject({
      tax_year: '2026-27',
      employment_exemption: 500000,
      tax_payable: 130000,
    });
    const rebate = await expectOk(
      await call('/v1/finance/income-tax?income=1000000&investment=200000'),
    );
    expect(rebate.data).toMatchObject({
      rebate: { amount: 20000, limited_by: 'investment' },
      tax_payable: 55000,
    });
    const dependants = await expectOk(
      await call('/v1/finance/income-tax?income=500000&disabled_dependants=2'),
    );
    expect(dependants.data).toMatchObject({ tax_free_threshold: 500000, tax_payable: 0 });
    const newbie = await expectOk(
      await call('/v1/finance/income-tax?income=405000&new_taxpayer=true'),
    );
    expect(newbie.data).toMatchObject({
      minimum_tax: 1000,
      minimum_tax_applied: true,
      tax_payable: 1000,
    });
  });

  it('404s an unknown tax year, listing the available ones', async () => {
    const body = await expectError(
      await call('/v1/finance/income-tax?income=500000&tax_year=2020-21'),
      404,
      'not_found',
    );
    expect(body.error.message).toContain('2026-27, 2027-28');
  });

  it('400s bad input', async () => {
    for (const q of [
      '',
      'income=abc',
      'income=-1',
      'income=500000&category=martian',
      'income=500000&tax_year=2027',
      'income=100&employment_income=200',
      'income=500000&new_taxpayer=yes',
      'income=500000&disabled_dependants=1.5',
    ]) {
      await expectError(await call(`/v1/finance/income-tax?${q}`), 400, 'invalid_parameter');
    }
  });

  it('lists valid categories when the category is unknown', async () => {
    const body = await expectError(
      await call('/v1/finance/income-tax?income=1&category=martian'),
      400,
      'invalid_parameter',
    );
    expect(body.error.message).toContain('freedom-fighter');
  });
});

describe('GET /v1/finance/tax-years', () => {
  it('lists every tax year with bilingual category names', async () => {
    const body = await expectOk(await call('/v1/finance/tax-years'));
    const years = body.data as {
      tax_year: string;
      thresholds: { category: string; name_bn: string }[];
    }[];
    expect(years.map((y) => y.tax_year)).toEqual(['2026-27', '2027-28']);
    for (const y of years) {
      expect(TaxYearOutSchema.safeParse(y).success).toBe(true);
      expect(y.thresholds.find((t) => t.category === 'woman')?.name_bn).toBe('নারী করদাতা');
    }
  });
});

describe('GET /v1/finance/emi', () => {
  it('computes the instalment', async () => {
    const body = await expectOk(
      await call('/v1/finance/emi?principal=1000000&rate=9&months=60'),
      EmiSchema,
    );
    expect(body.data).toMatchObject({ emi: 20758.36 });
    expect(body.data).not.toHaveProperty('schedule');
    expect(body.meta.disclaimer).toBeDefined();
  });

  it('returns the schedule on request', async () => {
    const body = await expectOk(
      await call('/v1/finance/emi?principal=100000&rate=12&months=12&schedule=true'),
      EmiSchema,
    );
    expect(body.data.schedule).toHaveLength(12);
  });

  it('400s bad input', async () => {
    for (const q of [
      'principal=0&rate=9&months=12',
      'principal=1000&rate=9&months=601',
      'principal=1000&rate=101&months=12',
      'principal=1000&rate=9&months=1.5',
      'principal=1000&rate=9&months=12&schedule=1',
    ]) {
      await expectError(await call(`/v1/finance/emi?${q}`), 400, 'invalid_parameter');
    }
  });
});

describe('GET /v1/finance/vat', () => {
  it('adds the standard rate and cites the VAT Act', async () => {
    const body = await expectOk(await call('/v1/finance/vat?amount=1000'), VatSchema);
    expect(body.data).toEqual({ rate: 15, inclusive: false, net: 1000, vat: 150, gross: 1150 });
    expect(body.meta.source).toContain('section 15');
  });

  it('splits an inclusive amount with a custom rate', async () => {
    const body = await expectOk(await call('/v1/finance/vat?amount=1075&rate=7.5&inclusive=true'));
    expect(body.data).toMatchObject({ net: 1000, vat: 75 });
  });

  it('400s bad input', async () => {
    await expectError(await call('/v1/finance/vat?amount=-5'), 400, 'invalid_parameter');
    await expectError(await call('/v1/finance/vat?amount=5&rate=200'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/finance/dps', () => {
  it('computes maturity', async () => {
    const body = await expectOk(
      await call('/v1/finance/dps?monthly=5000&rate=8&years=5&compounding=quarterly'),
      DpsSchema,
    );
    expect(body.data).toMatchObject({ total_deposit: 300000, compounding: 'quarterly' });
    expect(body.data.maturity_value).toBeGreaterThan(300000);
  });

  it('400s bad input', async () => {
    await expectError(
      await call('/v1/finance/dps?monthly=5000&rate=8&years=5&compounding=daily'),
      400,
      'invalid_parameter',
    );
    await expectError(
      await call('/v1/finance/dps?monthly=5000&rate=8&years=0'),
      400,
      'invalid_parameter',
    );
  });
});

describe('GET /v1/finance/gratuity', () => {
  it('computes statutory gratuity and cites the Labour Act', async () => {
    const body = await expectOk(
      await call('/v1/finance/gratuity?wage=30000&years=12&months=8'),
      GratuitySchema,
    );
    expect(body.data).toMatchObject({ counted_years: 13, days_per_year: 45, gratuity: 585000 });
    expect(body.meta.source).toContain('2(10)');
  });

  it('400s bad input', async () => {
    await expectError(
      await call('/v1/finance/gratuity?wage=30000&years=1&months=12'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/finance/gratuity?wage=0&years=1'), 400, 'invalid_parameter');
  });
});

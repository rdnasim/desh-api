import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Taka = z.number().nonnegative();
const Percent = z.number().min(0).max(100);

export const TaxCategorySchema = z
  .object({
    slug: SlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    aliases: z.array(z.string().min(1)),
  })
  .openapi('TaxCategory');

export const TaxSourceSchema = z.object({
  ref: z.string().min(1),
  date: IsoDate,
  url: z.string().url().optional(),
  kind: z.enum(['act', 'summary', 'news']).openapi({
    description: '`act` = the law itself; `summary` = professional summary; `news` = news report',
  }),
});

const TaxYearFields = z.object({
  tax_year: z.string().regex(/^\d{4}-\d{2}$/),
  income_year: z.object({ from: IsoDate, to: IsoDate }),
  thresholds: z.array(z.object({ category: SlugSchema, amount: Taka })).min(1),
  disabled_dependant_extra: Taka,
  slabs: z
    .array(z.object({ width: z.number().positive().nullable(), rate: Percent }))
    .min(1)
    .openapi({ description: 'Bands above the tax-free threshold; the last has `width: null`' }),
  minimum_tax: z.object({ general: Taka, new_taxpayer: Taka }),
  employment_exemption: z.object({ divisor: z.number().positive(), cap: Taka }).openapi({
    description: 'Exempt = lower of employment income ÷ divisor and cap',
  }),
  investment_rebate: z.object({ income_rate: Percent, investment_rate: Percent, cap: Taka }),
  sources: z.array(TaxSourceSchema).min(1),
  unverified: z.array(z.string()).openapi({
    description:
      'Rules that rest only on secondary sources and are not yet checked against the gazette',
  }),
  note: z.string().min(1).optional().openapi({
    description: 'Caveat for this tax year, e.g. rates set in advance that a later Act may change',
  }),
});

export const TaxYearSchema = TaxYearFields.refine(
  (y) => Number(y.tax_year.slice(5)) === (Number(y.tax_year.slice(0, 4)) + 1) % 100,
  {
    message: 'tax_year must be consecutive years, e.g. 2027-28',
  },
)
  .refine(
    (y) => {
      const start = Number(y.tax_year.slice(0, 4)) - 1;
      return y.income_year.from === `${start}-07-01` && y.income_year.to === `${start + 1}-06-30`;
    },
    { message: 'income_year must be 1 July – 30 June of the year before the tax year' },
  )
  .refine((y) => y.slabs.every((s, i) => (s.width === null) === (i === y.slabs.length - 1)), {
    message: 'only the last slab is open-ended (width: null)',
  })
  .openapi('TaxYear');

export type TaxCategory = z.infer<typeof TaxCategorySchema>;
export type TaxYear = z.infer<typeof TaxYearSchema>;

const CategoryRefSchema = z.object({ slug: SlugSchema, name_en: z.string(), name_bn: z.string() });

export const TaxYearOutSchema = TaxYearFields.extend({
  thresholds: z.array(
    z.object({ category: SlugSchema, name_en: z.string(), name_bn: z.string(), amount: Taka }),
  ),
}).openapi('TaxYearWithNames', {
  example: {
    tax_year: '2027-28',
    income_year: { from: '2026-07-01', to: '2027-06-30' },
    thresholds: [
      { category: 'general', name_en: 'General taxpayer', name_bn: 'সাধারণ করদাতা', amount: 400000 },
      { category: 'woman', name_en: 'Woman taxpayer', name_bn: 'নারী করদাতা', amount: 450000 },
    ],
    disabled_dependant_extra: 50000,
    slabs: [
      { width: 300000, rate: 10 },
      { width: 400000, rate: 15 },
      { width: 500000, rate: 20 },
      { width: 2000000, rate: 25 },
      { width: null, rate: 30 },
    ],
    minimum_tax: { general: 5000, new_taxpayer: 1000 },
    employment_exemption: { divisor: 3, cap: 500000 },
    investment_rebate: { income_rate: 3, investment_rate: 10, cap: 750000 },
    sources: [
      {
        ref: 'Finance Act 2026 (passed 29 June 2026; Bangladesh Gazette, 30 June 2026)',
        date: '2026-06-30',
        kind: 'act',
      },
    ],
    unverified: ['employment_exemption.cap'],
  },
});

export const IncomeTaxSchema = z
  .object({
    tax_year: z.string(),
    income_year: z.object({ from: z.string(), to: z.string() }),
    category: CategoryRefSchema,
    income: Taka,
    employment_exemption: Taka,
    taxable_income: Taka,
    tax_free_threshold: Taka,
    slabs: z.array(
      z.object({
        from: Taka,
        to: Taka.nullable(),
        rate: Percent,
        taxed: Taka,
        tax: Taka,
      }),
    ),
    gross_tax: Taka,
    rebate: z.object({
      eligible_investment: Taka,
      amount: Taka,
      limited_by: z.enum(['none', 'income', 'investment', 'cap', 'tax']).openapi({
        description:
          'Which limit set the rebate: 3% of taxable income, 10% of investment, the cap, or the tax itself',
      }),
    }),
    minimum_tax: Taka,
    minimum_tax_applied: z.boolean(),
    tax_payable: Taka,
    effective_rate: Percent.openapi({ description: 'Tax payable as % of income' }),
    unverified: z.array(z.string()),
    note: z.string().optional(),
  })
  .openapi('IncomeTax', {
    example: {
      tax_year: '2027-28',
      income_year: { from: '2026-07-01', to: '2027-06-30' },
      category: { slug: 'general', name_en: 'General taxpayer', name_bn: 'সাধারণ করদাতা' },
      income: 1000000,
      employment_exemption: 0,
      taxable_income: 1000000,
      tax_free_threshold: 400000,
      slabs: [
        { from: 0, to: 400000, rate: 0, taxed: 400000, tax: 0 },
        { from: 400000, to: 700000, rate: 10, taxed: 300000, tax: 30000 },
        { from: 700000, to: 1100000, rate: 15, taxed: 300000, tax: 45000 },
      ],
      gross_tax: 75000,
      rebate: { eligible_investment: 0, amount: 0, limited_by: 'none' },
      minimum_tax: 5000,
      minimum_tax_applied: false,
      tax_payable: 75000,
      effective_rate: 7.5,
      unverified: [],
    },
  });

export const EmiSchema = z
  .object({
    principal: Taka,
    annual_rate: Percent,
    months: z.number().int(),
    emi: Taka,
    total_payment: Taka,
    total_interest: Taka,
    schedule: z
      .array(
        z.object({
          month: z.number().int(),
          payment: Taka,
          principal: Taka,
          interest: Taka,
          balance: Taka,
        }),
      )
      .optional(),
  })
  .openapi('Emi', {
    example: {
      principal: 1000000,
      annual_rate: 9,
      months: 60,
      emi: 20758.36,
      total_payment: 1245501.23,
      total_interest: 245501.23,
    },
  });

export const VatSchema = z
  .object({ rate: Percent, inclusive: z.boolean(), net: Taka, vat: Taka, gross: Taka })
  .openapi('Vat', {
    example: { rate: 15, inclusive: false, net: 1000, vat: 150, gross: 1150 },
  });

export const CompoundingSchema = z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly']);

export const DpsSchema = z
  .object({
    monthly_deposit: Taka,
    annual_rate: Percent,
    years: z.number().int(),
    compounding: CompoundingSchema,
    total_deposit: Taka,
    interest: Taka,
    maturity_value: Taka,
  })
  .openapi('Dps', {
    example: {
      monthly_deposit: 5000,
      annual_rate: 8,
      years: 5,
      compounding: 'monthly',
      total_deposit: 300000,
      interest: 69833.51,
      maturity_value: 369833.51,
    },
  });

export const GratuitySchema = z
  .object({
    monthly_wage: Taka,
    service: z.object({ years: z.number().int(), months: z.number().int() }),
    counted_years: z.number().int(),
    days_per_year: z.number().int(),
    daily_wage: Taka,
    gratuity: Taka,
  })
  .openapi('Gratuity', {
    example: {
      monthly_wage: 30000,
      service: { years: 12, months: 8 },
      counted_years: 13,
      days_per_year: 45,
      daily_wage: 1000,
      gratuity: 585000,
    },
  });

export type Compounding = z.infer<typeof CompoundingSchema>;

import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import categories from '../../generated/finance.tax-categories';
import years from '../../generated/finance.tax-years';
import { cachePublic } from '../../lib/cache';
import { toLatinDigits } from '../../lib/digits';
import { ErrorSchema, envelope, metaFor, ok, staticMeta } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { dps } from './dps';
import { emi } from './emi';
import { gratuity } from './gratuity';
import {
  CompoundingSchema,
  DpsSchema,
  EmiSchema,
  GratuitySchema,
  IncomeTaxSchema,
  TaxYearOutSchema,
  VatSchema,
} from './schemas';
import { findTaxYear, incomeTax, resolveCategory, UnavailableTaxYearError } from './tax';
import { STANDARD_VAT_RATE, vat } from './vat';

const tags = ['Finance'];
const UPDATED = '2026-11-14';
const MAX_AMOUNT = 1e13;

const TAX_DISCLAIMER =
  'Estimate for individual resident taxpayers; not tax advice. Excludes net-wealth and environment surcharge, reduced-rate and final-tax income, return-filing rebates and penalties, and tax already deducted at source. Any rule listed in `unverified` is not yet checked against the gazetted law. Confirm with NBR or a tax adviser before filing.';
const taxMeta = () =>
  metaFor(['finance.tax-years', 'finance.tax-categories'], { disclaimer: TAX_DISCLAIMER });

const EMI_META = staticMeta('Standard reducing-balance (annuity) loan formula', UPDATED, {
  disclaimer:
    'Estimate only; not financial advice. Lenders differ in rate type, fees, rounding and (for Islamic finance) profit method.',
});
const VAT_META = staticMeta(
  'Value Added Tax and Supplementary Duty Act 2012, section 15 (standard rate 15%)',
  UPDATED,
  {
    disclaimer:
      'Many goods and services carry a reduced or truncated rate, an exemption or supplementary duty; check the rate for the product with NBR. Not tax advice.',
  },
);
const DPS_META = staticMeta('Standard recurring-deposit compound interest formula', UPDATED, {
  disclaimer:
    "Estimate only; each bank's scheme rules, maturity tables and early-encashment terms decide the real amount. Tax at source on interest and excise duty are not deducted.",
});
const GRATUITY_META = staticMeta('Bangladesh Labour Act 2006, section 2(10) (gratuity)', UPDATED, {
  disclaimer:
    'Statutory minimum for workers covered by the Labour Act; an employer scheme may pay more, and government servants follow separate pension rules. Not legal advice.',
});

const responses = <T extends z.ZodTypeAny>(schema: T, description: string, notFound = false) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  ...(notFound
    ? {
        404: {
          description: 'Tax year not available',
          content: { 'application/json': { schema: ErrorSchema } },
        },
      }
    : {}),
});
const required = (name: string, description: string, example: string) =>
  z.string().openapi({ param: { name, in: 'query', description }, example });
const optional = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

const invalid = (message: string, message_bn?: string): never => {
  throw new ApiError('invalid_parameter', message, { message_bn });
};

const amount = (name: string, raw: string, min = 0) =>
  numberParam(name, raw, { min, max: MAX_AMOUNT });

function boolParam(name: string, raw: string | undefined): boolean {
  if (raw === undefined) return false;
  if (raw !== 'true' && raw !== 'false') invalid(`${name} must be true or false`);
  return raw === 'true';
}

export const financeRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/tax-years',
    tags,
    summary: 'Income tax rules per tax year (thresholds, slabs, minimum tax, rebate)',
    description:
      'Rules from the Finance Act, keyed by tax year. `income_year` is the period the income is earned in: tax year 2027-28 covers income from 1 July 2026 to 30 June 2027. Years from 2028-29 were set in advance by the Finance Act 2026 and carry a `note`.',
    responses: responses(z.array(TaxYearOutSchema), 'Tax years, oldest first'),
  }),
  (c) => {
    const names = new Map(categories.map((cat) => [cat.slug, cat]));
    const list = [...years]
      .sort((a, b) => a.tax_year.localeCompare(b.tax_year))
      .map((y) => ({
        ...y,
        thresholds: y.thresholds.map((t) => ({
          category: t.category,
          name_en: names.get(t.category)?.name_en ?? t.category,
          name_bn: names.get(t.category)?.name_bn ?? t.category,
          amount: t.amount,
        })),
      }));
    cachePublic(c);
    return ok(c, list, taxMeta());
  },
);

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/income-tax',
    tags,
    summary: 'Income tax for an individual (Finance Act slabs, exemption, rebate, minimum tax)',
    description:
      'Pass total annual income from all sources (gross salary included). With `employment_income`, the lower of one-third of it or the cap is exempted first. `investment` is the amount eligible for the investment rebate. Amounts accept Bangla digits and lakh/crore grouping (১২,০০,০০০).',
    request: {
      query: z.object({
        income: required('income', 'Total annual income in Taka (≥ 0)', '1000000'),
        tax_year: optional(
          'tax_year',
          'e.g. 2027-28 (2026-27 to 2030-31). Default: the current tax year, whose income year contains today in Bangladesh',
          '2027-28',
        ),
        category: optional(
          'category',
          'general (default), woman, senior, disabled, third-gender, freedom-fighter, july-warrior; Bangla names accepted',
          'general',
        ),
        disabled_dependants: optional(
          'disabled_dependants',
          'Number of disabled children/dependants: +Tk 50,000 each for a parent or guardian (if both parents are taxpayers, only one may claim it)',
        ),
        employment_income: optional(
          'employment_income',
          'Part of `income` that is income from employment (gross salary)',
        ),
        investment: optional('investment', 'Eligible investment for the rebate, in Taka'),
        new_taxpayer: optional('new_taxpayer', 'true for a first return (lower minimum tax)'),
      }),
    },
    responses: responses(IncomeTaxSchema, 'Tax computation', true),
  }),
  (c) => {
    const q = c.req.valid('query');
    const income = amount('income', q.income);
    const category =
      resolveCategory(q.category ?? 'general') ??
      invalid(
        `category '${q.category}' is not known; use one of: ${categories.map((x) => x.slug).join(', ')}`,
        'করদাতার শ্রেণি চেনা যায়নি',
      );
    const taxYear = q.tax_year === undefined ? undefined : toLatinDigits(q.tax_year.trim());
    if (taxYear !== undefined && !/^\d{4}-\d{2}$/.test(taxYear)) {
      invalid('tax_year must look like 2027-28');
    }
    const input = {
      income,
      disabled_dependants:
        q.disabled_dependants === undefined
          ? 0
          : numberParam('disabled_dependants', q.disabled_dependants, {
              min: 0,
              max: 20,
              integer: true,
            }),
      employment_income:
        q.employment_income === undefined ? 0 : amount('employment_income', q.employment_income),
      investment: q.investment === undefined ? 0 : amount('investment', q.investment),
      new_taxpayer: boolParam('new_taxpayer', q.new_taxpayer),
    };
    let result: ReturnType<typeof incomeTax>;
    try {
      result = incomeTax(findTaxYear(years, taxYear), category, input);
    } catch (error) {
      if (error instanceof UnavailableTaxYearError) {
        throw new ApiError(
          'not_found',
          `No tax rules for tax year ${error.taxYear}. Available tax years: ${error.available.join(', ')}`,
          { message_bn: `${error.taxYear} করবর্ষের করহার এখনো যুক্ত হয়নি` },
        );
      }
      if (error instanceof RangeError) invalid(error.message);
      throw error;
    }
    // The default tax year changes on 1 July, so a default answer must not sit in caches for days.
    if (taxYear === undefined) c.header('Cache-Control', 'public, max-age=3600');
    else cachePublic(c);
    return ok(c, result, taxMeta());
  },
);

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/emi',
    tags,
    summary: 'Loan EMI (equal monthly instalment) on a reducing balance',
    description:
      'Totals come from the paisa-rounded schedule; the last instalment absorbs rounding so the balance ends at 0. Add `schedule=true` for the month-by-month breakdown.',
    request: {
      query: z.object({
        principal: required('principal', 'Loan amount in Taka (> 0)', '1000000'),
        rate: required('rate', 'Annual interest rate in % (0–100)', '9'),
        months: required('months', 'Tenure in months (1–600)', '60'),
        schedule: optional('schedule', 'true to include the amortisation schedule'),
      }),
    },
    responses: responses(EmiSchema, 'Instalment'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const result = emi(
      amount('principal', q.principal, 0.01),
      numberParam('rate', q.rate, { min: 0, max: 100 }),
      numberParam('months', q.months, { min: 1, max: 600, integer: true }),
      boolParam('schedule', q.schedule),
    );
    cachePublic(c);
    return ok(c, result, EMI_META);
  },
);

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/vat',
    tags,
    summary: 'Add VAT to a price, or extract it from a VAT-inclusive price',
    request: {
      query: z.object({
        amount: required('amount', 'Amount in Taka (≥ 0)', '1000'),
        rate: optional('rate', `VAT rate in % (default ${STANDARD_VAT_RATE}, the standard rate)`),
        inclusive: optional('inclusive', 'true when `amount` already includes VAT'),
      }),
    },
    responses: responses(VatSchema, 'VAT split'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const result = vat(
      amount('amount', q.amount),
      q.rate === undefined ? STANDARD_VAT_RATE : numberParam('rate', q.rate, { min: 0, max: 100 }),
      boolParam('inclusive', q.inclusive),
    );
    cachePublic(c);
    return ok(c, result, VAT_META);
  },
);

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/dps',
    tags,
    summary: 'DPS (monthly deposit scheme) maturity value',
    description:
      'One deposit at the start of each month; interest accrues monthly and is credited each compounding period.',
    request: {
      query: z.object({
        monthly: required('monthly', 'Monthly deposit in Taka (> 0)', '5000'),
        rate: required('rate', 'Annual interest rate in % (0–100)', '8'),
        years: required('years', 'Term in whole years (1–50)', '5'),
        compounding: optional(
          'compounding',
          'monthly (default), quarterly, half-yearly or yearly',
          'monthly',
        ),
      }),
    },
    responses: responses(DpsSchema, 'Maturity'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const compounding = CompoundingSchema.safeParse(q.compounding ?? 'monthly');
    if (!compounding.success) {
      invalid(`compounding must be one of: ${CompoundingSchema.options.join(', ')}`);
    }
    const result = dps(
      amount('monthly', q.monthly, 0.01),
      numberParam('rate', q.rate, { min: 0, max: 100 }),
      numberParam('years', q.years, { min: 1, max: 50, integer: true }),
      compounding.data,
    );
    cachePublic(c);
    return ok(c, result, DPS_META);
  },
);

financeRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/finance/gratuity',
    tags,
    summary: 'Statutory minimum gratuity (Labour Act 2006, s. 2(10))',
    description:
      "30 days' last wages for every completed year of service, counting a final part over six months as a year; 45 days per year when service is more than 10 years. One day's wage = monthly wage ÷ 30.",
    request: {
      query: z.object({
        wage: required('wage', 'Last monthly wage in Taka (> 0)', '30000'),
        years: required('years', 'Completed years of service (0–60)', '12'),
        months: optional('months', 'Extra months of service (0–11)', '8'),
      }),
    },
    responses: responses(GratuitySchema, 'Gratuity'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const result = gratuity(
      amount('wage', q.wage, 0.01),
      numberParam('years', q.years, { min: 0, max: 60, integer: true }),
      q.months === undefined
        ? 0
        : numberParam('months', q.months, { min: 0, max: 11, integer: true }),
    );
    cachePublic(c);
    return ok(c, result, GRATUITY_META);
  },
);

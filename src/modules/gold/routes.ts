import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { AppEnv } from '../../env';
import { ErrorSchema, envelope, ok, staticMeta } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { BAJUS_URL, fetchBajus } from './bajus';
import {
  type GoldPrices,
  GoldPricesSchema,
  KaratSchema,
  MetalSchema,
  ZakatSchema,
} from './schemas';
import { zakat } from './zakat';

const tags = ['Gold & zakat'];
const SOURCE = 'Bangladesh Jewellers Association (BAJUS), gold and silver rate';
const ZAKAT_DISCLAIMER =
  'Estimate only. Nisab: 7.5 vori (87.48 g) of gold or 52.5 vori (612.36 g) of silver; scholars differ on which to use and on how to value assets. Enter net zakatable wealth held for a lunar year. Ask a scholar or the Islamic Foundation for your case.';

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  503: {
    description: 'BAJUS prices unavailable',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

async function prices(): Promise<GoldPrices> {
  try {
    return await fetchBajus();
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', name: 'bajus', message: String(error) }));
    throw new ApiError(
      'upstream_unavailable',
      `Gold prices are unavailable right now (${BAJUS_URL} could not be read). Try again later.`,
      { message_bn: 'এই মুহূর্তে স্বর্ণের দাম পাওয়া যাচ্ছে না' },
    );
  }
}

/** Prices change once a day at most; short cache so a new list shows up within minutes. */
const cachePrices = (c: Context) => c.header('Cache-Control', 'public, max-age=600');
const meta = (p: GoldPrices, extra = {}) =>
  staticMeta(`${SOURCE}, effective ${p.effective_date}`, p.effective_date, extra);

function enumParam<T extends string>(
  name: string,
  raw: string | undefined,
  options: readonly T[],
  fallback: T,
): T {
  if (raw === undefined) return fallback;
  const value = options.find((o) => o === raw);
  if (value === undefined) {
    throw new ApiError('invalid_parameter', `${name} must be one of: ${options.join(', ')}`);
  }
  return value;
}

export const goldRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

goldRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/gold/prices',
    tags,
    summary: 'Current gold and silver prices from BAJUS (per gram and per vori)',
    description:
      'Read live from the Bangladesh Jewellers Association price page (cached up to 30 minutes). Per-vori prices are per gram × 11.664, rounded to the taka. 503 if BAJUS cannot be read.',
    responses: responses(GoldPricesSchema, 'Prices'),
  }),
  async (c) => {
    const p = await prices();
    cachePrices(c);
    return ok(c, p, meta(p));
  },
);

goldRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/zakat',
    tags,
    summary: 'Zakat on net wealth, with the nisab from current BAJUS prices',
    description:
      'Zakat is 2.5% when net zakatable wealth reaches the nisab. `basis` chooses silver (52.5 vori, default) or gold (7.5 vori); the response also shows the other basis.',
    request: {
      query: z.object({
        wealth: z.string().openapi({
          param: { name: 'wealth', in: 'query', description: 'Net zakatable wealth in Taka' },
          example: '1000000',
        }),
        basis: query('basis', 'silver (default) or gold'),
        karat: query('karat', 'Price used for the nisab: 22k (default), 21k, 18k, traditional'),
      }),
    },
    responses: responses(ZakatSchema, 'Zakat'),
  }),
  async (c) => {
    const q = c.req.valid('query');
    const wealth = numberParam('wealth', q.wealth, { min: 0, max: 1e13 });
    const basis = enumParam('basis', q.basis, MetalSchema.options, 'silver');
    const karat = enumParam('karat', q.karat, KaratSchema.options, '22k');
    const p = await prices();
    cachePrices(c);
    return ok(c, zakat(p, wealth, basis, karat), meta(p, { disclaimer: ZAKAT_DISCLAIMER }));
  },
);

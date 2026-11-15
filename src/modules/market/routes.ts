import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { AppEnv } from '../../env';
import fuel from '../../generated/market.fuel';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok, staticMeta } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { lastGood } from '../../lib/last-good';
import { normalizeForSearch } from '../../lib/normalize';
import {
  CommodityCategorySchema,
  FuelMonthSchema,
  type MarketPrices,
  MarketPricesSchema,
} from './schemas';
import { fetchTcb, type ParsedMarket, TCB_LIST_URL } from './tcb';

const SOURCE = 'Trading Corporation of Bangladesh (TCB), daily retail prices in Dhaka';
const store = lastGood<ParsedMarket>('market:tcb:last-good', (m) => m.date);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string, extra = {}) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  ...extra,
});
const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ErrorSchema } },
});
const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

async function marketPrices(c: Context<AppEnv>): Promise<MarketPrices> {
  const kv = c.env?.LIVE_DATA;
  try {
    const live = await fetchTcb();
    const saving = store.remember(kv, live);
    try {
      c.executionCtx.waitUntil(saving);
    } catch {
      await saving; // no execution context (tests)
    }
    return { ...live, fetched_at: new Date().toISOString(), freshness: 'live' };
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', name: 'tcb', message: String(error) }));
    const saved = await store.recall(kv);
    if (saved) return { ...saved.data, fetched_at: saved.fetched_at, freshness: 'last_known' };
    throw new ApiError(
      'upstream_unavailable',
      `Market prices are unavailable right now (${TCB_LIST_URL} could not be read). Try again later.`,
      { message_bn: 'এই মুহূর্তে বাজারদর পাওয়া যাচ্ছে না' },
    );
  }
}

export const marketRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

marketRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/market/prices',
    tags: ['Market prices'],
    summary: "Today's retail prices of essential goods in Dhaka (TCB)",
    description:
      "Read from TCB's newest daily price list (cached up to 30 minutes): today's lowest and highest price, a week, a month and a year ago, and TCB's % changes. Items TCB marks 0–0 have `price: null`. Where TCB cannot be reached, the last list read (within 7 days) is served as `freshness: \"last_known\"`; with none, 503.",
    request: {
      query: z.object({
        category: query(
          'category',
          `One of: ${CommodityCategorySchema.options.join(', ')}`,
          'edible-oil',
        ),
        q: query('q', 'Search item names in English or Bangla', 'lentil'),
      }),
    },
    responses: responses(MarketPricesSchema, 'Price list', {
      503: errorResponse('TCB prices unavailable'),
    }),
  }),
  async (c) => {
    const q = c.req.valid('query');
    if (q.category !== undefined && !CommodityCategorySchema.safeParse(q.category).success) {
      throw new ApiError(
        'invalid_parameter',
        `category must be one of: ${CommodityCategorySchema.options.join(', ')}`,
      );
    }
    const list = await marketPrices(c);
    const needle = q.q === undefined ? undefined : normalizeForSearch(q.q);
    const items = list.items.filter(
      (i) =>
        (q.category === undefined || i.category === q.category) &&
        (needle === undefined ||
          normalizeForSearch(`${i.name_en ?? ''} ${i.name_bn}`).includes(needle)),
    );
    c.header('Cache-Control', `public, max-age=${list.freshness === 'live' ? 1800 : 300}`);
    const note =
      list.freshness === 'last_known'
        ? `TCB could not be read from this region, so this is the last price list read, at ${list.fetched_at}.`
        : undefined;
    return ok(
      c,
      { ...list, items },
      staticMeta(`${SOURCE}, ${list.date}`, list.date, note ? { disclaimer: note } : {}),
    );
  },
);

const months = [...fuel].sort((a, b) => a.month.localeCompare(b.month));

marketRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fuel/prices',
    tags: ['Market prices'],
    summary: 'Government fuel prices per litre (diesel, octane, petrol, kerosene)',
    description:
      'Set monthly by the Energy and Mineral Resources Division. Without `month`, the latest month in the data.',
    request: { query: z.object({ month: query('month', 'YYYY-MM', '2026-11') }) },
    responses: responses(FuelMonthSchema, 'Fuel prices', {
      404: errorResponse('Month not available'),
    }),
  }),
  (c) => {
    const { month } = c.req.valid('query');
    if (month !== undefined && !/^\d{4}-\d{2}$/.test(month)) {
      throw new ApiError('invalid_parameter', 'month must look like 2026-11');
    }
    const found = month === undefined ? months.at(-1) : months.find((m) => m.month === month);
    if (!found) {
      throw new ApiError(
        'not_found',
        `No fuel prices for ${month}. Available months: ${months.map((m) => m.month).join(', ')}`,
        { message_bn: 'এই মাসের জ্বালানি তেলের দাম পাওয়া যায়নি' },
      );
    }
    cachePublic(c);
    return ok(c, found, metaFor(['market.fuel']));
  },
);

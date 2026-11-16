import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { calculateMfsFee, compareMfsFees } from './calculator';
import {
  MfsActionSchema,
  MfsChannelSchema,
  MfsChargeCalculationSchema,
  MfsComparisonResultSchema,
  MfsProviderSchema,
  MfsUssdEntrySchema,
} from './schemas';
import { getProvider, listProviders, listUssdCodes } from './service';

const tags = ['MFS'];
const meta = () => metaFor(['mfs.providers']);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
});

const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

export const mfsRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

mfsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mfs/providers',
    tags,
    summary: 'List licensed Bangladesh MFS providers',
    description:
      'Returns all Bangladesh Bank-licensed Mobile Financial Services (MFS) providers (bKash, Nagad, Rocket, Upay, TAP) with tariff schedules, USSD codes, limits, and parent institutions.',
    request: {
      query: z.object({
        q: query('q', 'Filter by provider or parent bank name (English or Bangla)', 'bkash'),
      }),
    },
    responses: responses(z.array(MfsProviderSchema), 'List of MFS providers'),
  }),
  (c) => {
    cachePublic(c);
    const { q } = c.req.valid('query');
    const term = q?.toLowerCase().trim();
    let items = listProviders();
    if (term) {
      items = items.filter(
        (p) =>
          p.slug.includes(term) ||
          p.name_en.toLowerCase().includes(term) ||
          p.name_bn.includes(term) ||
          p.parent_en.toLowerCase().includes(term) ||
          p.parent_bn.includes(term),
      );
    }
    return ok(c, items, meta());
  },
);

mfsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mfs/providers/{provider}',
    tags,
    summary: 'Get details and fee schedule for a specific MFS provider',
    request: {
      params: z.object({
        provider: z.string().openapi({ param: { name: 'provider', in: 'path' }, example: 'bkash' }),
      }),
    },
    responses: responses(MfsProviderSchema, 'Provider details'),
  }),
  (c) => {
    cachePublic(c);
    const { provider: slug } = c.req.valid('param');
    const provider = getProvider(slug);
    if (!provider) {
      const available = listProviders()
        .map((p) => p.slug)
        .join(', ');
      throw new ApiError('not_found', `Provider '${slug}' not found. Available: ${available}`);
    }
    return ok(c, provider, meta());
  },
);

mfsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mfs/charges',
    tags,
    summary: 'Calculate fee for an MFS transaction',
    description:
      'Calculates transaction fees (cash-out or send-money) based on published tariffs. Accepts Latin or Bangla digits for amount.',
    request: {
      query: z.object({
        provider: z.string().openapi({
          param: { name: 'provider', in: 'query', description: 'Provider slug' },
          example: 'bkash',
        }),
        amount: z.string().openapi({
          param: {
            name: 'amount',
            in: 'query',
            description: 'Transaction amount in BDT (accepts Bangla or Latin digits)',
          },
          example: '5000',
        }),
        action: MfsActionSchema.default('cash-out').openapi({
          param: {
            name: 'action',
            in: 'query',
            description: 'Transaction action: cash-out or send-money',
          },
          example: 'cash-out',
        }),
        channel: MfsChannelSchema.default('app').openapi({
          param: {
            name: 'channel',
            in: 'query',
            description: 'Channel: app, ussd, atm, or special (e.g. priyo agent)',
          },
          example: 'app',
        }),
      }),
    },
    responses: responses(MfsChargeCalculationSchema, 'Fee calculation result'),
  }),
  (c) => {
    cachePublic(c);
    const query = c.req.valid('query');
    const slug = query.provider;
    const rawAmount = query.amount;
    const action = query.action;
    const channel = query.channel;

    const provider = getProvider(slug);
    if (!provider) {
      const available = listProviders()
        .map((p) => p.slug)
        .join(', ');
      throw new ApiError('not_found', `Provider '${slug}' not found. Available: ${available}`);
    }

    const calc = calculateMfsFee({ provider, action, channel, amount: rawAmount });
    if (!calc) {
      throw new ApiError(
        'invalid_parameter',
        `Invalid calculation parameters. Ensure amount is a positive number and channel '${channel}' is supported for action '${action}' by ${provider.name_en}.`,
      );
    }

    return ok(c, calc, meta());
  },
);

mfsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mfs/compare',
    tags,
    summary: 'Compare fees across all MFS providers for a transaction',
    description:
      'Compares fees across all supported providers for a given amount, ranked from lowest fee to highest.',
    request: {
      query: z.object({
        amount: z.string().openapi({
          param: {
            name: 'amount',
            in: 'query',
            description: 'Transaction amount in BDT (accepts Bangla or Latin digits)',
          },
          example: '10000',
        }),
        action: MfsActionSchema.default('cash-out').openapi({
          param: {
            name: 'action',
            in: 'query',
            description: 'Transaction action: cash-out or send-money',
          },
          example: 'cash-out',
        }),
        channel: MfsChannelSchema.default('app').openapi({
          param: { name: 'channel', in: 'query', description: 'Channel: app, ussd, atm' },
          example: 'app',
        }),
      }),
    },
    responses: responses(MfsComparisonResultSchema, 'Comparison ranking across providers'),
  }),
  (c) => {
    cachePublic(c);
    const query = c.req.valid('query');
    const rawAmount = query.amount;
    const action = query.action;
    const channel = query.channel;

    const comparison = compareMfsFees(listProviders(), action, channel, rawAmount);
    if (!comparison) {
      throw new ApiError(
        'invalid_parameter',
        'Invalid amount. Must be a valid positive number in Latin or Bangla digits.',
      );
    }

    return ok(c, comparison, meta());
  },
);

mfsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mfs/ussd',
    tags,
    summary: 'Quick cheat sheet of USSD codes for all MFS providers',
    responses: responses(z.array(MfsUssdEntrySchema), 'USSD codes and helplines'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listUssdCodes(), meta());
  },
);

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

const invalid = (message: string): never => {
  throw new ApiError('invalid_parameter', message);
};

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
    cachePublic(c, '1d');
    const q = c.req.query('q')?.toLowerCase().trim();
    let items = listProviders();
    if (q) {
      items = items.filter(
        (p) =>
          p.slug.includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.name_bn.includes(q) ||
          p.parent_en.toLowerCase().includes(q) ||
          p.parent_bn.includes(q),
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
        provider: z
          .string()
          .openapi({ param: { name: 'provider', in: 'path' }, example: 'bkash' }),
      }),
    },
    responses: responses(MfsProviderSchema, 'Provider details'),
  }),
  (c) => {
    cachePublic(c, '1d');
    const slug = c.req.param('provider');
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
        provider: z
          .string()
          .openapi({ param: { name: 'provider', in: 'query', description: 'Provider slug' }, example: 'bkash' }),
        amount: z
          .string()
          .openapi({ param: { name: 'amount', in: 'query', description: 'Transaction amount in BDT (accepts Bangla or Latin digits)' }, example: '5000' }),
        action: MfsActionSchema.default('cash-out').openapi({
          param: { name: 'action', in: 'query', description: 'Transaction action: cash-out or send-money' },
          example: 'cash-out',
        }),
        channel: MfsChannelSchema.default('app').openapi({
          param: { name: 'channel', in: 'query', description: 'Channel: app, ussd, atm, or special (e.g. priyo agent)' },
          example: 'app',
        }),
      }),
    },
    responses: responses(MfsChargeCalculationSchema, 'Fee calculation result'),
  }),
  (c) => {
    cachePublic(c, '1d');
    const slug = c.req.query('provider');
    const rawAmount = c.req.query('amount');
    const action = (c.req.query('action') || 'cash-out') as any;
    const channel = (c.req.query('channel') || 'app') as any;

    if (!slug) invalid("Query parameter 'provider' is required.");
    if (!rawAmount) invalid("Query parameter 'amount' is required.");

    const provider = getProvider(slug);
    if (!provider) {
      const available = listProviders()
        .map((p) => p.slug)
        .join(', ');
      throw new ApiError('not_found', `Provider '${slug}' not found. Available: ${available}`);
    }

    const calc = calculateMfsFee({ provider, action, channel, amount: rawAmount });
    if (!calc) {
      invalid(
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
        amount: z
          .string()
          .openapi({ param: { name: 'amount', in: 'query', description: 'Transaction amount in BDT (accepts Bangla or Latin digits)' }, example: '10000' }),
        action: MfsActionSchema.default('cash-out').openapi({
          param: { name: 'action', in: 'query', description: 'Transaction action: cash-out or send-money' },
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
    cachePublic(c, '1d');
    const rawAmount = c.req.query('amount');
    const action = (c.req.query('action') || 'cash-out') as any;
    const channel = (c.req.query('channel') || 'app') as any;

    if (!rawAmount) invalid("Query parameter 'amount' is required.");

    const comparison = compareMfsFees(listProviders(), action, channel, rawAmount);
    if (!comparison) {
      invalid("Invalid amount. Must be a valid positive number in Latin or Bangla digits.");
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
    cachePublic(c, '1d');
    return ok(c, listUssdCodes(), meta());
  },
);

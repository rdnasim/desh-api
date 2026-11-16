import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { TIERS } from '../../lib/api-key';
import { noStore } from '../../lib/cache';
import { ErrorSchema, envelope, ok, staticMeta } from '../../lib/envelope';
import { validationHook } from '../../lib/errors';
import { DeveloperQuotaSchema } from './schemas';

const tags = ['Developer'];
const meta = () => staticMeta('developer.quota', new Date().toISOString().slice(0, 10));

const responses = {
  200: {
    description: 'Current developer rate limits and daily quota usage',
    content: { 'application/json': { schema: envelope(DeveloperQuotaSchema) } },
  },
  401: {
    description: 'Invalid or inactive API key',
    content: { 'application/json': { schema: ErrorSchema } },
  },
};

export const developerRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

developerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/developer/quota',
    tags,
    summary: 'Check API key quota and rate limits',
    description:
      'Returns current tier limits, daily request quota, requests used today, and reset timestamp.',
    responses,
  }),
  (c) => {
    noStore(c);
    const apiKey = c.get('apiKey');
    const quotaResult = c.get('quotaResult');

    const tier = apiKey?.tier ?? 'anonymous';
    const tierConfig = TIERS[tier];

    // Mask API key for security
    const maskedKey = apiKey ? `${apiKey.key.slice(0, 8)}***${apiKey.key.slice(-4)}` : null;

    const data = {
      tier,
      tier_name: tierConfig.name,
      api_key: maskedKey,
      key_name: apiKey?.name ?? null,
      rate_limit_per_minute: apiKey?.rate_limit_per_minute ?? tierConfig.rate_limit_per_minute,
      daily_quota: quotaResult?.daily_quota ?? tierConfig.daily_quota,
      daily_used: quotaResult?.used ?? 0,
      daily_remaining: quotaResult?.remaining ?? tierConfig.daily_quota,
      resets_at: quotaResult?.resets_at ?? new Date().toISOString(),
      reset_seconds: quotaResult?.reset_seconds ?? 0,
    };

    return ok(c, data, meta());
  },
);

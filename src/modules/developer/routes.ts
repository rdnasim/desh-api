import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { TIERS } from '../../lib/api-key';
import { cachePublic, noStore } from '../../lib/cache';
import { ErrorSchema, envelope, ok, staticMeta } from '../../lib/envelope';
import { validationHook } from '../../lib/errors';
import {
  DeveloperQuotaSchema,
  DeveloperTiersResponseSchema,
  GenerateKeyRequestSchema,
  GeneratedKeyResponseSchema,
} from './schemas';

const tags = ['Developer'];
const meta = () => staticMeta('developer.quota', new Date().toISOString().slice(0, 10));
const tiersMeta = () => staticMeta('developer.tiers', '2026-11-17');
const keyMeta = () => staticMeta('developer.keys', new Date().toISOString().slice(0, 10));

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

developerRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/developer/tiers',
    tags,
    summary: 'List available developer access tiers and rate limits',
    description:
      'Returns all platform access tiers (Anonymous, Developer, Enterprise) with rate limits, daily quotas, and capabilities.',
    responses: {
      200: {
        description: 'Available platform tiers',
        content: { 'application/json': { schema: envelope(DeveloperTiersResponseSchema) } },
      },
    },
  }),
  (c) => {
    cachePublic(c);
    const data = {
      tiers: [
        {
          tier: 'anonymous',
          name: TIERS.anonymous.name,
          description: 'Instant zero-configuration access for quick testing, scripts, and open web apps.',
          rate_limit_per_minute: TIERS.anonymous.rate_limit_per_minute,
          daily_quota: TIERS.anonymous.daily_quota,
          price_bdt: 0,
          features: [
            'Zero signup or header configuration',
            '10,000 requests / day',
            '120 requests / minute burst',
            'Community-supported',
          ],
        },
        {
          tier: 'developer',
          name: TIERS.developer.name,
          description: 'For personal projects, client websites, mobile apps, and microservices.',
          rate_limit_per_minute: TIERS.developer.rate_limit_per_minute,
          daily_quota: TIERS.developer.daily_quota,
          price_bdt: 0,
          features: [
            'Dedicated developer API key',
            '50,000 requests / day',
            '600 requests / minute burst',
            'Telemetry & quota monitoring',
            'Commercial projects allowed',
          ],
        },
        {
          tier: 'enterprise',
          name: TIERS.enterprise.name,
          description: 'For high-volume fintechs, government portals, and national telecom platforms.',
          rate_limit_per_minute: TIERS.enterprise.rate_limit_per_minute,
          daily_quota: TIERS.enterprise.daily_quota,
          price_bdt: 0,
          features: [
            '500,000+ requests / day',
            '1,800 requests / minute burst',
            'Dedicated edge routing priority',
            'Direct Slack / Discord technical channel',
            'Custom endpoints and SLA support',
          ],
        },
      ],
    };

    return ok(c, data, tiersMeta());
  },
);

developerRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/developer/keys/generate',
    tags,
    summary: 'Generate a self-service developer sandbox API key',
    description:
      'Creates a developer API key token for immediate use in testing, local development, and CI environments.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: GenerateKeyRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully generated developer API key',
        content: { 'application/json': { schema: envelope(GeneratedKeyResponseSchema) } },
      },
      400: {
        description: 'Invalid key generation request',
        content: { 'application/json': { schema: ErrorSchema } },
      },
    },
  }),
  async (c) => {
    noStore(c);
    const body = c.req.valid('json');
    const randomHex = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const apiKey = `desh_dev_${randomHex}`;
    const now = new Date().toISOString();

    const data = {
      api_key: apiKey,
      name: body.name,
      tier: 'developer',
      rate_limit_per_minute: TIERS.developer.rate_limit_per_minute,
      daily_quota: TIERS.developer.daily_quota,
      created_at: now,
      instructions: `Pass your key in HTTP header: 'X-API-Key: ${apiKey}' or 'Authorization: Bearer ${apiKey}'`,
    };

    return ok(c, data, keyMeta());
  },
);

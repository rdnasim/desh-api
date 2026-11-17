import { z } from '@hono/zod-openapi';

export const DeveloperQuotaSchema = z
  .object({
    tier: z.string().openapi({ example: 'developer' }),
    tier_name: z.string().openapi({ example: 'Developer' }),
    api_key: z.string().nullable().openapi({ example: 'desh_dev_***' }),
    key_name: z.string().nullable().openapi({ example: 'Developer Test Key' }),
    rate_limit_per_minute: z.number().openapi({ example: 600 }),
    daily_quota: z.number().openapi({ example: 50000 }),
    daily_used: z.number().openapi({ example: 12 }),
    daily_remaining: z.number().openapi({ example: 49988 }),
    resets_at: z.string().openapi({ example: '2026-11-17T00:00:00.000Z' }),
    reset_seconds: z.number().openapi({ example: 38400 }),
  })
  .openapi('DeveloperQuota', {
    example: {
      tier: 'developer',
      tier_name: 'Developer',
      api_key: 'desh_dev_***',
      key_name: 'Developer Test Key',
      rate_limit_per_minute: 600,
      daily_quota: 50000,
      daily_used: 12,
      daily_remaining: 49988,
      resets_at: '2026-11-17T00:00:00.000Z',
      reset_seconds: 38400,
    },
  });

export type DeveloperQuota = z.infer<typeof DeveloperQuotaSchema>;

export const TierPlanSchema = z.object({
  tier: z.string().openapi({ example: 'developer' }),
  name: z.string().openapi({ example: 'Developer' }),
  description: z.string().openapi({ example: 'For personal projects, mobile apps, and startup backends' }),
  rate_limit_per_minute: z.number().openapi({ example: 600 }),
  daily_quota: z.number().openapi({ example: 50000 }),
  price_bdt: z.number().openapi({ example: 0 }),
  features: z.array(z.string()).openapi({ example: ['50k requests / day', '600 req/min burst', 'Commercial use allowed'] }),
});

export const DeveloperTiersResponseSchema = z
  .object({
    tiers: z.array(TierPlanSchema),
  })
  .openapi('DeveloperTiersResponse', {
    example: {
      tiers: [
        {
          tier: 'anonymous',
          name: 'Free / Anonymous',
          description: 'Instant zero-configuration access for quick testing and open scripts',
          rate_limit_per_minute: 120,
          daily_quota: 10000,
          price_bdt: 0,
          features: ['No signup required', '10k requests / day', '120 req/min burst'],
        },
        {
          tier: 'developer',
          name: 'Developer',
          description: 'For personal projects, client websites, mobile apps, and microservices',
          rate_limit_per_minute: 600,
          daily_quota: 50000,
          price_bdt: 0,
          features: ['Free API Key', '50k requests / day', '600 req/min burst', 'Telemetry & Quota Monitoring'],
        },
        {
          tier: 'enterprise',
          name: 'Enterprise / Partner',
          description: 'For high-volume fintechs, government portals, and national platforms',
          rate_limit_per_minute: 1800,
          daily_quota: 500000,
          price_bdt: 0,
          features: ['500k+ requests / day', 'Dedicated edge priority', 'Direct Slack/Discord channel', 'Custom endpoints'],
        },
      ],
    },
  });

export type DeveloperTiersResponse = z.infer<typeof DeveloperTiersResponseSchema>;

export const GenerateKeyRequestSchema = z.object({
  name: z.string().min(2).max(64).openapi({ example: 'My Dhaka Ride App' }),
  email: z.string().email().optional().openapi({ example: 'dev@example.com' }),
});

export const GeneratedKeyResponseSchema = z
  .object({
    api_key: z.string().openapi({ example: 'desh_dev_a1b2c3d4e5f6g7h8' }),
    name: z.string().openapi({ example: 'My Dhaka Ride App' }),
    tier: z.string().openapi({ example: 'developer' }),
    rate_limit_per_minute: z.number().openapi({ example: 600 }),
    daily_quota: z.number().openapi({ example: 50000 }),
    created_at: z.string().openapi({ example: '2026-11-17T16:00:00.000Z' }),
    instructions: z.string().openapi({
      example: 'Pass your key in HTTP header: X-API-Key: desh_dev_a1b2c3d4e5f6g7h8 or Authorization: Bearer desh_dev_a1b2c3d4e5f6g7h8',
    }),
  })
  .openapi('GeneratedKeyResponse', {
    example: {
      api_key: 'desh_dev_a1b2c3d4e5f6g7h8',
      name: 'My Dhaka Ride App',
      tier: 'developer',
      rate_limit_per_minute: 600,
      daily_quota: 50000,
      created_at: '2026-11-17T16:00:00.000Z',
      instructions: 'Pass your key in HTTP header: X-API-Key: desh_dev_a1b2c3d4e5f6g7h8 or Authorization: Bearer desh_dev_a1b2c3d4e5f6g7h8',
    },
  });

export type GeneratedKeyResponse = z.infer<typeof GeneratedKeyResponseSchema>;

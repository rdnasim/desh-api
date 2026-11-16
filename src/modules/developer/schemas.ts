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

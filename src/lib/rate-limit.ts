import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';
import {
  type ApiKeyRecord,
  type ApiKeyTier,
  checkAndIncrementQuota,
  extractApiKey,
  resolveApiKey,
  TIERS,
} from './api-key';
import { ApiError } from './errors';

export const rateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  const rawKey = extractApiKey((name) => c.req.header(name));

  let apiKey: ApiKeyRecord | undefined;
  let tier: ApiKeyTier = 'anonymous';
  let perMinuteLimit = TIERS.anonymous.rate_limit_per_minute;
  let dailyQuota = TIERS.anonymous.daily_quota;
  let clientIdentifier: string;

  if (rawKey) {
    const resolved = resolveApiKey(rawKey, c.env?.API_KEYS);
    if (!resolved || !resolved.active) {
      throw new ApiError('unauthorized', 'Invalid or inactive API key', {
        message_bn: 'অবৈধ বা নিষ্ক্রিয় এপিআই কি',
      });
    }
    apiKey = resolved;
    tier = resolved.tier;
    perMinuteLimit = resolved.rate_limit_per_minute;
    dailyQuota = resolved.daily_quota;
    clientIdentifier = `key:${resolved.key}`;
    c.set('apiKey', apiKey);
  } else {
    const ip = c.req.header('CF-Connecting-IP') ?? 'anonymous';
    clientIdentifier = `ip:${ip}`;
  }

  // 1. Daily Quota Check & Tracking
  const quotaKv = c.env?.QUOTA_KV ?? c.env?.LIVE_DATA;
  const quotaResult = await checkAndIncrementQuota(clientIdentifier, dailyQuota, quotaKv);
  c.set('quotaResult', quotaResult);

  // Set rate limiting & quota headers on every response
  c.header('X-RateLimit-Tier', tier);
  c.header('X-RateLimit-Limit-Minute', String(perMinuteLimit));
  c.header('X-RateLimit-Limit-Daily', String(dailyQuota));
  c.header('X-RateLimit-Remaining-Daily', String(quotaResult.remaining));
  c.header('X-RateLimit-Reset', String(quotaResult.reset_seconds));

  if (!quotaResult.allowed) {
    c.header('Retry-After', String(quotaResult.reset_seconds));
    throw new ApiError(
      'quota_exceeded',
      `Daily quota of ${dailyQuota.toLocaleString()} requests exceeded for tier '${tier}'. Resets at midnight UTC.`,
      {
        message_bn: 'দৈনিক অনুরোধের কোটা পূর্ণ হয়েছে, রাত ১২:০০ টায় রিসেট হবে',
      },
    );
  }

  // 2. Per-minute Rate Limiting Check (Cloudflare Workers binding if available)
  const limiter = c.env?.RATE_LIMITER;
  if (limiter) {
    const { success } = await limiter.limit({ key: clientIdentifier });
    if (!success) {
      c.header('Retry-After', '60');
      throw new ApiError(
        'rate_limited',
        `Too many requests: limit is ${perMinuteLimit} per minute`,
        {
          message_bn: 'অনেক বেশি অনুরোধ, এক মিনিট পরে আবার চেষ্টা করুন',
        },
      );
    }
  }

  await next();
};

import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../env';
import { ApiError } from './errors';

export const rateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  const limiter = c.env?.RATE_LIMITER;
  if (limiter) {
    const key = c.req.header('CF-Connecting-IP') ?? 'anonymous';
    const { success } = await limiter.limit({ key });
    if (!success) {
      c.header('Retry-After', '60');
      throw new ApiError('rate_limited', 'Too many requests: limit is 120 per minute per IP', {
        message_bn: 'অনেক বেশি অনুরোধ, এক মিনিট পরে আবার চেষ্টা করুন',
      });
    }
  }
  await next();
};

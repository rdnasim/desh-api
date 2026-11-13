import type { Context, MiddlewareHandler } from 'hono';

const PUBLIC = 'public, max-age=86400, s-maxage=604800';

/** Reference data and deterministic conversions: cache at the edge and in browsers. */
export function cachePublic(c: Context): void {
  c.header('Cache-Control', PUBLIC);
}

/** Validators and random content: never cache. */
export function noStore(c: Context): void {
  c.header('Cache-Control', 'no-store');
}

/** Privacy-safe default: anything that did not opt into caching is `no-store`. */
export const defaultNoStore: MiddlewareHandler = async (c, next) => {
  await next();
  if (!c.res.headers.has('Cache-Control')) c.res.headers.set('Cache-Control', 'no-store');
};

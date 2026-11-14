import type { MiddlewareHandler } from 'hono';
import { matchedRoutes } from 'hono/route';

/**
 * One structured line per request. Logs the route *template* (e.g. `/v1/validate/nid/:number`),
 * never the URL, query string, or body, so personal identifiers never reach logs.
 */
export const logger: MiddlewareHandler = async (c, next) => {
  const started = Date.now();
  await next();
  const route = matchedRoutes(c)
    .filter((r) => r.method !== 'ALL')
    .at(-1)?.path;
  console.log(
    JSON.stringify({
      method: c.req.method,
      route: route ?? 'unmatched',
      status: c.res.status,
      ms: Date.now() - started,
    }),
  );
};

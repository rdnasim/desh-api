import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import type { AppEnv } from './env';
import { defaultNoStore } from './lib/cache';
import { errorHandler, notFoundHandler, validationHook } from './lib/errors';
import { logger } from './lib/logger';
import { rateLimit } from './lib/rate-limit';
import { banglaRoutes } from './modules/bangla/routes';
import { convertRoutes } from './modules/convert/routes';
import { geoRoutes } from './modules/geo/routes';
import { landRoutes } from './modules/land/routes';
import { phoneRoutes } from './modules/phone/routes';

const MODULES = [
  {
    name: 'Geo',
    description: 'Divisions, districts, upazilas, unions, postcodes, search',
    path: '/v1/divisions',
  },
];

const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

app.use('*', logger);
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));
app.use('*', defaultNoStore);
app.use('*', etag());
app.use('/v1/*', rateLimit);

app.get('/', (c) =>
  c.json({
    name: 'Desh API',
    description: 'Open public API for Bangladesh: reference data and Bangla language tools',
    docs: '/docs',
    openapi: '/openapi.json',
    modules: MODULES,
  }),
);

app.get('/health', (c) => c.json({ status: 'ok', version: c.env?.VERSION ?? 'dev' }));

app.route('/v1', geoRoutes);
app.route('/v1', banglaRoutes);
app.route('/v1', phoneRoutes);
app.route('/v1', convertRoutes);
app.route('/v1', landRoutes);

app.doc31('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Desh API',
    version: '1.0.0',
    description:
      'Free, open, bilingual API for Bangladesh reference data and Bangla language tools. Every response includes `meta.source` and `meta.last_updated`.',
    license: { name: 'MIT (code), CC BY 4.0 (data)' },
  },
});

app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Desh API' }));

app.notFound(notFoundHandler(() => app.routes));
app.onError(errorHandler);

export default app;

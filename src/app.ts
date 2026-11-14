import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { OPENAPI_CONFIG } from './docs';
import type { AppEnv } from './env';
import { defaultNoStore } from './lib/cache';
import { errorHandler, notFoundHandler, validationHook } from './lib/errors';
import { logger } from './lib/logger';
import { rateLimit } from './lib/rate-limit';
import { banglaRoutes } from './modules/bangla/routes';
import { convertRoutes } from './modules/convert/routes';
import { funRoutes } from './modules/fun/routes';
import { geoRoutes } from './modules/geo/routes';
import { holidayRoutes } from './modules/holidays/routes';
import { hotlineRoutes } from './modules/hotlines/routes';
import { landRoutes } from './modules/land/routes';
import { phoneRoutes } from './modules/phone/routes';
import { validateRoutes } from './modules/validate/routes';

const MODULES = [
  {
    name: 'Geo',
    description: 'Divisions, districts, upazilas, unions, postcodes, search, nearest area',
    path: '/v1/divisions',
  },
  {
    name: 'Bangla toolkit',
    description:
      'Number and taka in words, digits, lakh/crore formatting, Bangla date, ordinals, slugs, transliteration',
    path: '/v1/bangla/num-to-words?n=1250',
  },
  {
    name: 'Phone',
    description: 'Validate and normalise mobile numbers, original operator',
    path: '/v1/phone/01712345678',
  },
  {
    name: 'Convert',
    description: 'Bijoy (SutonnyMJ) to Unicode and back (POST)',
    path: '/v1/convert/bijoy-to-unicode',
  },
  {
    name: 'Land',
    description: 'Land unit conversion (katha, bigha, decimal, acre, …)',
    path: '/v1/land/convert?value=5&from=katha&to=sqft',
  },
  {
    name: 'Validate',
    description: 'Format checks for NID, vehicle plates, TIN, BIN and postcodes (nothing stored)',
    path: '/v1/validate/postcode/1205',
  },
  {
    name: 'Hotlines',
    description: 'Official national hotline numbers with source and verification date',
    path: '/v1/hotlines?category=emergency',
  },
  {
    name: 'Fun',
    description: 'Proverbs, riddles, quiz, GI foods and on-this-day history',
    path: '/v1/fun/proverb/random',
  },
  {
    name: 'Holidays',
    description: 'Official public holidays, is-it-a-holiday checks and working-day counts',
    path: '/v1/is-holiday?date=2027-12-16',
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
app.route('/v1', validateRoutes);
app.route('/v1', hotlineRoutes);
app.route('/v1', funRoutes);
app.route('/v1', holidayRoutes);

app.doc31('/openapi.json', OPENAPI_CONFIG);

app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Desh API' }));

app.notFound(notFoundHandler(() => app.routes));
app.onError(errorHandler);

export default app;

import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { OPENAPI_CONFIG } from './docs';
import type { AppEnv } from './env';
import { LANDING_HTML } from './landing';
import { defaultNoStore } from './lib/cache';
import { errorHandler, notFoundHandler, validationHook } from './lib/errors';
import { logger } from './lib/logger';
import { rateLimit } from './lib/rate-limit';
import { airportRoutes } from './modules/airports/routes';
import { banglaRoutes } from './modules/bangla/routes';
import { bankRoutes } from './modules/banks/routes';
import { constituencyRoutes } from './modules/constituencies/routes';
import { convertRoutes } from './modules/convert/routes';
import { developerRoutes } from './modules/developer/routes';
import { educationRoutes } from './modules/education/routes';
import { financeRoutes } from './modules/finance/routes';
import { funRoutes } from './modules/fun/routes';
import { geoRoutes } from './modules/geo/routes';
import { goldRoutes } from './modules/gold/routes';
import { healthRoutes } from './modules/health/routes';
import { heritageRoutes } from './modules/heritage/routes';
import { holidayRoutes } from './modules/holidays/routes';
import { hotlineRoutes } from './modules/hotlines/routes';
import { landRoutes } from './modules/land/routes';
import { marketRoutes } from './modules/market/routes';
import { metroRoutes } from './modules/metro/routes';
import { mfsRoutes } from './modules/mfs/routes';
import { mockRoutes } from './modules/mock/routes';
import { phoneRoutes } from './modules/phone/routes';
import { prayerRoutes } from './modules/prayer/routes';
import { railwayRoutes } from './modules/railway/routes';
import { riverRoutes } from './modules/rivers/routes';
import { validateRoutes } from './modules/validate/routes';
import { weatherRoutes } from './modules/weather/routes';

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
  {
    name: 'Finance',
    description: 'Income tax (Finance Act 2026), VAT, loan EMI, DPS and gratuity calculators',
    path: '/v1/finance/income-tax?income=1000000',
  },
  {
    name: 'Mock data',
    description: 'Synthetic Bangladeshi people and addresses for testing (bilingual, repeatable)',
    path: '/v1/mock/people?count=3&seed=demo',
  },
  {
    name: 'Banks',
    description: 'Banks and their 11,533 branches from Bangladesh Bank, with routing numbers',
    path: '/v1/routing/010130065',
  },
  {
    name: 'Education',
    description:
      'UGC universities, 11 statutory education boards, official GPA 5.0 grading scale and calculator',
    path: '/v1/universities?category=public',
  },
  {
    name: 'Gold & zakat',
    description: 'Current BAJUS gold and silver prices (per gram and vori) and a zakat calculator',
    path: '/v1/gold/prices',
  },
  {
    name: 'Market prices',
    description:
      "Today's TCB retail prices of essential goods in Dhaka, and government fuel prices",
    path: '/v1/market/prices?category=edible-oil',
  },
  {
    name: 'MFS',
    description:
      'Mobile Financial Services (bKash, Nagad, Rocket, Upay, TAP) tariffs, USSD codes and calculator',
    path: '/v1/mfs/providers',
  },
  {
    name: 'Prayer Times & Ramadan',
    description:
      'Daily 5 prayer times, Sehri cutoff, and 30-day Ramadan timetable for all 64 districts',
    path: '/v1/prayer/times?district=dhaka',
  },
  {
    name: 'Dhaka Metro Rail',
    description:
      'MRT Line-6 stations, GPS coordinates, timetables, and single-journey vs MRT Pass fare calculator',
    path: '/v1/metro/stations',
  },
  {
    name: 'Health',
    description:
      'National government hospitals, specialized institutes, bed capacities, emergency hotlines and GPS coordinates',
    path: '/v1/health/hospitals?type=medical_college',
  },
  {
    name: 'Weather & Disaster Signals',
    description:
      'BMD maritime storm signals (1-11), inland riverport signals (1-4), DoE Air Quality Index (AQI) categories and 6 Bangla seasons',
    path: '/v1/weather/signals/maritime',
  },
  {
    name: 'Bangladesh Railway',
    description:
      'Intercity express trains (Suborno, Sonar Bangla, Parabat, Silk City), schedules, off-days, coach classes, and major stations',
    path: '/v1/railway/trains?origin=dhaka&destination=chattogram',
  },
  {
    name: 'Constituencies',
    description:
      '300 general single-member territorial constituencies (Jatiya Sangsad আসন ১-৩০০) with seat counts by district',
    path: '/v1/constituencies?district=dhaka',
  },
  {
    name: 'Airports',
    description:
      'Civil Aviation Authority of Bangladesh (CAAB) international and domestic airports, IATA/ICAO codes, coordinates, and runway dimensions',
    path: '/v1/airports',
  },
  {
    name: 'Heritage',
    description:
      'UNESCO World Heritage sites, archaeological monuments, eco-tourism reserves, and national landmarks',
    path: '/v1/heritage',
  },
  {
    name: 'Rivers',
    description:
      'Major river networks (Padma, Meghna, Jamuna, Karnaphuli, Halda), lengths, origins, and traversed districts',
    path: '/v1/rivers',
  },
  {
    name: 'Developer',
    description: 'Developer rate limits, API keys, and daily request quota inspection',
    path: '/v1/developer/quota',
  },
];

const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

app.use('*', logger);
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
    exposeHeaders: [
      'X-RateLimit-Tier',
      'X-RateLimit-Limit-Minute',
      'X-RateLimit-Limit-Daily',
      'X-RateLimit-Remaining-Daily',
      'X-RateLimit-Reset',
      'ETag',
    ],
  }),
);
app.use('*', defaultNoStore);
app.use('*', etag());
app.use('/v1/*', rateLimit);

// Browsers get the landing page; API clients (curl, fetch) get the JSON index.
app.get('/', (c) => {
  c.header('Vary', 'Accept');
  if (c.req.header('accept')?.includes('text/html')) {
    c.header('Cache-Control', 'public, max-age=3600');
    return c.html(LANDING_HTML);
  }
  return c.json({
    name: 'Desh API',
    description:
      'Open public API for Bangladesh: reference data, Bangla language tools, validators and calculators',
    docs: '/docs',
    openapi: '/openapi.json',
    modules: MODULES,
  });
});

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
app.route('/v1', financeRoutes);
app.route('/v1', mockRoutes);
app.route('/v1', bankRoutes);
app.route('/v1', educationRoutes);
app.route('/v1', goldRoutes);
app.route('/v1', marketRoutes);
app.route('/v1', mfsRoutes);
app.route('/v1', prayerRoutes);
app.route('/v1', metroRoutes);
app.route('/v1', healthRoutes);
app.route('/v1', weatherRoutes);
app.route('/v1', railwayRoutes);
app.route('/v1', airportRoutes);
app.route('/v1', heritageRoutes);
app.route('/v1', riverRoutes);
app.route('/v1', constituencyRoutes);
app.route('/v1', developerRoutes);

app.doc31('/openapi.json', OPENAPI_CONFIG);

app.get('/docs', Scalar({ url: '/openapi.json', pageTitle: 'Desh API' }));

app.notFound(notFoundHandler(() => app.routes));
app.onError(errorHandler);

export default app;

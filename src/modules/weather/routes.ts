import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import {
  AqiCategorySchema,
  AqiLookupResponseSchema,
  BanglaSeasonSchema,
  MaritimeSignalSchema,
  RiverportSignalSchema,
} from './schemas';
import {
  getBanglaSeason,
  getMaritimeSignal,
  getRiverportSignal,
  listAqiCategories,
  listBanglaSeasons,
  listMaritimeSignals,
  listRiverportSignals,
  lookupAqi,
} from './service';

const tags = ['Weather & Disaster Signals'];

const maritimeMeta = () => metaFor(['weather.maritime-signals']);
const riverportMeta = () => metaFor(['weather.riverport-signals']);
const aqiMeta = () => metaFor(['weather.aqi-categories']);
const seasonMeta = () => metaFor(['weather.seasons']);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
});

const invalid = (message: string): never => {
  throw new ApiError('invalid_parameter', message);
};

export const weatherRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/signals/maritime',
    tags,
    summary: 'BMD Maritime Storm Warning Signals (1 to 11)',
    description:
      'Official Bangladesh Meteorological Department (BMD) maritime storm warning signals from Distant Cautionary 1 to Communication Failure 11 with wind speeds, coastal tracking, and safety instructions.',
    responses: responses(z.array(MaritimeSignalSchema), 'Maritime warning signals'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listMaritimeSignals(), maritimeMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/signals/maritime/{number}',
    tags,
    summary: 'Lookup a maritime storm signal by number (1-11) or slug',
    description:
      'Returns details of a specific maritime storm signal including Bengali nomenclature, port danger level, wind speeds, and evacuation directions.',
    request: {
      params: z.object({
        number: z
          .string()
          .openapi({ param: { name: 'number', in: 'path', description: 'Signal number (1 to 11) or slug' }, example: '10' }),
      }),
    },
    responses: responses(MaritimeSignalSchema, 'Maritime signal details'),
  }),
  (c) => {
    const { number } = c.req.valid('param');
    const signal = getMaritimeSignal(number);
    if (!signal) {
      throw new ApiError('not_found', `Maritime signal '${number}' not found`, {
        message_bn: 'সমুদ্র সতর্ক সংকেত পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, signal, maritimeMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/signals/riverport',
    tags,
    summary: 'BMD Inland Riverport Warning Signals (1 to 4)',
    description:
      'Inland riverport warning signals issued jointly by BMD and BIWTA for passenger ferries, motor launches, and cargo trawlers on inland waterways.',
    responses: responses(z.array(RiverportSignalSchema), 'Riverport warning signals'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listRiverportSignals(), riverportMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/signals/riverport/{number}',
    tags,
    summary: 'Lookup an inland riverport signal by number (1-4) or slug',
    description:
      'Returns riverport signal details including 65-foot vessel navigation rules, squall thresholds, and safety measures.',
    request: {
      params: z.object({
        number: z
          .string()
          .openapi({ param: { name: 'number', in: 'path', description: 'Riverport signal number (1 to 4) or slug' }, example: '2' }),
      }),
    },
    responses: responses(RiverportSignalSchema, 'Riverport signal details'),
  }),
  (c) => {
    const { number } = c.req.valid('param');
    const signal = getRiverportSignal(number);
    if (!signal) {
      throw new ApiError('not_found', `Riverport signal '${number}' not found`, {
        message_bn: 'নদীবন্দর সতর্ক সংকেত পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, signal, riverportMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/aqi/categories',
    tags,
    summary: 'Department of Environment (DoE) Air Quality Index (AQI) categories',
    description:
      'Official 6-tier national AQI classification (0-50 Good to 301+ Hazardous) with HEX colors, health impact descriptions, and sensitive group precautions.',
    responses: responses(z.array(AqiCategorySchema), 'AQI categories'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listAqiCategories(), aqiMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/aqi/lookup',
    tags,
    summary: 'Convert raw AQI number to category, color, and health advisory',
    description:
      'Maps any Air Quality Index value (0 to 500+) to its corresponding DoE classification with actionable outdoor and mask recommendations.',
    request: {
      query: z.object({
        value: z
          .string()
          .openapi({ param: { name: 'value', in: 'query', description: 'Numeric AQI value (0 to 500+)' }, example: '165' }),
      }),
    },
    responses: responses(AqiLookupResponseSchema, 'AQI classification and advisory'),
  }),
  (c) => {
    const { value } = c.req.valid('query');
    const aqiNum = parseInt(value, 10);
    if (isNaN(aqiNum) || aqiNum < 0) {
      invalid('value must be a non-negative integer');
    }
    const result = lookupAqi(aqiNum);
    if (!result) {
      throw new ApiError('not_found', `Unable to classify AQI value ${value}`);
    }
    cachePublic(c);
    return ok(c, result, aqiMeta());
  },
);

weatherRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/weather/seasons',
    tags,
    summary: 'Traditional 6 Bangla seasons (ষড়ঋতু)',
    description:
      'The six traditional Bengali seasons (গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত) with their corresponding Bangla months, Gregorian dates, and climatic traits.',
    responses: responses(z.array(BanglaSeasonSchema), 'Bangla seasons'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listBanglaSeasons(), seasonMeta());
  },
);

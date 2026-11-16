import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import {
  RailwayClassCodeSchema,
  RailwayClassSchema,
  RailwayStationSchema,
  RailwayTrainSchema,
} from './schemas';
import {
  getRailwayClass,
  getRailwayStation,
  getTrain,
  listRailwayClasses,
  listRailwayStations,
  listTrains,
} from './service';

const tags = ['Bangladesh Railway'];

const trainMeta = () => metaFor(['railway.trains']);
const classMeta = () => metaFor(['railway.classes']);
const stationMeta = () => metaFor(['railway.stations']);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
});

const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

const invalid = (message: string): never => {
  throw new ApiError('invalid_parameter', message);
};

export const railwayRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

railwayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/railway/trains',
    tags,
    summary: 'Bangladesh Railway intercity express trains directory',
    description:
      'List of major intercity express trains with official train numbers, departure/arrival schedules, weekly off-days, and available coach classes.',
    request: {
      query: z.object({
        origin: query('origin', 'Origin station or city (e.g. dhaka, chattogram)', 'dhaka'),
        destination: query('destination', 'Destination station or city (e.g. rajshahi, sylhet)', 'chattogram'),
        class: query('class', 'Coach class: SHOVON, S_CHAIR, SNIGDHA, AC_S, AC_B', 'SNIGDHA'),
        off_day: query('off_day', 'Weekly off day (e.g. Monday, Wednesday)', 'Monday'),
        q: query('q', 'Search train name, number, or intermediate halts', 'suborno'),
      }),
    },
    responses: responses(z.array(RailwayTrainSchema), 'List of intercity trains'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let classCode: z.infer<typeof RailwayClassCodeSchema> | undefined;
    if (q.class !== undefined) {
      const parsed = RailwayClassCodeSchema.safeParse(q.class.toUpperCase());
      classCode = parsed.success
        ? parsed.data
        : invalid(`class must be one of: ${RailwayClassCodeSchema.options.join(', ')}`);
    }

    cachePublic(c);
    return ok(
      c,
      listTrains({
        origin: q.origin,
        destination: q.destination,
        classCode,
        offDay: q.off_day,
        q: q.q,
      }),
      trainMeta(),
    );
  },
);

railwayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/railway/trains/{number}',
    tags,
    summary: 'Lookup a train by official 3-digit number or slug',
    description:
      'Returns complete route details, departure and arrival times, intermediate major halts, and available coach classes.',
    request: {
      params: z.object({
        number: z
          .string()
          .openapi({ param: { name: 'number', in: 'path', description: 'Train number (e.g. 701, 788) or slug' }, example: '701' }),
      }),
    },
    responses: responses(RailwayTrainSchema, 'Train route details'),
  }),
  (c) => {
    const { number } = c.req.valid('param');
    const train = getTrain(number);
    if (!train) {
      throw new ApiError('not_found', `Train '${number}' not found`, {
        message_bn: 'ট্রেনের তথ্য পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, train, trainMeta());
  },
);

railwayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/railway/classes',
    tags,
    summary: 'Official Bangladesh Railway coach and seat classes',
    description:
      'All 7 standard BR passenger coach classes (Shovon, Shovon Chair, Snigdha, First Class Seat/Berth, AC Seat/Berth) with AC status and descriptions.',
    responses: responses(z.array(RailwayClassSchema), 'Coach classes'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listRailwayClasses(), classMeta());
  },
);

railwayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/railway/stations',
    tags,
    summary: 'Major railway junction and division stations',
    description:
      'Directory of primary railway stations, station codes, divisions, districts, and GPS coordinates across East and West railway zones.',
    request: {
      query: z.object({
        division: query('division', 'Division slug (e.g. dhaka, chattogram, rajshahi)', 'dhaka'),
        district: query('district', 'District slug', 'dhaka'),
        q: query('q', 'Search station name or 2-3 letter code', 'kamalapur'),
      }),
    },
    responses: responses(z.array(RailwayStationSchema), 'Railway stations'),
  }),
  (c) => {
    const q = c.req.valid('query');
    if (q.division !== undefined && !getDivision(q.division)) {
      invalid(`division '${q.division}' is not a valid division slug`);
    }
    if (q.district !== undefined && !getDistrict(q.district)) {
      invalid(`district '${q.district}' is not a valid district slug`);
    }
    cachePublic(c);
    return ok(c, listRailwayStations({ division: q.division, district: q.district, q: q.q }), stationMeta());
  },
);

railwayRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/railway/stations/{code}',
    tags,
    summary: 'Lookup a railway station by code or slug',
    description:
      'Returns station details, station code (e.g. DA, CG, AIR, SYL, SNT), and GPS coordinates.',
    request: {
      params: z.object({
        code: z
          .string()
          .openapi({ param: { name: 'code', in: 'path', description: 'Station code (e.g. DA, CG) or slug' }, example: 'DA' }),
      }),
    },
    responses: responses(RailwayStationSchema, 'Railway station details'),
  }),
  (c) => {
    const { code } = c.req.valid('param');
    const station = getRailwayStation(code);
    if (!station) {
      throw new ApiError('not_found', `Railway station '${code}' not found`, {
        message_bn: 'রেলওয়ে স্টেশন পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, station, stationMeta());
  },
);

import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import {
  MetroFareCalculationSchema,
  MetroLineSchema,
  MetroStationSchema,
  MetroStationStatusSchema,
  MetroTimetableSchema,
} from './schemas';
import { calculateFare, getMetroLine, getStation, getTimetable, listStations } from './service';

const tags = ['Dhaka Metro Rail'];
const meta = () => metaFor(['metro.stations']);

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

export const metroRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

metroRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/metro/stations',
    tags,
    summary: 'List Dhaka Metro Rail (MRT Line-6) stations',
    description:
      'Returns all 16 operational MRT Line-6 stations plus Kamalapur under construction, in north-to-south sequence with GPS coordinates, official station codes, and bilingual names.',
    request: {
      query: z.object({
        status: MetroStationStatusSchema.optional().openapi({
          param: {
            name: 'status',
            in: 'query',
            description: 'Filter by station status (operational or under_construction)',
          },
          example: 'operational',
        }),
        q: query('q', 'Filter by station name in English or Bangla, or station code', 'mirpur'),
      }),
    },
    responses: responses(z.array(MetroStationSchema), 'List of MRT Line-6 stations'),
  }),
  (c) => {
    cachePublic(c);
    const { status, q } = c.req.valid('query');
    let items = listStations(status);
    if (q) {
      const term = q.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.slug.toLowerCase().includes(term) ||
          s.name_en.toLowerCase().includes(term) ||
          s.name_bn.includes(term) ||
          s.code.toLowerCase() === term,
      );
    }
    return ok(c, items, meta());
  },
);

metroRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/metro/stations/{slug}',
    tags,
    summary: 'Get details of a single MRT station',
    description:
      'Returns full station information including GPS coordinates, accessibility features, order, and connection routes by station slug or code.',
    request: {
      params: z.object({
        slug: z
          .string()
          .openapi({
            param: { name: 'slug', in: 'path', description: 'Station slug or code' },
            example: 'uttara-north',
          }),
      }),
    },
    responses: responses(MetroStationSchema, 'Station details'),
  }),
  (c) => {
    cachePublic(c);
    const { slug } = c.req.valid('param');
    const station = getStation(slug);
    if (!station) {
      throw new ApiError('not_found', `Unknown metro station '${slug}'. See /v1/metro/stations.`);
    }
    return ok(c, station, meta());
  },
);

metroRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/metro/fare',
    tags,
    summary: 'Calculate station-to-station metro rail fare',
    description:
      'Calculates the official DMTCL fare between any two stations on MRT Line-6, comparing Single Journey Ticket price against the 10% MRT Pass / Rapid Pass discount, and includes estimated travel time.',
    request: {
      query: z.object({
        from: z
          .string()
          .openapi({
            param: { name: 'from', in: 'query', description: 'Origin station slug or code' },
            example: 'uttara-north',
          }),
        to: z
          .string()
          .openapi({
            param: { name: 'to', in: 'query', description: 'Destination station slug or code' },
            example: 'motijheel',
          }),
      }),
    },
    responses: responses(MetroFareCalculationSchema, 'Fare calculation and travel summary'),
  }),
  (c) => {
    cachePublic(c);
    const { from, to } = c.req.valid('query');
    try {
      const fare = calculateFare(from, to);
      return ok(c, fare, meta());
    } catch (err: any) {
      if (err.message.includes('UNKNOWN_STATION')) {
        throw new ApiError('not_found', err.message);
      }
      if (err.message.includes('SAME_STATION')) {
        throw new ApiError('invalid_parameter', err.message);
      }
      throw err;
    }
  },
);

metroRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/metro/timetable',
    tags,
    summary: 'Dhaka Metro Rail operating timetable & schedule',
    description:
      'Returns official DMTCL train schedules: Saturday–Thursday regular service hours, peak vs off-peak headways, last train cutoffs for MRT Pass holders, and Friday afternoon schedule.',
    request: {},
    responses: responses(MetroTimetableSchema, 'Metro operating timetable'),
  }),
  (c) => {
    cachePublic(c);
    const tt = getTimetable();
    return ok(c, tt, meta());
  },
);

metroRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/metro/lines',
    tags,
    summary: 'MRT Line-6 network details',
    description:
      'Returns technical and operational details for Dhaka Metro Rail Line-6: route length, terminal stations, gauge, power system, and phase statuses.',
    request: {},
    responses: responses(MetroLineSchema, 'MRT Line-6 specifications'),
  }),
  (c) => {
    cachePublic(c);
    const line = getMetroLine();
    return ok(c, line, meta());
  },
);

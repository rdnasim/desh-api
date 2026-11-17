import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import { AirportSchema, AirportStatusSchema, AirportTypeSchema } from './schemas';
import { getAirport, listAirports } from './service';

const tags = ['Airports'];
const meta = () => metaFor(['airports.airports']);

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

export const airportRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

airportRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/airports',
    tags,
    summary: 'List international and domestic airports in Bangladesh',
    description:
      'Directory of international airports, domestic operational airports, STOL airstrips and CAAB aviation facilities with IATA and ICAO codes.',
    request: {
      query: z.object({
        division: query('division', 'Division slug, e.g. dhaka, chattogram', 'dhaka'),
        district: query('district', 'District slug, e.g. dhaka, coxs-bazar', 'dhaka'),
        type: query(
          'type',
          'international, domestic, short_takeoff, military_airstrip',
          'international',
        ),
        status: query('status', 'operational, under_development, inactive', 'operational'),
        q: query('q', 'Search by airport name, city, IATA or ICAO code', 'Shahjalal'),
      }),
    },
    responses: responses(z.array(AirportSchema), 'List of airports'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let type: z.infer<typeof AirportTypeSchema> | undefined;
    if (q.type !== undefined) {
      const parsed = AirportTypeSchema.safeParse(q.type);
      type = parsed.success
        ? parsed.data
        : invalid(`type must be one of: ${AirportTypeSchema.options.join(', ')}`);
    }
    let status: z.infer<typeof AirportStatusSchema> | undefined;
    if (q.status !== undefined) {
      const parsed = AirportStatusSchema.safeParse(q.status);
      status = parsed.success
        ? parsed.data
        : invalid(`status must be one of: ${AirportStatusSchema.options.join(', ')}`);
    }
    if (q.division !== undefined && !getDivision(q.division)) {
      invalid(`division '${q.division}' is not a valid division slug`);
    }
    if (q.district !== undefined && !getDistrict(q.district)) {
      invalid(`district '${q.district}' is not a valid district slug`);
    }

    cachePublic(c);
    return ok(
      c,
      listAirports({
        division: q.division,
        district: q.district,
        type,
        status,
        q: q.q,
      }),
      meta(),
    );
  },
);

airportRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/airports/{identifier}',
    tags,
    summary: 'Lookup an airport by IATA code, ICAO code, or slug',
    description:
      'Returns complete airport data including IATA/ICAO codes, coordinates, runway lengths, elevation, and operational status.',
    request: {
      params: z.object({
        identifier: z.string().openapi({
          param: { name: 'identifier', in: 'path' },
          example: 'DAC',
          description: 'IATA code (e.g. DAC, CGP), ICAO code (e.g. VGHS, VGEG), or slug',
        }),
      }),
    },
    responses: responses(AirportSchema, 'Airport details'),
  }),
  (c) => {
    const { identifier } = c.req.valid('param');
    const airport = getAirport(identifier);
    if (!airport) {
      throw new ApiError('not_found', `Airport '${identifier}' not found`, {
        message_bn: 'বিমানবন্দর পাওয়া যায়নি',
      });
    }

    cachePublic(c);
    return ok(c, airport, meta());
  },
);

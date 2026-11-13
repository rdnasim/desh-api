import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { toLatinDigits } from '../../lib/digits';
import { ErrorSchema, envelope, metaFor, ok, paginate } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam, pageParams } from '../../lib/params';
import { SlugSchema } from '../../lib/schemas';
import {
  DistrictSchema,
  DivisionSchema,
  GeoLevelSchema,
  ParentsSchema,
  PostOfficeSchema,
  SearchHitSchema,
  UnionSchema,
  UpazilaSchema,
} from './schemas';
import * as geo from './service';

const tags = ['Geo'];
const errors = {
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
  404: { description: 'Not found', content: { 'application/json': { schema: ErrorSchema } } },
};
const json = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  ...errors,
});

const pathSlug = (name: string, example: string) =>
  SlugSchema.openapi({ param: { name, in: 'path' }, example });
const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });
const pageQuery = {
  page: query('page', 'Page number, starting at 1'),
  per_page: query('per_page', 'Items per page (1–500, default 100)'),
};

function notFound(kind: string, value: string, kindBn: string): never {
  throw new ApiError('not_found', `${kind} '${value}' not found`, {
    message_bn: `${kindBn} '${value}' পাওয়া যায়নি`,
  });
}

const META = {
  divisions: ['geo.divisions'],
  districts: ['geo.districts', 'geo.divisions'],
  upazilas: ['geo.upazilas', 'geo.districts', 'geo.divisions'],
  unions: ['geo.unions'],
  postcodes: ['geo.postcodes'],
  all: ['geo.divisions', 'geo.districts', 'geo.upazilas', 'geo.unions', 'geo.postcodes'],
};

export const geoRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/divisions',
    tags,
    summary: 'List all 8 divisions',
    responses: json(z.array(DivisionSchema), 'All divisions'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, geo.listDivisions(), metaFor(META.divisions));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/divisions/{division}',
    tags,
    summary: 'Get one division',
    request: { params: z.object({ division: pathSlug('division', 'dhaka') }) },
    responses: json(DivisionSchema, 'The division'),
  }),
  (c) => {
    const { division } = c.req.valid('param');
    const found = geo.getDivision(division) ?? notFound('Division', division, 'বিভাগ');
    cachePublic(c);
    return ok(c, found, metaFor(META.divisions));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/divisions/{division}/districts',
    tags,
    summary: 'List the districts of a division',
    request: { params: z.object({ division: pathSlug('division', 'chattogram') }) },
    responses: json(z.array(DistrictSchema), 'Districts in the division'),
  }),
  (c) => {
    const { division } = c.req.valid('param');
    if (!geo.getDivision(division)) notFound('Division', division, 'বিভাগ');
    cachePublic(c);
    return ok(c, geo.listDistricts(division), metaFor(META.districts));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/districts',
    tags,
    summary: 'List districts, optionally filtered by division',
    request: { query: z.object({ division: query('division', 'Division slug', 'dhaka') }) },
    responses: json(z.array(DistrictSchema), 'Districts'),
  }),
  (c) => {
    const { division } = c.req.valid('query');
    if (division !== undefined && !geo.getDivision(division))
      notFound('Division', division, 'বিভাগ');
    cachePublic(c);
    return ok(c, geo.listDistricts(division), metaFor(META.districts));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/districts/{district}',
    tags,
    summary: 'Get one district',
    request: { params: z.object({ district: pathSlug('district', 'cumilla') }) },
    responses: json(DistrictSchema, 'The district'),
  }),
  (c) => {
    const { district } = c.req.valid('param');
    const found = geo.getDistrict(district) ?? notFound('District', district, 'জেলা');
    cachePublic(c);
    return ok(c, found, metaFor(META.districts));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/upazilas',
    tags,
    summary: 'List the upazilas of a district',
    request: {
      query: z.object({
        district: z.string().openapi({
          param: { name: 'district', in: 'query', description: 'District slug' },
          example: 'cumilla',
        }),
        ...pageQuery,
      }),
    },
    responses: json(z.array(UpazilaSchema), 'Upazilas in the district'),
  }),
  (c) => {
    const { district, page, per_page } = c.req.valid('query');
    const { page: p, perPage } = pageParams(page, per_page);
    if (!geo.getDistrict(district)) notFound('District', district, 'জেলা');
    const result = paginate(geo.listUpazilas(district), p, perPage);
    cachePublic(c);
    return ok(c, result.items, metaFor(META.upazilas, { pagination: result.pagination }));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/upazilas/{upazila}',
    tags,
    summary: 'Get one upazila with its parent district and division',
    request: { params: z.object({ upazila: pathSlug('upazila', 'debidwar') }) },
    responses: json(UpazilaSchema.extend({ parents: ParentsSchema }), 'The upazila'),
  }),
  (c) => {
    const { upazila } = c.req.valid('param');
    const found = geo.getUpazila(upazila) ?? notFound('Upazila', upazila, 'উপজেলা');
    cachePublic(c);
    return ok(
      c,
      { ...found, parents: geo.parentsOf({ district: found.district }) },
      metaFor(META.upazilas),
    );
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/unions',
    tags,
    summary: 'List the unions of an upazila',
    request: {
      query: z.object({
        upazila: z.string().openapi({
          param: { name: 'upazila', in: 'query', description: 'Upazila slug' },
          example: 'debidwar',
        }),
        ...pageQuery,
      }),
    },
    responses: json(z.array(UnionSchema), 'Unions in the upazila'),
  }),
  (c) => {
    const { upazila, page, per_page } = c.req.valid('query');
    const { page: p, perPage } = pageParams(page, per_page);
    if (!geo.getUpazila(upazila)) notFound('Upazila', upazila, 'উপজেলা');
    const result = paginate(geo.listUnions(upazila), p, perPage);
    cachePublic(c);
    return ok(c, result.items, metaFor(META.unions, { pagination: result.pagination }));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/postcodes/{code}',
    tags,
    summary: 'Look up the post office(s) for a 4-digit postcode',
    request: {
      params: z.object({
        code: z.string().openapi({ param: { name: 'code', in: 'path' }, example: '1205' }),
      }),
    },
    responses: json(
      z.object({ postcode: z.string(), post_offices: z.array(PostOfficeSchema) }),
      'Post offices with this postcode',
    ),
  }),
  (c) => {
    const code = toLatinDigits(c.req.valid('param').code.trim());
    if (!/^\d{4}$/.test(code)) {
      throw new ApiError('invalid_parameter', 'code must be exactly 4 digits', {
        details: [{ path: 'code', message: 'must be exactly 4 digits' }],
      });
    }
    const offices = geo.lookupPostcode(code);
    if (offices.length === 0) notFound('Postcode', code, 'পোস্টকোড');
    cachePublic(c);
    return ok(c, { postcode: code, post_offices: offices }, metaFor(META.postcodes));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/search',
    tags,
    summary: 'Search divisions, districts, upazilas, unions, and post offices in English or Bangla',
    description:
      'Matches names and historical spellings (e.g. "comilla" finds Cumilla). Ranking: exact, prefix, word prefix, substring; then division > district > upazila > post office > union.',
    request: {
      query: z.object({
        q: z
          .string()
          .min(2)
          .max(50)
          .openapi({
            param: { name: 'q', in: 'query', description: '2–50 characters' },
            example: 'mirpur',
          }),
        level: GeoLevelSchema.optional().openapi({ param: { name: 'level', in: 'query' } }),
        limit: query('limit', 'Max results (1–20, default 10)'),
      }),
    },
    responses: json(z.array(SearchHitSchema), 'Matching areas'),
  }),
  (c) => {
    const { q, level, limit } = c.req.valid('query');
    const max =
      limit === undefined ? 10 : numberParam('limit', limit, { min: 1, max: 20, integer: true });
    cachePublic(c);
    return ok(c, geo.search(q, { level, limit: max }), metaFor(META.all));
  },
);

geoRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/nearest',
    tags,
    summary: 'Find the district or upazila nearest to a coordinate inside Bangladesh',
    request: {
      query: z.object({
        lat: z.string().openapi({ param: { name: 'lat', in: 'query' }, example: '23.81' }),
        lon: z.string().openapi({ param: { name: 'lon', in: 'query' }, example: '90.41' }),
        level: z
          .enum(['district', 'upazila'])
          .optional()
          .openapi({ param: { name: 'level', in: 'query', description: 'Default: district' } }),
      }),
    },
    responses: json(
      z.object({ area: SearchHitSchema, distance_km: z.number() }),
      'Nearest area and its distance from the point',
    ),
  }),
  (c) => {
    const params = c.req.valid('query');
    const lat = numberParam('lat', params.lat, { min: -90, max: 90 });
    const lon = numberParam('lon', params.lon, { min: -180, max: 180 });
    if (!geo.inBangladesh(lat, lon)) {
      throw new ApiError('invalid_parameter', 'Coordinates are outside Bangladesh', {
        message_bn: 'স্থানাঙ্কটি বাংলাদেশের বাইরে',
      });
    }
    cachePublic(c);
    return ok(
      c,
      geo.nearest(lat, lon, params.level ?? 'district'),
      metaFor(['geo.districts', 'geo.upazilas']),
    );
  },
);

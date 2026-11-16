import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { ConstituencySchema, DistrictConstituenciesSchema } from './schemas';
import { getConstituency, listConstituencies, listDistrictBreakdowns } from './service';

const tags = ['Constituencies'];

const constituencyMeta = () => metaFor(['geo.constituencies']);

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

const notFound = (message: string): never => {
  throw new ApiError('not_found', message);
};

export const constituencyRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

const listRoute = createRoute({
  method: 'get',
  path: '/constituencies',
  tags,
  summary: '300 Bangladesh parliamentary constituencies',
  description:
    'List of the 300 general single-member territorial constituencies of Jatiya Sangsad with official seat numbers (1-300), English/Bengali names, and administrative boundaries.',
  request: {
    query: z.object({
      division: query('division', 'Filter by division slug (e.g. dhaka, rangpur)', 'dhaka'),
      district: query('district', 'Filter by district slug (e.g. dhaka, panchagarh)', 'dhaka'),
      search: query('search', 'Search by constituency name, seat number or area', 'dhaka-1'),
      limit: z
        .string()
        .optional()
        .openapi({
          param: { name: 'limit', in: 'query', description: 'Maximum items to return' },
          example: '20',
        }),
      offset: z
        .string()
        .optional()
        .openapi({
          param: { name: 'offset', in: 'query', description: 'Items to skip' },
          example: '0',
        }),
    }),
  },
  responses: responses(z.array(ConstituencySchema), 'List of constituencies'),
});

const districtsRoute = createRoute({
  method: 'get',
  path: '/constituencies/districts',
  tags,
  summary: 'Parliamentary seat breakdown by district',
  description:
    'Distribution of the 300 parliamentary seats across Bangladesh 64 districts with seat counts.',
  request: {
    query: z.object({
      division: query('division', 'Filter by division slug (e.g. dhaka)', 'dhaka'),
      district: query('district', 'Filter by district slug (e.g. dhaka)', 'dhaka'),
    }),
  },
  responses: responses(z.array(DistrictConstituenciesSchema), 'District seat breakdowns'),
});

const getRoute = createRoute({
  method: 'get',
  path: '/constituencies/{identifier}',
  tags,
  summary: 'Get a single parliamentary constituency',
  description:
    'Fetch details of a constituency using seat number (1-300 or Bengali numerals ১-৩০০) or slug (e.g. dhaka-1).',
  request: {
    params: z.object({
      identifier: z.string().openapi({
        param: {
          name: 'identifier',
          in: 'path',
          description: 'Seat number (1-300) or code slug (e.g. dhaka-1)',
        },
        example: '174',
      }),
    }),
  },
  responses: responses(ConstituencySchema, 'Constituency details'),
});

constituencyRoutes.openapi(listRoute, (c) => {
  const q = c.req.valid('query');
  const limit = q.limit ? Number.parseInt(q.limit, 10) : undefined;
  const offset = q.offset ? Number.parseInt(q.offset, 10) : undefined;

  const result = listConstituencies({
    division: q.division,
    district: q.district,
    search: q.search,
    limit,
    offset,
  });

  cachePublic(c);
  return ok(c, result.items, constituencyMeta());
});

constituencyRoutes.openapi(districtsRoute, (c) => {
  const q = c.req.valid('query');
  const results = listDistrictBreakdowns({
    division: q.division,
    district: q.district,
  });

  cachePublic(c);
  return ok(c, results, constituencyMeta());
});

constituencyRoutes.openapi(getRoute, (c) => {
  const { identifier } = c.req.valid('param');
  const item = getConstituency(identifier);
  if (!item) {
    throw new ApiError('not_found', `Constituency '${identifier}' not found`, {
      message_bn: 'সংসদীয় আসন পাওয়া যায়নি',
    });
  }

  cachePublic(c);
  return ok(c, item, constituencyMeta());
});

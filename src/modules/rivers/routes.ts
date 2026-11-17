import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import { RiverSchema } from './schemas';
import { getRiver, listRivers } from './service';

const tags = ['Rivers'];
const meta = () => metaFor(['rivers.rivers']);

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

export const riverRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

riverRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/rivers',
    tags,
    summary: 'List major rivers of Bangladesh (নদীমাতৃক বাংলাদেশ)',
    description:
      'Directory of principal rivers, origins, outflows, traversed districts, lengths, and transboundary relations verified against Bangladesh Water Development Board (BWDB) and Banglapedia.',
    request: {
      query: z.object({
        division: query('division', 'Division slug, e.g. dhaka, chattogram, rajshahi', 'dhaka'),
        district: query('district', 'District slug, e.g. dhaka, kurigram, chandpur', 'dhaka'),
        is_transboundary: query(
          'is_transboundary',
          'Filter by transboundary status: "true" or "false"',
          'true',
        ),
        q: query('q', 'Search by river name, origin, outflow, or description', 'Padma'),
      }),
    },
    responses: responses(z.array(RiverSchema), 'List of rivers'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let is_transboundary: boolean | undefined;
    if (q.is_transboundary !== undefined) {
      const lower = q.is_transboundary.toLowerCase();
      if (lower === 'true') is_transboundary = true;
      else if (lower === 'false') is_transboundary = false;
      else invalid('is_transboundary must be "true" or "false"');
    }

    if (q.division !== undefined && !getDivision(q.division)) {
      invalid(`unknown division "${q.division}"`);
    }
    if (q.district !== undefined && !getDistrict(q.district)) {
      invalid(`unknown district "${q.district}"`);
    }

    cachePublic(c);
    return ok(
      c,
      listRivers({
        division: q.division,
        district: q.district,
        is_transboundary,
        q: q.q,
      }),
      meta(),
    );
  },
);

riverRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/rivers/{slug}',
    tags,
    summary: 'Get river details by slug',
    description:
      'Resolves a single river by its unique slug (e.g. padma, meghna, jamuna, karnaphuli, halda, teesta).',
    request: {
      params: z.object({
        slug: z
          .string()
          .openapi({ param: { name: 'slug', in: 'path' }, example: 'padma' }),
      }),
    },
    responses: responses(RiverSchema, 'Single river details'),
  }),
  (c) => {
    const { slug } = c.req.valid('param');
    const river = getRiver(slug);
    if (!river) {
      throw new ApiError('not_found', `River '${slug}' not found`, {
        message_bn: 'নদী পাওয়া যায়নি',
      });
    }

    cachePublic(c);
    return ok(c, river, meta());
  },
);

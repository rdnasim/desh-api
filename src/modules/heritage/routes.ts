import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import {
  HeritageCategorySchema,
  HeritageSiteSchema,
  HeritageTypeSchema,
} from './schemas';
import { getHeritageSite, listHeritageSites } from './service';

const tags = ['Heritage'];
const meta = () => metaFor(['heritage.sites']);

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

export const heritageRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

heritageRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/heritage',
    tags,
    summary: 'List UNESCO World Heritage sites, archaeological monuments, and tourist landmarks',
    description:
      'Directory of UNESCO World Heritage sites, archaeological antiquities, eco-tourism reserves, and national landmarks verified against Department of Archaeology and Bangladesh Parjatan Corporation.',
    request: {
      query: z.object({
        division: query('division', 'Division slug, e.g. dhaka, rajshahi, khulna', 'rajshahi'),
        district: query('district', 'District slug, e.g. naogaon, bagerhat, bogura', 'naogaon'),
        category: query(
          'category',
          'archaeological, historical, natural, cultural, monument',
          'archaeological',
        ),
        type: query(
          'type',
          'unesco_world_heritage, national_heritage, eco_tourism, landmark',
          'unesco_world_heritage',
        ),
        q: query('q', 'Search by site name, historical era, or description', 'Paharpur'),
      }),
    },
    responses: responses(z.array(HeritageSiteSchema), 'List of heritage and tourist sites'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let category: z.infer<typeof HeritageCategorySchema> | undefined;
    if (q.category !== undefined) {
      const parsed = HeritageCategorySchema.safeParse(q.category.toLowerCase());
      if (!parsed.success) {
        invalid(
          `unknown category "${q.category}"; valid: archaeological, historical, natural, cultural, monument`,
        );
      }
      category = parsed.data;
    }

    let type: z.infer<typeof HeritageTypeSchema> | undefined;
    if (q.type !== undefined) {
      const parsed = HeritageTypeSchema.safeParse(q.type.toLowerCase());
      if (!parsed.success) {
        invalid(
          `unknown type "${q.type}"; valid: unesco_world_heritage, national_heritage, eco_tourism, landmark`,
        );
      }
      type = parsed.data;
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
      listHeritageSites({
        division: q.division,
        district: q.district,
        category,
        type,
        q: q.q,
      }),
      meta(),
    );
  },
);

heritageRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/heritage/{identifier}',
    tags,
    summary: 'Get a heritage or tourist site by slug or UNESCO ID',
    description:
      'Resolves a single site by its unique slug (e.g. somapura-mahavihara, shat-gombuj-mosque, sundarbans) or UNESCO ID (e.g. 322, 421, 798).',
    request: {
      params: z.object({
        identifier: z
          .string()
          .openapi({ param: { name: 'identifier', in: 'path' }, example: 'somapura-mahavihara' }),
      }),
    },
    responses: responses(HeritageSiteSchema, 'Single heritage site details'),
  }),
  (c) => {
    const { identifier } = c.req.valid('param');
    const site = getHeritageSite(identifier);
    if (!site) {
      throw new ApiError('not_found', `Heritage site '${identifier}' not found`, {
        message_bn: 'ঐতিহাসিক বা পর্যটন স্থান পাওয়া যায়নি',
      });
    }

    cachePublic(c);
    return ok(c, site, meta());
  },
);

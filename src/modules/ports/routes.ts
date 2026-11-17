import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import { LandPortSchema, LandPortStatusSchema } from './schemas';
import { getLandPort, listLandPorts } from './service';

const tags = ['Ports'];
const meta = () => metaFor(['ports.land-ports']);

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

export const portRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

portRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/ports/land',
    tags,
    summary: 'List statutory land ports and border customs stations',
    description:
      'Directory of all 24 statutory land ports of Bangladesh with counterpart Indian/Myanmar customs stations, rail connectivity, facilities, and key trade commodities verified against Bangladesh Land Port Authority (BLPA).',
    request: {
      query: z.object({
        division: query('division', 'Division slug, e.g. khulna, rangpur, sylhet', 'khulna'),
        district: query('district', 'District slug, e.g. jashore, lalmonirhat, sylhet', 'jashore'),
        status: query('status', 'operational, under_development, inactive', 'operational'),
        has_rail_link: query(
          'has_rail_link',
          'Filter by rail connection: "true" or "false"',
          'true',
        ),
        has_passenger_immigration: query(
          'has_passenger_immigration',
          'Filter by passenger immigration: "true" or "false"',
          'true',
        ),
        q: query('q', 'Search by port name, 3-letter code, Indian LCS, or commodity', 'Benapole'),
      }),
    },
    responses: responses(z.array(LandPortSchema), 'List of land ports'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let status: z.infer<typeof LandPortStatusSchema> | undefined;
    if (q.status !== undefined) {
      const parsed = LandPortStatusSchema.safeParse(q.status.toLowerCase());
      if (!parsed.success) {
        invalid(`unknown status "${q.status}"; valid: operational, under_development, inactive`);
      }
      status = parsed.data;
    }

    let has_rail_link: boolean | undefined;
    if (q.has_rail_link !== undefined) {
      const lower = q.has_rail_link.toLowerCase();
      if (lower === 'true') has_rail_link = true;
      else if (lower === 'false') has_rail_link = false;
      else invalid('has_rail_link must be "true" or "false"');
    }

    let has_passenger_immigration: boolean | undefined;
    if (q.has_passenger_immigration !== undefined) {
      const lower = q.has_passenger_immigration.toLowerCase();
      if (lower === 'true') has_passenger_immigration = true;
      else if (lower === 'false') has_passenger_immigration = false;
      else invalid('has_passenger_immigration must be "true" or "false"');
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
      listLandPorts({
        division: q.division,
        district: q.district,
        status,
        has_rail_link,
        has_passenger_immigration,
        q: q.q,
      }),
      meta(),
    );
  },
);

portRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/ports/land/{identifier}',
    tags,
    summary: 'Get land port details by code or slug',
    description:
      'Resolves a single land port by its 3-letter port code (e.g. BEN, BUR, TAM, BGB, AKH) or unique slug.',
    request: {
      params: z.object({
        identifier: z
          .string()
          .openapi({ param: { name: 'identifier', in: 'path' }, example: 'BEN' }),
      }),
    },
    responses: responses(LandPortSchema, 'Single land port details'),
  }),
  (c) => {
    const { identifier } = c.req.valid('param');
    const port = getLandPort(identifier);
    if (!port) {
      throw new ApiError('not_found', `Land port '${identifier}' not found`, {
        message_bn: 'স্থলবন্দর পাওয়া যায়নি',
      });
    }

    cachePublic(c);
    return ok(c, port, meta());
  },
);

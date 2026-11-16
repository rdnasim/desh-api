import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict, getDivision } from '../geo/service';
import { EmergencyHealthSummarySchema, HospitalSchema, HospitalTypeSchema } from './schemas';
import { getEmergencyHealthSummary, getHospital, listHospitals } from './service';

const tags = ['Health'];
const meta = () => metaFor(['health.hospitals']);

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

export const healthRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

healthRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/health/hospitals',
    tags,
    summary: 'National government hospitals and specialized healthcare institutes',
    description:
      'Directory of major government medical college hospitals, specialized institutes, bed counts, emergency casualty phones and GPS coordinates across all 8 divisions.',
    request: {
      query: z.object({
        division: query('division', 'Division slug, e.g. dhaka, chattogram', 'dhaka'),
        district: query('district', 'District slug, e.g. dhaka, coxs-bazar', 'dhaka'),
        type: query(
          'type',
          'specialized_institute, medical_college, general_hospital, district_hospital',
          'medical_college',
        ),
        has_emergency: query('has_emergency', 'true or false', 'true'),
        q: query('q', 'Search in hospital name, address or services', 'cardiac'),
      }),
    },
    responses: responses(z.array(HospitalSchema), 'List of hospitals'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let type: z.infer<typeof HospitalTypeSchema> | undefined;
    if (q.type !== undefined) {
      const parsed = HospitalTypeSchema.safeParse(q.type);
      type = parsed.success
        ? parsed.data
        : invalid(`type must be one of: ${HospitalTypeSchema.options.join(', ')}`);
    }
    if (q.division !== undefined && !getDivision(q.division)) {
      invalid(`division '${q.division}' is not a valid division slug`);
    }
    if (q.district !== undefined && !getDistrict(q.district)) {
      invalid(`district '${q.district}' is not a valid district slug`);
    }

    let hasEmergency: boolean | undefined;
    if (q.has_emergency !== undefined) {
      if (q.has_emergency === 'true') hasEmergency = true;
      else if (q.has_emergency === 'false') hasEmergency = false;
      else invalid('has_emergency must be true or false');
    }

    cachePublic(c);
    return ok(
      c,
      listHospitals({
        division: q.division,
        district: q.district,
        type,
        has_emergency: hasEmergency,
        q: q.q,
      }),
      meta(),
    );
  },
);

healthRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/health/hospitals/{slug}',
    tags,
    summary: 'Lookup a hospital by slug',
    description:
      'Returns complete hospital details including bed capacity, 24/7 casualty hotline, specialized facilities, and GPS coordinates.',
    request: {
      params: z.object({
        slug: z.string().openapi({
          param: { name: 'slug', in: 'path' },
          example: 'dhaka-medical-college-hospital',
        }),
      }),
    },
    responses: responses(HospitalSchema, 'Hospital details'),
  }),
  (c) => {
    const { slug } = c.req.valid('param');
    const hospital = getHospital(slug);
    if (!hospital) {
      throw new ApiError('not_found', `Hospital '${slug}' not found`, {
        message_bn: 'হাসপাতাল পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, hospital, meta());
  },
);

healthRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/health/emergency',
    tags,
    summary: 'Emergency medical hotlines, ambulance dispatch, and trauma centers',
    description:
      'Immediate medical emergency directory: 24/7 Shastho Batayan (16263), National Emergency (999), top trauma/burn institutes, and ambulance numbers.',
    responses: responses(EmergencyHealthSummarySchema, 'Emergency healthcare directory'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, getEmergencyHealthSummary(), meta());
  },
);

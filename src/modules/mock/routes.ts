import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { AppEnv } from '../../env';
import { cachePublic, noStore } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { getDistrict } from '../geo/service';
import { type Gender, GenderSchema, MockAddressSchema, MockPersonSchema } from './schemas';
import { mockAddresses, mockPeople } from './service';

const tags = ['Mock data'];
const DISCLAIMER =
  'Synthetic test data: names are combined at random and describe no real person. Phone numbers and NIDs are random but correctly formatted, so one may belong to someone; never call, text or look them up. Emails use example.com, which cannot receive mail.';
const meta = () =>
  metaFor(['mock.names', 'geo.districts', 'geo.upazilas', 'geo.postcodes', 'phone.prefixes'], {
    disclaimer: DISCLAIMER,
  });

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const optional = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });
const seedParam = z
  .string()
  .max(64)
  .optional()
  .openapi({
    param: { name: 'seed', in: 'query', description: 'Same seed, same records (cacheable)' },
  });

const invalid = (message: string, message_bn?: string): never => {
  throw new ApiError('invalid_parameter', message, { message_bn });
};

/** Seeded output is deterministic and can be cached; unseeded output must not be. */
function cacheForSeed(c: Context, seed: string | undefined) {
  if (seed === undefined) noStore(c);
  else cachePublic(c);
}

function common(q: { count?: string; district?: string }) {
  const count =
    q.count === undefined ? 10 : numberParam('count', q.count, { min: 1, max: 100, integer: true });
  if (q.district !== undefined && !getDistrict(q.district)) {
    invalid(`district '${q.district}' is not a district slug`, 'জেলা চেনা যায়নি');
  }
  return { count, district: q.district };
}

export const mockRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

mockRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mock/people',
    tags,
    summary: 'Synthetic Bangladeshi people for testing (bilingual names, phone, NID, address)',
    description:
      'Every record is made up. Phones and NIDs pass this API’s own validators. Pass `seed` for repeatable output.',
    request: {
      query: z.object({
        count: optional('count', '1–100 (default 10)', '10'),
        seed: seedParam,
        gender: optional('gender', 'male or female'),
        district: optional('district', 'District slug, e.g. cumilla'),
      }),
    },
    responses: responses(z.array(MockPersonSchema), 'People'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const { count, district } = common(q);
    let gender: Gender | undefined;
    if (q.gender !== undefined) {
      const parsed = GenderSchema.safeParse(q.gender);
      gender = parsed.success ? parsed.data : invalid('gender must be male or female');
    }
    cacheForSeed(c, q.seed);
    return ok(c, mockPeople({ count, seed: q.seed, district, gender }), meta());
  },
);

mockRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/mock/addresses',
    tags,
    summary: 'Synthetic addresses consistent with real upazilas, districts and postcodes',
    request: {
      query: z.object({
        count: optional('count', '1–100 (default 10)', '10'),
        seed: seedParam,
        district: optional('district', 'District slug, e.g. sylhet'),
      }),
    },
    responses: responses(z.array(MockAddressSchema), 'Addresses'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const { count, district } = common(q);
    cacheForSeed(c, q.seed);
    return ok(c, mockAddresses({ count, seed: q.seed, district }), meta());
  },
);

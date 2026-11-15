import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict } from '../geo/service';
import {
  UniversityCategorySchema,
  UniversityCategorySlugSchema,
  UniversitySchema,
} from './schemas';
import { getUniversity, listUniversities, listUniversityCategories } from './service';

const tags = ['Education'];
const meta = () => metaFor(['education.universities', 'education.university-categories']);

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

export const educationRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/universities/categories',
    tags,
    summary: "UGC's university categories with counts",
    responses: responses(
      z.array(
        UniversityCategorySchema.extend({ count: z.number().int() }).openapi(
          'UniversityCategoryWithCount',
          {
            example: {
              slug: 'public',
              name_en: 'Public Universities',
              name_bn: 'পাবলিক বিশ্ববিদ্যালয়',
              description: 'Government-funded universities established by act of parliament.',
              count: 61,
            },
          },
        ),
      ),
      'Categories',
    ),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listUniversityCategories(), meta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/universities',
    tags,
    summary: 'Universities listed by the University Grants Commission',
    description:
      'Public, private, international and cross-border (CBHE) universities, sorted by name. `district` is set only when the campus address names one district.',
    request: {
      query: z.object({
        category: query('category', 'public, private, international or cbhe', 'public'),
        district: query('district', 'District slug, e.g. dhaka'),
        q: query('q', 'Search in university names', 'engineering'),
      }),
    },
    responses: responses(z.array(UniversitySchema), 'Universities'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let category: z.infer<typeof UniversityCategorySlugSchema> | undefined;
    if (q.category !== undefined) {
      const parsed = UniversityCategorySlugSchema.safeParse(q.category);
      category = parsed.success
        ? parsed.data
        : invalid(`category must be one of: ${UniversityCategorySlugSchema.options.join(', ')}`);
    }
    if (q.district !== undefined && !getDistrict(q.district))
      invalid(`district '${q.district}' is not a district slug`);
    cachePublic(c);
    return ok(c, listUniversities({ category, district: q.district, q: q.q }), meta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/universities/{slug}',
    tags,
    summary: 'One university: founding year, campus, institutional contacts and UGC notes',
    request: {
      params: z.object({
        slug: z
          .string()
          .openapi({ param: { name: 'slug', in: 'path' }, example: 'university-of-dhaka' }),
      }),
    },
    responses: responses(UniversitySchema, 'University'),
  }),
  (c) => {
    const { slug } = c.req.valid('param');
    const university = getUniversity(slug);
    if (!university) {
      throw new ApiError('not_found', `University '${slug}' not found`, {
        message_bn: 'বিশ্ববিদ্যালয় পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, university, meta());
  },
);

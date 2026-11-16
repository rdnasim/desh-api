import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { getDistrict } from '../geo/service';
import {
  CalculateGpaRequestSchema,
  CalculateGpaResponseSchema,
  EducationBoardSchema,
  EducationBoardTypeSchema,
  GradeTierSchema,
  UniversityCategorySchema,
  UniversityCategorySlugSchema,
  UniversitySchema,
} from './schemas';
import {
  calculateGpa,
  getEducationBoard,
  getUniversity,
  listEducationBoards,
  listGradingScale,
  listUniversities,
  listUniversityCategories,
  lookupGrade,
} from './service';

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

const boardMeta = () => metaFor(['education.boards']);
const gradeMeta = () => metaFor(['education.grading-scale']);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/education/boards',
    tags,
    summary: 'Intermediate and Secondary Education Boards (BISE, Madrasah, Technical)',
    description:
      'Official statutory education boards conducting SSC, HSC, Dakhil, Alim and vocational examinations. Supports filtering by board type or district.',
    request: {
      query: z.object({
        type: query('type', 'general, madrasah or technical', 'general'),
        district: query('district', 'District slug to find governing boards', 'dhaka'),
        q: query('q', 'Search board name, short name, or code', 'dhaka'),
      }),
    },
    responses: responses(z.array(EducationBoardSchema), 'Education boards'),
  }),
  (c) => {
    const q = c.req.valid('query');
    let type: z.infer<typeof EducationBoardTypeSchema> | undefined;
    if (q.type !== undefined) {
      const parsed = EducationBoardTypeSchema.safeParse(q.type);
      type = parsed.success
        ? parsed.data
        : invalid(`type must be one of: ${EducationBoardTypeSchema.options.join(', ')}`);
    }
    if (q.district !== undefined && !getDistrict(q.district)) {
      invalid(`district '${q.district}' is not a valid district slug`);
    }
    cachePublic(c);
    return ok(c, listEducationBoards({ type, district: q.district, q: q.q }), boardMeta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/education/boards/{code}',
    tags,
    summary: 'Lookup an education board by 3-letter code or slug',
    description:
      'Resolves education boards using official 3-letter result codes (e.g. DHA, CHI, RAJ, MAD, TEC) or board slugs (e.g. dhaka, chattogram, madrasah).',
    request: {
      params: z.object({
        code: z
          .string()
          .openapi({ param: { name: 'code', in: 'path' }, example: 'DHA' }),
      }),
    },
    responses: responses(EducationBoardSchema, 'Education board details'),
  }),
  (c) => {
    const { code } = c.req.valid('param');
    const board = getEducationBoard(code);
    if (!board) {
      throw new ApiError('not_found', `Education board '${code}' not found`, {
        message_bn: 'শিক্ষা বোর্ড পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, board, boardMeta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/education/grading-scale',
    tags,
    summary: 'Official Bangladesh GPA 5.0 grading scale tiers',
    description:
      'Uniform 7-tier grading scale (A+, A, A-, B, C, D, F) used for SSC, HSC, JSC, Dakhil, and equivalent examinations.',
    responses: responses(z.array(GradeTierSchema), 'Grading scale tiers'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, listGradingScale(), gradeMeta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/education/grade-lookup',
    tags,
    summary: 'Convert exam marks (0-100) to letter grade and GPA',
    description:
      'Looks up the grade tier, grade point (0.0 to 5.0), and performance assessment for a given mark.',
    request: {
      query: z.object({
        marks: z
          .string()
          .openapi({ param: { name: 'marks', in: 'query', description: 'Marks obtained (0-100)' }, example: '85' }),
      }),
    },
    responses: responses(GradeTierSchema, 'Grade tier for marks'),
  }),
  (c) => {
    const { marks } = c.req.valid('query');
    const score = Number(marks);
    if (isNaN(score) || score < 0 || score > 100) {
      invalid('marks must be a number between 0 and 100');
    }
    const tier = lookupGrade(score);
    if (!tier) {
      throw new ApiError('not_found', `No grade tier found for score ${score}`);
    }
    cachePublic(c);
    return ok(c, tier, gradeMeta());
  },
);

educationRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/education/calculate-gpa',
    tags,
    summary: 'Calculate overall GPA and letter grade with 4th-subject bonus',
    description:
      'Computes GPA on 5.0 scale according to Ministry of Education examination rules. If any mandatory subject fails (grade F), the overall result fails. Points above 2.0 in the optional 4th subject are added as bonus.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: CalculateGpaRequestSchema,
          },
        },
      },
    },
    responses: responses(CalculateGpaResponseSchema, 'Calculated GPA result'),
  }),
  (c) => {
    const body = c.req.valid('json');
    if (!body.subjects || body.subjects.length === 0) {
      invalid('At least one subject must be provided');
    }
    const result = calculateGpa(body);
    return ok(c, result, gradeMeta());
  },
);


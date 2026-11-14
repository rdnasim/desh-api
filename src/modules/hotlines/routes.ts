import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import hotlines from '../../generated/hotlines';
import { cachePublic } from '../../lib/cache';
import { toLatinDigits } from '../../lib/digits';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import {
  CATEGORY_NAMES,
  HotlineCategoryInfoSchema,
  HotlineCategorySchema,
  HotlineSchema,
} from './schemas';

const tags = ['Hotlines'];
const META = ['hotlines'];
const byNumber = new Map(hotlines.map((h) => [h.number, h]));
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

export const hotlineRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

hotlineRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/hotlines',
    tags,
    summary: 'List national hotline numbers, optionally by category',
    description:
      'Every number cites the official page it was checked against (`source`) and when (`last_verified`).',
    request: {
      query: z.object({
        category: z
          .string()
          .optional()
          .openapi({
            param: {
              name: 'category',
              in: 'query',
              description: HotlineCategorySchema.options.join(', '),
            },
          }),
      }),
    },
    responses: json(z.array(HotlineSchema), 'Hotlines'),
  }),
  (c) => {
    const { category } = c.req.valid('query');
    if (category !== undefined && !HotlineCategorySchema.safeParse(category).success) {
      throw new ApiError(
        'invalid_parameter',
        `category must be one of: ${HotlineCategorySchema.options.join(', ')}`,
        { details: [{ path: 'category', message: 'unknown category' }] },
      );
    }
    cachePublic(c);
    const data =
      category === undefined ? hotlines : hotlines.filter((h) => h.category === category);
    return ok(c, data, metaFor(META));
  },
);

hotlineRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/hotlines/categories',
    tags,
    summary: 'List hotline categories with counts',
    responses: json(z.array(HotlineCategoryInfoSchema), 'Categories'),
  }),
  (c) => {
    cachePublic(c);
    const data = HotlineCategorySchema.options.map((slug) => ({
      slug,
      ...CATEGORY_NAMES[slug],
      count: hotlines.filter((h) => h.category === slug).length,
    }));
    return ok(c, data, metaFor(META));
  },
);

hotlineRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/hotlines/{number}',
    tags,
    summary: 'Get one hotline by its number',
    request: {
      params: z.object({
        number: z.string().openapi({ param: { name: 'number', in: 'path' }, example: '999' }),
      }),
    },
    responses: json(HotlineSchema, 'The hotline'),
  }),
  (c) => {
    const number = toLatinDigits(c.req.valid('param').number.trim());
    const found = byNumber.get(number);
    if (!found) {
      throw new ApiError('not_found', `Hotline '${number}' not found`, {
        message_bn: 'হটলাইনটি পাওয়া যায়নি',
      });
    }
    cachePublic(c);
    return ok(c, found, metaFor(META));
  },
);

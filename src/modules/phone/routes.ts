import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { noStore } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { BULK_MAX, PhoneResultSchema } from './schemas';
import { validatePhone } from './service';

const tags = ['Phone'];
const META = ['phone.prefixes'];
const description =
  'Format check only: the number is never looked up, stored, or logged. Invalid numbers return 200 with `valid: false` and a `reason`.';

const errorResponse = (desc: string) => ({
  description: desc,
  content: { 'application/json': { schema: ErrorSchema } },
});

const responses = <T extends z.ZodTypeAny>(schema: T) => ({
  200: {
    description: 'Validation result',
    content: { 'application/json': { schema: envelope(schema) } },
  },
  400: errorResponse('Invalid request'),
});

const jsonBody = <T extends z.ZodTypeAny>(schema: T) => ({
  body: { content: { 'application/json': { schema } }, required: true },
});

export const phoneRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

phoneRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/phone/{number}',
    tags,
    summary: 'Validate and normalise a Bangladesh mobile number',
    description: `${description} Prefer POST /v1/phone/validate to keep numbers out of URLs.`,
    request: {
      params: z.object({
        number: z
          .string()
          .openapi({ param: { name: 'number', in: 'path' }, example: '+8801712345678' }),
      }),
    },
    responses: responses(PhoneResultSchema),
  }),
  (c) => {
    noStore(c);
    return ok(c, validatePhone(c.req.valid('param').number), metaFor(META));
  },
);

phoneRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/phone/validate',
    tags,
    summary: 'Validate one number sent in the request body',
    description,
    request: jsonBody(
      z.object({ number: z.string().max(64) }).openapi({ example: { number: '01712345678' } }),
    ),
    responses: responses(PhoneResultSchema),
  }),
  (c) => {
    noStore(c);
    return ok(c, validatePhone(c.req.valid('json').number), metaFor(META));
  },
);

phoneRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/phone/bulk',
    tags,
    summary: `Validate up to ${BULK_MAX} numbers at once`,
    description: `${description} Results are returned in the same order as the input.`,
    request: jsonBody(
      z
        .object({ numbers: z.array(z.string().max(64)).min(1) })
        .openapi({ example: { numbers: ['01712345678', '+8801812345678'] } }),
    ),
    responses: {
      ...responses(z.array(PhoneResultSchema)),
      413: errorResponse(`More than ${BULK_MAX} numbers`),
    },
  }),
  (c) => {
    const { numbers } = c.req.valid('json');
    if (numbers.length > BULK_MAX) {
      throw new ApiError('payload_too_large', `At most ${BULK_MAX} numbers per request`);
    }
    noStore(c);
    return ok(c, numbers.map(validatePhone), metaFor(META));
  },
);

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { AppEnv } from '../../env';
import { noStore } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { bijoyToUnicode } from './bijoy-to-unicode';
import { ConversionSchema, ConvertBodySchema, MAX_BODY_BYTES } from './schemas';
import { unicodeToBijoy } from './unicode-to-bijoy';

const tags = ['Convert'];
const META = ['convert.bijoy-map'];
const description = `Send \`{ "text": "…" }\` as JSON, or the raw text with \`Content-Type: text/plain\`. Bodies up to ${MAX_BODY_BYTES / 1024} KB. The whole input is treated as Bijoy, so English words mixed into Bijoy text will be mapped too. The input is not echoed back.`;

const errorResponse = (desc: string) => ({
  description: desc,
  content: { 'application/json': { schema: ErrorSchema } },
});

const route = (path: string, summary: string, example: string) =>
  createRoute({
    method: 'post',
    path,
    tags,
    summary,
    description,
    request: {
      body: {
        // JSON is schema-validated; text/plain uses a plain OpenAPI schema so it passes through.
        content: {
          'application/json': { schema: ConvertBodySchema.openapi({ example: { text: example } }) },
          'text/plain': { schema: { type: 'string', example } },
        },
        required: false,
      },
    },
    responses: {
      200: {
        description: 'Converted text',
        content: { 'application/json': { schema: envelope(ConversionSchema) } },
      },
      400: errorResponse('Missing or empty text'),
      413: errorResponse(`Body larger than ${MAX_BODY_BYTES / 1024} KB`),
    },
  });

/** JSON bodies are validated by the route schema; plain-text bodies are read as-is. */
async function readText(
  c: Context<AppEnv>,
  json: () => { text: string } | undefined,
): Promise<string> {
  const type = c.req.header('content-type') ?? '';
  const text = type.includes('application/json') ? json()?.text : await c.req.text();
  if (!text) throw new ApiError('invalid_parameter', 'text must not be empty');
  return text;
}

/** The mixed JSON/text body declaration makes the library type `valid('json')` as never. */
const validJson = (c: Context<AppEnv>) =>
  (c.req.valid as (target: 'json') => { text: string } | undefined).call(c.req, 'json');

export const convertRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

convertRoutes.use(
  '/convert/*',
  bodyLimit({
    maxSize: MAX_BODY_BYTES,
    onError: () => {
      throw new ApiError('payload_too_large', `Body must be at most ${MAX_BODY_BYTES / 1024} KB`);
    },
  }),
);

convertRoutes.openapi(
  route(
    '/convert/bijoy-to-unicode',
    'Convert Bijoy (SutonnyMJ) text to Unicode',
    'Avgvi †mvbvi evsjv',
  ),
  async (c) => {
    const text = await readText(c, () => validJson(c));
    noStore(c);
    return ok(c, { input_length: text.length, output: bijoyToUnicode(text) }, metaFor(META));
  },
);

convertRoutes.openapi(
  route('/convert/unicode-to-bijoy', 'Convert Unicode Bangla to Bijoy (SutonnyMJ)', 'আমার সোনার বাংলা'),
  async (c) => {
    const text = await readText(c, () => validJson(c));
    noStore(c);
    return ok(c, { input_length: text.length, output: unicodeToBijoy(text) }, metaFor(META));
  },
);

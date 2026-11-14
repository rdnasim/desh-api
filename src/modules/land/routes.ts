import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { LandConversionSchema, LandUnitSchema } from './schemas';
import { convertLand, listUnits, regions, resolveUnit, STANDARD_REGION } from './service';

const tags = ['Land'];
const DISCLAIMER =
  'Land unit sizes vary by region; verify with the local land office for legal use. Regional units (kani, gonda, kora) are not yet included.';
const meta = () => metaFor(['land.units'], { disclaimer: DISCLAIMER });

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const query = (name: string, description: string, example?: string) =>
  z
    .string()
    .optional()
    .openapi({ param: { name, in: 'query', description }, example });

function checkRegion(region: string | undefined): string {
  const value = region ?? STANDARD_REGION;
  if (!regions().includes(value)) {
    throw new ApiError('invalid_parameter', `region must be one of: ${regions().join(', ')}`);
  }
  return value;
}

function checkUnit(param: string, name: string): void {
  if (!resolveUnit(name)) {
    const valid = listUnits()
      .map((u) => u.slug)
      .join(', ');
    throw new ApiError(
      'invalid_parameter',
      `${param} '${name}' is not a known unit; use one of: ${valid}`,
      {
        message_bn: 'একক চেনা যায়নি',
      },
    );
  }
}

export const landRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

landRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/land/units',
    tags,
    summary: 'List supported land units with their size in square feet',
    request: { query: z.object({ region: query('region', 'Default: standard') }) },
    responses: responses(z.array(LandUnitSchema), 'Land units'),
  }),
  (c) => {
    const region = checkRegion(c.req.valid('query').region);
    cachePublic(c);
    return ok(c, listUnits(region), meta());
  },
);

landRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/land/convert',
    tags,
    summary: 'Convert between land units (katha, bigha, decimal, acre, sq ft, …)',
    description:
      'Units can be given by slug, alias (shotangsho, gaj, m2) or Bangla name (কাঠা, শতাংশ). Values are rounded to 2 decimals. Without `to`, only `all` is returned.',
    request: {
      query: z.object({
        value: z
          .string()
          .openapi({ param: { name: 'value', in: 'query', description: '> 0' }, example: '5' }),
        from: z.string().openapi({ param: { name: 'from', in: 'query' }, example: 'katha' }),
        to: query('to', 'Target unit', 'sqft'),
        region: query('region', 'Default: standard'),
      }),
    },
    responses: responses(LandConversionSchema, 'Conversion'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const value = numberParam('value', q.value, { min: Number.MIN_VALUE, max: 1e12 });
    checkUnit('from', q.from);
    if (q.to !== undefined) checkUnit('to', q.to);
    const region = checkRegion(q.region);
    cachePublic(c);
    return ok(c, convertLand(value, q.from, q.to, region), meta());
  },
);

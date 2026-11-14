import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { noStore } from '../../lib/cache';
import { ErrorSchema, envelope, type Meta, metaFor, ok, staticMeta } from '../../lib/envelope';
import { validationHook } from '../../lib/errors';
import { validateNid } from './nid';
import { validatePostcode } from './postcode';
import {
  type ValidationResult,
  ValidationResultSchema,
  type ValidationType,
  ValidationTypeSchema,
} from './schemas';
import { validateBin, validateTin } from './tin-bin';
import { validateVehicle } from './vehicle';

const tags = ['Validate'];
const UPDATED = '2026-11-14';
const PRIVACY =
  'Format check only: the value is never looked up, stored or logged. Malformed values return 200 with `valid: false` and a `reason`.';

const VALIDATORS: Record<
  ValidationType,
  { run: (v: string) => ValidationResult; meta: () => Meta }
> = {
  nid: {
    run: validateNid,
    meta: () =>
      staticMeta(
        'NID format rules (10, 13 or 17 digits; 17-digit numbers start with the birth year)',
        UPDATED,
      ),
  },
  vehicle: {
    run: validateVehicle,
    meta: () => metaFor(['geo.districts', 'validate.vehicle-area-aliases']),
  },
  tin: { run: validateTin, meta: () => staticMeta('NBR e-TIN format (12 digits)', UPDATED) },
  bin: {
    run: validateBin,
    meta: () => staticMeta('NBR VAT BIN format (9 digits; 13-digit branch form)', UPDATED),
  },
  postcode: { run: validatePostcode, meta: () => metaFor(['geo.postcodes']) },
};

const responses = {
  200: {
    description: 'Validation result',
    content: { 'application/json': { schema: envelope(ValidationResultSchema) } },
  },
  400: {
    description: 'Missing value or unknown type',
    content: { 'application/json': { schema: ErrorSchema } },
  },
};

const pathParam = (name: string, example: string) =>
  z.object({
    [name]: z
      .string()
      .max(64)
      .openapi({ param: { name, in: 'path' }, example }),
  });

export const validateRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

const GET_ROUTES = [
  { type: 'nid', param: 'number', example: '1234567890', summary: 'Check an NID number format' },
  { type: 'tin', param: 'number', example: '123456789012', summary: 'Check an e-TIN format' },
  { type: 'bin', param: 'number', example: '000123456', summary: 'Check a VAT BIN format' },
  {
    type: 'postcode',
    param: 'code',
    example: '1205',
    summary: 'Check a postcode format and whether it exists',
  },
] as const;

for (const r of GET_ROUTES) {
  validateRoutes.openapi(
    createRoute({
      method: 'get',
      path: `/validate/${r.type}/{${r.param}}`,
      tags,
      summary: r.summary,
      description: `${PRIVACY} Prefer POST /v1/validate/${r.type} to keep values out of URLs.`,
      request: { params: pathParam(r.param, r.example) },
      responses,
    }),
    (c) => {
      const value = (c.req.valid('param') as Record<string, string>)[r.param] as string;
      noStore(c);
      return ok(c, VALIDATORS[r.type].run(value), VALIDATORS[r.type].meta());
    },
  );
}

validateRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/validate/vehicle',
    tags,
    summary: 'Check a vehicle registration plate format',
    description: `${PRIVACY} Accepts Bangla (ঢাকা মেট্রো-গ ১১-২২৩৩) or English (Dhaka Metro-Ga 11-2233). The class letter is checked to be a Bangla consonant; its meaning is not asserted.`,
    request: {
      query: z.object({
        plate: z
          .string()
          .min(1)
          .max(64)
          .openapi({ param: { name: 'plate', in: 'query' }, example: 'ঢাকা মেট্রো-গ ১১-২২৩৩' }),
      }),
    },
    responses,
  }),
  (c) => {
    noStore(c);
    return ok(c, validateVehicle(c.req.valid('query').plate), VALIDATORS.vehicle.meta());
  },
);

validateRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/validate/{type}',
    tags,
    summary: 'Check any supported identifier sent in the request body',
    description: PRIVACY,
    request: {
      params: z.object({
        type: ValidationTypeSchema.openapi({ param: { name: 'type', in: 'path' }, example: 'nid' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: z
              .object({ value: z.string().max(64) })
              .openapi({ example: { value: '1234567890' } }),
          },
        },
        required: true,
      },
    },
    responses,
  }),
  (c) => {
    const { type } = c.req.valid('param');
    noStore(c);
    return ok(c, VALIDATORS[type].run(c.req.valid('json').value), VALIDATORS[type].meta());
  },
);

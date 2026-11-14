import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const LandUnitSchema = z
  .object({
    slug: SlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    aliases: z.array(z.string().min(1)),
    sqft: z
      .number()
      .positive()
      .openapi({ description: 'Square feet in one unit (standard value)' }),
    variants: z
      .array(
        z.object({ region: SlugSchema, sqft: z.number().positive(), source: z.string().min(1) }),
      )
      .openapi({ description: 'Regional sizes, listed only when a source is cited' }),
  })
  .openapi('LandUnit', {
    example: {
      slug: 'katha',
      name_en: 'Katha',
      name_bn: 'কাঠা',
      aliases: ['kata', 'kattha'],
      sqft: 720,
      variants: [],
    },
  });

export const LandConversionSchema = z
  .object({
    input: z.object({ value: z.number(), unit: SlugSchema, name_bn: z.string() }),
    region: z.string(),
    result: z.object({ value: z.number(), unit: SlugSchema }).optional(),
    all: z.record(z.string(), z.number()),
  })
  .openapi('LandConversion', {
    example: {
      input: { value: 5, unit: 'katha', name_bn: 'কাঠা' },
      region: 'standard',
      result: { value: 3600, unit: 'sqft' },
      all: { sqft: 3600, sqm: 334.45, decimal: 8.26, katha: 5, bigha: 0.25, acre: 0.08 },
    },
  });

export type LandUnit = z.infer<typeof LandUnitSchema>;

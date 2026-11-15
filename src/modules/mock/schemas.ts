import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, RefSchema } from '../../lib/schemas';

export const GenderSchema = z.enum(['male', 'female']);
export const TraditionSchema = z.enum(['muslim', 'hindu', 'buddhist', 'christian']);

export const MockNameSchema = z
  .object({
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    kind: z.enum(['given', 'family']),
    gender: GenderSchema.optional().openapi({
      description: 'Required for given names; on family names only when one gender uses it',
    }),
    tradition: TraditionSchema,
  })
  .refine((n) => n.kind === 'family' || n.gender !== undefined, {
    message: 'given names need a gender',
  });

export const MockAddressSchema = z
  .object({
    line_en: z.string(),
    line_bn: z.string(),
    upazila: RefSchema,
    district: RefSchema,
    division: RefSchema,
    postcode: z.string().regex(/^\d{4}$/),
  })
  .openapi('MockAddress', {
    example: {
      line_en: 'House 12, Road 5',
      line_bn: 'বাড়ি ১২, রোড ৫',
      upazila: { slug: 'debidwar', name_en: 'Debidwar', name_bn: 'দেবিদ্বার' },
      district: { slug: 'cumilla', name_en: 'Cumilla', name_bn: 'কুমিল্লা' },
      division: { slug: 'chattogram', name_en: 'Chattogram', name_bn: 'চট্টগ্রাম' },
      postcode: '3530',
    },
  });

export const MockPersonSchema = z
  .object({
    name_en: z.string(),
    name_bn: z.string(),
    gender: GenderSchema,
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    phone: z.string().regex(/^01[3-9]\d{8}$/),
    email: z.string().email(),
    nid: z.string().regex(/^[1-9]\d{9}$/),
    address: MockAddressSchema,
  })
  .openapi('MockPerson', {
    example: {
      name_en: 'Nusrat Rahman',
      name_bn: 'নুসরাত রহমান',
      gender: 'female',
      date_of_birth: '1994-03-21',
      phone: '01712345678',
      email: 'nusrat.rahman42@example.com',
      nid: '4512398765',
      address: {
        line_en: 'House 12, Road 5',
        line_bn: 'বাড়ি ১২, রোড ৫',
        upazila: { slug: 'debidwar', name_en: 'Debidwar', name_bn: 'দেবিদ্বার' },
        district: { slug: 'cumilla', name_en: 'Cumilla', name_bn: 'কুমিল্লা' },
        division: { slug: 'chattogram', name_en: 'Chattogram', name_bn: 'চট্টগ্রাম' },
        postcode: '3530',
      },
    },
  });

export type Gender = z.infer<typeof GenderSchema>;
export type MockName = z.infer<typeof MockNameSchema>;

import { z } from '@hono/zod-openapi';

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a lowercase slug')
  .openapi({ example: 'dhaka' });

export const NameEnSchema = z.string().min(1).max(100);

export const NameBnSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((s) => s === s.normalize('NFC'), 'must be NFC-normalised')
  .refine((s) => /[ঀ-৿]/.test(s), 'must contain Bangla script');

export const LatSchema = z.number().min(20.5).max(26.7);
export const LonSchema = z.number().min(88.0).max(92.7);

export const RefSchema = z
  .object({ slug: SlugSchema, name_en: NameEnSchema, name_bn: NameBnSchema })
  .openapi('Ref');

export type Ref = z.infer<typeof RefSchema>;

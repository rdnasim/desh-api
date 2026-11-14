import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema } from '../../lib/schemas';

export const HotlineCategorySchema = z.enum([
  'emergency',
  'health',
  'women-children',
  'disaster',
  'information',
  'legal-aid',
  'government-service',
  'transport',
  'utility',
]);

export const HotlineSchema = z
  .object({
    number: z.string().regex(/^\d{3,6}$/),
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    category: HotlineCategorySchema,
    toll_free: z
      .boolean()
      .optional()
      .openapi({ description: 'Only present when the source states it' }),
    hours: z.string().optional().openapi({ description: 'Only present when the source states it' }),
    notes_en: z.string().optional(),
    source: z
      .string()
      .url()
      .openapi({ description: 'Official page the number was checked against' }),
    last_verified: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .openapi({ description: 'Date the number was last checked against `source`' }),
  })
  .openapi('Hotline', {
    example: {
      number: '999',
      name_en: 'National Emergency Service (police, fire, ambulance)',
      name_bn: 'জাতীয় জরুরি সেবা',
      category: 'emergency',
      toll_free: true,
      hours: '24/7',
      source: 'https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89',
      last_verified: '2026-11-14',
    },
  });

export const HotlineCategoryInfoSchema = z
  .object({
    slug: HotlineCategorySchema,
    name_en: z.string(),
    name_bn: z.string(),
    count: z.number().int(),
  })
  .openapi('HotlineCategory', {
    example: { slug: 'emergency', name_en: 'Emergency', name_bn: 'জরুরি', count: 3 },
  });

export const CATEGORY_NAMES: Record<
  z.infer<typeof HotlineCategorySchema>,
  { name_en: string; name_bn: string }
> = {
  emergency: { name_en: 'Emergency', name_bn: 'জরুরি' },
  health: { name_en: 'Health', name_bn: 'স্বাস্থ্য' },
  'women-children': { name_en: 'Women and children', name_bn: 'নারী ও শিশু' },
  disaster: { name_en: 'Disaster', name_bn: 'দুর্যোগ' },
  information: { name_en: 'Information', name_bn: 'তথ্য' },
  'legal-aid': { name_en: 'Legal aid', name_bn: 'আইনি সহায়তা' },
  'government-service': { name_en: 'Government services', name_bn: 'সরকারি সেবা' },
  transport: { name_en: 'Transport', name_bn: 'পরিবহন' },
  utility: { name_en: 'Utilities and complaints', name_bn: 'ইউটিলিটি ও অভিযোগ' },
};

export type Hotline = z.infer<typeof HotlineSchema>;
export type HotlineCategory = z.infer<typeof HotlineCategorySchema>;

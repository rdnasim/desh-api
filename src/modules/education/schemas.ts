import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const UniversityCategorySlugSchema = z.enum(['public', 'private', 'international', 'cbhe']);

export const UniversityCategorySchema = z
  .object({
    slug: UniversityCategorySlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    description: z.string().min(1),
  })
  .openapi('UniversityCategory');

export const UniversitySchema = z
  .object({
    slug: SlugSchema.openapi({ description: 'As used by UGC (ugc.gov.bd/university/{slug})' }),
    ugc_id: z.number().int().positive(),
    name_en: NameEnSchema,
    name_bn: NameBnSchema.optional().openapi({ description: 'Only when UGC publishes it' }),
    category: UniversityCategorySlugSchema,
    established: z.number().int().min(1800).max(2100).optional(),
    website: z.string().min(3).optional(),
    campus: z.string().min(3).optional().openapi({ description: 'Campus address as given by UGC' }),
    district: SlugSchema.optional().openapi({
      description: 'Only when the campus address names exactly one district',
    }),
    emails: z.array(z.string().email()).optional(),
    phone: z.string().min(3).optional(),
    fax: z.string().min(3).optional(),
    ugc_notes: z
      .array(z.object({ title: z.string(), description: z.string(), type: z.string() }))
      .optional()
      .openapi({ description: 'UGC notes on programmes (usually Bangla), as published' }),
  })
  .openapi('University', {
    example: {
      slug: 'university-of-dhaka',
      ugc_id: 180,
      name_en: 'University of Dhaka',
      category: 'public',
      established: 1921,
      website: 'www.du.ac.bd',
      campus: 'Dhaka University, Ramna, Dhaka-1000',
      district: 'dhaka',
      emails: ['vcoffice@du.ac.bd', 'registrar@du.ac.bd'],
      phone: '+88-09666911463',
      fax: '+880-2-9667222',
    },
  });

export type University = z.infer<typeof UniversitySchema>;
export type UniversityCategory = z.infer<typeof UniversityCategorySchema>;

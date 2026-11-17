import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const HeritageCategorySchema = z
  .enum(['archaeological', 'historical', 'natural', 'cultural', 'monument'])
  .openapi('HeritageCategory');

export const HeritageTypeSchema = z
  .enum(['unesco_world_heritage', 'national_heritage', 'eco_tourism', 'landmark'])
  .openapi('HeritageType');

export const HeritageCoordinatesSchema = z
  .object({
    latitude: z.number().min(20.5).max(26.8).openapi({ example: 25.0315 }),
    longitude: z.number().min(88.0).max(92.8).openapi({ example: 88.9769 }),
  })
  .openapi('HeritageCoordinates');

export const HeritageEntryFeeSchema = z
  .object({
    citizen_bdt: z.number().int().nonnegative().optional().openapi({ example: 30 }),
    saarc_bdt: z.number().int().nonnegative().optional().openapi({ example: 100 }),
    foreign_bdt: z.number().int().nonnegative().optional().openapi({ example: 300 }),
    is_free: z.boolean().optional().openapi({ example: false }),
  })
  .openapi('HeritageEntryFee');

export const HeritageSiteSchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'somapura-mahavihara' }),
    name_en: NameEnSchema.openapi({ example: 'Somapura Mahavihara (Paharpur Buddhist Vihara)' }),
    name_bn: NameBnSchema.openapi({ example: 'সোমপুর মহাবিহার (পাহাড়পুর বৌদ্ধ বিহার)' }),
    category: HeritageCategorySchema,
    type: HeritageTypeSchema,
    unesco_id: z.number().int().positive().optional().openapi({ example: 322 }),
    period_era: z.string().optional().openapi({ example: 'Pala Empire (late 8th century CE)' }),
    division: SlugSchema.openapi({ example: 'rajshahi' }),
    district: SlugSchema.openapi({ example: 'naogaon' }),
    upazila: z.string().optional().openapi({ example: 'Badalgachhi' }),
    coordinates: HeritageCoordinatesSchema,
    description_en: z.string().openapi({
      example:
        '8th-century Buddhist monastery complex built by King Dharmapala, among the largest south of the Himalayas and a UNESCO World Heritage site.',
    }),
    description_bn: z.string().openapi({
      example:
        'রাজা ধর্মপাল কর্তৃক নির্মিত ৮ম শতাব্দীর অন্যতম বৃহত্তম বৌদ্ধ মঠ ও বিহার এবং ইউনেস্কো বিশ্ব ঐতিহ্যবাহী স্থান।',
    }),
    highlights: z.array(z.string()).openapi({
      example: [
        'UNESCO World Heritage site (1985)',
        'Central cruciform stupa',
        'Over 2,000 terracotta plaques',
      ],
    }),
    best_time_to_visit: z.string().optional().openapi({ example: 'October to March' }),
    entry_fee: HeritageEntryFeeSchema.optional(),
  })
  .openapi('HeritageSite', {
    example: {
      slug: 'somapura-mahavihara',
      name_en: 'Somapura Mahavihara (Paharpur Buddhist Vihara)',
      name_bn: 'সোমপুর মহাবিহার (পাহাড়পুর বৌদ্ধ বিহার)',
      category: 'archaeological',
      type: 'unesco_world_heritage',
      unesco_id: 322,
      period_era: 'Pala Empire (late 8th century CE)',
      division: 'rajshahi',
      district: 'naogaon',
      upazila: 'Badalgachhi',
      coordinates: {
        latitude: 25.0315,
        longitude: 88.9769,
      },
      description_en:
        '8th-century Buddhist monastery complex built by King Dharmapala, among the largest south of the Himalayas and a UNESCO World Heritage site.',
      description_bn:
        'রাজা ধর্মপাল কর্তৃক নির্মিত ৮ম শতাব্দীর অন্যতম বৃহত্তম বৌদ্ধ মঠ ও বিহার এবং ইউনেস্কো বিশ্ব ঐতিহ্যবাহী স্থান।',
      highlights: [
        'UNESCO World Heritage site (1985)',
        'Central cruciform stupa',
        'Over 2,000 terracotta plaques',
      ],
      best_time_to_visit: 'October to March',
      entry_fee: {
        citizen_bdt: 30,
        saarc_bdt: 100,
        foreign_bdt: 300,
        is_free: false,
      },
    },
  });

export type HeritageSite = z.infer<typeof HeritageSiteSchema>;

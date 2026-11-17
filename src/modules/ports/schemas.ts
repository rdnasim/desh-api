import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const LandPortStatusSchema = z
  .enum(['operational', 'under_development', 'inactive'])
  .openapi('LandPortStatus');

export const LandPortOperatorTypeSchema = z
  .enum(['blpa_operated', 'private_bot', 'railway_joint'])
  .openapi('LandPortOperatorType');

export const LandPortSchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'benapole' }),
    code: z.string().length(3).openapi({ example: 'BEN' }),
    name_en: NameEnSchema.openapi({ example: 'Benapole Land Port' }),
    name_bn: NameBnSchema.openapi({ example: 'বেনাপোল স্থলবন্দর' }),
    status: LandPortStatusSchema,
    operator_type: LandPortOperatorTypeSchema,
    established_year: z.number().int().positive().openapi({ example: 2002 }),
    division: SlugSchema.openapi({ example: 'khulna' }),
    district: SlugSchema.openapi({ example: 'jashore' }),
    upazila: z.string().openapi({ example: 'Sharsha' }),
    counterpart_indian_lcs: z
      .string()
      .openapi({ example: 'Petrapole (North 24 Parganas, West Bengal)' }),
    counterpart_state: z.string().openapi({ example: 'West Bengal' }),
    key_commodities: z.array(z.string()).openapi({
      example: [
        'Garments & textile fabric',
        'Industrial raw materials',
        'Motor vehicles & chassis',
        'Chemicals',
      ],
    }),
    facilities: z.array(z.string()).openapi({
      example: [
        'Integrated Check Post (ICP)',
        'Passenger immigration terminal',
        'Rail container terminal',
        'Automated digital cargo gatepass',
      ],
    }),
    has_rail_link: z.boolean().openapi({ example: true }),
    has_passenger_immigration: z.boolean().openapi({ example: true }),
    description_en: z.string().openapi({
      example:
        'The largest and busiest land port in Bangladesh, handling over 80% of total land-route bilateral trade with India.',
    }),
    description_bn: z.string().openapi({
      example:
        'বাংলাদেশের বৃহত্তম ও ব্যস্ততম স্থলবন্দর, যা ভারত-বাংলাদেশ স্থল বাণিজ্যের ৮০ শতাংশেরও বেশি পরিচালনা করে।',
    }),
  })
  .openapi('LandPort', {
    example: {
      slug: 'benapole',
      code: 'BEN',
      name_en: 'Benapole Land Port',
      name_bn: 'বেনাপোল স্থলবন্দর',
      status: 'operational',
      operator_type: 'blpa_operated',
      established_year: 2002,
      division: 'khulna',
      district: 'jashore',
      upazila: 'Sharsha',
      counterpart_indian_lcs: 'Petrapole (North 24 Parganas, West Bengal)',
      counterpart_state: 'West Bengal',
      key_commodities: [
        'Garments & textile fabric',
        'Industrial raw materials',
        'Motor vehicles & chassis',
        'Chemicals',
      ],
      facilities: [
        'Integrated Check Post (ICP)',
        'Passenger immigration terminal',
        'Rail container terminal',
        'Automated digital cargo gatepass',
      ],
      has_rail_link: true,
      has_passenger_immigration: true,
      description_en:
        'The largest and busiest land port in Bangladesh, handling over 80% of total land-route bilateral trade with India.',
      description_bn:
        'বাংলাদেশের বৃহত্তম ও ব্যস্ততম স্থলবন্দর, যা ভারত-বাংলাদেশ স্থল বাণিজ্যের ৮০ শতাংশেরও বেশি পরিচালনা করে।',
    },
  });

export type LandPort = z.infer<typeof LandPortSchema>;

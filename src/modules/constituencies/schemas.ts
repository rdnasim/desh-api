import { z } from '@hono/zod-openapi';

export const ConstituencySchema = z
  .object({
    number: z.number().int().min(1).max(300).openapi({
      description: 'Constituency seat number (1 to 300)',
      example: 174,
    }),
    number_bn: z.string().openapi({
      description: 'Constituency seat number in Bengali numerals',
      example: '১৭৪',
    }),
    code: z.string().openapi({
      description: 'URL-friendly slug / code identifier',
      example: 'dhaka-1',
    }),
    name_en: z.string().openapi({
      description: 'Official English constituency name',
      example: 'Dhaka-1',
    }),
    name_bn: z.string().openapi({
      description: 'Official Bengali constituency name',
      example: 'ঢাকা-১',
    }),
    division: z.string().openapi({
      description: 'Division slug',
      example: 'dhaka',
    }),
    district: z.string().openapi({
      description: 'District slug',
      example: 'dhaka',
    }),
    area_en: z.string().openapi({
      description: 'Constituency boundary details in English (upazilas, thanas, wards)',
      example: 'Dohar Upazila and Nawabganj Upazila',
    }),
    area_bn: z.string().openapi({
      description: 'Constituency boundary details in Bengali',
      example: 'দোহার উপজেলা এবং নবাবগঞ্জ উপজেলা',
    }),
  })
  .openapi('Constituency', {
    example: {
      number: 174,
      number_bn: '১৭৪',
      code: 'dhaka-1',
      name_en: 'Dhaka-1',
      name_bn: 'ঢাকা-১',
      division: 'dhaka',
      district: 'dhaka',
      area_en: 'Dohar Upazila and Nawabganj Upazila',
      area_bn: 'দোহার উপজেলা এবং নবাবগঞ্জ উপজেলা',
    },
  });

export type Constituency = z.infer<typeof ConstituencySchema>;

export const DistrictConstituenciesSchema = z
  .object({
    district: z.string().openapi({
      description: 'District slug',
      example: 'dhaka',
    }),
    district_name_en: z.string().openapi({
      description: 'District English name',
      example: 'Dhaka',
    }),
    district_name_bn: z.string().openapi({
      description: 'District Bengali name',
      example: 'ঢাকা',
    }),
    division: z.string().openapi({
      description: 'Division slug',
      example: 'dhaka',
    }),
    seat_count: z.number().int().min(1).openapi({
      description: 'Total number of parliamentary seats allocated to this district',
      example: 20,
    }),
    constituencies: z
      .array(
        z.object({
          number: z.number().int().min(1).max(300),
          number_bn: z.string(),
          code: z.string(),
          name_en: z.string(),
          name_bn: z.string(),
        }),
      )
      .openapi({
        description: 'List of seats in this district',
      }),
  })
  .openapi('DistrictConstituencies', {
    example: {
      district: 'dhaka',
      district_name_en: 'Dhaka',
      district_name_bn: 'ঢাকা',
      division: 'dhaka',
      seat_count: 20,
      constituencies: [
        {
          number: 174,
          number_bn: '১৭৪',
          code: 'dhaka-1',
          name_en: 'Dhaka-1',
          name_bn: 'ঢাকা-১',
        },
      ],
    },
  });

export type DistrictConstituencies = z.infer<typeof DistrictConstituenciesSchema>;

import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const HospitalTypeSchema = z
  .enum(['specialized_institute', 'medical_college', 'general_hospital', 'district_hospital'])
  .openapi('HospitalType');

export const HospitalCoordinatesSchema = z
  .object({
    latitude: z.number().min(20).max(27).openapi({ example: 23.7259 }),
    longitude: z.number().min(88).max(93).openapi({ example: 90.3976 }),
  })
  .openapi('HospitalCoordinates');

export const HospitalSchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'dhaka-medical-college-hospital' }),
    dghs_code: z
      .string()
      .min(6)
      .max(10)
      .optional()
      .openapi({
        description: 'Official DGHS 8-digit health facility identifier code',
        example: '10000033',
      }),
    name_en: NameEnSchema.openapi({ example: 'Dhaka Medical College Hospital' }),
    name_bn: NameBnSchema.openapi({ example: 'ঢাকা মেডিকেল কলেজ হাসপাতাল' }),
    type: HospitalTypeSchema,
    division: SlugSchema.openapi({ example: 'dhaka' }),
    district: SlugSchema.openapi({ example: 'dhaka' }),
    upazila: SlugSchema.optional().openapi({ example: 'ramna' }),
    established: z.number().int().min(1800).max(2100).optional().openapi({ example: 1946 }),
    bed_capacity: z.number().int().positive().openapi({ example: 2600 }),
    has_emergency_24h: z.boolean().openapi({ example: true }),
    phone: z.string().min(1).openapi({ example: '+880-2-55165088' }),
    emergency_phone: z.string().min(1).openapi({ example: '+880-2-55165088' }),
    email: z.string().email().openapi({ example: 'dmch@hospi.dghs.gov.bd' }),
    website: z.string().url().openapi({ example: 'https://dmch.gov.bd' }),
    address: z.string().min(1).openapi({ example: 'Secretariat Road, Ramna, Dhaka-1000' }),
    coordinates: HospitalCoordinatesSchema,
    services: z.array(z.string().min(1)).openapi({
      example: [
        'Emergency & Casualty 24/7',
        'Burn & Plastic Surgery affiliate',
        'Cardiology & CCU',
        'Neurosurgery',
        'Nephrology & Dialysis',
      ],
    }),
  })
  .openapi('Hospital', {
    example: {
      slug: 'dhaka-medical-college-hospital',
      dghs_code: '10000033',
      name_en: 'Dhaka Medical College Hospital',
      name_bn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      type: 'medical_college',
      division: 'dhaka',
      district: 'dhaka',
      established: 1946,
      bed_capacity: 2600,
      has_emergency_24h: true,
      phone: '+880-2-55165088',
      emergency_phone: '+880-2-55165088',
      email: 'dmch@hospi.dghs.gov.bd',
      website: 'https://dmch.gov.bd',
      address: 'Secretariat Road, Ramna, Dhaka-1000',
      coordinates: {
        latitude: 23.7259,
        longitude: 90.3976,
      },
      services: [
        'Emergency & Casualty 24/7',
        'Burn & Plastic Surgery affiliate',
        'Cardiology & CCU',
        'Neurosurgery',
      ],
    },
  });

export const EmergencyHealthSummarySchema = z
  .object({
    national_hotlines: z.array(
      z.object({
        name_en: z.string(),
        name_bn: z.string(),
        number: z.string(),
        description_en: z.string(),
        description_bn: z.string(),
      }),
    ),
    trauma_and_burn_centers: z.array(
      z.object({
        slug: SlugSchema,
        name_en: z.string(),
        name_bn: z.string(),
        division: z.string(),
        emergency_phone: z.string(),
      }),
    ),
    ambulance_services: z.array(
      z.object({
        name_en: z.string(),
        name_bn: z.string(),
        number: z.string(),
        notes: z.string(),
      }),
    ),
  })
  .openapi('EmergencyHealthSummary', {
    example: {
      national_hotlines: [
        {
          name_en: 'Shastho Batayan',
          name_bn: 'স্বাস্থ্য বাতায়ন',
          number: '16263',
          description_en: '24/7 National health advice helpline operated by DGHS',
          description_bn: 'স্বাস্থ্য অধিদপ্তরের সার্বক্ষণিক জাতীয় স্বাস্থ্য সেবা হটলাইন',
        },
        {
          name_en: 'National Emergency Service',
          name_bn: 'জাতীয় জরুরি সেবা',
          number: '999',
          description_en: 'Toll-free police, ambulance, and fire rescue',
          description_bn: 'টোল-ফ্রি পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিস',
        },
      ],
      trauma_and_burn_centers: [
        {
          slug: 'national-institute-of-traumatology-and-orthopaedic-rehabilitation',
          name_en:
            'National Institute of Traumatology & Orthopaedic Rehabilitation (Pangu Hospital)',
          name_bn: 'জাতীয় অর্থোপেডিক হাসপাতাল ও পুনর্বাসন প্রতিষ্ঠান',
          division: 'dhaka',
          emergency_phone: '+880-2-9114075',
        },
      ],
      ambulance_services: [
        {
          name_en: 'National Emergency Ambulance',
          name_bn: 'জাতীয় জরুরি অ্যাম্বুলেন্স',
          number: '999',
          notes: 'Toll-free, nationwide dispatch',
        },
      ],
    },
  });

export type Hospital = z.infer<typeof HospitalSchema>;
export type EmergencyHealthSummary = z.infer<typeof EmergencyHealthSummarySchema>;

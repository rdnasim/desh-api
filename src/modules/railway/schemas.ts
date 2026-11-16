import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const RailwayClassCodeSchema = z
  .enum(['SHOVON', 'S_CHAIR', 'FIRST_SEAT', 'FIRST_BERTH', 'SNIGDHA', 'AC_S', 'AC_B'])
  .openapi('RailwayClassCode');

export const RailwayClassSchema = z
  .object({
    code: RailwayClassCodeSchema,
    slug: SlugSchema.openapi({ example: 'snigdha' }),
    name_en: NameEnSchema.openapi({ example: 'Snigdha (AC Chair)' }),
    name_bn: NameBnSchema.openapi({ example: 'স্নিগ্ধা' }),
    is_ac: z.boolean().openapi({ example: true }),
    description_en: z.string(),
    description_bn: z.string(),
  })
  .openapi('RailwayClass', {
    example: {
      code: 'SNIGDHA',
      slug: 'snigdha',
      name_en: 'Snigdha (AC Chair)',
      name_bn: 'স্নিগ্ধা',
      is_ac: true,
      description_en: 'Air-conditioned individual reclining chair car seating.',
      description_bn: 'শীতাতপ নিয়ন্ত্রিত রিক্লাইনিং চেয়ার কার আসন।',
    },
  });

export const RailwayStationSchema = z
  .object({
    code: z.string().min(2).max(5).openapi({ example: 'DA' }),
    slug: SlugSchema.openapi({ example: 'dhaka' }),
    name_en: NameEnSchema.openapi({ example: 'Dhaka Railway Station (Kamalapur)' }),
    name_bn: NameBnSchema.openapi({ example: 'ঢাকা রেলওয়ে স্টেশন (কমলাপুর)' }),
    division: SlugSchema.openapi({ example: 'dhaka' }),
    district: SlugSchema.openapi({ example: 'dhaka' }),
    coordinates: z
      .object({
        latitude: z.number().min(20).max(27).openapi({ example: 23.7314 }),
        longitude: z.number().min(88).max(93).openapi({ example: 90.4267 }),
      })
      .openapi('RailwayStationCoordinates'),
  })
  .openapi('RailwayStation', {
    example: {
      code: 'DA',
      slug: 'dhaka',
      name_en: 'Dhaka Railway Station (Kamalapur)',
      name_bn: 'ঢাকা রেলওয়ে স্টেশন (কমলাপুর)',
      division: 'dhaka',
      district: 'dhaka',
      coordinates: {
        latitude: 23.7314,
        longitude: 90.4267,
      },
    },
  });

export const RailwayTrainSchema = z
  .object({
    number: z
      .string()
      .min(1)
      .max(5)
      .openapi({ description: 'Official BR train number (e.g. 701, 702, 788)', example: '701' }),
    slug: SlugSchema.openapi({ example: 'suborno-express-701' }),
    name_en: NameEnSchema.openapi({ example: 'Suborno Express' }),
    name_bn: NameBnSchema.openapi({ example: 'সুবর্ণ এক্সপ্রেস' }),
    origin_station: SlugSchema.openapi({ example: 'chattogram' }),
    destination_station: SlugSchema.openapi({ example: 'dhaka' }),
    origin_city: z.string().openapi({ example: 'Chattogram' }),
    destination_city: z.string().openapi({ example: 'Dhaka' }),
    departure_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .openapi({ description: 'Departure time (24h format HH:MM)', example: '07:00' }),
    arrival_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .openapi({ description: 'Arrival time (24h format HH:MM)', example: '12:15' }),
    off_day_en: z.string().openapi({ example: 'Monday' }),
    off_day_bn: z.string().openapi({ example: 'সোমবার' }),
    classes: z.array(RailwayClassCodeSchema).openapi({ example: ['S_CHAIR', 'SNIGDHA'] }),
    major_halts: z
      .array(z.string())
      .openapi({ example: ['Chattogram', 'Dhaka Airport', 'Dhaka (Kamalapur)'] }),
  })
  .openapi('RailwayTrain', {
    example: {
      number: '701',
      slug: 'suborno-express-701',
      name_en: 'Suborno Express',
      name_bn: 'সুবর্ণ এক্সপ্রেস',
      origin_station: 'chattogram',
      destination_station: 'dhaka',
      origin_city: 'Chattogram',
      destination_city: 'Dhaka',
      departure_time: '07:00',
      arrival_time: '12:15',
      off_day_en: 'Monday',
      off_day_bn: 'সোমবার',
      classes: ['S_CHAIR', 'SNIGDHA'],
      major_halts: ['Chattogram', 'Dhaka Airport', 'Dhaka (Kamalapur)'],
    },
  });

export type RailwayClass = z.infer<typeof RailwayClassSchema>;
export type RailwayStation = z.infer<typeof RailwayStationSchema>;
export type RailwayTrain = z.infer<typeof RailwayTrainSchema>;

import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const AirportTypeSchema = z
  .enum(['international', 'domestic', 'short_takeoff', 'military_airstrip'])
  .openapi('AirportType');

export const AirportStatusSchema = z
  .enum(['operational', 'under_development', 'inactive'])
  .openapi('AirportStatus');

export const AirportRunwaySchema = z
  .object({
    length_ft: z.number().int().positive().openapi({ example: 10500 }),
    surface: z.string().min(1).openapi({ example: 'Asphalt' }),
  })
  .openapi('AirportRunway');

export const AirportCoordinatesSchema = z
  .object({
    latitude: z.number().min(20).max(27).openapi({ example: 23.8433 }),
    longitude: z.number().min(88).max(93).openapi({ example: 90.3978 }),
  })
  .openapi('AirportCoordinates');

export const AirportSchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'hazrat-shahjalal-international-airport' }),
    iata_code: z.string().length(3).optional().openapi({ example: 'DAC' }),
    icao_code: z.string().length(4).optional().openapi({ example: 'VGHS' }),
    name_en: NameEnSchema.openapi({ example: 'Hazrat Shahjalal International Airport' }),
    name_bn: NameBnSchema.openapi({ example: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর' }),
    type: AirportTypeSchema,
    status: AirportStatusSchema,
    division: SlugSchema.openapi({ example: 'dhaka' }),
    district: SlugSchema.openapi({ example: 'dhaka' }),
    city: z.string().openapi({ example: 'Dhaka' }),
    coordinates: AirportCoordinatesSchema,
    elevation_ft: z.number().int().openapi({ example: 30 }),
    runways: z.array(AirportRunwaySchema),
    website: z.string().url().openapi({ example: 'https://caab.gov.bd' }),
  })
  .openapi('Airport', {
    example: {
      slug: 'hazrat-shahjalal-international-airport',
      iata_code: 'DAC',
      icao_code: 'VGHS',
      name_en: 'Hazrat Shahjalal International Airport',
      name_bn: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর',
      type: 'international',
      status: 'operational',
      division: 'dhaka',
      district: 'dhaka',
      city: 'Dhaka',
      coordinates: {
        latitude: 23.8433,
        longitude: 90.3978,
      },
      elevation_ft: 30,
      runways: [
        {
          length_ft: 10500,
          surface: 'Asphalt',
        },
      ],
      website: 'https://caab.gov.bd',
    },
  });

export type Airport = z.infer<typeof AirportSchema>;

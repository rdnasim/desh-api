import { z } from '@hono/zod-openapi';
import {
  LatSchema,
  LonSchema,
  NameBnSchema,
  NameEnSchema,
  RefSchema,
  SlugSchema,
} from '../../lib/schemas';

const areaFields = {
  slug: SlugSchema,
  name_en: NameEnSchema,
  name_bn: NameBnSchema,
  aliases: z.array(z.string().min(1)).openapi({ description: 'Alternate or historical spellings' }),
  bbs_code: z
    .string()
    .regex(/^BD\d+$/)
    .optional()
    .openapi({ description: 'Official BBS geocode' }),
  url: z.string().optional().openapi({ description: 'Official website' }),
  lat: LatSchema.optional(),
  lon: LonSchema.optional(),
};

export const DivisionSchema = z.object(areaFields).openapi('Division', {
  example: {
    slug: 'dhaka',
    name_en: 'Dhaka',
    name_bn: 'ঢাকা',
    aliases: [],
    bbs_code: 'BD30',
    lat: 23.7104,
    lon: 90.4074,
  },
});

export const DistrictSchema = z
  .object({ ...areaFields, division: SlugSchema })
  .openapi('District', {
    example: {
      slug: 'cumilla',
      name_en: 'Cumilla',
      name_bn: 'কুমিল্লা',
      aliases: ['Comilla'],
      division: 'chattogram',
      bbs_code: 'BD2019',
      lat: 23.4683,
      lon: 91.1788,
    },
  });

export const UpazilaSchema = z.object({ ...areaFields, district: SlugSchema }).openapi('Upazila', {
  example: {
    slug: 'debidwar',
    name_en: 'Debidwar',
    name_bn: 'দেবিদ্বার',
    aliases: [],
    district: 'cumilla',
    bbs_code: 'BD20190040',
    lat: 23.5797,
    lon: 90.9981,
  },
});

export const UnionSchema = z
  .object({
    ...areaFields,
    slug: SlugSchema.openapi({ description: 'Unique within its upazila' }),
    upazila: SlugSchema,
  })
  .openapi('Union', {
    example: {
      slug: 'subil',
      name_en: 'Subil',
      name_bn: 'সুবিল',
      aliases: [],
      upazila: 'debidwar',
      bbs_code: 'BD20194095',
      lat: 23.6195,
      lon: 91.011,
    },
  });

export const CityCorporationSchema = z
  .object({ ...areaFields, district: SlugSchema })
  .openapi('CityCorporation');

export const PostOfficeSchema = z
  .object({
    postcode: z.string().regex(/^\d{4}$/),
    name_en: NameEnSchema,
    name_bn: NameBnSchema.nullable().openapi({
      description: 'Not yet available for post offices (null until contributed)',
    }),
    thana_en: NameEnSchema.openapi({ description: 'Postal thana as published by the Post Office' }),
    district: SlugSchema,
    upazila: SlugSchema.optional(),
    city_corporation: SlugSchema.optional(),
    lat: LatSchema.optional(),
    lon: LonSchema.optional(),
  })
  .openapi('PostOffice', {
    example: {
      postcode: '1205',
      name_en: 'New Market',
      name_bn: null,
      thana_en: 'Dhanmondi',
      district: 'dhaka',
      city_corporation: 'dhaka-south',
      lat: 23.7383,
      lon: 90.3833,
    },
  });

export const GeoLevelSchema = z.enum(['division', 'district', 'upazila', 'union', 'post_office']);

export const ParentsSchema = z
  .object({
    division: RefSchema.optional(),
    district: RefSchema.optional(),
    upazila: RefSchema.optional(),
    city_corporation: RefSchema.optional(),
  })
  .openapi('Parents');

export const SearchHitSchema = z
  .object({
    level: GeoLevelSchema,
    slug: z.string(),
    name_en: NameEnSchema,
    name_bn: NameBnSchema.nullable(),
    postcode: z.string().optional(),
    parents: ParentsSchema,
  })
  .openapi('SearchHit', {
    example: {
      level: 'district',
      slug: 'cumilla',
      name_en: 'Cumilla',
      name_bn: 'কুমিল্লা',
      parents: { division: { slug: 'chattogram', name_en: 'Chattogram', name_bn: 'চট্টগ্রাম' } },
    },
  });

export const PostcodeLookupSchema = z
  .object({ postcode: z.string(), post_offices: z.array(PostOfficeSchema) })
  .openapi('PostcodeLookup', {
    example: {
      postcode: '1205',
      post_offices: [
        {
          postcode: '1205',
          name_en: 'New Market TSO',
          name_bn: null,
          thana_en: 'New market',
          district: 'dhaka',
          city_corporation: 'dhaka-south',
          lat: 23.7433,
          lon: 90.3841,
        },
      ],
    },
  });

export const NearestAreaSchema = z
  .object({ area: SearchHitSchema, distance_km: z.number() })
  .openapi('NearestArea', {
    example: {
      area: {
        level: 'district',
        slug: 'dhaka',
        name_en: 'Dhaka',
        name_bn: 'ঢাকা',
        parents: { division: { slug: 'dhaka', name_en: 'Dhaka', name_bn: 'ঢাকা' } },
      },
      distance_km: 6.07,
    },
  });

/** Pre-built search index row: [normalised text, level, record index]. Generated, never hand-edited. */
export type SearchIndexRow = [text: string, level: z.infer<typeof GeoLevelSchema>, index: number];

export type Division = z.infer<typeof DivisionSchema>;
export type District = z.infer<typeof DistrictSchema>;
export type Upazila = z.infer<typeof UpazilaSchema>;
export type Union = z.infer<typeof UnionSchema>;
export type CityCorporation = z.infer<typeof CityCorporationSchema>;
export type PostOffice = z.infer<typeof PostOfficeSchema>;
export type GeoLevel = z.infer<typeof GeoLevelSchema>;
export type Parents = z.infer<typeof ParentsSchema>;
export type SearchHit = z.infer<typeof SearchHitSchema>;

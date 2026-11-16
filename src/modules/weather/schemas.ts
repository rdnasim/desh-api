import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const SignalSeveritySchema = z
  .enum(['low', 'moderate', 'high', 'critical', 'extreme'])
  .openapi('SignalSeverity');

export const MaritimeSignalSchema = z
  .object({
    number: z.number().int().min(1).max(11).openapi({ example: 10 }),
    slug: SlugSchema.openapi({ example: 'great-danger-10' }),
    name_en: NameEnSchema.openapi({ example: 'Great Danger Signal No. 10' }),
    name_bn: NameBnSchema.openapi({ example: 'মহাবিপদ সংকেত ১০' }),
    severity: SignalSeveritySchema,
    wind_speed_kmh: z.string().openapi({ example: '89 km/h or higher' }),
    meaning_en: z.string(),
    meaning_bn: z.string(),
    action_required: z.string(),
  })
  .openapi('MaritimeSignal', {
    example: {
      number: 10,
      slug: 'great-danger-10',
      name_en: 'Great Danger Signal No. 10',
      name_bn: 'মহাবিপদ সংকেত ১০',
      severity: 'extreme',
      wind_speed_kmh: '89 km/h or higher',
      meaning_en:
        'Port will experience severe weather from a cyclonic storm of great intensity expected to cross the coast directly over or near the port.',
      meaning_bn:
        'বন্দরটি একটি প্রচণ্ড তীব্রতার ঘূর্ণিঝড়ের কবলে পড়বে যা সরাসরি বন্দরের উপর দিয়ে বা খুব নিকট দিয়ে উপকূল অতিক্রম করবে।',
      action_required:
        'Catastrophic danger: entire port area and surrounding coastal population must take immediate shelter in cyclone centers.',
    },
  });

export const RiverportSignalSchema = z
  .object({
    number: z.number().int().min(1).max(4).openapi({ example: 2 }),
    slug: SlugSchema.openapi({ example: 'warning-2' }),
    name_en: NameEnSchema.openapi({ example: 'Riverport Warning Signal No. 2' }),
    name_bn: NameBnSchema.openapi({ example: 'নদীবন্দর হুঁশিয়ারি সংকেত ২' }),
    severity: SignalSeveritySchema,
    wind_speed_kmh: z.string().openapi({ example: '65–88 km/h' }),
    meaning_en: z.string(),
    meaning_bn: z.string(),
    vessel_guideline: z.string(),
  })
  .openapi('RiverportSignal', {
    example: {
      number: 2,
      slug: 'warning-2',
      name_en: 'Riverport Warning Signal No. 2',
      name_bn: 'নদীবন্দর হুঁশিয়ারি সংকেত ২',
      severity: 'moderate',
      wind_speed_kmh: '65–88 km/h',
      meaning_en: 'A squall or storm of wind speed 65–88 km/h will soon affect the riverport area.',
      meaning_bn: 'নদীবন্দর এলাকায় ৬৫–৮৮ কিমি/ঘণ্টা বেগে ঝড় বয়ে যেতে পারে।',
      vessel_guideline:
        'Vessels of length 65 feet or less must remain in safe shelter; larger motorized launches may proceed with extreme caution.',
    },
  });

export const AqiCategorySchema = z
  .object({
    slug: SlugSchema.openapi({ example: 'unhealthy' }),
    name_en: NameEnSchema.openapi({ example: 'Unhealthy' }),
    name_bn: NameBnSchema.openapi({ example: 'অস্বাস্থ্যকর' }),
    min_aqi: z.number().int().min(0).openapi({ example: 151 }),
    max_aqi: z.number().int().openapi({ example: 200 }),
    color_hex: z.string().openapi({ example: '#FF0000' }),
    health_implication_en: z.string(),
    health_implication_bn: z.string(),
    cautionary_statement_en: z.string(),
    cautionary_statement_bn: z.string(),
  })
  .openapi('AqiCategory', {
    example: {
      slug: 'unhealthy',
      name_en: 'Unhealthy',
      name_bn: 'অস্বাস্থ্যকর',
      min_aqi: 151,
      max_aqi: 200,
      color_hex: '#FF0000',
      health_implication_en:
        'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
      health_implication_bn:
        'সকলের স্বাস্থ্য ঝুঁকি দেখা দিতে পারে; সংবেদনশীল জনগোষ্ঠীর ক্ষেত্রে মারাত্মক স্বাস্থ্য সমস্যা হতে পারে।',
      cautionary_statement_en:
        'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion.',
      cautionary_statement_bn:
        'শিশু, বয়োবৃদ্ধ ও শ্বাসকষ্টের রোগীদের দীর্ঘ সময় বাইরে পরিশ্রম পরিহার করা উচিত।',
    },
  });

export const AqiLookupResponseSchema = z
  .object({
    aqi: z.number().int().min(0).openapi({ example: 165 }),
    category: AqiCategorySchema,
    recommendation_en: z.string(),
    recommendation_bn: z.string(),
  })
  .openapi('AqiLookupResponse', {
    example: {
      aqi: 165,
      category: {
        slug: 'unhealthy',
        name_en: 'Unhealthy',
        name_bn: 'অস্বাস্থ্যকর',
        min_aqi: 151,
        max_aqi: 200,
        color_hex: '#FF0000',
        health_implication_en:
          'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
        health_implication_bn:
          'সকলের স্বাস্থ্য ঝুঁকি দেখা দিতে পারে; সংবেদনশীল জনগোষ্ঠীর ক্ষেত্রে মারাত্মক স্বাস্থ্য সমস্যা হতে পারে।',
        cautionary_statement_en:
          'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion.',
        cautionary_statement_bn:
          'শিশু, বয়োবৃদ্ধ ও শ্বাসকষ্টের রোগীদের দীর্ঘ সময় বাইরে পরিশ্রম পরিহার করা উচিত।',
      },
      recommendation_en: 'Wear an N95 mask outdoors and keep indoor windows closed.',
      recommendation_bn: 'বাইরে বের হলে এন৯৫ মাস্ক পরিধান করুন এবং ঘরের জানালা বন্ধ রাখুন।',
    },
  });

export const BanglaSeasonSchema = z
  .object({
    order: z.number().int().min(1).max(6).openapi({ example: 1 }),
    slug: SlugSchema.openapi({ example: 'grishma' }),
    name_en: NameEnSchema.openapi({ example: 'Summer' }),
    name_bn: NameBnSchema.openapi({ example: 'গ্রীষ্ম' }),
    bangla_months: z.array(z.string()).openapi({ example: ['বৈশাখ', 'জ্যৈষ্ঠ'] }),
    approx_gregorian_span: z.string().openapi({ example: 'Mid-April to Mid-June' }),
    description_en: z.string(),
    description_bn: z.string(),
  })
  .openapi('BanglaSeason', {
    example: {
      order: 1,
      slug: 'grishma',
      name_en: 'Summer',
      name_bn: 'গ্রীষ্ম',
      bangla_months: ['বৈশাখ', 'জ্যৈষ্ঠ'],
      approx_gregorian_span: 'Mid-April to Mid-June',
      description_en:
        "The hottest season with Kalbaishakhi thunderstorms and tropical fruit harvests.",
      description_bn:
        'তীব্র রোদ ও গরমের ঋতু; কালবৈশাখী ঝড় এবং মৌসুমি ফলের সমাহারে সমৃদ্ধ মধুমাস।',
    },
  });

export type MaritimeSignal = z.infer<typeof MaritimeSignalSchema>;
export type RiverportSignal = z.infer<typeof RiverportSignalSchema>;
export type AqiCategory = z.infer<typeof AqiCategorySchema>;
export type AqiLookupResponse = z.infer<typeof AqiLookupResponseSchema>;
export type BanglaSeason = z.infer<typeof BanglaSeasonSchema>;

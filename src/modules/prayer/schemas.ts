import { z } from '@hono/zod-openapi';

export const DistrictOffsetSchema = z
  .object({
    slug: z.string().openapi({ example: 'chattogram' }),
    name_en: z.string().openapi({ example: 'Chattogram' }),
    name_bn: z.string().openapi({ example: 'চট্টগ্রাম' }),
    bbs_code: z.string().openapi({ example: 'BD2015' }),
    division: z.string().openapi({ example: 'chattogram' }),
    sehri_offset_minutes: z.number().openapi({ example: -5 }),
    iftar_offset_minutes: z.number().openapi({ example: -5 }),
    fajr_offset_minutes: z.number().openapi({ example: -5 }),
    dhuhr_offset_minutes: z.number().openapi({ example: -5 }),
    asr_offset_minutes: z.number().openapi({ example: -5 }),
    maghrib_offset_minutes: z.number().openapi({ example: -5 }),
    isha_offset_minutes: z.number().openapi({ example: -5 }),
  })
  .openapi('DistrictOffset', {
    example: {
      slug: 'chattogram',
      name_en: 'Chattogram',
      name_bn: 'চট্টগ্রাম',
      bbs_code: 'BD2015',
      division: 'chattogram',
      sehri_offset_minutes: -5,
      iftar_offset_minutes: -5,
      fajr_offset_minutes: -5,
      dhuhr_offset_minutes: -5,
      asr_offset_minutes: -5,
      maghrib_offset_minutes: -5,
      isha_offset_minutes: -5,
    },
  });

export type DistrictOffset = z.infer<typeof DistrictOffsetSchema>;

export const PrayerDistrictSchema = z
  .object({
    slug: z.string().openapi({ example: 'dhaka' }),
    name_en: z.string().openapi({ example: 'Dhaka' }),
    name_bn: z.string().openapi({ example: 'ঢাকা' }),
    division: z.string().openapi({ example: 'dhaka' }),
  })
  .openapi('PrayerDistrict');

export const PrayerTimes24hSchema = z
  .object({
    sehri_cutoff: z.string().openapi({ example: '04:52' }),
    fajr: z.string().openapi({ example: '04:55' }),
    sunrise: z.string().openapi({ example: '06:12' }),
    dhuhr: z.string().openapi({ example: '12:05' }),
    asr: z.string().openapi({ example: '16:18' }),
    maghrib: z.string().openapi({ example: '18:08' }),
    isha: z.string().openapi({ example: '19:22' }),
    sunset: z.string().openapi({ example: '18:08' }),
  })
  .openapi('PrayerTimes24h');

export const PrayerTimes12hSchema = z
  .object({
    sehri_cutoff: z.string().openapi({ example: '04:52 AM' }),
    fajr: z.string().openapi({ example: '04:55 AM' }),
    sunrise: z.string().openapi({ example: '06:12 AM' }),
    dhuhr: z.string().openapi({ example: '12:05 PM' }),
    asr: z.string().openapi({ example: '04:18 PM' }),
    maghrib: z.string().openapi({ example: '06:08 PM' }),
    isha: z.string().openapi({ example: '07:22 PM' }),
  })
  .openapi('PrayerTimes12h');

export const PrayerTimesBnSchema = z
  .object({
    sehri_cutoff: z.string().openapi({ example: '০৪:৫২ ভোর' }),
    fajr: z.string().openapi({ example: '০৪:৫৫ ভোর' }),
    sunrise: z.string().openapi({ example: '০৬:১২ সকাল' }),
    dhuhr: z.string().openapi({ example: '১২:০৫ দুপুর' }),
    asr: z.string().openapi({ example: '০৪:১৮ বিকাল' }),
    maghrib: z.string().openapi({ example: '০৬:০৮ সন্ধ্যা' }),
    isha: z.string().openapi({ example: '০৭:২২ রাত' }),
  })
  .openapi('PrayerTimesBn');

export const DailyPrayerTimesSchema = z
  .object({
    date: z.string().openapi({ example: '2026-03-20' }),
    hijri_date: z.string().openapi({ example: '1 Ramadan 1447 AH' }),
    hijri_date_bn: z.string().openapi({ example: '১ রমজান ১৪৪৭ হিজরি' }),
    bangla_date: z.string().openapi({ example: '৬ চৈত্র ১৪৩২ বঙ্গাব্দ' }),
    district: PrayerDistrictSchema,
    school: z.enum(['hanafi', 'shafi']).openapi({ example: 'hanafi' }),
    times: PrayerTimes24hSchema,
    times_12h: PrayerTimes12hSchema,
    times_bn: PrayerTimesBnSchema,
  })
  .openapi('DailyPrayerTimes', {
    example: {
      date: '2026-03-20',
      hijri_date: '1 Ramadan 1447 AH',
      hijri_date_bn: '১ রমজান ১৪৪৭ হিজরি',
      bangla_date: '৬ চৈত্র ১৪৩২ বঙ্গাব্দ',
      district: {
        slug: 'dhaka',
        name_en: 'Dhaka',
        name_bn: 'ঢাকা',
        division: 'dhaka',
      },
      school: 'hanafi',
      times: {
        sehri_cutoff: '04:52',
        fajr: '04:55',
        sunrise: '06:12',
        dhuhr: '12:05',
        asr: '16:18',
        maghrib: '18:08',
        sunset: '18:08',
        isha: '19:22',
      },
      times_12h: {
        sehri_cutoff: '04:52 AM',
        fajr: '04:55 AM',
        sunrise: '06:12 AM',
        dhuhr: '12:05 PM',
        asr: '04:18 PM',
        maghrib: '06:08 PM',
        isha: '07:22 PM',
      },
      times_bn: {
        sehri_cutoff: '০৪:৫২ ভোর',
        fajr: '০৪:৫৫ ভোর',
        sunrise: '০৬:১২ সকাল',
        dhuhr: '১২:০৫ দুপুর',
        asr: '০৪:১৮ বিকাল',
        maghrib: '০৬:০৮ সন্ধ্যা',
        isha: '০৭:২২ রাত',
      },
    },
  });

export type DailyPrayerTimes = z.infer<typeof DailyPrayerTimesSchema>;

export const RamadanDaySchema = z
  .object({
    day: z.number().int().openapi({ example: 1 }),
    gregorian_date: z.string().openapi({ example: '2026-02-18' }),
    bangla_date: z.string().openapi({ example: '৬ ফাল্গুন ১৪৩২' }),
    hijri_date: z.string().openapi({ example: '1 Ramadan 1447' }),
    sehri_cutoff: z.string().openapi({ example: '05:08' }),
    fajr: z.string().openapi({ example: '05:11' }),
    iftar: z.string().openapi({ example: '17:58' }),
    sehri_cutoff_12h: z.string().openapi({ example: '05:08 AM' }),
    iftar_12h: z.string().openapi({ example: '05:58 PM' }),
    sehri_cutoff_bn: z.string().openapi({ example: '০৫:০৮ ভোর' }),
    iftar_bn: z.string().openapi({ example: '০৫:৫৮ সন্ধ্যা' }),
  })
  .openapi('RamadanDay', {
    example: {
      day: 1,
      gregorian_date: '2026-02-18',
      bangla_date: '৬ ফাল্গুন ১৪৩২',
      hijri_date: '1 Ramadan 1447',
      sehri_cutoff: '05:08',
      fajr: '05:11',
      iftar: '17:58',
      sehri_cutoff_12h: '05:08 AM',
      iftar_12h: '05:58 PM',
      sehri_cutoff_bn: '০৫:০৮ ভোর',
      iftar_bn: '০৫:৫৮ সন্ধ্যা',
    },
  });

export type RamadanDay = z.infer<typeof RamadanDaySchema>;

export const RamadanScheduleSchema = z
  .object({
    year_hijri: z.number().int().openapi({ example: 1447 }),
    year_gregorian: z.number().int().openapi({ example: 2026 }),
    district: PrayerDistrictSchema,
    disclaimer_en: z.string().openapi({
      example:
        'Dates are tentative and subject to the sighting of the moon (Islamic Foundation Bangladesh).',
    }),
    disclaimer_bn: z.string().openapi({
      example: 'তারিখ চাঁদ দেখার ওপর নির্ভরশীল (ইসলামিক ফাউন্ডেশন বাংলাদেশ)।',
    }),
    days: z.array(RamadanDaySchema),
  })
  .openapi('RamadanSchedule', {
    example: {
      year_hijri: 1447,
      year_gregorian: 2026,
      district: {
        slug: 'dhaka',
        name_en: 'Dhaka',
        name_bn: 'ঢাকা',
        division: 'dhaka',
      },
      disclaimer_en:
        'Dates are tentative and subject to the sighting of the moon (Islamic Foundation Bangladesh).',
      disclaimer_bn: 'তারিখ চাঁদ দেখার ওপর নির্ভরশীল (ইসলামিক ফাউন্ডেশন বাংলাদেশ)।',
      days: [
        {
          day: 1,
          gregorian_date: '2026-02-18',
          bangla_date: '৬ ফাল্গুন ১৪৩২',
          hijri_date: '1 Ramadan 1447',
          sehri_cutoff: '05:08',
          fajr: '05:11',
          iftar: '17:58',
          sehri_cutoff_12h: '05:08 AM',
          iftar_12h: '05:58 PM',
          sehri_cutoff_bn: '০৫:০৮ ভোর',
          iftar_bn: '০৫:৫৮ সন্ধ্যা',
        },
      ],
    },
  });

export type RamadanSchedule = z.infer<typeof RamadanScheduleSchema>;

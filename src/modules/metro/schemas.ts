import { z } from '@hono/zod-openapi';

export const MetroStationStatusSchema = z.enum(['operational', 'under_construction']).openapi({
  example: 'operational',
});

export const MetroStationSchema = z
  .object({
    slug: z.string().openapi({ example: 'uttara-north' }),
    order: z.number().int().openapi({ example: 1 }),
    code: z.string().openapi({ example: 'UN' }),
    name_en: z.string().openapi({ example: 'Uttara North' }),
    name_bn: z.string().openapi({ example: 'উত্তরা উত্তর' }),
    line: z.string().openapi({ example: 'MRT-6' }),
    status: MetroStationStatusSchema,
    lat: z.number().openapi({ example: 23.8741 }),
    lon: z.number().openapi({ example: 90.3857 }),
    division: z.string().openapi({ example: 'dhaka' }),
    district: z.string().openapi({ example: 'dhaka' }),
    connecting_routes: z.array(z.string()).optional(),
    features: z.array(z.string()).openapi({
      example: ['elevator', 'escalator', 'ticket_vending_machine', 'accessible_toilet'],
    }),
    distance_from_start_km: z.number().openapi({ example: 0 }),
  })
  .openapi('MetroStation', {
    example: {
      slug: 'uttara-north',
      order: 1,
      code: 'UN',
      name_en: 'Uttara North',
      name_bn: 'উত্তরা উত্তর',
      line: 'MRT-6',
      status: 'operational',
      lat: 23.8741,
      lon: 90.3857,
      division: 'dhaka',
      district: 'dhaka',
      features: ['elevator', 'escalator', 'ticket_vending_machine', 'accessible_toilet'],
      distance_from_start_km: 0,
    },
  });

export type MetroStation = z.infer<typeof MetroStationSchema>;

export const MetroStationBriefSchema = z
  .object({
    slug: z.string().openapi({ example: 'uttara-north' }),
    code: z.string().openapi({ example: 'UN' }),
    name_en: z.string().openapi({ example: 'Uttara North' }),
    name_bn: z.string().openapi({ example: 'উত্তরা উত্তর' }),
  })
  .openapi('MetroStationBrief');

export const MetroFareCalculationSchema = z
  .object({
    from: MetroStationBriefSchema,
    to: MetroStationBriefSchema,
    stations_traversed: z.number().int().openapi({ example: 16 }),
    distance_km: z.number().openapi({ example: 20.1 }),
    estimated_time_minutes: z.number().int().openapi({ example: 32 }),
    single_journey_fare: z.number().openapi({ example: 100 }),
    single_journey_fare_bn: z.string().openapi({ example: '১০০' }),
    mrt_pass_fare: z.number().openapi({ example: 90 }),
    mrt_pass_fare_bn: z.string().openapi({ example: '৯০' }),
    discount_percent: z.number().openapi({ example: 10 }),
    currency: z.literal('BDT').openapi({ example: 'BDT' }),
    concessions: z.object({
      children_under_3ft: z
        .string()
        .openapi({ example: 'Free when accompanied by a paying guardian' }),
      freedom_fighters: z.string().openapi({ example: 'Free travel with valid certificate' }),
      persons_with_disabilities: z
        .string()
        .openapi({ example: 'Special concession on Rapid Pass' }),
    }),
  })
  .openapi('MetroFareCalculation', {
    example: {
      from: {
        slug: 'uttara-north',
        code: 'UN',
        name_en: 'Uttara North',
        name_bn: 'উত্তরা উত্তর',
      },
      to: {
        slug: 'motijheel',
        code: 'MJ',
        name_en: 'Motijheel',
        name_bn: 'মতিঝিল',
      },
      stations_traversed: 16,
      distance_km: 20.1,
      estimated_time_minutes: 32,
      single_journey_fare: 100,
      single_journey_fare_bn: '১০০',
      mrt_pass_fare: 90,
      mrt_pass_fare_bn: '৯০',
      discount_percent: 10,
      currency: 'BDT',
      concessions: {
        children_under_3ft: 'Free when accompanied by a paying guardian',
        freedom_fighters: 'Free travel with valid certificate',
        persons_with_disabilities: 'Special concession on Rapid Pass',
      },
    },
  });

export type MetroFareCalculation = z.infer<typeof MetroFareCalculationSchema>;

export const MetroScheduleWindowSchema = z
  .object({
    period_en: z.string().openapi({ example: 'Peak Hours (Morning)' }),
    period_bn: z.string().openapi({ example: 'পিক আওয়ার (সকাল)' }),
    start_time: z.string().openapi({ example: '07:10' }),
    end_time: z.string().openapi({ example: '11:30' }),
    headway_minutes: z.number().openapi({ example: 8 }),
  })
  .openapi('MetroScheduleWindow');

export const MetroTimetableSchema = z
  .object({
    line: z.string().openapi({ example: 'MRT Line-6' }),
    operating_days: z.array(z.string()).openapi({
      example: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }),
    regular_service: z.object({
      first_train_uttara_north: z.string().openapi({ example: '07:10' }),
      last_train_uttara_north: z.string().openapi({ example: '20:30' }),
      first_train_motijheel: z.string().openapi({ example: '07:30' }),
      last_train_motijheel: z.string().openapi({ example: '21:00' }),
      extended_mrt_pass_last_train_uttara: z.string().openapi({ example: '21:00' }),
      extended_mrt_pass_last_train_motijheel: z.string().openapi({ example: '21:40' }),
      schedule_windows: z.array(MetroScheduleWindowSchema),
    }),
    friday_service: z.object({
      description_en: z.string().openapi({ example: 'Special afternoon service only' }),
      description_bn: z.string().openapi({ example: 'শুধুমাত্র শুক্রবার বিকাল ও রাতে সেবা চালু থাকে' }),
      first_train: z.string().openapi({ example: '15:00' }),
      last_train: z.string().openapi({ example: '21:40' }),
      headway_minutes: z.number().openapi({ example: 10 }),
    }),
    notes_en: z.array(z.string()),
    notes_bn: z.array(z.string()),
  })
  .openapi('MetroTimetable', {
    example: {
      line: 'MRT Line-6',
      operating_days: [
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
      regular_service: {
        first_train_uttara_north: '07:10',
        last_train_uttara_north: '20:30',
        first_train_motijheel: '07:30',
        last_train_motijheel: '21:00',
        extended_mrt_pass_last_train_uttara: '21:00',
        extended_mrt_pass_last_train_motijheel: '21:40',
        schedule_windows: [
          {
            period_en: 'Peak Hours (Morning)',
            period_bn: 'পিক আওয়ার (সকাল)',
            start_time: '07:10',
            end_time: '11:30',
            headway_minutes: 8,
          },
        ],
      },
      friday_service: {
        description_en: 'Special afternoon service only',
        description_bn: 'শুধুমাত্র শুক্রবার বিকাল ও রাতে সেবা চালু থাকে',
        first_train: '15:00',
        last_train: '21:40',
        headway_minutes: 10,
      },
      notes_en: ['Single Journey tickets must be used on the day of purchase.'],
      notes_bn: ['একক যাত্রার টিকিট ক্রয়ের দিনই ব্যবহার করতে হয়।'],
    },
  });

export type MetroTimetable = z.infer<typeof MetroTimetableSchema>;

export const MetroLineSchema = z
  .object({
    id: z.string().openapi({ example: 'mrt-line-6' }),
    name_en: z.string().openapi({ example: 'MRT Line-6' }),
    name_bn: z.string().openapi({ example: 'এমআরটি লাইন-৬' }),
    color_hex: z.string().openapi({ example: '#008751' }),
    operator_en: z.string().openapi({ example: 'Dhaka Mass Transit Company Limited (DMTCL)' }),
    operator_bn: z.string().openapi({ example: 'ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (ডিএমটিসিএল)' }),
    total_length_km: z.number().openapi({ example: 21.26 }),
    operational_length_km: z.number().openapi({ example: 20.1 }),
    stations_count: z.number().int().openapi({ example: 16 }),
    terminals_en: z.array(z.string()).openapi({ example: ['Uttara North', 'Motijheel'] }),
    terminals_bn: z.array(z.string()).openapi({ example: ['উত্তরা উত্তর', 'মতিঝিল'] }),
    track_gauge: z.string().openapi({ example: '1435 mm (Standard Gauge)' }),
    electrification: z.string().openapi({ example: '1500 V DC Overhead Catenary' }),
    phase: z.string().openapi({ example: 'Phase 1 & 2 Operational, Kamalapur extension ongoing' }),
  })
  .openapi('MetroLine', {
    example: {
      id: 'mrt-line-6',
      name_en: 'MRT Line-6',
      name_bn: 'এমআরটি লাইন-৬',
      color_hex: '#008751',
      operator_en: 'Dhaka Mass Transit Company Limited (DMTCL)',
      operator_bn: 'ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (ডিএমটিসিএল)',
      total_length_km: 21.26,
      operational_length_km: 20.1,
      stations_count: 16,
      terminals_en: ['Uttara North', 'Motijheel'],
      terminals_bn: ['উত্তরা উত্তর', 'মতিঝিল'],
      track_gauge: '1435 mm (Standard Gauge)',
      electrification: '1500 V DC Overhead Catenary',
      phase: 'Phase 1 & 2 Operational, Kamalapur extension ongoing',
    },
  });

export type MetroLine = z.infer<typeof MetroLineSchema>;

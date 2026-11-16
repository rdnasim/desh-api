import stationsData from '../../generated/metro.stations';
import { toBanglaDigits } from '../../lib/digits';
import type {
  MetroFareCalculation,
  MetroLine,
  MetroStation,
  MetroTimetable,
} from './schemas';

export const stations: MetroStation[] = stationsData;

const stationsBySlug = new Map<string, MetroStation>(
  stations.map((s) => [s.slug.toLowerCase(), s]),
);
const stationsByCode = new Map<string, MetroStation>(
  stations.map((s) => [s.code.toLowerCase(), s]),
);

export function listStations(status?: 'operational' | 'under_construction'): MetroStation[] {
  let list = [...stations].sort((a, b) => a.order - b.order);
  if (status) {
    list = list.filter((s) => s.status === status);
  }
  return list;
}

export function getStation(slugOrCode: string): MetroStation | undefined {
  const key = slugOrCode.trim().toLowerCase();
  return stationsBySlug.get(key) || stationsByCode.get(key);
}

/**
 * Calculates fare according to official DMTCL MRT Line-6 fare chart.
 * Minimum fare: ৳20.
 * Slabs based on distance:
 *  ≤ 4.0 km: ৳20
 *  4.1 – 6.0 km: ৳30
 *  6.1 – 8.0 km: ৳40
 *  8.1 – 10.0 km: ৳50
 *  10.1 – 12.0 km: ৳60
 *  12.1 – 14.0 km: ৳70
 *  14.1 – 16.0 km: ৳80
 *  16.1 – 18.0 km: ৳90
 *  > 18.0 km (up to 20.1 km end-to-end): ৳100
 *
 * MRT Pass / Rapid Pass holders receive a 10% discount on every fare.
 */
export function calculateFare(fromSlug: string, toSlug: string): MetroFareCalculation {
  const fromStation = getStation(fromSlug);
  const toStation = getStation(toSlug);

  if (!fromStation) {
    throw new Error(`UNKNOWN_STATION: Unknown origin station '${fromSlug}'`);
  }
  if (!toStation) {
    throw new Error(`UNKNOWN_STATION: Unknown destination station '${toSlug}'`);
  }
  if (fromStation.slug === toStation.slug) {
    throw new Error('SAME_STATION: Origin and destination stations must be different');
  }

  const distanceKm = Math.round(Math.abs(toStation.distance_from_start_km - fromStation.distance_from_start_km) * 100) / 100;
  const stationsTraversed = Math.abs(toStation.order - fromStation.order);

  let singleFare = 20;
  if (distanceKm <= 4.0) {
    singleFare = 20;
  } else if (distanceKm <= 6.0) {
    singleFare = 30;
  } else if (distanceKm <= 8.0) {
    singleFare = 40;
  } else if (distanceKm <= 10.0) {
    singleFare = 50;
  } else if (distanceKm <= 12.0) {
    singleFare = 60;
  } else if (distanceKm <= 14.0) {
    singleFare = 70;
  } else if (distanceKm <= 16.0) {
    singleFare = 80;
  } else if (distanceKm <= 18.0) {
    singleFare = 90;
  } else {
    singleFare = 100;
  }

  // 10% discount for MRT Pass / Rapid Pass
  const mrtPassFare = Math.round(singleFare * 0.9);
  const estimatedTimeMinutes = Math.max(3, Math.round(stationsTraversed * 2));

  return {
    from: {
      slug: fromStation.slug,
      code: fromStation.code,
      name_en: fromStation.name_en,
      name_bn: fromStation.name_bn,
    },
    to: {
      slug: toStation.slug,
      code: toStation.code,
      name_en: toStation.name_en,
      name_bn: toStation.name_bn,
    },
    stations_traversed: stationsTraversed,
    distance_km: distanceKm,
    estimated_time_minutes: estimatedTimeMinutes,
    single_journey_fare: singleFare,
    single_journey_fare_bn: toBanglaDigits(String(singleFare)),
    mrt_pass_fare: mrtPassFare,
    mrt_pass_fare_bn: toBanglaDigits(String(mrtPassFare)),
    discount_percent: 10,
    currency: 'BDT',
    concessions: {
      children_under_3ft: 'Free when accompanied by a paying guardian',
      freedom_fighters: 'Free travel with valid certificate',
      persons_with_disabilities: 'Special concession on Rapid Pass',
    },
  };
}

export function getTimetable(): MetroTimetable {
  return {
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
          period_en: 'Morning Peak Hours',
          period_bn: 'সকালের পিক আওয়ার',
          start_time: '07:10',
          end_time: '11:30',
          headway_minutes: 8,
        },
        {
          period_en: 'Midday Off-Peak Hours',
          period_bn: 'দুপুরের অফ-পিক আওয়ার',
          start_time: '11:31',
          end_time: '16:00',
          headway_minutes: 10,
        },
        {
          period_en: 'Evening Peak Hours',
          period_bn: 'সন্ধ্যার পিক আওয়ার',
          start_time: '16:01',
          end_time: '20:00',
          headway_minutes: 8,
        },
        {
          period_en: 'Night Off-Peak Hours',
          period_bn: 'রাতের অফ-পিক আওয়ার',
          start_time: '20:01',
          end_time: '20:30',
          headway_minutes: 10,
        },
      ],
    },
    friday_service: {
      description_en: 'Special afternoon and evening service',
      description_bn: 'শুক্রবার বিকাল ৩টা থেকে রাত ৯টা ৪০ মিনিট পর্যন্ত সেবা চালু থাকে',
      first_train: '15:00',
      last_train: '21:40',
      headway_minutes: 10,
    },
    notes_en: [
      'Single Journey Tickets (SJT) must be used on the day of purchase within 10 minutes of entry.',
      'MRT Pass / Rapid Pass holders receive a 10% discount on every journey.',
      'Extended trains between 20:30 and 21:40 are reserved exclusively for MRT Pass and Rapid Pass holders.',
      'Children under 3 feet travel free when accompanied by a paying adult.',
    ],
    notes_bn: [
      'একক যাত্রার টিকিট (SJT) শুধুমাত্র ক্রয়ের দিন ব্যবহারযোগ্য।',
      'এমআরটি পাস ও র‍্যাপিড পাস ব্যবহারকারীরা ভাড়ায় ১০% ছাড় পান।',
      'রাত ৮:৩০ থেকে ৯:৪০ পর্যন্ত অতিরিক্ত ট্রেনগুলো শুধুমাত্র এমআরটি ও র‍্যাপিড পাসধারীদের জন্য সংরক্ষিত।',
      '৩ ফুটের কম উচ্চতার শিশুরা অভিভাবকের সাথে বিনামূল্যে ভ্রমণ করতে পারে।',
    ],
  };
}

export function getMetroLine(): MetroLine {
  return {
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
  };
}

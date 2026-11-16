import districtOffsetsData from '../../generated/prayer.district-offsets';
import geoDistrictsData from '../../generated/geo.districts';
import { toBanglaDigits, toLatinDigits } from '../../lib/digits';
import { toBanglaDate, todayInDhaka } from '../bangla/calendar';
import { computeSolarTimes, type SolarTimes } from './astronomy';
import type {
  DailyPrayerTimes,
  DistrictOffset,
  RamadanDay,
  RamadanSchedule,
} from './schemas';

const DHAKA_LAT = 23.8103;
const DHAKA_LON = 90.4125;

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

const HIJRI_MONTHS_BN = [
  'মুহররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ',
] as const;

export const districtOffsets: DistrictOffset[] = districtOffsetsData;
const offsetsBySlug = new Map<string, DistrictOffset>(
  districtOffsets.map((d) => [d.slug, d]),
);
const geoDistrictsBySlug = new Map(
  geoDistrictsData.map((d) => [d.slug, d]),
);

export function findDistrictOffset(slugOrBbs: string): DistrictOffset | undefined {
  const key = slugOrBbs.trim().toLowerCase();
  return (
    offsetsBySlug.get(key) ||
    districtOffsets.find((d) => d.bbs_code.toLowerCase() === key)
  );
}

function adjustMinutes(timeStr: string, minutesDelta: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutesDelta;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function to12h(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

function toBnTime(timeStr: string, isMaghribOrIftar = false): string {
  const [h, m] = timeStr.split(':').map(Number);
  let periodBn = 'রাত';
  if (isMaghribOrIftar) {
    periodBn = 'সন্ধ্যা';
  } else if (h >= 3 && h < 6) {
    periodBn = 'ভোর';
  } else if (h >= 6 && h < 12) {
    periodBn = 'সকাল';
  } else if (h >= 12 && h < 15) {
    periodBn = 'দুপুর';
  } else if (h >= 15 && (h < 17 || (h === 17 && m < 30))) {
    periodBn = 'বিকাল';
  } else if ((h === 17 && m >= 30) || (h >= 18 && h < 20)) {
    periodBn = 'সন্ধ্যা';
  }

  const h12 = h % 12 === 0 ? 12 : h % 12;
  const timeBn = `${toBanglaDigits(String(h12).padStart(2, '0'))}:${toBanglaDigits(String(m).padStart(2, '0'))}`;
  return `${timeBn} ${periodBn}`;
}

export function getHijriDate(date: Date): {
  day: number;
  month: number;
  year: number;
  formatted_en: string;
  formatted_bn: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1447;
    for (const p of parts) {
      if (p.type === 'day') day = Number(p.value);
      if (p.type === 'month') month = Number(p.value);
      if (p.type === 'year') year = Number(p.value);
    }
    const monthEn = HIJRI_MONTHS_EN[month - 1] ?? 'Ramadan';
    const monthBn = HIJRI_MONTHS_BN[month - 1] ?? 'রমজান';
    return {
      day,
      month,
      year,
      formatted_en: `${day} ${monthEn} ${year} AH`,
      formatted_bn: `${toBanglaDigits(String(day))} ${monthBn} ${toBanglaDigits(String(year))} হিজরি`,
    };
  } catch {
    return {
      day: 1,
      month: 9,
      year: 1447,
      formatted_en: '1 Ramadan 1447 AH',
      formatted_bn: '১ রমজান ১৪৪৭ হিজরি',
    };
  }
}

export function getDailyPrayerTimes(
  dateIso?: string,
  districtSlug = 'dhaka',
  school: 'hanafi' | 'shafi' = 'hanafi',
): DailyPrayerTimes {
  const rawDate = dateIso ? toLatinDigits(dateIso.trim()) : todayInDhaka();
  const [y, m, d] = rawDate.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));

  const offsetInfo = findDistrictOffset(districtSlug) || findDistrictOffset('dhaka')!;
  const geoInfo = geoDistrictsBySlug.get(offsetInfo.slug);

  // Compute baseline times for Dhaka
  const baseTimes = computeSolarTimes(y, m, d, DHAKA_LAT, DHAKA_LON, school);

  // Apply Islamic Foundation Bangladesh district minute offset
  const offset = offsetInfo.sehri_offset_minutes;
  const times: SolarTimes = {
    sehri_cutoff: adjustMinutes(baseTimes.sehri_cutoff, offsetInfo.sehri_offset_minutes),
    fajr: adjustMinutes(baseTimes.fajr, offsetInfo.fajr_offset_minutes),
    sunrise: adjustMinutes(baseTimes.sunrise, offsetInfo.fajr_offset_minutes),
    dhuhr: adjustMinutes(baseTimes.dhuhr, offsetInfo.dhuhr_offset_minutes),
    asr: adjustMinutes(baseTimes.asr, offsetInfo.asr_offset_minutes),
    maghrib: adjustMinutes(baseTimes.maghrib, offsetInfo.maghrib_offset_minutes),
    sunset: adjustMinutes(baseTimes.sunset, offsetInfo.maghrib_offset_minutes),
    isha: adjustMinutes(baseTimes.isha, offsetInfo.isha_offset_minutes),
  };

  const times_12h = {
    sehri_cutoff: to12h(times.sehri_cutoff),
    fajr: to12h(times.fajr),
    sunrise: to12h(times.sunrise),
    dhuhr: to12h(times.dhuhr),
    asr: to12h(times.asr),
    maghrib: to12h(times.maghrib),
    isha: to12h(times.isha),
  };

  const times_bn = {
    sehri_cutoff: toBnTime(times.sehri_cutoff),
    fajr: toBnTime(times.fajr),
    sunrise: toBnTime(times.sunrise),
    dhuhr: toBnTime(times.dhuhr),
    asr: toBnTime(times.asr),
    maghrib: toBnTime(times.maghrib, true),
    isha: toBnTime(times.isha),
  };

  const hijri = getHijriDate(dateObj);
  const bangla = toBanglaDate(rawDate);

  return {
    date: rawDate,
    hijri_date: hijri.formatted_en,
    hijri_date_bn: hijri.formatted_bn,
    bangla_date: bangla.formatted_bn,
    district: {
      slug: offsetInfo.slug,
      name_en: offsetInfo.name_en,
      name_bn: offsetInfo.name_bn,
      division: offsetInfo.division,
    },
    school,
    times,
    times_12h,
    times_bn,
  };
}

/**
 * Standard reference start dates for Ramadan:
 * 1447 AH: 2026-02-18
 * 1448 AH: 2027-02-08
 */
const RAMADAN_STARTS: Record<number, string> = {
  1446: '2025-03-01',
  1447: '2026-02-18',
  1448: '2027-02-08',
  1449: '2028-01-28',
};

export function getRamadanSchedule(
  districtSlug = 'dhaka',
  yearInput?: number | string,
): RamadanSchedule {
  let hijriYear = 1447;
  if (yearInput) {
    const parsed = Number(toLatinDigits(String(yearInput).trim()));
    if (parsed >= 1440 && parsed <= 1460) {
      hijriYear = parsed;
    } else if (parsed >= 2025 && parsed <= 2030) {
      // Map Gregorian year to corresponding Ramadan Hijri year
      hijriYear = parsed === 2025 ? 1446 : parsed === 2026 ? 1447 : parsed === 2027 ? 1448 : 1449;
    }
  }

  const startDateIso = RAMADAN_STARTS[hijriYear] || '2026-02-18';
  const [startY, startM, startD] = startDateIso.split('-').map(Number);
  const offsetInfo = findDistrictOffset(districtSlug) || findDistrictOffset('dhaka')!;

  const days: RamadanDay[] = [];
  for (let i = 0; i < 30; i++) {
    const curDate = new Date(Date.UTC(startY, startM - 1, startD + i));
    const curIso = curDate.toISOString().slice(0, 10);
    const dayTimes = getDailyPrayerTimes(curIso, offsetInfo.slug, 'hanafi');
    const bangla = toBanglaDate(curIso);

    days.push({
      day: i + 1,
      gregorian_date: curIso,
      bangla_date: `${bangla.day_bn} ${bangla.month.name_bn} ${bangla.year_bn}`,
      hijri_date: `${i + 1} Ramadan ${hijriYear}`,
      sehri_cutoff: dayTimes.times.sehri_cutoff,
      fajr: dayTimes.times.fajr,
      iftar: dayTimes.times.maghrib,
      sehri_cutoff_12h: dayTimes.times_12h.sehri_cutoff,
      iftar_12h: dayTimes.times_12h.maghrib,
      sehri_cutoff_bn: dayTimes.times_bn.sehri_cutoff,
      iftar_bn: dayTimes.times_bn.maghrib,
    });
  }

  return {
    year_hijri: hijriYear,
    year_gregorian: startY,
    district: {
      slug: offsetInfo.slug,
      name_en: offsetInfo.name_en,
      name_bn: offsetInfo.name_bn,
      division: offsetInfo.division,
    },
    disclaimer_en:
      'Dates are tentative and subject to the sighting of the moon (Islamic Foundation Bangladesh).',
    disclaimer_bn:
      'তারিখ চাঁদ দেখার ওপর নির্ভরশীল (ইসলামিক ফাউন্ডেশন বাংলাদেশ)।',
    days,
  };
}

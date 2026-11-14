import { toBanglaDigits, toLatinDigits } from '../../lib/digits';
import { invalid } from './errors';

export const MONTHS = [
  { name_bn: 'বৈশাখ', name_en: 'Boishakh' },
  { name_bn: 'জ্যৈষ্ঠ', name_en: 'Joishtho' },
  { name_bn: 'আষাঢ়', name_en: 'Asharh' },
  { name_bn: 'শ্রাবণ', name_en: 'Shrabon' },
  { name_bn: 'ভাদ্র', name_en: 'Bhadro' },
  { name_bn: 'আশ্বিন', name_en: 'Ashwin' },
  { name_bn: 'কার্তিক', name_en: 'Kartik' },
  { name_bn: 'অগ্রহায়ণ', name_en: 'Ogrohayon' },
  { name_bn: 'পৌষ', name_en: 'Poush' },
  { name_bn: 'মাঘ', name_en: 'Magh' },
  { name_bn: 'ফাল্গুন', name_en: 'Falgun' },
  { name_bn: 'চৈত্র', name_en: 'Choitro' },
] as const;

/** Six seasons, two consecutive months each, starting with Boishakh. */
export const SEASONS = [
  { name_bn: 'গ্রীষ্ম', name_en: 'Grishmo (summer)' },
  { name_bn: 'বর্ষা', name_en: 'Borsha (monsoon)' },
  { name_bn: 'শরৎ', name_en: 'Shorot (autumn)' },
  { name_bn: 'হেমন্ত', name_en: 'Hemonto (late autumn)' },
  { name_bn: 'শীত', name_en: 'Sheet (winter)' },
  { name_bn: 'বসন্ত', name_en: 'Boshonto (spring)' },
] as const;

const WEEKDAYS = [
  { name_bn: 'রবিবার', name_en: 'Sunday' },
  { name_bn: 'সোমবার', name_en: 'Monday' },
  { name_bn: 'মঙ্গলবার', name_en: 'Tuesday' },
  { name_bn: 'বুধবার', name_en: 'Wednesday' },
  { name_bn: 'বৃহস্পতিবার', name_en: 'Thursday' },
  { name_bn: 'শুক্রবার', name_en: 'Friday' },
  { name_bn: 'শনিবার', name_en: 'Saturday' },
] as const;

export const MIN_DATE = '1971-01-01';
export const MAX_DATE = '2100-12-31';
const DAY_MS = 86_400_000;

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * Month lengths in the 2019 Bangla Academy revision: Boishakh–Ashwin 31, Kartik–Magh 30,
 * Falgun 29 (30 when the Gregorian year it falls in is a leap year), Chaitra 30.
 */
function monthLengths(falgunGregorianYear: number): number[] {
  return [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap(falgunGregorianYear) ? 30 : 29, 30];
}

/** Today's date in Asia/Dhaka (UTC+6, no daylight saving). */
export function todayInDhaka(now = Date.now()): string {
  return new Date(now + 6 * 3_600_000).toISOString().slice(0, 10);
}

export function toBanglaDate(raw: string) {
  const text = toLatinDigits(raw.trim());
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) invalid('date', 'must be YYYY-MM-DD');
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const utc = Date.UTC(y, mo - 1, d);
  if (new Date(utc).toISOString().slice(0, 10) !== text)
    invalid('date', 'is not a real calendar date');
  if (text < MIN_DATE || text > MAX_DATE)
    invalid('date', `must be between ${MIN_DATE} and ${MAX_DATE}`);

  // The Bangla year starts on 14 April.
  const startYear = utc >= Date.UTC(y, 3, 14) ? y : y - 1;
  let offset = (utc - Date.UTC(startYear, 3, 14)) / DAY_MS;
  let monthIndex = 0;
  for (const length of monthLengths(startYear + 1)) {
    if (offset < length) break;
    offset -= length;
    monthIndex++;
  }
  const day = offset + 1;
  const year = startYear - 593;
  const month = MONTHS[monthIndex] as (typeof MONTHS)[number];
  return {
    gregorian: text,
    day,
    day_bn: toBanglaDigits(String(day)),
    month: { index: monthIndex + 1, ...month },
    year,
    year_bn: toBanglaDigits(String(year)),
    weekday: { ...(WEEKDAYS[new Date(utc).getUTCDay()] as (typeof WEEKDAYS)[number]) },
    season: { ...(SEASONS[Math.floor(monthIndex / 2)] as (typeof SEASONS)[number]) },
    formatted_bn: `${toBanglaDigits(String(day))} ${month.name_bn} ${toBanglaDigits(String(year))} বঙ্গাব্দ`,
  };
}

import type { Calendar, Holiday, HolidayYear } from './schemas';

type HolidayType = Holiday['type'];
type Community = NonNullable<Holiday['community']>;

export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export const DEFAULT_WEEKEND = new Set([5, 6]); // Friday, Saturday
export const MAX_RANGE_DAYS = 366;
const DAY_MS = 86_400_000;

export interface HolidayData {
  years: HolidayYear[];
  holidays: Holiday[];
}

export class UnavailableYearError extends Error {
  constructor(
    readonly year: number,
    readonly available: number[],
  ) {
    super(`No official holiday list for ${year}`);
  }
}

/** "fri,sat" → day numbers (0 = Sunday). Returns null for anything invalid. */
export function parseWeekend(text: string): Set<number> | null {
  const parts = text
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const days = new Set<number>();
  for (const p of parts) {
    const i = WEEKDAYS.indexOf(p as (typeof WEEKDAYS)[number]);
    if (i < 0) return null;
    days.add(i);
  }
  return days.size <= 6 ? days : null;
}

export function availableYears(data: HolidayData, calendar: Calendar): number[] {
  return data.years
    .filter((y) => y.calendar === calendar)
    .map((y) => y.year)
    .sort();
}

function requireYear(data: HolidayData, calendar: Calendar, year: number) {
  const years = availableYears(data, calendar);
  if (!years.includes(year)) throw new UnavailableYearError(year, years);
}

export function listHolidays(data: HolidayData, calendar: Calendar, year: number): Holiday[] {
  requireYear(data, calendar, year);
  return data.holidays
    .filter((h) => h.calendar === calendar && h.year === year)
    .sort((a, b) => ((a.dates[0] as string) < (b.dates[0] as string) ? -1 : 1));
}

export interface HolidayFilter {
  types?: HolidayType[];
  community?: Community;
  /** Only holidays that close offices: not optional, nationwide or for `district`. */
  closed?: boolean;
  district?: string;
}

export function filterHolidays(list: Holiday[], filter: HolidayFilter): Holiday[] {
  return list.filter(
    (h) =>
      (filter.types === undefined || filter.types.includes(h.type)) &&
      (filter.community === undefined || h.community === filter.community) &&
      (!filter.closed || closes(h, filter.district)),
  );
}

/** Every date of the given holidays, once each, in calendar order. */
export function holidayDates(list: Holiday[]): string[] {
  return [...new Set(list.flatMap((h) => h.dates))].sort();
}

/** Holidays that close everything: not optional, and either nationwide or for this district. */
const closes = (h: Holiday, district?: string) =>
  h.type !== 'optional' &&
  (h.districts === undefined || (district !== undefined && h.districts.includes(district)));

export interface DayOptions {
  weekend?: Set<number>;
  district?: string;
}

export function dayStatus(
  data: HolidayData,
  calendar: Calendar,
  date: string,
  options: DayOptions = {},
) {
  const weekend = options.weekend ?? DEFAULT_WEEKEND;
  requireYear(data, calendar, Number(date.slice(0, 4)));
  const onDay = data.holidays.filter((h) => h.calendar === calendar && h.dates.includes(date));
  const closing = onDay.filter((h) => closes(h, options.district));
  const isWeekend = weekend.has(new Date(`${date}T00:00:00Z`).getUTCDay());
  return {
    date,
    weekend: isWeekend,
    holiday: closing.length > 0,
    working_day: !isWeekend && closing.length === 0,
    tentative: closing.some((h) => h.tentative),
    holidays: closing,
    other_holidays: onDay.filter((h) => !closes(h, options.district)),
  };
}

export function workingDays(
  data: HolidayData,
  calendar: Calendar,
  from: string,
  to: string,
  options: DayOptions = {},
) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  const days = (end - start) / DAY_MS + 1;
  if (days < 1) throw new RangeError('from must be on or before to');
  if (days > MAX_RANGE_DAYS) throw new RangeError(`range must be at most ${MAX_RANGE_DAYS} days`);
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++)
    requireYear(data, calendar, y);

  let working = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let tentative = false;
  const seen = new Map<string, Holiday>();
  for (let t = start; t <= end; t += DAY_MS) {
    const status = dayStatus(data, calendar, new Date(t).toISOString().slice(0, 10), options);
    for (const h of status.holidays) seen.set(h.id, h);
    tentative ||= status.tentative;
    if (status.weekend) weekendDays++;
    else if (status.holiday) holidayDays++;
    else working++;
  }
  return {
    from,
    to,
    weekend: [...(options.weekend ?? DEFAULT_WEEKEND)].sort().map((d) => WEEKDAYS[d] as string),
    days,
    working_days: working,
    weekend_days: weekendDays,
    holidays: holidayDays,
    holiday_list: [...seen.values()],
    tentative,
  };
}

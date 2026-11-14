import { describe, expect, it } from 'vitest';
import type { Holiday } from '../../../src/modules/holidays/schemas';
import {
  dayStatus,
  filterHolidays,
  type HolidayData,
  holidayDates,
  listHolidays,
  parseWeekend,
  UnavailableYearError,
  workingDays,
} from '../../../src/modules/holidays/service';

const doc = { ref: 'Test notice', date: '2025-11-09', url: 'https://example.gov.bd/notice' };
const h = (id: string, dates: string[], extra: Partial<Holiday> = {}): Holiday => ({
  id: `2026-general-${id}`,
  year: 2026,
  calendar: 'general',
  name_en: id,
  name_bn: 'ছুটি',
  type: 'general',
  dates,
  tentative: false,
  source: 'Test notice',
  ...extra,
});

// December 2026: 1st is a Tuesday. Fridays: 4, 11, 18, 25. Saturdays: 5, 12, 19, 26.
const data: HolidayData = {
  years: [{ year: 2026, calendar: 'general', documents: [doc] }],
  holidays: [
    h('victory-day', ['2026-12-16']),
    h('christmas', ['2026-12-25']),
    h('optional-day', ['2026-12-24'], { type: 'optional', community: 'christian' }),
    h('hill-day', ['2026-12-22'], { districts: ['rangamati'] }),
    h('moon-day', ['2026-12-09'], { tentative: true }),
  ],
};

describe('parseWeekend', () => {
  it('parses day lists and rejects junk', () => {
    expect(parseWeekend('fri,sat')).toEqual(new Set([5, 6]));
    expect(parseWeekend('FRI')).toEqual(new Set([5]));
    expect(parseWeekend('')).toEqual(new Set());
    expect(parseWeekend('fri,funday')).toBeNull();
    expect(parseWeekend('sun,mon,tue,wed,thu,fri,sat')).toBeNull();
  });
});

describe('listHolidays', () => {
  it('sorts by first date and rejects unpublished years', () => {
    expect(
      listHolidays(data, 'general', 2026).map((x) => x.id.split('-').slice(2).join('-')),
    ).toEqual(['moon-day', 'victory-day', 'hill-day', 'optional-day', 'christmas']);
    expect(() => listHolidays(data, 'general', 2030)).toThrow(UnavailableYearError);
    expect(() => listHolidays(data, 'bank', 2026)).toThrow(UnavailableYearError);
  });
});

describe('dayStatus', () => {
  it('reports a holiday', () => {
    const s = dayStatus(data, 'general', '2026-12-16');
    expect(s).toMatchObject({
      holiday: true,
      weekend: false,
      working_day: false,
      tentative: false,
    });
    expect(s.holidays[0]?.name_en).toBe('victory-day');
  });

  it('reports a weekend', () => {
    expect(dayStatus(data, 'general', '2026-12-04')).toMatchObject({
      weekend: true,
      holiday: false,
      working_day: false,
    });
  });

  it('reports an ordinary working day', () => {
    expect(dayStatus(data, 'general', '2026-12-15')).toMatchObject({
      working_day: true,
      holiday: false,
    });
  });

  it('does not close the day for optional or district-only holidays', () => {
    const optional = dayStatus(data, 'general', '2026-12-24');
    expect(optional).toMatchObject({ working_day: true, holiday: false });
    expect(optional.other_holidays).toHaveLength(1);
    expect(dayStatus(data, 'general', '2026-12-22')).toMatchObject({ working_day: true });
    expect(dayStatus(data, 'general', '2026-12-22', { district: 'rangamati' })).toMatchObject({
      holiday: true,
    });
  });

  it('flags tentative holidays and honours a custom weekend', () => {
    expect(dayStatus(data, 'general', '2026-12-09')).toMatchObject({
      holiday: true,
      tentative: true,
    });
    expect(dayStatus(data, 'general', '2026-12-05', { weekend: new Set([5]) })).toMatchObject({
      working_day: true,
    });
  });

  it('refuses dates in unpublished years', () => {
    expect(() => dayStatus(data, 'general', '2027-01-05')).toThrow(UnavailableYearError);
  });
});

describe('workingDays', () => {
  it('counts December 2026 by hand: 31 days, 8 weekend, 2 weekday holidays, 21 working', () => {
    // Weekdays that are holidays: 9 (moon-day), 16; Christmas 25 is a Friday, so it counts as weekend.
    // Hill day (22) and optional (24) do not count.
    const r = workingDays(data, 'general', '2026-12-01', '2026-12-31');
    expect(r).toMatchObject({
      days: 31,
      weekend_days: 8,
      holidays: 2,
      working_days: 21,
      tentative: true,
    });
    expect(r.weekend).toEqual(['fri', 'sat']);
    expect(r.holiday_list.map((x) => x.name_en).sort()).toEqual([
      'christmas',
      'moon-day',
      'victory-day',
    ]);
  });

  it('uses a custom weekend', () => {
    const r = workingDays(data, 'general', '2026-12-01', '2026-12-31', { weekend: new Set([5]) });
    expect(r).toMatchObject({ weekend_days: 4, holidays: 2, working_days: 25 });
  });

  it('rejects bad ranges and unpublished years', () => {
    expect(() => workingDays(data, 'general', '2026-12-10', '2026-12-01')).toThrow(RangeError);
    expect(() => workingDays(data, 'general', '2026-01-01', '2027-01-02')).toThrow(RangeError);
    expect(() => workingDays(data, 'general', '2026-12-30', '2027-01-02')).toThrow(
      UnavailableYearError,
    );
  });
});

describe('filterHolidays', () => {
  const all = listHolidays(data, 'general', 2026);
  const ids = (list: Holiday[]) => list.map((x) => x.id.split('-').slice(2).join('-')).sort();

  it('filters by several types', () => {
    expect(ids(filterHolidays(all, { types: ['optional'] }))).toEqual(['optional-day']);
    expect(filterHolidays(all, { types: ['general', 'optional'] })).toHaveLength(5);
  });

  it('keeps only office-closing holidays with closed', () => {
    expect(ids(filterHolidays(all, { closed: true }))).toEqual([
      'christmas',
      'moon-day',
      'victory-day',
    ]);
    expect(ids(filterHolidays(all, { closed: true, district: 'rangamati' }))).toEqual([
      'christmas',
      'hill-day',
      'moon-day',
      'victory-day',
    ]);
  });

  it('filters by community', () => {
    expect(ids(filterHolidays(all, { community: 'christian' }))).toEqual(['optional-day']);
  });
});

describe('holidayDates', () => {
  it('returns unique dates in order', () => {
    const list: Holiday[] = [
      h('b', ['2026-12-16', '2026-12-17']),
      h('a', ['2026-12-09']),
      h('c', ['2026-12-16']),
    ];
    expect(holidayDates(list)).toEqual(['2026-12-09', '2026-12-16', '2026-12-17']);
  });
});

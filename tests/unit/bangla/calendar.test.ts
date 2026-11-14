import { describe, expect, it } from 'vitest';
import { toBanglaDate } from '../../../src/modules/bangla/calendar';
import golden from '../../golden/bangla/calendar.json';

describe('toBanglaDate (golden)', () => {
  it.each(golden.cases)('$date → $formatted_bn', ({ date, day, month, year, formatted_bn }) => {
    const result = toBanglaDate(date);
    expect(result.day).toBe(day);
    expect(result.month.index).toBe(month);
    expect(result.year).toBe(year);
    expect(result.formatted_bn).toBe(formatted_bn);
  });
});

describe('toBanglaDate details', () => {
  it('returns weekday, season and Bangla digits', () => {
    const d = toBanglaDate('2026-12-16');
    expect(d.gregorian).toBe('2026-12-16');
    expect(d.weekday).toEqual({ name_bn: 'বুধবার', name_en: 'Wednesday' });
    expect(d.season).toEqual({ name_bn: 'শীত', name_en: 'Sheet (winter)' });
    expect(d.month).toEqual({ index: 9, name_bn: 'পৌষ', name_en: 'Poush' });
    expect(d.day_bn).toBe('১');
    expect(d.year_bn).toBe('১৪৩৩');
  });

  it('maps every month to its season', () => {
    expect(toBanglaDate('2026-04-14').season.name_bn).toBe('গ্রীষ্ম');
    expect(toBanglaDate('2026-06-20').season.name_bn).toBe('বর্ষা');
    expect(toBanglaDate('2026-09-01').season.name_bn).toBe('শরৎ');
    expect(toBanglaDate('2026-11-14').season.name_bn).toBe('হেমন্ত');
    expect(toBanglaDate('2027-03-01').season.name_bn).toBe('বসন্ত');
  });

  it('accepts Bangla digits', () => {
    expect(toBanglaDate('২০২৬-১২-১৬').day).toBe(1);
  });

  it.each(['1970-12-31', '2101-01-01', '2026-02-30', '2026-13-01', '16/12/2026', 'today'])(
    'rejects %j',
    (input) => {
      expect(() => toBanglaDate(input)).toThrow();
    },
  );
});

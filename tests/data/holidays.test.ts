import { describe, expect, it } from 'vitest';
import holidays from '../../src/generated/holidays.holidays';
import years from '../../src/generated/holidays.years';
import { toBanglaDate } from '../../src/modules/bangla/calendar';
import golden from '../golden/holidays/2027-general.json';

const general2027 = holidays.filter((h) => h.year === 2027 && h.calendar === 'general');
const stripLeadingZero = (s: string) => s.replace(/^০(?=[১-৯])/, '');

describe('holiday data', () => {
  it('has a source document for every year and calendar it covers', () => {
    for (const h of holidays) {
      const year = years.find((y) => y.year === h.year && y.calendar === h.calendar);
      expect(year, h.id).toBeDefined();
      expect(year?.documents.map((d) => d.ref)).toContain(h.source);
    }
  });

  it('matches the official 2027 notification row by row', () => {
    const rows = golden.rows.map((r) => ({
      type: r.section,
      community: r.community ?? undefined,
      name_bn: r.name_bn,
      tentative: r.tentative,
      dates: r.dates.map((d) => d.date),
    }));
    const data = general2027.map((h) => ({
      type: h.type,
      community: h.community,
      name_bn: h.name_bn,
      tentative: h.tentative,
      dates: h.dates,
    }));
    const key = (x: { type: string; name_bn?: string; dates: string[] }) =>
      `${x.type}|${x.name_bn}|${x.dates[0]}`;
    expect([...data].sort((a, b) => key(a).localeCompare(key(b)))).toEqual(
      [...rows].sort((a, b) => key(a).localeCompare(key(b))),
    );
  });

  it('has the day totals printed on the notification', () => {
    const totals: Record<string, number> = {};
    for (const h of general2027) {
      const section = h.type === 'optional' ? `optional:${h.community}` : h.type;
      totals[section] = (totals[section] ?? 0) + h.dates.length;
    }
    expect(totals).toEqual(golden.section_totals);
  });

  it('prints weekdays and Bangla dates that agree with the calendar module', () => {
    const mismatches: string[] = [];
    for (const row of golden.rows) {
      for (const d of row.dates) {
        const bd = toBanglaDate(d.date);
        if (bd.weekday.name_bn !== d.weekday_bn)
          mismatches.push(`${d.date} weekday ${d.weekday_bn} vs ${bd.weekday.name_bn}`);
        const printed = `${stripLeadingZero(d.bangla_date)} বঙ্গাব্দ`;
        if (bd.formatted_bn !== printed)
          mismatches.push(`${d.date} ${d.bangla_date} vs ${bd.formatted_bn}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

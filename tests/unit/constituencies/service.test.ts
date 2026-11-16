import { describe, expect, it } from 'vitest';
import {
  getConstituency,
  listConstituencies,
  listDistrictBreakdowns,
} from '../../../src/modules/constituencies/service';

describe('Constituencies Service', () => {
  it('lists all 300 parliamentary constituencies', () => {
    const result = listConstituencies();
    expect(result.total).toBe(300);
    expect(result.items.length).toBe(300);

    const first = result.items[0]!;
    expect(first.number).toBe(1);
    expect(first.code).toBe('panchagarh-1');
    expect(first.name_en).toBe('Panchagarh-1');
    expect(first.name_bn).toBe('পঞ্চগড়-১');

    const last = result.items[299]!;
    expect(last.number).toBe(300);
    expect(last.code).toBe('bandarban');
  });

  it('filters constituencies by division', () => {
    const rangpur = listConstituencies({ division: 'rangpur' });
    expect(rangpur.total).toBe(33);
    for (const c of rangpur.items) {
      expect(c.division).toBe('rangpur');
    }

    const dhaka = listConstituencies({ division: 'dhaka' });
    expect(dhaka.total).toBe(70);
  });

  it('filters constituencies by district', () => {
    const dhakaDistrict = listConstituencies({ district: 'dhaka' });
    expect(dhakaDistrict.total).toBe(20);
    expect(dhakaDistrict.items.map((c) => c.code)).toContain('dhaka-1');
    expect(dhakaDistrict.items.map((c) => c.code)).toContain('dhaka-20');

    const panchagarh = listConstituencies({ district: 'panchagarh' });
    expect(panchagarh.total).toBe(2);

    const bandarban = listConstituencies({ district: 'bandarban' });
    expect(bandarban.total).toBe(1);
  });

  it('searches constituencies by name, seat number, and area keywords', () => {
    const byNumber = listConstituencies({ search: '174' });
    expect(byNumber.total).toBeGreaterThanOrEqual(1);
    expect(byNumber.items.some((c) => c.number === 174)).toBe(true);

    const byName = listConstituencies({ search: 'Dhaka-10' });
    expect(byName.items.some((c) => c.code === 'dhaka-10')).toBe(true);

    const byBn = listConstituencies({ search: 'নবাবগঞ্জ' });
    expect(byBn.total).toBeGreaterThan(0);
  });

  it('supports pagination with limit and offset', () => {
    const page = listConstituencies({ limit: 10, offset: 5 });
    expect(page.items.length).toBe(10);
    expect(page.items[0]!.number).toBe(6);
    expect(page.total).toBe(300);
  });

  it('gets a single constituency by number, Bangla numerals, or slug', () => {
    const byNum = getConstituency(174);
    expect(byNum).not.toBeNull();
    expect(byNum?.code).toBe('dhaka-1');
    expect(byNum?.name_en).toBe('Dhaka-1');

    const byBnNum = getConstituency('১৭৪');
    expect(byBnNum).not.toBeNull();
    expect(byBnNum?.number).toBe(174);

    const bySlug = getConstituency('dhaka-1');
    expect(bySlug).not.toBeNull();
    expect(bySlug?.number).toBe(174);

    const seat1 = getConstituency(1);
    expect(seat1?.name_en).toBe('Panchagarh-1');

    const seat300 = getConstituency(300);
    expect(seat300?.name_en).toBe('Bandarban');
  });

  it('returns null for nonexistent seat numbers or slugs', () => {
    expect(getConstituency(0)).toBeNull();
    expect(getConstituency(301)).toBeNull();
    expect(getConstituency('mars-1')).toBeNull();
  });

  it('provides district breakdown for all 64 districts totaling 300 seats', () => {
    const districts = listDistrictBreakdowns();
    expect(districts.length).toBe(64);

    const totalSeats = districts.reduce((acc, d) => acc + d.seat_count, 0);
    expect(totalSeats).toBe(300);

    const dhaka = districts.find((d) => d.district === 'dhaka');
    expect(dhaka).toBeDefined();
    expect(dhaka?.seat_count).toBe(20);
    expect(dhaka?.constituencies.length).toBe(20);

    const chattogram = districts.find((d) => d.district === 'chattogram');
    expect(chattogram).toBeDefined();
    expect(chattogram?.seat_count).toBe(16);
  });

  it('filters district breakdown by division or district', () => {
    const rangpurDistricts = listDistrictBreakdowns({ division: 'rangpur' });
    expect(rangpurDistricts.length).toBe(8);
    const rangpurSeats = rangpurDistricts.reduce((acc, d) => acc + d.seat_count, 0);
    expect(rangpurSeats).toBe(33);

    const singleDistrict = listDistrictBreakdowns({ district: 'panchagarh' });
    expect(singleDistrict.length).toBe(1);
    expect(singleDistrict[0]!.seat_count).toBe(2);
  });
});

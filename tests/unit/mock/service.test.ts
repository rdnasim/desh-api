import { describe, expect, it } from 'vitest';
import postcodes from '../../../src/generated/geo.postcodes';
import names from '../../../src/generated/mock.names';
import { getDistrict, getUpazila } from '../../../src/modules/geo/service';
import { mockAddresses, mockPeople } from '../../../src/modules/mock/service';
import { validatePhone } from '../../../src/modules/phone/service';
import { validateNid } from '../../../src/modules/validate/nid';

const femaleOnlyFamily = new Set(
  names.filter((n) => n.kind === 'family' && n.gender === 'female').map((n) => n.name_en),
);
const maleOnlyFamily = new Set(
  names.filter((n) => n.kind === 'family' && n.gender === 'male').map((n) => n.name_en),
);

describe('mockPeople', () => {
  const people = mockPeople({ count: 1000, seed: 'property' });

  it('is repeatable with a seed and varies without one', () => {
    expect(mockPeople({ count: 5, seed: 'a' })).toEqual(mockPeople({ count: 5, seed: 'a' }));
    expect(mockPeople({ count: 5, seed: 'a' })).not.toEqual(mockPeople({ count: 5, seed: 'b' }));
    expect(mockPeople({ count: 5 })).not.toEqual(mockPeople({ count: 5 }));
  });

  it('returns the requested count', () => {
    expect(mockPeople({ count: 1, seed: 'x' })).toHaveLength(1);
    expect(people).toHaveLength(1000);
  });

  it('generates phones and NIDs that pass the API validators', () => {
    for (const p of people) {
      expect(validatePhone(p.phone).valid, p.phone).toBe(true);
      expect(validateNid(p.nid).valid, p.nid).toBe(true);
    }
  });

  it('uses example.com emails, adult birth dates and bilingual names', () => {
    for (const p of people) {
      expect(p.email).toMatch(/^[a-z0-9.]+@example\.com$/);
      expect(p.date_of_birth >= '1956-01-01' && p.date_of_birth <= '2008-12-31').toBe(true);
      expect(Number.isNaN(Date.parse(p.date_of_birth))).toBe(false);
      expect(p.name_en).toMatch(/^[A-Za-z' ]+$/);
      expect(p.name_bn).toMatch(/[ঀ-৿]/);
    }
  });

  it('never returns religion or tradition', () => {
    for (const p of people) {
      expect(Object.keys(p).sort()).toEqual(
        [
          'address',
          'date_of_birth',
          'email',
          'gender',
          'name_bn',
          'name_en',
          'nid',
          'phone',
        ].sort(),
      );
    }
  });

  it('keeps gendered family names with the right gender', () => {
    for (const p of people) {
      const family = p.name_en.split(' ').at(-1) ?? '';
      if (femaleOnlyFamily.has(family)) expect(p.gender).toBe('female');
      if (maleOnlyFamily.has(family)) expect(p.gender).toBe('male');
    }
  });

  it('filters by gender and district', () => {
    const women = mockPeople({ count: 200, seed: 'w', gender: 'female' });
    expect(women.every((p) => p.gender === 'female')).toBe(true);
    const local = mockPeople({ count: 50, seed: 'c', district: 'cumilla' });
    expect(local.every((p) => p.address.district.slug === 'cumilla')).toBe(true);
  });

  it('mixes traditions roughly by census share', () => {
    const muslimGiven = new Set(
      names.filter((n) => n.kind === 'given' && n.tradition === 'muslim').map((n) => n.name_en),
    );
    const share =
      people.filter((p) => muslimGiven.has(p.name_en.split(' ')[0] ?? '')).length / people.length;
    expect(share).toBeGreaterThan(0.85);
    expect(share).toBeLessThan(0.97);
  });
});

describe('mockAddresses', () => {
  const addresses = mockAddresses({ count: 1000, seed: 'geo' });

  it('is consistent with the geo data', () => {
    for (const a of addresses) {
      const upazila = getUpazila(a.upazila.slug);
      const district = getDistrict(a.district.slug);
      expect(upazila?.district).toBe(a.district.slug);
      expect(district?.division).toBe(a.division.slug);
      expect(upazila?.name_bn).toBe(a.upazila.name_bn);
      expect(
        postcodes.some((p) => p.postcode === a.postcode && p.district === a.district.slug),
      ).toBe(true);
      expect(a.line_bn).toMatch(/^বাড়ি [০-৯]+, রোড [০-৯]+$/u);
      expect(a.line_en).toMatch(/^House \d+, Road \d+$/);
    }
  });

  it('filters by district and is repeatable', () => {
    const local = mockAddresses({ count: 30, seed: 's', district: 'sylhet' });
    expect(local.every((a) => a.district.slug === 'sylhet')).toBe(true);
    expect(mockAddresses({ count: 3, seed: 's' })).toEqual(mockAddresses({ count: 3, seed: 's' }));
  });

  it('covers many districts when unfiltered', () => {
    expect(new Set(addresses.map((a) => a.district.slug)).size).toBeGreaterThan(50);
  });
});

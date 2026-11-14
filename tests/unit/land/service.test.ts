import { describe, expect, it } from 'vitest';
import { convertLand, listUnits, resolveUnit } from '../../../src/modules/land/service';

describe('convertLand', () => {
  it('converts 5 katha (spec example)', () => {
    const r = convertLand(5, 'katha', 'sqft');
    expect(r.result).toEqual({ value: 3600, unit: 'sqft' });
    expect(r.all).toMatchObject({
      sqft: 3600,
      decimal: 8.26,
      sqm: 334.45,
      katha: 5,
      bigha: 0.25,
      chotak: 80,
    });
    expect(r.input).toEqual({ value: 5, unit: 'katha', name_bn: 'কাঠা' });
    expect(r.region).toBe('standard');
  });

  it.each([
    [1, 'bigha', 'katha', 20],
    [1, 'acre', 'decimal', 100],
    [1, 'katha', 'chotak', 16],
    [1, 'decimal', 'ojutangsho', 100],
    [1, 'hectare', 'acre', 2.47],
    [1, 'bigha', 'decimal', 33.06],
    [100, 'sqyd', 'sqft', 900],
  ] as const)('%d %s = %d %s', (value, from, to, expected) => {
    expect(convertLand(value, from, to).result?.value).toBe(expected);
  });

  it('omits result when no target unit is given', () => {
    expect(convertLand(1, 'katha').result).toBeUndefined();
  });

  it('rounds to 2 decimals', () => {
    expect(convertLand(1, 'sqft', 'decimal').result?.value).toBe(0);
    expect(convertLand(1000, 'sqft', 'decimal').result?.value).toBe(2.3);
  });
});

describe('resolveUnit', () => {
  it.each([
    ['shotangsho', 'decimal'],
    ['Shotok', 'decimal'],
    ['শতাংশ', 'decimal'],
    ['শতক', 'decimal'],
    ['কাঠা', 'katha'],
    ['gaj', 'sqyd'],
    ['Square Feet', 'sqft'],
    ['m2', 'sqm'],
  ])('%j → %s', (input, slug) => {
    expect(resolveUnit(input)?.slug).toBe(slug);
  });

  it('returns undefined for unknown units', () => {
    expect(resolveUnit('furlong')).toBeUndefined();
  });
});

describe('listUnits', () => {
  it('lists every unit with bilingual names and a square-foot value', () => {
    const units = listUnits();
    expect(units.length).toBeGreaterThanOrEqual(10);
    for (const u of units) {
      expect(u.name_bn).toMatch(/[ঀ-৿]/);
      expect(u.sqft).toBeGreaterThan(0);
    }
  });
});

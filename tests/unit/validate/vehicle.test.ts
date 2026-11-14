import { describe, expect, it } from 'vitest';
import { validateVehicle } from '../../../src/modules/validate/vehicle';

describe('validateVehicle', () => {
  it('parses a Dhaka Metro plate (spec example)', () => {
    expect(validateVehicle('ঢাকা মেট্রো-গ ১১-২২৩৩')).toEqual({
      type: 'vehicle',
      valid: true,
      normalized: 'ঢাকা মেট্রো-গ ১১-২২৩৩',
      details: {
        area: { slug: 'dhaka', name_en: 'Dhaka', name_bn: 'ঢাকা' },
        metro: true,
        class: 'গ',
        series: 11,
        number: 2233,
      },
    });
  });

  it.each([
    ['ঢাকা মেট্রো-গ 11-2233', 'dhaka', true],
    ['ঢাকা মেট্রো - গ ১১ - ২২৩৩', 'dhaka', true],
    ['চট্ট মেট্রো-হ ১২-৩৪৫৬', 'chattogram', true],
    ['কুমিল্লা-ক ১১-০০০১', 'cumilla', false],
    ['Dhaka Metro-Ga 11-2233', 'dhaka', true],
    ['Cumilla-Ka 11-0001', 'cumilla', false],
  ])('%j → %s (metro %s)', (plate, slug, metro) => {
    const r = validateVehicle(plate);
    expect(r.valid).toBe(true);
    expect(r.details).toMatchObject({ area: { slug }, metro });
  });

  it('normalises to Bangla digits and standard spacing', () => {
    expect(validateVehicle('Dhaka Metro-Ga 11-2233').normalized).toBe('ঢাকা মেট্রো-গ ১১-২২৩৩');
  });

  it.each([
    ['', 'invalid_format'],
    ['ঢাকা মেট্রো গ ১১ ২২৩৩', 'invalid_format'],
    ['ঢাকা মেট্রো-গ ১-২২৩৩', 'invalid_format'],
    ['ঢাকা মেট্রো-গ ১১-২২৩', 'invalid_format'],
    ['ঢাকা মেট্রো-গ ১১-০০০০', 'invalid_format'],
    ['আটলান্টিস-গ ১১-২২৩৩', 'unknown_area'],
    ['ঢাকা মেট্রো-া ১১-২২৩৩', 'invalid_format'],
    ['Dhaka Metro-Xa 11-2233', 'unknown_class'],
  ])('%j is invalid (%s)', (plate, reason) => {
    expect(validateVehicle(plate)).toEqual({ type: 'vehicle', valid: false, reason });
  });
});

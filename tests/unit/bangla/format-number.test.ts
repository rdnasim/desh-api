import { describe, expect, it } from 'vitest';
import { convertDigits, formatNumber } from '../../../src/modules/bangla/format-number';

describe('formatNumber', () => {
  it.each([
    ['1250000', 'bn', '১২,৫০,০০০'],
    ['1250000', 'en', '12,50,000'],
    ['999', 'bn', '৯৯৯'],
    ['1000', 'en', '1,000'],
    ['100000', 'en', '1,00,000'],
    ['10000000', 'en', '1,00,00,000'],
    ['1234567.89', 'bn', '১২,৩৪,৫৬৭.৮৯'],
    ['-1250000', 'en', '-12,50,000'],
    ['১২৫০০০০', 'en', '12,50,000'],
    ['0', 'bn', '০'],
  ] as const)('%s (%s) → %s', (input, digits, expected) => {
    expect(formatNumber(input, digits).formatted).toBe(expected);
  });

  it('rejects non-numbers', () => {
    expect(() => formatNumber('12x', 'bn')).toThrow();
  });
});

describe('convertDigits', () => {
  it('converts both directions and keeps other text', () => {
    expect(convertDigits('2026', 'bn')).toBe('২০২৬');
    expect(convertDigits('বাড়ি ১২, রোড ৫', 'en')).toBe('বাড়ি 12, রোড 5');
  });
});

import { describe, expect, it } from 'vitest';
import { parseNumber, toBanglaDigits, toLatinDigits } from '../../../src/lib/digits';

describe('digit conversion', () => {
  it('converts Latin digits to Bangla', () => {
    expect(toBanglaDigits('2026')).toBe('২০২৬');
    expect(toBanglaDigits('Road 5, House 12')).toBe('Road ৫, House ১২');
  });

  it('converts Bangla digits to Latin', () => {
    expect(toLatinDigits('২০২৬')).toBe('2026');
    expect(toLatinDigits('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
  });

  it('leaves other text unchanged', () => {
    expect(toLatinDigits('আমার সোনার বাংলা')).toBe('আমার সোনার বাংলা');
  });
});

describe('parseNumber', () => {
  it.each([
    ['1250', 1250],
    ['১২৫০', 1250],
    ['১2৫0', 1250],
    ['  42  ', 42],
    ['1,250,000', 1250000],
    ['১২,৫০,০০০', 1250000],
    ['1250.50', 1250.5],
    ['-3', -3],
    ['23.81', 23.81],
    ['0', 0],
  ])('parses %j as %d', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(['', '   ', 'abc', '12a', '1.2.3', '--1', '1e5', 'NaN', 'Infinity', ',', '.'])(
    'rejects %j',
    (input) => {
      expect(parseNumber(input)).toBeNull();
    },
  );
});

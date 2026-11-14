import { describe, expect, it } from 'vitest';
import { numberToWords } from '../../../src/modules/bangla/num-to-words';
import { takaInWords } from '../../../src/modules/bangla/taka';
import golden from '../../golden/bangla/num-to-words.json';

describe('numberToWords (golden)', () => {
  it.each(golden.cases as [string, string][])('%s → %s', (input, expected) => {
    expect(numberToWords(input).words).toBe(expected);
  });
});

describe('numberToWords validation', () => {
  it.each(['-1', '1000000000000000', '1.234', 'abc', '', '1e5'])('rejects %j', (input) => {
    expect(() => numberToWords(input)).toThrow();
  });

  it('returns the numeric input', () => {
    expect(numberToWords('১২৫০').input).toBe(1250);
  });
});

describe('takaInWords', () => {
  it.each([
    ['1250.50', 'এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা', 1250, 50],
    ['1250.5', 'এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা', 1250, 50],
    ['5.05', 'পাঁচ টাকা পাঁচ পয়সা', 5, 5],
    ['100', 'একশত টাকা', 100, 0],
    ['100.00', 'একশত টাকা', 100, 0],
    ['0', 'শূন্য টাকা', 0, 0],
    ['0.75', 'পঁচাত্তর পয়সা', 0, 75],
    ['১,২৫,০০০', 'এক লক্ষ পঁচিশ হাজার টাকা', 125000, 0],
  ])('%s → %s', (input, words, taka, paisa) => {
    expect(takaInWords(input)).toEqual({ input: taka + paisa / 100, words, taka, paisa });
  });

  it.each(['-5', '1.005', 'ten'])('rejects %j', (input) => {
    expect(() => takaInWords(input)).toThrow();
  });
});

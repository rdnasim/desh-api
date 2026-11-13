import { describe, expect, it } from 'vitest';
import { normalizeForSearch, slugifyLatin } from '../../../src/lib/normalize';

describe('normalizeForSearch', () => {
  it('lowercases and strips Latin diacritics and apostrophes', () => {
    expect(normalizeForSearch("  Cox's  Bazar ")).toBe('coxs bazar');
    expect(normalizeForSearch('Café')).toBe('cafe');
  });

  it('treats precomposed and decomposed Bangla nukta letters the same', () => {
    expect(normalizeForSearch('য়')).toBe(normalizeForSearch('য়'));
    expect(normalizeForSearch('ড়')).toBe(normalizeForSearch('ড়'));
  });

  it('drops zero-width joiners and converts Bangla digits', () => {
    expect(normalizeForSearch('র‍যাব')).toBe(normalizeForSearch('রযাব'));
    expect(normalizeForSearch('ঢাকা-১২০৫')).toBe('ঢাকা 1205');
  });
});

describe('slugifyLatin', () => {
  it.each([
    ["Cox's Bazar", 'coxs-bazar'],
    ['Purbadair (East)', 'purbadair-east'],
    ['  Dhaka  ', 'dhaka'],
    ['Chapainababganj', 'chapainababganj'],
  ])('%j → %j', (input, expected) => {
    expect(slugifyLatin(input)).toBe(expected);
  });
});

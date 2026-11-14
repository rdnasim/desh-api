import { describe, expect, it } from 'vitest';
import { toOrdinal } from '../../../src/modules/bangla/ordinal';
import { banglaSlug } from '../../../src/modules/bangla/slug';

describe('toOrdinal', () => {
  it.each([
    [1, 'প্রথম', '১ম'],
    [2, 'দ্বিতীয়', '২য়'],
    [3, 'তৃতীয়', '৩য়'],
    [4, 'চতুর্থ', '৪র্থ'],
    [5, 'পঞ্চম', '৫ম'],
    [6, 'ষষ্ঠ', '৬ষ্ঠ'],
    [10, 'দশম', '১০ম'],
    [11, 'একাদশ', '১১তম'],
    [16, 'ষোড়শ', '১৬তম'],
    [20, 'বিংশ', '২০তম'],
    [21, 'একুশতম', '২১তম'],
    [52, 'বায়ান্নতম', '৫২তম'],
    [100, 'শততম', '১০০তম'],
  ])('%d → %s / %s', (n, ordinal, short) => {
    expect(toOrdinal(n)).toEqual({ input: n, ordinal, short });
  });

  it('covers every value from 1 to 100', () => {
    for (let n = 1; n <= 100; n++) expect(toOrdinal(n).ordinal.length).toBeGreaterThan(0);
  });

  it.each([0, 101, 2.5, -1])('rejects %d', (n) => {
    expect(() => toOrdinal(n)).toThrow();
  });
});

describe('banglaSlug', () => {
  it.each([
    ['আমার সোনার বাংলা', 'amar-sonar-bangla'],
    ['ঢাকা', 'dhaka'],
    ['কলম', 'kolom'],
    ['চট্টগ্রাম', 'chottogram'],
    ['ময়মনসিংহ', 'moyomonosingh'],
    ['বাংলাদেশ ২০২৬', 'bangladesh-2026'],
    ['Hello বিশ্ব!', 'hello-bishb'],
    ['   ', ''],
  ])('%j → %j', (input, expected) => {
    expect(banglaSlug(input).slug).toBe(expected);
  });

  it('treats decomposed nukta letters like precomposed ones', () => {
    expect(banglaSlug('য়').slug).toBe(banglaSlug('য়').slug);
  });
});

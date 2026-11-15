import { describe, expect, it } from 'vitest';
import {
  getUniversity,
  listUniversities,
  listUniversityCategories,
} from '../../../src/modules/education/service';

describe('universities', () => {
  it('lists every UGC university, sorted by name', () => {
    const all = listUniversities();
    expect(all).toHaveLength(181);
    const names = all.map((u) => u.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('filters by category, district and name', () => {
    expect(listUniversities({ category: 'public' })).toHaveLength(61);
    expect(listUniversities({ category: 'private' })).toHaveLength(116);
    const dhaka = listUniversities({ district: 'dhaka' });
    expect(dhaka.length).toBeGreaterThan(10);
    expect(dhaka.every((u) => u.district === 'dhaka')).toBe(true);
    expect(
      listUniversities({ q: 'engineering' }).every((u) => /engineering/i.test(u.name_en)),
    ).toBe(true);
    expect(listUniversities({ q: 'BUET' })).toEqual([]);
  });

  it('returns one university by slug', () => {
    expect(getUniversity('university-of-dhaka')).toMatchObject({
      category: 'public',
      established: 1921,
      website: 'www.du.ac.bd',
      district: 'dhaka',
    });
    expect(getUniversity('nope')).toBeUndefined();
  });

  it('counts universities per category, with Bangla names', () => {
    const cats = listUniversityCategories();
    expect(cats.map((c) => [c.slug, c.count])).toEqual([
      ['cbhe', 1],
      ['international', 3],
      ['private', 116],
      ['public', 61],
    ]);
    expect(cats.find((c) => c.slug === 'public')?.name_bn).toBe('পাবলিক বিশ্ববিদ্যালয়');
  });
});

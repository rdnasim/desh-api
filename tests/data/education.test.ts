import { describe, expect, it } from 'vitest';
import universities from '../../src/generated/education.universities';
import districts from '../../src/generated/geo.districts';
import { normalizeForSearch } from '../../src/lib/normalize';

describe('university data', () => {
  it('keeps no names of people', () => {
    for (const u of universities) {
      for (const key of Object.keys(u)) {
        expect([
          'vice_chancellor',
          'registrar',
          'treasurer',
          'contact_person',
          'pro_vice_chancellor',
        ]).not.toContain(key);
      }
    }
  });

  it('only sets a district that the campus address names', () => {
    for (const u of universities.filter((x) => x.district)) {
      const d = districts.find((x) => x.slug === u.district);
      const names = [d?.name_en ?? '', ...(d?.aliases ?? [])].map((n) =>
        normalizeForSearch(n).replace(/gonj\b/g, 'ganj'),
      );
      const campus = ` ${normalizeForSearch(u.campus ?? '')} `.replace(/gonj\b/g, 'ganj');
      expect(
        names.some((n) => campus.includes(` ${n} `)),
        `${u.slug}: ${u.campus}`,
      ).toBe(true);
    }
  });

  it('has unique UGC IDs and plausible founding years', () => {
    expect(new Set(universities.map((u) => u.ugc_id)).size).toBe(universities.length);
    for (const u of universities)
      if (u.established) expect(u.established).toBeGreaterThanOrEqual(1857);
  });
});

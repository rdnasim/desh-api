import { describe, expect, it } from 'vitest';
import { search } from '../../../src/modules/geo/service';

describe('geo search', () => {
  it('finds a district by an alias (historical spelling)', () => {
    const [first] = search('comilla');
    expect(first).toMatchObject({ level: 'district', slug: 'cumilla' });
  });

  it('ranks exact matches above prefix and substring matches', () => {
    const hits = search('dhaka');
    expect(hits[0]).toMatchObject({ level: 'division', slug: 'dhaka' });
    expect(hits[1]).toMatchObject({ level: 'district', slug: 'dhaka' });
  });

  it('searches Bangla names', () => {
    const hits = search('মিরপুর');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.name_bn?.includes('মিরপুর'))).toBe(true);
  });

  it('finds post offices with their postcode', () => {
    const hits = search('mirpur', { level: 'post_office' });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.level === 'post_office' && /^\d{4}$/.test(h.postcode ?? ''))).toBe(
      true,
    );
  });

  it('includes the parent chain', () => {
    const hit = search('debidwar', { level: 'upazila' })[0];
    expect(hit?.parents.district?.slug).toBe('cumilla');
    expect(hit?.parents.division?.slug).toBe('chattogram');
  });

  it('caps results at the limit', () => {
    expect(search('pur', { limit: 20 })).toHaveLength(20);
    expect(search('pur')).toHaveLength(10);
  });

  it('returns nothing for unmatched text', () => {
    expect(search('zzzzqqq')).toEqual([]);
  });
});

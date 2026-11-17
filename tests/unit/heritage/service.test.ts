import { describe, expect, it } from 'vitest';
import { getHeritageSite, listHeritageSites } from '../../../src/modules/heritage/service';

describe('heritage service', () => {
  it('lists all heritage sites sorted by name', () => {
    const list = listHeritageSites();
    expect(list.length).toBeGreaterThanOrEqual(30);
    expect(list[0]?.name_en.localeCompare(list[1]?.name_en ?? '')).toBeLessThanOrEqual(0);
  });

  it('filters by category and type', () => {
    const unesco = listHeritageSites({ type: 'unesco_world_heritage' });
    expect(unesco.length).toBe(3);
    const unescoSlugs = unesco.map((s) => s.slug).sort();
    expect(unescoSlugs).toEqual(['shat-gombuj-mosque', 'somapura-mahavihara', 'sundarbans']);

    const eco = listHeritageSites({ type: 'eco_tourism' });
    expect(eco.length).toBeGreaterThanOrEqual(6);
    expect(eco.every((s) => s.type === 'eco_tourism')).toBe(true);
  });

  it('filters by division or district', () => {
    const rajshahi = listHeritageSites({ division: 'rajshahi' });
    expect(rajshahi.length).toBeGreaterThanOrEqual(5);
    expect(rajshahi.some((s) => s.slug === 'somapura-mahavihara')).toBe(true);

    const bagerhat = listHeritageSites({ district: 'bagerhat' });
    expect(bagerhat.length).toBeGreaterThanOrEqual(2);
    expect(bagerhat.some((s) => s.slug === 'shat-gombuj-mosque')).toBe(true);
  });

  it('searches by name, description, or historical period', () => {
    const paharpur = listHeritageSites({ q: 'Paharpur' });
    expect(paharpur.length).toBe(1);
    expect(paharpur[0]?.slug).toBe('somapura-mahavihara');

    const mughal = listHeritageSites({ q: 'Mughal' });
    expect(mughal.length).toBeGreaterThanOrEqual(1);
    expect(mughal.some((s) => s.slug === 'lalbagh-fort')).toBe(true);
  });

  it('looks up heritage site by slug or UNESCO ID', () => {
    expect(getHeritageSite('somapura-mahavihara')?.slug).toBe('somapura-mahavihara');
    expect(getHeritageSite('322')?.slug).toBe('somapura-mahavihara');
    expect(getHeritageSite('421')?.slug).toBe('shat-gombuj-mosque');
    expect(getHeritageSite('798')?.slug).toBe('sundarbans');
    expect(getHeritageSite('sundarbans')?.unesco_id).toBe(798);
    expect(getHeritageSite('unknown-site')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import cityCorporations from '../../src/generated/geo.city-corporations';
import districts from '../../src/generated/geo.districts';
import divisions from '../../src/generated/geo.divisions';
import postcodes from '../../src/generated/geo.postcodes';
import unions from '../../src/generated/geo.unions';
import upazilas from '../../src/generated/geo.upazilas';
import datasetMeta from '../../src/generated/meta';

// Official totals from BBS geocodes as compiled by nuhil/bangladesh-geocode (research R4).
const TOTALS = { divisions: 8, districts: 64, upazilas: 495, unions: 4540, postcodes: 1349 };

const inBangladesh = ({ lat, lon }: { lat?: number; lon?: number }) =>
  lat === undefined ||
  lon === undefined ||
  (lat >= 20.5 && lat <= 26.7 && lon >= 88 && lon <= 92.7);

describe('geo datasets', () => {
  it('match official totals', () => {
    expect(divisions).toHaveLength(TOTALS.divisions);
    expect(districts).toHaveLength(TOTALS.districts);
    expect(upazilas).toHaveLength(TOTALS.upazilas);
    expect(unions).toHaveLength(TOTALS.unions);
    expect(postcodes).toHaveLength(TOTALS.postcodes);
  });

  it('have unique slugs', () => {
    for (const rows of [divisions, districts, upazilas, cityCorporations]) {
      expect(new Set(rows.map((r) => r.slug)).size).toBe(rows.length);
    }
    expect(new Set(unions.map((u) => `${u.upazila}/${u.slug}`)).size).toBe(unions.length);
  });

  it('have no orphans', () => {
    const div = new Set(divisions.map((d) => d.slug));
    const dist = new Set(districts.map((d) => d.slug));
    const upa = new Set(upazilas.map((u) => u.slug));
    expect(districts.filter((d) => !div.has(d.division))).toEqual([]);
    expect(upazilas.filter((u) => !dist.has(u.district))).toEqual([]);
    expect(unions.filter((u) => !upa.has(u.upazila))).toEqual([]);
    expect(postcodes.filter((p) => !dist.has(p.district))).toEqual([]);
    // Every division has districts, every district has upazilas, every upazila has unions
    // except metropolitan ones that are fully urban.
    expect(divisions.filter((d) => !districts.some((x) => x.division === d.slug))).toEqual([]);
    expect(districts.filter((d) => !upazilas.some((x) => x.district === d.slug))).toEqual([]);
  });

  it('have bilingual NFC names', () => {
    for (const r of [...divisions, ...districts, ...upazilas, ...unions]) {
      expect(r.name_en.length).toBeGreaterThan(0);
      expect(r.name_bn).toMatch(/[ঀ-৿]/);
      expect(r.name_bn).toBe(r.name_bn.normalize('NFC'));
    }
  });

  it('have coordinates inside Bangladesh', () => {
    const all = [...divisions, ...districts, ...upazilas, ...unions, ...postcodes];
    expect(all.filter((r) => !inBangladesh(r))).toEqual([]);
    expect(districts.every((d) => d.lat !== undefined)).toBe(true);
  });

  it('have source metadata', () => {
    for (const key of [
      'geo.divisions',
      'geo.districts',
      'geo.upazilas',
      'geo.unions',
      'geo.postcodes',
    ]) {
      expect(datasetMeta[key]?.source).toBeTruthy();
    }
  });

  it('use current official spellings for slugs, with historical aliases', () => {
    const cumilla = districts.find((d) => d.slug === 'cumilla');
    expect(cumilla?.aliases).toContain('Comilla');
    expect(districts.find((d) => d.slug === 'chattogram')?.aliases).toContain('Chittagong');
  });
});

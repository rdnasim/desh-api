import { describe, expect, it } from 'vitest';
import { haversineKm, inBangladesh, nearest } from '../../../src/modules/geo/service';

describe('nearest', () => {
  it('computes great-circle distance', () => {
    // Dhaka → Chattogram is roughly 215 km as the crow flies.
    expect(haversineKm(23.8103, 90.4125, 22.3569, 91.7832)).toBeGreaterThan(200);
    expect(haversineKm(23.8103, 90.4125, 22.3569, 91.7832)).toBeLessThan(230);
    expect(haversineKm(23, 90, 23, 90)).toBe(0);
  });

  it('finds Dhaka district for central Dhaka coordinates', () => {
    const result = nearest(23.81, 90.41, 'district');
    expect(result.area).toMatchObject({ level: 'district', slug: 'dhaka' });
    expect(result.distance_km).toBeLessThan(20);
  });

  it('finds an upazila with its parent district', () => {
    const result = nearest(23.5797, 90.9981, 'upazila');
    expect(result.area).toMatchObject({ level: 'upazila', slug: 'debidwar' });
    expect(result.area.parents.district?.slug).toBe('cumilla');
  });

  it('knows the Bangladesh bounding box', () => {
    expect(inBangladesh(23.81, 90.41)).toBe(true);
    expect(inBangladesh(51.5, -0.12)).toBe(false);
    expect(inBangladesh(28.6, 77.2)).toBe(false);
  });
});

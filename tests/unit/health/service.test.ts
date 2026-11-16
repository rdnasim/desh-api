import { describe, expect, it } from 'vitest';
import {
  getEmergencyHealthSummary,
  getHospital,
  listHospitals,
} from '../../../src/modules/health/service';

describe('Health Service', () => {
  it('lists hospitals sorted alphabetically by English name', () => {
    const all = listHospitals();
    expect(all.length).toBeGreaterThanOrEqual(20);
    const names = all.map((h) => h.name_en);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('filters hospitals by division and district', () => {
    const dhakaHospitals = listHospitals({ division: 'dhaka' });
    expect(dhakaHospitals.length).toBeGreaterThan(5);
    expect(dhakaHospitals.every((h) => h.division === 'dhaka')).toBe(true);

    const ctgHospitals = listHospitals({ division: 'chattogram' });
    expect(ctgHospitals.length).toBeGreaterThanOrEqual(3);
    expect(ctgHospitals.every((h) => h.division === 'chattogram')).toBe(true);

    const coxsBazar = listHospitals({ district: 'coxs-bazar' });
    expect(coxsBazar).toHaveLength(1);
    expect(coxsBazar[0].slug).toBe('coxs-bazar-sadar-hospital');
  });

  it('filters hospitals by type', () => {
    const institutes = listHospitals({ type: 'specialized_institute' });
    expect(institutes.length).toBeGreaterThanOrEqual(7);
    expect(institutes.every((h) => h.type === 'specialized_institute')).toBe(true);

    const colleges = listHospitals({ type: 'medical_college' });
    expect(colleges.length).toBeGreaterThanOrEqual(10);
    expect(colleges.every((h) => h.type === 'medical_college')).toBe(true);
  });

  it('filters by search query matching name, address, or services', () => {
    const cardiac = listHospitals({ q: 'cardiac' });
    expect(cardiac.length).toBeGreaterThan(0);
    expect(
      cardiac.some((h) => h.slug === 'national-institute-of-cardiovascular-diseases'),
    ).toBe(true);

    const burn = listHospitals({ q: 'burn' });
    expect(burn.length).toBeGreaterThan(0);

    const neuro = listHospitals({ q: 'neuro' });
    expect(neuro.some((h) => h.slug === 'national-institute-of-neurosciences-and-hospital')).toBe(
      true,
    );
  });

  it('gets a hospital by slug', () => {
    const dmch = getHospital('dhaka-medical-college-hospital');
    expect(dmch).toBeDefined();
    expect(dmch?.bed_capacity).toBe(2600);
    expect(dmch?.established).toBe(1946);
    expect(dmch?.has_emergency_24h).toBe(true);
    expect(dmch?.coordinates.latitude).toBeCloseTo(23.7259, 2);

    const bsmmu = getHospital('bangabandhu-sheikh-mujib-medical-university');
    expect(bsmmu).toBeDefined();
    expect(bsmmu?.type).toBe('specialized_institute');

    expect(getHospital('non-existent-hospital')).toBeUndefined();
  });

  it('provides an emergency health directory with hotlines and trauma centers', () => {
    const emergency = getEmergencyHealthSummary();
    expect(emergency.national_hotlines.some((h) => h.number === '16263')).toBe(true);
    expect(emergency.national_hotlines.some((h) => h.number === '999')).toBe(true);
    expect(emergency.ambulance_services.length).toBeGreaterThanOrEqual(2);
    expect(emergency.trauma_and_burn_centers.length).toBeGreaterThanOrEqual(4);
  });
});

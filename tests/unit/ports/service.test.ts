import { describe, expect, it } from 'vitest';
import { getLandPort, listLandPorts } from '../../../src/modules/ports/service';

describe('ports service', () => {
  it('lists all land ports sorted by name', () => {
    const list = listLandPorts();
    expect(list.length).toBeGreaterThanOrEqual(24);
    expect(list[0]?.name_en.localeCompare(list[1]?.name_en ?? '')).toBeLessThanOrEqual(0);
  });

  it('filters by status', () => {
    const operational = listLandPorts({ status: 'operational' });
    expect(operational.length).toBeGreaterThanOrEqual(18);
    expect(operational.every((p) => p.status === 'operational')).toBe(true);

    const dev = listLandPorts({ status: 'under_development' });
    expect(dev.length).toBeGreaterThanOrEqual(3);
  });

  it('filters by rail link or passenger immigration', () => {
    const rail = listLandPorts({ has_rail_link: true });
    expect(rail.length).toBeGreaterThanOrEqual(4);
    expect(rail.some((p) => p.slug === 'benapole')).toBe(true);
    expect(rail.some((p) => p.slug === 'darshana')).toBe(true);

    const passenger = listLandPorts({ has_passenger_immigration: true });
    expect(passenger.length).toBeGreaterThanOrEqual(10);
    expect(passenger.some((p) => p.slug === 'tamabil')).toBe(true);
  });

  it('filters by division or district', () => {
    const khulna = listLandPorts({ division: 'khulna' });
    expect(khulna.length).toBeGreaterThanOrEqual(4);
    expect(khulna.some((p) => p.slug === 'benapole')).toBe(true);

    const lalmonirhat = listLandPorts({ district: 'lalmonirhat' });
    expect(lalmonirhat.length).toBeGreaterThanOrEqual(1);
    expect(lalmonirhat.some((p) => p.slug === 'burimari')).toBe(true);
  });

  it('searches by name, 3-letter code, Indian LCS, or commodity', () => {
    const ben = listLandPorts({ q: 'Benapole' });
    expect(ben.length).toBeGreaterThanOrEqual(1);
    expect(ben.some((p) => p.slug === 'benapole')).toBe(true);

    const petrapole = listLandPorts({ q: 'Petrapole' });
    expect(petrapole.length).toBe(1);
    expect(petrapole[0]?.slug).toBe('benapole');

    const stone = listLandPorts({ q: 'boulders' });
    expect(stone.length).toBeGreaterThanOrEqual(5);
  });

  it('looks up land port by code or slug', () => {
    expect(getLandPort('BEN')?.slug).toBe('benapole');
    expect(getLandPort('BUR')?.slug).toBe('burimari');
    expect(getLandPort('TAM')?.slug).toBe('tamabil');
    expect(getLandPort('benapole')?.code).toBe('BEN');
    expect(getLandPort('UNKNOWN')).toBeUndefined();
  });
});

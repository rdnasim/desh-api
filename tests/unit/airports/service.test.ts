import { describe, expect, it } from 'vitest';
import { getAirport, listAirports } from '../../../src/modules/airports/service';

describe('airports service', () => {
  it('lists all airports sorted by name', () => {
    const list = listAirports();
    expect(list.length).toBeGreaterThanOrEqual(12);
    expect(list[0]?.name_en.localeCompare(list[1]?.name_en ?? '')).toBeLessThanOrEqual(0);
  });

  it('filters by type and status', () => {
    const intl = listAirports({ type: 'international' });
    expect(intl.length).toBe(3);
    expect(intl.map((a) => a.iata_code).sort()).toEqual(['CGP', 'DAC', 'ZYL']);

    const operational = listAirports({ status: 'operational' });
    expect(operational.every((a) => a.status === 'operational')).toBe(true);
  });

  it('filters by division or district', () => {
    const dhaka = listAirports({ division: 'dhaka' });
    expect(dhaka.length).toBeGreaterThanOrEqual(2);
    expect(dhaka.some((a) => a.iata_code === 'DAC')).toBe(true);
  });

  it('searches by name, city, IATA or ICAO code', () => {
    const dac = listAirports({ q: 'DAC' });
    expect(dac).toHaveLength(1);
    expect(dac[0]?.slug).toBe('hazrat-shahjalal-international-airport');

    const ctg = listAirports({ q: 'Chattogram' });
    expect(ctg.length).toBeGreaterThanOrEqual(1);
  });

  it('looks up airport by IATA code, ICAO code, or slug', () => {
    expect(getAirport('DAC')?.iata_code).toBe('DAC');
    expect(getAirport('VGHS')?.icao_code).toBe('VGHS');
    expect(getAirport('hazrat-shahjalal-international-airport')?.iata_code).toBe('DAC');
    expect(getAirport('cgp')?.iata_code).toBe('CGP');
    expect(getAirport('UNKNOWN')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { getRiver, listRivers } from '../../../src/modules/rivers/service';

describe('rivers service', () => {
  it('lists all rivers sorted by name', () => {
    const list = listRivers();
    expect(list.length).toBeGreaterThanOrEqual(30);
    expect(list[0]?.name_en.localeCompare(list[1]?.name_en ?? '')).toBeLessThanOrEqual(0);
  });

  it('filters by transboundary status', () => {
    const trans = listRivers({ is_transboundary: true });
    expect(trans.length).toBeGreaterThanOrEqual(15);
    expect(trans.every((r) => r.is_transboundary === true)).toBe(true);
    expect(trans.some((r) => r.slug === 'padma')).toBe(true);

    const internal = listRivers({ is_transboundary: false });
    expect(internal.length).toBeGreaterThanOrEqual(8);
    expect(internal.every((r) => r.is_transboundary === false)).toBe(true);
    expect(internal.some((r) => r.slug === 'halda')).toBe(true);
  });

  it('filters by division or district', () => {
    const chattogram = listRivers({ division: 'chattogram' });
    expect(chattogram.length).toBeGreaterThanOrEqual(5);
    expect(chattogram.some((r) => r.slug === 'karnaphuli')).toBe(true);
    expect(chattogram.some((r) => r.slug === 'halda')).toBe(true);

    const kurigram = listRivers({ district: 'kurigram' });
    expect(kurigram.length).toBeGreaterThanOrEqual(3);
    expect(kurigram.some((r) => r.slug === 'jamuna')).toBe(true);
  });

  it('searches by name, origin, outflow, or description', () => {
    const padma = listRivers({ q: 'Padma' });
    expect(padma.length).toBeGreaterThanOrEqual(1);
    expect(padma.some((r) => r.slug === 'padma')).toBe(true);

    const carp = listRivers({ q: 'carp' });
    expect(carp.length).toBeGreaterThanOrEqual(1);
    expect(carp.some((r) => r.slug === 'halda')).toBe(true);
  });

  it('looks up river by slug', () => {
    expect(getRiver('padma')?.name_en).toBe('Padma');
    expect(getRiver('halda')?.name_bn).toBe('হালদা');
    expect(getRiver('karnaphuli')?.length_km).toBe(180);
    expect(getRiver('non-existent-river')).toBeUndefined();
  });
});

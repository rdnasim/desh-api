import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AirportSchema } from '../../src/modules/airports/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/airports', () => {
  it('lists airports citing CAAB, cacheable', async () => {
    const res = await call('/v1/airports');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(AirportSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(12);
    expect(body.meta.source).toContain('Civil Aviation Authority of Bangladesh');
  });

  it('filters by type and division', async () => {
    const res = await call('/v1/airports?type=international&division=dhaka');
    const body = await expectOk(res, z.array(AirportSchema));
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.iata_code).toBe('DAC');
  });

  it('rejects invalid type or status parameter with 400', async () => {
    await expectError(await call('/v1/airports?type=spaceport'), 400, 'invalid_parameter');
    await expectError(await call('/v1/airports?status=broken'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/airports/{identifier}', () => {
  it('gets an airport by IATA code, ICAO code, or slug', async () => {
    const res1 = await call('/v1/airports/DAC');
    const a1 = await expectOk(res1, AirportSchema);
    expect(a1.data.iata_code).toBe('DAC');
    expect(a1.data.name_en).toBe('Hazrat Shahjalal International Airport');

    const res2 = await call('/v1/airports/VGEG');
    const a2 = await expectOk(res2, AirportSchema);
    expect(a2.data.iata_code).toBe('CGP');

    const res3 = await call('/v1/airports/saidpur-airport');
    const a3 = await expectOk(res3, AirportSchema);
    expect(a3.data.iata_code).toBe('SPD');
  });

  it('returns 404 for unknown airport identifier', async () => {
    await expectError(await call('/v1/airports/NONEXISTENT'), 404, 'not_found');
  });
});

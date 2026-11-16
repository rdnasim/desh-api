import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  RailwayClassSchema,
  RailwayStationSchema,
  RailwayTrainSchema,
} from '../../src/modules/railway/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/railway/trains', () => {
  it('lists intercity trains citing Bangladesh Railway, cacheable', async () => {
    const res = await call('/v1/railway/trains');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(RailwayTrainSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(15);
    expect(body.meta.source).toContain('Bangladesh Railway');
  });

  it('filters by origin, destination, and class', async () => {
    const res = await call('/v1/railway/trains?origin=dhaka&destination=chattogram');
    const body = await expectOk(res, z.array(RailwayTrainSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data.every((t) => t.origin_station === 'dhaka')).toBe(true);
  });

  it('rejects invalid class parameter with 400', async () => {
    await expectError(await call('/v1/railway/trains?class=BUSINESS'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/railway/trains/{number}', () => {
  it('gets a train by number or slug', async () => {
    const res1 = await call('/v1/railway/trains/701');
    const t1 = await expectOk(res1, RailwayTrainSchema);
    expect(t1.data.number).toBe('701');
    expect(t1.data.name_en).toBe('Suborno Express');

    const res2 = await call('/v1/railway/trains/suborno-express-702');
    const t2 = await expectOk(res2, RailwayTrainSchema);
    expect(t2.data.number).toBe('702');
  });

  it('returns 404 for unknown train number', async () => {
    await expectError(await call('/v1/railway/trains/9999'), 404, 'not_found');
  });
});

describe('GET /v1/railway/classes', () => {
  it('lists all 7 BR coach classes', async () => {
    const res = await call('/v1/railway/classes');
    const body = await expectOk(res, z.array(RailwayClassSchema));
    expect(body.data).toHaveLength(7);
  });
});

describe('GET /v1/railway/stations and /v1/railway/stations/{code}', () => {
  it('lists major railway stations', async () => {
    const res = await call('/v1/railway/stations');
    const body = await expectOk(res, z.array(RailwayStationSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(10);
  });

  it('gets a single station by code or slug', async () => {
    const res1 = await call('/v1/railway/stations/DA');
    const s1 = await expectOk(res1, RailwayStationSchema);
    expect(s1.data.code).toBe('DA');

    const res2 = await call('/v1/railway/stations/chattogram');
    const s2 = await expectOk(res2, RailwayStationSchema);
    expect(s2.data.code).toBe('CG');
  });

  it('returns 404 for unknown station code', async () => {
    await expectError(await call('/v1/railway/stations/UNKNOWN'), 404, 'not_found');
  });
});

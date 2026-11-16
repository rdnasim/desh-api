import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  AqiCategorySchema,
  AqiLookupResponseSchema,
  BanglaSeasonSchema,
  MaritimeSignalSchema,
  RiverportSignalSchema,
} from '../../src/modules/weather/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/weather/signals/maritime', () => {
  it('lists all 11 maritime warning signals, cacheable', async () => {
    const res = await call('/v1/weather/signals/maritime');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(MaritimeSignalSchema));
    expect(body.data).toHaveLength(11);
    expect(body.meta.source).toContain('Bangladesh Meteorological Department');
  });

  it('gets a specific maritime signal', async () => {
    const res = await call('/v1/weather/signals/maritime/10');
    const body = await expectOk(res, MaritimeSignalSchema);
    expect(body.data.number).toBe(10);
    expect(body.data.severity).toBe('extreme');

    const res2 = await call('/v1/weather/signals/maritime/distant-cautionary-1');
    const b2 = await expectOk(res2, MaritimeSignalSchema);
    expect(b2.data.number).toBe(1);
  });

  it('returns 404 for unknown signal number', async () => {
    await expectError(await call('/v1/weather/signals/maritime/25'), 404, 'not_found');
  });
});

describe('GET /v1/weather/signals/riverport', () => {
  it('lists all 4 riverport warning signals', async () => {
    const res = await call('/v1/weather/signals/riverport');
    const body = await expectOk(res, z.array(RiverportSignalSchema));
    expect(body.data).toHaveLength(4);
  });

  it('gets a riverport signal by number or slug', async () => {
    const res = await call('/v1/weather/signals/riverport/2');
    const body = await expectOk(res, RiverportSignalSchema);
    expect(body.data.number).toBe(2);
    expect(body.data.vessel_guideline).toContain('65 feet');
  });

  it('returns 404 for invalid riverport signal', async () => {
    await expectError(await call('/v1/weather/signals/riverport/9'), 404, 'not_found');
  });
});

describe('GET /v1/weather/aqi/categories and /v1/weather/aqi/lookup', () => {
  it('lists all 6 DoE AQI tiers', async () => {
    const res = await call('/v1/weather/aqi/categories');
    const body = await expectOk(res, z.array(AqiCategorySchema));
    expect(body.data).toHaveLength(6);
    expect(body.data[0].slug).toBe('good');
    expect(body.data[5].slug).toBe('hazardous');
  });

  it('converts AQI score to category and advisory', async () => {
    const res = await call('/v1/weather/aqi/lookup?value=175');
    const body = await expectOk(res, AqiLookupResponseSchema);
    expect(body.data.aqi).toBe(175);
    expect(body.data.category.slug).toBe('unhealthy');
    expect(body.data.recommendation_en).toContain('mask');
  });

  it('rejects invalid AQI values with 400', async () => {
    await expectError(await call('/v1/weather/aqi/lookup?value=-10'), 400, 'invalid_parameter');
    await expectError(await call('/v1/weather/aqi/lookup?value=abc'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/weather/seasons', () => {
  it('lists the 6 Bangla seasons in order', async () => {
    const res = await call('/v1/weather/seasons');
    const body = await expectOk(res, z.array(BanglaSeasonSchema));
    expect(body.data).toHaveLength(6);
    expect(body.data[0].slug).toBe('grishma');
    expect(body.data[5].slug).toBe('basanta');
  });
});

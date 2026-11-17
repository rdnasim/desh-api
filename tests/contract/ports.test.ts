import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { LandPortSchema } from '../../src/modules/ports/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/ports/land', () => {
  it('lists land ports citing BLPA, cacheable', async () => {
    const res = await call('/v1/ports/land');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(LandPortSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(24);
    expect(body.meta.source).toContain('Bangladesh Land Port Authority');
  });

  it('filters by status and division', async () => {
    const res = await call('/v1/ports/land?status=operational&division=khulna');
    const body = await expectOk(res, z.array(LandPortSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(3);
    expect(body.data.some((p) => p.code === 'BEN')).toBe(true);
  });

  it('filters by district', async () => {
    const res = await call('/v1/ports/land?district=jashore');
    const body = await expectOk(res, z.array(LandPortSchema));
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('benapole');
  });

  it('rejects invalid status, boolean, division, or district with 400', async () => {
    await expectError(await call('/v1/ports/land?status=floating'), 400, 'invalid_parameter');
    await expectError(await call('/v1/ports/land?has_rail_link=maybe'), 400, 'invalid_parameter');
    await expectError(
      await call('/v1/ports/land?has_passenger_immigration=sure'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/ports/land?division=atlantis'), 400, 'invalid_parameter');
    await expectError(await call('/v1/ports/land?district=gotham'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/ports/land/{identifier}', () => {
  it('gets a land port by 3-letter code or slug', async () => {
    const res1 = await call('/v1/ports/land/BEN');
    const p1 = await expectOk(res1, LandPortSchema);
    expect(p1.data.slug).toBe('benapole');
    expect(p1.data.code).toBe('BEN');
    expect(p1.data.name_en).toBe('Benapole Land Port');
    expect(p1.data.has_rail_link).toBe(true);

    const res2 = await call('/v1/ports/land/BUR');
    const p2 = await expectOk(res2, LandPortSchema);
    expect(p2.data.slug).toBe('burimari');

    const res3 = await call('/v1/ports/land/tamabil');
    const p3 = await expectOk(res3, LandPortSchema);
    expect(p3.data.code).toBe('TAM');
  });

  it('returns 404 for unknown land port identifier', async () => {
    await expectError(await call('/v1/ports/land/NONEXISTENT'), 404, 'not_found');
  });
});

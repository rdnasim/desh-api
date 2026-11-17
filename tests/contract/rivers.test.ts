import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { RiverSchema } from '../../src/modules/rivers/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/rivers', () => {
  it('lists rivers citing BWDB and Banglapedia, cacheable', async () => {
    const res = await call('/v1/rivers');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(RiverSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(30);
    expect(body.meta.source).toContain('Bangladesh Water Development Board');
  });

  it('filters by transboundary status and division', async () => {
    const res = await call('/v1/rivers?is_transboundary=true&division=sylhet');
    const body = await expectOk(res, z.array(RiverSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data.some((r) => r.slug === 'surma')).toBe(true);
    expect(body.data.some((r) => r.slug === 'kushiyara')).toBe(true);
  });

  it('filters by district', async () => {
    const res = await call('/v1/rivers?district=dhaka');
    const body = await expectOk(res, z.array(RiverSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(3);
    expect(body.data.some((r) => r.slug === 'buriganga')).toBe(true);
    expect(body.data.some((r) => r.slug === 'turag')).toBe(true);
  });

  it('rejects invalid boolean, division, or district with 400', async () => {
    await expectError(await call('/v1/rivers?is_transboundary=maybe'), 400, 'invalid_parameter');
    await expectError(await call('/v1/rivers?division=atlantis'), 400, 'invalid_parameter');
    await expectError(await call('/v1/rivers?district=gotham'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/rivers/{slug}', () => {
  it('gets a river by slug', async () => {
    const res = await call('/v1/rivers/padma');
    const river = await expectOk(res, RiverSchema);
    expect(river.data.slug).toBe('padma');
    expect(river.data.name_en).toBe('Padma');
    expect(river.data.name_bn).toBe('পদ্মা');
    expect(river.data.is_transboundary).toBe(true);
  });

  it('returns 404 for unknown river slug', async () => {
    await expectError(await call('/v1/rivers/unknown-river-name'), 404, 'not_found');
  });
});

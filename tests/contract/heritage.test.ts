import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { HeritageSiteSchema } from '../../src/modules/heritage/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/heritage', () => {
  it('lists heritage sites citing Department of Archaeology and BPC, cacheable', async () => {
    const res = await call('/v1/heritage');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(HeritageSiteSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(30);
    expect(body.meta.source).toContain('Department of Archaeology');
  });

  it('filters by type and division', async () => {
    const res = await call('/v1/heritage?type=unesco_world_heritage&division=rajshahi');
    const body = await expectOk(res, z.array(HeritageSiteSchema));
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('somapura-mahavihara');
  });

  it('filters by category and district', async () => {
    const res = await call('/v1/heritage?category=historical&district=dhaka');
    const body = await expectOk(res, z.array(HeritageSiteSchema));
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data.some((s) => s.slug === 'lalbagh-fort')).toBe(true);
  });

  it('rejects invalid category, type, division, or district with 400', async () => {
    await expectError(await call('/v1/heritage?category=space'), 400, 'invalid_parameter');
    await expectError(await call('/v1/heritage?type=alien_structure'), 400, 'invalid_parameter');
    await expectError(await call('/v1/heritage?division=atlantis'), 400, 'invalid_parameter');
    await expectError(await call('/v1/heritage?district=gotham'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/heritage/{identifier}', () => {
  it('gets a heritage site by slug or UNESCO ID', async () => {
    const res1 = await call('/v1/heritage/somapura-mahavihara');
    const s1 = await expectOk(res1, HeritageSiteSchema);
    expect(s1.data.slug).toBe('somapura-mahavihara');
    expect(s1.data.unesco_id).toBe(322);

    const res2 = await call('/v1/heritage/421');
    const s2 = await expectOk(res2, HeritageSiteSchema);
    expect(s2.data.slug).toBe('shat-gombuj-mosque');

    const res3 = await call('/v1/heritage/798');
    const s3 = await expectOk(res3, HeritageSiteSchema);
    expect(s3.data.slug).toBe('sundarbans');
  });

  it('returns 404 for unknown heritage site identifier', async () => {
    await expectError(await call('/v1/heritage/non-existent-site'), 404, 'not_found');
  });
});

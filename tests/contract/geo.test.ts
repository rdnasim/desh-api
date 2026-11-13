import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  DistrictSchema,
  DivisionSchema,
  PostOfficeSchema,
  SearchHitSchema,
  UnionSchema,
  UpazilaSchema,
} from '../../src/modules/geo/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/divisions', () => {
  it('lists all 8 divisions with cache headers', async () => {
    const res = await call('/v1/divisions');
    expect(res.headers.get('cache-control')).toContain('public');
    expect(res.headers.get('etag')).toBeTruthy();
    const body = await expectOk(res, z.array(DivisionSchema));
    expect(body.data).toHaveLength(8);
    expect(body.meta.source).toContain('BBS');
  });

  it('honours If-None-Match with 304', async () => {
    const etag = (await call('/v1/divisions')).headers.get('etag') as string;
    const res = await call('/v1/divisions', { headers: { 'If-None-Match': etag } });
    expect(res.status).toBe(304);
  });

  it('gets one division', async () => {
    const body = await expectOk(await call('/v1/divisions/dhaka'), DivisionSchema);
    expect(body.data.name_bn).toBe('ঢাকা');
  });

  it('404s an unknown division', async () => {
    await expectError(await call('/v1/divisions/atlantis'), 404, 'not_found');
  });

  it('lists the districts of a division', async () => {
    const body = await expectOk(
      await call('/v1/divisions/chattogram/districts'),
      z.array(DistrictSchema),
    );
    expect(body.data.map((d) => d.slug)).toContain('cumilla');
    expect(body.data.every((d) => d.division === 'chattogram')).toBe(true);
  });
});

describe('GET /v1/districts', () => {
  it('lists all 64 districts', async () => {
    const body = await expectOk(await call('/v1/districts'), z.array(DistrictSchema));
    expect(body.data).toHaveLength(64);
  });

  it('filters by division', async () => {
    const body = await expectOk(
      await call('/v1/districts?division=sylhet'),
      z.array(DistrictSchema),
    );
    expect(body.data).toHaveLength(4);
  });

  it('404s an unknown division filter', async () => {
    await expectError(await call('/v1/districts?division=atlantis'), 404, 'not_found');
  });

  it('gets one district', async () => {
    const body = await expectOk(await call('/v1/districts/cumilla'), DistrictSchema);
    expect(body.data.aliases).toContain('Comilla');
  });
});

describe('GET /v1/upazilas and /v1/unions', () => {
  it('requires a district', async () => {
    await expectError(await call('/v1/upazilas'), 400, 'invalid_parameter');
  });

  it('lists upazilas of a district with pagination meta', async () => {
    const body = await expectOk(await call('/v1/upazilas?district=dhaka'), z.array(UpazilaSchema));
    expect(body.data.map((u) => u.slug)).toContain('savar');
    expect(body.meta.pagination).toMatchObject({ page: 1, per_page: 100 });
  });

  it('paginates', async () => {
    const body = await expectOk(
      await call('/v1/upazilas?district=cumilla&page=2&per_page=5'),
      z.array(UpazilaSchema),
    );
    expect(body.data).toHaveLength(5);
    expect(body.meta.pagination).toMatchObject({ page: 2, per_page: 5 });
  });

  it('rejects bad pagination', async () => {
    await expectError(
      await call('/v1/upazilas?district=dhaka&per_page=0'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/upazilas?district=dhaka&page=abc'), 400, 'invalid_parameter');
  });

  it('gets one upazila with its parents', async () => {
    const res = await call('/v1/upazilas/debidwar');
    const body = await expectOk(res, UpazilaSchema.extend({ parents: z.object({}).passthrough() }));
    expect(body.data.parents).toMatchObject({
      district: { slug: 'cumilla' },
      division: { slug: 'chattogram' },
    });
  });

  it('lists unions of an upazila', async () => {
    const body = await expectOk(await call('/v1/unions?upazila=debidwar'), z.array(UnionSchema));
    expect(body.data.length).toBeGreaterThan(5);
    expect(body.data.map((u) => u.slug)).toContain('subil');
  });

  it('404s an unknown upazila filter', async () => {
    await expectError(await call('/v1/unions?upazila=atlantis'), 404, 'not_found');
  });
});

describe('GET /v1/postcodes/{code}', () => {
  it('resolves a Dhaka postcode', async () => {
    const body = await expectOk(
      await call('/v1/postcodes/1205'),
      z.object({ postcode: z.string(), post_offices: z.array(PostOfficeSchema) }),
    );
    expect(body.data.post_offices[0]?.district).toBe('dhaka');
  });

  it('accepts Bangla digits', async () => {
    await expectOk(await call(`/v1/postcodes/${encodeURIComponent('১২০৫')}`));
  });

  it('400s a malformed postcode and 404s an unknown one', async () => {
    await expectError(await call('/v1/postcodes/12a'), 400, 'invalid_parameter');
    await expectError(await call('/v1/postcodes/0001'), 404, 'not_found');
  });
});

describe('GET /v1/search', () => {
  it('finds areas by alias', async () => {
    const body = await expectOk(await call('/v1/search?q=comilla'), z.array(SearchHitSchema));
    expect(body.data[0]).toMatchObject({ level: 'district', slug: 'cumilla' });
  });

  it('searches in Bangla', async () => {
    const body = await expectOk(
      await call(`/v1/search?q=${encodeURIComponent('কুমিল্লা')}`),
      z.array(SearchHitSchema),
    );
    expect(body.data[0]?.slug).toBe('cumilla');
  });

  it('validates q and limit', async () => {
    await expectError(await call('/v1/search?q=a'), 400, 'invalid_parameter');
    await expectError(await call('/v1/search?q=dhaka&limit=50'), 400, 'invalid_parameter');
    await expectError(await call('/v1/search?q=dhaka&level=planet'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/nearest', () => {
  it('finds the nearest district', async () => {
    const body = await expectOk(await call('/v1/nearest?lat=23.81&lon=90.41'));
    expect(body.data).toMatchObject({ area: { level: 'district', slug: 'dhaka' } });
  });

  it('accepts Bangla digits and the upazila level', async () => {
    const q = `lat=${encodeURIComponent('২৩.৫৭৯৭')}&lon=${encodeURIComponent('৯০.৯৯৮১')}&level=upazila`;
    const body = await expectOk(await call(`/v1/nearest?${q}`));
    expect(body.data).toMatchObject({ area: { level: 'upazila', slug: 'debidwar' } });
  });

  it('rejects coordinates outside Bangladesh and missing params', async () => {
    await expectError(await call('/v1/nearest?lat=51.5&lon=-0.12'), 400, 'invalid_parameter');
    await expectError(await call('/v1/nearest?lat=23.8'), 400, 'invalid_parameter');
    await expectError(await call('/v1/nearest?lat=abc&lon=90'), 400, 'invalid_parameter');
  });
});

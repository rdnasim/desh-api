import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { UniversitySchema } from '../../src/modules/education/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/universities', () => {
  it('lists universities citing UGC, cacheable', async () => {
    const res = await call('/v1/universities?category=public');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, z.array(UniversitySchema));
    expect(body.data).toHaveLength(61);
    expect(body.meta.source).toContain('University Grants Commission');
  });

  it('400s an unknown category or district', async () => {
    await expectError(await call('/v1/universities?category=college'), 400, 'invalid_parameter');
    await expectError(await call('/v1/universities?district=atlantis'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/universities/{slug}', () => {
  it('returns one university or 404', async () => {
    const body = await expectOk(
      await call('/v1/universities/university-of-dhaka'),
      UniversitySchema,
    );
    expect(body.data.established).toBe(1921);
    await expectError(await call('/v1/universities/hogwarts'), 404, 'not_found');
  });
});

describe('GET /v1/universities/categories', () => {
  it('lists the four categories with counts', async () => {
    const body = await expectOk(await call('/v1/universities/categories'));
    expect((body.data as { slug: string }[]).map((c) => c.slug)).toEqual([
      'cbhe',
      'international',
      'private',
      'public',
    ]);
  });
});

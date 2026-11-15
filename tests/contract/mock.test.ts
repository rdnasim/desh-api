import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MockAddressSchema, MockPersonSchema } from '../../src/modules/mock/schemas';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/mock/people', () => {
  it('returns 10 synthetic people by default, uncached, with a disclaimer', async () => {
    const res = await call('/v1/mock/people');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await expectOk(res, z.array(MockPersonSchema));
    expect(body.data).toHaveLength(10);
    expect(body.meta.disclaimer).toMatch(/synthetic/i);
  });

  it('is cacheable and repeatable with a seed', async () => {
    const a = await call('/v1/mock/people?count=3&seed=demo&gender=female&district=cumilla');
    expect(a.headers.get('cache-control')).toContain('public');
    const b = await call('/v1/mock/people?count=3&seed=demo&gender=female&district=cumilla');
    const [ja, jb] = [(await a.json()) as { data: unknown }, (await b.json()) as { data: unknown }];
    expect(ja.data).toEqual(jb.data);
    expect(ja.data).toHaveLength(3);
  });

  it('accepts a Bangla count', async () => {
    const body = await expectOk(
      await call(`/v1/mock/people?count=${encodeURIComponent('৫')}&seed=x`),
    );
    expect(body.data).toHaveLength(5);
  });

  it('400s bad input', async () => {
    for (const q of ['count=0', 'count=101', 'count=1.5', 'gender=other', 'district=atlantis']) {
      await expectError(await call(`/v1/mock/people?${q}`), 400, 'invalid_parameter');
    }
  });
});

describe('GET /v1/mock/addresses', () => {
  it('returns consistent addresses', async () => {
    const body = await expectOk(
      await call('/v1/mock/addresses?count=5&seed=a&district=sylhet'),
      z.array(MockAddressSchema),
    );
    expect(body.data).toHaveLength(5);
    expect(body.data.every((a) => a.district.slug === 'sylhet')).toBe(true);
  });

  it('400s an unknown district', async () => {
    await expectError(await call('/v1/mock/addresses?district=nowhere'), 400, 'invalid_parameter');
  });
});

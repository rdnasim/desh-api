import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/land/convert', () => {
  it('converts with region and disclaimer', async () => {
    const res = await call('/v1/land/convert?value=5&from=katha&to=sqft');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res);
    expect(body.data).toMatchObject({ region: 'standard', result: { value: 3600, unit: 'sqft' } });
    expect(body.meta.disclaimer).toContain('vary by region');
  });

  it('accepts Bangla digits and Bangla unit names', async () => {
    const q = `value=${encodeURIComponent('৫')}&from=${encodeURIComponent('কাঠা')}&to=${encodeURIComponent('শতাংশ')}`;
    const body = await expectOk(await call(`/v1/land/convert?${q}`));
    expect(body.data).toMatchObject({ result: { value: 8.26, unit: 'decimal' } });
  });

  it('400s unknown units, regions and bad values, listing valid options', async () => {
    const unit = await expectError(
      await call('/v1/land/convert?value=1&from=furlong'),
      400,
      'invalid_parameter',
    );
    expect(unit.error.message).toContain('katha');
    await expectError(
      await call('/v1/land/convert?value=1&from=katha&region=mars'),
      400,
      'invalid_parameter',
    );
    await expectError(await call('/v1/land/convert?value=0&from=katha'), 400, 'invalid_parameter');
    await expectError(await call('/v1/land/convert?value=-2&from=katha'), 400, 'invalid_parameter');
    await expectError(await call('/v1/land/convert?from=katha'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/land/units', () => {
  it('lists units', async () => {
    const body = await expectOk(await call('/v1/land/units'));
    const slugs = (body.data as { slug: string }[]).map((u) => u.slug);
    expect(slugs).toEqual(expect.arrayContaining(['katha', 'bigha', 'decimal', 'acre', 'sqft']));
  });
});

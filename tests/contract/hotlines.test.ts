import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

describe('GET /v1/hotlines', () => {
  it('lists hotlines sorted by number with source metadata', async () => {
    const res = await call('/v1/hotlines');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res);
    const numbers = (body.data as { number: string }[]).map((h) => h.number);
    expect(numbers).toContain('999');
    expect(numbers).toEqual([...numbers].sort());
    expect(body.meta.source).toContain('National Portal');
  });

  it('filters by category', async () => {
    const body = await expectOk(await call('/v1/hotlines?category=emergency'));
    const data = body.data as { number: string; category: string }[];
    expect(data.every((h) => h.category === 'emergency')).toBe(true);
    expect(data.map((h) => h.number)).toContain('999');
  });

  it('400s an unknown category and lists valid ones', async () => {
    const body = await expectError(
      await call('/v1/hotlines?category=pizza'),
      400,
      'invalid_parameter',
    );
    expect(JSON.stringify(body.error)).toContain('emergency');
  });
});

describe('GET /v1/hotlines/categories and /v1/hotlines/{number}', () => {
  it('lists categories with counts', async () => {
    const body = await expectOk(await call('/v1/hotlines/categories'));
    const emergency = (body.data as { slug: string; count: number; name_bn: string }[]).find(
      (c) => c.slug === 'emergency',
    );
    expect(emergency?.count).toBeGreaterThan(0);
    expect(emergency?.name_bn).toBe('জরুরি');
  });

  it('gets one hotline, accepting Bangla digits', async () => {
    const body = await expectOk(await call(`/v1/hotlines/${encodeURIComponent('৯৯৯')}`));
    expect(body.data).toMatchObject({ number: '999', name_bn: 'জাতীয় জরুরি সেবা' });
  });

  it('404s an unknown number', async () => {
    await expectError(await call('/v1/hotlines/12345'), 404, 'not_found');
  });
});

import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

const post = (path: string, body: unknown) =>
  call(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('GET /v1/phone/{number}', () => {
  it('validates an international number and is never cached', async () => {
    const res = await call(`/v1/phone/${encodeURIComponent('+8801712345678')}`);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await expectOk(res);
    expect(body.data).toMatchObject({
      valid: true,
      normalized: '01712345678',
      international: '+8801712345678',
      operator: { slug: 'grameenphone', name_en: 'Grameenphone' },
    });
    expect(body.data).toHaveProperty('portability_notice');
    expect(body.meta.source).toContain('BTRC');
  });

  it('returns 200 with valid:false for a bad number', async () => {
    const body = await expectOk(await call('/v1/phone/01212345678'));
    expect(body.data).toMatchObject({ valid: false, reason: 'invalid_prefix' });
  });
});

describe('POST /v1/phone/validate', () => {
  it('validates a number in the body', async () => {
    const body = await expectOk(await post('/v1/phone/validate', { number: '০১৮১২৩৪৫৬৭৮' }));
    expect(body.data).toMatchObject({ valid: true, operator: { slug: 'robi' } });
  });

  it('400s a missing number', async () => {
    await expectError(await post('/v1/phone/validate', {}), 400, 'invalid_parameter');
  });
});

describe('POST /v1/phone/bulk', () => {
  it('returns one result per number in order', async () => {
    const numbers = ['01712345678', 'bad', '+8801912345678'];
    const body = await expectOk(await post('/v1/phone/bulk', { numbers }));
    const data = body.data as { input: string; valid: boolean }[];
    expect(data.map((r) => r.input)).toEqual(numbers);
    expect(data.map((r) => r.valid)).toEqual([true, false, true]);
  });

  it('rejects more than 100 numbers with 413', async () => {
    const numbers = Array.from({ length: 101 }, () => '01712345678');
    await expectError(await post('/v1/phone/bulk', { numbers }), 413, 'payload_too_large');
  });

  it('rejects an empty list', async () => {
    await expectError(await post('/v1/phone/bulk', { numbers: [] }), 400, 'invalid_parameter');
  });
});

import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

const q = (s: string) => encodeURIComponent(s);

describe('GET /v1/bangla/num-to-words', () => {
  it('converts Latin and Bangla digits', async () => {
    const body = await expectOk(await call('/v1/bangla/num-to-words?n=1250'));
    expect(body.data).toEqual({ input: 1250, words: 'এক হাজার দুইশত পঞ্চাশ' });
    const bn = await expectOk(await call(`/v1/bangla/num-to-words?n=${q('১২৫০')}`));
    expect(bn.data).toEqual(body.data);
  });

  it('is cacheable', async () => {
    const res = await call('/v1/bangla/num-to-words?n=5');
    expect(res.headers.get('cache-control')).toContain('public');
  });

  it.each(['n=-1', 'n=abc', 'n=1000000000000000', 'n=1.234', ''])('400s %j', async (qs) => {
    await expectError(await call(`/v1/bangla/num-to-words?${qs}`), 400, 'invalid_parameter');
  });
});

describe('GET /v1/bangla/taka-in-words', () => {
  it('names taka and paisa', async () => {
    const body = await expectOk(await call('/v1/bangla/taka-in-words?amount=1250.50'));
    expect(body.data).toEqual({
      input: 1250.5,
      words: 'এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা',
      taka: 1250,
      paisa: 50,
    });
  });

  it('400s a negative amount', async () => {
    await expectError(await call('/v1/bangla/taka-in-words?amount=-5'), 400, 'invalid_parameter');
  });
});

describe('GET /v1/bangla/digits and format-number', () => {
  it('converts digits', async () => {
    const body = await expectOk(await call('/v1/bangla/digits?text=2026&to=bn'));
    expect(body.data).toEqual({ input: '2026', output: '২০২৬' });
  });

  it('validates the target', async () => {
    await expectError(await call('/v1/bangla/digits?text=2026&to=hi'), 400, 'invalid_parameter');
  });

  it('formats with lakh/crore grouping', async () => {
    const body = await expectOk(await call('/v1/bangla/format-number?n=1250000'));
    expect(body.data).toEqual({ input: 1250000, formatted: '১২,৫০,০০০' });
    const en = await expectOk(await call('/v1/bangla/format-number?n=1250000&digits=en'));
    expect(en.data).toMatchObject({ formatted: '12,50,000' });
  });
});

describe('GET /v1/bangla/date', () => {
  it('converts a Gregorian date', async () => {
    const body = await expectOk(await call('/v1/bangla/date?date=2026-12-16'));
    expect(body.data).toMatchObject({
      gregorian: '2026-12-16',
      day: 1,
      month: { index: 9, name_bn: 'পৌষ' },
      year: 1433,
      formatted_bn: '১ পৌষ ১৪৩৩ বঙ্গাব্দ',
    });
    expect(body.meta.source).toContain('Bangla Academy');
  });

  it('defaults to today in Dhaka and is not cached', async () => {
    const res = await call('/v1/bangla/date');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await expectOk(res);
    expect(body.data).toHaveProperty('formatted_bn');
  });

  it.each(['date=1960-01-01', 'date=2026-02-30', 'date=tomorrow'])('400s %j', async (qs) => {
    await expectError(await call(`/v1/bangla/date?${qs}`), 400, 'invalid_parameter');
  });
});

describe('GET /v1/bangla/ordinal and slug', () => {
  it('returns ordinals', async () => {
    const body = await expectOk(await call('/v1/bangla/ordinal?n=3'));
    expect(body.data).toEqual({ input: 3, ordinal: 'তৃতীয়', short: '৩য়' });
    await expectError(await call('/v1/bangla/ordinal?n=101'), 400, 'invalid_parameter');
  });

  it('slugifies Bangla text', async () => {
    const body = await expectOk(await call(`/v1/bangla/slug?text=${q('আমার সোনার বাংলা')}`));
    expect(body.data).toEqual({ input: 'আমার সোনার বাংলা', slug: 'amar-sonar-bangla' });
  });
});

describe('/v1/bangla/transliterate', () => {
  it('works via GET', async () => {
    const body = await expectOk(await call(`/v1/bangla/transliterate?text=${q('ami bhalo achi')}`));
    expect(body.data).toEqual({
      input: 'ami bhalo achi',
      output: 'আমি ভালো আছি',
      scheme: 'avro-phonetic',
    });
  });

  it('works via POST', async () => {
    const res = await call('/v1/bangla/transliterate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'amar sonar bangla' }),
    });
    const body = await expectOk(res);
    expect(body.data).toMatchObject({ output: 'আমার সোনার বাংলা' });
  });

  it('enforces length limits', async () => {
    await expectError(
      await call(`/v1/bangla/transliterate?text=${'a'.repeat(1001)}`),
      400,
      'invalid_parameter',
    );
    const res = await call('/v1/bangla/transliterate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'a'.repeat(10_241) }),
    });
    await expectError(res, 400, 'invalid_parameter');
  });
});

import { describe, expect, it } from 'vitest';
import { call, expectError, expectOk } from './helpers';

describe('/v1/fun', () => {
  it('serves a random proverb, not cached without a seed', async () => {
    const res = await call('/v1/fun/proverb/random');
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await expectOk(res);
    expect(body.data).toHaveProperty('text_bn');
    expect(body.data).toHaveProperty('meaning_en');
  });

  it('is repeatable and cacheable with a seed', async () => {
    const a = await call('/v1/fun/riddle/random?seed=abc');
    expect(a.headers.get('cache-control')).toContain('public');
    const b = await call('/v1/fun/riddle/random?seed=abc');
    expect((await expectOk(a)).data).toEqual((await expectOk(b)).data);
  });

  it('serves quiz questions by topic', async () => {
    const body = await expectOk(await call('/v1/fun/quiz?topic=liberation-war&count=3'));
    const qs = body.data as { topic: string }[];
    expect(qs).toHaveLength(3);
    expect(qs.every((q) => q.topic === 'liberation-war')).toBe(true);
  });

  it('400s an unknown topic or bad count', async () => {
    await expectError(await call('/v1/fun/quiz?topic=football'), 400, 'invalid_parameter');
    await expectError(await call('/v1/fun/quiz?count=11'), 400, 'invalid_parameter');
  });

  it('lists quiz topics with counts', async () => {
    const body = await expectOk(await call('/v1/fun/quiz/topics'));
    expect(
      (body.data as { slug: string; count: number }[]).find((t) => t.slug === 'culture')?.count,
    ).toBeGreaterThan(0);
  });

  it('serves GI foods by region', async () => {
    const body = await expectOk(await call('/v1/fun/food/random?region=tangail&seed=1'));
    expect(body.data).toMatchObject({ district: 'tangail' });
    await expectError(await call('/v1/fun/food/random?region=atlantis'), 400, 'invalid_parameter');
  });

  it('returns history for a day, empty for a quiet day, 400 for a bad date', async () => {
    const body = await expectOk(await call('/v1/fun/today-in-history?date=12-16'));
    expect(body.data).toMatchObject([{ year: 1971 }]);
    const quiet = await expectOk(await call('/v1/fun/today-in-history?date=07-03'));
    expect(quiet.data).toEqual([]);
    await expectError(await call('/v1/fun/today-in-history?date=02-30'), 400, 'invalid_parameter');
    await expectError(
      await call('/v1/fun/today-in-history?date=2026-12-16'),
      400,
      'invalid_parameter',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { call, expectError, expectMeta } from './helpers';

describe('GET /v1/prayer/times', () => {
  it('returns daily prayer times for Dhaka by default with IFB source', async () => {
    const res = await call('/v1/prayer/times');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.district.slug).toBe('dhaka');
    expect(body.data.school).toBe('hanafi');
    expect(body.data.times.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(body.data.times.maghrib).toMatch(/^\d{2}:\d{2}$/);
    expect(body.data.times_12h.fajr).toMatch(/\d{2}:\d{2} AM/);
    expect(body.data.times_bn.fajr).toContain('ভোর');
    expect(body.data.times_bn.maghrib).toContain('সন্ধ্যা');

    expect(body.meta.source).toContain('Islamic Foundation Bangladesh');
  });

  it('adjusts times for specific districts and accepts query dates', async () => {
    const res = await call('/v1/prayer/times?district=sylhet&date=2026-03-20');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.district.slug).toBe('sylhet');
    expect(body.data.date).toBe('2026-03-20');
  });

  it('accepts Bangla digits in date parameter', async () => {
    const res = await call('/v1/prayer/times?date=২০২৬-০৩-২০');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.date).toBe('2026-03-20');
  });

  it('404s unknown district', async () => {
    const res = await call('/v1/prayer/times?district=atlantis');
    await expectError(res, 404, 'not_found');
  });

  it('supports school=shafi for Asr calculation', async () => {
    const hanafi = (await (await call('/v1/prayer/times?school=hanafi')).json()) as any;
    const shafi = (await (await call('/v1/prayer/times?school=shafi')).json()) as any;

    expect(hanafi.data.school).toBe('hanafi');
    expect(shafi.data.school).toBe('shafi');
    // Shafi Asr (shadow factor 1) is earlier than Hanafi Asr (shadow factor 2)
    expect(shafi.data.times.asr < hanafi.data.times.asr).toBe(true);
  });
});

describe('GET /v1/prayer/ramadan', () => {
  it('returns a full 30-day Ramadan timetable', async () => {
    const res = await call('/v1/prayer/ramadan?district=dhaka&year=1447');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.year_hijri).toBe(1447);
    expect(body.data.days).toHaveLength(30);

    const day1 = body.data.days[0];
    expect(day1.day).toBe(1);
    expect(day1.sehri_cutoff).toBeDefined();
    expect(day1.iftar).toBeDefined();
    expect(day1.sehri_cutoff_bn).toContain('ভোর');
    expect(day1.iftar_bn).toContain('সন্ধ্যা');

    expect(body.data.disclaimer_bn).toContain('চাঁদ দেখার ওপর নির্ভরশীল');
  });

  it('returns a single day when requested via ?day=', async () => {
    const res = await call('/v1/prayer/ramadan?day=10');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.days).toHaveLength(1);
    expect(body.data.days[0].day).toBe(10);
    expect(body.data.days[0].sehri_cutoff).toBeDefined();
    expect(body.data.days[0].iftar).toBeDefined();
  });

  it('400s invalid day parameter', async () => {
    const res = await call('/v1/prayer/ramadan?day=35');
    await expectError(res, 400, 'invalid_parameter');
  });

  it('404s unknown district', async () => {
    const res = await call('/v1/prayer/ramadan?district=invalid-place');
    await expectError(res, 404, 'not_found');
  });
});

describe('GET /v1/prayer/offsets', () => {
  it('returns all 64 district offsets', async () => {
    const res = await call('/v1/prayer/offsets');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data).toHaveLength(64);
  });

  it('filters by query string', async () => {
    const res = await call('/v1/prayer/offsets?q=sylhet');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    const sylhet = body.data.find((d: any) => d.slug === 'sylhet');
    expect(sylhet).toBeDefined();
    expect(sylhet.sehri_offset_minutes).toBe(-6);
  });

  it('returns details for a single district via /offsets/{district}', async () => {
    const res = await call('/v1/prayer/offsets/rajshahi');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.slug).toBe('rajshahi');
    expect(body.data.sehri_offset_minutes).toBe(7);
  });

  it('404s unknown district on /offsets/{district}', async () => {
    const res = await call('/v1/prayer/offsets/mars');
    await expectError(res, 404, 'not_found');
  });
});

import { describe, expect, it } from 'vitest';
import { call, expectError } from './helpers';

describe('GET /v1/metro/stations', () => {
  it('returns all 17 stations in order with DMTCL source', async () => {
    const res = await call('/v1/metro/stations');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(17);
    expect(body.data[0].slug).toBe('uttara-north');
    expect(body.data[15].slug).toBe('motijheel');
    expect(body.data[16].slug).toBe('kamalapur');

    expect(body.meta.source).toContain('Dhaka Mass Transit Company Limited');
  });

  it('filters stations by operational status', async () => {
    const res = await call('/v1/metro/stations?status=operational');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data).toHaveLength(16);
    expect(body.data.every((s: any) => s.status === 'operational')).toBe(true);
  });

  it('filters stations by search query q', async () => {
    const res = await call('/v1/metro/stations?q=mirpur');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.length).toBeGreaterThanOrEqual(2);
    expect(body.data.some((s: any) => s.slug === 'mirpur-10')).toBe(true);
  });
});

describe('GET /v1/metro/stations/{slug}', () => {
  it('returns details for a single station by slug or code', async () => {
    const bySlug = await call('/v1/metro/stations/farmgate');
    expect(bySlug.status).toBe(200);
    const bodySlug = (await bySlug.json()) as any;
    expect(bodySlug.data.name_en).toBe('Farmgate');
    expect(bodySlug.data.name_bn).toBe('ফার্মগেট');
    expect(bodySlug.data.code).toBe('FG');
    expect(bodySlug.data.features).toContain('elevator');

    const byCode = await call('/v1/metro/stations/fg');
    expect(byCode.status).toBe(200);
    const bodyCode = (await byCode.json()) as any;
    expect(bodyCode.data.slug).toBe('farmgate');
  });

  it('404s unknown station', async () => {
    const res = await call('/v1/metro/stations/unknown-station');
    await expectError(res, 404, 'not_found');
  });
});

describe('GET /v1/metro/fare', () => {
  it('calculates full route fare with 10% MRT Pass discount', async () => {
    const res = await call('/v1/metro/fare?from=uttara-north&to=motijheel');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.from.slug).toBe('uttara-north');
    expect(body.data.to.slug).toBe('motijheel');
    expect(body.data.single_journey_fare).toBe(100);
    expect(body.data.single_journey_fare_bn).toBe('১০০');
    expect(body.data.mrt_pass_fare).toBe(90);
    expect(body.data.mrt_pass_fare_bn).toBe('৯০');
    expect(body.data.discount_percent).toBe(10);
    expect(body.data.currency).toBe('BDT');
    expect(body.data.concessions.children_under_3ft).toBeDefined();
  });

  it('calculates minimum fare for adjacent stations', async () => {
    const res = await call('/v1/metro/fare?from=uttara-north&to=uttara-center');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.single_journey_fare).toBe(20);
    expect(body.data.mrt_pass_fare).toBe(18);
  });

  it('400s when origin and destination are the same', async () => {
    const res = await call('/v1/metro/fare?from=motijheel&to=motijheel');
    await expectError(res, 400, 'invalid_parameter');
  });

  it('404s when station does not exist', async () => {
    const res = await call('/v1/metro/fare?from=atlantis&to=motijheel');
    await expectError(res, 404, 'not_found');
  });
});

describe('GET /v1/metro/timetable & /lines', () => {
  it('returns timetable schedules', async () => {
    const res = await call('/v1/metro/timetable');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.line).toBe('MRT Line-6');
    expect(body.data.regular_service.first_train_uttara_north).toBe('07:10');
    expect(body.data.friday_service.first_train).toBe('15:00');
  });

  it('returns MRT Line-6 metadata', async () => {
    const res = await call('/v1/metro/lines');
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.data.id).toBe('mrt-line-6');
    expect(body.data.operational_length_km).toBe(20.1);
    expect(body.data.stations_count).toBe(16);
  });
});

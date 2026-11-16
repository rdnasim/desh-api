import { describe, expect, it } from 'vitest';
import app from '../../src/app';

describe('GET /v1/constituencies', () => {
  it('returns all 300 constituencies with caching headers and meta source', async () => {
    const res = await app.request('/v1/constituencies');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('public');

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(300);
    expect(body.meta.source).toBeDefined();
    expect(body.meta.total).toBe(300);

    const first = body.data[0];
    expect(first.number).toBe(1);
    expect(first.code).toBe('panchagarh-1');
    expect(first.name_en).toBe('Panchagarh-1');
  });

  it('filters by division and district', async () => {
    const resRangpur = await app.request('/v1/constituencies?division=rangpur');
    expect(resRangpur.status).toBe(200);
    const bodyRangpur = await resRangpur.json();
    expect(bodyRangpur.data).toHaveLength(33);

    const resDhaka = await app.request('/v1/constituencies?district=dhaka');
    expect(resDhaka.status).toBe(200);
    const bodyDhaka = await resDhaka.json();
    expect(bodyDhaka.data).toHaveLength(20);
  });

  it('filters by search term', async () => {
    const res = await app.request('/v1/constituencies?search=dhaka-10');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.some((c: { code: string }) => c.code === 'dhaka-10')).toBe(true);
  });

  it('supports pagination', async () => {
    const res = await app.request('/v1/constituencies?limit=10&offset=20');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(10);
    expect(body.data[0].number).toBe(21);
    expect(body.meta.total).toBe(300);
  });
});

describe('GET /v1/constituencies/districts', () => {
  it('returns breakdown for 64 districts', async () => {
    const res = await app.request('/v1/constituencies/districts');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(64);

    const dhaka = body.data.find((d: { district: string }) => d.district === 'dhaka');
    expect(dhaka.seat_count).toBe(20);
    expect(dhaka.constituencies).toHaveLength(20);
  });

  it('filters district breakdown by district query', async () => {
    const res = await app.request('/v1/constituencies/districts?district=cumilla');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].district).toBe('cumilla');
    expect(body.data[0].seat_count).toBe(11);
  });
});

describe('GET /v1/constituencies/{identifier}', () => {
  it('returns constituency by integer seat number', async () => {
    const res = await app.request('/v1/constituencies/174');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.number).toBe(174);
    expect(body.data.name_en).toBe('Dhaka-1');
  });

  it('returns constituency by slug', async () => {
    const res = await app.request('/v1/constituencies/dhaka-1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.number).toBe(174);
  });

  it('returns constituency by Bengali numeral', async () => {
    const res = await app.request('/v1/constituencies/%E0%A7%A7%E0%A7%AD%E0%A7%AA'); // ১৭৪
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.number).toBe(174);
  });

  it('returns 404 for unknown seat number or slug', async () => {
    const resNum = await app.request('/v1/constituencies/999');
    expect(resNum.status).toBe(404);

    const resSlug = await app.request('/v1/constituencies/mars-1');
    expect(resSlug.status).toBe(404);
  });
});

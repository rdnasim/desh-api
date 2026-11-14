import { describe, expect, it } from 'vitest';
import { call, expectError } from './helpers';

describe('app shell', () => {
  it('GET /health reports ok', async () => {
    const res = await call('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  it('GET / lists modules and links', async () => {
    const res = await call('/');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { docs: string; openapi: string; modules: unknown[] };
    expect(body.docs).toBe('/docs');
    expect(body.openapi).toBe('/openapi.json');
    expect(body.modules.length).toBeGreaterThan(0);
  });

  it('lists one module in the index for every documented tag', async () => {
    const index = (await (await call('/')).json()) as { modules: { name: string }[] };
    const doc = (await (await call('/openapi.json')).json()) as { tags: { name: string }[] };
    expect(index.modules.map((m) => m.name).sort()).toEqual(doc.tags.map((t) => t.name).sort());
  });

  it('unknown route returns 404 envelope', async () => {
    await expectError(await call('/v1/nope'), 404, 'not_found');
  });

  it('wrong method on a known route returns 405 envelope', async () => {
    const res = await call('/v1/divisions', { method: 'DELETE' });
    await expectError(res, 405, 'method_not_allowed');
  });

  it('sends CORS headers', async () => {
    const res = await call('/v1/divisions', { headers: { Origin: 'https://example.com' } });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    const pre = await call('/v1/divisions', {
      method: 'OPTIONS',
      headers: { Origin: 'https://example.com', 'Access-Control-Request-Method': 'GET' },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-methods')).toContain('GET');
  });

  it('returns 429 with Retry-After when the rate limiter denies', async () => {
    const res = await call('/v1/divisions', undefined, {
      RATE_LIMITER: { limit: async () => ({ success: false }) },
    });
    await expectError(res, 429, 'rate_limited');
    expect(res.headers.get('retry-after')).toBe('60');
  });

  it('serves a valid OpenAPI 3.1 document', async () => {
    const res = await call('/openapi.json');
    expect(res.status).toBe(200);
    const doc = (await res.json()) as { openapi: string; paths: Record<string, unknown> };
    expect(doc.openapi).toMatch(/^3\.1\./);
    expect(Object.keys(doc.paths)).toContain('/v1/divisions');
  });

  it('serves the docs page', async () => {
    const res = await call('/docs');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('defaults to no-store caching', async () => {
    const res = await call('/health');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

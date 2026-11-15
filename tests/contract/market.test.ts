import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FuelMonthSchema, MarketPricesSchema } from '../../src/modules/market/schemas';
import xlsxB64 from '../golden/market/tcb-daily-2026-11-12.xlsx.b64.txt?raw';
import listing from '../golden/market/tcb-daily-list-2026-11-12.txt?raw';
import { call, expectError, expectOk } from './helpers';

const bytes = Uint8Array.from(atob(xlsxB64.trim()), (c) => c.charCodeAt(0));
const realFetch = globalThis.fetch;
function upstream(ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith('https://tcb.gov.bd/'))
      return ok ? new Response(listing) : new Response('blocked', { status: 403 });
    if (url.includes('objectstorage') && url.endsWith('.xlsx'))
      return ok ? new Response(bytes) : new Response('blocked', { status: 403 });
    return realFetch(input, init);
  });
}
const kv = (env as unknown as { LIVE_DATA: KVNamespace }).LIVE_DATA;
beforeEach(() => kv.delete('market:tcb:last-good'));
afterEach(() => vi.restoreAllMocks());

describe('GET /v1/market/prices', () => {
  it('returns the latest TCB list, citing TCB with its date', async () => {
    upstream();
    const res = await call('/v1/market/prices');
    expect(res.headers.get('cache-control')).toBe('public, max-age=1800');
    const body = await expectOk(res, MarketPricesSchema);
    expect(body.data).toMatchObject({ date: '2026-11-12', freshness: 'live' });
    expect(body.data.items).toHaveLength(60);
    expect(body.meta.source).toContain('Trading Corporation of Bangladesh');
    expect(body.meta.last_updated).toBe('2026-11-12');
  });

  it('filters by category and by name in English or Bangla', async () => {
    upstream();
    const oil = await expectOk(await call('/v1/market/prices?category=edible-oil'));
    expect((oil.data as { items: unknown[] }).items).toHaveLength(7);
    const egg = await expectOk(await call(`/v1/market/prices?q=${encodeURIComponent('ডিম')}`));
    expect((egg.data as { items: { slug: string }[] }).items.map((i) => i.slug)).toEqual([
      'egg-farm',
    ]);
    const lentil = await expectOk(await call('/v1/market/prices?q=lentil'));
    expect((lentil.data as { items: unknown[] }).items).toHaveLength(3);
    await expectError(await call('/v1/market/prices?category=cars'), 400, 'invalid_parameter');
  });

  it('serves the last good list when TCB cannot be read, and 503 with none', async () => {
    upstream(false);
    await expectError(await call('/v1/market/prices'), 503, 'upstream_unavailable');
    vi.restoreAllMocks();
    upstream();
    await call('/v1/market/prices');
    vi.restoreAllMocks();
    upstream(false);
    const body = await expectOk(await call('/v1/market/prices'), MarketPricesSchema);
    expect(body.data.freshness).toBe('last_known');
    expect(body.meta.disclaimer).toContain('last price list');
  });
});

describe('GET /v1/fuel/prices', () => {
  it('returns the latest month by default, or the month asked for', async () => {
    const body = await expectOk(await call('/v1/fuel/prices'), FuelMonthSchema);
    expect(body.data).toMatchObject({ month: '2026-11', prices: { diesel: 135, octane: 165 } });
    expect(body.meta.source).toContain('Energy and Mineral Resources Division');
    await expectOk(await call('/v1/fuel/prices?month=2026-11'));
    const missing = await expectError(
      await call('/v1/fuel/prices?month=2020-01'),
      404,
      'not_found',
    );
    expect(missing.error.message).toContain('2026-11');
    await expectError(await call('/v1/fuel/prices?month=November'), 400, 'invalid_parameter');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoldPricesSchema, ZakatSchema } from '../../src/modules/gold/schemas';
import fixture from '../golden/gold/bajus-gold-price-2026-11-14.txt?raw';
import { call, expectError, expectOk } from './helpers';

const realFetch = globalThis.fetch;
function upstream(body: string, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith('https://www.bajus.org/')) return new Response(body, { status });
    return realFetch(input, init);
  });
}
afterEach(() => vi.restoreAllMocks());

describe('GET /v1/gold/prices', () => {
  it('returns BAJUS prices with the effective date as last_updated', async () => {
    const spy = upstream(fixture);
    const res = await call('/v1/gold/prices');
    expect(res.headers.get('cache-control')).toBe('public, max-age=600');
    const body = await expectOk(res, GoldPricesSchema);
    expect(body.data.gold['22k'].per_gram).toBe(18655);
    expect(body.meta.last_updated).toBe('2026-11-14');
    expect(body.meta.source).toContain('BAJUS');
    expect(spy).toHaveBeenCalledOnce();
  });

  it('503s when BAJUS is down or its page changed', async () => {
    upstream('oops', 502);
    await expectError(await call('/v1/gold/prices'), 503, 'upstream_unavailable');
    vi.restoreAllMocks();
    upstream('<html>new design</html>');
    await expectError(await call('/v1/gold/prices'), 503, 'upstream_unavailable');
  });
});

describe('GET /v1/zakat', () => {
  it('computes zakat on the silver nisab by default', async () => {
    upstream(fixture);
    const body = await expectOk(await call('/v1/zakat?wealth=১০,০০,০০০'), ZakatSchema);
    expect(body.data).toMatchObject({ basis: 'silver', due: true, zakat: 25000 });
    expect(body.meta.disclaimer).toContain('scholar');
  });

  it('accepts basis and karat, and 400s bad input', async () => {
    upstream(fixture);
    const body = await expectOk(await call('/v1/zakat?wealth=2000000&basis=gold&karat=21k'));
    expect(body.data).toMatchObject({ basis: 'gold', karat: '21k' });
    for (const q of ['', 'wealth=-1', 'wealth=100&basis=copper', 'wealth=100&karat=24k']) {
      await expectError(await call(`/v1/zakat?${q}`), 400, 'invalid_parameter');
    }
  });
});

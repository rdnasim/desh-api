import { describe, expect, it, vi } from 'vitest';
import type { Env } from '../../../src/env';
import { warmupLiveData } from '../../../src/lib/warmup';
import * as bajusModule from '../../../src/modules/gold/bajus';
import * as tcbModule from '../../../src/modules/market/tcb';

function fakeKv() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe('warmupLiveData', () => {
  it('returns graceful failure when LIVE_DATA KV binding is not configured', async () => {
    const env: Env = {};
    const res = await warmupLiveData(env);
    expect(res).toEqual({
      gold: { success: false },
      market: { success: false },
    });
  });

  it('pre-warms gold and market data into KV when upstream succeeds', async () => {
    const kv = fakeKv();
    const env: Env = { LIVE_DATA: kv as never };

    vi.spyOn(bajusModule, 'fetchBajus').mockResolvedValueOnce({
      effective_date: '2026-11-17',
      currency: 'BDT',
      gold: {
        '22k': { per_gram: 13500, per_vori: 157464 },
        '21k': { per_gram: 12880, per_vori: 150232 },
        '18k': { per_gram: 11040, per_vori: 128770 },
        traditional: { per_gram: 9060, per_vori: 105676 },
      },
      silver: {
        '22k': { per_gram: 220, per_vori: 2566 },
        '21k': { per_gram: 210, per_vori: 2450 },
        '18k': { per_gram: 180, per_vori: 2100 },
        traditional: { per_gram: 135, per_vori: 1575 },
      },
      source_url: 'https://www.bajus.org/gold-price',
    });

    vi.spyOn(tcbModule, 'fetchTcb').mockResolvedValueOnce({
      date: '2026-11-17',
      market: 'dhaka',
      file_url: 'https://example.com/tcb.xlsx',
      items: [],
    });

    const res = await warmupLiveData(env);
    expect(res.gold.success).toBe(true);
    expect(res.gold.effective_date).toBe('2026-11-17');
    expect(res.market.success).toBe(true);
    expect(res.market.date).toBe('2026-11-17');

    expect(kv.store.has('gold:bajus:last-good')).toBe(true);
    expect(kv.store.has('market:tcb:last-good')).toBe(true);
  });

  it('catches and reports upstream failures without throwing', async () => {
    const kv = fakeKv();
    const env: Env = { LIVE_DATA: kv as never };

    vi.spyOn(bajusModule, 'fetchBajus').mockRejectedValueOnce(new Error('BAJUS 503'));
    vi.spyOn(tcbModule, 'fetchTcb').mockRejectedValueOnce(new Error('TCB timeout'));

    const res = await warmupLiveData(env);
    expect(res.gold.success).toBe(false);
    expect(res.gold.error).toContain('BAJUS 503');
    expect(res.market.success).toBe(false);
    expect(res.market.error).toContain('TCB timeout');
  });
});

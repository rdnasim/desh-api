import { describe, expect, it } from 'vitest';
import { parseBajus } from '../../../src/modules/gold/bajus';
import { recall, remember } from '../../../src/modules/gold/last-good';
import fixture from '../../golden/gold/bajus-gold-price-2026-11-14.txt?raw';

function fakeKv() {
  const store = new Map<string, string>();
  let puts = 0;
  return {
    store,
    get puts() {
      return puts;
    },
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      puts++;
      store.set(key, value);
    },
  };
}

const prices = parseBajus(fixture);
const HOUR = 3_600_000;
const t0 = Date.parse('2026-11-15T06:00:00Z');

describe('last good gold prices', () => {
  it('stores a list and recalls it with when it was read', async () => {
    const kv = fakeKv();
    await remember(kv as never, prices, t0);
    expect(await recall(kv as never, t0 + HOUR)).toEqual({
      prices,
      fetched_at: '2026-11-15T06:00:00.000Z',
    });
  });

  it('writes again only for a new list or after 6 hours', async () => {
    const kv = fakeKv();
    await remember(kv as never, prices, t0);
    await remember(kv as never, prices, t0 + HOUR);
    expect(kv.puts).toBe(1);
    await remember(kv as never, { ...prices, effective_date: '2026-11-16' }, t0 + 2 * HOUR);
    expect(kv.puts).toBe(2);
    await remember(kv as never, { ...prices, effective_date: '2026-11-16' }, t0 + 9 * HOUR);
    expect(kv.puts).toBe(3);
  });

  it('forgets a list read more than 7 days ago, or an unreadable value', async () => {
    const kv = fakeKv();
    await remember(kv as never, prices, t0);
    expect(await recall(kv as never, t0 + 7 * 24 * HOUR - 1)).toBeDefined();
    expect(await recall(kv as never, t0 + 7 * 24 * HOUR + 1)).toBeUndefined();
    kv.store.set('gold:bajus:last-good', 'not json');
    expect(await recall(kv as never, t0)).toBeUndefined();
  });

  it('reads a copy saved in the older { prices, fetched_at } shape', async () => {
    const kv = fakeKv();
    kv.store.set(
      'gold:bajus:last-good',
      JSON.stringify({ prices, fetched_at: '2026-11-15T06:00:00.000Z' }),
    );
    expect((await recall(kv as never, t0 + HOUR))?.prices).toEqual(prices);
  });

  it('does nothing without a KV binding', async () => {
    await expect(remember(undefined, prices, t0)).resolves.toBeUndefined();
    expect(await recall(undefined, t0)).toBeUndefined();
  });
});

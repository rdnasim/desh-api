import { describe, expect, it } from 'vitest';
import { recall, remember } from '../../../src/modules/market/last-good';
import type { ParsedMarket } from '../../../src/modules/market/tcb';

function fakeKv() {
  const store = new Map<string, string>();
  let puts = 0;
  return {
    store,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      puts++;
      store.set(key, value);
    },
    get puts() {
      return puts;
    },
  };
}

const sampleMarket: ParsedMarket = {
  date: '2026-11-17',
  market: 'dhaka',
  file_url: 'https://example.com/sheet.xlsx',
  items: [
    {
      slug: 'rice-fine-miniket',
      name_en: 'Miniket Rice',
      name_bn: 'মিনিকেট চাল',
      unit_en: 'kg',
      unit_bn: 'কেজি',
      category: 'rice',
      price: { min: 75, max: 80 },
      week_ago: null,
      month_ago: null,
      year_ago: null,
      change_month_pct: null,
      change_year_pct: null,
    },
  ],
};

const HOUR = 3_600_000;
const t0 = Date.parse('2026-11-17T06:00:00Z');

describe('last good market prices', () => {
  it('stores and recalls market prices within 7 days', async () => {
    const kv = fakeKv();
    await remember(kv as never, sampleMarket, t0);
    const recalled = await recall(kv as never, t0 + HOUR);
    expect(recalled).toBeDefined();
    expect(recalled?.data.date).toBe('2026-11-17');
    expect(recalled?.data.items).toHaveLength(1);
  });

  it('avoids redundant writes within 6 hours unless date changes', async () => {
    const kv = fakeKv();
    await remember(kv as never, sampleMarket, t0);
    await remember(kv as never, sampleMarket, t0 + HOUR);
    expect(kv.puts).toBe(1);

    await remember(kv as never, { ...sampleMarket, date: '2026-11-18' }, t0 + 2 * HOUR);
    expect(kv.puts).toBe(2);
  });
});

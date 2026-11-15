import type { Env } from '../../env';
import { lastGood } from '../../lib/last-good';
import type { ParsedPrices } from './bajus';

const store = lastGood<ParsedPrices>('gold:bajus:last-good', (p) => p.effective_date);

export const remember = (kv: Env['LIVE_DATA'], prices: ParsedPrices, now?: number) =>
  store.remember(kv, prices, now);

/** The last BAJUS list read anywhere within 7 days, as `{ prices, fetched_at }`. */
export async function recall(kv: Env['LIVE_DATA'], now?: number) {
  const saved = await store.recall(kv, now);
  return saved && { prices: saved.data, fetched_at: saved.fetched_at };
}

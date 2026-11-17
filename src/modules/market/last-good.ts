import type { Env } from '../../env';
import { lastGood } from '../../lib/last-good';
import type { ParsedMarket } from './tcb';

const store = lastGood<ParsedMarket>('market:tcb:last-good', (m) => m.date);

export const remember = (kv: Env['LIVE_DATA'], data: ParsedMarket, now?: number) =>
  store.remember(kv, data, now);

/** The last TCB list read anywhere within 7 days, as `{ data, fetched_at }`. */
export async function recall(kv: Env['LIVE_DATA'], now?: number) {
  return store.recall(kv, now);
}

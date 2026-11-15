import type { Env } from '../../env';
import type { ParsedPrices } from './bajus';

const KEY = 'gold:bajus:last-good';
/** Rewrite an unchanged list at most this often, so KV writes stay at a handful a day. */
const REFRESH_MS = 6 * 3_600_000;
/** A list read longer ago than this is not served. */
const MAX_AGE_MS = 7 * 24 * 3_600_000;

type Kv = Env['LIVE_DATA'];
export interface LastGood {
  prices: ParsedPrices;
  fetched_at: string;
}

async function read(kv: Kv): Promise<LastGood | undefined> {
  const raw = await kv?.get(KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as LastGood;
    return value?.prices && !Number.isNaN(Date.parse(value.fetched_at)) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Saves a freshly read price list when it is new, or when the saved copy is over 6 hours old. */
export async function remember(kv: Kv, prices: ParsedPrices, now = Date.now()): Promise<void> {
  if (!kv) return;
  const saved = await read(kv);
  if (
    saved &&
    saved.prices.effective_date === prices.effective_date &&
    now - Date.parse(saved.fetched_at) < REFRESH_MS
  )
    return;
  await kv.put(KEY, JSON.stringify({ prices, fetched_at: new Date(now).toISOString() }));
}

/** The last price list read anywhere, if it was read within the last 7 days. */
export async function recall(kv: Kv, now = Date.now()): Promise<LastGood | undefined> {
  const saved = await read(kv);
  return saved && now - Date.parse(saved.fetched_at) <= MAX_AGE_MS ? saved : undefined;
}

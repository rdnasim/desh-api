import type { Env } from '../env';

/** Rewrite an unchanged copy at most this often, so KV writes stay at a handful a day. */
const REFRESH_MS = 6 * 3_600_000;
/** A copy read longer ago than this is not served. */
const MAX_AGE_MS = 7 * 24 * 3_600_000;

type Kv = Env['LIVE_DATA'];
export interface LastGood<T> {
  data: T;
  fetched_at: string;
}

/**
 * The last good copy of a live source, kept in Workers KV under `key` for regions where the source
 * refuses requests. `version` identifies a new list (e.g. its effective date).
 */
export function lastGood<T>(key: string, version: (data: T) => string) {
  async function read(kv: Kv): Promise<LastGood<T> | undefined> {
    const raw = await kv?.get(key);
    if (!raw) return undefined;
    try {
      // `prices` is the field name used before this helper was shared (gold, 2026-11-15).
      const stored = JSON.parse(raw) as { data?: T; prices?: T; fetched_at: string };
      const data = stored.data ?? stored.prices;
      return data && !Number.isNaN(Date.parse(stored.fetched_at))
        ? { data, fetched_at: stored.fetched_at }
        : undefined;
    } catch {
      return undefined;
    }
  }

  return {
    /** Saves a fresh copy when it is new, or when the saved one is over 6 hours old. */
    async remember(kv: Kv, data: T, now = Date.now()): Promise<void> {
      if (!kv) return;
      const saved = await read(kv);
      if (
        saved &&
        version(saved.data) === version(data) &&
        now - Date.parse(saved.fetched_at) < REFRESH_MS
      )
        return;
      await kv.put(key, JSON.stringify({ data, fetched_at: new Date(now).toISOString() }));
    },
    /** The last copy read anywhere, if it was read within the last 7 days. */
    async recall(kv: Kv, now = Date.now()): Promise<LastGood<T> | undefined> {
      const saved = await read(kv);
      return saved && now - Date.parse(saved.fetched_at) <= MAX_AGE_MS ? saved : undefined;
    },
  };
}

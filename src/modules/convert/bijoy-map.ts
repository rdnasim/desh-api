import entries from '../../generated/convert.bijoy-map';
import type { BijoyMapEntry } from './schemas';

/** Bijoy (SutonnyMJ) → entry, for longest-match decoding. */
export const BIJOY_TO_ENTRY = new Map(entries.map((e) => [e.bijoy, e]));
export const MAX_BIJOY_KEY = Math.max(...entries.map((e) => e.bijoy.length));

/** Unicode → preferred Bijoy entry, for encoding. */
export const UNICODE_TO_ENTRY = new Map<string, BijoyMapEntry>();
for (const e of entries) {
  if (e.preferred_reverse === false) continue;
  if (!UNICODE_TO_ENTRY.has(e.unicode)) UNICODE_TO_ENTRY.set(e.unicode, e);
}
export const MAX_UNICODE_KEY = Math.max(...[...UNICODE_TO_ENTRY.keys()].map((k) => k.length));

export const HASANTA = '্';
export const NUKTA = '়';
export const REPH = 'র্';

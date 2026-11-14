export type Rng = () => number;

/** 32-bit FNV-1a hash, used to turn a string seed into a PRNG state. */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(state: number): Rng {
  let a = state;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic when a seed is given, otherwise seeded from crypto randomness. */
export function createRng(seed?: string): Rng {
  if (seed !== undefined) return mulberry32(hashSeed(seed));
  return mulberry32(crypto.getRandomValues(new Uint32Array(1))[0] as number);
}

export function pick<T>(items: readonly T[], rng: Rng): T | undefined {
  return items[Math.floor(rng() * items.length)];
}

/** Up to `count` distinct items (partial Fisher–Yates). */
export function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
  const copy = [...items];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(0, n);
}

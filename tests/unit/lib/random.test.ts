import { describe, expect, it } from 'vitest';
import { createRng, pick, sample } from '../../../src/lib/random';

describe('seeded random', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng('abc');
    const b = createRng('abc');
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
    for (const n of seqA) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('produces different sequences for different seeds', () => {
    expect(createRng('abc')()).not.toBe(createRng('abd')());
  });

  it('works without a seed', () => {
    const n = createRng()();
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThan(1);
  });

  it('pick and sample are deterministic and sample has no duplicates', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(pick(items, createRng('x'))).toBe(pick(items, createRng('x')));
    const s = sample(items, 5, createRng('y'));
    expect(s).toEqual(sample(items, 5, createRng('y')));
    expect(new Set(s).size).toBe(5);
    expect(sample(items, 50, createRng('z'))).toHaveLength(10);
  });
});

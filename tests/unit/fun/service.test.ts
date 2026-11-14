import { describe, expect, it } from 'vitest';
import {
  eventsOn,
  quizQuestions,
  randomDish,
  randomProverb,
  randomRiddle,
} from '../../../src/modules/fun/service';

describe('fun service', () => {
  it('gives the same pick for the same seed', () => {
    expect(randomProverb('abc')).toEqual(randomProverb('abc'));
    expect(randomRiddle('abc')).toEqual(randomRiddle('abc'));
    expect(quizQuestions(undefined, 5, 'abc')).toEqual(quizQuestions(undefined, 5, 'abc'));
  });

  it('varies across seeds', () => {
    const ids = new Set(Array.from({ length: 20 }, (_, i) => randomProverb(`s${i}`)?.id));
    expect(ids.size).toBeGreaterThan(5);
  });

  it('returns distinct quiz questions filtered by topic', () => {
    const qs = quizQuestions('culture', 10, 'x');
    expect(qs).toHaveLength(10);
    expect(new Set(qs.map((q) => q.id)).size).toBe(10);
    expect(qs.every((q) => q.topic === 'culture')).toBe(true);
  });

  it('filters food by district and division, and rejects unknown regions', () => {
    expect(randomDish('bogura', 'x')?.district).toBe('bogura');
    const dhakaDivision = randomDish('dhaka', 'y');
    expect(dhakaDivision).not.toBeNull();
    expect(randomDish('atlantis')).toBeNull();
    expect(randomDish('sylhet')).toBeUndefined();
  });

  it('lists events on a day, oldest first, or nothing', () => {
    expect(eventsOn(12, 16).map((e) => e.year)).toEqual([1971]);
    expect(eventsOn(7, 3)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import dishes from '../../src/generated/fun.dishes';
import history from '../../src/generated/fun.history';
import proverbs from '../../src/generated/fun.proverbs';
import quiz from '../../src/generated/fun.quiz';
import riddles from '../../src/generated/fun.riddles';

// Starter-set minimums (research R16); raise these as contributions land.
const MIN = { proverbs: 100, riddles: 10, quiz: 25, dishes: 20, history: 5 };

describe('fun datasets', () => {
  it('meet starter-set minimums', () => {
    expect(proverbs.length).toBeGreaterThanOrEqual(MIN.proverbs);
    expect(riddles.length).toBeGreaterThanOrEqual(MIN.riddles);
    expect(quiz.length).toBeGreaterThanOrEqual(MIN.quiz);
    expect(dishes.length).toBeGreaterThanOrEqual(MIN.dishes);
    expect(history.length).toBeGreaterThanOrEqual(MIN.history);
  });

  it('have unique ids and texts', () => {
    for (const rows of [proverbs, riddles, quiz, history]) {
      expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    }
    expect(new Set(proverbs.map((p) => p.text_bn)).size).toBe(proverbs.length);
    expect(new Set(dishes.map((d) => d.slug)).size).toBe(dishes.length);
  });

  it('give every record a source', () => {
    for (const r of [...proverbs, ...riddles, ...quiz, ...dishes, ...history])
      expect(r.source.length).toBeGreaterThan(0);
  });

  it('cite a URL for every factual record', () => {
    for (const r of [...quiz, ...dishes, ...history]) expect(() => new URL(r.source)).not.toThrow();
  });

  it('have quiz answers that point at an option, with distinct options', () => {
    for (const q of quiz) {
      expect(q.answer_index).toBeLessThan(q.options.length);
      expect(new Set(q.options.map((o) => o.en)).size).toBe(q.options.length);
      expect(new Set(q.options.map((o) => o.bn)).size).toBe(q.options.length);
    }
  });

  it('have real calendar days for history events', () => {
    for (const e of history) {
      const date = new Date(Date.UTC(e.year, e.month - 1, e.day));
      expect(date.getUTCMonth() + 1, e.id).toBe(e.month);
      expect(date.getUTCDate(), e.id).toBe(e.day);
    }
  });
});

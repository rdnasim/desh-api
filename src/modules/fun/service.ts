import dishes from '../../generated/fun.dishes';
import history from '../../generated/fun.history';
import proverbs from '../../generated/fun.proverbs';
import quiz from '../../generated/fun.quiz';
import riddles from '../../generated/fun.riddles';
import { createRng, pick, sample } from '../../lib/random';
import { getDistrict, getDivision } from '../geo/service';
import type { Dish, Proverb, QuizTopic, Riddle } from './schemas';

// Both lists are non-empty (enforced by tests/data/fun.test.ts).
export const randomProverb = (seed?: string) => pick(proverbs, createRng(seed)) as Proverb;
export const randomRiddle = (seed?: string) => pick(riddles, createRng(seed)) as Riddle;

export function quizQuestions(topic: QuizTopic | undefined, count: number, seed?: string) {
  const pool = topic === undefined ? quiz : quiz.filter((q) => q.topic === topic);
  return sample(pool, count, createRng(seed));
}

export const topicCount = (topic: QuizTopic) => quiz.filter((q) => q.topic === topic).length;

/** `region` may be a district or a division slug. Returns null for an unknown region. */
export function randomDish(region: string | undefined, seed?: string): Dish | undefined | null {
  let pool: Dish[] = dishes;
  if (region !== undefined) {
    if (getDistrict(region)) pool = dishes.filter((d) => d.district === region);
    else if (getDivision(region))
      pool = dishes.filter((d) => d.district && getDistrict(d.district)?.division === region);
    else return null;
  }
  return pick(pool, createRng(seed));
}

export function eventsOn(month: number, day: number) {
  return history.filter((e) => e.month === month && e.day === day).sort((a, b) => a.year - b.year);
}

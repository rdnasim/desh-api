import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import type { AppEnv } from '../../env';
import { cachePublic, noStore } from '../../lib/cache';
import { toLatinDigits } from '../../lib/digits';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { todayInDhaka } from '../bangla/calendar';
import {
  DishSchema,
  HistoryEventSchema,
  ProverbSchema,
  QuizQuestionSchema,
  QuizTopicInfoSchema,
  QuizTopicSchema,
  RiddleSchema,
  TOPIC_NAMES,
} from './schemas';
import {
  eventsOn,
  quizQuestions,
  randomDish,
  randomProverb,
  randomRiddle,
  topicCount,
} from './service';

const tags = ['Fun'];
const json = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const seedParam = z
  .string()
  .max(64)
  .optional()
  .openapi({
    param: { name: 'seed', in: 'query', description: 'Same seed, same pick (cacheable)' },
  });

/** Seeded picks are deterministic and can be cached; unseeded ones must not be. */
function cacheForSeed(c: Context, seed: string | undefined) {
  if (seed === undefined) noStore(c);
  else cachePublic(c);
}

const invalid = (message: string) => {
  throw new ApiError('invalid_parameter', message);
};

export const funRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/proverb/random',
    tags,
    summary: 'A random traditional Bangla proverb with its meaning',
    request: { query: z.object({ seed: seedParam }) },
    responses: json(ProverbSchema, 'A proverb'),
  }),
  (c) => {
    const { seed } = c.req.valid('query');
    cacheForSeed(c, seed);
    return ok(c, randomProverb(seed), metaFor(['fun.proverbs']));
  },
);

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/riddle/random',
    tags,
    summary: 'A random traditional Bangla riddle (ধাঁধা) with its answer',
    request: { query: z.object({ seed: seedParam }) },
    responses: json(RiddleSchema, 'A riddle'),
  }),
  (c) => {
    const { seed } = c.req.valid('query');
    cacheForSeed(c, seed);
    return ok(c, randomRiddle(seed), metaFor(['fun.riddles']));
  },
);

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/quiz',
    tags,
    summary: 'Random quiz questions, optionally by topic',
    request: {
      query: z.object({
        topic: z
          .string()
          .optional()
          .openapi({
            param: { name: 'topic', in: 'query', description: QuizTopicSchema.options.join(', ') },
          }),
        count: z
          .string()
          .optional()
          .openapi({ param: { name: 'count', in: 'query', description: '1–10, default 1' } }),
        seed: seedParam,
      }),
    },
    responses: json(z.array(QuizQuestionSchema), 'Quiz questions'),
  }),
  (c) => {
    const q = c.req.valid('query');
    const topic = q.topic === undefined ? undefined : QuizTopicSchema.safeParse(q.topic).data;
    if (q.topic !== undefined && !topic)
      invalid(`topic must be one of: ${QuizTopicSchema.options.join(', ')}`);
    const count =
      q.count === undefined ? 1 : numberParam('count', q.count, { min: 1, max: 10, integer: true });
    cacheForSeed(c, q.seed);
    return ok(c, quizQuestions(topic, count, q.seed), metaFor(['fun.quiz']));
  },
);

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/quiz/topics',
    tags,
    summary: 'Quiz topics with question counts',
    responses: json(z.array(QuizTopicInfoSchema), 'Topics'),
  }),
  (c) => {
    cachePublic(c);
    const data = QuizTopicSchema.options.map((slug) => ({
      slug,
      ...TOPIC_NAMES[slug],
      count: topicCount(slug),
    }));
    return ok(c, data, metaFor(['fun.quiz']));
  },
);

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/food/random',
    tags,
    summary: 'A random GI-registered traditional food, optionally by district or division',
    request: {
      query: z.object({
        region: z
          .string()
          .optional()
          .openapi({
            param: { name: 'region', in: 'query', description: 'District or division slug' },
            example: 'tangail',
          }),
        seed: seedParam,
      }),
    },
    responses: json(DishSchema.nullable(), 'A food, or null when the region has none listed yet'),
  }),
  (c) => {
    const { region, seed } = c.req.valid('query');
    const dish = randomDish(region, seed);
    if (dish === null) invalid(`region '${region}' is not a district or division slug`);
    cacheForSeed(c, seed);
    return ok(c, dish ?? null, metaFor(['fun.dishes']));
  },
);

funRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/fun/today-in-history',
    tags,
    summary: 'Bangladesh history events on a calendar day',
    description:
      'Without `date`, uses today in Asia/Dhaka. Returns an empty list on days with no listed events.',
    request: {
      query: z.object({
        date: z
          .string()
          .optional()
          .openapi({
            param: { name: 'date', in: 'query', description: 'MM-DD' },
            example: '12-16',
          }),
      }),
    },
    responses: json(z.array(HistoryEventSchema), 'Events, oldest first'),
  }),
  (c) => {
    const { date } = c.req.valid('query');
    const text = date === undefined ? todayInDhaka().slice(5) : toLatinDigits(date.trim());
    const m = /^(\d{2})-(\d{2})$/.exec(text);
    const month = Number(m?.[1]);
    const day = Number(m?.[2]);
    const valid =
      m &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= new Date(Date.UTC(2024, month, 0)).getUTCDate();
    if (!valid) invalid('date must be MM-DD, for example 12-16');
    if (date === undefined) noStore(c);
    else cachePublic(c);
    return ok(c, eventsOn(month, day), metaFor(['fun.history']));
  },
);

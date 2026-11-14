import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic, noStore } from '../../lib/cache';
import { ErrorSchema, envelope, ok, staticMeta } from '../../lib/envelope';
import { validationHook } from '../../lib/errors';
import { numberParam } from '../../lib/params';
import { toBanglaDate, todayInDhaka } from './calendar';
import { convertDigits, formatNumber } from './format-number';
import { numberToWords } from './num-to-words';
import { toOrdinal } from './ordinal';
import {
  BanglaDateSchema,
  DigitsSchema,
  FormattedNumberSchema,
  NumberWordsSchema,
  OrdinalSchema,
  POST_TEXT_MAX,
  SlugResultSchema,
  TakaWordsSchema,
  TEXT_MAX,
  TransliterationSchema,
} from './schemas';
import { banglaSlug } from './slug';
import { takaInWords } from './taka';
import { transliterate } from './transliterate';

const tags = ['Bangla toolkit'];
const UPDATED = '2026-11-14';
const TOOLKIT = staticMeta('desh-api Bangla toolkit', UPDATED);
const CALENDAR = staticMeta('Bangla Academy revised calendar (2019)', UPDATED);
const AVRO = staticMeta('Avro Phonetic (@subhesadek/avro-phonetic, MPL-2.0)', UPDATED);

const json = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});
const queryParam = (name: string, description: string, example: string) =>
  z.string().openapi({ param: { name, in: 'query', description }, example });
const text = (max: number, example: string) =>
  z
    .string()
    .min(1)
    .max(max)
    .openapi({ param: { name: 'text', in: 'query', description: `1–${max} characters` }, example });

export const banglaRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/num-to-words',
    tags,
    summary: 'Number to Bangla words (lakh/crore system)',
    description:
      'Accepts 0 to 999,999,999,999,999 with up to 2 decimals, in Latin or Bangla digits.',
    request: { query: z.object({ n: queryParam('n', 'The number', '1250') }) },
    responses: json(NumberWordsSchema, 'Number in words'),
  }),
  (c) => {
    const result = numberToWords(c.req.valid('query').n);
    cachePublic(c);
    return ok(c, result, TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/taka-in-words',
    tags,
    summary: 'Amount to "taka … paisa" words for invoices and cheques',
    request: {
      query: z.object({
        amount: queryParam('amount', 'Amount in taka, up to 2 decimals', '1250.50'),
      }),
    },
    responses: json(TakaWordsSchema, 'Amount in words'),
  }),
  (c) => {
    const result = takaInWords(c.req.valid('query').amount);
    cachePublic(c);
    return ok(c, result, TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/digits',
    tags,
    summary: 'Convert digits in text between Latin (0-9) and Bangla (০-৯)',
    request: {
      query: z.object({
        text: text(TEXT_MAX, '2026'),
        to: z.enum(['bn', 'en']).openapi({ param: { name: 'to', in: 'query' }, example: 'bn' }),
      }),
    },
    responses: json(DigitsSchema, 'Converted text'),
  }),
  (c) => {
    const { text: input, to } = c.req.valid('query');
    cachePublic(c);
    return ok(c, { input, output: convertDigits(input, to) }, TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/format-number',
    tags,
    summary: 'Format a number with lakh/crore grouping (12,50,000)',
    request: {
      query: z.object({
        n: queryParam('n', 'The number', '1250000'),
        digits: z
          .enum(['bn', 'en'])
          .optional()
          .openapi({
            param: { name: 'digits', in: 'query', description: 'Output digits (default bn)' },
          }),
      }),
    },
    responses: json(FormattedNumberSchema, 'Formatted number'),
  }),
  (c) => {
    const { n, digits } = c.req.valid('query');
    cachePublic(c);
    return ok(c, formatNumber(n, digits ?? 'bn'), TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/date',
    tags,
    summary: 'Gregorian date to the Bangla calendar (revised 2019)',
    description: 'Dates from 1971-01-01 to 2100-12-31. Without `date`, uses today in Asia/Dhaka.',
    request: {
      query: z.object({
        date: z
          .string()
          .optional()
          .openapi({
            param: { name: 'date', in: 'query', description: 'YYYY-MM-DD' },
            example: '2026-12-16',
          }),
      }),
    },
    responses: json(BanglaDateSchema, 'Bangla date'),
  }),
  (c) => {
    const { date } = c.req.valid('query');
    if (date === undefined) noStore(c);
    else cachePublic(c);
    return ok(c, toBanglaDate(date ?? todayInDhaka()), CALENDAR);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/ordinal',
    tags,
    summary: 'Bangla ordinal for 1–100 (৩ → তৃতীয়)',
    request: { query: z.object({ n: queryParam('n', '1–100', '3') }) },
    responses: json(OrdinalSchema, 'Ordinal'),
  }),
  (c) => {
    const n = numberParam('n', c.req.valid('query').n, { min: 1, max: 100, integer: true });
    cachePublic(c);
    return ok(c, toOrdinal(n), TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/slug',
    tags,
    summary: 'URL-safe slug from Bangla text (approximate romanisation)',
    request: { query: z.object({ text: text(200, 'আমার সোনার বাংলা') }) },
    responses: json(SlugResultSchema, 'Slug'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, banglaSlug(c.req.valid('query').text), TOOLKIT);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/bangla/transliterate',
    tags,
    summary: 'Romanised (Avro Phonetic) text to Bangla',
    description: 'Avro Phonetic is case-sensitive: `dh` → ধ, `Dh` → ঢ.',
    request: { query: z.object({ text: text(TEXT_MAX, 'ami bhalo achi') }) },
    responses: json(TransliterationSchema, 'Bangla text'),
  }),
  (c) => {
    cachePublic(c);
    return ok(c, transliterate(c.req.valid('query').text), AVRO);
  },
);

banglaRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/bangla/transliterate',
    tags,
    summary: 'Romanised (Avro Phonetic) text to Bangla, for longer text',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({ text: z.string().min(1).max(POST_TEXT_MAX) }).openapi({
              example: { text: 'amar sonar bangla' },
            }),
          },
        },
        required: true,
      },
    },
    responses: json(TransliterationSchema, 'Bangla text'),
  }),
  (c) => ok(c, transliterate(c.req.valid('json').text), AVRO),
);

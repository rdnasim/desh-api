import { createRoute, OpenAPIHono, type z } from '@hono/zod-openapi';
import type { AppEnv } from '../../env';
import { cachePublic, noStore } from '../../lib/cache';
import { ErrorSchema, envelope, metaFor, ok } from '../../lib/envelope';
import { ApiError, validationHook } from '../../lib/errors';
import {
  NormalizeRequestSchema,
  NormalizeResponseSchema,
  StemItemResultSchema,
  StemRequestSchema,
  StemResponseSchema,
  StopwordRemoveRequestSchema,
  StopwordRemoveResponseSchema,
  StopwordsQuerySchema,
  StopwordsResponseSchema,
  TokenizeRequestSchema,
  TokenizeResponseSchema,
} from './schemas';
import {
  listStopwords,
  normalizeBangla,
  removeStopwords,
  stemWord,
  stemWords,
  tokenizeText,
} from './service';

const tags = ['Bangla NLP'];
const metaStopwords = () => metaFor(['nlp.stopwords']);
const metaSuffixes = () => metaFor(['nlp.suffixes']);

const responses = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  200: { description, content: { 'application/json': { schema: envelope(schema) } } },
  400: {
    description: 'Invalid parameter or missing body',
    content: { 'application/json': { schema: ErrorSchema } },
  },
});

export const nlpRoutes = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

nlpRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/nlp/stopwords',
    tags,
    summary: 'List canonical Bangla stopwords',
    description:
      'Curated corpus of 500+ high-frequency Bengali functional stopwords categorized by part-of-speech (conjunctions, pronouns, adverbs, postpositions, auxiliaries).',
    request: {
      query: StopwordsQuerySchema,
    },
    responses: responses(StopwordsResponseSchema, 'List of Bangla stopwords'),
  }),
  (c) => {
    const query = c.req.valid('query');
    const result = listStopwords({
      category: query.category,
      limit: query.limit,
      offset: query.offset,
    });
    cachePublic(c);
    return ok(c, result, metaStopwords());
  },
);

nlpRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/nlp/stopwords/remove',
    tags,
    summary: 'Remove Bangla stopwords from text',
    description:
      'Tokenizes input text, filters out canonical Bengali functional stopwords, and returns clean text alongside the inventory of removed tokens.',
    request: {
      body: {
        content: {
          'application/json': { schema: StopwordRemoveRequestSchema },
        },
        required: true,
      },
    },
    responses: responses(StopwordRemoveResponseSchema, 'Text with stopwords removed'),
  }),
  (c) => {
    const body = c.req.valid('json');
    if (!body?.text || body.text.trim().length === 0) {
      throw new ApiError('invalid_parameter', 'text must not be empty');
    }
    const result = removeStopwords(body.text);
    noStore(c);
    return ok(c, result, metaStopwords());
  },
);

nlpRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/nlp/normalize',
    tags,
    summary: 'Normalize Bangla Unicode text',
    description:
      'Normalizes Bengali text to canonical Unicode NFC representation, cleans redundant zero-width joiners/non-joiners, composite nukta glyphs (ড়, ঢ়, য়), and normalizes spacing.',
    request: {
      body: {
        content: {
          'application/json': { schema: NormalizeRequestSchema },
        },
        required: true,
      },
    },
    responses: responses(NormalizeResponseSchema, 'Normalized Bengali text'),
  }),
  (c) => {
    const body = c.req.valid('json');
    if (!body?.text || body.text.trim().length === 0) {
      throw new ApiError('invalid_parameter', 'text must not be empty');
    }
    const result = normalizeBangla(body.text, { strip_zw: body.strip_zw });
    noStore(c);
    return ok(c, result, metaStopwords());
  },
);

nlpRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/nlp/tokenize',
    tags,
    summary: 'Tokenize Bangla text into words or sentences',
    description:
      'Linguistically splits Bengali text into sentence tokens (delimited by Dari "।", Double Dari "॥", "?", "!", and line breaks) or word tokens respecting conjunctive ligatures.',
    request: {
      body: {
        content: {
          'application/json': { schema: TokenizeRequestSchema },
        },
        required: true,
      },
    },
    responses: responses(TokenizeResponseSchema, 'Tokenized text array'),
  }),
  (c) => {
    const body = c.req.valid('json');
    if (!body?.text || body.text.trim().length === 0) {
      throw new ApiError('invalid_parameter', 'text must not be empty');
    }
    const result = tokenizeText(body.text, body.mode ?? 'word');
    noStore(c);
    return ok(c, result, metaStopwords());
  },
);

nlpRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/nlp/stem',
    tags,
    summary: 'Rule-based Bangla affix-stripping stemmer',
    description:
      'Deterministic rule-based stemmer that strips common nominal case markers (-দেরকে, -গুলোকে, -য়ের), plural suffixes (-গুলো, -গণ, -সমূহ), and verbal inflections (-ছিলেন, -ছেন, -লেন).',
    request: {
      body: {
        content: {
          'application/json': { schema: StemRequestSchema },
        },
        required: true,
      },
    },
    responses: responses(StemResponseSchema, 'Stemmed word or word list'),
  }),
  (c) => {
    const body = c.req.valid('json');
    if (!body.word && (!body.words || body.words.length === 0)) {
      throw new ApiError('invalid_parameter', 'Either word or words must be provided');
    }

    noStore(c);
    if (body.words && body.words.length > 0) {
      const results = stemWords(body.words);
      return ok(c, { results }, metaSuffixes());
    }

    const single = stemWord(body.word!);
    return ok(c, single, metaSuffixes());
  },
);

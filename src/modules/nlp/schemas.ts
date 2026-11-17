import { z } from '@hono/zod-openapi';

export const StopwordCategorySchema = z
  .enum([
    'conjunction',
    'pronoun',
    'determiner',
    'interrogative',
    'quantifier',
    'postposition',
    'preposition',
    'adverb',
    'verb',
    'negative',
    'particle',
    'classifier',
    'general',
  ])
  .openapi('StopwordCategory');

export const StopwordSchema = z
  .object({
    word: z.string().min(1).openapi({ example: 'এবং' }),
    category: z.string().openapi({ example: 'conjunction' }),
  })
  .openapi('Stopword');

export type Stopword = z.infer<typeof StopwordSchema>;

export const SuffixTypeSchema = z
  .enum(['case_marker', 'plural', 'verbal', 'adverbial', 'general'])
  .openapi('SuffixType');

export const BanglaSuffixSchema = z
  .object({
    suffix: z.string().min(1).openapi({ example: 'গুলোতে' }),
    type: SuffixTypeSchema,
    priority: z.number().int().openapi({ example: 10 }),
    description: z.string().openapi({ example: 'Plural locative marker' }),
  })
  .openapi('BanglaSuffix');

export type BanglaSuffix = z.infer<typeof BanglaSuffixSchema>;

export const StopwordsQuerySchema = z.object({
  category: z.string().optional().openapi({
    param: { name: 'category', in: 'query' },
    example: 'conjunction',
    description: 'Filter stopwords by grammatical category',
  }),
  limit: z.coerce.number().int().positive().max(1000).optional().openapi({
    param: { name: 'limit', in: 'query' },
    example: 100,
  }),
  offset: z.coerce.number().int().nonnegative().optional().openapi({
    param: { name: 'offset', in: 'query' },
    example: 0,
  }),
});

export const StopwordsResponseSchema = z
  .object({
    count: z.number().int().openapi({ example: 550 }),
    categories: z.array(z.string()).openapi({ example: ['conjunction', 'pronoun', 'postposition'] }),
    words: z.array(z.string()).openapi({ example: ['এবং', 'কিন্তু', 'বা', 'সুতরাং'] }),
  })
  .openapi('StopwordsResponse', {
    example: {
      count: 4,
      categories: ['conjunction', 'pronoun'],
      words: ['এবং', 'কিন্তু', 'বা', 'সুতরাং'],
    },
  });

export const StopwordRemoveRequestSchema = z
  .object({
    text: z.string().min(1).max(50000).openapi({
      example: 'আমি এবং আমার ভাই গতকাল স্কুলে গিয়েছিলাম কিন্তু সেখানে কেউ ছিল না।',
      description: 'Bengali input text from which to strip stopwords',
    }),
  })
  .openapi('StopwordRemoveRequest');

export const StopwordRemoveResponseSchema = z
  .object({
    original: z.string().openapi({
      example: 'আমি এবং আমার ভাই গতকাল স্কুলে গিয়েছিলাম কিন্তু সেখানে কেউ ছিল না।',
    }),
    cleaned: z.string().openapi({
      example: 'ভাই স্কুলে গিয়েছিলাম কেউ।',
    }),
    removed_count: z.number().int().openapi({ example: 6 }),
    removed_words: z.array(z.string()).openapi({
      example: ['আমি', 'এবং', 'আমার', 'গতকাল', 'কিন্তু', 'সেখানে', 'ছিল', 'না'],
    }),
  })
  .openapi('StopwordRemoveResponse', {
    example: {
      original: 'আমি এবং আমার ভাই গতকাল স্কুলে গিয়েছিলাম কিন্তু সেখানে কেউ ছিল না।',
      cleaned: 'ভাই স্কুলে গিয়েছিলাম কেউ।',
      removed_count: 6,
      removed_words: ['আমি', 'এবং', 'আমার', 'গতকাল', 'কিন্তু', 'সেখানে'],
    },
  });

export const NormalizeRequestSchema = z
  .object({
    text: z.string().min(1).max(50000).openapi({
      example: 'বাংলা‌দেশ একটি সুন্দর দেশ।',
      description: 'Bengali input text to normalize',
    }),
    strip_zw: z.boolean().optional().default(true).openapi({
      example: true,
      description: 'Strip redundant zero-width joiners and non-joiners',
    }),
  })
  .openapi('NormalizeRequest');

export const NormalizeResponseSchema = z
  .object({
    original: z.string().openapi({ example: 'বাংলা‌দেশ একটি সুন্দর দেশ।' }),
    normalized: z.string().openapi({ example: 'বাংলাদেশ একটি সুন্দর দেশ।' }),
    changes_detected: z.boolean().openapi({ example: true }),
  })
  .openapi('NormalizeResponse', {
    example: {
      original: 'বাংলা‌দেশ একটি সুন্দর দেশ।',
      normalized: 'বাংলাদেশ একটি সুন্দর দেশ।',
      changes_detected: true,
    },
  });

export const TokenizeRequestSchema = z
  .object({
    text: z.string().min(1).max(50000).openapi({
      example: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি!',
      description: 'Bengali input text to tokenize',
    }),
    mode: z.enum(['word', 'sentence']).optional().default('word').openapi({
      example: 'sentence',
      description: 'Tokenization mode: "word" splits on word boundaries, "sentence" splits on Bengali sentence terminals (।, ?, !)',
    }),
  })
  .openapi('TokenizeRequest');

export const TokenizeResponseSchema = z
  .object({
    mode: z.enum(['word', 'sentence']).openapi({ example: 'sentence' }),
    count: z.number().int().openapi({ example: 2 }),
    tokens: z.array(z.string()).openapi({
      example: [
        'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি',
        'চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি',
      ],
    }),
  })
  .openapi('TokenizeResponse', {
    example: {
      mode: 'sentence',
      count: 2,
      tokens: [
        'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি',
        'চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি',
      ],
    },
  });

export const StemItemResultSchema = z
  .object({
    input: z.string().openapi({ example: 'ছাত্রদেরকে' }),
    stem: z.string().openapi({ example: 'ছাত্র' }),
    suffix: z.string().optional().openapi({ example: 'দেরকে' }),
    rule_applied: z.string().optional().openapi({ example: 'Plural personal accusative marker' }),
  })
  .openapi('StemItemResult');

export const StemRequestSchema = z
  .object({
    word: z.string().min(1).optional().openapi({
      example: 'ছাত্রদেরকে',
      description: 'Single Bengali word to stem',
    }),
    words: z.array(z.string().min(1)).max(100).optional().openapi({
      example: ['ছাত্রদেরকে', 'বইগুলো', 'স্বাভাবিকভাবে'],
      description: 'Array of Bengali words to stem in bulk (max 100)',
    }),
  })
  .refine((data) => data.word !== undefined || (data.words !== undefined && data.words.length > 0), {
    message: 'Either "word" or non-empty "words" array must be provided',
  })
  .openapi('StemRequest');

export const StemResponseSchema = z
  .object({
    input: z.string().optional().openapi({ example: 'ছাত্রদেরকে' }),
    stem: z.string().optional().openapi({ example: 'ছাত্র' }),
    suffix: z.string().optional().openapi({ example: 'দেরকে' }),
    rule_applied: z.string().optional().openapi({ example: 'Plural personal accusative marker' }),
    results: z.array(StemItemResultSchema).optional(),
  })
  .openapi('StemResponse', {
    example: {
      input: 'ছাত্রদেরকে',
      stem: 'ছাত্র',
      suffix: 'দেরকে',
      rule_applied: 'Plural personal accusative marker',
    },
  });

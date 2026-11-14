import { z } from '@hono/zod-openapi';

const NameBoth = z.object({ name_bn: z.string(), name_en: z.string() });

export const NumberWordsSchema = z
  .object({ input: z.number(), words: z.string() })
  .openapi('NumberWords', { example: { input: 1250, words: 'এক হাজার দুইশত পঞ্চাশ' } });

export const TakaWordsSchema = z
  .object({ input: z.number(), words: z.string(), taka: z.number().int(), paisa: z.number().int() })
  .openapi('TakaWords', {
    example: { input: 1250.5, words: 'এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা', taka: 1250, paisa: 50 },
  });

export const DigitsSchema = z
  .object({ input: z.string(), output: z.string() })
  .openapi('Digits', { example: { input: '2026', output: '২০২৬' } });

export const FormattedNumberSchema = z
  .object({ input: z.number(), formatted: z.string() })
  .openapi('FormattedNumber', { example: { input: 1250000, formatted: '১২,৫০,০০০' } });

export const BanglaDateSchema = z
  .object({
    gregorian: z.string(),
    day: z.number().int(),
    day_bn: z.string(),
    month: NameBoth.extend({ index: z.number().int() }),
    year: z.number().int(),
    year_bn: z.string(),
    weekday: NameBoth,
    season: NameBoth,
    formatted_bn: z.string(),
  })
  .openapi('BanglaDate', {
    example: {
      gregorian: '2026-12-16',
      day: 1,
      day_bn: '১',
      month: { index: 9, name_bn: 'পৌষ', name_en: 'Poush' },
      year: 1433,
      year_bn: '১৪৩৩',
      weekday: { name_bn: 'বুধবার', name_en: 'Wednesday' },
      season: { name_bn: 'শীত', name_en: 'Sheet (winter)' },
      formatted_bn: '১ পৌষ ১৪৩৩ বঙ্গাব্দ',
    },
  });

export const OrdinalSchema = z
  .object({ input: z.number().int(), ordinal: z.string(), short: z.string() })
  .openapi('Ordinal', { example: { input: 3, ordinal: 'তৃতীয়', short: '৩য়' } });

export const SlugResultSchema = z
  .object({ input: z.string(), slug: z.string() })
  .openapi('SlugResult', { example: { input: 'আমার সোনার বাংলা', slug: 'amar-sonar-bangla' } });

export const TransliterationSchema = z
  .object({ input: z.string(), output: z.string(), scheme: z.literal('avro-phonetic') })
  .openapi('Transliteration', {
    example: { input: 'ami bhalo achi', output: 'আমি ভালো আছি', scheme: 'avro-phonetic' },
  });

export const TEXT_MAX = 1000;
export const POST_TEXT_MAX = 10_240;

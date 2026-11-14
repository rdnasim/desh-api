import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

const Source = z.string().min(1);

export const ProverbSchema = z
  .object({
    id: z.string().regex(/^proverb-\d{4}$/),
    text_bn: NameBnSchema.max(200),
    meaning_bn: z.string().min(1),
    meaning_en: z.string().min(1),
    source: Source,
  })
  .openapi('Proverb', {
    example: {
      id: 'proverb-0001',
      text_bn: 'অতি লোভে তাঁতি নষ্ট',
      meaning_bn: 'বেশি লোভ করলে ক্ষতি হয়।',
      meaning_en: 'Excessive greed leads to ruin.',
      source: 'Traditional (public domain)',
    },
  });

export const RiddleSchema = z
  .object({
    id: z.string().regex(/^riddle-\d{4}$/),
    question_bn: z.string().min(1),
    answer_bn: z.string().min(1),
    answer_en: z.string().optional(),
    source: Source,
  })
  .openapi('Riddle', {
    example: {
      id: 'riddle-0001',
      question_bn: 'বন থেকে বেরোল টিয়ে, সোনার টোপর মাথায় দিয়ে।',
      answer_bn: 'আনারস',
      answer_en: 'Pineapple',
      source: 'Traditional (public domain)',
    },
  });

export const QuizTopicSchema = z.enum(['liberation-war', 'geography', 'culture', 'history']);

export const QuizQuestionSchema = z
  .object({
    id: z.string().regex(/^quiz-\d{4}$/),
    topic: QuizTopicSchema,
    question_bn: z.string().min(1),
    question_en: z.string().min(1),
    options: z
      .array(z.object({ bn: z.string().min(1), en: z.string().min(1) }))
      .min(2)
      .max(5),
    answer_index: z.number().int().min(0),
    source: z.string().url(),
  })
  .refine((q) => q.answer_index < q.options.length, 'answer_index must point at an option')
  .openapi('QuizQuestion', {
    example: {
      id: 'quiz-0001',
      topic: 'culture',
      question_bn: 'বাংলাদেশের জাতীয় ফুল কোনটি?',
      question_en: 'What is the national flower of Bangladesh?',
      options: [
        { bn: 'শাপলা', en: 'Water lily' },
        { bn: 'গোলাপ', en: 'Rose' },
        { bn: 'জবা', en: 'Hibiscus' },
      ],
      answer_index: 0,
      source: 'https://en.wikipedia.org/wiki/National_symbols_of_Bangladesh',
    },
  });

export const DishSchema = z
  .object({
    slug: SlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema,
    district: SlugSchema.optional().openapi({ description: 'Absent for national GI products' }),
    gi_application: z
      .string()
      .optional()
      .openapi({ description: 'GI application number as printed by DPDT' }),
    description_en: z.string().min(1),
    description_bn: z.string().min(1),
    source: z.string().url(),
  })
  .openapi('Dish', {
    example: {
      slug: 'bogura-doi',
      name_en: 'Curd (doi) of Bogura',
      name_bn: 'বগুড়ার দই',
      district: 'bogura',
      gi_application: 'জি আই-২৯',
      description_en: 'Registered Geographical Indication (GI) product of Bangladesh.',
      description_bn: 'বাংলাদেশের নিবন্ধিত ভৌগোলিক নির্দেশক (জিআই) পণ্য।',
      source: 'https://dpdt.gov.bd/pages/static-pages/6922dff0933eb65569e24bcf',
    },
  });

export const HistoryEventSchema = z
  .object({
    id: z.string().regex(/^history-\d{4}$/),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    year: z.number().int().min(1000).max(2100),
    title_en: z.string().min(1),
    title_bn: z.string().min(1),
    source: z.string().url(),
  })
  .openapi('HistoryEvent', {
    example: {
      id: 'history-0001',
      month: 2,
      day: 21,
      year: 1952,
      title_en: 'Students are shot by police during the Bengali Language Movement in Dhaka.',
      title_bn: 'ঢাকায় ভাষা আন্দোলনে পুলিশের গুলিতে ছাত্ররা শহীদ হন।',
      source: 'https://en.wikipedia.org/wiki/Bengali_language_movement',
    },
  });

export const QuizTopicInfoSchema = z
  .object({
    slug: QuizTopicSchema,
    name_en: z.string(),
    name_bn: z.string(),
    count: z.number().int(),
  })
  .openapi('QuizTopic', {
    example: { slug: 'culture', name_en: 'Culture', name_bn: 'সংস্কৃতি', count: 10 },
  });

export const TOPIC_NAMES: Record<
  z.infer<typeof QuizTopicSchema>,
  { name_en: string; name_bn: string }
> = {
  'liberation-war': { name_en: 'Liberation War', name_bn: 'মুক্তিযুদ্ধ' },
  geography: { name_en: 'Geography', name_bn: 'ভূগোল' },
  culture: { name_en: 'Culture', name_bn: 'সংস্কৃতি' },
  history: { name_en: 'History', name_bn: 'ইতিহাস' },
};

export type Proverb = z.infer<typeof ProverbSchema>;
export type Riddle = z.infer<typeof RiddleSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizTopic = z.infer<typeof QuizTopicSchema>;
export type Dish = z.infer<typeof DishSchema>;
export type HistoryEvent = z.infer<typeof HistoryEventSchema>;

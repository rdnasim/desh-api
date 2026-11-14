import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CalendarSchema = z.enum(['general', 'bank']);
export const HolidayTypeSchema = z.enum(['general', 'executive-order', 'optional', 'bank']);
export const CommunitySchema = z.enum([
  'muslim',
  'hindu',
  'christian',
  'buddhist',
  'ethnic-minority',
]);

export const SourceDocSchema = z.object({
  ref: z.string().min(1),
  date: IsoDate,
  url: z.string().url(),
  title_bn: z.string().optional(),
});

export const HolidayYearSchema = z
  .object({
    year: z.number().int().min(2000).max(2100),
    calendar: CalendarSchema,
    documents: z.array(SourceDocSchema).min(1),
  })
  .openapi('HolidayYear', {
    example: {
      year: 2027,
      calendar: 'general',
      documents: [
        {
          ref: 'MoPA notification 05.00.0000.175.08.0008.25-105 (5 Nov 2026)',
          date: '2026-11-05',
          url: 'https://mopa.gov.bd/pages/go-ultimates/6aec1a0f47e3ef92265ec740',
        },
      ],
    },
  });

export const HolidaySchema = z
  .object({
    id: z.string().regex(/^\d{4}-(general|bank)-[a-z0-9]+(-[a-z0-9]+)*$/),
    year: z.number().int().min(2000).max(2100),
    calendar: CalendarSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema.optional().openapi({
      description: 'Absent when the source document is English-only',
    }),
    type: HolidayTypeSchema,
    community: CommunitySchema.optional(),
    districts: z.array(SlugSchema).min(1).optional().openapi({
      description: 'When present, the holiday applies only in these districts',
    }),
    dates: z.array(IsoDate).min(1),
    tentative: z.boolean(),
    source: z.string().min(1).openapi({ description: '`ref` of the official document' }),
    amended_by: z
      .string()
      .optional()
      .openapi({ description: '`ref` of the document that changed it' }),
  })
  .refine((h) => (h.type === 'optional') === (h.community !== undefined), {
    message: 'community is required for optional holidays and only for them',
  })
  .refine((h) => h.dates.every((d) => d.startsWith(`${h.year}-`)), {
    message: 'dates must fall in year',
  })
  .refine((h) => h.dates.every((d, i) => i === 0 || (h.dates[i - 1] as string) < d), {
    message: 'dates must be sorted and unique',
  })
  .refine((h) => h.id.startsWith(`${h.year}-${h.calendar}-`), {
    message: 'id must start with year-calendar-',
  })
  .openapi('Holiday');

export type Calendar = z.infer<typeof CalendarSchema>;
export type Holiday = z.infer<typeof HolidaySchema>;
export type HolidayYear = z.infer<typeof HolidayYearSchema>;

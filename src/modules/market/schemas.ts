import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, SlugSchema } from '../../lib/schemas';

export const CommodityCategorySchema = z.enum([
  'rice',
  'flour',
  'edible-oil',
  'pulses',
  'spices',
  'fish-meat',
  'milk-powder',
  'misc',
]);

export const CommoditySchema = z
  .object({
    slug: SlugSchema,
    name_en: NameEnSchema,
    name_bn: NameBnSchema.openapi({ description: 'Exactly as TCB writes it' }),
    unit_en: z.string().min(1),
    unit_bn: z.string().min(1),
    category: CommodityCategorySchema,
  })
  .openapi('Commodity');

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const FuelMonthSchema = z
  .object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    effective_from: IsoDate,
    prices: z.object({
      diesel: z.number().positive(),
      octane: z.number().positive(),
      petrol: z.number().positive(),
      kerosene: z.number().positive(),
    }),
    source: z.object({ ref: z.string().min(1), date: IsoDate, url: z.string().url() }),
  })
  .openapi('FuelPrices', {
    example: {
      month: '2026-11',
      effective_from: '2026-11-01',
      prices: { diesel: 135, octane: 165, petrol: 160, kerosene: 155 },
      source: {
        ref: 'Energy and Mineral Resources Division memo 28.00.0000.000.026.35.0116.24.499 (29 Oct 2026)',
        date: '2026-10-29',
        url: 'https://bpc.gov.bd/',
      },
    },
  });

const Range = z.object({ min: z.number().nonnegative(), max: z.number().nonnegative() }).nullable();

export const MarketItemSchema = z.object({
  slug: SlugSchema.optional().openapi({ description: 'Absent for an item not yet in our catalog' }),
  name_en: z.string().optional(),
  name_bn: z.string(),
  unit_en: z.string().optional(),
  unit_bn: z.string(),
  category: CommodityCategorySchema.optional(),
  price: Range.openapi({ description: 'Today, Tk; null when TCB lists 0–0 (not available)' }),
  week_ago: Range,
  month_ago: Range,
  year_ago: Range,
  change_month_pct: z.number().nullable(),
  change_year_pct: z.number().nullable(),
});

export const MarketPricesSchema = z
  .object({
    date: IsoDate,
    market: z.literal('dhaka'),
    serial: z.number().int().optional(),
    reference: z.string().optional(),
    file_url: z.string().url(),
    fetched_at: z.string(),
    freshness: z.enum(['live', 'last_known']),
    items: z.array(MarketItemSchema),
  })
  .openapi('MarketPrices', {
    example: {
      date: '2026-11-12',
      market: 'dhaka',
      serial: 282,
      reference: 'নং-২৬.০৫.০০০০.০১৭.৩১.০১.২৬-৯১০',
      file_url: 'https://tcb.gov.bd/pages/daily-rmps',
      fetched_at: '2026-11-15T06:00:00.000Z',
      freshness: 'live',
      items: [
        {
          slug: 'rice-coarse',
          name_en: 'Coarse rice (swarna/China IRRI)',
          name_bn: 'চাল (মোটা)/স্বর্ণা/চায়না ইরি',
          unit_en: 'per kg',
          unit_bn: 'প্রতি কেজি',
          category: 'rice',
          price: { min: 50, max: 58 },
          week_ago: { min: 50, max: 55 },
          month_ago: { min: 50, max: 55 },
          year_ago: { min: 54, max: 60 },
          change_month_pct: 2.86,
          change_year_pct: -5.26,
        },
      ],
    },
  });

export type Commodity = z.infer<typeof CommoditySchema>;
export type FuelMonth = z.infer<typeof FuelMonthSchema>;
export type MarketItem = z.infer<typeof MarketItemSchema>;
export type MarketPrices = z.infer<typeof MarketPricesSchema>;

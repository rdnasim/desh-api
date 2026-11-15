import { z } from '@hono/zod-openapi';

export const KaratSchema = z.enum(['22k', '21k', '18k', 'traditional']);
export const MetalSchema = z.enum(['gold', 'silver']);

const Price = z.object({
  per_gram: z.number().positive(),
  per_vori: z
    .number()
    .positive()
    .openapi({ description: 'Per gram × 11.664, rounded to the taka' }),
});
const Table = z.object({ '22k': Price, '21k': Price, '18k': Price, traditional: Price });

export const GoldPricesSchema = z
  .object({
    effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    currency: z.literal('BDT'),
    gold: Table,
    silver: Table,
    source_url: z.string().url(),
  })
  .openapi('GoldPrices', {
    example: {
      effective_date: '2026-11-14',
      currency: 'BDT',
      gold: {
        '22k': { per_gram: 18655, per_vori: 217592 },
        '21k': { per_gram: 17815, per_vori: 207794 },
        '18k': { per_gram: 15300, per_vori: 178459 },
        traditional: { per_gram: 12500, per_vori: 145800 },
      },
      silver: {
        '22k': { per_gram: 300, per_vori: 3499 },
        '21k': { per_gram: 290, per_vori: 3383 },
        '18k': { per_gram: 250, per_vori: 2916 },
        traditional: { per_gram: 190, per_vori: 2216 },
      },
      source_url: 'https://www.bajus.org/gold-price',
    },
  });

export const ZakatSchema = z
  .object({
    wealth: z.number().nonnegative(),
    basis: MetalSchema,
    karat: KaratSchema,
    price_per_gram: z.number().positive(),
    nisab_grams: z.number().positive(),
    nisab_value: z.number().positive(),
    due: z.boolean(),
    rate: z.literal(2.5),
    zakat: z.number().nonnegative(),
    other_basis: z.object({ basis: MetalSchema, nisab_value: z.number(), due: z.boolean() }),
    prices_effective_date: z.string(),
  })
  .openapi('Zakat', {
    example: {
      wealth: 1000000,
      basis: 'silver',
      karat: '22k',
      price_per_gram: 300,
      nisab_grams: 612.36,
      nisab_value: 183708,
      due: true,
      rate: 2.5,
      zakat: 25000,
      other_basis: { basis: 'gold', nisab_value: 1631939.4, due: false },
      prices_effective_date: '2026-11-14',
    },
  });

export type Karat = z.infer<typeof KaratSchema>;
export type Metal = z.infer<typeof MetalSchema>;
export type GoldPrices = z.infer<typeof GoldPricesSchema>;

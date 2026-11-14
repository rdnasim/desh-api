import { z } from '@hono/zod-openapi';

export const BijoyKindSchema = z.enum([
  'consonant',
  'conjunct',
  'vowel',
  'half',
  'phala',
  'hasanta',
  'reph',
  'vowel_sign',
  'pre_base_sign',
  'sign',
  'digit',
  'punct',
]);

export const BijoyMapEntrySchema = z.object({
  bijoy: z.string().min(1).max(3),
  unicode: z
    .string()
    .min(1)
    .refine((s) => s === s.normalize('NFC'), 'must be NFC-normalised'),
  kind: BijoyKindSchema,
  /** When several Bijoy forms map to the same Unicode, exactly one is used for Unicode → Bijoy. */
  preferred_reverse: z.boolean().optional(),
});

export const ConversionSchema = z
  .object({ input_length: z.number().int(), output: z.string() })
  .openapi('Conversion', { example: { input_length: 18, output: 'আমার সোনার বাংলা' } });

export const ConvertBodySchema = z
  .object({ text: z.string().min(1) })
  .openapi('ConvertRequest', { example: { text: 'Avgvi †mvbvi evsjv' } });

export type BijoyKind = z.infer<typeof BijoyKindSchema>;
export type BijoyMapEntry = z.infer<typeof BijoyMapEntrySchema>;

export const MAX_BODY_BYTES = 100 * 1024;

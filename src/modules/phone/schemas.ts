import { z } from '@hono/zod-openapi';
import { NameBnSchema, NameEnSchema, RefSchema, SlugSchema } from '../../lib/schemas';

export const OperatorPrefixSchema = z.object({
  prefix: z.string().regex(/^01[3-9]$/),
  operator_slug: SlugSchema,
  operator_en: NameEnSchema,
  operator_bn: NameBnSchema,
});

export const PhoneReasonSchema = z.enum(['invalid_chars', 'invalid_length', 'invalid_prefix']);

export const PhoneResultSchema = z
  .object({
    input: z.string(),
    valid: z.boolean(),
    reason: PhoneReasonSchema.optional(),
    normalized: z.string().optional().openapi({ description: 'Local 11-digit form' }),
    international: z.string().optional().openapi({ description: 'E.164 form' }),
    operator: RefSchema.optional().openapi({ description: 'Original operator for the prefix' }),
    portability_notice: z.string(),
  })
  .openapi('PhoneResult', {
    example: {
      input: '+8801712345678',
      valid: true,
      normalized: '01712345678',
      international: '+8801712345678',
      operator: { slug: 'grameenphone', name_en: 'Grameenphone', name_bn: 'গ্রামীণফোন' },
      portability_notice:
        'Operator reflects the original prefix allocation; the number may have been ported.',
    },
  });

export type OperatorPrefix = z.infer<typeof OperatorPrefixSchema>;
export type PhoneReason = z.infer<typeof PhoneReasonSchema>;
export type PhoneResult = z.infer<typeof PhoneResultSchema>;

export const BULK_MAX = 100;

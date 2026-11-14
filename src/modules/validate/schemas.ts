import { z } from '@hono/zod-openapi';
import { NameBnSchema, SlugSchema } from '../../lib/schemas';

export const ValidationTypeSchema = z.enum(['nid', 'vehicle', 'tin', 'bin', 'postcode']);

export const ValidationReasonSchema = z.enum([
  'invalid_chars',
  'invalid_length',
  'invalid_birth_year',
  'invalid_format',
  'unknown_area',
  'unknown_class',
]);

export const ValidationResultSchema = z
  .object({
    type: ValidationTypeSchema,
    valid: z.boolean(),
    reason: ValidationReasonSchema.optional(),
    normalized: z.string().optional(),
    details: z
      .record(z.string(), z.unknown())
      .optional()
      .openapi({ description: 'Type-specific parsed parts' }),
  })
  .openapi('ValidationResult', {
    example: {
      type: 'vehicle',
      valid: true,
      normalized: 'ঢাকা মেট্রো-গ ১১-২২৩৩',
      details: {
        area: { slug: 'dhaka', name_en: 'Dhaka', name_bn: 'ঢাকা' },
        metro: true,
        class: 'গ',
        series: 11,
        number: 2233,
      },
    },
  });

export const VehicleAreaAliasSchema = z.object({
  alias_bn: NameBnSchema,
  alias_en: z.string().min(1),
  district: SlugSchema,
});

export type ValidationType = z.infer<typeof ValidationTypeSchema>;
export type ValidationReason = z.infer<typeof ValidationReasonSchema>;
export type VehicleAreaAlias = z.infer<typeof VehicleAreaAliasSchema>;

export interface ValidationResult<D = Record<string, unknown>> {
  type: ValidationType;
  valid: boolean;
  reason?: ValidationReason;
  normalized?: string;
  details?: D;
}

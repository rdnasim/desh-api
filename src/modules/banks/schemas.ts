import { z } from '@hono/zod-openapi';
import { NameEnSchema, RefSchema, SlugSchema } from '../../lib/schemas';

export const RoutingNumberSchema = z
  .string()
  .regex(/^\d{9}$/)
  .openapi({ description: '9 digits: bank (3), district (2), branch (3), check digit (1)' });

export const BankSchema = z
  .object({
    slug: SlugSchema,
    name_en: NameEnSchema.openapi({ description: 'As written in the Bangladesh Bank list' }),
    bb_id: z.number().int().positive().openapi({ description: 'Bangladesh Bank bank ID' }),
    routing_code: z
      .string()
      .regex(/^\d{3}$/)
      .optional()
      .openapi({ description: 'First 3 digits of its routing numbers, when known' }),
  })
  .openapi('Bank');

export const BranchSchema = z
  .object({
    id: z
      .string()
      .regex(/^\d{6,7}$/)
      .openapi({ description: 'Bangladesh Bank branch ID' }),
    bank: SlugSchema,
    name_en: NameEnSchema.openapi({ description: 'As written in the Bangladesh Bank list' }),
    district: SlugSchema,
    thana: z.string().openapi({ description: 'Thana as written by Bangladesh Bank' }),
    upazila: SlugSchema.optional().openapi({
      description: 'Upazila slug, when the thana is an upazila in the geo data',
    }),
    routing_number: RoutingNumberSchema.optional(),
  })
  .openapi('Branch');

export const BankOutSchema = BankSchema.extend({
  branch_count: z.number().int(),
  branches_with_routing: z.number().int(),
}).openapi('BankWithCounts', {
  example: {
    slug: 'sonali-bank',
    name_en: 'SONALI BANK PLC.',
    bb_id: 15,
    routing_code: '200',
    branch_count: 1239,
    branches_with_routing: 1081,
  },
});

export const BranchOutSchema = BranchSchema.omit({ bank: true, district: true, upazila: true })
  .extend({
    bank: z.object({ slug: SlugSchema, name_en: z.string(), bb_id: z.number().int() }),
    district: RefSchema,
    division: RefSchema,
    upazila: RefSchema.optional(),
  })
  .openapi('BranchDetail', {
    example: {
      id: '110003',
      name_en: 'KACHUA BAZAR',
      thana: 'KACHUA',
      routing_number: '010130065',
      bank: { slug: 'agrani-bank', name_en: 'AGRANI BANK PLC.', bb_id: 11 },
      district: { slug: 'chandpur', name_en: 'Chandpur', name_bn: 'চাঁদপুর' },
      division: { slug: 'chattogram', name_en: 'Chattogram', name_bn: 'চট্টগ্রাম' },
      upazila: { slug: 'kachua-chandpur', name_en: 'Kachua', name_bn: 'কচুয়া' },
    },
  });

export type Bank = z.infer<typeof BankSchema>;
export type Branch = z.infer<typeof BranchSchema>;

import { z } from '@hono/zod-openapi';

export const MfsFeeRateSchema = z
  .object({
    rate_percent: z.number().openapi({ example: 1.75 }),
    per_thousand: z.number().openapi({ example: 17.5 }),
    vat_included: z.boolean().openapi({ example: true }),
    notes_en: z.string().optional(),
    notes_bn: z.string().optional(),
  })
  .openapi('MfsFeeRate');

export const MfsSendMoneyFeeSchema = z
  .object({
    fee_fixed: z.number().openapi({ example: 5 }),
    free_conditions_en: z.string().optional(),
    free_conditions_bn: z.string().optional(),
    notes_en: z.string().optional(),
    notes_bn: z.string().optional(),
  })
  .openapi('MfsSendMoneyFee');

export const MfsCashOutChargesSchema = z
  .object({
    app: MfsFeeRateSchema,
    ussd: MfsFeeRateSchema,
    atm: MfsFeeRateSchema.optional(),
    special: MfsFeeRateSchema.optional(),
  })
  .openapi('MfsCashOutCharges');

export const MfsSendMoneyChargesSchema = z
  .object({
    app: MfsSendMoneyFeeSchema,
    ussd: MfsSendMoneyFeeSchema,
  })
  .openapi('MfsSendMoneyCharges');

export const MfsChargesSchema = z
  .object({
    cash_out: MfsCashOutChargesSchema,
    send_money: MfsSendMoneyChargesSchema,
  })
  .openapi('MfsCharges');

export const MfsLimitsSchema = z
  .object({
    cash_out_max_per_txn: z.number().openapi({ example: 25000 }),
    cash_out_daily_max: z.number().openapi({ example: 25000 }),
    send_money_max_per_txn: z.number().openapi({ example: 25000 }),
  })
  .openapi('MfsLimits');

export const MfsProviderSchema = z
  .object({
    slug: z.string().openapi({ example: 'bkash' }),
    name_en: z.string().openapi({ example: 'bKash' }),
    name_bn: z.string().openapi({ example: 'বিকাশ' }),
    parent_en: z.string().openapi({ example: 'BRAC Bank PLC' }),
    parent_bn: z.string().openapi({ example: 'ব্র্যাক ব্যাংক পিএলসি' }),
    ussd_code: z.string().openapi({ example: '*247#' }),
    helpline: z.string().openapi({ example: '16247' }),
    website: z.string().url().openapi({ example: 'https://www.bkash.com' }),
    charges: MfsChargesSchema,
    limits: MfsLimitsSchema,
    last_verified: z.string().openapi({ example: '2026-11-16' }),
    source_url: z.string().url(),
  })
  .openapi('MfsProvider', {
    example: {
      slug: 'bkash',
      name_en: 'bKash',
      name_bn: 'বিকাশ',
      parent_en: 'BRAC Bank PLC',
      parent_bn: 'ব্র্যাক ব্যাংক পিএলসি',
      ussd_code: '*247#',
      helpline: '16247',
      website: 'https://www.bkash.com',
      charges: {
        cash_out: {
          app: {
            rate_percent: 1.75,
            per_thousand: 17.5,
            vat_included: true,
            notes_en: 'Standard cash-out charge via bKash App (1.75%)',
            notes_bn: 'বিকাশ অ্যাপের মাধ্যমে স্ট্যান্ডার্ড ক্যাশ আউট চার্জ (১.৭৫%)',
          },
          ussd: {
            rate_percent: 1.85,
            per_thousand: 18.5,
            vat_included: true,
            notes_en: 'Standard cash-out charge via USSD *247# (1.85%)',
            notes_bn: 'ইউএসএসডি *২৪৭# এর মাধ্যমে ক্যাশ আউট চার্জ (১.৮৫%)',
          },
          atm: {
            rate_percent: 1.49,
            per_thousand: 14.9,
            vat_included: true,
            notes_en: 'Cash out from partner bank ATMs (1.49%)',
            notes_bn: 'পার্টনার ব্যাংকের এটিএম থেকে ক্যাশ আউট চার্জ (১.৪৯%)',
          },
          special: {
            rate_percent: 1.49,
            per_thousand: 14.9,
            vat_included: true,
            notes_en: 'Priyo Agent cash out up to ৳25,000/month (1.49%)',
            notes_bn: 'প্রিয় এজেন্ট ক্যাশ আউট প্রতি মাসে ২৫,০০০ টাকা পর্যন্ত (১.৪৯%)',
          },
        },
        send_money: {
          app: {
            fee_fixed: 5,
            free_conditions_en:
              'Free up to 5 Priyo numbers (up to ৳25,000/month or ৳100/day single transaction)',
            free_conditions_bn: '৫টি প্রিয় নম্বরে প্রতি মাসে ২৫,০০০ টাকা বা দৈনিক ১০০ টাকা পর্যন্ত ফ্রি',
            notes_en: '৳5 for non-priyo numbers or above free limits; ৳10 for amounts over ৳25,000',
            notes_bn: 'নন-প্রিয় নম্বরে বা ফ্রি সীমার উপরে ৫ টাকা; ২৫,০০০ টাকার বেশি হলে ১০ টাকা',
          },
          ussd: {
            fee_fixed: 5,
            free_conditions_en: 'Free up to 5 Priyo numbers up to ৳100/day',
            free_conditions_bn: '৫টি প্রিয় নম্বরে দৈনিক ১০০ টাকা পর্যন্ত ফ্রি',
            notes_en: 'Standard ৳5 per transaction',
            notes_bn: 'স্ট্যান্ডার্ড ৫ টাকা প্রতি লেনদেনে',
          },
        },
      },
      limits: {
        cash_out_max_per_txn: 25000,
        cash_out_daily_max: 25000,
        send_money_max_per_txn: 25000,
      },
      last_verified: '2026-11-16',
      source_url: 'https://www.bkash.com/support/tariff-limits',
    },
  });

export type MfsProvider = z.infer<typeof MfsProviderSchema>;
export type MfsFeeRate = z.infer<typeof MfsFeeRateSchema>;
export type MfsSendMoneyFee = z.infer<typeof MfsSendMoneyFeeSchema>;

export const MfsActionSchema = z.enum(['cash-out', 'send-money']).openapi({ example: 'cash-out' });
export type MfsAction = z.infer<typeof MfsActionSchema>;

export const MfsChannelSchema = z
  .enum(['app', 'ussd', 'atm', 'special'])
  .openapi({ example: 'app' });
export type MfsChannel = z.infer<typeof MfsChannelSchema>;

export const MfsChargeCalculationSchema = z
  .object({
    provider: z.string().openapi({ example: 'bkash' }),
    provider_name_en: z.string().openapi({ example: 'bKash' }),
    provider_name_bn: z.string().openapi({ example: 'বিকাশ' }),
    action: MfsActionSchema,
    channel: MfsChannelSchema,
    amount: z.number().openapi({ example: 5000 }),
    fee: z.number().openapi({ example: 87.5 }),
    total_deducted: z.number().openapi({ example: 5087.5 }),
    rate_percent: z.number().optional().openapi({ example: 1.75 }),
    vat_included: z.boolean().openapi({ example: true }),
    notes_en: z.string().optional(),
    notes_bn: z.string().optional(),
    exceeds_single_transaction_limit: z.boolean().openapi({ example: false }),
  })
  .openapi('MfsChargeCalculation', {
    example: {
      provider: 'bkash',
      provider_name_en: 'bKash',
      provider_name_bn: 'বিকাশ',
      action: 'cash-out',
      channel: 'app',
      amount: 5000,
      fee: 87.5,
      total_deducted: 5087.5,
      rate_percent: 1.75,
      vat_included: true,
      notes_en: 'Standard cash-out charge via bKash App (1.75%)',
      notes_bn: 'বিকাশ অ্যাপের মাধ্যমে স্ট্যান্ডার্ড ক্যাশ আউট চার্জ (১.৭৫%)',
      exceeds_single_transaction_limit: false,
    },
  });

export type MfsChargeCalculation = z.infer<typeof MfsChargeCalculationSchema>;

export const MfsComparisonResultSchema = z
  .object({
    amount: z.number().openapi({ example: 10000 }),
    action: MfsActionSchema,
    channel: MfsChannelSchema,
    rankings: z.array(MfsChargeCalculationSchema),
  })
  .openapi('MfsComparisonResult', {
    example: {
      amount: 10000,
      action: 'cash-out',
      channel: 'app',
      rankings: [
        {
          provider: 'nagad',
          provider_name_en: 'Nagad',
          provider_name_bn: 'নগদ',
          action: 'cash-out',
          channel: 'app',
          amount: 10000,
          fee: 114.9,
          total_deducted: 10114.9,
          rate_percent: 1.149,
          vat_included: true,
          notes_en: '৳9.99 per ৳1,000 + 15% VAT = ৳11.49 via Nagad App (1.149%)',
          notes_bn: 'নগদ অ্যাপে প্রতি হাজারে ৯.৯৯ টাকা + ১৫% ভ্যাট = ১১.৪৯ টাকা (১.১৪৯%)',
          exceeds_single_transaction_limit: false,
        },
      ],
    },
  });

export type MfsComparisonResult = z.infer<typeof MfsComparisonResultSchema>;

export const MfsUssdEntrySchema = z
  .object({
    provider: z.string().openapi({ example: 'bkash' }),
    name_en: z.string().openapi({ example: 'bKash' }),
    name_bn: z.string().openapi({ example: 'বিকাশ' }),
    ussd_code: z.string().openapi({ example: '*247#' }),
    helpline: z.string().openapi({ example: '16247' }),
    parent_en: z.string().openapi({ example: 'BRAC Bank PLC' }),
  })
  .openapi('MfsUssdEntry', {
    example: {
      provider: 'bkash',
      name_en: 'bKash',
      name_bn: 'বিকাশ',
      ussd_code: '*247#',
      helpline: '16247',
      parent_en: 'BRAC Bank PLC',
    },
  });

export type MfsUssdEntry = z.infer<typeof MfsUssdEntrySchema>;

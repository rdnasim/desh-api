import { parseNumber } from '../../lib/digits';
import type {
  MfsAction,
  MfsChannel,
  MfsChargeCalculation,
  MfsFeeRate,
  MfsProvider,
} from './schemas';

export interface CalculateParams {
  provider: MfsProvider;
  action: MfsAction;
  channel: MfsChannel;
  amount: number | string;
}

export interface ComparisonResult {
  amount: number;
  action: MfsAction;
  channel: MfsChannel;
  rankings: MfsChargeCalculation[];
}

export function parseTransactionAmount(input: number | string): number | null {
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? input : null;
  }
  return parseNumber(input);
}

export function calculateMfsFee(params: CalculateParams): MfsChargeCalculation | null {
  const { provider, action, channel } = params;
  const numAmount = parseTransactionAmount(params.amount);
  if (numAmount === null || numAmount <= 0) {
    return null;
  }

  if (action === 'cash-out') {
    let rateConfig: MfsFeeRate | undefined;
    if (channel === 'app') {
      rateConfig = provider.charges.cash_out.app;
    } else if (channel === 'ussd') {
      rateConfig = provider.charges.cash_out.ussd;
    } else if (channel === 'atm') {
      rateConfig = provider.charges.cash_out.atm;
    } else if (channel === 'special') {
      rateConfig = provider.charges.cash_out.special;
    }

    if (!rateConfig) {
      return null;
    }

    // Fee calculation based on published per-thousand tariff
    const rawFee = (numAmount / 1000) * rateConfig.per_thousand;
    const fee = Math.round(rawFee * 100) / 100;
    const totalDeducted = Math.round((numAmount + fee) * 100) / 100;
    const exceedsLimit = numAmount > provider.limits.cash_out_max_per_txn;

    return {
      provider: provider.slug,
      provider_name_en: provider.name_en,
      provider_name_bn: provider.name_bn,
      action: 'cash-out',
      channel,
      amount: numAmount,
      fee,
      total_deducted: totalDeducted,
      rate_percent: rateConfig.rate_percent,
      vat_included: rateConfig.vat_included,
      notes_en: rateConfig.notes_en,
      notes_bn: rateConfig.notes_bn,
      exceeds_single_transaction_limit: exceedsLimit,
    };
  }

  if (action === 'send-money') {
    const sendConfig =
      channel === 'app'
        ? provider.charges.send_money.app
        : channel === 'ussd'
          ? provider.charges.send_money.ussd
          : undefined;

    if (!sendConfig) {
      return null;
    }

    const fee = sendConfig.fee_fixed;
    const totalDeducted = Math.round((numAmount + fee) * 100) / 100;
    const exceedsLimit = numAmount > provider.limits.send_money_max_per_txn;

    return {
      provider: provider.slug,
      provider_name_en: provider.name_en,
      provider_name_bn: provider.name_bn,
      action: 'send-money',
      channel,
      amount: numAmount,
      fee,
      total_deducted: totalDeducted,
      vat_included: true,
      notes_en: sendConfig.notes_en ?? sendConfig.free_conditions_en,
      notes_bn: sendConfig.notes_bn ?? sendConfig.free_conditions_bn,
      exceeds_single_transaction_limit: exceedsLimit,
    };
  }

  return null;
}

export function compareMfsFees(
  providers: readonly MfsProvider[],
  action: MfsAction,
  channel: MfsChannel,
  amount: number | string,
): ComparisonResult | null {
  const numAmount = parseTransactionAmount(amount);
  if (numAmount === null || numAmount <= 0) {
    return null;
  }

  const results: MfsChargeCalculation[] = [];
  for (const provider of providers) {
    const calc = calculateMfsFee({ provider, action, channel, amount: numAmount });
    if (calc) {
      results.push(calc);
    }
  }

  // Rank by lowest fee first; if tied, sort alphabetically by name
  results.sort((a, b) => {
    if (a.fee !== b.fee) return a.fee - b.fee;
    return a.provider_name_en.localeCompare(b.provider_name_en);
  });

  return {
    amount: numAmount,
    action,
    channel,
    rankings: results,
  };
}

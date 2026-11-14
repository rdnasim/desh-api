import { round2 } from './money';
import type { Compounding } from './schemas';

const MONTHS_PER_PERIOD: Record<Compounding, number> = {
  monthly: 1,
  quarterly: 3,
  'half-yearly': 6,
  yearly: 12,
};

/**
 * Monthly deposit scheme: one deposit at the start of each month, interest accrued monthly and
 * credited every compounding period (research F8).
 */
export function dps(
  monthly: number,
  annualRate: number,
  years: number,
  compounding: Compounding = 'monthly',
) {
  const months = years * 12;
  const rate = annualRate / 1200;
  let balance = 0;
  let accrued = 0;
  for (let month = 1; month <= months; month++) {
    balance += monthly;
    accrued += balance * rate;
    if (month % MONTHS_PER_PERIOD[compounding] === 0) {
      balance += accrued;
      accrued = 0;
    }
  }
  balance += accrued;
  const total = monthly * months;
  return {
    monthly_deposit: monthly,
    annual_rate: annualRate,
    years,
    compounding,
    total_deposit: round2(total),
    interest: round2(balance - total),
    maturity_value: round2(balance),
  };
}

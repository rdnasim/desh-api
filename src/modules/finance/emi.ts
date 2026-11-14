import { round2 } from './money';

/**
 * Equal monthly instalment on a reducing balance (research F7). Totals come from the schedule,
 * whose last instalment absorbs rounding so the balance ends at exactly 0.
 */
export function emi(principal: number, annualRate: number, months: number, withSchedule = false) {
  const r = annualRate / 1200;
  const payment = round2(
    r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1),
  );
  let balance = principal;
  let totalPayment = 0;
  const schedule = [];
  for (let month = 1; month <= months; month++) {
    const interest = round2(balance * r);
    const toPrincipal = month === months ? balance : Math.min(round2(payment - interest), balance);
    const paid = round2(toPrincipal + interest);
    balance = round2(balance - toPrincipal);
    totalPayment += paid;
    schedule.push({ month, payment: paid, principal: round2(toPrincipal), interest, balance });
  }
  const total = round2(totalPayment);
  return {
    principal,
    annual_rate: annualRate,
    months,
    emi: payment,
    total_payment: total,
    total_interest: round2(total - principal),
    ...(withSchedule ? { schedule } : {}),
  };
}

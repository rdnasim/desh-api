import { round2 } from './money';

/** Standard rate, Value Added Tax and Supplementary Duty Act 2012, section 15 (research F6). */
export const STANDARD_VAT_RATE = 15;

/** Adds VAT to a net amount, or (inclusive) splits a VAT-inclusive amount. */
export function vat(amount: number, rate = STANDARD_VAT_RATE, inclusive = false) {
  if (inclusive) {
    const net = round2((amount * 100) / (100 + rate));
    return { rate, inclusive, net, vat: round2(amount - net), gross: round2(amount) };
  }
  const tax = round2((amount * rate) / 100);
  return { rate, inclusive, net: round2(amount), vat: tax, gross: round2(amount + tax) };
}

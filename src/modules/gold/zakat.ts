import { round2 } from '../finance/money';
import type { ParsedPrices } from './bajus';
import { VORI_GRAMS } from './bajus';
import type { Karat, Metal } from './schemas';

/** Classical nisab: 7.5 vori of gold or 52.5 vori of silver (research G2). */
const NISAB_VORI: Record<Metal, number> = { gold: 7.5, silver: 52.5 };
const RATE = 2.5 as const;

function nisab(prices: ParsedPrices, basis: Metal, karat: Karat) {
  const grams = round2(NISAB_VORI[basis] * VORI_GRAMS);
  const perGram = prices[basis][karat].per_gram;
  return { grams, perGram, value: round2(grams * perGram) };
}

/** Zakat at 2.5% on net zakatable wealth held for a lunar year, if it reaches the nisab. */
export function zakat(
  prices: ParsedPrices,
  wealth: number,
  basis: Metal = 'silver',
  karat: Karat = '22k',
) {
  const chosen = nisab(prices, basis, karat);
  const otherBasis: Metal = basis === 'silver' ? 'gold' : 'silver';
  const other = nisab(prices, otherBasis, karat);
  const due = wealth >= chosen.value;
  return {
    wealth: round2(wealth),
    basis,
    karat,
    price_per_gram: chosen.perGram,
    nisab_grams: chosen.grams,
    nisab_value: chosen.value,
    due,
    rate: RATE,
    zakat: due ? round2((wealth * RATE) / 100) : 0,
    other_basis: { basis: otherBasis, nisab_value: other.value, due: wealth >= other.value },
    prices_effective_date: prices.effective_date,
  };
}

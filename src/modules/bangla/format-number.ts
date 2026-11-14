import { parseDecimal, toBanglaDigits, toLatinDigits } from '../../lib/digits';
import { invalid } from './errors';

export type DigitScript = 'bn' | 'en';

/** South Asian grouping: last three digits, then groups of two (12,50,000). */
function groupIndian(integer: string): string {
  if (integer.length <= 3) return integer;
  const head = integer.slice(0, -3);
  const tail = integer.slice(-3);
  return `${head.replace(/\B(?=(\d{2})+$)/g, ',')},${tail}`;
}

export function formatNumber(raw: string, digits: DigitScript = 'bn') {
  const parsed = parseDecimal(raw);
  if (!parsed) invalid('n', 'must be a number');
  let formatted = groupIndian(parsed.integer || '0');
  if (parsed.fraction) formatted += `.${parsed.fraction}`;
  if (parsed.negative) formatted = `-${formatted}`;
  return {
    input: parsed.value,
    formatted: digits === 'bn' ? toBanglaDigits(formatted) : formatted,
  };
}

export function convertDigits(text: string, to: DigitScript): string {
  return to === 'bn' ? toBanglaDigits(text) : toLatinDigits(text);
}

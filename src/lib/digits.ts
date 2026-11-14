const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBanglaDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] as string);
}

export function toLatinDigits(text: string): string {
  return text.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

const NUMBER_PATTERN = /^-?(\d+|\d{1,3}(,\d{2,3})+)(\.\d+)?$/;

/**
 * Parses a user-supplied number that may use Bangla digits and comma grouping
 * (Western or lakh/crore). Returns null for anything that is not a plain decimal number.
 */
export function parseNumber(input: string): number | null {
  const text = toLatinDigits(input.trim());
  if (!NUMBER_PATTERN.test(text)) return null;
  const value = Number(text.replaceAll(',', ''));
  return Number.isFinite(value) ? value : null;
}

export interface ParsedDecimal {
  negative: boolean;
  /** Integer digits without grouping, e.g. "1250000". */
  integer: string;
  /** Fraction digits as written, e.g. "50" (empty when there is no decimal point). */
  fraction: string;
  value: number;
}

/** Like {@link parseNumber}, but keeps the digit strings so callers can work without float error. */
export function parseDecimal(input: string): ParsedDecimal | null {
  const text = toLatinDigits(input.trim());
  if (!NUMBER_PATTERN.test(text)) return null;
  const negative = text.startsWith('-');
  const [integer = '', fraction = ''] = text.replace('-', '').replaceAll(',', '').split('.');
  const value = Number(text.replaceAll(',', ''));
  if (!Number.isFinite(value)) return null;
  return { negative, integer: integer.replace(/^0+(?=\d)/, ''), fraction, value };
}

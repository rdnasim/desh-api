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

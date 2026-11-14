import prefixes from '../../generated/phone.prefixes';
import { toLatinDigits } from '../../lib/digits';
import type { PhoneReason, PhoneResult } from './schemas';

export const PORTABILITY_NOTICE =
  'Operator reflects the original prefix allocation; the number may have been ported.';

const byPrefix = new Map(prefixes.map((p) => [p.prefix, p]));

function invalid(input: string, reason: PhoneReason): PhoneResult {
  return { input, valid: false, reason, portability_notice: PORTABILITY_NOTICE };
}

/**
 * Accepts local (01…), country-code (+880, 880, 00880) and bare 10-digit (1…) forms, with Bangla
 * or Latin digits and spaces, dashes, dots or parentheses as separators.
 */
export function validatePhone(input: string): PhoneResult {
  const compact = toLatinDigits(input)
    .trim()
    .replace(/[\s\-().]/g, '');
  if (!/^\+?\d*$/.test(compact)) return invalid(input, 'invalid_chars');

  let digits = compact.replace('+', '');
  if (digits.startsWith('00880')) digits = digits.slice(5);
  else if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;

  if (digits.length !== 11) return invalid(input, 'invalid_length');
  const prefix = byPrefix.get(digits.slice(0, 3));
  if (!prefix) return invalid(input, 'invalid_prefix');

  return {
    input,
    valid: true,
    normalized: digits,
    international: `+88${digits}`,
    operator: {
      slug: prefix.operator_slug,
      name_en: prefix.operator_en,
      name_bn: prefix.operator_bn,
    },
    portability_notice: PORTABILITY_NOTICE,
  };
}

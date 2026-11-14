import { todayInDhaka } from '../bangla/calendar';
import { digitsOnly, invalid } from './common';
import type { ValidationResult } from './schemas';

/**
 * National ID format check: 10 digits (smart card), 13 (older cards) or 17 (older cards with the
 * birth year in front). Never looks up whose number it is.
 */
export function validateNid(input: string): ValidationResult {
  const digits = digitsOnly(input);
  if (digits === null) return invalid('nid', 'invalid_chars');
  if (digits.length !== 10 && digits.length !== 13 && digits.length !== 17) {
    return invalid('nid', 'invalid_length');
  }
  const format = String(digits.length);
  if (digits.length === 17) {
    const birthYear = Number(digits.slice(0, 4));
    const thisYear = Number(todayInDhaka().slice(0, 4));
    if (birthYear < 1900 || birthYear > thisYear) return invalid('nid', 'invalid_birth_year');
    return {
      type: 'nid',
      valid: true,
      normalized: digits,
      details: { format, birth_year: birthYear },
    };
  }
  return { type: 'nid', valid: true, normalized: digits, details: { format } };
}

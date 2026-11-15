import { digitsOnly, invalid } from './common';
import type { ValidationResult } from './schemas';

const WEIGHTS = [5, 7, 1] as const;

/**
 * Bank routing number check digit: digits weighted 5, 7, 1 (repeating) must sum to a multiple
 * of 10. Recovered from 10,032 published routing numbers, all of which pass (research B3).
 */
export function routingCheckDigitOk(digits: string): boolean {
  if (!/^\d{9}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (WEIGHTS[i % 3] as number);
  return sum % 10 === 0;
}

/** Bank routing number: 9 digits with a valid check digit. Never looks up the branch. */
export function validateRouting(input: string): ValidationResult {
  const digits = digitsOnly(input);
  if (digits === null) return invalid('routing', 'invalid_chars');
  if (digits.length !== 9) return invalid('routing', 'invalid_length');
  if (!routingCheckDigitOk(digits)) return invalid('routing', 'invalid_check_digit');
  return {
    type: 'routing',
    valid: true,
    normalized: digits,
    details: { bank_code: digits.slice(0, 3), district_code: digits.slice(3, 5) },
  };
}

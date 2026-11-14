import { digitsOnly, invalid } from './common';
import type { ValidationResult } from './schemas';

/** e-TIN: 12 digits. */
export function validateTin(input: string): ValidationResult {
  const digits = digitsOnly(input);
  if (digits === null) return invalid('tin', 'invalid_chars');
  if (digits.length !== 12) return invalid('tin', 'invalid_length');
  return { type: 'tin', valid: true, normalized: digits, details: { format: 'e-tin-12' } };
}

/** VAT BIN: 9 digits; the 13-digit form (9 + 4-digit branch suffix) is accepted and flagged. */
export function validateBin(input: string): ValidationResult {
  const digits = digitsOnly(input);
  if (digits === null) return invalid('bin', 'invalid_chars');
  if (digits.length === 9)
    return { type: 'bin', valid: true, normalized: digits, details: { format: 'bin-9' } };
  if (digits.length === 13) {
    return {
      type: 'bin',
      valid: true,
      normalized: digits,
      details: { format: 'legacy_or_branch' },
    };
  }
  return invalid('bin', 'invalid_length');
}

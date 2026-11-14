import { lookupPostcode } from '../geo/service';
import { digitsOnly, invalid } from './common';
import type { ValidationResult } from './schemas';

export function validatePostcode(input: string): ValidationResult {
  const digits = digitsOnly(input);
  if (digits === null) return invalid('postcode', 'invalid_chars');
  if (digits.length !== 4) return invalid('postcode', 'invalid_length');
  const offices = lookupPostcode(digits);
  return {
    type: 'postcode',
    valid: true,
    normalized: digits,
    details: offices.length ? { exists: true, post_offices: offices } : { exists: false },
  };
}

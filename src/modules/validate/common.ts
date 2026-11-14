import { toLatinDigits } from '../../lib/digits';
import type { ValidationReason, ValidationResult, ValidationType } from './schemas';

export const invalid = (type: ValidationType, reason: ValidationReason): ValidationResult => ({
  type,
  valid: false,
  reason,
});

/** Latin digits with spaces and hyphens removed, or null if anything else is left. */
export function digitsOnly(input: string): string | null {
  const compact = toLatinDigits(input).replace(/[\s-]/g, '');
  return /^\d*$/.test(compact) ? compact : null;
}

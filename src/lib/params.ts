import { parseNumber } from './digits';
import { ApiError } from './errors';

interface NumberOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

/** Parses a numeric query/path value (Latin or Bangla digits) or throws a 400. */
export function numberParam(name: string, raw: string, options: NumberOptions = {}): number {
  const value = parseNumber(raw);
  const { min, max, integer } = options;
  const problems: string[] = [];
  if (value === null) problems.push('must be a number');
  else {
    if (integer && !Number.isInteger(value)) problems.push('must be a whole number');
    if (min !== undefined && value < min) problems.push(`must be ≥ ${min}`);
    if (max !== undefined && value > max) problems.push(`must be ≤ ${max}`);
  }
  if (problems.length) {
    throw new ApiError('invalid_parameter', `${name} ${problems.join(' and ')}`, {
      details: [{ path: name, message: problems.join('; ') }],
    });
  }
  return value as number;
}

export function pageParams(page?: string, perPage?: string) {
  return {
    page: page === undefined ? 1 : numberParam('page', page, { min: 1, integer: true }),
    perPage:
      perPage === undefined
        ? 100
        : numberParam('per_page', perPage, { min: 1, max: 500, integer: true }),
  };
}

import { describe, expect, it } from 'vitest';
import { validateNid } from '../../../src/modules/validate/nid';

const thisYear = new Date().getUTCFullYear();

describe('validateNid', () => {
  it.each([
    ['1234567890', '10'],
    ['১২৩৪৫৬৭৮৯০', '10'],
    ['1234567890123', '13'],
    ['19901234567890123', '17'],
    ['1990 1234 5678 90123', '17'],
    ['123-456-7890', '10'],
  ])('%j is a valid %s-digit NID', (input, format) => {
    const r = validateNid(input);
    expect(r).toMatchObject({ type: 'nid', valid: true, details: { format } });
    expect(r.normalized).toMatch(/^\d+$/);
  });

  it('reports the birth year of a 17-digit NID', () => {
    expect(validateNid('19901234567890123').details).toEqual({ format: '17', birth_year: 1990 });
  });

  it.each([
    ['', 'invalid_length'],
    ['123456789', 'invalid_length'],
    ['12345678901', 'invalid_length'],
    ['123456789012345678', 'invalid_length'],
    ['12345abcde', 'invalid_chars'],
    ['18991234567890123', 'invalid_birth_year'],
    [`${thisYear + 1}1234567890123`, 'invalid_birth_year'],
  ])('%j is invalid (%s)', (input, reason) => {
    expect(validateNid(input)).toEqual({ type: 'nid', valid: false, reason });
  });
});

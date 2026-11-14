import { describe, expect, it } from 'vitest';
import { validatePostcode } from '../../../src/modules/validate/postcode';
import { validateBin, validateTin } from '../../../src/modules/validate/tin-bin';

describe('validateTin', () => {
  it('accepts 12 digits', () => {
    expect(validateTin('123456789012')).toEqual({
      type: 'tin',
      valid: true,
      normalized: '123456789012',
      details: { format: 'e-tin-12' },
    });
    expect(validateTin('১২৩৪ ৫৬৭৮ ৯০১২').valid).toBe(true);
  });

  it.each([
    ['12345678901', 'invalid_length'],
    ['1234567890123', 'invalid_length'],
    ['12345678901a', 'invalid_chars'],
  ])('%j → %s', (input, reason) => {
    expect(validateTin(input)).toEqual({ type: 'tin', valid: false, reason });
  });
});

describe('validateBin', () => {
  it.each([
    ['123456789', 'bin-9', '123456789'],
    ['০০০১২৩৪৫৬', 'bin-9', '000123456'],
    ['000123456-0101', 'legacy_or_branch', '0001234560101'],
    ['0001234560101', 'legacy_or_branch', '0001234560101'],
  ])('%j → %s', (input, format, normalized) => {
    expect(validateBin(input)).toEqual({
      type: 'bin',
      valid: true,
      normalized,
      details: { format },
    });
  });

  it.each([
    ['12345678', 'invalid_length'],
    ['12345678901', 'invalid_length'],
    ['12345678x', 'invalid_chars'],
  ])('%j → %s', (input, reason) => {
    expect(validateBin(input)).toEqual({ type: 'bin', valid: false, reason });
  });
});

describe('validatePostcode', () => {
  it('checks format and existence', () => {
    const r = validatePostcode('১২০৫');
    expect(r).toMatchObject({
      type: 'postcode',
      valid: true,
      normalized: '1205',
      details: { exists: true },
    });
    const offices = r.details?.post_offices as { district: string }[];
    expect(offices[0]).toMatchObject({ district: 'dhaka' });
  });

  it('is valid but not existing for an unused 4-digit code', () => {
    expect(validatePostcode('0001')).toEqual({
      type: 'postcode',
      valid: true,
      normalized: '0001',
      details: { exists: false },
    });
  });

  it.each([
    ['123', 'invalid_length'],
    ['12a4', 'invalid_chars'],
  ])('%j → %s', (input, reason) => {
    expect(validatePostcode(input)).toEqual({ type: 'postcode', valid: false, reason });
  });
});

import { describe, expect, it } from 'vitest';
import {
  DeshAddressSelector,
  DeshNidInput,
  DeshPhoneInput,
} from '../../packages/widgets/src/index';

describe('@deshapi/widgets Web Components', () => {
  it('exports DeshPhoneInput, DeshNidInput, and DeshAddressSelector classes', () => {
    expect(DeshPhoneInput).toBeDefined();
    expect(DeshNidInput).toBeDefined();
    expect(DeshAddressSelector).toBeDefined();
  });

  it('DeshPhoneInput detects Bangladeshi operators and validates phone numbers', () => {
    const input = new DeshPhoneInput();
    input.value = '01711223344';
    expect(input.operator).toBe('Grameenphone');
    expect(input.isValid).toBe(true);

    input.value = '01811223344';
    expect(input.operator).toBe('Robi');
    expect(input.isValid).toBe(true);

    input.value = '01911223344';
    expect(input.operator).toBe('Banglalink');
    expect(input.isValid).toBe(true);

    input.value = '01511223344';
    expect(input.operator).toBe('Teletalk');
    expect(input.isValid).toBe(true);

    input.value = '12345';
    expect(input.operator).toBeNull();
    expect(input.isValid).toBe(false);
  });

  it('DeshNidInput identifies smart (10), old (13), and extended (17) NIDs', () => {
    const input = new DeshNidInput();
    input.value = '1234567890';
    expect(input.nidType).toBe('smart');
    expect(input.isValid).toBe(true);

    input.value = '1234567890123';
    expect(input.nidType).toBe('old');
    expect(input.isValid).toBe(true);

    input.value = '19901234567890123';
    expect(input.nidType).toBe('extended');
    expect(input.isValid).toBe(true);

    input.value = '12345';
    expect(input.nidType).toBeNull();
    expect(input.isValid).toBe(false);
  });

  it('DeshAddressSelector initializes with default language and values', () => {
    const sel = new DeshAddressSelector();
    expect(sel.lang).toBe('en');
    expect(sel.value).toEqual({ division: '', district: '', upazila: '' });
  });
});

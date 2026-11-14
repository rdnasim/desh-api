import { describe, expect, it } from 'vitest';
import { STANDARD_VAT_RATE, vat } from '../../../src/modules/finance/vat';

describe('vat', () => {
  it('uses the 15% standard rate', () => {
    expect(STANDARD_VAT_RATE).toBe(15);
  });

  it('adds VAT to a net amount', () => {
    expect(vat(1000)).toEqual({ rate: 15, inclusive: false, net: 1000, vat: 150, gross: 1150 });
  });

  it('extracts VAT from a VAT-inclusive amount', () => {
    expect(vat(1150, 15, true)).toEqual({
      rate: 15,
      inclusive: true,
      net: 1000,
      vat: 150,
      gross: 1150,
    });
    expect(vat(100, 15, true)).toEqual({
      rate: 15,
      inclusive: true,
      net: 86.96,
      vat: 13.04,
      gross: 100,
    });
  });

  it('takes a custom rate', () => {
    expect(vat(2000, 7.5)).toMatchObject({ rate: 7.5, vat: 150, gross: 2150 });
  });

  it('handles zero', () => {
    expect(vat(0)).toMatchObject({ net: 0, vat: 0, gross: 0 });
  });
});

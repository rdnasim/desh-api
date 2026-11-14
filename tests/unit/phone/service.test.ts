import { describe, expect, it } from 'vitest';
import { PORTABILITY_NOTICE, validatePhone } from '../../../src/modules/phone/service';
import golden from '../../golden/phone/cases.json';

describe('validatePhone (golden valid)', () => {
  it.each(golden.valid as [string, string, string][])(
    '%j → %s (%s)',
    (input, normalized, operator) => {
      const r = validatePhone(input);
      expect(r).toMatchObject({
        input,
        valid: true,
        normalized,
        international: `+88${normalized}`,
        operator: { slug: operator },
        portability_notice: PORTABILITY_NOTICE,
      });
      expect(r.reason).toBeUndefined();
    },
  );
});

describe('validatePhone (golden invalid)', () => {
  it.each(golden.invalid as [string, string][])('%j → %s', (input, reason) => {
    const r = validatePhone(input);
    expect(r).toEqual({ input, valid: false, reason, portability_notice: PORTABILITY_NOTICE });
  });
});

describe('operator names', () => {
  it('are bilingual', () => {
    expect(validatePhone('01712345678').operator).toEqual({
      slug: 'grameenphone',
      name_en: 'Grameenphone',
      name_bn: 'গ্রামীণফোন',
    });
  });
});

import { describe, expect, it } from 'vitest';
import names from '../../src/generated/mock.names';

describe('mock names', () => {
  it('lets every tradition make a person of either gender', () => {
    for (const tradition of ['muslim', 'hindu', 'buddhist', 'christian'] as const) {
      for (const gender of ['male', 'female'] as const) {
        const given = names.filter(
          (n) => n.tradition === tradition && n.kind === 'given' && n.gender === gender,
        );
        const family = names.filter(
          (n) =>
            n.tradition === tradition &&
            n.kind === 'family' &&
            (n.gender === undefined || n.gender === gender),
        );
        expect(given.length, `${tradition} ${gender} given`).toBeGreaterThan(2);
        expect(family.length, `${tradition} ${gender} family`).toBeGreaterThan(2);
      }
    }
  });

  it('stores Bangla spellings NFC-normalised and English names as plain letters', () => {
    for (const n of names) {
      expect(n.name_bn).toBe(n.name_bn.normalize('NFC'));
      expect(n.name_en).toMatch(/^[A-Z][a-z]+$/);
    }
  });
});

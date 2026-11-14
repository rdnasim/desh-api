import { describe, expect, it } from 'vitest';
import { transliterate } from '../../../src/modules/bangla/transliterate';
import golden from '../../golden/bangla/transliterate.json';

describe('transliterate (golden)', () => {
  it.each(golden.cases as [string, string][])('%s → %s', (input, expected) => {
    expect(transliterate(input).output).toBe(expected);
  });

  it('names its scheme', () => {
    expect(transliterate('ami').scheme).toBe('avro-phonetic');
  });
});

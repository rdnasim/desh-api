import { describe, expect, it } from 'vitest';
import { bijoyToUnicode } from '../../../src/modules/convert/bijoy-to-unicode';
import { unicodeToBijoy } from '../../../src/modules/convert/unicode-to-bijoy';
import golden from '../../golden/bijoy/pairs.json';

const pairs = [...golden.pairs, ...golden.manual] as [string, string][];

describe('Bijoy → Unicode', () => {
  it.each(golden.external as [string, string][])('decodes external sample %j', (bijoy, unicode) => {
    expect(bijoyToUnicode(bijoy)).toBe(unicode);
  });

  it(`decodes all ${pairs.length} golden pairs`, () => {
    const failures = pairs.filter(([b, u]) => bijoyToUnicode(b) !== u);
    expect(failures).toEqual([]);
  });

  it('accepts alternate glyphs for the same sign', () => {
    // † and ‡ are both ে; y, z and æ are all ু.
    expect(bijoyToUnicode('†K')).toBe(bijoyToUnicode('‡K'));
    expect(bijoyToUnicode('Ky')).toBe('কু');
    expect(bijoyToUnicode('Kz')).toBe('কু');
  });

  it('reorders pre-base vowel signs and reph', () => {
    expect(bijoyToUnicode('wK')).toBe('কি');
    expect(bijoyToUnicode('‡Kv')).toBe('কো');
    expect(bijoyToUnicode('‡KŠ')).toBe('কৌ');
    expect(bijoyToUnicode('Kg©')).toBe('কর্ম');
    expect(bijoyToUnicode('m~h©')).toBe('সূর্য');
  });

  it('keeps unmapped characters and handles empty input', () => {
    expect(bijoyToUnicode('')).toBe('');
    expect(bijoyToUnicode('Avwg, 2026?')).toBe('আমি, ২০২৬?');
  });
});

describe('Unicode → Bijoy', () => {
  it(`encodes all ${pairs.length} golden pairs`, () => {
    const failures = pairs.filter(([b, u]) => unicodeToBijoy(u) !== b);
    expect(failures).toEqual([]);
  });

  it('never leaves Bangla script in Bijoy output', () => {
    expect(pairs.filter(([b]) => /[\u0980-\u09FF]/.test(b))).toEqual([]);
    expect(unicodeToBijoy('সোনার নৌকা')).toBe('‡mvbvi ‡bŠKv');
  });

  it('encodes the vision-doc example', () => {
    expect(bijoyToUnicode(unicodeToBijoy('আমার সোনার বাংলা'))).toBe('আমার সোনার বাংলা');
  });

  it('treats decomposed and precomposed nukta letters alike', () => {
    expect(unicodeToBijoy('য়')).toBe(unicodeToBijoy('য়'));
  });

  it('converts 100 KB within the CPU budget', () => {
    const text = 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। '.repeat(1100);
    const started = performance.now();
    const encoded = unicodeToBijoy(text);
    const decoded = bijoyToUnicode(encoded);
    expect(decoded).toBe(text.normalize('NFC'));
    expect(performance.now() - started).toBeLessThan(200);
  });
});

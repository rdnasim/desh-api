import { toLatinDigits } from '../../lib/digits';
import { slugifyLatin } from '../../lib/normalize';

const VOWELS: Record<string, string> = {
  অ: 'o',
  আ: 'a',
  ই: 'i',
  ঈ: 'i',
  উ: 'u',
  ঊ: 'u',
  ঋ: 'ri',
  এ: 'e',
  ঐ: 'oi',
  ও: 'o',
  ঔ: 'ou',
};
const VOWEL_SIGNS: Record<string, string> = {
  'া': 'a',
  'ি': 'i',
  'ী': 'i',
  'ু': 'u',
  'ূ': 'u',
  'ৃ': 'ri',
  'ে': 'e',
  'ৈ': 'oi',
  'ো': 'o',
  'ৌ': 'ou',
};
const CONSONANTS: Record<string, string> = {
  ক: 'k',
  খ: 'kh',
  গ: 'g',
  ঘ: 'gh',
  ঙ: 'ng',
  চ: 'ch',
  ছ: 'chh',
  জ: 'j',
  ঝ: 'jh',
  ঞ: 'n',
  ট: 't',
  ঠ: 'th',
  ড: 'd',
  ঢ: 'dh',
  ণ: 'n',
  ত: 't',
  থ: 'th',
  দ: 'd',
  ধ: 'dh',
  ন: 'n',
  প: 'p',
  ফ: 'f',
  ব: 'b',
  ভ: 'bh',
  ম: 'm',
  য: 'j',
  র: 'r',
  ল: 'l',
  শ: 'sh',
  ষ: 'sh',
  স: 's',
  হ: 'h',
  ৎ: 't',
};
/** Consonant + nukta (how NFC stores ড়, ঢ়, য়). */
const NUKTA_CONSONANTS: Record<string, string> = { ড: 'r', ঢ: 'rh', য: 'y' };
const SIGNS: Record<string, string> = { 'ং': 'ng', 'ঃ': 'h', 'ঁ': '' };
const HASANTA = '্';
const NUKTA = '়';

/**
 * Rough romanisation for URL slugs. A consonant gets the inherent vowel "o" only when another
 * consonant follows it directly, which is right for most short words (কলম → kolom) but not all.
 * Slugs need to be stable and URL-safe, not a precise pronunciation.
 */
function romanize(text: string): string {
  const chars = [...toLatinDigits(text.normalize('NFC'))];
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i] as string;
    const consonant =
      chars[i + 1] === NUKTA && NUKTA_CONSONANTS[ch] !== undefined
        ? NUKTA_CONSONANTS[ch]
        : CONSONANTS[ch];
    if (consonant !== undefined) {
      if (chars[i + 1] === NUKTA) i++;
      const next = chars[i + 1];
      if (next === HASANTA) {
        // য-ফলা after a consonant reads as "y".
        out += consonant;
        i++;
        if (chars[i + 1] === 'য' && chars[i + 2] !== NUKTA) {
          out += 'y';
          i++;
        }
      } else if (next !== undefined && VOWEL_SIGNS[next] !== undefined) {
        out += consonant + VOWEL_SIGNS[next];
        i++;
      } else if (next !== undefined && (CONSONANTS[next] !== undefined || next === 'ৎ')) {
        out += `${consonant}o`;
      } else {
        out += consonant;
      }
    } else if (VOWELS[ch] !== undefined) out += VOWELS[ch];
    else if (SIGNS[ch] !== undefined) out += SIGNS[ch];
    else if (VOWEL_SIGNS[ch] !== undefined) out += VOWEL_SIGNS[ch];
    else if (ch === NUKTA || ch === HASANTA) continue;
    else out += ch;
  }
  return out;
}

export function banglaSlug(text: string): { input: string; slug: string } {
  return { input: text, slug: slugifyLatin(romanize(text)) };
}

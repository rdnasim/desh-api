import { parseDecimal } from '../../lib/digits';
import { invalid } from './errors';

/** Bangla has an irregular word for every number from 0 to 99. */
// biome-ignore format: one row per 10 keeps the table reviewable
export const NUMBER_WORDS: readonly string[] = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
];

export const MAX_INTEGER = 999_999_999_999_999;

const word = (n: number) => NUMBER_WORDS[n] as string;

/** Words for 1..9,999,999 (below one crore), using lakh/hazar/shoto. */
function belowCrore(n: number): string[] {
  const parts: string[] = [];
  const lakh = Math.floor(n / 100_000);
  const hazar = Math.floor((n % 100_000) / 1000);
  const shoto = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  if (lakh) parts.push(`${word(lakh)} লক্ষ`);
  if (hazar) parts.push(`${word(hazar)} হাজার`);
  if (shoto) parts.push(`${word(shoto)}শত`);
  if (rest) parts.push(word(rest));
  return parts;
}

/** Integer to Bangla words; amounts of a crore and above recurse ("এক হাজার কোটি"). */
export function integerToWords(n: number): string {
  if (n === 0) return word(0);
  const crore = Math.floor(n / 10_000_000);
  const parts = crore ? [`${integerToWords(crore)} কোটি`] : [];
  parts.push(...belowCrore(n % 10_000_000));
  return parts.join(' ');
}

export function numberToWords(raw: string): { input: number; words: string } {
  const parsed = parseDecimal(raw);
  if (!parsed) invalid('n', 'must be a number');
  if (parsed.negative) invalid('n', 'must be ≥ 0');
  if (parsed.fraction.length > 2) invalid('n', 'may have at most 2 decimal places');
  const integer = Number(parsed.integer);
  if (integer > MAX_INTEGER) invalid('n', `must be ≤ ${MAX_INTEGER}`);
  let words = integerToWords(integer);
  if (parsed.fraction) {
    words += ` দশমিক ${[...parsed.fraction].map((d) => word(Number(d))).join(' ')}`;
  }
  return { input: parsed.value, words };
}

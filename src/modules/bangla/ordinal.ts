import { toBanglaDigits } from '../../lib/digits';
import { invalid } from './errors';
import { integerToWords } from './num-to-words';

/** Sanskrit-derived ordinals used for 1–20; above that the modern "-তম" form is standard. */
// biome-ignore format: one row per 10 keeps the table reviewable
const CLASSICAL = [
  'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম',
  'একাদশ', 'দ্বাদশ', 'ত্রয়োদশ', 'চতুর্দশ', 'পঞ্চদশ', 'ষোড়শ', 'সপ্তদশ', 'অষ্টাদশ', 'ঊনবিংশ', 'বিংশ',
];

/** Abbreviated suffixes for 1–10 (১ম, ২য়, ৩য়, ৪র্থ, ৬ষ্ঠ…); "তম" after that. */
const SHORT_SUFFIX = ['ম', 'য়', 'য়', 'র্থ', 'ম', 'ষ্ঠ', 'ম', 'ম', 'ম', 'ম'];

export function toOrdinal(n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 100)
    invalid('n', 'must be a whole number from 1 to 100');
  const ordinal =
    n <= 20 ? (CLASSICAL[n - 1] as string) : n === 100 ? 'শততম' : `${integerToWords(n)}তম`;
  const short = `${toBanglaDigits(String(n))}${n <= 10 ? SHORT_SUFFIX[n - 1] : 'তম'}`;
  return { input: n, ordinal, short };
}

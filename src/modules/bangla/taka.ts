import { parseDecimal } from '../../lib/digits';
import { invalid } from './errors';
import { integerToWords, MAX_INTEGER, NUMBER_WORDS } from './num-to-words';

export function takaInWords(raw: string): {
  input: number;
  words: string;
  taka: number;
  paisa: number;
} {
  const parsed = parseDecimal(raw);
  if (!parsed) invalid('amount', 'must be a number');
  if (parsed.negative) invalid('amount', 'must be ≥ 0');
  if (parsed.fraction.length > 2) invalid('amount', 'may have at most 2 decimal places');
  const taka = Number(parsed.integer);
  if (taka > MAX_INTEGER) invalid('amount', `must be ≤ ${MAX_INTEGER}`);
  const paisa = Number(parsed.fraction.padEnd(2, '0') || '0');

  const parts: string[] = [];
  if (taka > 0 || paisa === 0) parts.push(`${integerToWords(taka)} টাকা`);
  if (paisa > 0) parts.push(`${NUMBER_WORDS[paisa]} পয়সা`);
  return { input: taka + paisa / 100, words: parts.join(' '), taka, paisa };
}

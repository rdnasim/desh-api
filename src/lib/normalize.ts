import { toLatinDigits } from './digits';

const LATIN_WITH_DIACRITICS = /[\u00C0-\u024F]/g;
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;

function stripLatinDiacritics(text: string): string {
  return text.replace(LATIN_WITH_DIACRITICS, (ch) =>
    ch.normalize('NFD').replace(COMBINING_MARKS, ''),
  );
}

/**
 * Canonical form for search matching. NFC on both sides makes precomposed and decomposed
 * Bangla nukta letters (য়/ড়/ঢ়) compare equal.
 */
export function normalizeForSearch(text: string): string {
  return toLatinDigits(stripLatinDiacritics(text.normalize('NFC').replace(ZERO_WIDTH, '')))
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
}

/** URL slug from Latin text: "Cox's Bazar" → "coxs-bazar". */
export function slugifyLatin(text: string): string {
  return stripLatinDiacritics(text)
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import nlpStopwords from '../../generated/nlp.stopwords';
import nlpSuffixes from '../../generated/nlp.suffixes';
import type { BanglaSuffix, Stopword } from './schemas';

// Fast lookup set of NFC-normalized stopwords
const stopwordSet = new Set(nlpStopwords.map((s) => s.word.normalize('NFC')));

// Sorted suffixes: longest first, then lowest priority number (higher precedence)
const sortedSuffixes: BanglaSuffix[] = [...nlpSuffixes].sort((a, b) => {
  if (b.suffix.length !== a.suffix.length) {
    return b.suffix.length - a.suffix.length;
  }
  return a.priority - b.priority;
});

// All unique categories in the stopword corpus
const allCategories = Array.from(new Set(nlpStopwords.map((s) => s.category))).sort();

export interface ListStopwordsOptions {
  category?: string;
  limit?: number;
  offset?: number;
}

export function listStopwords(opts: ListStopwordsOptions = {}) {
  let list = nlpStopwords;
  if (opts.category) {
    const cat = opts.category.toLowerCase().trim();
    list = list.filter((s) => s.category.toLowerCase() === cat);
  }

  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? 1000;
  const paginated = list.slice(offset, offset + limit);

  return {
    count: list.length,
    categories: allCategories,
    words: paginated.map((s) => s.word),
  };
}

export function removeStopwords(text: string) {
  const normalized = text.normalize('NFC');
  const removedSet = new Set<string>();
  let removedCount = 0;

  // Split on word boundaries while tracking stopwords
  // A Bengali word token is a sequence of Bengali or alphanumeric characters
  const tokenRegex = /([\u0980-\u09FFa-zA-Z0-9]+|[^\u0980-\u09FFa-zA-Z0-9\s]+|\s+)/gu;
  const parts: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(normalized)) !== null) {
    const chunk = match[0];
    const cleanWord = chunk.trim().normalize('NFC');
    if (cleanWord && stopwordSet.has(cleanWord)) {
      removedSet.add(cleanWord);
      removedCount++;
    } else {
      parts.push(chunk);
    }
  }

  // Clean up multiple spaces left by removed words
  const cleaned = parts
    .join('')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([।,;:!?])/g, '$1')
    .replace(/^\s+|\s+$/g, '');

  return {
    original: text,
    cleaned,
    removed_count: removedCount,
    removed_words: Array.from(removedSet).sort(),
  };
}

export interface NormalizeOptions {
  strip_zw?: boolean;
}

export function normalizeBangla(text: string, options: NormalizeOptions = {}) {
  const original = text;
  let normalized = text.normalize('NFC');

  // Strip Byte Order Mark (BOM) and Zero-Width Space
  normalized = normalized.replace(/[\uFEFF\u200B]/g, '');

  // Strip or clean Zero-Width Joiner (ZWJ U+200D) and Zero-Width Non-Joiner (ZWNJ U+200C)
  if (options.strip_zw !== false) {
    normalized = normalized.replace(/[\u200C\u200D]/g, '');
  }

  // Canonicalize nukta decomposed characters:
  // ড (U+09A1) + ় (U+09BC) -> ড় (U+09DC)
  normalized = normalized.replace(/\u09A1\u09BC/g, '\u09DC');
  // ঢ (U+09A2) + ় (U+09BC) -> ঢ় (U+09DD)
  normalized = normalized.replace(/\u09A2\u09BC/g, '\u09DD');
  // য (U+09AF) + ় (U+09BC) -> য় (U+09DF)
  normalized = normalized.replace(/\u09AF\u09BC/g, '\u09DF');

  // Standardize non-breaking space
  normalized = normalized.replace(/\u00A0/g, ' ');

  // Standardize multiple horizontal spaces
  normalized = normalized.replace(/[ \t]+/g, ' ');

  // Trim extra whitespace at ends of lines
  normalized = normalized
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();

  return {
    original,
    normalized,
    changes_detected: original !== normalized,
  };
}

export function tokenizeText(text: string, mode: 'word' | 'sentence' = 'word') {
  const normalized = text.normalize('NFC').trim();

  if (mode === 'sentence') {
    // Split on Bengali sentence terminals: ।, ॥, ?, !, and line breaks
    const rawSentences = normalized
      .split(/([।॥?!]+|\n+)/u)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^[।॥?!]+$/u.test(s));

    return {
      mode: 'sentence' as const,
      count: rawSentences.length,
      tokens: rawSentences,
    };
  }

  // Word tokenization: matches contiguous Bengali and alphanumeric word characters
  const wordTokens = normalized.match(/[\u0980-\u09FFa-zA-Z0-9]+/gu) ?? [];

  return {
    mode: 'word' as const,
    count: wordTokens.length,
    tokens: wordTokens,
  };
}

export interface StemResult {
  input: string;
  stem: string;
  suffix?: string;
  rule_applied?: string;
}

export function stemWord(word: string): StemResult {
  const normalized = word.normalize('NFC').trim();

  // If word is too short (2 or fewer characters), do not strip suffixes
  if (normalized.length <= 2) {
    return { input: normalized, stem: normalized };
  }

  for (const rule of sortedSuffixes) {
    if (normalized.endsWith(rule.suffix)) {
      const remainder = normalized.slice(0, -rule.suffix.length);
      // Ensure stem has at least 2 characters to prevent over-stemming
      if (remainder.length >= 2) {
        return {
          input: normalized,
          stem: remainder,
          suffix: rule.suffix,
          rule_applied: rule.description,
        };
      }
    }
  }

  return {
    input: normalized,
    stem: normalized,
  };
}

export function stemWords(words: string[]): StemResult[] {
  return words.map((w) => stemWord(w));
}

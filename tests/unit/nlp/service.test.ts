import { describe, expect, it } from 'vitest';
import {
  listStopwords,
  normalizeBangla,
  removeStopwords,
  stemWord,
  stemWords,
  tokenizeText,
} from '../../../src/modules/nlp/service';

describe('NLP Service: Stopwords', () => {
  it('lists stopwords and supports category filtering', () => {
    const all = listStopwords();
    expect(all.count).toBeGreaterThan(400);
    expect(all.words).toContain('এবং');
    expect(all.words).toContain('কিন্তু');
    expect(all.categories.length).toBeGreaterThan(5);

    const conjunctions = listStopwords({ category: 'conjunction' });
    expect(conjunctions.words).toContain('এবং');
    expect(conjunctions.words).toContain('অথবা');
  });

  it('removes stopwords from text while preserving non-stopword structure', () => {
    const text = 'আমি এবং আমার ভাই গতকাল স্কুলে গিয়েছিলাম কিন্তু সেখানে কেউ ছিল না।';
    const result = removeStopwords(text);

    expect(result.original).toBe(text);
    expect(result.removed_count).toBeGreaterThan(0);
    expect(result.removed_words).toContain('আমি');
    expect(result.removed_words).toContain('এবং');
    expect(result.removed_words).toContain('কিন্তু');
    expect(result.cleaned).toContain('ভাই');
    expect(result.cleaned).toContain('স্কুলে');
  });
});

describe('NLP Service: Normalizer', () => {
  it('converts to NFC and strips zero-width non-joiners', () => {
    // String with zero-width non-joiner \u200C
    const textWithZw = 'বাংলা\u200Cদেশ একটি সু\u200Dন্দর দেশ।';
    const result = normalizeBangla(textWithZw);

    expect(result.changes_detected).toBe(true);
    expect(result.normalized).toBe('বাংলাদেশ একটি সুন্দর দেশ।');
  });

  it('normalizes decomposed nukta sequences into canonical composite characters', () => {
    // ড + nukta -> ড়
    const decomposed = 'গা\u09A1\u09BCি'; // গাড়ি
    const result = normalizeBangla(decomposed);
    expect(result.normalized).toBe('গাড়ি');
  });

  it('normalizes multiple spaces and trims lines', () => {
    const messy = '  ঢাকা   মেট্রোরেল   ।  \n   মতিঝিল   ';
    const result = normalizeBangla(messy);
    expect(result.normalized).toBe('ঢাকা মেট্রোরেল ।\nমতিঝিল');
  });
});

describe('NLP Service: Tokenizer', () => {
  it('tokenizes sentences on Bengali Dari (।), ?, and !', () => {
    const text = 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ! তুমি কেমন আছো? ভালো।';
    const result = tokenizeText(text, 'sentence');

    expect(result.mode).toBe('sentence');
    expect(result.count).toBe(4);
    expect(result.tokens[0]).toBe('আমার সোনার বাংলা, আমি তোমায় ভালোবাসি');
    expect(result.tokens[1]).toBe('চিরদিন তোমার আকাশ');
    expect(result.tokens[2]).toBe('তুমি কেমন আছো');
    expect(result.tokens[3]).toBe('ভালো');
  });

  it('tokenizes words while respecting Bengali conjunctive ligatures', () => {
    const text = 'সোনার বাংলা, আমি তোমায় ভালোবাসি!';
    const result = tokenizeText(text, 'word');

    expect(result.mode).toBe('word');
    expect(result.tokens).toEqual(['সোনার', 'বাংলা', 'আমি', 'তোমায়', 'ভালোবাসি']);
  });
});

describe('NLP Service: Stemmer', () => {
  it('stems common Bengali noun case markers and plural suffixes', () => {
    expect(stemWord('ছাত্রদেরকে')).toMatchObject({
      input: 'ছাত্রদেরকে',
      stem: 'ছাত্র',
      suffix: 'দেরকে',
    });

    expect(stemWord('বইগুলো')).toMatchObject({
      input: 'বইগুলো',
      stem: 'বই',
      suffix: 'গুলো',
    });

    expect(stemWord('শিক্ষকগণের')).toMatchObject({
      input: 'শিক্ষকগণের',
      stem: 'শিক্ষক',
      suffix: 'গণের',
    });

    expect(stemWord('বাংলাদেশকে')).toMatchObject({
      input: 'বাংলাদেশকে',
      stem: 'বাংলাদেশ',
      suffix: 'কে',
    });
  });

  it('stems verbal inflections and adverbial suffixes', () => {
    expect(stemWord('করেছিলেন')).toMatchObject({
      stem: 'করে',
      suffix: 'ছিলেন',
    });

    expect(stemWord('স্বাভাবিকভাবে')).toMatchObject({
      stem: 'স্বাভাবিক',
      suffix: 'ভাবে',
    });
  });

  it('protects short words from over-stemming', () => {
    expect(stemWord('কে')).toMatchObject({ input: 'কে', stem: 'কে' });
    expect(stemWord('সে')).toMatchObject({ input: 'সে', stem: 'সে' });
    expect(stemWord('তে')).toMatchObject({ input: 'তে', stem: 'তে' });
  });

  it('supports batch word stemming', () => {
    const batch = stemWords(['ছাত্রদেরকে', 'বইগুলো', 'স্বাভাবিকভাবে']);
    expect(batch).toHaveLength(3);
    expect(batch[0].stem).toBe('ছাত্র');
    expect(batch[1].stem).toBe('বই');
    expect(batch[2].stem).toBe('স্বাভাবিক');
  });
});

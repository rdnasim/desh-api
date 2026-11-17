import { describe, expect, it } from 'vitest';
import {
  NormalizeResponseSchema,
  StemResponseSchema,
  StopwordRemoveResponseSchema,
  StopwordsResponseSchema,
  TokenizeResponseSchema,
} from '../../src/modules/nlp/schemas';
import { call, expectError, expectOk } from './helpers';

function callPost(path: string, body: unknown) {
  return call(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('Bangla NLP Contract Tests', () => {
  it('GET /v1/nlp/stopwords lists canonical stopwords citing Bangla Academy', async () => {
    const res = await call('/v1/nlp/stopwords');
    expect(res.headers.get('cache-control')).toContain('public');
    const body = await expectOk(res, StopwordsResponseSchema);
    expect(body.data.count).toBeGreaterThanOrEqual(400);
    expect(body.data.words).toContain('এবং');
    expect(body.meta.source).toContain('Bangla Academy');
  });

  it('GET /v1/nlp/stopwords supports category filtering', async () => {
    const res = await call('/v1/nlp/stopwords?category=conjunction');
    const body = await expectOk(res, StopwordsResponseSchema);
    expect(body.data.words).toContain('এবং');
    expect(body.data.words).toContain('বা');
  });

  it('POST /v1/nlp/stopwords/remove strips stopwords and reports inventory', async () => {
    const res = await callPost('/v1/nlp/stopwords/remove', {
      text: 'আমি এবং আমার ভাই বাজারে গিয়েছিলাম কিন্তু কিছু পাই নাই।',
    });
    expect(res.headers.get('cache-control')).toContain('no-store');
    const body = await expectOk(res, StopwordRemoveResponseSchema);
    expect(body.data.removed_count).toBeGreaterThan(0);
    expect(body.data.removed_words).toContain('আমি');
    expect(body.data.removed_words).toContain('এবং');
    expect(body.data.cleaned).toContain('ভাই বাজারে গিয়েছিলাম');
  });

  it('POST /v1/nlp/normalize converts to NFC and cleans ZW characters', async () => {
    const res = await callPost('/v1/nlp/normalize', {
      text: 'বাংলা\u200Cদেশ একটি সু\u200Dন্দর দেশ।',
    });
    const body = await expectOk(res, NormalizeResponseSchema);
    expect(body.data.changes_detected).toBe(true);
    expect(body.data.normalized).toBe('বাংলাদেশ একটি সুন্দর দেশ।');
  });

  it('POST /v1/nlp/tokenize splits sentences and words', async () => {
    const sentRes = await callPost('/v1/nlp/tokenize', {
      text: 'আমার সোনার বাংলা। আমি তোমায় ভালোবাসি! কেমন আছো?',
      mode: 'sentence',
    });
    const sentBody = await expectOk(sentRes, TokenizeResponseSchema);
    expect(sentBody.data.count).toBe(3);
    expect(sentBody.data.tokens[0]).toBe('আমার সোনার বাংলা');

    const wordRes = await callPost('/v1/nlp/tokenize', {
      text: 'আমার সোনার বাংলা',
      mode: 'word',
    });
    const wordBody = await expectOk(wordRes, TokenizeResponseSchema);
    expect(wordBody.data.tokens).toEqual(['আমার', 'সোনার', 'বাংলা']);
  });

  it('POST /v1/nlp/stem strips inflectional suffixes for single and batch requests', async () => {
    const singleRes = await callPost('/v1/nlp/stem', {
      word: 'ছাত্রদেরকে',
    });
    const singleBody = await expectOk(singleRes, StemResponseSchema);
    expect(singleBody.data.stem).toBe('ছাত্র');
    expect(singleBody.data.suffix).toBe('দেরকে');

    const batchRes = await callPost('/v1/nlp/stem', {
      words: ['ছাত্রদেরকে', 'বইগুলো'],
    });
    const batchBody = await expectOk(batchRes, StemResponseSchema);
    expect(batchBody.data.results).toBeDefined();
    expect(batchBody.data.results![0]?.stem).toBe('ছাত্র');
    expect(batchBody.data.results![1]?.stem).toBe('বই');
  });

  it('rejects empty inputs with 400', async () => {
    await expectError(
      await callPost('/v1/nlp/stopwords/remove', { text: '' }),
      400,
      'invalid_parameter',
    );
    await expectError(
      await callPost('/v1/nlp/normalize', { text: '' }),
      400,
      'invalid_parameter',
    );
    await expectError(
      await callPost('/v1/nlp/tokenize', { text: '' }),
      400,
      'invalid_parameter',
    );
  });
});

# Architecture & Implementation Plan: 023-bangla-nlp

## 1. Data Design
- `data/nlp/stopwords.json`: Curated array of 400+ unique, sorted Bengali stopwords.
- `data/nlp/suffixes.json`: Ordered inflection rules for noun cases, plural suffixes, and verb endings.
- Register in `scripts/datasets.ts` and add metadata in `data/meta.json`.

## 2. Types & Schemas
- `src/modules/nlp/schemas.ts`:
  - `StopwordsResponseSchema`: array of string tokens with count and language metadata.
  - `NormalizeRequestSchema`: `{ text: string, strip_zw: boolean }`
  - `NormalizeResponseSchema`: `{ original: string, normalized: string }`
  - `TokenizeRequestSchema`: `{ text: string, mode: 'word' | 'sentence' }`
  - `TokenizeResponseSchema`: `{ tokens: string[], count: number }`
  - `StemRequestSchema`: `{ word: string }` or `{ words: string[] }`
  - `StemResponseSchema`: `{ input: string, stem: string, suffix?: string }`

## 3. Service Layer
- `src/modules/nlp/service.ts`:
  - `getStopwords()`
  - `removeStopwords(text)`
  - `normalizeBanglaText(text, options)`
  - `tokenizeWords(text)`
  - `tokenizeSentences(text)`
  - `stemWord(word)`

## 4. Routes
- `src/modules/nlp/routes.ts`: mount under `/v1/nlp` in `src/app.ts`.

## 5. Verification
- Golden-file tests for tokenization and stemming edge cases.
- Unit and contract tests in `tests/unit/nlp/` and `tests/contract/nlp.test.ts`.

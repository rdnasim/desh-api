# Feature Specification: 023-bangla-nlp (Bangla NLP Toolkit)

**Feature Branch**: `023-bangla-nlp`  
**Status**: Built  
**Input**: Bangla NLP Toolkit: Stopwords list, lightweight rule-based stemmer, word and sentence tokenizers, Unicode normalizer, and parts-of-speech lexical lookups.

---

## 1. Overview

Processing the Bengali language computationally requires addressing distinct linguistic characteristics: complex conjunctive consonant ligatures (যুক্তবর্ণ), combining vowel marks (কার), virama (হসন্ত), nukta (নুকতা), non-ASCII punctuation (। দাড়ি), and extensive morphological agglutination (noun cases and verb conjugations like `-দেরকে`, `-গুলোতে`, `-ছিলেন`).

While heavy machine-learning models require Python environments or GPU infrastructure, web and edge developers frequently need fast, deterministic, low-latency primitives:
1. **Stopword filtering**: 400+ curated high-frequency Bengali functional words.
2. **Text Normalization**: Canonical Unicode NFC representation, cleaning redundant ZWJ/ZWNJ characters, and standardizing alternative forms (য় vs য়, ড় vs ড়).
3. **Word & Sentence Tokenization**: Splitting text into clean token arrays respecting Bengali sentence terminals (`।`, `?`, `!`) and word boundaries without destroying compound ligatures.
4. **Lightweight Stemmer**: Deterministic suffix-stripping for standard Bengali inflections (case markers, plurals, verbal inflections).
5. **POS & Dictionary Reference**: Common root word lexicon with grammatical categories.

---

## 2. User Stories

- **US1 (Bangla Stopwords)**: As an NLP/search developer, I can retrieve the canonical list of Bengali stopwords (`GET /v1/nlp/stopwords`) or submit text to have stopwords stripped (`POST /v1/nlp/stopwords/remove`).
- **US2 (Text Normalization)**: As a content editor or indexer, I can pass malformed or mixed Bengali text to receive clean NFC Unicode text with sanitized zero-width characters (`POST /v1/nlp/normalize`).
- **US3 (Sentence & Word Tokenization)**: As an LLM prompt engineer or search engine builder, I can tokenize a Bengali paragraph into sentences or words (`POST /v1/nlp/tokenize`).
- **US4 (Rule-Based Stemmer)**: As an information retrieval developer, I can extract root stems from inflected Bengali words (e.g. `ছাত্রদের` → `ছাত্র`, `বইগুলো` → `বই`) (`POST /v1/nlp/stem`).

---

## 3. Endpoints

- `GET /v1/nlp/stopwords` — Retrieve canonical list of 400+ Bengali stopwords.
- `POST /v1/nlp/stopwords/remove` — Remove stopwords from input text.
- `POST /v1/nlp/normalize` — Clean and normalize Bengali text (Unicode NFC, ZWJ/ZWNJ cleanup).
- `POST /v1/nlp/tokenize` — Tokenize text into words or sentences (`mode=word|sentence`).
- `POST /v1/nlp/stem` — Strip common grammatical suffixes to yield word stems.

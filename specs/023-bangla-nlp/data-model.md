# Data Model: 023-bangla-nlp

```typescript
export interface StopwordList {
  language: 'bn';
  count: number;
  words: string[];
}

export interface BanglaTokenizeResult {
  mode: 'word' | 'sentence';
  count: number;
  tokens: string[];
}

export interface BanglaStemResult {
  input: string;
  stem: string;
  suffix?: string;
  rule_applied?: string;
}

export interface BanglaNormalizeResult {
  original: string;
  normalized: string;
  changes_detected: boolean;
}
```

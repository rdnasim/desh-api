import { BIJOY_TO_ENTRY, MAX_BIJOY_KEY, REPH } from './bijoy-map';
import type { BijoyKind } from './schemas';

interface Token {
  kind: BijoyKind | 'text';
  unicode: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (let len = Math.min(MAX_BIJOY_KEY, text.length - i); len > 0; len--) {
      const entry = BIJOY_TO_ENTRY.get(text.slice(i, i + len));
      if (entry) {
        tokens.push({ kind: entry.kind, unicode: entry.unicode });
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ kind: 'text', unicode: text[i] as string });
      i++;
    }
  }
  return tokens;
}

const CLUSTER_START = new Set<Token['kind']>(['consonant', 'conjunct', 'half']);

/**
 * Bijoy stores text in visual order: pre-base vowel signs (ি ে ৈ) come before the consonant
 * cluster and reph (র্) comes after it. Unicode stores logical order, so each syllable is
 * re-assembled as reph + cluster + vowel signs.
 */
export function bijoyToUnicode(text: string): string {
  const tokens = tokenize(text);
  let out = '';
  let pending = '';
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i] as Token;
    if (t.kind === 'pre_base_sign') {
      pending += t.unicode;
      i++;
      continue;
    }
    if (!CLUSTER_START.has(t.kind)) {
      out += pending + t.unicode;
      pending = '';
      i++;
      continue;
    }

    // Consonant cluster: half forms then a full glyph, plus phalas and explicit hasanta.
    let cluster = '';
    while (i < tokens.length && (tokens[i] as Token).kind === 'half')
      cluster += (tokens[i++] as Token).unicode;
    const head = tokens[i];
    if (head && (head.kind === 'consonant' || head.kind === 'conjunct')) {
      cluster += head.unicode;
      i++;
    }
    let reph = false;
    let signs = '';
    while (i < tokens.length) {
      const next = tokens[i] as Token;
      if (next.kind === 'phala' || next.kind === 'hasanta') cluster += next.unicode;
      else if (next.kind === 'reph') reph = true;
      else if (next.kind === 'vowel_sign') signs += next.unicode;
      else break;
      i++;
    }
    out += (reph ? REPH : '') + cluster + pending + signs;
    pending = '';
  }
  out += pending;
  // NFC composes ে + া → ো and ে + ৗ → ৌ.
  return out.replaceAll('অা', 'আ').normalize('NFC');
}

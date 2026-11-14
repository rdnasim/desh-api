import { HASANTA, MAX_UNICODE_KEY, NUKTA, UNICODE_TO_ENTRY } from './bijoy-map';

const PRE_BASE = new Set(['ি', 'ে', 'ৈ']);
const VOWEL_SIGNS = new Set(['া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ৗ']);

const isConsonant = (ch: string | undefined) =>
  ch !== undefined &&
  ((ch >= 'ক' && ch <= 'হ') || ch === 'ড়' || ch === 'ঢ়' || ch === 'য়' || ch === 'ৎ');

const bijoy = (unicode: string) => UNICODE_TO_ENTRY.get(unicode)?.bijoy;

/** Phalas Bijoy typists write as a phala rather than a half form + consonant (স্ব = m^). */
const PREFERRED_PHALAS = new Set(['্ব', '্য', '্র', '্ল', '্ম', '্ন']);

/** Greedy longest-match encoding of one consonant cluster (e.g. "স্ক্র" → half স + ক্র). */
function encodeCluster(cluster: string): string {
  let out = '';
  let i = 0;
  while (i < cluster.length) {
    let matched = false;
    for (let len = Math.min(MAX_UNICODE_KEY, cluster.length - i); len > 0; len--) {
      const part = cluster.slice(i, i + len);
      const entry = UNICODE_TO_ENTRY.get(part);
      // A half form (ending in hasanta) is only valid when more of the cluster follows, and
      // is skipped when the next consonant has a standard phala form.
      const isHalf = part.endsWith(HASANTA);
      const phalaNext = isHalf && PREFERRED_PHALAS.has(HASANTA + (cluster[i + len] ?? ''));
      if (entry && !(isHalf && (i + len >= cluster.length || phalaNext))) {
        out += entry.bijoy;
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = cluster[i] as string;
      out += ch === HASANTA ? (bijoy('্‌') ?? '&') : ch;
      i++;
    }
  }
  return out;
}

export function unicodeToBijoy(text: string): string {
  // Split ো/ৌ into their visual parts: ে goes before the consonant, া/ৗ after it.
  const chars = [
    ...text
      .normalize('NFC')
      .replaceAll('\u09CB', '\u09C7\u09BE')
      .replaceAll('\u09CC', '\u09C7\u09D7'),
  ];
  let out = '';
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i] as string;
    const reph = ch === 'র' && chars[i + 1] === HASANTA && isConsonant(chars[i + 2]);
    if (!reph && !isConsonant(ch)) {
      const two = ch + (chars[i + 1] ?? '');
      if (bijoy(two) && two.length === 2) {
        out += bijoy(two);
        i += 2;
      } else {
        out += bijoy(ch) ?? ch;
        i++;
      }
      continue;
    }

    if (reph) i += 2;
    // Cluster: consonant (+ nukta) joined by hasanta to further consonants.
    let cluster = '';
    while (i < chars.length) {
      cluster += chars[i++];
      if (chars[i] === NUKTA) cluster += chars[i++];
      if (chars[i] === HASANTA && isConsonant(chars[i + 1])) cluster += chars[i++];
      else break;
    }
    let explicitHasanta = false;
    if (chars[i] === HASANTA) {
      explicitHasanta = true;
      i++;
      if (chars[i] === '‌') i++;
    }
    let pre = '';
    let post = '';
    while (i < chars.length && VOWEL_SIGNS.has(chars[i] as string)) {
      const sign = chars[i++] as string;
      if (PRE_BASE.has(sign) && !pre && !post) pre = bijoy(sign) ?? sign;
      else post += bijoy(sign) ?? sign;
    }
    out += pre + encodeCluster(cluster) + (explicitHasanta ? (bijoy('্‌') ?? '&') : '');
    out += (reph ? (bijoy('র্') ?? '©') : '') + post;
  }
  return out;
}

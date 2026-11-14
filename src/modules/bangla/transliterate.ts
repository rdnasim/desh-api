// Avro Phonetic engine: @subhesadek/avro-phonetic (MPL-2.0), used unmodified as a dependency.
import { toBangla } from '@subhesadek/avro-phonetic';

export function transliterate(text: string) {
  return { input: text, output: toBangla(text), scheme: 'avro-phonetic' as const };
}

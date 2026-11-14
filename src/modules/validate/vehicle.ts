import aliases from '../../generated/validate.vehicle-area-aliases';
import { toBanglaDigits, toLatinDigits } from '../../lib/digits';
import { normalizeForSearch } from '../../lib/normalize';
import type { Ref } from '../../lib/schemas';
import { getDistrict, listDistricts } from '../geo/service';
import { invalid } from './common';
import type { ValidationResult } from './schemas';

/** Common English renderings of plate class letters; retroflex letters (ট ঠ ড ঢ ণ) are Bangla-only. */
const LATIN_CLASS: Record<string, string> = {
  ka: 'ক',
  kha: 'খ',
  ga: 'গ',
  gha: 'ঘ',
  cha: 'চ',
  chha: 'ছ',
  ja: 'জ',
  jha: 'ঝ',
  ta: 'ত',
  tha: 'থ',
  da: 'দ',
  dha: 'ধ',
  na: 'ন',
  pa: 'প',
  pha: 'ফ',
  ba: 'ব',
  bha: 'ভ',
  ma: 'ম',
  ya: 'য',
  ra: 'র',
  la: 'ল',
  sha: 'শ',
  sa: 'স',
  ha: 'হ',
};

const BANGLA_PLATE = /^([ঀ-৿]+)(?:\s+(মেট্রো))?\s*-\s*([ঀ-৿])\s*(\d{2})\s*-\s*(\d{4})$/;
const LATIN_PLATE = /^([A-Za-z' ]+?)(?:\s+(metro))?\s*-\s*([A-Za-z]+)\s*(\d{2})\s*-\s*(\d{4})$/i;
const isConsonant = (ch: string) => ch >= 'ক' && ch <= 'হ';

interface Area {
  district: Ref;
  /** How the area is written on the plate (district name or a plate abbreviation). */
  label_bn: string;
}

const byBangla = new Map<string, Area>();
const byLatin = new Map<string, Area>();
for (const d of listDistricts()) {
  const area = {
    district: { slug: d.slug, name_en: d.name_en, name_bn: d.name_bn },
    label_bn: d.name_bn,
  };
  byBangla.set(d.name_bn, area);
  for (const name of [d.name_en, ...d.aliases]) byLatin.set(normalizeForSearch(name), area);
}
for (const a of aliases) {
  const d = getDistrict(a.district);
  if (!d) continue;
  const area = {
    district: { slug: d.slug, name_en: d.name_en, name_bn: d.name_bn },
    label_bn: a.alias_bn,
  };
  byBangla.set(a.alias_bn, area);
  byLatin.set(normalizeForSearch(a.alias_en), area);
}

/**
 * Registration plate format check: `<area>[ মেট্রো]-<class letter> <2-digit series>-<4-digit number>`.
 * Class letters are checked to be Bangla consonants; what each class means is not asserted.
 */
export function validateVehicle(input: string): ValidationResult {
  const text = toLatinDigits(input.normalize('NFC')).trim().replace(/\s+/g, ' ');
  const bangla = BANGLA_PLATE.exec(text);
  const latin = bangla ? null : LATIN_PLATE.exec(text);
  const m = bangla ?? latin;
  if (!m) return invalid('vehicle', 'invalid_format');
  const [, areaText = '', metroText, classText = '', seriesText = '', numberText = ''] = m;

  if (Number(numberText) === 0) return invalid('vehicle', 'invalid_format');
  let classLetter: string | undefined;
  if (bangla) {
    if (!isConsonant(classText)) return invalid('vehicle', 'invalid_format');
    classLetter = classText;
  } else {
    classLetter = LATIN_CLASS[classText.toLowerCase()];
    if (!classLetter) return invalid('vehicle', 'unknown_class');
  }
  const area = bangla ? byBangla.get(areaText) : byLatin.get(normalizeForSearch(areaText));
  if (!area) return invalid('vehicle', 'unknown_area');

  const metro = metroText !== undefined;
  const series = Number(seriesText);
  const number = Number(numberText);
  return {
    type: 'vehicle',
    valid: true,
    normalized: `${area.label_bn}${metro ? ' মেট্রো' : ''}-${classLetter} ${toBanglaDigits(seriesText)}-${toBanglaDigits(numberText)}`,
    details: { area: area.district, metro, class: classLetter, series, number },
  };
}

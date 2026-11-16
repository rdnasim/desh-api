import { toLatinDigits } from '../../lib/digits';
import { normalizeForSearch, slugifyLatin } from '../../lib/normalize';
import constituenciesData from '../../generated/geo.constituencies';
import districtsData from '../../generated/geo.districts';
import type { Constituency, DistrictConstituencies } from './schemas';

export interface ListConstituenciesOptions {
  division?: string;
  district?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export function listConstituencies(options: ListConstituenciesOptions = {}): {
  items: Constituency[];
  total: number;
} {
  let filtered = constituenciesData;

  if (options.division) {
    const divSlug = slugifyLatin(options.division);
    filtered = filtered.filter((c) => c.division.toLowerCase() === divSlug);
  }

  if (options.district) {
    const distSlug = slugifyLatin(options.district);
    filtered = filtered.filter((c) => c.district.toLowerCase() === distSlug);
  }

  if (options.search) {
    const q = normalizeForSearch(options.search);
    if (q) {
      filtered = filtered.filter((c) => {
        const searchable = normalizeForSearch(
          `${c.number} ${c.number_bn} ${c.code} ${c.name_en} ${c.name_bn} ${c.area_en} ${c.area_bn}`,
        );
        return searchable.includes(q);
      });
    }
  }

  const total = filtered.length;
  const offset = Math.max(0, options.offset ?? 0);
  const limit = options.limit ? Math.max(1, options.limit) : total;

  return {
    items: filtered.slice(offset, offset + limit),
    total,
  };
}

export function getConstituency(identifier: string | number): Constituency | null {
  const raw = String(identifier).trim();
  const latinDigits = toLatinDigits(raw);

  if (/^\d+$/.test(latinDigits)) {
    const num = Number.parseInt(latinDigits, 10);
    return constituenciesData.find((c) => c.number === num) ?? null;
  }

  const slug = slugifyLatin(raw);
  return (
    constituenciesData.find(
      (c) =>
        c.code.toLowerCase() === slug ||
        c.name_en.toLowerCase() === raw.toLowerCase() ||
        c.name_bn === raw,
    ) ?? null
  );
}

export function listDistrictBreakdowns(options: {
  division?: string;
  district?: string;
} = {}): DistrictConstituencies[] {
  const districtMap = new Map<string, (typeof districtsData)[number]>();
  for (const d of districtsData) {
    districtMap.set(d.slug, d);
  }

  const grouped = new Map<string, Constituency[]>();
  for (const c of constituenciesData) {
    const list = grouped.get(c.district) ?? [];
    list.push(c);
    grouped.set(c.district, list);
  }

  let results: DistrictConstituencies[] = [];
  for (const [distSlug, seats] of grouped.entries()) {
    const dist = districtMap.get(distSlug);
    if (!dist) continue;

    results.push({
      district: dist.slug,
      district_name_en: dist.name_en,
      district_name_bn: dist.name_bn,
      division: dist.division,
      seat_count: seats.length,
      constituencies: seats.map((s) => ({
        number: s.number,
        number_bn: s.number_bn,
        code: s.code,
        name_en: s.name_en,
        name_bn: s.name_bn,
      })),
    });
  }

  if (options.division) {
    const divSlug = slugifyLatin(options.division);
    results = results.filter((r) => r.division.toLowerCase() === divSlug);
  }

  if (options.district) {
    const distSlug = slugifyLatin(options.district);
    results = results.filter((r) => r.district.toLowerCase() === distSlug);
  }

  return results.sort((a, b) => a.district.localeCompare(b.district));
}

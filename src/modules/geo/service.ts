import cityCorporations from '../../generated/geo.city-corporations';
import districts from '../../generated/geo.districts';
import divisions from '../../generated/geo.divisions';
import postcodes from '../../generated/geo.postcodes';
import searchIndex from '../../generated/geo.search-index';
import unions from '../../generated/geo.unions';
import upazilas from '../../generated/geo.upazilas';
import { normalizeForSearch, slugifyLatin } from '../../lib/normalize';
import type { Ref } from '../../lib/schemas';
import type {
  District,
  Division,
  GeoLevel,
  Parents,
  PostOffice,
  SearchHit,
  Union,
  Upazila,
} from './schemas';

const bySlug = <T extends { slug: string }>(rows: readonly T[]) =>
  new Map(rows.map((r) => [r.slug, r]));

function groupBy<T>(rows: readonly T[], key: (r: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }
  return map;
}

const divisionMap = bySlug(divisions);
const districtMap = bySlug(districts);
const upazilaMap = bySlug(upazilas);
const cityCorporationMap = bySlug(cityCorporations);
const districtsByDivision = groupBy(districts, (d) => d.division);
const upazilasByDistrict = groupBy(upazilas, (u) => u.district);
const unionsByUpazila = groupBy(unions, (u) => u.upazila);
const officesByPostcode = groupBy(postcodes, (p) => p.postcode);

const ref = (r: { slug: string; name_en: string; name_bn: string }): Ref => ({
  slug: r.slug,
  name_en: r.name_en,
  name_bn: r.name_bn,
});

export const listDivisions = (): Division[] => divisions;
export const getDivision = (slug: string) => divisionMap.get(slug);
export const getDistrict = (slug: string) => districtMap.get(slug);
export const getUpazila = (slug: string) => upazilaMap.get(slug);

export function listDistricts(division?: string): District[] {
  return division === undefined ? districts : (districtsByDivision.get(division) ?? []);
}

export const listUpazilas = (district: string): Upazila[] => upazilasByDistrict.get(district) ?? [];
export const listUnions = (upazila: string): Union[] => unionsByUpazila.get(upazila) ?? [];
export const lookupPostcode = (code: string): PostOffice[] => officesByPostcode.get(code) ?? [];

/** Parent chain for any record that references a district, upazila, or city corporation. */
export function parentsOf(r: {
  division?: string;
  district?: string;
  upazila?: string;
  city_corporation?: string;
}): Parents {
  const parents: Parents = {};
  const upazila = r.upazila ? upazilaMap.get(r.upazila) : undefined;
  if (upazila) parents.upazila = ref(upazila);
  const districtSlug = r.district ?? upazila?.district;
  const district = districtSlug ? districtMap.get(districtSlug) : undefined;
  if (district) parents.district = ref(district);
  const divisionSlug = r.division ?? district?.division;
  const division = divisionSlug ? divisionMap.get(divisionSlug) : undefined;
  if (division) parents.division = ref(division);
  const cc = r.city_corporation ? cityCorporationMap.get(r.city_corporation) : undefined;
  if (cc) parents.city_corporation = ref(cc);
  return parents;
}

function toHit(level: GeoLevel, index: number): SearchHit {
  switch (level) {
    case 'division': {
      const d = divisions[index] as Division;
      return { level, ...ref(d), parents: {} };
    }
    case 'district': {
      const d = districts[index] as District;
      return { level, ...ref(d), parents: parentsOf({ division: d.division }) };
    }
    case 'upazila': {
      const u = upazilas[index] as Upazila;
      return { level, ...ref(u), parents: parentsOf({ district: u.district }) };
    }
    case 'union': {
      const u = unions[index] as Union;
      return { level, ...ref(u), parents: parentsOf({ upazila: u.upazila }) };
    }
    case 'post_office': {
      const p = postcodes[index] as PostOffice;
      return {
        level,
        slug: slugifyLatin(p.name_en),
        name_en: p.name_en,
        name_bn: p.name_bn,
        postcode: p.postcode,
        parents: parentsOf(p),
      };
    }
  }
}

const LEVEL_RANK: Record<GeoLevel, number> = {
  division: 0,
  district: 1,
  upazila: 2,
  post_office: 3,
  union: 4,
};

/** Lower is better: 0 exact, 1 prefix, 2 word prefix, 3 substring. */
function matchScore(text: string, query: string): number | null {
  let best: number | null = null;
  for (const variant of text.split('|')) {
    let score: number | null = null;
    if (variant === query) score = 0;
    else if (variant.startsWith(query)) score = 1;
    else if (variant.includes(` ${query}`)) score = 2;
    else if (variant.includes(query)) score = 3;
    if (score !== null && (best === null || score < best)) best = score;
    if (best === 0) break;
  }
  return best;
}

export interface SearchOptions {
  level?: GeoLevel;
  limit?: number;
}

export function search(query: string, { level, limit = 10 }: SearchOptions = {}): SearchHit[] {
  const q = normalizeForSearch(query);
  if (!q) return [];
  const matches: { score: number; level: GeoLevel; index: number; text: string }[] = [];
  for (const [text, rowLevel, index] of searchIndex) {
    if (level && rowLevel !== level) continue;
    const score = matchScore(text, q);
    if (score !== null) matches.push({ score, level: rowLevel, index, text });
  }
  matches.sort(
    (a, b) =>
      a.score - b.score || LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || (a.text < b.text ? -1 : 1),
  );
  return matches.slice(0, limit).map((m) => toHit(m.level, m.index));
}

/** Rough bounding box of Bangladesh; coordinates outside it are rejected. */
export const inBangladesh = (lat: number, lon: number) =>
  lat >= 20.5 && lat <= 26.7 && lon >= 88.0 && lon <= 92.7;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function nearest(lat: number, lon: number, level: 'district' | 'upazila') {
  const rows: readonly (District | Upazila)[] = level === 'district' ? districts : upazilas;
  let best: { index: number; km: number } | null = null;
  rows.forEach((r, index) => {
    if (r.lat === undefined || r.lon === undefined) return;
    const km = haversineKm(lat, lon, r.lat, r.lon);
    if (!best || km < best.km) best = { index, km };
  });
  const found = best as { index: number; km: number } | null;
  if (!found) throw new Error(`No ${level} has coordinates`);
  return { area: toHit(level, found.index), distance_km: Math.round(found.km * 100) / 100 };
}

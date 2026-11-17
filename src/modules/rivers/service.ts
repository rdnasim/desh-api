import rivers from '../../generated/rivers.rivers';
import { normalizeForSearch } from '../../lib/normalize';
import type { River } from './schemas';

const sortedRivers = [...rivers].sort((a, b) => a.name_en.localeCompare(b.name_en));

const riverBySlug = new Map(rivers.map((r) => [r.slug, r]));

export interface RiverFilter {
  division?: string;
  district?: string;
  is_transboundary?: boolean;
  q?: string;
}

export function listRivers({ division, district, is_transboundary, q }: RiverFilter = {}): River[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedRivers.filter((r) => {
    if (division !== undefined && !r.divisions.includes(division.toLowerCase())) return false;
    if (district !== undefined && !r.districts.includes(district.toLowerCase())) return false;
    if (is_transboundary !== undefined && r.is_transboundary !== is_transboundary) return false;
    if (query !== undefined) {
      const matchName =
        normalizeForSearch(r.name_en).includes(query) ||
        normalizeForSearch(r.name_bn).includes(query);
      const matchDesc =
        normalizeForSearch(r.description_en).includes(query) ||
        normalizeForSearch(r.description_bn).includes(query);
      const matchOrigin = normalizeForSearch(r.origin).includes(query);
      const matchOutflow = normalizeForSearch(r.outflow).includes(query);
      const matchFeatures = r.special_features.some((f) => normalizeForSearch(f).includes(query));
      if (!matchName && !matchDesc && !matchOrigin && !matchOutflow && !matchFeatures) return false;
    }
    return true;
  });
}

export function getRiver(slug: string): River | undefined {
  return riverBySlug.get(slug.trim().toLowerCase());
}

import heritageSites from '../../generated/heritage.sites';
import { normalizeForSearch } from '../../lib/normalize';
import type { HeritageCategorySchema, HeritageSite, HeritageTypeSchema } from './schemas';
import type { z } from 'zod';

const sortedSites = [...heritageSites].sort((a, b) => a.name_en.localeCompare(b.name_en));

const siteBySlug = new Map(heritageSites.map((s) => [s.slug, s]));
const siteByUnescoId = new Map(
  heritageSites.filter((s) => s.unesco_id !== undefined).map((s) => [s.unesco_id!, s]),
);

export interface HeritageSiteFilter {
  division?: string;
  district?: string;
  category?: z.infer<typeof HeritageCategorySchema>;
  type?: z.infer<typeof HeritageTypeSchema>;
  q?: string;
}

export function listHeritageSites({
  division,
  district,
  category,
  type,
  q,
}: HeritageSiteFilter = {}): HeritageSite[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedSites.filter((s) => {
    if (division !== undefined && s.division !== division.toLowerCase()) return false;
    if (district !== undefined && s.district !== district.toLowerCase()) return false;
    if (category !== undefined && s.category !== category) return false;
    if (type !== undefined && s.type !== type) return false;
    if (query !== undefined) {
      const matchName =
        normalizeForSearch(s.name_en).includes(query) ||
        normalizeForSearch(s.name_bn).includes(query);
      const matchDesc =
        normalizeForSearch(s.description_en).includes(query) ||
        normalizeForSearch(s.description_bn).includes(query);
      const matchHighlights = s.highlights.some((h) => normalizeForSearch(h).includes(query));
      const matchPeriod = s.period_era ? normalizeForSearch(s.period_era).includes(query) : false;
      if (!matchName && !matchDesc && !matchHighlights && !matchPeriod) return false;
    }
    return true;
  });
}

export function getHeritageSite(identifier: string): HeritageSite | undefined {
  const key = identifier.trim().toLowerCase();
  const bySlug = siteBySlug.get(key);
  if (bySlug) return bySlug;

  const num = Number.parseInt(key, 10);
  if (!Number.isNaN(num)) {
    return siteByUnescoId.get(num);
  }

  return undefined;
}

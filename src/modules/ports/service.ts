import landPorts from '../../generated/ports.land-ports';
import { normalizeForSearch } from '../../lib/normalize';
import type { LandPort, LandPortStatusSchema } from './schemas';
import type { z } from 'zod';

const sortedPorts = [...landPorts].sort((a, b) => a.name_en.localeCompare(b.name_en));

const portBySlug = new Map(landPorts.map((p) => [p.slug, p]));
const portByCode = new Map(landPorts.map((p) => [p.code.toUpperCase(), p]));

export interface LandPortFilter {
  division?: string;
  district?: string;
  status?: z.infer<typeof LandPortStatusSchema>;
  has_rail_link?: boolean;
  has_passenger_immigration?: boolean;
  q?: string;
}

export function listLandPorts({
  division,
  district,
  status,
  has_rail_link,
  has_passenger_immigration,
  q,
}: LandPortFilter = {}): LandPort[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedPorts.filter((p) => {
    if (division !== undefined && p.division !== division.toLowerCase()) return false;
    if (district !== undefined && p.district !== district.toLowerCase()) return false;
    if (status !== undefined && p.status !== status) return false;
    if (has_rail_link !== undefined && p.has_rail_link !== has_rail_link) return false;
    if (
      has_passenger_immigration !== undefined &&
      p.has_passenger_immigration !== has_passenger_immigration
    )
      return false;
    if (query !== undefined) {
      const matchName =
        normalizeForSearch(p.name_en).includes(query) ||
        normalizeForSearch(p.name_bn).includes(query);
      const matchCode = normalizeForSearch(p.code).includes(query);
      const matchIndianLcs = normalizeForSearch(p.counterpart_indian_lcs).includes(query);
      const matchState = normalizeForSearch(p.counterpart_state).includes(query);
      const matchDesc =
        normalizeForSearch(p.description_en).includes(query) ||
        normalizeForSearch(p.description_bn).includes(query);
      const matchCommodity = p.key_commodities.some((c) => normalizeForSearch(c).includes(query));
      if (!matchName && !matchCode && !matchIndianLcs && !matchState && !matchDesc && !matchCommodity)
        return false;
    }
    return true;
  });
}

export function getLandPort(codeOrSlug: string): LandPort | undefined {
  const key = codeOrSlug.trim();
  return portByCode.get(key.toUpperCase()) ?? portBySlug.get(key.toLowerCase());
}

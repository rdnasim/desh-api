import type { z } from 'zod';
import airports from '../../generated/airports.airports';
import { normalizeForSearch } from '../../lib/normalize';
import type { Airport, AirportStatusSchema, AirportTypeSchema } from './schemas';

const sortedAirports = [...airports].sort((a, b) => a.name_en.localeCompare(b.name_en));

const airportBySlug = new Map(airports.map((a) => [a.slug, a]));
const airportByIata = new Map(
  airports.filter((a) => a.iata_code).map((a) => [a.iata_code!.toUpperCase(), a]),
);
const airportByIcao = new Map(
  airports.filter((a) => a.icao_code).map((a) => [a.icao_code!.toUpperCase(), a]),
);

export interface AirportFilter {
  division?: string;
  district?: string;
  type?: z.infer<typeof AirportTypeSchema>;
  status?: z.infer<typeof AirportStatusSchema>;
  q?: string;
}

export function listAirports({
  division,
  district,
  type,
  status,
  q,
}: AirportFilter = {}): Airport[] {
  const query = q === undefined ? undefined : normalizeForSearch(q);

  return sortedAirports.filter((a) => {
    if (division !== undefined && a.division !== division.toLowerCase()) return false;
    if (district !== undefined && a.district !== district.toLowerCase()) return false;
    if (type !== undefined && a.type !== type) return false;
    if (status !== undefined && a.status !== status) return false;
    if (query !== undefined) {
      const matchName =
        normalizeForSearch(a.name_en).includes(query) ||
        normalizeForSearch(a.name_bn).includes(query);
      const matchCity = normalizeForSearch(a.city).includes(query);
      const matchCodes =
        (a.iata_code && normalizeForSearch(a.iata_code).includes(query)) ||
        (a.icao_code && normalizeForSearch(a.icao_code).includes(query));
      if (!matchName && !matchCity && !matchCodes) return false;
    }
    return true;
  });
}

export function getAirport(codeOrSlug: string): Airport | undefined {
  const key = codeOrSlug.trim();
  const upper = key.toUpperCase();
  const lower = key.toLowerCase();

  return airportByIata.get(upper) ?? airportByIcao.get(upper) ?? airportBySlug.get(lower);
}

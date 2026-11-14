import units from '../../generated/land.units';
import { normalizeForSearch } from '../../lib/normalize';
import type { LandUnit } from './schemas';

export const STANDARD_REGION = 'standard';

const lookup = new Map<string, LandUnit>();
for (const u of units) {
  for (const name of [u.slug, u.name_bn, ...u.aliases]) lookup.set(normalizeForSearch(name), u);
}

/** Matches a slug, alias, or Bangla name, ignoring case, spaces and hyphens. */
export function resolveUnit(name: string): LandUnit | undefined {
  return (
    lookup.get(normalizeForSearch(name)) ??
    lookup.get(normalizeForSearch(name.replace(/\s+/g, '-')))
  );
}

export const regions = (): string[] =>
  [STANDARD_REGION, ...new Set(units.flatMap((u) => u.variants.map((v) => v.region)))].sort();

const sqftFor = (unit: LandUnit, region: string) =>
  unit.variants.find((v) => v.region === region)?.sqft ?? unit.sqft;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function listUnits(region = STANDARD_REGION): LandUnit[] {
  return units.map((u) => ({ ...u, sqft: sqftFor(u, region) }));
}

export function convertLand(value: number, from: string, to?: string, region = STANDARD_REGION) {
  const source = resolveUnit(from);
  const target = to === undefined ? undefined : resolveUnit(to);
  if (!source || (to !== undefined && !target)) throw new Error('unknown unit');
  const sqft = value * sqftFor(source, region);
  const all = Object.fromEntries(units.map((u) => [u.slug, round2(sqft / sqftFor(u, region))]));
  return {
    input: { value, unit: source.slug, name_bn: source.name_bn },
    region,
    ...(target ? { result: { value: all[target.slug] as number, unit: target.slug } } : {}),
    all,
  };
}

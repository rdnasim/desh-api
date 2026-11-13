/**
 * Imports nuhil/bangladesh-geocode (MIT; BBS geocodes via UN OCHA COD-AB, CC BY-IGO;
 * GeoNames postcodes, CC BY 4.0) into data/geo/*.json.
 *
 *   tsx scripts/import/geocode.ts <dir-with-upstream-json-files>
 *
 * Re-running is safe: aliases already present in data/geo/*.json are kept (matched by bbs_code
 * or slug), so community-added aliases survive a refresh.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugifyLatin } from '../../src/lib/normalize';
import { formatJson } from '../lib/json';

type Row = Record<string, string | null>;

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const geoDir = join(root, 'data/geo');
const upstream = process.argv[2];
if (!upstream) {
  console.error('usage: tsx scripts/import/geocode.ts <upstream-dir>');
  process.exit(1);
}

/** Seed aliases: historical English spellings still in common use. */
const SEED_ALIASES: Record<string, string[]> = {
  'division:chattogram': ['Chittagong'],
  'division:barishal': ['Barisal'],
  'district:chattogram': ['Chittagong'],
  'district:barishal': ['Barisal'],
  'district:cumilla': ['Comilla'],
  'district:jashore': ['Jessore'],
  'district:bogura': ['Bogra'],
  'district:coxs-bazar': ['Coxs Bazar', 'Cox Bazar', 'Coxsbazar'],
  'district:chapainababganj': ['Chapai Nawabganj', 'Chapainawabganj', 'Nawabganj'],
  'district:netrakona': ['Netrokona'],
  'district:jhalokati': ['Jhalakati', 'Jhalokathi'],
  'district:moulvibazar': ['Maulvibazar'],
  'district:lakshmipur': ['Laxmipur'],
  'district:khagrachhari': ['Khagrachari'],
  'district:narsingdi': ['Narsinghdi'],
  'district:sirajganj': ['Serajganj'],
  'district:habiganj': ['Hobiganj'],
  'district:panchagarh': ['Panchagar'],
  'district:joypurhat': ['Jaipurhat'],
  'district:jhenaidah': ['Jhenaidaha', 'Jhinaidah'],
};

async function table(name: string): Promise<Row[]> {
  const raw = JSON.parse(await readFile(join(upstream as string, `${name}.json`), 'utf8')) as {
    type: string;
    data?: Row[];
  }[];
  const t = raw.find((x) => x.type === 'table');
  if (!t?.data) throw new Error(`${name}.json: no table data`);
  return t.data;
}

async function existingAliases(file: string): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  const raw = await readFile(join(geoDir, file), 'utf8').catch(() => null);
  if (!raw) return map;
  for (const r of JSON.parse(raw) as { slug: string; bbs_code?: string; aliases?: string[] }[]) {
    if (r.aliases?.length) map.set(r.bbs_code ?? r.slug, r.aliases);
  }
  return map;
}

const num = (v: string | null | undefined) => {
  if (!v) return undefined;
  return Math.round(Number(v) * 1e6) / 1e6;
};

function area(r: Row, slug: string, level: string, kept: Map<string, string[]>) {
  const aliases = [
    ...new Set([
      ...(SEED_ALIASES[`${level}:${slug}`] ?? []),
      ...(kept.get(r.bbs_code ?? slug) ?? []),
    ]),
  ].sort();
  return {
    slug,
    name_en: (r.name as string).trim(),
    name_bn: (r.bn_name as string).trim().normalize('NFC'),
    aliases,
    ...(r.bbs_code ? { bbs_code: r.bbs_code } : {}),
    ...(r.url ? { url: r.url } : {}),
    ...(num(r.lat) !== undefined ? { lat: num(r.lat), lon: num(r.lon) } : {}),
  };
}

const bySlug = (a: { slug: string }, b: { slug: string }) =>
  a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;

async function write(file: string, rows: unknown[]) {
  await writeFile(join(geoDir, file), formatJson(rows));
  console.log(`${file}: ${rows.length}`);
}

const [divisions, districts, upazilas, unions, cityCorps, postcodes] = await Promise.all(
  ['divisions', 'districts', 'upazilas', 'unions', 'city_corporations', 'postcodes'].map(table),
);

const divisionSlug = new Map<string, string>();
const keptDiv = await existingAliases('divisions.json');
const outDivisions = (divisions as Row[]).map((r) => {
  const slug = slugifyLatin(r.name as string);
  divisionSlug.set(r.id as string, slug);
  return area(r, slug, 'division', keptDiv);
});

const districtSlug = new Map<string, string>();
const keptDist = await existingAliases('districts.json');
const outDistricts = (districts as Row[]).map((r) => {
  const slug = slugifyLatin(r.name as string);
  districtSlug.set(r.id as string, slug);
  return {
    ...area(r, slug, 'district', keptDist),
    division: divisionSlug.get(r.division_id as string),
  };
});

// Upazila names repeat across districts (e.g. Kaliganj); those get the district slug appended.
const upazilaNameCount = new Map<string, number>();
for (const r of upazilas as Row[]) {
  const s = slugifyLatin(r.name as string);
  upazilaNameCount.set(s, (upazilaNameCount.get(s) ?? 0) + 1);
}
const upazilaSlug = new Map<string, string>();
const keptUpa = await existingAliases('upazilas.json');
const outUpazilas = (upazilas as Row[]).map((r) => {
  const base = slugifyLatin(r.name as string);
  const district = districtSlug.get(r.district_id as string) as string;
  const slug = (upazilaNameCount.get(base) ?? 0) > 1 ? `${base}-${district}` : base;
  upazilaSlug.set(r.id as string, slug);
  return { ...area(r, slug, 'upazila', keptUpa), district };
});

// Union slugs are unique within an upazila; the few same-name pairs get a numeric suffix.
const keptUni = await existingAliases('unions.json');
const seenUnion = new Map<string, number>();
const outUnions = (unions as Row[])
  .map((r) => {
    const upazila = upazilaSlug.get(r.upazilla_id as string) as string;
    const base = slugifyLatin(r.name as string);
    const n = (seenUnion.get(`${upazila}/${base}`) ?? 0) + 1;
    seenUnion.set(`${upazila}/${base}`, n);
    const slug = n > 1 ? `${base}-${n}` : base;
    if (n > 1) console.warn(`union '${r.name}' repeats in upazila ${upazila}; slug ${slug}`);
    return { ...area(r, slug, 'union', keptUni), upazila };
  })
  .sort((a, b) => {
    const ka = `${a.upazila}/${a.slug}`;
    const kb = `${b.upazila}/${b.slug}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

const ccSlug = new Map<string, string>();
const keptCc = await existingAliases('city-corporations.json');
const outCityCorps = (cityCorps as Row[]).map((r) => {
  const slug = slugifyLatin((r.name as string).replace(/\s*City Corporation$/i, ''));
  ccSlug.set(r.id as string, slug);
  return { ...area(r, slug, 'city', keptCc), district: districtSlug.get(r.district_id as string) };
});

const outPostcodes = (postcodes as Row[])
  .map((r) => ({
    postcode: r.postcode as string,
    name_en: (r.post_office as string).trim(),
    name_bn: null,
    thana_en: (r.thana as string).trim(),
    district: districtSlug.get(r.district_id as string) as string,
    ...(r.upazila_id ? { upazila: upazilaSlug.get(r.upazila_id) } : {}),
    ...(r.city_corporation_id ? { city_corporation: ccSlug.get(r.city_corporation_id) } : {}),
    ...(num(r.lat) !== undefined ? { lat: num(r.lat), lon: num(r.lon) } : {}),
  }))
  .sort((a, b) => {
    const ka = `${a.postcode}/${a.name_en}`;
    const kb = `${b.postcode}/${b.name_en}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

await write('divisions.json', outDivisions.sort(bySlug));
await write('districts.json', outDistricts.sort(bySlug));
await write('upazilas.json', outUpazilas.sort(bySlug));
await write('unions.json', outUnions);
await write('city-corporations.json', outCityCorps.sort(bySlug));
await write('postcodes.json', outPostcodes);

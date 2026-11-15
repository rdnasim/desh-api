import postcodes from '../../generated/geo.postcodes';
import names from '../../generated/mock.names';
import prefixes from '../../generated/phone.prefixes';
import { toBanglaDigits } from '../../lib/digits';
import { createRng, pick, type Rng } from '../../lib/random';
import type { Ref } from '../../lib/schemas';
import { getDistrict, getDivision, listDistricts, listUpazilas } from '../geo/service';
import type { Gender, MockName } from './schemas';

type Tradition = MockName['tradition'];

/** Shares of the population, BBS Population and Housing Census 2022 (research M2). */
const TRADITION_WEIGHTS: readonly [Tradition, number][] = [
  ['muslim', 91.04],
  ['hindu', 7.95],
  ['buddhist', 0.61],
  ['christian', 0.3],
];
const TOTAL_WEIGHT = TRADITION_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

// Fixed range (ages 18–70 in 2026) so a seed gives the same people in every year.
const DOB_FROM = Date.UTC(1956, 0, 1);
const DOB_DAYS = (Date.UTC(2008, 11, 31) - DOB_FROM) / 86_400_000 + 1;

const officesByDistrict = new Map<string, (typeof postcodes)[number][]>();
for (const office of postcodes) {
  officesByDistrict.set(office.district, [
    ...(officesByDistrict.get(office.district) ?? []),
    office,
  ]);
}
const addressableDistricts = listDistricts().filter(
  (d) => officesByDistrict.has(d.slug) && listUpazilas(d.slug).length > 0,
);

const ref = (r: Ref): Ref => ({ slug: r.slug, name_en: r.name_en, name_bn: r.name_bn });
const digits = (rng: Rng, count: number) =>
  Array.from({ length: count }, () => Math.floor(rng() * 10)).join('');
const between = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

function tradition(rng: Rng): Tradition {
  let roll = rng() * TOTAL_WEIGHT;
  for (const [name, weight] of TRADITION_WEIGHTS) {
    roll -= weight;
    if (roll < 0) return name;
  }
  return 'muslim';
}

function address(rng: Rng, districtSlug?: string) {
  const district = districtSlug ? getDistrict(districtSlug) : pick(addressableDistricts, rng);
  if (!district) throw new RangeError(`unknown district '${districtSlug}'`);
  const division = getDivision(district.division);
  const upazila = pick(listUpazilas(district.slug), rng);
  const offices = officesByDistrict.get(district.slug) ?? [];
  const local = offices.filter((o) => o.upazila === upazila?.slug);
  const office = pick(local.length > 0 ? local : offices, rng);
  if (!division || !upazila || !office) {
    throw new RangeError(`no address data for district '${district.slug}'`);
  }
  const house = between(rng, 1, 120);
  const road = between(rng, 1, 30);
  return {
    line_en: `House ${house}, Road ${road}`,
    line_bn: `বাড়ি ${toBanglaDigits(String(house))}, রোড ${toBanglaDigits(String(road))}`.normalize(
      'NFC',
    ),
    upazila: ref(upazila),
    district: ref(district),
    division: ref(division),
    postcode: office.postcode,
  };
}

function person(rng: Rng, gender?: Gender, districtSlug?: string) {
  const from = tradition(rng);
  const sex: Gender = gender ?? (rng() < 0.5 ? 'male' : 'female');
  const given = pick(
    names.filter((n) => n.tradition === from && n.kind === 'given' && n.gender === sex),
    rng,
  );
  const family = pick(
    names.filter(
      (n) =>
        n.tradition === from && n.kind === 'family' && (n.gender === undefined || n.gender === sex),
    ),
    rng,
  );
  if (!given || !family) throw new Error(`name list has no ${sex} ${from} names`);
  const prefix = pick(prefixes, rng)?.prefix ?? '017';
  const dob = new Date(DOB_FROM + Math.floor(rng() * DOB_DAYS) * 86_400_000);
  return {
    name_en: `${given.name_en} ${family.name_en}`,
    name_bn: `${given.name_bn} ${family.name_bn}`,
    gender: sex,
    date_of_birth: dob.toISOString().slice(0, 10),
    phone: `${prefix}${digits(rng, 8)}`,
    email: `${given.name_en}.${family.name_en}${between(rng, 10, 99)}@example.com`.toLowerCase(),
    nid: `${between(rng, 1, 9)}${digits(rng, 9)}`,
    address: address(rng, districtSlug),
  };
}

export interface MockOptions {
  count: number;
  seed?: string;
  district?: string;
}

/** Synthetic people: random names, numbers and addresses, never describing anyone real. */
export function mockPeople({ count, seed, district, gender }: MockOptions & { gender?: Gender }) {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => person(rng, gender, district));
}

/** Synthetic addresses consistent with the geo data. */
export function mockAddresses({ count, seed, district }: MockOptions) {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => address(rng, district));
}

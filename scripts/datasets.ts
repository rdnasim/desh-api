import type { z } from 'zod';
import { normalizeForSearch } from '../src/lib/normalize';
import { BankSchema, BranchSchema } from '../src/modules/banks/schemas';
import { BijoyMapEntrySchema } from '../src/modules/convert/schemas';
import {
  EducationBoardSchema,
  GradeTierSchema,
  UniversityCategorySchema,
  UniversitySchema,
} from '../src/modules/education/schemas';
import { TaxCategorySchema, TaxYearSchema } from '../src/modules/finance/schemas';
import {
  DishSchema,
  HistoryEventSchema,
  ProverbSchema,
  QuizQuestionSchema,
  RiddleSchema,
} from '../src/modules/fun/schemas';
import {
  CityCorporationSchema,
  DistrictSchema,
  DivisionSchema,
  type PostOffice,
  PostOfficeSchema,
  type SearchIndexRow,
  UnionSchema,
  UpazilaSchema,
} from '../src/modules/geo/schemas';
import { HolidaySchema, HolidayYearSchema } from '../src/modules/holidays/schemas';
import { HotlineSchema } from '../src/modules/hotlines/schemas';
import { LandUnitSchema } from '../src/modules/land/schemas';
import { CommoditySchema, FuelMonthSchema } from '../src/modules/market/schemas';
import { MetroStationSchema } from '../src/modules/metro/schemas';
import { MfsProviderSchema } from '../src/modules/mfs/schemas';
import { MockNameSchema } from '../src/modules/mock/schemas';
import { OperatorPrefixSchema } from '../src/modules/phone/schemas';
import { DistrictOffsetSchema } from '../src/modules/prayer/schemas';
import { routingCheckDigitOk } from '../src/modules/validate/routing';
import { VehicleAreaAliasSchema } from '../src/modules/validate/schemas';

export interface DatasetSpec {
  /** Key used in data/meta.json and for the generated module name. */
  key: string;
  /** Path under data/. */
  file: string;
  schema: z.ZodTypeAny;
  /** Records must be sorted by this key, and it must be unique. */
  sortKey: (record: any) => string;
  /** Type exported by `from` (relative to src/generated/) that describes one record. */
  type: { name: string; from: string };
}

export interface DerivedOutput {
  name: string;
  type: string;
  typeImport?: { names: string[]; from: string };
  value: unknown;
}

const GEO = '../modules/geo/schemas';

export const datasets: DatasetSpec[] = [
  {
    key: 'geo.divisions',
    file: 'geo/divisions.json',
    schema: DivisionSchema,
    sortKey: (r) => r.slug,
    type: { name: 'Division', from: GEO },
  },
  {
    key: 'geo.districts',
    file: 'geo/districts.json',
    schema: DistrictSchema,
    sortKey: (r) => r.slug,
    type: { name: 'District', from: GEO },
  },
  {
    key: 'geo.upazilas',
    file: 'geo/upazilas.json',
    schema: UpazilaSchema,
    sortKey: (r) => r.slug,
    type: { name: 'Upazila', from: GEO },
  },
  {
    key: 'geo.unions',
    file: 'geo/unions.json',
    schema: UnionSchema,
    sortKey: (r) => `${r.upazila}/${r.slug}`,
    type: { name: 'Union', from: GEO },
  },
  {
    key: 'geo.city-corporations',
    file: 'geo/city-corporations.json',
    schema: CityCorporationSchema,
    sortKey: (r) => r.slug,
    type: { name: 'CityCorporation', from: GEO },
  },
  {
    key: 'geo.postcodes',
    file: 'geo/postcodes.json',
    schema: PostOfficeSchema,
    sortKey: (r: PostOffice) => `${r.postcode}/${r.name_en}`,
    type: { name: 'PostOffice', from: GEO },
  },
  {
    key: 'phone.prefixes',
    file: 'phone/prefixes.json',
    schema: OperatorPrefixSchema,
    sortKey: (r) => r.prefix,
    type: { name: 'OperatorPrefix', from: '../modules/phone/schemas' },
  },
  {
    key: 'convert.bijoy-map',
    file: 'convert/bijoy-map.json',
    schema: BijoyMapEntrySchema,
    sortKey: (r) => r.bijoy,
    type: { name: 'BijoyMapEntry', from: '../modules/convert/schemas' },
  },
  {
    key: 'land.units',
    file: 'land/units.json',
    schema: LandUnitSchema,
    sortKey: (r) => r.slug,
    type: { name: 'LandUnit', from: '../modules/land/schemas' },
  },
  {
    key: 'validate.vehicle-area-aliases',
    file: 'validate/vehicle-area-aliases.json',
    schema: VehicleAreaAliasSchema,
    sortKey: (r) => r.alias_bn,
    type: { name: 'VehicleAreaAlias', from: '../modules/validate/schemas' },
  },
  {
    key: 'hotlines',
    file: 'hotlines/hotlines.json',
    schema: HotlineSchema,
    sortKey: (r) => r.number,
    type: { name: 'Hotline', from: '../modules/hotlines/schemas' },
  },
  {
    key: 'holidays.years',
    file: 'holidays/years.json',
    schema: HolidayYearSchema,
    sortKey: (r) => `${r.year}/${r.calendar}`,
    type: { name: 'HolidayYear', from: '../modules/holidays/schemas' },
  },
  {
    key: 'holidays.holidays',
    file: 'holidays/holidays.json',
    schema: HolidaySchema,
    sortKey: (r) => r.id,
    type: { name: 'Holiday', from: '../modules/holidays/schemas' },
  },
  {
    key: 'banks.banks',
    file: 'banks/banks.json',
    schema: BankSchema,
    sortKey: (r) => r.slug,
    type: { name: 'Bank', from: '../modules/banks/schemas' },
  },
  {
    key: 'banks.branches',
    file: 'banks/branches.json',
    schema: BranchSchema,
    sortKey: (r) => r.id,
    type: { name: 'Branch', from: '../modules/banks/schemas' },
  },
  {
    key: 'education.boards',
    file: 'education/boards.json',
    schema: EducationBoardSchema,
    sortKey: (r) => r.slug,
    type: { name: 'EducationBoard', from: '../modules/education/schemas' },
  },
  {
    key: 'education.grading-scale',
    file: 'education/grading-scale.json',
    schema: GradeTierSchema,
    sortKey: (r) => r.slug,
    type: { name: 'GradeTier', from: '../modules/education/schemas' },
  },
  {
    key: 'education.universities',
    file: 'education/universities.json',
    schema: UniversitySchema,
    sortKey: (r) => r.slug,
    type: { name: 'University', from: '../modules/education/schemas' },
  },
  {
    key: 'education.university-categories',
    file: 'education/university-categories.json',
    schema: UniversityCategorySchema,
    sortKey: (r) => r.slug,
    type: { name: 'UniversityCategory', from: '../modules/education/schemas' },
  },
  {
    key: 'finance.tax-categories',
    file: 'finance/tax-categories.json',
    schema: TaxCategorySchema,
    sortKey: (r) => r.slug,
    type: { name: 'TaxCategory', from: '../modules/finance/schemas' },
  },
  {
    key: 'finance.tax-years',
    file: 'finance/tax-years.json',
    schema: TaxYearSchema,
    sortKey: (r) => r.tax_year,
    type: { name: 'TaxYear', from: '../modules/finance/schemas' },
  },
  {
    key: 'market.commodities',
    file: 'market/commodities.json',
    schema: CommoditySchema,
    sortKey: (r) => r.slug,
    type: { name: 'Commodity', from: '../modules/market/schemas' },
  },
  {
    key: 'mfs.providers',
    file: 'mfs/providers.json',
    schema: MfsProviderSchema,
    sortKey: (r) => r.slug,
    type: { name: 'MfsProvider', from: '../modules/mfs/schemas' },
  },
  {
    key: 'prayer.district-offsets',
    file: 'prayer/district-offsets.json',
    schema: DistrictOffsetSchema,
    sortKey: (r) => r.slug,
    type: { name: 'DistrictOffset', from: '../modules/prayer/schemas' },
  },
  {
    key: 'market.fuel',
    file: 'market/fuel.json',
    schema: FuelMonthSchema,
    sortKey: (r) => r.month,
    type: { name: 'FuelMonth', from: '../modules/market/schemas' },
  },
  {
    key: 'metro.stations',
    file: 'metro/stations.json',
    schema: MetroStationSchema,
    sortKey: (r) => r.slug,
    type: { name: 'MetroStation', from: '../modules/metro/schemas' },
  },
  {
    key: 'mock.names',
    file: 'mock/names.json',
    schema: MockNameSchema,
    sortKey: (r) => `${r.tradition}/${r.kind}/${r.name_en}`,
    type: { name: 'MockName', from: '../modules/mock/schemas' },
  },
  {
    key: 'fun.proverbs',
    file: 'fun/proverbs.json',
    schema: ProverbSchema,
    sortKey: (r) => r.id,
    type: { name: 'Proverb', from: '../modules/fun/schemas' },
  },
  {
    key: 'fun.riddles',
    file: 'fun/riddles.json',
    schema: RiddleSchema,
    sortKey: (r) => r.id,
    type: { name: 'Riddle', from: '../modules/fun/schemas' },
  },
  {
    key: 'fun.quiz',
    file: 'fun/quiz.json',
    schema: QuizQuestionSchema,
    sortKey: (r) => r.id,
    type: { name: 'QuizQuestion', from: '../modules/fun/schemas' },
  },
  {
    key: 'fun.dishes',
    file: 'fun/dishes.json',
    schema: DishSchema,
    sortKey: (r) => r.slug,
    type: { name: 'Dish', from: '../modules/fun/schemas' },
  },
  {
    key: 'fun.history',
    file: 'fun/history.json',
    schema: HistoryEventSchema,
    sortKey: (r) => r.id,
    type: { name: 'HistoryEvent', from: '../modules/fun/schemas' },
  },
];

type Named = { name_en: string; name_bn: string | null; aliases?: string[] };

function searchText(r: Named): string {
  return [r.name_en, r.name_bn ?? '', ...(r.aliases ?? [])].map(normalizeForSearch).join('|');
}

/** Cross-dataset integrity checks and derived build outputs. */
export function derive(data: Record<string, any[]>): {
  errors: string[];
  outputs: DerivedOutput[];
} {
  const errors: string[] = [];
  const slugs = (key: string) => new Set((data[key] ?? []).map((r) => r.slug as string));
  const fk = (key: string, field: string, target: string, optional = false) => {
    const known = slugs(target);
    for (const r of data[key] ?? []) {
      const value = r[field];
      if (value === undefined && optional) continue;
      if (!known.has(value))
        errors.push(`${key}: ${r.slug ?? r.postcode} has unknown ${field} '${value}'`);
    }
  };
  fk('geo.districts', 'division', 'geo.divisions');
  fk('prayer.district-offsets', 'division', 'geo.divisions');
  fk('metro.stations', 'division', 'geo.divisions');
  fk('metro.stations', 'district', 'geo.districts');
  fk('geo.upazilas', 'district', 'geo.districts');
  fk('geo.unions', 'upazila', 'geo.upazilas');
  fk('geo.city-corporations', 'district', 'geo.districts');
  fk('geo.postcodes', 'district', 'geo.districts');
  fk('geo.postcodes', 'upazila', 'geo.upazilas', true);
  fk('geo.postcodes', 'city_corporation', 'geo.city-corporations', true);
  const districtSlugs = slugs('geo.districts');
  const docRefs = new Map<string, Set<string>>();
  for (const y of data['holidays.years'] ?? []) {
    docRefs.set(`${y.year}/${y.calendar}`, new Set(y.documents.map((d: { ref: string }) => d.ref)));
  }
  for (const h of data['holidays.holidays'] ?? []) {
    const refs = docRefs.get(`${h.year}/${h.calendar}`);
    if (!refs)
      errors.push(`holidays: ${h.id} has no holidays.years entry for ${h.year}/${h.calendar}`);
    else {
      if (!refs.has(h.source))
        errors.push(`holidays: ${h.id} source '${h.source}' is not a document of ${h.year}`);
      if (h.amended_by && !refs.has(h.amended_by))
        errors.push(`holidays: ${h.id} amended_by is not a document of ${h.year}`);
    }
    for (const d of h.districts ?? []) {
      if (!districtSlugs.has(d)) errors.push(`holidays: ${h.id} has unknown district '${d}'`);
    }
  }
  const categories = slugs('finance.tax-categories');
  const aliases = new Map<string, string>();
  for (const c of data['finance.tax-categories'] ?? []) {
    for (const name of [c.slug, c.name_bn, ...c.aliases]) {
      const key = normalizeForSearch(name);
      const other = aliases.get(key);
      if (other && other !== c.slug)
        errors.push(`finance.tax-categories: '${name}' names both ${other} and ${c.slug}`);
      aliases.set(key, c.slug);
    }
  }
  for (const y of data['finance.tax-years'] ?? []) {
    const covered = y.thresholds.map((t: { category: string }) => t.category);
    for (const c of covered) {
      if (!categories.has(c))
        errors.push(`finance.tax-years: ${y.tax_year} has unknown category '${c}'`);
    }
    for (const c of categories) {
      if (covered.filter((x: string) => x === c).length !== 1)
        errors.push(`finance.tax-years: ${y.tax_year} needs exactly one threshold for '${c}'`);
    }
  }
  const bankBySlug = new Map((data['banks.banks'] ?? []).map((b) => [b.slug, b]));
  const upazilaDistrict = new Map((data['geo.upazilas'] ?? []).map((u) => [u.slug, u.district]));
  const routingSeen = new Set<string>();
  for (const b of data['banks.branches'] ?? []) {
    const bank = bankBySlug.get(b.bank);
    if (!bank) errors.push(`banks.branches: ${b.id} has unknown bank '${b.bank}'`);
    else if (!b.id.startsWith(String(bank.bb_id)) || b.id.length !== String(bank.bb_id).length + 4)
      errors.push(`banks.branches: ${b.id} does not start with bank ID ${bank.bb_id}`);
    if (!districtSlugs.has(b.district))
      errors.push(`banks.branches: ${b.id} has unknown district '${b.district}'`);
    if (b.upazila !== undefined && upazilaDistrict.get(b.upazila) !== b.district)
      errors.push(`banks.branches: ${b.id} upazila '${b.upazila}' is not in ${b.district}`);
    if (b.routing_number !== undefined) {
      if (!routingCheckDigitOk(b.routing_number))
        errors.push(`banks.branches: ${b.id} routing number fails the check digit`);
      if (routingSeen.has(b.routing_number))
        errors.push(`banks.branches: routing number ${b.routing_number} used twice`);
      routingSeen.add(b.routing_number);
      if (bank?.routing_code && !b.routing_number.startsWith(bank.routing_code))
        errors.push(
          `banks.branches: ${b.id} routing number does not start with ${bank.routing_code}`,
        );
    }
  }
  for (const u of data['education.universities'] ?? []) {
    if (u.district !== undefined && !districtSlugs.has(u.district))
      errors.push(`education.universities: ${u.slug} has unknown district '${u.district}'`);
  }
  for (const d of data['fun.dishes'] ?? []) {
    if (d.district !== undefined && !districtSlugs.has(d.district)) {
      errors.push(`fun.dishes: ${d.slug} has unknown district '${d.district}'`);
    }
  }
  for (const a of data['validate.vehicle-area-aliases'] ?? []) {
    if (!districtSlugs.has(a.district))
      errors.push(`validate.vehicle-area-aliases: unknown district '${a.district}'`);
  }

  const index: SearchIndexRow[] = [];
  const levels = [
    ['division', 'geo.divisions'],
    ['district', 'geo.districts'],
    ['upazila', 'geo.upazilas'],
    ['union', 'geo.unions'],
    ['post_office', 'geo.postcodes'],
  ] as const;
  for (const [level, key] of levels) {
    (data[key] ?? []).forEach((r, i) => {
      index.push([searchText(r), level, i]);
    });
  }

  return {
    errors,
    outputs: [
      {
        name: 'geo.search-index',
        type: 'SearchIndexRow[]',
        typeImport: { names: ['SearchIndexRow'], from: GEO },
        value: index,
      },
    ],
  };
}

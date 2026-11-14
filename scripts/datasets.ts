import type { z } from 'zod';
import { normalizeForSearch } from '../src/lib/normalize';
import { BijoyMapEntrySchema } from '../src/modules/convert/schemas';
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
import { OperatorPrefixSchema } from '../src/modules/phone/schemas';
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

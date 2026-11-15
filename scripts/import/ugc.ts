/**
 * Imports the universities listed by the University Grants Commission into data/education/.
 *
 *   tsx scripts/import/ugc.ts <cache-dir>
 *
 * Pages already saved in <cache-dir> are reused; missing ones are downloaded from
 * https://www.ugc.gov.bd one per second. Each page embeds its data as JSON (`data-page`), which is
 * all that is read. Names of people (vice-chancellor, registrar, contact person, …) are never kept.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeForSearch } from '../../src/lib/normalize';
import { formatJson } from '../lib/json';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://www.ugc.gov.bd';
const CATEGORIES = {
  'public-universities': 'public',
  'private-universities': 'private',
  'international-universities': 'international',
  cbhe: 'cbhe',
} as const;

const cacheDir = process.argv[2];
if (!cacheDir) {
  console.error('usage: tsx scripts/import/ugc.ts <cache-dir>');
  process.exit(1);
}

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

async function page(path: string, file: string): Promise<any> {
  const local = join(cacheDir as string, file);
  if (!existsSync(local)) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'user-agent': 'desh-api data import (+https://github.com/rdnasim/desh-api)' },
    });
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    await writeFile(local, await res.text());
  }
  const match = /data-page="([^"]+)"/.exec(await readFile(local, 'utf8'));
  if (!match) throw new Error(`${file}: no data-page JSON`);
  return JSON.parse(decode(match[1] as string)).props;
}

/** Trimmed text, or undefined for empty values and placeholders such as "--". */
const clean = (v: unknown) =>
  typeof v === 'string' && /[\p{L}\p{N}]/u.test(v) ? v.trim().replace(/\s+/g, ' ') : undefined;

/** Address text for district matching: "-gonj" spelt "-ganj", road names and the university's name removed. */
export const placeText = (address: string, name = '') =>
  ` ${normalizeForSearch(address)} `
    .replace(/gonj\b/g, 'ganj')
    .replace(` ${normalizeForSearch(name).replace(/gonj\b/g, 'ganj')} `, ' ')
    .replace(/ [a-z]+ road(?= )/g, ' ');

async function main() {
  await mkdir(cacheDir as string, { recursive: true });
  const districts = JSON.parse(await readFile(join(root, 'data/geo/districts.json'), 'utf8')) as {
    slug: string;
    name_en: string;
    aliases?: string[];
  }[];
  const districtNames = districts.flatMap((d) =>
    [d.name_en, ...(d.aliases ?? [])].map((n) => [normalizeForSearch(n), d.slug] as const),
  );
  const districtOf = (address?: string, name?: string) => {
    if (!address) return undefined;
    const text = placeText(address, name);
    const found = new Set(districtNames.filter(([n]) => text.includes(` ${n} `)).map(([, s]) => s));
    return found.size === 1 ? [...found][0] : undefined;
  };

  const index = await page('/universities', 'universities.html');
  const categories = (index.categories as any[]).map((c) => ({
    slug: CATEGORIES[c.slug as keyof typeof CATEGORIES],
    name_en: c.name_en,
    name_bn: c.name_bn,
    description: c.description,
  }));

  const universities = [];
  for (const [ugcSlug, category] of Object.entries(CATEGORIES)) {
    const list = await page(`/universities/${ugcSlug}`, `universities_${ugcSlug}.html`);
    for (const item of list.universities as any[]) {
      const detail = await page(`/university/${item.slug}`, `university_${item.slug}.html`);
      const u = detail.university;
      const campus = clean(u.permanent_campus) ?? clean(u.present_campus) ?? clean(u.address);
      const year = clean(u.year_of_establishment);
      const emails = (clean(u.email) ?? '')
        .split(/[\s,;/]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e));
      const notes = ((detail.notes as any[]) ?? []).map((n) => ({
        title: clean(n.title) ?? '',
        description: clean(n.description) ?? '',
        type: n.note_type ?? 'note',
      }));
      universities.push({
        slug: u.slug,
        ugc_id: u.id,
        name_en: clean(u.name_en),
        ...(clean(u.name_bn) ? { name_bn: clean(u.name_bn)?.normalize('NFC') } : {}),
        category,
        ...(year && /^\d{4}$/.test(year) ? { established: Number(year) } : {}),
        ...(clean(u.website) ? { website: clean(u.website) } : {}),
        ...(campus ? { campus } : {}),
        ...(districtOf(campus, u.name_en) ? { district: districtOf(campus, u.name_en) } : {}),
        ...(emails.length ? { emails } : {}),
        ...(clean(u.telephone_mobile) ? { phone: clean(u.telephone_mobile) } : {}),
        ...(clean(u.fax) ? { fax: clean(u.fax) } : {}),
        ...(notes.length ? { ugc_notes: notes } : {}),
      });
    }
  }
  universities.sort((a, b) => a.slug.localeCompare(b.slug));
  categories.sort((a, b) => a.slug.localeCompare(b.slug));
  await writeFile(join(root, 'data/education/universities.json'), formatJson(universities));
  await writeFile(join(root, 'data/education/university-categories.json'), formatJson(categories));
  console.log(
    `${universities.length} universities (${universities.filter((u) => u.district).length} with a district); updated at UGC: ${index.last_content_update}`,
  );
}

if (process.argv[1]?.endsWith('ugc.ts')) await main();

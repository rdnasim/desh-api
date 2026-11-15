import commodities from '../../generated/market.commodities';
import { toLatinDigits } from '../../lib/digits';
import { normalizeForSearch } from '../../lib/normalize';
import { type Cell, readXlsx } from '../../lib/xlsx';
import { round2 } from '../finance/money';
import type { MarketItem, MarketPrices } from './schemas';

export const TCB_LIST_URL = 'https://tcb.gov.bd/pages/daily-rmps';

/** A TCB list as read from its spreadsheet, before `fetched_at`/`freshness` are added. */
export type ParsedMarket = Omit<MarketPrices, 'fetched_at' | 'freshness'>;

const key = (name: string, unit: string) =>
  `${normalizeForSearch(name)}|${normalizeForSearch(unit)}`;
const catalog = new Map(commodities.map((c) => [key(c.name_bn, c.unit_bn), c]));
const clean = (v: Cell) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/** The newest daily spreadsheet on TCB's listing page. */
export function latestFile(html: string): { url: string; date: string } {
  const files = [...html.matchAll(/<tr[\s\S]*?<\/tr>/g)].flatMap((tr) => {
    const row = tr[0];
    const url = /href="(https:\/\/objectstorage\.[^"]+\.xlsx)"/.exec(row)?.[1];
    const d = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(row);
    if (!url || !d) return [];
    const date = `${d[3]}-${(d[1] as string).padStart(2, '0')}-${(d[2] as string).padStart(2, '0')}`;
    return [{ url: url.replace(/&amp;/g, '&'), date }];
  });
  const newest = files.sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!newest) throw new Error('TCB listing: no spreadsheet found');
  return newest;
}

function range(min: Cell, max: Cell) {
  if (typeof min !== 'number' || typeof max !== 'number') return null;
  return min === 0 && max === 0 ? null : { min, max };
}
const pct = (v: Cell) => (typeof v === 'number' && Number.isFinite(v) ? round2(v) : null);

/** TCB's daily retail price sheet for Dhaka. Throws if the sheet is not one. */
export function parseTcb(rows: Cell[][], fileUrl: string): ParsedMarket {
  const heading = rows.slice(0, 10).map((r) => toLatinDigits(clean(r[0] ?? null)));
  const date = heading.map((h) => /তারিখঃ?\s*(\d{2})-(\d{2})-(\d{4})/.exec(h)).find(Boolean);
  // "সিরিয়াল" is written with either encoding of য়, so match the word loosely.
  const serial = heading.map((h) => /সিরি\S*ল নংঃ?\s*(\d+)/.exec(h)).find(Boolean);
  const reference = rows
    .slice(0, 10)
    .map((r) => /নং-[০-৯.-]+/.exec(clean(r[0] ?? null))?.[0])
    .find(Boolean);
  const start = rows.findIndex((r) => clean(r[0] ?? null).startsWith('পণ্যের নাম'));
  if (!date || start < 0) throw new Error('TCB sheet: no dated price table');

  const items: MarketItem[] = [];
  for (const r of rows.slice(start + 1)) {
    const name = clean(r[0] ?? null);
    if (name.startsWith('যে সকল')) break; // markets surveyed / changed-items summary follow
    const unit = clean(r[1] ?? null);
    if (!name || !unit || typeof r[2] !== 'number') continue; // category headings, blank rows
    const known = catalog.get(key(name, unit));
    items.push({
      ...(known
        ? {
            slug: known.slug,
            name_en: known.name_en,
            unit_en: known.unit_en,
            category: known.category,
          }
        : {}),
      name_bn: name,
      unit_bn: unit,
      price: range(r[2] ?? null, r[3] ?? null),
      week_ago: range(r[4] ?? null, r[5] ?? null),
      month_ago: range(r[6] ?? null, r[7] ?? null),
      year_ago: range(r[9] ?? null, r[10] ?? null),
      change_month_pct: pct(r[8] ?? null),
      change_year_pct: pct(r[11] ?? null),
    });
  }
  if (items.length === 0) throw new Error('TCB sheet: no items');
  return {
    date: `${date[3]}-${date[2]}-${date[1]}`,
    market: 'dhaka',
    ...(serial ? { serial: Number(serial[1]) } : {}),
    ...(reference ? { reference } : {}),
    file_url: fileUrl,
    items,
  };
}

const UA = { 'user-agent': 'desh-api (+https://github.com/rdnasim/desh-api)' };

/** Reads TCB's newest daily list. Cloudflare caches the listing 30 minutes and each file a day. */
export async function fetchTcb(): Promise<ParsedMarket> {
  const page = await fetch(TCB_LIST_URL, {
    headers: UA,
    cf: { cacheTtl: 1800, cacheEverything: true },
  } as RequestInit);
  if (!page.ok) throw new Error(`TCB listing: HTTP ${page.status}`);
  const { url } = latestFile(await page.text());
  const file = await fetch(url, {
    headers: UA,
    cf: { cacheTtl: 86_400, cacheEverything: true },
  } as RequestInit);
  if (!file.ok) throw new Error(`TCB file: HTTP ${file.status}`);
  return parseTcb(await readXlsx(new Uint8Array(await file.arrayBuffer())), url);
}

import { describe, expect, it } from 'vitest';
import commodities from '../../../src/generated/market.commodities';
import { readXlsx } from '../../../src/lib/xlsx';
import { latestFile, parseTcb } from '../../../src/modules/market/tcb';
import xlsxB64 from '../../golden/market/tcb-daily-2026-11-12.xlsx.b64.txt?raw';
import listing from '../../golden/market/tcb-daily-list-2026-11-12.txt?raw';

const bytes = Uint8Array.from(atob(xlsxB64.trim()), (c) => c.charCodeAt(0));
const FILE = 'https://example.org/tcb.xlsx';

describe('readXlsx', () => {
  it('reads the first sheet, shared strings, numbers and error cells', async () => {
    const rows = await readXlsx(bytes);
    expect(rows.length).toBe(439);
    const coarse = rows.find((r) => String(r[0]).startsWith('চাল (মোটা)'));
    expect(coarse?.slice(1, 4)).toEqual(['প্রতি কেজি', 50, 58]);
    const polao = rows.find((r) => String(r[0]).startsWith('চাল সুগন্ধী') && r[1] === 'প্রতি কেজি');
    expect(polao?.[11]).toBe('#DIV/0!');
  });

  it('rejects something that is not a zip file', async () => {
    await expect(readXlsx(new TextEncoder().encode('<html>'))).rejects.toThrow();
  });
});

describe('parseTcb', async () => {
  const list = parseTcb(await readXlsx(bytes), FILE);

  it('reads the date, serial and reference from the heading', () => {
    expect(list).toMatchObject({
      date: '2026-11-12',
      market: 'dhaka',
      serial: 282,
      file_url: FILE,
    });
    expect(list.reference).toBe('নং-২৬.০৫.০০০০.০১৭.৩১.০১.২৬-৯১০');
  });

  it('reads only the main table: 60 items, none from the summary or distribution list', () => {
    expect(list.items).toHaveLength(60);
    expect(new Set(list.items.map((i) => i.slug)).size).toBe(60);
  });

  it('matches every item to the catalog, with English names', () => {
    expect(list.items.every((i) => i.slug && i.name_en && i.unit_en && i.category)).toBe(true);
    expect(commodities).toHaveLength(60);
  });

  it('keeps prices, past prices and rounded changes', () => {
    expect(list.items.find((i) => i.slug === 'rice-coarse')).toMatchObject({
      price: { min: 50, max: 58 },
      week_ago: { min: 50, max: 55 },
      month_ago: { min: 50, max: 55 },
      year_ago: { min: 54, max: 60 },
      change_month_pct: 2.86,
      change_year_pct: -5.26,
    });
    expect(list.items.find((i) => i.slug === 'soybean-oil-2l')?.price).toEqual({
      min: 410,
      max: 410,
    });
  });

  it('turns 0–0 into null (not available) and #DIV/0! into a null change', () => {
    const onion = list.items.find((i) => i.slug === 'onion-imported');
    expect(onion?.price).toBeNull();
    const polao = list.items.find((i) => i.slug === 'rice-aromatic-loose');
    expect(polao).toMatchObject({ year_ago: null, change_year_pct: null });
  });

  it('throws when the sheet is not a TCB price list', () => {
    expect(() => parseTcb([['hello']], FILE)).toThrow();
  });
});

describe('latestFile', () => {
  it('picks the newest dated spreadsheet on the listing page', () => {
    const latest = latestFile(listing);
    expect(latest.date).toBe('2026-11-12');
    expect(latest.url).toMatch(/^https:\/\/objectstorage\..*\.xlsx$/);
  });

  it('throws when no spreadsheet is listed', () => {
    expect(() => latestFile('<table></table>')).toThrow();
  });
});

import type { GoldPrices, Karat } from './schemas';

export const BAJUS_URL = 'https://www.bajus.org/gold-price';
/** 1 vori (bhori, tola) = 11.664 g. */
export const VORI_GRAMS = 11.664;

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

/** Gold and silver prices from BAJUS's gold-price page. Throws if the page has changed. */
export function parseBajus(html: string): GoldPrices {
  const body = text(html);
  const table = (metal: 'Gold' | 'Silver') => {
    const price = (label: string): { per_gram: number; per_vori: number } => {
      const m = new RegExp(`${label} ${metal}[^0-9]*?([\\d,]+) BDT/GRAM`, 'i').exec(body);
      if (!m) throw new Error(`BAJUS page: no ${label} ${metal} price`);
      const perGram = Number((m[1] as string).replace(/,/g, ''));
      if (!(perGram > 0)) throw new Error(`BAJUS page: bad ${label} ${metal} price`);
      return { per_gram: perGram, per_vori: Math.round(perGram * VORI_GRAMS) };
    };
    return {
      '22k': price('22 KARAT'),
      '21k': price('21 KARAT'),
      '18k': price('18 KARAT'),
      traditional: price('TRADITIONAL'),
    } satisfies Record<Karat, unknown>;
  };
  const date = /Gold Price\/(\d{1,2})-([A-Za-z]{3})-(\d{4})\.pdf/.exec(html);
  const month = date ? MONTHS.indexOf((date[2] as string).toLowerCase()) + 1 : 0;
  if (!date || month === 0) throw new Error('BAJUS page: no dated price list');
  const effective = `${date[3]}-${String(month).padStart(2, '0')}-${(date[1] as string).padStart(2, '0')}`;
  return {
    effective_date: effective,
    currency: 'BDT',
    gold: table('Gold'),
    silver: table('Silver'),
    source_url: BAJUS_URL,
  };
}

/** Fetches and parses the current BAJUS prices; Cloudflare caches the upstream page for 30 minutes. */
export async function fetchBajus(): Promise<GoldPrices> {
  const res = await fetch(BAJUS_URL, {
    headers: { 'user-agent': 'desh-api (+https://github.com/rdnasim/desh-api)' },
    cf: { cacheTtl: 1800, cacheEverything: true },
  } as RequestInit);
  if (!res.ok) throw new Error(`BAJUS: HTTP ${res.status}`);
  return parseBajus(await res.text());
}

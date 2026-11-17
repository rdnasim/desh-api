/**
 * Runs the quickstart scenarios against a running API.
 *
 *   BASE=https://api.example.com pnpm smoke          # default BASE: http://localhost:8787
 *   pnpm smoke --bench                               # also report p50/p95 latency
 */
export {};

const BASE = (process.env.BASE ?? 'http://localhost:8787').replace(/\/$/, '');
const BENCH_ROUNDS = 20;

type ApiBody = { success?: boolean; data?: any; meta?: any; error?: { code: string } };
interface Scenario {
  name: string;
  path: string;
  init?: RequestInit;
  /** Let `check` see error responses too (for routes whose documented errors are acceptable). */
  checkErrors?: boolean;
  check: (res: Response, body: ApiBody) => string | true;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

const scenarios: Scenario[] = [
  {
    name: '1 divisions',
    path: '/v1/divisions',
    check: (_, b) =>
      b.data?.length === 8 && b.meta?.source ? true : 'expected 8 divisions with meta.source',
  },
  {
    name: '2 districts by division',
    path: '/v1/districts?division=chattogram',
    check: (_, b) => (b.data?.some((d: any) => d.slug === 'cumilla') ? true : 'cumilla missing'),
  },
  {
    name: '3 search by old spelling',
    path: '/v1/search?q=comilla',
    check: (_, b) => (b.data?.[0]?.slug === 'cumilla' ? true : 'first hit is not cumilla'),
  },
  {
    name: '4 postcode',
    path: '/v1/postcodes/1205',
    check: (_, b) => (b.data?.post_offices?.[0]?.district === 'dhaka' ? true : 'not in dhaka'),
  },
  {
    name: '5 nearest',
    path: '/v1/nearest?lat=23.81&lon=90.41',
    check: (_, b) => (b.data?.area?.slug === 'dhaka' ? true : 'nearest is not dhaka'),
  },
  {
    name: '6 number to words (Bangla digits)',
    path: `/v1/bangla/num-to-words?n=${encodeURIComponent('১২৫০')}`,
    check: (_, b) => (b.data?.words === 'এক হাজার দুইশত পঞ্চাশ' ? true : `got ${b.data?.words}`),
  },
  {
    name: '7 Bangla date',
    path: '/v1/bangla/date?date=2026-12-16',
    check: (_, b) =>
      b.data?.formatted_bn === '১ পৌষ ১৪৩৩ বঙ্গাব্দ' ? true : `got ${b.data?.formatted_bn}`,
  },
  {
    name: '8 phone (no-store)',
    path: '/v1/phone/validate',
    init: json({ number: '+8801712345678' }),
    check: (res, b) =>
      b.data?.valid &&
      b.data?.operator?.slug === 'grameenphone' &&
      res.headers.get('cache-control') === 'no-store'
        ? true
        : 'expected valid Grameenphone number with no-store',
  },
  {
    name: '9 Bijoy to Unicode',
    path: '/v1/convert/bijoy-to-unicode',
    init: json({ text: 'Avgvi †mvbvi evsjv' }),
    check: (_, b) => (b.data?.output === 'আমার সোনার বাংলা' ? true : `got ${b.data?.output}`),
  },
  {
    name: '10 land units',
    path: '/v1/land/convert?value=5&from=katha&to=sqft',
    check: (_, b) => (b.data?.result?.value === 3600 ? true : `got ${b.data?.result?.value}`),
  },
  {
    name: '11 NID format',
    path: '/v1/validate/nid',
    init: json({ value: '1234567890' }),
    check: (_, b) =>
      b.data?.valid && b.data?.details?.format === '10' ? true : 'expected valid 10-digit NID',
  },
  {
    name: '12 emergency hotlines',
    path: '/v1/hotlines?category=emergency',
    check: (_, b) =>
      b.data?.some((h: any) => h.number === '999' && h.last_verified)
        ? true
        : '999 with last_verified missing',
  },
  {
    name: '13 seeded proverb',
    path: '/v1/fun/proverb/random?seed=smoke',
    check: (_, b) => (b.data?.text_bn ? true : 'no proverb'),
  },
  {
    name: '13b holiday check',
    path: '/v1/is-holiday?date=2027-12-16',
    check: (_, b) =>
      b.data?.holiday && b.data?.holidays?.[0]?.name_bn === 'বিজয় দিবস' ? true : 'not Victory Day',
  },
  {
    name: '13c working days',
    path: '/v1/working-days?from=2027-12-01&to=2027-12-31',
    check: (_, b) => (b.data?.working_days === 21 ? true : `got ${b.data?.working_days}`),
  },
  {
    name: '13d income tax',
    path: '/v1/finance/income-tax?income=1000000&tax_year=2027-28',
    check: (_, b) =>
      b.data?.tax_payable === 75000 && b.meta?.disclaimer ? true : `got ${b.data?.tax_payable}`,
  },
  {
    name: '13e loan EMI',
    path: '/v1/finance/emi?principal=1000000&rate=9&months=60',
    check: (_, b) => (b.data?.emi === 20758.36 ? true : `got ${b.data?.emi}`),
  },
  {
    name: '13f mock people (seeded)',
    path: '/v1/mock/people?count=3&seed=smoke',
    check: (_, b) =>
      b.data?.length === 3 && /@example\.com$/.test(b.data[0]?.email ?? '')
        ? true
        : 'bad mock data',
  },
  {
    name: '13g routing number lookup',
    path: '/v1/routing/010130065',
    check: (_, b) => (b.data?.bank?.slug === 'agrani-bank' ? true : `got ${b.data?.bank?.slug}`),
  },
  {
    name: '13h universities',
    path: '/v1/universities/university-of-dhaka',
    check: (_, b) => (b.data?.established === 1921 ? true : `got ${b.data?.established}`),
  },
  {
    name: '13i gold prices (live or last known)',
    path: '/v1/gold/prices',
    // BAJUS refuses some regions; there the last good list from KV must be served, not a 503.
    check: (_, b) =>
      b.data?.gold?.['22k']?.per_gram > 0
        ? true
        : `no prices (freshness ${b.data?.freshness ?? b.error?.code})`,
  },
  {
    name: '13j market prices (live or last known)',
    path: '/v1/market/prices?category=rice',
    check: (_, b) =>
      b.data?.items?.length > 0 ? true : `no items (freshness ${b.data?.freshness})`,
  },
  {
    name: '13k fuel prices',
    path: '/v1/fuel/prices',
    check: (_, b) => (b.data?.prices?.diesel > 0 ? true : 'no fuel prices'),
  },
  {
    name: '13l airports',
    path: '/v1/airports?type=international',
    check: (_, b) => (b.data?.length === 3 ? true : `expected 3 international airports, got ${b.data?.length}`),
  },
  {
    name: '13m heritage sites',
    path: '/v1/heritage?type=unesco_world_heritage',
    check: (_, b) => (b.data?.length === 3 ? true : `expected 3 UNESCO sites, got ${b.data?.length}`),
  },
  {
    name: '13n rivers',
    path: '/v1/rivers?q=Padma',
    check: (_, b) => (b.data?.some((r: any) => r.slug === 'padma') ? true : 'expected Padma river'),
  },
  {
    name: '14 docs and OpenAPI',
    path: '/openapi.json',
    check: (_, b: any) =>
      b.openapi?.startsWith('3.1') && Object.keys(b.paths ?? {}).length > 20 ? true : 'bad doc',
  },
  {
    name: '15 unknown route',
    path: '/v1/nope',
    check: (res, b) =>
      res.status === 404 && b.error?.code === 'not_found' ? true : `got ${res.status}`,
  },
];

async function run(s: Scenario): Promise<{ ok: boolean; ms: number; message: string }> {
  const started = performance.now();
  try {
    const res = await fetch(BASE + s.path, s.init);
    const text = await res.text();
    let body: ApiBody;
    try {
      body = JSON.parse(text) as ApiBody;
    } catch {
      // Usually a Cloudflare challenge page in front of the API (cf-mitigated: challenge).
      const mitigated = res.headers.get('cf-mitigated');
      return {
        ok: false,
        ms: performance.now() - started,
        message: `HTTP ${res.status}, not JSON (${res.headers.get('content-type')})${mitigated ? `, cf-mitigated: ${mitigated}` : ''}`,
      };
    }
    const ms = performance.now() - started;
    if (!res.ok && !s.checkErrors && s.name !== '15 unknown route')
      return { ok: false, ms, message: `HTTP ${res.status}` };
    const result = s.check(res, body);
    return { ok: result === true, ms, message: result === true ? '' : result };
  } catch (error) {
    const cause = (error as { cause?: { code?: string; message?: string } }).cause;
    const detail = cause ? ` (${cause.code ?? cause.message})` : '';
    return { ok: false, ms: performance.now() - started, message: `${String(error)}${detail}` };
  }
}

const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)] ?? 0;

console.log(`Smoke test against ${BASE}\n`);
let failures = 0;
for (const s of scenarios) {
  const r = await run(s);
  if (!r.ok) failures++;
  console.log(
    `${r.ok ? '✓' : '✗'} ${s.name.padEnd(36)} ${r.ms.toFixed(0).padStart(5)} ms ${r.message}`,
  );
}

if (process.argv.includes('--bench')) {
  // Docs page is excluded: it is large and not part of the API latency target.
  const timings: number[] = [];
  for (let round = 0; round < BENCH_ROUNDS; round++) {
    for (const s of scenarios.filter((x) => !x.name.startsWith('14')))
      timings.push((await run(s)).ms);
  }
  timings.sort((a, b) => a - b);
  console.log(
    `\n${timings.length} requests: p50 ${percentile(timings, 50).toFixed(0)} ms, p95 ${percentile(timings, 95).toFixed(0)} ms (target p95 < 200 ms, SC-004)`,
  );
}

console.log(`\n${scenarios.length - failures}/${scenarios.length} scenarios passed`);
process.exit(failures ? 1 : 0);

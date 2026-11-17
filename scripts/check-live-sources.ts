/**
 * Automated health and freshness check for live upstreams and periodic datasets.
 *
 * Usage:
 *   npx tsx scripts/check-live-sources.ts
 */
// Some Bangladesh government portals (e.g. TCB) omit intermediate certs in their chain,
// which requires system CA or relaxed validation when running standalone node scripts.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'node:fs';
import path from 'node:path';
import { fetchBajus } from '../src/modules/gold/bajus';
import { fetchTcb } from '../src/modules/market/tcb';

interface CheckStatus {
  name: string;
  ok: boolean;
  message: string;
}

const results: CheckStatus[] = [];

async function checkBajus() {
  const started = Date.now();
  try {
    const prices = await fetchBajus();
    const duration = Date.now() - started;
    if (prices.gold['22k'].per_gram > 0 && prices.effective_date) {
      results.push({
        name: 'BAJUS Gold & Silver Upstream',
        ok: true,
        message: `OK in ${duration}ms (Effective: ${prices.effective_date}, 22K Gold: ৳${prices.gold['22k'].per_gram}/g)`,
      });
    } else {
      results.push({
        name: 'BAJUS Gold & Silver Upstream',
        ok: false,
        message: 'Invalid payload structure or missing price',
      });
    }
  } catch (err) {
    results.push({
      name: 'BAJUS Gold & Silver Upstream',
      ok: false,
      message: `Failed: ${String(err)}`,
    });
  }
}

async function checkTcb() {
  const started = Date.now();
  try {
    const market = await fetchTcb();
    const duration = Date.now() - started;
    if (market.items.length > 0 && market.date) {
      results.push({
        name: 'TCB Market Retail Prices Upstream',
        ok: true,
        message: `OK in ${duration}ms (Date: ${market.date}, ${market.items.length} items parsed)`,
      });
    } else {
      results.push({
        name: 'TCB Market Retail Prices Upstream',
        ok: false,
        message: 'No commodity items parsed from latest spreadsheet',
      });
    }
  } catch (err) {
    results.push({
      name: 'TCB Market Retail Prices Upstream',
      ok: false,
      message: `Failed: ${String(err)}`,
    });
  }
}

function checkFuelPrices() {
  try {
    const fuelPath = path.resolve(process.cwd(), 'data/market/fuel.json');
    const raw = fs.readFileSync(fuelPath, 'utf-8');
    const records = JSON.parse(raw) as Array<{ month: string; prices: Record<string, number> }>;
    const latest = records[0];
    const diesel = latest?.prices.diesel;
    if (latest && latest.month && typeof diesel === 'number' && diesel > 0) {
      results.push({
        name: 'Static Fuel Prices (data/market/fuel.json)',
        ok: true,
        message: `OK (Latest month: ${latest.month}, Diesel: ৳${diesel}/L)`,
      });
    } else {
      results.push({
        name: 'Static Fuel Prices (data/market/fuel.json)',
        ok: false,
        message: 'Invalid fuel.json content',
      });
    }
  } catch (err) {
    results.push({
      name: 'Static Fuel Prices (data/market/fuel.json)',
      ok: false,
      message: `Failed: ${String(err)}`,
    });
  }
}

function checkHolidays() {
  try {
    const holidaysDir = path.resolve(process.cwd(), 'data/holidays');
    const files = fs.readdirSync(holidaysDir).filter((f) => f.endsWith('.json'));
    if (files.length > 0) {
      results.push({
        name: 'Gazetted Holidays (data/holidays/)',
        ok: true,
        message: `OK (${files.length} year file(s) available: ${files.join(', ')})`,
      });
    } else {
      results.push({
        name: 'Gazetted Holidays (data/holidays/)',
        ok: false,
        message: 'No holiday datasets found in data/holidays/',
      });
    }
  } catch (err) {
    results.push({
      name: 'Gazetted Holidays (data/holidays/)',
      ok: false,
      message: `Failed: ${String(err)}`,
    });
  }
}

async function main() {
  console.log('🔍 Checking desh-api data freshness and upstream sources...\n');

  checkFuelPrices();
  checkHolidays();
  await Promise.all([checkBajus(), checkTcb()]);

  console.log('Results:');
  console.log('─'.repeat(70));
  let hasFailure = false;
  for (const r of results) {
    const symbol = r.ok ? '✅' : '❌';
    console.log(`${symbol} [${r.name}]`);
    console.log(`   ${r.message}`);
    if (!r.ok) hasFailure = true;
  }
  console.log('─'.repeat(70));

  if (hasFailure) {
    console.error('\n⚠️ Some upstream data checks failed.');
    process.exit(1);
  } else {
    console.log('\n✨ All data sources and parsers are healthy!');
  }
}

main().catch((err) => {
  console.error('Fatal error running checks:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Desh CLI (`desh`) — Fast command-line interface for Desh API
 * https://deshapi.riadul.com
 */

const DEFAULT_BASE_URL = process.env.DESH_API_URL || 'https://deshapi.riadul.com';
const API_KEY = process.env.DESH_API_KEY;

interface CliOptions {
  json: boolean;
  baseUrl: string;
  taka?: boolean;
  district?: string;
  to?: string;
  year?: string;
}

export async function fetchApi(path: string, options: CliOptions) {
  const url = `${options.baseUrl.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const res = await fetch(url, { headers });
  // biome-ignore lint/suspicious/noExplicitAny: generic JSON envelope
  const data = (await res.json()) as any;
  return { status: res.status, data };
}

export function printHelp() {
  console.log(`
Desh CLI — The Open Terminal Interface for Bangladesh
Usage: desh <command> [arguments] [flags]

Commands:
  postcode <code>                Lookup post office and upazila by 4-digit code
  words <number> [--taka]        Convert digits to Bangla words or Taka
  land <val> <from> [--to unit]  Convert Bangladeshi land measurements (katha, bigha, decimal, etc.)
  validate nid <number>          Validate National ID (10, 13, or 17 digits)
  validate plate <number>        Validate BRTA vehicle registration number
  validate phone <number>        Validate 11-digit Bangladesh mobile number
  prayer [today] [--district id] Daily 5 prayer times and Sehri/Iftar countdown
  gold                           Latest BAJUS gold and silver prices
  fuel                           Current BPC statutory fuel prices
  quota                          Check remaining daily API quota and limits

Flags:
  --json                         Output raw JSON response
  --base-url <url>               Override API base URL
  --district <id>                Filter by district ID (e.g. 'dhaka', 'chittagong')
  --taka                         Format as Taka and Paisa in words
  -h, --help                     Show this help message
  -v, --version                  Print CLI version
`);
}

export async function runCli(args: string[]): Promise<number> {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    return 0;
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log('desh v0.1.0');
    return 0;
  }

  const json = args.includes('--json');
  const taka = args.includes('--taka');

  let baseUrl = DEFAULT_BASE_URL;
  const baseUrlIdx = args.indexOf('--base-url');
  if (baseUrlIdx !== -1 && args[baseUrlIdx + 1]) {
    baseUrl = args[baseUrlIdx + 1];
  }

  let district = 'dhaka';
  const districtIdx = args.indexOf('--district');
  if (districtIdx !== -1 && args[districtIdx + 1]) {
    district = args[districtIdx + 1];
  }

  let toUnit: string | undefined;
  const toIdx = args.indexOf('--to');
  if (toIdx !== -1 && args[toIdx + 1]) {
    toUnit = args[toIdx + 1];
  }

  const cleanArgs = args.filter((a, i) => {
    if (a.startsWith('--') || a.startsWith('-')) return false;
    if (
      i > 0 &&
      (args[i - 1] === '--base-url' || args[i - 1] === '--district' || args[i - 1] === '--to')
    )
      return false;
    return true;
  });

  const command = cleanArgs[0];
  const opts: CliOptions = { json, baseUrl, taka, district, to: toUnit };

  try {
    switch (command) {
      case 'postcode': {
        const code = cleanArgs[1];
        if (!code) {
          console.error('Error: Please specify a 4-digit postcode (e.g. desh postcode 1205)');
          return 1;
        }
        const { data } = await fetchApi(`/v1/postcodes/${code}`, opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(`Postcode ${code} not found.`);
        } else {
          const item = data.data;
          console.log(`\n📮 Post Office: ${item.postOffice} (${item.postOfficeBn})`);
          console.log(`   Postcode:    ${item.postCode}`);
          console.log(`   Upazila:     ${item.upazila}`);
          console.log(`   District:    ${item.district}\n`);
        }
        return 0;
      }

      case 'words': {
        const num = cleanArgs[1];
        if (!num) {
          console.error('Error: Please specify a number (e.g. desh words 1250000 --taka)');
          return 1;
        }
        const endpoint = taka
          ? `/v1/bangla/taka-in-words?amount=${num}`
          : `/v1/bangla/num-to-words?n=${num}`;
        const { data } = await fetchApi(endpoint, opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Calculation error');
        } else {
          console.log(`\n💬 ${data.data.in_words || data.data.words}\n`);
        }
        return 0;
      }

      case 'land': {
        const val = cleanArgs[1];
        const fromUnit = cleanArgs[2];
        if (!val || !fromUnit) {
          console.error(
            'Error: Usage: desh land <value> <unit> [--to <target_unit>] (e.g. desh land 5 katha --to sqft)',
          );
          return 1;
        }
        const query = toUnit
          ? `?value=${val}&from=${fromUnit}&to=${toUnit}`
          : `?value=${val}&from=${fromUnit}`;
        const { data } = await fetchApi(`/v1/land/convert${query}`, opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Conversion error');
        } else {
          console.log(
            `\n📐 ${val} ${fromUnit} = ${data.data.converted_value ?? data.data.value} ${data.data.to_unit ?? 'sqft'}\n`,
          );
        }
        return 0;
      }

      case 'validate': {
        const sub = cleanArgs[1];
        const val = cleanArgs[2];
        if (!sub || !val) {
          console.error('Error: Usage: desh validate <nid|plate|phone> <value>');
          return 1;
        }
        let path = '';
        if (sub === 'nid') path = `/v1/validate/nid/${encodeURIComponent(val)}`;
        else if (sub === 'plate') path = `/v1/validate/vehicle-plate/${encodeURIComponent(val)}`;
        else if (sub === 'phone') path = `/v1/phone/validate?number=${encodeURIComponent(val)}`;
        else {
          console.error(`Unknown validation type: ${sub}. Supported: nid, plate, phone`);
          return 1;
        }

        const { data } = await fetchApi(path, opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Validation failed');
        } else {
          const isValid = data.data.valid ?? data.data.is_valid;
          const status = isValid ? '✅ VALID' : '❌ INVALID';
          console.log(`\n${status}: ${val} (${sub.toUpperCase()})`);
          if (data.data.reason) console.log(`   Note: ${data.data.reason}`);
          if (data.data.operator) console.log(`   Operator: ${data.data.operator}`);
          console.log();
        }
        return 0;
      }

      case 'prayer': {
        const { data } = await fetchApi(`/v1/prayer/times?district=${district}`, opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Prayer times unavailable');
        } else {
          const d = data.data;
          console.log(`\n🕌 Prayer Times for ${d.district} (${d.district_bn}) — ${d.date}`);
          console.log(`   Fajr:    ${d.timings?.fajr || '05:05'}`);
          console.log(`   Dhuhr:   ${d.timings?.dhuhr || '11:55'}`);
          console.log(`   Asr:     ${d.timings?.asr || '15:15'}`);
          console.log(`   Maghrib: ${d.timings?.maghrib || '17:15'}`);
          console.log(`   Isha:    ${d.timings?.isha || '18:30'}\n`);
        }
        return 0;
      }

      case 'gold': {
        const { data } = await fetchApi('/v1/gold/prices', opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Gold rates unavailable');
        } else {
          console.log(`\n🪙 BAJUS Gold Rates (${data.data.date || 'Today'}):`);
          const rates = data.data.prices || data.data;
          if (Array.isArray(rates)) {
            for (const r of rates) {
              console.log(`   • ${r.karat}: ৳${r.price_bdt ?? r.price_per_vori_bdt} / vori`);
            }
          }
          console.log();
        }
        return 0;
      }

      case 'fuel': {
        const { data } = await fetchApi('/v1/market/fuel-prices', opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Fuel prices unavailable');
        } else {
          console.log(`\n⛽ Bangladesh Petroleum Corporation (BPC) Fuel Prices:`);
          const prices = data.data.prices || data.data;
          if (Array.isArray(prices)) {
            for (const p of prices) {
              console.log(`   • ${p.fuel_type || p.name}: ৳${p.price_per_litre_bdt}/litre`);
            }
          }
          console.log();
        }
        return 0;
      }

      case 'quota': {
        const { data } = await fetchApi('/v1/developer/quota', opts);
        if (json) {
          console.log(JSON.stringify(data, null, 2));
        } else if (!data.success) {
          console.error(data.error?.message || 'Quota lookup failed');
        } else {
          const q = data.data;
          console.log(`\n⚡ Desh API Quota & Rate Limit:`);
          console.log(`   Tier:            ${q.tier_name} (${q.tier})`);
          console.log(`   Daily Quota:     ${q.daily_remaining} / ${q.daily_quota} remaining`);
          console.log(`   Rate Limit:      ${q.rate_limit_per_minute} req/min burst`);
          console.log(`   Resets:          ${q.resets_at}\n`);
        }
        return 0;
      }

      default: {
        console.error(`Unknown command: ${command}`);
        printHelp();
        return 1;
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error connecting to Desh API: ${message}`);
    return 1;
  }
}

// Auto-run if executed directly as a script
if (process.argv[1]?.endsWith('bin.js') || process.argv[1]?.endsWith('bin.ts')) {
  runCli(process.argv.slice(2)).then((code) => {
    if (code !== 0) process.exit(code);
  });
}

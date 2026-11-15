/** Writes DATA_SOURCES.md from data/meta.json. CI fails if the committed file is out of date. */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { DatasetMetaSchema } from '../src/lib/dataset-meta';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const meta = z
  .array(DatasetMetaSchema)
  .parse(JSON.parse(await readFile(join(root, 'data/meta.json'), 'utf8')));

const cell = (s: string) => s.replaceAll('|', '\\|');
const lines = [
  '# Data sources',
  '',
  '<!-- Generated from data/meta.json by `pnpm data:docs`. Do not edit by hand. -->',
  '',
  'Every API response names its source in `meta.source`. This page lists the source, licence and',
  'credits for each dataset. When you reuse the data, please credit "Desh API contributors" and the',
  'upstream sources below.',
  '',
  '| Dataset | Source | Licence | Retrieved | Last updated | Credits |',
  '|---|---|---|---|---|---|',
  ...meta.map((m) => {
    const source = m.source_url ? `[${cell(m.source)}](${m.source_url})` : cell(m.source);
    return `| \`${m.dataset}\` | ${source} | ${cell(m.licence)} | ${m.retrieved} | ${m.last_updated} | ${cell(m.credits.join('; '))} |`;
  }),
  '',
  '## Live sources',
  '',
  'Read when a request arrives (cached at the edge), not stored in `data/`.',
  '',
  '| Endpoint | Source | Notes |',
  '|---|---|---|',
  "| `/v1/gold/prices`, `/v1/zakat` | [Bangladesh Jewellers Association (BAJUS), gold and silver rate](https://www.bajus.org/gold-price) | Cached 30 minutes; `meta.last_updated` is the price list's effective date; 503 if BAJUS cannot be read |",
  '',
  '## Rules and formulas',
  '',
  'Calculators that apply a law or a standard formula rather than a dataset.',
  '',
  '| Endpoint | Source |',
  '|---|---|',
  '| `/v1/finance/vat` | Value Added Tax and Supplementary Duty Act 2012, section 15 (standard rate 15%) |',
  '| `/v1/finance/gratuity` | Bangladesh Labour Act 2006, section 2(10) |',
  '| `/v1/finance/emi`, `/v1/finance/dps` | Standard reducing-balance and recurring-deposit formulas |',
  '| `/v1/zakat` | Classical nisab: 7.5 vori (87.48 g) gold or 52.5 vori (612.36 g) silver; rate 2.5% |',
  '| `/v1/validate/routing/{number}` | Routing check digit (weights 5-7-1), inferred from 10,032 published routing numbers |',
  '',
];
const content = lines.join('\n');
const target = join(root, 'DATA_SOURCES.md');

if (process.argv.includes('--check')) {
  const current = await readFile(target, 'utf8').catch(() => '');
  if (current !== content) {
    console.error('✗ DATA_SOURCES.md is out of date; run `pnpm data:docs`');
    process.exit(1);
  }
  console.log('✓ DATA_SOURCES.md is up to date');
} else {
  await writeFile(target, content);
  console.log(`✓ wrote DATA_SOURCES.md (${meta.length} datasets)`);
}

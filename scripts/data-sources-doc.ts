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

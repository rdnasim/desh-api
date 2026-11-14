/** Fails if the gzip-compressed Worker bundle exceeds the budget (free plan limit is 3 MB). */
import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_BYTES = 2.5 * 1024 * 1024;

const outdir = await mkdtemp(join(tmpdir(), 'desh-api-bundle-'));
try {
  execFileSync('pnpm', ['exec', 'wrangler', 'deploy', '--dry-run', '--outdir', outdir], {
    stdio: 'pipe',
  });
  let raw = 0;
  let gzip = 0;
  for (const file of await readdir(outdir)) {
    if (!file.endsWith('.js')) continue;
    const bytes = await readFile(join(outdir, file));
    raw += bytes.length;
    gzip += gzipSync(bytes).length;
  }
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;
  console.log(`bundle: ${mb(raw)} raw, ${mb(gzip)} gzip (budget ${mb(BUDGET_BYTES)})`);
  if (gzip > BUDGET_BYTES) {
    console.error('✗ bundle exceeds budget; consider moving large datasets to KV (research R3)');
    process.exit(1);
  }
} finally {
  await rm(outdir, { recursive: true, force: true });
}

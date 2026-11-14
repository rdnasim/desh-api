import { Validator } from '@cfworker/json-schema';
import { describe, expect, it } from 'vitest';
import app from '../../src/app';
import { call } from './helpers';

// biome-ignore lint/suspicious/noExplicitAny: walks arbitrary OpenAPI JSON
type Schema = Record<string, any>;
interface Doc {
  paths: Record<string, Record<string, Schema>>;
  components: { schemas: Record<string, Schema> };
  tags?: { name: string; description?: string }[];
}

const doc = async () => (await (await call('/openapi.json')).json()) as Doc;
const refName = (s: Schema | undefined) => s?.$ref?.split('/').at(-1) as string | undefined;

describe('OpenAPI document', () => {
  it('documents exactly the registered /v1 routes', async () => {
    const registered = new Set(
      app.routes
        .filter((r) => r.path.startsWith('/v1/') && r.method !== 'ALL' && !r.path.endsWith('*'))
        .map((r) => `${r.method} ${r.path.replace(/:([^/]+)/g, '{$1}')}`),
    );
    const { paths } = await doc();
    const documented = new Set(
      Object.entries(paths).flatMap(([path, ops]) =>
        Object.keys(ops).map((m) => `${m.toUpperCase()} ${path}`),
      ),
    );
    expect([...documented].sort()).toEqual([...registered].sort());
  });

  it('gives every operation a summary and a described tag', async () => {
    const d = await doc();
    const tags = new Map((d.tags ?? []).map((t) => [t.name, t.description]));
    for (const [path, ops] of Object.entries(d.paths)) {
      for (const [method, op] of Object.entries(ops)) {
        const where = `${method} ${path}`;
        expect(op.summary, where).toBeTruthy();
        expect(op.tags, where).toHaveLength(1);
        expect(tags.get(op.tags[0]), `tag ${op.tags[0]}`).toBeTruthy();
      }
    }
  });

  it('has an example for every successful response', async () => {
    const d = await doc();
    const missing: string[] = [];
    for (const [path, ops] of Object.entries(d.paths)) {
      for (const [method, op] of Object.entries(ops)) {
        const data = op.responses?.['200']?.content?.['application/json']?.schema?.properties?.data;
        const target = data?.type === 'array' ? data.items : data;
        const name = refName(target);
        const example = target?.example ?? (name ? d.components.schemas[name]?.example : undefined);
        if (example === undefined) missing.push(`${method} ${path}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has examples that match their own schemas', async () => {
    const d = await doc();
    const failures: string[] = [];
    for (const [name, schema] of Object.entries(d.components.schemas)) {
      if (schema.example === undefined) continue;
      const root = { $ref: `#/components/schemas/${name}`, components: d.components };
      const result = new Validator(root, '2020-12', false).validate(schema.example);
      if (!result.valid) failures.push(`${name}: ${result.errors.map((e) => e.error).join('; ')}`);
    }
    expect(failures).toEqual([]);
  });
});
